---
title: ARP
description: "The Address Resolution Protocol explained hands-on - how a host maps an IPv4 address to a MAC address on the local link with one broadcast question and one unicast reply, the ARP cache, the packet on the wire, the commands to watch it live, ARP spoofing, and a troubleshooting guide."
tags:
  - address-resolution
  - networking
  - cs
date: 2026-05-16
---

A host wants to send an IP packet to `192.168.1.7` on its own network. It knows the destination IP — but Ethernet does not deliver to IP addresses. A frame is addressed by a 48-bit **MAC address** burned into the destination's network card, and the sender has no idea what that is. The IP address says _who_; the link has no idea _where_ on the wire that is.

The **Address Resolution Protocol** (ARP) bridges that gap with the simplest exchange possible: shout the question to everyone on the link, and let the one host that owns the address answer.

---

## TL;DR

ARP turns an **IP address into a MAC address** for a host on the same network.

```text
Host A (192.168.1.4)                          Host B (192.168.1.7)
        |                                              |
        |  ARP Request  — sent to ff:ff:ff:ff:ff:ff    |
        |  "Who has 192.168.1.7? Tell 192.168.1.4"     |
        |--------------- broadcast to all -----------> | (+ everyone else)
        |                                              |
        |  ARP Reply  — sent straight back to A        |
        |  "192.168.1.7 is at b8:27:eb:0a:1c:55"       |
        | <------------------------------------------- |
        |                                              |
   A caches the mapping, then sends the real packet
```

- **One broadcast, one unicast reply.** Then the result is cached so it does not run again.
- **Local link only.** ARP never crosses a router — it resolves addresses on your own network segment, nothing beyond it.
- **IPv4 only.** IPv6 replaced ARP with the Neighbor Discovery Protocol.

---

## Why It Exists

IP and Ethernet are two independent addressing systems, and neither knows about the other:

| Layer        | Address  | Looks like          | Assigned by                  |
| ------------ | -------- | ------------------- | ----------------------------- |
| 3 — Network  | IP       | `192.168.1.7`       | configuration or [[DHCP]]      |
| 2 — Link     | MAC      | `b8:27:eb:0a:1c:55` | the hardware manufacturer      |

To put a packet on the wire you need **both**: the IP to identify the destination logically, and the MAC to actually address the Ethernet frame. Knowing one tells you nothing about the other — so something has to translate. That something is ARP.

When a host sends a packet, IP routing first asks _is the destination on my own network?_

- **Same network** → the destination is a direct neighbour; the frame needs the destination's own MAC.
- **Different network** → the packet goes to the **default gateway**; the frame needs the *gateway's* MAC, even though the IP header still names the far-away final destination.

Either way the sender needs the MAC of *some IP on the local link*. That lookup is ARP's entire job.

---

## How It Works

Host **A** = `192.168.1.4` (MAC `aa:aa:aa:aa:aa:aa`) wants to reach **B** = `192.168.1.7`.

**Step 1 — A broadcasts the question.**
The Ethernet frame's destination is `ff:ff:ff:ff:ff:ff`, the broadcast address, so every network card on the link receives it. The message means: *"Whoever owns 192.168.1.7, tell me your MAC."*

**Step 2 — Everyone checks, only B matches.**
Every host compares the requested IP to its own. All but B discard the packet. Many of them, before discarding it, still *record* A's IP-and-MAC pairing — A volunteered it in the request, so it is free knowledge.

**Step 3 — B replies directly to A.**
B already knows A's MAC (it was inside the request), so the answer is a **unicast** straight back to A, not another broadcast. The reply says: *"192.168.1.7 is at b8:27:eb:0a:1c:55."*

**Step 4 — A caches and sends.**
A stores `192.168.1.7 → b8:27:eb:0a:1c:55` in its **ARP cache**, then finally sends the IP packet it was holding, wrapped in a frame addressed to B's MAC.

Every later packet to B skips ARP entirely while that cache entry lives — ARP runs once per conversation, not once per packet.

### The ARP cache

The cache is a short-lived table of IP → MAC mappings. Entries **expire on purpose** (after seconds to minutes): a host can be unplugged, swap its network card, or have its IP handed by [[DHCP]] to a different machine — a permanent cache would keep delivering to the wrong hardware. Linux ages entries lazily through states (`REACHABLE` → `STALE` → `PROBE` → `FAILED`), re-checking only when traffic actually needs a stale entry.

### Useful variants

- **Gratuitous ARP** — a host announces *its own* mapping without being asked. Used to detect duplicate addresses on boot, and to update everyone's cache fast after a failover (so traffic swings to the new MAC immediately).
- **Proxy ARP** — a router answers on behalf of hosts on another segment, making two networks look like one. Mostly legacy today.

---

## On the Wire

ARP rides directly inside an Ethernet frame (EtherType `0x0806`) — not over IP, since resolving IP is its whole job. For IPv4-over-Ethernet the payload is 28 bytes:

| Field    | Value (IPv4 / Ethernet)  | Meaning                                         |
| -------- | ------------------------ | ----------------------------------------------- |
| `HTYPE`  | `1`                      | Hardware type — Ethernet.                       |
| `PTYPE`  | `0x0800`                 | Protocol type — IPv4.                           |
| `HLEN`   | `6`                      | Hardware (MAC) address length, bytes.           |
| `PLEN`   | `4`                      | Protocol (IP) address length, bytes.            |
| `OPER`   | `1` request / `2` reply  | Which half of the exchange this is.             |
| `SHA`    | sender's MAC             | The asker's / answerer's own MAC.               |
| `SPA`    | sender's IP              | The asker's / answerer's own IP.                |
| `THA`    | target's MAC             | **Blank (zeros)** in a request — the reply fills it in. |
| `TPA`    | target's IP              | The IP being resolved.                          |

