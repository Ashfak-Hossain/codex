---
title: Layers and Encapsulation
description: "The one model behind every network protocol - five layers that each solve one problem, the envelopes they wrap around your data, the address each layer uses, which devices open which layers, and how the textbook OSI model maps onto the real internet."
tags:
  - networking-foundations
  - networking
  - cs
date: 2026-11-06
---

You write one line of code: `fetch("https://ashfak.dev")`. Your program never mentions Wi-Fi radio frequencies, routing tables across the Bay of Bengal, lost packets, or encryption keys. Yet all of those happen, correctly, every time. Your code can stay that simple because the work is split into **layers**, and each layer does exactly one job while trusting the layer below it to do the rest.

This page is the map for the whole Networking track. Every later page, from [[DHCP]] to TLS, is a zoom into one box on this map.

_Prereqs: none. This is the starting point of the Networking track._

---

## TL;DR

```text
 sender                                       receiver
┌──────────────────┐                          ┌──────────────────┐
│ Application HTTP │──────── meaning ─────────│ Application HTTP │
│ Security    TLS  │─── privacy, identity ────│ Security    TLS  │
│ Transport   TCP  │───── right program ──────│ Transport   TCP  │
│ Network     IP   │──── path across nets ────│ Network     IP   │
│ Link       Wi-Fi │────── next machine ──────│ Link       Wi-Fi │
└─────────┬────────┘                          └─────────▲────────┘
          └────────── bits on a wire or radio ──────────┘
```

- **Each layer has one job** and trusts the layer below for everything else.
- **Going down**, each layer wraps the data in its own header: an envelope inside an envelope. This is **encapsulation**.
- **Going up** on the other side, each layer removes its own header and passes the contents up.
- **Each layer has its own address**: a MAC address for the link, an IP address for the network, a port for transport, a name for the application.
- **Only the two endpoints open every layer.** Routers in between open only the bottom two or three.

---

## Why layers exist

Imagine there were no layers. Every application would need its own code for Wi-Fi, for Ethernet, for 4G, for fibre; for routing; for resending lost data; for encryption. With $A$ applications and $N$ kinds of network you would need $A \times N$ implementations, and every new kind of network would break every app.

Layering turns that product into a sum. Applications are written against one interface (a reliable byte stream from TCP), networks are written against another (carry an IP packet), and the two meet in the middle. A new application needs no new networks, and a new network needs no new applications.

The internet's middle is famously narrow. There are many applications on top and many link technologies at the bottom, but almost everything passes through one protocol, **IP**. This shape is called the **hourglass** (or "narrow waist") of the internet, and it is why your laptop can talk to a server it has never heard of over hardware neither of them knows about.

```text
     HTTP  gRPC  DNS  SMTP  SSH  Kafka  Postgres     ← many applications
          TLS              QUIC
            TCP          UDP                         ← a few transports
                    IP                               ← ONE network protocol
      Ethernet  Wi-Fi  4G/5G  fibre  DOCSIS          ← many links
```

> **Key idea:** a layer is a promise. TCP promises an ordered, reliable byte stream so HTTP doesn't have to think about lost packets. IP promises a best-effort path between any two addresses so TCP doesn't have to think about routes.

---

## The five layers

Read across a row and you know what matters about that layer: its job, what its unit of data is called, how it addresses things, and what you see when it breaks.

| Layer           | Its one job                           | Unit                          | Address                | Real protocols                     | When it breaks you see                       |
| --------------- | ------------------------------------- | ----------------------------- | ---------------------- | ---------------------------------- | -------------------------------------------- |
| **Application** | Say something meaningful              | message                       | URL, hostname, topic   | HTTP, DNS, gRPC, AMQP, Kafka, SMTP | `404`, `500`, malformed JSON, wrong result   |
| **Security**    | Keep it private and genuine           | record                        | certificate name (SNI) | TLS 1.3, mTLS                      | `certificate has expired`, hostname mismatch |
| **Transport**   | Deliver reliably to the right program | segment (TCP), datagram (UDP) | port                   | TCP, UDP, QUIC                     | `Connection refused`, resets, slow retries   |
| **Network**     | Find a path across many networks      | packet                        | IP address             | IPv4, IPv6, ICMP                   | `No route to host`, timeouts, packet loss    |
| **Link**        | Reach the next machine on this wire   | frame                         | MAC address            | Ethernet, Wi-Fi (802.11), [[ARP]]  | Wi-Fi drops, no link light                   |

