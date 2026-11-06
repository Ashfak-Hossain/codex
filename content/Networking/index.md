---
title: Networking
description: "How machines talk to each other - the layer model and one request's full journey, then the protocols a host needs the moment it joins a network (DHCP and ARP), and a layer-by-layer method for debugging any connection."
---

Notes on computer networks: the protocols, addressing and machinery that move data from one program to another across the world. The material is organized by **the problem each protocol solves**, not by OSI layer, so related ideas sit together. Read it in order the first time; each page lists its prerequisites at the top and the next page at the bottom.

```text
1  Layers and Encapsulation      the model
2  A Packet's Journey            the big tour
3  DHCP                          zoom in: getting an address
4  ARP                           zoom in: finding the next hop
5  Connectivity Debug Ladder     apply it all
```

## 1 · Foundations

The map before the territory: one model that explains every protocol, and one real request traced end to end.

1. [[Layers and Encapsulation]] — the five layers, envelopes inside envelopes, the address each layer uses, and who opens which layer. _Interactive._
2. [[A Packet's Journey]] — what really happens when you open `https://ashfak.dev`: DNS, the TCP and TLS handshakes, every hop, and the round trips it costs. _Interactive._

## 2 · Host Configuration

Before a host can use the network at all, it needs an address, a gateway and a DNS server, and it has to get them without already being on the network.

3. [[DHCP]] — the DORA handshake, leases and renewal timers, relay agents, and where it can be attacked.

## 3 · Address Resolution

You have an IP address for the next machine on your own link, but the network card only speaks hardware addresses. Bridging that gap is its own protocol.

4. [[ARP]] — turning an IPv4 address into the MAC address of a neighbour, plus the cache, gratuitous ARP and ARP spoofing.

## 4 · Troubleshooting

Using the layer model as a checklist when something doesn't connect.

5. [[Connectivity Debug Ladder]] — address, name, route, port, TLS, application: one command per layer, and what "refused" versus "timed out" really means.

---

_Coming later, in the same style: DNS, TCP, TLS and HTTP each get their own page, zooming into steps 2 to 5 of [[A Packet's Journey]]._

_Continue with the [[System Design/index|System Design]] track, which builds on this one: [[Latency Numbers]], then what happens when the network fails._
