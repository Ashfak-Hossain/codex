---
title: Reading Any System
description: "STRAPS - six questions (Syntax, Time, Recovery, Address, Payload, State) that let you understand any database, broker or protocol in minutes: where to find each answer in the docs, Kafka, Postgres, Redis and a database queue worked through, gRPC and WebSocket as practice, and how the answers turn into design decisions."
tags:
  - system-design-foundations
  - system-design
  - cs
date: 2026-11-06
---

Every few months there is a new database, message broker, protocol or managed service to learn. Reading its documentation front to back takes days and still leaves you unsure how it behaves when things go wrong, which is the only time it really matters.

There's a faster way. Every system that stores or moves data has to answer the same six questions. Find those six answers first and you know how it talks, how it fails, what it costs and where your data lives. The remaining documentation becomes detail you look up when you need it.

The six questions spell **STRAPS**: strap any system down before you rely on it.

_Prereqs: [[Layers and Encapsulation]] (framing, addresses) · [[Latency Numbers]] (cost) · [[Network Failure Modes]] (the six failures a system must handle)._

---

## TL;DR

| Letter | Question                                                                              | What the answer tells you                                                              |
| ------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **S**  | **Syntax**: what language does it speak, and how does it mark where one message ends? | Which client library you need; what you'll see when debugging the wire                 |
| **T**  | **Time**: what does one operation cost?                                               | Round trips, disk writes, batching: whether your design can be fast                    |
| **R**  | **Recovery**: which failures does it handle, and which does it leave to you?          | Where you still need retries, timeouts and idempotency                                 |
| **A**  | **Address**: how does it find the other side?                                         | Hosts, ports, names, topics, queues: how to configure and debug a connection           |
| **P**  | **Payload**: what is the unit that moves?                                             | Message size limits, schemas, what one "operation" means                               |
| **S**  | **State**: where does the data live, and for how long?                                | Memory or disk, retention, replication: what survives a crash, and what needs a backup |

You don't have to ask them in this order. **Recovery** and **State** are the two that most often decide whether a system fits your problem.

---

## Where to find each answer

Documentation is organized by feature, not by these questions, so it helps to know which words to search for:

| Question     | Search the docs for                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Syntax**   | "wire protocol", "protocol specification", "framing", "serialization", "RESP", "frames"          |
| **Time**     | "round trip", "batching", "pipelining", "fsync", "latency", "benchmarks"                         |
| **Recovery** | "delivery semantics", "acks", "at-least-once", "durability", "failover", "retries", "idempotent" |
| **Address**  | "connection string", "bootstrap", "service discovery", "routing", "port"                         |
| **Payload**  | "message format", "record", "max message size", "schema"                                         |
| **State**    | "persistence", "retention", "replication", "snapshots", "storage engine", "backup"               |

---

## Worked examples

Open each one. Try to answer from what you already know first, then compare.

> [!example]- Kafka (and Redpanda)
>
> - **Syntax:** Kafka's own binary protocol over TCP (requests such as Produce, Fetch, Metadata, OffsetCommit), each message length-prefixed. Redpanda speaks the same protocol, so the same clients work.
> - **Time:** producers batch records, trading a few milliseconds of latency for very high throughput. `acks=all` waits until in-sync replicas have the write.
> - **Recovery:** _lost_: replication plus `acks=all`. _Twice_: the idempotent producer uses per-partition sequence numbers. _Gone_: a new partition leader is elected. Consumers resume from their last committed offset, so processing is **at-least-once** unless you add transactions or idempotent consumers.
> - **Address:** a bootstrap broker list → metadata → the leader broker of each topic-partition. Consumers share work through a consumer group.
> - **Payload:** a record (key, value, headers, timestamp), sent in batches.
> - **State:** on disk, as an append-only log per partition, kept until a retention time or size is reached, or forever with log compaction. Consumer offsets live in an internal topic.

> [!example]- Postgres
>
> - **Syntax:** the frontend/backend protocol: every message is a type byte, a 4-byte length, then the body. Length-prefixed framing on top of TCP's byte stream.
> - **Time:** one round trip per query (pipelining can batch them). A commit waits for the WAL to reach disk by default. Each connection is a whole server process, so connections are expensive: use a pool.
> - **Recovery:** _lost_ data is protected by the WAL and atomic transactions. _Gone_: streaming replicas and failover. But if the connection drops **during** `COMMIT`, the client can't know whether it committed; retries and idempotency are yours.
> - **Address:** `host:5432`, plus a database name and a user.
> - **Payload:** query and result messages (`Query`, `Parse`/`Bind`/`Execute`, `RowDescription`, `DataRow`).
> - **State:** on disk, in tables and the WAL, until you delete it. Replicas copy the WAL; backups are still required.

> [!example]- Redis
>
> - **Syntax:** RESP, a simple text-based protocol. `GET key` travels as `*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n`.
> - **Time:** under a millisecond of server work, but still one round trip per command. Pipelining sends many commands in one go.
> - **Recovery:** little by default. Replication is asynchronous, so a failover can lose the newest writes. **Pub/sub is fire-and-forget**: a subscriber that is offline misses those messages forever. Streams add consumer groups and acknowledgements.
> - **Address:** `host:6379`, plus a database number.
> - **Payload:** a command and its reply: strings, lists, hashes, sets, sorted sets, streams.
> - **State:** in memory. Optional persistence with RDB snapshots and/or an append-only file (AOF).

