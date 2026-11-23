---
title: Sequence number
description: "The number TCP gives each byte, so the receiver can put data in order and spot gaps."
tags:
  - glossary
date: 2026-11-23
---

**In plain words:** TCP numbers every byte it sends. The sequence number in each segment says where its data belongs in the stream, so the receiver can reorder segments, drop duplicates and notice what's missing.

**Think of it like this:** The number painted on each box: "box 7 of 12".

**Learn it properly in** [[A Packet's Journey]].
