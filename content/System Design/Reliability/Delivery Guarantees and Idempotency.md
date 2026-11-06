---
title: Delivery Guarantees and Idempotency
description: "At-most-once, at-least-once and 'exactly-once' explained by when you acknowledge, why exactly-once delivery is impossible but exactly-once effects are not, and the tools that get you there - idempotency keys, unique constraints, inbox tables and the transactional outbox - worked through a payment webhook that must never book a ticket twice."
tags:
  - reliability
  - system-design
  - cs
date: 2026-11-06
---

A customer pays for a concert ticket. The payment gateway calls your webhook: "transaction `TRX9A7K` succeeded for booking 42". Your server marks the booking paid and issues a ticket. Then the gateway's request times out on its side, because your reply was slow, so it sends the same webhook again. If your handler simply runs twice, the customer gets two tickets, or worse, is charged twice in some other flow.

The gateway is behaving correctly. It can't know whether you processed the first call (that's the [[Network Failure Modes|Two Generals' Problem]]), so it retries until you confirm. Correctness is your job, and it has a name: **idempotency**.

_Prereqs: [[Network Failure Modes]] (lost, late, twice, and why retries create duplicates)._

---

## TL;DR

| Guarantee               | When the receiver acknowledges                    | What can go wrong       | Use it for                                     |
| ----------------------- | ------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| **At-most-once**        | Before processing                                 | Messages lost           | Metrics, logs, anything you can afford to drop |
| **At-least-once**       | After processing                                  | Messages duplicated     | The default for anything that matters          |
| **Exactly-once effect** | After processing, **and** duplicates are detected | Nothing, if built right | Payments, bookings, inventory                  |

- **Exactly-once _delivery_ over a network is impossible.** Exactly-once _effect_ is possible: deliver at least once, and make the second delivery do nothing.
- An operation is **idempotent** if doing it twice has the same effect as doing it once.
- The tools: **natural unique keys**, **idempotency keys**, **processed-message (inbox) tables** and the **transactional outbox**.
- Detect duplicates with a **database constraint**, never with "check, then insert".

---

## It all depends on when you acknowledge

A consumer receives a message, processes it, and acknowledges it (commits a Kafka offset, acks a RabbitMQ message, returns `200` to a webhook). The order of those two steps decides the guarantee:

```text
AT-MOST-ONCE                         AT-LEAST-ONCE
receive → ACK → process              receive → process → ACK
             ✕ crash here                       ✕ crash here
acked, never processed               processed, never acked
→ the message is LOST                → it is REDELIVERED (twice)
```

There's no third ordering. A crash can always land between the two steps, so you choose which failure you prefer. For anything that matters you choose at-least-once, accept that duplicates **will** happen, and make them harmless.

### Why "exactly-once delivery" is impossible

To deliver exactly once, the sender must know whether the first attempt arrived. It can only learn that from a reply, and the reply can be lost too. However many confirmations you add, the last one can always be the one that's lost. What systems advertise as "exactly-once" (Kafka transactions, for example) is really **exactly-once _processing_**: duplicates still happen underneath, but they're detected and discarded, or the effect and the acknowledgement are committed together in one atomic step.

---

## What makes an operation idempotent

$$
f(f(x)) = f(x)
$$

Doing it again changes nothing. Some operations have this naturally; others don't:

| Idempotent                                                                            | Not idempotent                                |
| ------------------------------------------------------------------------------------- | --------------------------------------------- |
| `UPDATE bookings SET status = 'paid' WHERE id = 42`                                   | `UPDATE accounts SET balance = balance + 500` |
| `PUT /users/42` with the full new state                                               | `POST /payments`                              |
| `DELETE /sessions/abc` (the effect is the same; the response may be `204` then `404`) | Sending an email or SMS                       |
| `SET key value` in Redis                                                              | `INCR key` in Redis                           |
| Inserting a row with a natural primary key                                            | Inserting a row with an auto-generated ID     |

HTTP builds this into its method semantics: `GET`, `HEAD`, `PUT` and `DELETE` are defined as idempotent, which is why clients and proxies may retry them automatically. `POST` is not, so retrying a `POST` safely needs extra help, which is exactly what idempotency keys provide.

A useful trick: turn "add" into "set". `balance = balance + 500` repeated is a bug; recording **"payment `TRX9A7K` credited 500"** as a row with a unique key, and deriving the balance from those rows, is idempotent.

---

## Tool 1: a natural unique key

Many events already carry a unique identity: a payment gateway's transaction ID, an order number, a Kafka message's topic, partition and offset. Make that identity a **primary key or unique constraint**, and the database rejects the duplicate for you.

The webhook from the opening:

```sql
CREATE TABLE payments (
  trx_id      text PRIMARY KEY,               -- the gateway's transaction ID
  booking_id  uuid NOT NULL REFERENCES bookings (id),
  amount      numeric(12, 2) NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
```

```ts
// POST /webhooks/payment
async function handlePaymentWebhook(req: Request): Promise<Response> {
  const evt = verifySignature(req) // reject anything not signed by the gateway (HMAC): failure 6, exposed
  await db.transaction(async (tx) => {
    const { rowCount } = await tx.query(
      `INSERT INTO payments (trx_id, booking_id, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (trx_id) DO NOTHING`,
      [evt.trxId, evt.bookingId, evt.amount],
    )
    if (rowCount === 0) return // seen before: the first delivery already did the work

    await tx.query(`UPDATE bookings SET status = 'paid' WHERE id = $1 AND status = 'pending'`, [
      evt.bookingId,
    ])
    await tx.query(`INSERT INTO outbox (topic, payload) VALUES ('ticket.issue', $1)`, [
      { bookingId: evt.bookingId },
    ])
  })
  return new Response(null, { status: 200 }) // 200 for duplicates too, so the gateway stops retrying
}
```

Three details carry the whole design:

- **The duplicate check and the effect are in one transaction.** Either both happen or neither does. A crash halfway leaves nothing behind, and the retry starts clean.
- **The constraint does the check, not a `SELECT`.** "Check if it exists, then insert" has a race: two deliveries arriving together both see "not there" and both insert. A unique index makes the second insert wait for the first transaction and then do nothing. Postgres resolves the race for you.
- **A duplicate still gets `200`.** Returning an error would make the gateway retry forever. From the gateway's point of view, a duplicate was handled successfully.

(Payment gateways name the ID differently; bKash, for example, returns a `trxID`. The pattern is the same for any of them.)

---

## Tool 2: an idempotency key

When the request has no natural ID, the **client** creates one: a random UUID generated **once per user action** (when the user presses "Pay"), and sent with every retry of that action in an `Idempotency-Key` header. Stripe popularised this pattern, and it is being standardised at the IETF.

```sql
CREATE TABLE idempotency_keys (
  key          text PRIMARY KEY,
  request_hash text NOT NULL,          -- fingerprint of the request body
  status_code  int  NOT NULL,
  response     jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

The server's logic for every request carrying a key:

```text
1. Look up the key.
   ├─ found, same request_hash   → return the STORED response. Do nothing else.
   ├─ found, different hash      → 422: key reused for a different request.
   └─ not found                  → continue.
2. In ONE transaction: do the work, and insert (key, hash, status, response).
3. Return the response.
```

Rules that make it work:

- **One key per user action, reused across retries.** A new key per attempt defeats the purpose.
- **Store the response, not just the key**, so a retry receives the same answer as the original.
- **Expire keys eventually.** Stripe keeps them for at least 24 hours; after that a "retry" is treated as a new request.
- **Beware side effects outside the database.** If step 2 calls another API or sends an email, a crash after that call but before the commit repeats it on retry. Put those effects in the outbox (tool 4) or make that call idempotent too.

---

## Tool 3: an inbox table for consumers

A queue consumer gets at-least-once delivery from Kafka, RabbitMQ, SQS or a database-backed queue. Record each processed message ID **in the same transaction as the effect**:

```sql
CREATE TABLE processed_messages (
  message_id   text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

BEGIN;
INSERT INTO processed_messages (message_id) VALUES ($1) ON CONFLICT DO NOTHING;
-- if that inserted 0 rows: ROLLBACK and acknowledge the message. It's a duplicate.
-- otherwise: apply the effect here, then:
COMMIT;
-- and only now acknowledge the message to the broker.
```

A crash before `COMMIT` leaves no trace, and the redelivery is processed normally. A crash after `COMMIT` but before the acknowledgement causes a redelivery that hits the conflict and is skipped. Either way, the effect happens once.

---

## Tool 4: the transactional outbox

The mirror-image problem appears on the **producer** side. Your handler must update the database _and_ publish an event ("ticket issued"). Two separate writes to two systems can't be atomic:

```text
write DB ✓ → publish ✕ crash   = state changed, nobody told
publish ✓  → write DB ✕ crash  = event announced, change never happened
```

This is the **dual-write problem**. The fix: don't publish directly. Insert the event into an `outbox` table **in the same transaction** as the state change (as the webhook above does). A separate relay process reads the outbox and publishes each row, marking it sent afterwards.

The relay itself is at-least-once (it can crash after publishing and before marking), so consumers of those events must be idempotent too. The chain closes: at-least-once everywhere, idempotent everywhere, and the effects happen exactly once.

---

## What your tools already give you

| Tool                | What it promises                                                                                                                                                    | What you still own                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **TCP**             | No duplicate or reordered bytes _within one connection_                                                                                                             | Everything across reconnects and retries                           |
| **HTTP**            | `PUT`, `DELETE`, `GET` are idempotent by definition                                                                                                                 | Making `POST` safe (idempotency keys)                              |
| **Kafka**           | Idempotent producer (on by default since Kafka 3.0) removes duplicates caused by producer retries; transactions give exactly-once read-process-write _inside Kafka_ | Side effects outside Kafka: databases, emails, APIs                |
| **RabbitMQ**        | At-least-once with acks; a `redelivered` flag hints at a possible duplicate                                                                                         | Real deduplication                                                 |
| **Amazon SQS FIFO** | Deduplicates messages with the same deduplication ID within a 5-minute window                                                                                       | Duplicates outside the window, and your own side effects           |
| **Postgres**        | Atomic transactions and unique constraints                                                                                                                          | Putting the dedup check and the effect in the **same** transaction |

---

## Check yourself

> [!question]- A consumer commits its Kafka offset, then processes the message, then crashes during processing. What happened to the message?
> It was lost. Committing before processing is at-most-once: after the restart, the consumer resumes after that offset and never sees the message again.

> [!question]- Why is "SELECT to check if the payment exists, then INSERT if not" unsafe, and what replaces it?
> Two concurrent deliveries can both run the SELECT, both see nothing, and both insert. A unique constraint with `INSERT ... ON CONFLICT DO NOTHING` makes the database serialise them, so only one insert succeeds.

> [!question]- Your webhook handler detects a duplicate. Should it return 200 or an error? Why? 200. The sender retries until it gets success; an error would make it retry forever. A duplicate was handled correctly, so success is the true answer.

> [!question]- A mobile app generates a new idempotency key every time it retries a failed payment request. What goes wrong?
> Each retry looks like a brand-new request, so the server can't detect duplicates and may charge twice. The key must be generated once per user action and reused for every retry of that action.

> [!question]- Make this idempotent: a handler that runs `UPDATE wallets SET balance = balance + $amount` for each top-up event.
> Record each top-up as a row keyed by its event or transaction ID (unique), inserted with `ON CONFLICT DO NOTHING` in the same transaction as the balance update, and only update the balance when the insert succeeded. Or derive the balance as the sum of the recorded top-ups.

> [!question]- Why must consumers of outbox events be idempotent, even though the outbox write was transactional?
> The relay that publishes outbox rows is itself at-least-once: it can publish a row and crash before marking it sent, then publish it again after restarting.

---

## Recap

- When you acknowledge decides the guarantee: **before** processing is at-most-once, **after** is at-least-once.
- Exactly-once _delivery_ is impossible. Exactly-once _effect_ = at-least-once delivery + idempotent processing.
- Use a **natural unique key** when one exists, an **idempotency key** when the client must create one, an **inbox table** for consumers and an **outbox table** for producers.
- Always put the duplicate check and the effect **in one transaction**, enforced by a **unique constraint**.

_Next: [[Reading Any System]]: six questions that let you read any new technology, including what it guarantees and what it leaves to you._

### References

1. Fielding, R., Nottingham, M., Reschke, J. (eds.). _HTTP Semantics._ RFC 9110, IETF, June 2022. §9.2.2 — Idempotent methods.
2. Jena, J., Dalal, S. _The Idempotency-Key HTTP Header Field._ IETF Internet-Draft, draft-ietf-httpapi-idempotency-key-header (work in progress).
3. [Stripe API reference — Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
4. Leach, B. [_Implementing Stripe-like Idempotency Keys in Postgres._](https://brandur.org/idempotency-keys) 2017. — A full design, including external API calls.
5. [Apache Kafka documentation — Message delivery semantics](https://kafka.apache.org/documentation/#semantics) and [KIP-98: Exactly Once Delivery and Transactional Messaging](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)
6. Richardson, C. [_Pattern: Transactional outbox._](https://microservices.io/patterns/data/transactional-outbox.html) microservices.io.
7. [Amazon SQS — Exactly-once processing in FIFO queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-exactly-once-processing.html)
8. Kleppmann, M. _Designing Data-Intensive Applications._ O'Reilly, 2017. Ch. 11 — Fault tolerance and idempotence in stream processing.
