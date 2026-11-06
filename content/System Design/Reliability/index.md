---
title: Reliability
description: Staying correct over an unreliable network - the six failure modes, delivery guarantees, and idempotency in practice.
---

# Reliability

The network can lose, delay, duplicate and reorder anything you send. These pages explain why, and how real systems stay correct anyway.

1. [[Network Failure Modes]] — lost, late, twice, out of order, gone, exposed; the defence for each, and a hands-on TCP simulator.
2. [[Delivery Guarantees and Idempotency]] — when you acknowledge decides the guarantee; building exactly-once effects from at-least-once delivery.

_Builds on [[Latency Numbers]] and [[A Packet's Journey]]. Then continue with [[Reading Any System]]._