A memory hook for the units, bottom to top: a **frame** carries a **packet**, which carries a **segment**, which carries a **record**, which carries a **message**.

### The parcel analogy

Think of sending a gift from Dhaka to a friend in Singapore, from the inside out:

- **Application**: the letter, written in a language you both read.
- **Security**: a locked box only your friend can open, with a wax seal that shows nobody tampered with it.
- **Transport**: the courier numbers each box ("2 of 5"), gets a signed receipt for each one, resends any box whose receipt never comes back, and writes the flat number so it reaches the right person in the building.
- **Network**: the building's street address on the label. It never changes during the trip.
- **Link**: the current vehicle. A rickshaw to the post office, a truck to the airport, a plane to Singapore. Each leg has its own driver, and the vehicle is swapped at every handover.

---

## Encapsulation: envelopes inside envelopes

When your browser sends `GET /`, each layer on the way down adds its own header in front of whatever it received from above. Step through it:

<div class="nbw" data-widget="packet-journey" data-steps="0-4,8-12"></div>

On the wire, a small HTTPS request looks roughly like this (typical header sizes, no options):

```text
┌──────┬──────┬──────┬──────┬──────────────────────┬──────┬─────┐
│ Eth  │  IP  │ TCP  │ TLS  │ encrypted HTTP       │ TLS  │ Eth │
│ hdr  │ hdr  │ hdr  │ hdr  │ "GET / HTTP/1.1 …"   │ tag  │ FCS │
│ 14 B │ 20 B │ 20 B │ 5 B  │ ~60 B                │ 16 B │ 4 B │
└──────┴──────┴──────┴──────┴──────────────────────┴──────┴─────┘
  link   net    trans  sec    application            sec    link
```

Two consequences worth remembering:

1. **Every layer adds overhead.** A 60-byte request carries about 80 bytes of headers. This is one reason protocols batch small messages together.
2. **A lower layer treats everything above it as opaque payload.** IP has no idea there is TCP inside; it just carries bytes. That is what makes layers replaceable: you can run HTTP over QUIC instead of TCP and IP never notices.

---

## Every layer has its own address

Each layer addresses something different, and a few small protocols exist only to translate between them:

| Address     | Identifies                      | Scope                     | Translated by                                          |
| ----------- | ------------------------------- | ------------------------- | ------------------------------------------------------ |
| Hostname    | a service, for humans           | global                    | **DNS**: name → IP address                             |
| Port        | a program on a machine          | one machine               | convention: 443 = HTTPS, 5432 = Postgres, 6379 = Redis |
| IP address  | a network interface, end to end | global (or private + NAT) | **[[DHCP]]** hands one out when a host joins           |
| MAC address | a network card, one hop         | one link only             | **[[ARP]]**: IP → MAC of the next hop                  |