> [!example]- A database-backed queue (a `messages` table in Postgres)
>
> - **Syntax:** SQL over the Postgres protocol. A message is a row.
> - **Time:** one query claims a batch (`SELECT … FOR UPDATE SKIP LOCKED`). Latency is the polling interval, or near-zero with `LISTEN`/`NOTIFY`.
> - **Recovery:** _lost_: the row stays until marked done. _Late_ or crashed worker: a lease (`locked_until`) expires and another worker reclaims the row. _Twice_: possible, so handlers must be idempotent ([[Delivery Guarantees and Idempotency]]).
> - **Address:** a table name plus a topic column; workers find work by querying.
> - **Payload:** a row: topic, a JSONB payload, status, attempt count.
> - **State:** on disk with the rest of your data, until you delete it. Backed up with the database, which is its biggest advantage.

---

## Practice: apply it yourself

Write your six answers down before you open these.

> [!question]- gRPC
>
> - **Syntax:** HTTP/2 frames. Each Protobuf message is length-prefixed with 5 bytes (1 flag byte + 4 length bytes). Unary calls and streaming in both directions.
> - **Time:** one round trip per unary call on a warm connection; many calls share one HTTP/2 connection at once.
> - **Recovery:** deadlines propagate from caller to callee. Status codes such as `UNAVAILABLE` signal what is safe to retry; retries follow a client-side policy. No built-in deduplication, so _twice_ is still yours.
> - **Address:** `host:port`, plus a method path such as `/package.Service/Method`.
> - **Payload:** a Protobuf message: binary, typed by a `.proto` schema.
> - **State:** none between calls, apart from the state of an open stream.

> [!question]- WebSocket
>
> - **Syntax:** starts as an HTTP/1.1 request with an `Upgrade` header, then switches to WebSocket frames (opcode, length, masked payload).
> - **Time:** one extra round trip for the upgrade after TCP and TLS. After that, messages flow both ways with no per-message handshake, and the server can push.
> - **Recovery:** only what TCP provides. If the connection drops, anything in flight is lost, and the application must reconnect and resynchronise, usually with its own message IDs or sequence numbers.
> - **Address:** a `ws://` or `wss://` URL.
> - **Payload:** a frame of text or binary data.
> - **State:** in memory on both ends while connected. Each connection is pinned to one server, so scaling across many servers needs a pub/sub fan-out behind them.

---

## From answers to decisions

The point of STRAPS is to choose well. Suppose two services need to pass messages, and you're choosing between Redis pub/sub, a Postgres table and Kafka. Put the answers side by side:

| Question       | Redis pub/sub                              | Postgres table                                                                           | Kafka                                       |
| -------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Recovery**   | At-most-once; offline = missed             | At-least-once with leases                                                                | At-least-once; idempotent producer          |
| **State**      | None (memory, not stored)                  | Disk, until deleted; in your backups                                                     | Disk, until retention; replayable           |
| **Time**       | Sub-millisecond                            | One query per batch; polling or NOTIFY                                                   | Milliseconds; huge throughput with batching |
| **Fits when…** | Losing a message is fine (live UI updates) | You already run Postgres and need the event written in the same transaction as your data | Many consumers, replay, high volume         |

Three rows decided it. That's the method: you don't need to know everything about a system, only the answers to six questions, and the three or four that matter for your problem.

---

## Check yourself

> [!question]- Name the six STRAPS questions.
> Syntax (language and framing), Time (cost per operation), Recovery (which failures it handles), Address (finding the other side), Payload (the unit that moves), State (where data lives, and for how long).

> [!question]- A teammate proposes Redis pub/sub for payment events "because it's fast". Which STRAPS answers should worry you?
> Recovery and State. Pub/sub keeps nothing: a subscriber that is restarting or disconnected simply misses the event, which is unacceptable for payments.

> [!question]- Why do almost all protocols on top of TCP (Postgres, Kafka, gRPC) prefix messages with their length?
> TCP is a byte stream with no message boundaries, so each protocol must do its own framing. A length prefix tells the receiver exactly how many bytes belong to the current message.

> [!question]- Apply STRAPS to a system you use that isn't on this page (for example RabbitMQ, MQTT, NATS or S3). Which question was hardest to answer from its docs?
> There's no single answer. Usually Recovery is hardest, because documentation describes the happy path. Search for "delivery guarantees", "acks" and "durability".

---

## Recap

- Before relying on any system, answer six questions: **Syntax, Time, Recovery, Address, Payload, State**.
- **Recovery** and **State** most often decide whether a system fits.
- Docs are organized by feature; search them for the keywords of each question.
- Put candidate systems side by side by their answers, and the decision usually makes itself.

_This completes the current System Design track. Back to the [[System Design/index|System Design overview]], or revisit [[Network Failure Modes]] to see how many of these answers you can now predict._

### References

1. [Apache Kafka protocol guide](https://kafka.apache.org/protocol)
2. [PostgreSQL documentation — Frontend/Backend Protocol](https://www.postgresql.org/docs/current/protocol.html)
3. [Redis serialization protocol (RESP) specification](https://redis.io/docs/latest/develop/reference/protocol-spec/)
4. [gRPC over HTTP/2 — protocol description](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md)
5. Fette, I., Melnikov, A. _The WebSocket Protocol._ RFC 6455, IETF, December 2011.
6. Kleppmann, M. _Designing Data-Intensive Applications._ O'Reilly, 2017. Ch. 1 — Reliable, scalable and maintainable applications.
