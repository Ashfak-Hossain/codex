---
title: SNI
description: "The site name a browser sends at the start of TLS, so a server hosting many sites picks the right certificate."
tags:
  - glossary
aliases:
  - Server Name Indication
date: 2026-11-23
---

**In plain words:** SNI (Server Name Indication) is the hostname the client sends in its first TLS message, so a server hosting many sites at one IP address can present the right certificate. It's defined in RFC 6066, and it's visible to anyone watching the network.

**Think of it like this:** Writing "for the accounts department" on the outside of the locked box, so the building's front desk knows where to take it.

**Learn it properly in** [[A Packet's Journey]] · [[Layers and Encapsulation]].
