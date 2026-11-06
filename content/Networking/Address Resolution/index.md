---
title: Address Resolution
description: Mapping a logical IPv4 address to the physical hardware address a network card actually uses to deliver a frame on the local link.
---

An IP address says _which host_; a MAC address says _which network card on this wire_. A packet leaving your machine for a neighbour needs both — the IP to identify the destination, the MAC to actually address the Ethernet frame. Address resolution is the step that fills in the second from the first.

1. [[ARP]] — the Address Resolution Protocol: a broadcast question ("who has this IP?") and a unicast answer, the cache that keeps it from running every packet, and the spoofing attack the lack of authentication invites.

_Builds on the Host Configuration chapter: [[DHCP]] gives you the IP address and gateway; ARP makes them usable on the link. Next: [[Connectivity Debug Ladder]]._
