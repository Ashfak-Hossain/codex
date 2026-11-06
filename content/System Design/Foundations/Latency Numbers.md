---
title: Latency Numbers
description: "How long things take, felt rather than memorized - cache, memory, SSD, data-centre and intercontinental round trips stretched to human time, the speed-of-light floor, why round trips beat bandwidth, tail latency, and how to measure your own numbers."
tags:
  - system-design-foundations
  - system-design
  - cs
date: 2026-11-06
---

Your API endpoint makes 40 database queries to render one page. On your laptop, with Postgres on the same machine, it takes 20 ms and feels instant. In production, the database is in another data centre and the page takes two seconds. Nothing in the code changed; only the distance did.

Engineers who design fast systems carry a rough sense of how long operations take, to within a factor of ten. That sense tells you, before you write a line of code, which designs can work and which never will. Exact numbers don't matter and change with hardware every year. The **ratios** between them have held for decades.

_Prereqs: [[A Packet's Journey]] (what a round trip is, and why a cold HTTPS request costs about four of them)._

---

## TL;DR

<div class="nbw" data-widget="latency-scale"></div>

- **Inside one machine, time is cheap.** Memory is nanoseconds, an SSD is a tenth of a millisecond.
- **Crossing a network costs round trips**, and round trips cost milliseconds: a thousand to a million times more than memory.
- **Distance has a floor set by physics.** No technology makes Dhaka to Singapore faster than about 29 ms there and back.
- **Count round trips, not bytes.** One query returning 1,000 rows beats 1,000 queries returning one row each.

---

## Stretch time until it makes sense

Nanoseconds don't mean anything to a human brain. So pretend that **one nanosecond is one second** and scale everything else by the same factor:

| Operation                                 | Real time (typical) | If 1 ns were 1 s |
| ----------------------------------------- | ------------------- | ---------------- |
| CPU L1 cache read                         | ~1 ns               | 1 second         |
| Main memory (RAM) read                    | ~100 ns             | 1.7 minutes      |
| SSD random read                           | ~100 µs             | 1.2 days         |
| Round trip within one data centre         | ~0.5 ms             | 5.8 days         |
| Round trip Dhaka → Singapore              | ~60 ms              | 1.9 years        |
| Cold HTTPS request to Singapore (≈ 4 RTT) | ~240 ms             | 7.6 years        |
| Round trip Dhaka → US west coast          | ~250 ms             | 7.9 years        |

Read it as a story. Your CPU fetches a value from cache in a heartbeat, waits a couple of minutes for RAM, takes a long weekend for the SSD, a week for another server in the same building, and **two years** for a server in Singapore. Every design decision about caching, batching and where to put servers follows from that story.

These are orders of magnitude, not benchmarks. Modern NVMe drives can be faster than 100 µs, and your real round-trip times depend on your ISP's routes. Measure your own (see below), but the ratios will look the same.

---

## Three lessons that follow

### 1. Round trips dominate, so count them

Back to the 40 queries. In production each query is a network round trip to the database:

```text
same machine:       40 queries × ~0.05 ms  ≈   2 ms      (plus query work)
same data centre:   40 queries × ~0.5 ms   ≈  20 ms
another region:     40 queries × ~50 ms    ≈   2 seconds
```

The fix is never "a faster database". It's **fewer round trips**: one query with a `JOIN` or `WHERE id IN (...)`, batching, or putting the app next to the database. The classic version of this bug is the **N+1 query problem** in ORMs: one query for a list, then one more query per item.

The same lesson explains connection pools (they skip the TCP, TLS and authentication round trips of a new connection), HTTP keep-alive, Redis pipelining and Kafka producer batching. They all trade a little memory for fewer round trips.

### 2. Physics sets a floor

Light in optical fibre travels at about 200,000 km/s, two-thirds of its speed in a vacuum. That's **200 km per millisecond**, so a round trip costs at least **1 ms per 100 km** of distance:

| Path                  | Straight-line distance | Physics floor (RTT) | Typical real RTT |
| --------------------- | ---------------------- | ------------------- | ---------------- |
| Dhaka → Singapore     | ~2,900 km              | ~29 ms              | ~50–70 ms        |
| Dhaka → San Francisco | ~12,400 km             | ~124 ms             | ~230–280 ms      |

Real cables don't follow straight lines, and every router adds a little delay, so real round trips are roughly double the floor. No amount of engineering beats the floor. The only way to go faster is to **move closer**: that's what CDNs, edge servers and regional replicas are for.

### 3. Bandwidth is not latency

**Bandwidth** is how wide the pipe is: how many bytes per second it can carry. **Latency** is how long the pipe is: how long one byte takes to reach the other end. Upgrading from 50 Mbps to 500 Mbps makes a large download faster, but does nothing for a small API call to Singapore, because that call is almost all waiting.

| Transfer         | Time to send at 500 Mbps | Plus latency to Singapore | What dominates  |
| ---------------- | ------------------------ | ------------------------- | --------------- |
| 2 KB API request | ≈ 0.03 ms                | 60 ms                     | latency, ~100%  |
| 500 MB download  | ≈ 8 s                    | 60 ms                     | bandwidth, ~99% |

Most backend traffic is small requests. For them, **latency is the bottleneck**.

---

## The average lies: tail latency

A service that answers in 10 ms on average might take 200 ms for 1 request in 100. That slow 1% is the **p99** latency (99th percentile), and it matters more than the average for two reasons:

- **Users notice the slow ones**, and an active user makes hundreds of requests a day, so they hit the tail often.
- **Fan-out multiplies it.** If one page calls 100 backend services in parallel and must wait for all of them, the chance that at least one of them is in its slow 1% is $1 - 0.99^{100} \approx 63\%$. Most page loads then run at the speed of the slowest service.

So always ask for **p50, p95 and p99**, never just the average. Dean and Barroso's _The Tail at Scale_ is the classic paper on this.

---

## Measure your own numbers

```bash
ping -c 10 1.1.1.1                         # round trip to a nearby anycast server
mtr ashfak.dev                             # round trip to every hop on the path

curl -o /dev/null -s -w 'dns %{time_namelookup}  tcp %{time_connect}  tls %{time_appconnect}  ttfb %{time_starttransfer}\n' https://ashfak.dev
```

Inside Postgres, `\timing on` in `psql` shows how long each query takes from the client's side, and `EXPLAIN ANALYZE` shows how much of that was the server's own work. The difference is the network.

---

## Check yourself

> [!question]- If 1 ns were 1 second, roughly how long would a round trip from Dhaka to Singapore take? A RAM read?
> About 2 years for the round trip; under 2 minutes for a RAM read.

> [!question]- An endpoint makes 30 sequential queries to a database 50 ms away. What is its minimum response time, and what is the fix?
> At least 30 × 50 ms = 1.5 seconds, before any query work. Fix it by cutting round trips: combine queries (JOIN, `IN (...)`, batching) or move the app next to the database.

> [!question]- Your ISP upgrades you from 50 Mbps to 1 Gbps. Does your API call to a server in the US get noticeably faster?
> No. A small request is dominated by latency (about 250 ms of round trip), which bandwidth doesn't change.

> [!question]- What is the physics floor for a round trip over 3,000 km of fibre?
> About 30 ms: light in fibre covers roughly 200 km per millisecond, so 6,000 km there and back takes about 30 ms.

> [!question]- A service's average latency is 12 ms but its p99 is 400 ms. A page calls it 50 times in parallel. What does the user mostly experience?
> The slow tail. The chance that at least one of 50 calls is in the slowest 1% is $1 - 0.99^{50} \approx 40\%$, so many page loads wait about 400 ms.

---

## Recap

- Memory is nanoseconds, SSDs are around 100 µs, and **network round trips are milliseconds**: a thousand to a million times slower.
- Light in fibre needs about **1 ms per 100 km** of round-trip distance. Only moving closer beats that.
- Design by **counting round trips**: batching, pooling, pipelining and caching all exist to reduce them.
- **Bandwidth** is the pipe's width; **latency** is its length. Small requests are bound by latency.
- Judge services by **p99**, not the average, especially when one request fans out to many.

_Next: [[Network Failure Modes]]: the network isn't only slow. It also loses, duplicates and reorders what you send._

### References

1. Dean, J. _Designs, Lessons and Advice from Building Large Distributed Systems._ Keynote, LADIS 2009. — The original "numbers everyone should know" slide.
2. Norvig, P. [_Teach Yourself Programming in Ten Years_](https://norvig.com/21-days.html) — includes the well-known table of approximate timings.
3. Gregg, B. _Systems Performance: Enterprise and the Cloud._ 2nd ed., Addison-Wesley, 2020. §2.3 — Latencies scaled to human time.
4. Dean, J., Barroso, L. A. _The Tail at Scale._ Communications of the ACM 56(2), 2013, pp. 74–80.
5. [Colin Scott — Latency Numbers Every Programmer Should Know (interactive, by year)](https://colin-scott.github.io/personal_website/research/interactive_latency.html)
6. Grigorik, I. [_High Performance Browser Networking_](https://hpbn.co/), O'Reilly, 2013. Ch. 1 — Latency and bandwidth.
