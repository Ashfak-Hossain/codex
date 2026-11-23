---
title: Subnet mask
description: "Says which part of an IP address names the network and which part names the machine."
tags:
  - glossary
aliases:
  - netmask
  - prefix length
date: 2026-11-23
---

**In plain words:** A subnet mask marks which bits of an IP address are the network part. `255.255.255.0`, also written `/24`, means the first 24 bits name the network. Machines in the same network talk directly; everything else goes through the default gateway.

**Think of it like this:** Knowing that everyone on "Lake Road" is a neighbour you can walk to, while any other street means a trip to the post office.

**Learn it properly in** [[DHCP]] · [[A Packet's Journey]].
