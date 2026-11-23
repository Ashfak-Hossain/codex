---
title: Relay agent
description: "A router that forwards DHCP broadcasts to a DHCP server on another network."
tags:
  - glossary
aliases:
  - DHCP relay
date: 2026-11-23
---

**In plain words:** A DHCP relay agent, usually the router, catches DHCP broadcasts on one network and forwards them as unicast to a DHCP server elsewhere. It writes its own address into the message (the `giaddr` field) so the server knows which network the client is on.

**Think of it like this:** A local clerk who collects "I need an address" requests from the street and forwards them to head office.

**Learn it properly in** [[DHCP]].