The whole exchange exists to learn `THA` for a given `TPA`. A request leaves `THA` as zeros; the reply is just the same packet with that blank filled and `OPER` flipped to `2`.

A request and its reply, side by side:

```text
REQUEST (broadcast)                  REPLY (unicast back to A)
  OPER 1                               OPER 2
  SHA  aa:aa:aa:aa:aa:aa  (A)          SHA  b8:27:eb:0a:1c:55  (B)
  SPA  192.168.1.4                     SPA  192.168.1.7
  THA  00:00:00:00:00:00  (unknown)    THA  aa:aa:aa:aa:aa:aa  (A)
  TPA  192.168.1.7                     TPA  192.168.1.4
```

---

## See It Yourself

**Look at the cache** — the live IP → MAC table on your machine:

```text
$ ip neigh                       # modern Linux
192.168.1.7   dev eth0  lladdr b8:27:eb:0a:1c:55  REACHABLE
192.168.1.1   dev eth0  lladdr 00:1a:2b:3c:4d:5e  STALE

$ arp -a                         # classic, also on macOS / Windows
? (192.168.1.7) at b8:27:eb:0a:1c:55 [ether] on eth0
```

**Force a fresh exchange** — delete an entry, then ping the host and watch ARP refill it:

```text
$ sudo ip neigh flush dev eth0   # empty the cache
$ ping -c1 192.168.1.7           # triggers a new ARP request
$ ip neigh                       # the entry is back
```

**Watch the packets** — capture ARP traffic as it happens:

```text
$ sudo tcpdump -i eth0 -n arp
ARP, Request who-has 192.168.1.7 tell 192.168.1.4, length 28
ARP, Reply 192.168.1.7 is-at b8:27:eb:0a:1c:55, length 28
```

In Wireshark, the display filter is simply `arp`. You can also probe a host directly with `arping 192.168.1.7`, which sends ARP requests and times the replies — a ping that works purely at layer 2.

---

## Security

ARP has **no authentication at all**. A reply is believed simply because it arrived — nothing proves the sender actually owns the IP it claims. Hosts even accept *unsolicited* replies that overwrite existing cache entries. That is the whole vulnerability.

**ARP spoofing (poisoning).** An attacker on the network broadcasts forged replies:

```text
To the victim:   "the gateway 192.168.1.1 is at <attacker's MAC>"
To the gateway:  "the victim  192.168.1.4 is at <attacker's MAC>"
```

Both caches are now poisoned, and every packet between victim and gateway flows through the attacker — a **man-in-the-middle** position enabling sniffing, session hijacking, or selective dropping. The attacker just repeats the forged replies every few seconds to keep the poison fresh.

This flaw is structural — a 1982 protocol built for a trusted LAN — so it cannot be patched away. Defences are layered around it:

- **Dynamic ARP Inspection (DAI)** — a managed switch checks each ARP packet against its DHCP-snooping records and drops mappings it never saw assigned. The single most effective measure.
- **Static ARP entries** — pin critical mappings (such as the gateway) so a forged reply cannot overwrite them.
- **Encryption above layer 2** — TLS, SSH, a VPN. A man-in-the-middle still sees only ciphertext; the attack degrades to traffic analysis.

---

## Troubleshooting

| Symptom                                              | Likely cause                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Can't reach a host on the **same** network           | ARP request gets no reply — host is down, or a wrong **subnet mask** makes the IP look off-link. |
| Can't reach **anything** beyond the network          | The *gateway's* MAC isn't resolving — check `ip neigh` for the gateway's entry.            |
| Connection works, then breaks after a few minutes    | Stale cache entry — a host changed its MAC (NIC swap, failover) with no gratuitous ARP.    |
| Intermittent, flapping connectivity                  | Duplicate IP address — two hosts answer ARP, the cache flaps between their MACs.           |
| `ip neigh` shows the gateway with an unexpected MAC  | Possible ARP spoofing — the gateway's IP is pointing at an attacker.                       |
| First packet to a new host is lost                   | Normal — that packet waited on the ARP round trip; most stacks queue only one and drop the rest. |

> **Key idea:** ARP works only *within* one network. If a problem involves crossing a router, ARP is resolving the gateway, not the far host — check the gateway's cache entry first.

---

## Recap

- ARP maps an **IP address to a MAC address** on the local link, so a frame can actually be delivered.
- It is one **broadcast request** and one **unicast reply**, with the result kept in a short-lived **cache**.
- It works **only within a single network** and **only for IPv4** — IPv6 uses Neighbor Discovery instead.
- It has **no authentication**, which makes **ARP spoofing** easy; defend with DHCP-aware switches (DAI) and encryption above layer 2.
- Next: ARP gives you the MAC for an IP — but where did the IP itself come from? See [[DHCP]].

### References

1. Plummer, D. C. _An Ethernet Address Resolution Protocol._ RFC 826, IETF, November 1982. — The original specification.
2. Braden, R. (ed.). _Requirements for Internet Hosts._ RFC 1122, IETF, October 1989. §2.3.2 — ARP cache behaviour.
3. Narten, T., et al. _Neighbor Discovery for IP version 6._ RFC 4861, IETF, September 2007. — ARP's IPv6 successor.
4. Kurose, J. F., Ross, K. W. _Computer Networking: A Top-Down Approach._ 8th ed., Pearson, 2021. §6.4.1.
5. [Cisco — Configuring Dynamic ARP Inspection](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-x/configuration_guide/sec/b_17x_sec_9300_cg/configuring_dynamic_arp_inspection.html)
