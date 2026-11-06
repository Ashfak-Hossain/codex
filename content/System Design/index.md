---
title: System Design
description: "Designing systems that stay fast and correct when the network isn't - a feel for latency, the ways networks fail, delivery guarantees and idempotency, and a six-question method for understanding any new system."
---

# System Design

Notes on designing backend systems that stay fast and correct in a world where the network is slow, unreliable and occasionally hostile. Read the [[Networking/index|Networking]] foundations first; this track assumes you know what a round trip, TCP and TLS are.

```text
1  Latency Numbers                        how slow is it?
2  Network Failure Modes                  how does it fail?
3  Delivery Guarantees and Idempotency    how to stay correct anyway
4  Reading Any System                     apply it to anything new
```

## 1 · Foundations

The intuitions every design decision rests on.

1. [[Latency Numbers]] — how long things take, stretched to human time; the speed-of-light floor; round trips versus bandwidth; tail latency. _Interactive._

## 2 · Reliability

Staying correct when messages are lost, delayed, duplicated or reordered.

2. [[Network Failure Modes]] — the six ways a network betrays you, the chain reaction that forces at-least-once delivery, and a TCP simulator to break. _Interactive._
3. [[Delivery Guarantees and Idempotency]] — at-most-once, at-least-once and exactly-once effects; idempotency keys, unique constraints, inbox and outbox tables.

## 3 · Method

4. [[Reading Any System]] — STRAPS: six questions that let you understand any database, broker or protocol in minutes.

---

_Coming later: data structure design, caching, and consistency and replication._
