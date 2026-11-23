---
title: Lease
description: "The time-limited loan of an IP address that a DHCP server gives a machine."
tags:
  - glossary
aliases:
  - DHCP lease
date: 2026-11-23
---

**In plain words:** A lease is DHCP's loan of an IP address for a limited time. By default the client tries to renew at half the lease time (T1) and asks any server at seven-eighths (T2), as RFC 2131 §4.4.5 describes. If it doesn't renew, the address goes back to the pool.

**Think of it like this:** Renting a post-office box for a month: renew it in time and it stays yours; forget, and it goes to someone else.

**Learn it properly in** [[DHCP]] · [[Connectivity Debug Ladder]].
