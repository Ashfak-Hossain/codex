---
title: TCP
description: "The transport protocol that gives programs a reliable, ordered byte stream over an unreliable network."
tags:
  - glossary
aliases:
  - Transmission Control Protocol
date: 2026-11-23
---

**In plain words:** TCP (Transmission Control Protocol) gives two programs a reliable, ordered byte stream. It starts with a handshake, numbers every byte, resends what isn't acknowledged, and slows down when the network is busy. It's defined in RFC 9293. A full page on TCP is planned.

**Think of it like this:** Numbered boxes with signed receipts: missing boxes are sent again, and the receiver unpacks them in number order.

**Learn it properly in** [[Layers and Encapsulation]] · [[A Packet's Journey]].
