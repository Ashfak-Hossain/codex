---
title: ARP cache
description: "A machine's short-term memory of which MAC address belongs to which IP address on its network."
tags:
  - glossary
aliases:
  - neighbour table
date: 2026-11-23
---

**In plain words:** The ARP cache stores recent IP-to-MAC answers so a machine doesn't ask for every frame. Entries expire after a while. You can see it with `ip neigh` on Linux or `arp -a` on macOS.

**Think of it like this:** A sticky note by the door listing your neighbours' names and house numbers, which you redo every so often.

**Learn it properly in** [[ARP]].
