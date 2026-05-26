---
title: Networking
description: "Notes on how machines talk to each other - starting with the two protocols that make a local network usable: ARP for finding a neighbour's hardware address, and DHCP for handing out the IP address in the first place."
---

# Networking

Notes on computer networks — the protocols, addressing, and machinery that move a packet from one machine to another. The material is organized by the problem each protocol solves rather than by OSI layer, so related ideas sit together.

## Address Resolution

You have an IP address for the machine you want to reach on your own link — but the network card only speaks hardware addresses. Bridging that gap is its own protocol.

- [[ARP]] — the Address Resolution Protocol: turning an IPv4 address into the MAC address of a neighbour on the same link, plus the cache, gratuitous ARP, and ARP spoofing.

## Host Configuration

Before a host can use the network at all, it needs an address, a gateway, and a DNS server — and it has to get them without already being on the network.

- [[DHCP]] — the Dynamic Host Configuration Protocol: the DORA handshake, leases and renewal timers, relay agents, and where it can be attacked.

---

_The first two chapters cover what a host needs the moment it joins a LAN: an address to use ([[DHCP]]) and a way to map that address to hardware ([[ARP]])._
