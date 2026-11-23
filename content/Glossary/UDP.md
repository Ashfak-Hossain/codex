---
title: UDP
description: "A lightweight transport protocol that sends separate messages with no handshake and no delivery promise."
tags:
  - glossary
aliases:
  - User Datagram Protocol
date: 2026-11-23
---

**In plain words:** UDP (User Datagram Protocol) sends separate messages, called datagrams, with port numbers and a checksum, and nothing more: no handshake, no resending, no ordering. DNS and QUIC run on it. It's defined in RFC 768. A full page on UDP is planned.

**Think of it like this:** Postcards: quick and cheap, with no receipt. Most arrive; if one doesn't, nobody tells you.

**Learn it properly in** [[Layers and Encapsulation]] · [[A Packet's Journey]].
