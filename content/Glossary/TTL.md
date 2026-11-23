---
title: TTL
description: "A countdown that limits how long something lives: router hops for an IP packet, seconds for a cached DNS answer."
tags:
  - glossary
aliases:
  - time to live
date: 2026-11-23
---

**In plain words:** TTL means time to live. In an IP packet it's a hop counter: each router subtracts one, and at zero the packet is dropped, so it can't loop forever. In DNS it's how many seconds an answer may be cached before asking again.

**Think of it like this:** A box stamped "discard after 64 post offices", or a note stuck to an address book entry saying "recheck after one hour".

**Learn it properly in** [[A Packet's Journey]] · [[Connectivity Debug Ladder]].
