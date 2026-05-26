---
title: Host Configuration
description: How a host that has just joined a network obtains an IP address, subnet mask, default gateway, and DNS servers — automatically, and before it has any address of its own.
---

# Host Configuration

A freshly connected host knows nothing: no address, no gateway, no DNS. It cannot ask a server for these by name, because naming itself needs the network. Host configuration is the bootstrap that solves this chicken-and-egg problem with broadcasts.

1. [[DHCP]] — the Dynamic Host Configuration Protocol: the four-message DORA handshake, time-bounded leases with their renewal timers, relay agents that carry the conversation across routers, and the trust assumptions an attacker can abuse.

_Pairs with the [[Address Resolution]] chapter — once DHCP hands you an IP, [[ARP]] maps it to hardware._
