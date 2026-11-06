---
title: Network Failure Modes
description: "The six ways a network betrays you - lost, late, twice, out of order, gone and exposed - the defence for each, the chain reaction that forces every reliable system into at-least-once delivery, a hands-on TCP simulator to break, and the same ideas repeated in HTTP, Postgres, Kafka and a database queue."
tags:
  - reliability
  - system-design
  - cs
date: 2026-11-06
---

Server A sends a message to server B. What can happen? The obvious answer is "it arrives". The honest answer is: it arrives; or it never arrives; or it arrives so late that A has given up; or it arrives twice; or it arrives after a message that was sent later; or B is down and nothing is there to receive it; or someone on the way reads it or changes it. And A, on its own, often **cannot tell which of these happened**.

This page names those failures. Once you know them, every reliability feature you meet, from TCP's retransmissions to Kafka's idempotent producer to an `Idempotency-Key` header, stops being a feature to memorize and becomes an answer to a question you already know.

_Prereqs: [[A Packet's Journey]] (what TCP, ACKs and sequence numbers are) · [[Latency Numbers]] (why waiting is expensive)._

---

## TL;DR

| #   | Failure          | What happens                                          | Defence                                        |
| --- | ---------------- | ----------------------------------------------------- | ---------------------------------------------- |
| 1   | **Lost**         | The message never arrives                             | Acknowledge and retry; keep a copy until acked |
| 2   | **Late**         | It arrives, but too slowly to tell apart from lost    | Timeouts and deadlines                         |
| 3   | **Twice**        | It arrives more than once, usually because of a retry | Unique IDs and idempotency                     |
| 4   | **Out of order** | A later message overtakes an earlier one              | Sequence numbers and a reorder buffer          |
| 5   | **Gone**         | The receiver is down, restarting or overloaded        | Buffer (queue), replicate, fail over           |
| 6   | **Exposed**      | Someone reads, changes or impersonates                | Encrypt, sign, verify identity (TLS, HMAC)     |

The one idea to keep: **retries fix _lost_ but create _twice_; timeouts fix _late_ but can't tell it from _lost_.** So every reliable system ends up at the same place: **at-least-once delivery plus idempotent processing**.

---

## The six failures

### 1. Lost

A cable glitch, a full router buffer, a Wi-Fi drop, a crashed process: the message is simply gone. The network makes **no promise** of delivery. IP is explicitly "best effort".

**Defence: acknowledge and retry.** The sender keeps a copy and waits for "got it". No acknowledgement within some time, send it again. This is what TCP does for every segment.

### 2. Late

The message is queued behind other traffic, or the receiver is paused (a garbage-collection pause, an overloaded CPU). It arrives eventually, after 5 seconds instead of 5 milliseconds.

**Defence: timeouts.** Decide in advance how long you'll wait. But here is the uncomfortable part: when a timeout fires, you **don't know** what happened. The request might have been lost, or it might be sitting in a queue, or it might have been processed and only the reply was lost.

### 3. Twice

The usual cause is the defence for failure 1. A request is processed, the reply is lost, the sender times out and retries, and the receiver processes it **again**. Message brokers redeliver too, when a consumer crashes before acknowledging.

**Defence: unique IDs and idempotency.** Give every message an identity, and make processing it a second time change nothing. This one is so important it has its own page: [[Delivery Guarantees and Idempotency]].

### 4. Out of order

Packets in one stream can take different paths or sit in different queues. Message 4 overtakes message 3. With several consumers in parallel, events for the same order can be processed in the wrong order: "shipped" before "paid".

**Defence: sequence numbers.** Number everything. The receiver holds early arrivals in a buffer until the gap is filled, or rejects anything older than what it has already applied.

### 5. Gone

The receiver isn't there: deploying, crashed, out of memory, or so overloaded it can't accept work. From the sender's side, this often looks identical to _lost_ or _late_.

**Defence: buffer, copy, switch.** Put a queue between them so messages wait (a broker, or a table in your database). Keep copies on several machines (replication). Move traffic to a healthy copy (failover). And stop hammering a struggling service: a **circuit breaker** fails fast instead of piling on more retries.

### 6. Exposed

Every machine on the path can read unencrypted traffic, and a malicious one can change it or pretend to be the server.

**Defence: encrypt and verify.** TLS encrypts traffic and proves the server's identity with a certificate. Webhooks are signed with an HMAC so the receiver can check who sent them and that nothing changed.

---

## The chain reaction

The defences interact, and that interaction explains most of distributed systems:

```text
fear LOST ─▶ add retries ─▶ retries cause TWICE ─▶ make receivers IDEMPOTENT
    │
    └─▶ when to retry? add TIMEOUTS
          └─▶ a timeout can't tell LOST from LATE
                └─▶ so you retry anyway ─▶ TWICE again
```

The deepest reason is that **the sender can never be certain**. This is the **Two Generals' Problem**: two parties communicating over an unreliable channel can't both be sure they agree, because the last message confirming the agreement could always be the one that was lost. No protocol fixes this. All you can do is make uncertainty harmless.

The practical result is a short list of guarantees you can actually build:

| Guarantee          | How                                          | Risk                       |
| ------------------ | -------------------------------------------- | -------------------------- |
| **At-most-once**   | Send once, never retry                       | Messages can be lost       |
| **At-least-once**  | Retry until acknowledged                     | Messages can be duplicated |
| **"Exactly-once"** | At-least-once **plus** idempotent processing | Correct, but you build it  |

---

## Break TCP with your own hands

TCP solves _lost_, _twice_ and _out of order_ for the bytes in one connection. Below is a tiny TCP: six numbered segments travel right, acknowledgements travel left. **Click any packet in flight to destroy it.**

<div class="nbw" data-widget="tcp-sim"></div>

Try three experiments:

1. **Destroy a data segment.** The sender gets no ACK, its timeout fires, it retransmits. _Lost → retry._
2. **Destroy an ACK instead.** The segment had arrived, but the sender doesn't know, so it retransmits anyway. The receiver gets the same sequence number twice and throws the copy away. _Twice → idempotency, via sequence numbers._
3. **Turn on the chaotic network.** Segments overtake each other and wait in the reorder buffer until the gap fills. _Out of order → sequence numbers._

In every case the application on the right receives `1 2 3 4 5 6`, in order, each exactly once.

---

## What TCP does not save you from

It's tempting to think "I use TCP, so my messages are reliable". They aren't, and the reason is important.

TCP's ACK means **"the receiving operating system has the bytes"**. It does not mean the application read them, processed them, or wrote the result to disk. If the receiving process crashes a millisecond after the kernel acknowledged your bytes, the data is gone, and the sender believes it was delivered. If the connection breaks mid-request, the client can't tell whether the server processed it.

This is the **end-to-end argument** (Saltzer, Reed and Clark, 1984): a guarantee that matters to the application can only be fully provided by the application itself, at the two ends. Lower layers can make failures rarer; they can't make them impossible. So your API, your consumer and your webhook handler still need their own acknowledgements, retries and idempotency, even on top of TCP.

---

## Same idea, every level

The names change from system to system. The ideas don't. Each row is one failure; each column is a system you use.

| Failure          | TCP                                   | HTTP / your API                        | Postgres                                       | Kafka                                                 | DB-backed queue                 |
| ---------------- | ------------------------------------- | -------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- | ------------------------------- |
| **Lost**         | Retransmit when no ACK                | Client retries                         | `COMMIT` returns only after the WAL is on disk | Producer retries; `acks=all`                          | Row stays until marked done     |
| **Late**         | Retransmission timeout (RTO)          | Request timeout, deadline              | `statement_timeout`                            | `request.timeout.ms`; consumer lag alerts             | `locked_until` lease            |
| **Twice**        | Sequence numbers drop duplicates      | `Idempotency-Key` header               | `UNIQUE` + `ON CONFLICT DO NOTHING`            | Idempotent producer (per-partition sequence numbers)  | Processed-IDs table             |
| **Out of order** | Reorder buffer                        | Version numbers, `ETag` + `If-Match`   | Transactions, row locks                        | Ordered within a partition; same key → same partition | `ORDER BY` + one worker per key |
| **Gone**         | Reset; the app must reconnect         | Circuit breaker; `503` + `Retry-After` | Streaming replica, failover                    | Leader election among in-sync replicas                | Messages wait in the table      |
| **Exposed**      | — (TLS sits on top)                   | HTTPS; HMAC-signed webhooks            | `sslmode=verify-full`, roles                   | TLS, SASL, ACLs                                       | Database permissions            |
| **Too fast**     | Flow and congestion control (windows) | `429 Too Many Requests`, rate limits   | `max_connections`, a pooler's queue            | Consumers pull at their own pace; lag grows           | `LIMIT n` per claim             |

Look down the **Twice** row. TCP's sequence number, Kafka's producer sequence number, an `Idempotency-Key` and a `UNIQUE` constraint are the same invention: give every message an identity so a repeat can be recognised.

The last row, _too fast_, isn't a betrayal by the network but a universal problem anyway: a fast sender can overwhelm a slow receiver. The defence is **backpressure**: the receiver controls the pace.

---

## Check yourself

> [!question]- Your service calls a payment API and times out after 5 seconds. Was the payment made?
> You can't know. The request might have been lost, still be queued, or have succeeded with only the reply lost. That uncertainty is why payment APIs accept an idempotency key, so a retry is safe.

> [!question]- In the simulator, you destroy ACK 3. Exactly what happens next, and why doesn't the app see a duplicate?
> The sender's timeout for #3 fires and it retransmits #3. The receiver already has #3 (it checks the sequence number), throws the copy away and sends ACK 3 again. The app only ever receives one #3.

> [!question]- TCP guarantees reliable delivery. Why can a message still be lost between your API and your database worker?
> TCP's ACK only means the receiving kernel has the bytes. If the application crashes before processing or persisting them, they are lost, and the sender believes they were delivered. Guarantees that matter to the application must be end to end.

> [!question]- Name the same "Twice" defence in TCP, Kafka and Postgres.
> TCP: sequence numbers. Kafka: the idempotent producer's per-partition sequence numbers (and consumer-side dedup). Postgres: a `UNIQUE` constraint with `ON CONFLICT DO NOTHING`.

> [!question]- Why does adding retries without idempotency make a system less correct, not more?
> Retries turn lost messages into duplicated ones. Without idempotency, every duplicate repeats its side effect: a second charge, a second email, a second booking.

---

## Recap

- The network can **lose**, **delay**, **duplicate**, **reorder** or fail to **deliver at all**, and attackers can **read or change** traffic.
- Each failure has a standard defence: ack and retry, timeouts, IDs and idempotency, sequence numbers, buffering and replication, encryption.
- The defences cause each other's problems, so reliable systems end up with **at-least-once delivery plus idempotency**.
- **TCP is not end to end**: its reliability stops at the receiving kernel, so applications need their own guarantees.
- The same handful of ideas appears in every system you use, under different names.

_Next: [[Delivery Guarantees and Idempotency]]: how to actually build "exactly once" out of at-least-once delivery, with idempotency keys, unique constraints and the outbox pattern._

### References

1. Rotem-Gal-Oz, A. _Fallacies of Distributed Computing Explained._ 2006. — On Peter Deutsch's eight fallacies ("the network is reliable", "latency is zero", ...).
2. Saltzer, J. H., Reed, D. P., Clark, D. D. _End-to-End Arguments in System Design._ ACM Transactions on Computer Systems 2(4), 1984, pp. 277–288.
3. Gray, J. _Notes on Data Base Operating Systems._ In _Operating Systems: An Advanced Course_, Springer, 1978. — An early statement of the Two Generals' Problem.
4. Kleppmann, M. _Designing Data-Intensive Applications._ O'Reilly, 2017. Ch. 8 — The Trouble with Distributed Systems.
5. Eddy, W. (ed.). _Transmission Control Protocol (TCP)._ RFC 9293, IETF, August 2022.
6. Paxson, V., Allman, M., Chu, J., Sargent, M. _Computing TCP's Retransmission Timer._ RFC 6298, IETF, June 2011.
7. Kurose, J. F., Ross, K. W. _Computer Networking: A Top-Down Approach._ 8th ed., Pearson, 2021. §3.4 — Principles of reliable data transfer.