So before your laptop can send a single byte to `ashfak.dev`, it has usually used three helper protocols: [[DHCP]] to get its own IP, DNS to turn the name into an IP, and [[ARP]] to find the MAC address of the router that will carry the packet out. [[A Packet's Journey]] walks through all of them in order.

---

## Who opens which envelope

Not every device opens every layer. How deep a device looks decides what it can do:

| Device                                   | Highest layer it reads | What that lets it do                                                       |
| ---------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Switch                                   | Link                   | Forward frames by MAC address within one network                           |
| Router                                   | Network                | Forward packets by IP address between networks                             |
| Home router with NAT, firewall           | Transport              | Rewrite addresses and ports, allow or block by port                        |
| **Layer 4 load balancer**                | Transport              | Spread TCP connections across servers by IP and port, without reading HTTP |
| **Layer 7 load balancer**, reverse proxy | Application            | Route by URL path, header or cookie. It must terminate TLS to do it        |
| Your laptop, the server                  | All of them            | Everything                                                                 |

When an engineer says "layer 4" or "layer 7", this table is what they mean. Nginx, Cloudflare and Kubernetes Ingress controllers are layer 7. A plain TCP load balancer is layer 4.

---

## OSI: the textbook's seven layers

University courses and interviews use the **OSI model**, which has seven layers. The real internet was built on the TCP/IP model and never followed OSI exactly, but the numbers stuck, which is why people still say "layer 7".

| OSI | Name         | Real-internet equivalent              |
| --- | ------------ | ------------------------------------- |
| 7   | Application  | Application (HTTP, DNS, ...)          |
| 6   | Presentation | absorbed into the application and TLS |
| 5   | Session      | absorbed into the application and TLS |
| 4   | Transport    | Transport (TCP, UDP)                  |
| 3   | Network      | Network (IP)                          |
| 2   | Data link    | Link (Ethernet, Wi-Fi)                |
| 1   | Physical     | Link (the cable, the radio)           |

Mnemonic, 7 down to 1: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing.

---

## Three misconceptions

**"TCP sends messages."** It doesn't. TCP delivers a continuous **byte stream** with no boundaries. If you write 100 bytes and then 50 bytes, the other side may read 150 at once, or 30 then 120. Every protocol on top must do its own **framing**: HTTP/1.1 uses `Content-Length`, and Postgres and Kafka prefix every message with its length.

**"HTTPS is a different protocol from HTTP."** It's the same HTTP, carried inside TLS. Take away the security layer and the bytes are identical.

**"The layers are strict."** They are a model, not a law. TLS doesn't fit neatly into OSI, and QUIC (which carries HTTP/3) implements reliable transport and encryption together, on top of UDP. Use the layers to reason; don't argue about where a protocol "really" belongs.

---

## Check yourself

Answer each one in your head before you open it.

> [!question]- A packet goes from your laptop to a server through five routers. How many times is the IP header's destination address changed? How many times is a new link-layer frame built?
> The destination IP is never changed: it is the end-to-end address. A new frame is built for every hop, because a frame only reaches the next machine. (The one twist is NAT at your home router, which rewrites the _source_ IP.)

> [!question]- Your application writes two messages to a TCP socket, 100 bytes and then 50 bytes. What might the receiver read?
> Any split of the same 150 bytes: all 150 at once, or 30 then 120, and so on. TCP is a byte stream with no message boundaries, which is why application protocols need framing such as a length prefix or `Content-Length`.

> [!question]- Why can a layer 4 load balancer not route requests by URL path?
> The URL lives in the HTTP message, which is inside the TLS layer. A layer 4 device only reads IP addresses and ports. To see the path, a device must work at layer 7 and terminate TLS.

> [!question]- Which protocol translates a hostname to an IP address, and which translates an IP address to a MAC address?
> DNS translates names to IP addresses. [[ARP]] translates an IP address on the local network to a MAC address.

---

## Recap

- Networking is split into **five layers**: application, security, transport, network, link. Each solves one problem and trusts the one below.
- Sending wraps data in one header per layer (**encapsulation**); receiving unwraps them in reverse.
- Each layer has its own **address**: name, port, IP, MAC. DNS, [[DHCP]] and [[ARP]] exist to translate between or assign them.
- Endpoints open every layer; **routers** open only up to IP; **layer 7** devices open up to HTTP.
- OSI has seven layers on paper. The internet uses five in practice, but the OSI numbers ("layer 4", "layer 7") are what engineers say.

_Next: [[A Packet's Journey]]: follow one real request through every one of these layers, hop by hop._

### References

1. Braden, R. (ed.). _Requirements for Internet Hosts — Communication Layers._ RFC 1122, IETF, October 1989. §1.1.3 — The internet's own layering model.
2. Socolofsky, T., Kale, C. _A TCP/IP Tutorial._ RFC 1180, IETF, January 1991. — A short, readable walk through encapsulation.
3. ISO/IEC 7498-1:1994. _Information technology — Open Systems Interconnection — Basic Reference Model._ — The OSI seven-layer model.
4. Bush, R., Meyer, D. _Some Internet Architectural Guidelines and Philosophy._ RFC 3439, IETF, December 2002. §3 — "Layering considered harmful", the case against strict layers.
5. Kurose, J. F., Ross, K. W. _Computer Networking: A Top-Down Approach._ 8th ed., Pearson, 2021. §1.5 — Protocol layers and encapsulation.
6. [Cloudflare Learning Center — What is the OSI model?](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
