---
title: A Packet's Journey
description: "What really happens when you open https://ashfak.dev - DHCP and ARP before you start, the DNS lookup, the TCP and TLS handshakes, the request travelling hop by hop with NAT and TTL, the response, and how many round trips it all costs. With commands to watch every step on your own machine."
tags:
  - networking-foundations
  - networking
  - cs
date: 2026-11-06
---

You type `https://ashfak.dev` and press Enter. About a quarter of a second later the page is on your screen. In between, your laptop has spoken at least five different protocols, your request has crossed a dozen machines that cannot read it, and the server has proven its identity with mathematics. This page follows that request from your keyboard to the server and back, one step at a time, and names the protocol responsible for each step.

It is a tour, not a deep dive. Wherever a step has its own page, the link is there so you can zoom in.

_Prereqs: [[Layers and Encapsulation]]: the five layers and the idea of envelopes inside envelopes._

---

## TL;DR

```text
 before   DHCP   my IP, gateway, DNS server   (when Wi-Fi connected)
 before   ARP    the gateway's MAC address    (cached)

 you press Enter                                      round trips
 ──────────────────────────────────────────────────────────────────
  1  URL    https → TLS, port 443, path /             0
  2  DNS    "ashfak.dev?" → 104.21.x.x                1 (0 if cached)
  3  TCP    SYN → SYN-ACK → ACK                       1
  4  TLS    ClientHello → … → Finished                1 (TLS 1.3)
  5  HTTP   GET / → 200 OK                            1
  6  reuse  more requests on the same connection      0
 ──────────────────────────────────────────────────────────────────
           cold start ≈ 4 round trips before the first byte
```

- Three helper protocols run **before** your request: [[DHCP]] (my address), [[ARP]] (the router's hardware address) and DNS (the server's address).
- Two handshakes run **before** any data: TCP opens a reliable pipe, TLS locks it.
- On the way, the **destination IP never changes**, the **link frame is rebuilt at every hop**, and nobody in the middle can read the request.
- Latency is counted in **round trips**, not bytes. Most of modern web performance is about removing round trips.

---

## Before you press Enter

Two things already happened when your laptop joined the network, and both are easy to forget because they are invisible.

**[[DHCP]] gave your laptop its configuration.** When you connected to Wi-Fi, your laptop broadcast a request and the home router answered with four things: an IP address for you (say `192.168.0.12`), a subnet mask, the **default gateway** (the router itself, `192.168.0.1`) and a **DNS server** to ask about names. Without these, nothing below works.

**[[ARP]] found the gateway's MAC address.** Every packet to the internet leaves through the gateway, and Ethernet and Wi-Fi deliver frames by MAC address, not IP. So the laptop asked "who has `192.168.0.1`?" and cached the answer. You can see it now:

```bash
ip neigh            # Linux
arp -a              # macOS
```

---

## Step 1: The browser reads the URL

`https://ashfak.dev/` splits into three parts:

| Part   | Value        | What it decides                                                     |
| ------ | ------------ | ------------------------------------------------------------------- |
| Scheme | `https`      | Use TLS, and use port **443** because no port is given              |
| Host   | `ashfak.dev` | The name to look up in DNS, and the name the certificate must match |
| Path   | `/`          | What to ask the server for, once connected                          |

One detail: `.dev` is on the browser's **HSTS preload list**, so the browser will never even try plain `http://` for any `.dev` domain. It goes straight to HTTPS.

---

## Step 2: DNS turns the name into an address

Computers route by IP address, so the browser needs the IP for `ashfak.dev`. It checks its own cache, then the operating system's cache. If both miss, it sends a small question over **UDP port 53** to the DNS server that DHCP gave it:

```text
laptop ──"ashfak.dev?"──▶ recursive resolver (ISP's, or 1.1.1.1)
                            │   only on a cache miss:
                            ├──▶ root:        "ask the .dev servers"
                            ├──▶ .dev TLD:    "ask ashfak.dev's nameserver"
                            └──▶ authoritative: "104.21.x.x, TTL 300"
laptop ◀── "104.21.x.x" ────┘
```

No connection, no handshake: one question, one answer, matched by a 16-bit ID. The answer comes with a **TTL** (time to live, in seconds) and is cached at every level until it expires, which is why the second visit skips this step entirely.

```bash
dig ashfak.dev            # the answer and its TTL
dig +trace ashfak.dev     # the full walk from the root servers down
```

---

## Step 3: TCP opens a reliable pipe

Now the browser has an IP address. Before sending data, TCP makes sure both sides are ready and agree on starting **sequence numbers**, so every byte from now on can be numbered, acknowledged and resent if lost:

```text
laptop :52814                            server :443
   │ ── SYN      seq=1000 ──────────────▶ │  "my bytes start at 1000"
   │ ◀──── SYN-ACK seq=5000 ack=1001 ──── │  "mine start at 5000; got yours"
   │ ── ACK      ack=5001 ──────────────▶ │  "got yours too"
   │                                      │  open: 1 round trip spent
```

The laptop picked `52814` itself: a random, temporary **ephemeral port**. A connection is identified by four values together: source IP, source port, destination IP, destination port. That is how one server tells apart thousands of open connections all arriving on port 443.

---

## Step 4: TLS locks the pipe

The pipe is reliable but completely readable by every machine on the path. TLS 1.3 fixes that in one more round trip:

```text
laptop                                         server
  │ ── ClientHello ───────────────────────────▶ │  ciphers, key share,
  │                                             │  SNI=ashfak.dev, ALPN=h2
  │ ◀── ServerHello + key share ─────────────── │
  │ ◀── {Certificate, CertVerify, Finished} ─── │  {…} = encrypted already
  │ ── {Finished} ────────────────────────────▶ │
  │      everything after this is encrypted     │
```

Three things happen in that exchange:

- **A shared secret appears that never crossed the wire.** Each side sends a _key share_, and the Diffie–Hellman exchange lets both compute the same secret from them. An eavesdropper who saw both shares still can't compute it.
- **The server proves who it is.** Its certificate says "this public key belongs to `ashfak.dev`", signed by a certificate authority your operating system trusts. The server then signs the handshake with the matching private key.
- **They agree on the application protocol.** ALPN picks HTTP/2 or HTTP/1.1 inside the handshake, at no extra cost.

The certificate itself is encrypted in TLS 1.3, but the **SNI**, the hostname you asked for, is still sent in plain text in the ClientHello, so the network can still see _which site_ you visit, just not what you do there.

---

## Step 5: The request travels, hop by hop

Only now does the thing you wanted, `GET /`, leave your laptop. Step through it and watch the envelopes, and which layers each machine actually opens:

<div class="nbw" data-widget="packet-journey"></div>

What changes and what stays the same along the way:

| Field                      | Changes at every hop?                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link frame (MAC addresses) | **Yes.** Rebuilt for each link. Each router uses [[ARP]] to find the next hop's MAC.                                                               |
| Destination IP             | **No.** End to end, from laptop to server.                                                                                                         |
| Source IP                  | Once: your home router's **NAT** swaps your private `192.168.x.x` for its public address. Many ISPs add a second layer of NAT (carrier-grade NAT). |
| TTL                        | **Yes.** Decremented by one per router, starting at 64 on Linux and macOS (128 on Windows). At zero, the packet is dropped.                        |
| TCP, TLS, HTTP             | **No.** Routers never open them, and cannot read the encrypted part.                                                                               |

See the routers on your own path, with the TTL trick in action (each probe is sent with TTL 1, 2, 3… and each router that drops one announces itself):

```bash
traceroute ashfak.dev     # or: mtr ashfak.dev  for a live view with loss per hop
```

---

## Step 6: The server answers

On the server the envelopes come off in reverse: the network card accepts the frame, the kernel accepts the IP packet, **TCP uses port 443** to hand the bytes to the web server process, TLS checks the authentication tag and decrypts, and the web server finally reads `GET /`.

The response makes the same trip backwards. A large response doesn't fit in one packet, so TCP cuts it into **segments** of about 1,460 bytes of data each (an Ethernet frame carries 1,500 bytes of IP packet, minus 20 for IP and 20 for TCP). Your laptop acknowledges them as they arrive, reorders any that arrive out of order, and hands one clean byte stream up to TLS and then to the browser.

---

## Step 7: Reuse, then close

The HTML refers to CSS, JavaScript and images. The browser fetches them **over the same connection**, because opening a new one would cost two more round trips (TCP + TLS). HTTP/2 goes further and sends many requests at once over one connection. When the connection has been idle long enough, TLS sends `close_notify`, TCP exchanges `FIN` segments, and the connection's life is over.

---

## Count the cost

| Step           | Round trips | How it is avoided next time                                   |
| -------------- | ----------- | ------------------------------------------------------------- |
| DNS lookup     | 1           | Cached for the record's TTL                                   |
| TCP handshake  | 1           | Keep-alive and connection reuse                               |
| TLS handshake  | 1           | Session resumption; TLS 1.3 needs only 1 instead of 2         |
| HTTP request   | 1           | Unavoidable, but HTTP/2 sends many in parallel                |
| **Cold total** | **≈ 4**     | HTTP/3 over **QUIC** merges the TCP and TLS handshakes into 1 |

At about 60 ms per round trip between Dhaka and Singapore, a cold request costs roughly 240 ms before the first byte arrives, and almost none of that is transferring data. This is why CDNs place servers near users: they make each round trip shorter. [[Latency Numbers]] builds a feel for these numbers.

### Measure your own

`curl` can time each phase of a real request:

```bash
curl -o /dev/null -s -w \
  'dns   %{time_namelookup}s\ntcp   %{time_connect}s\ntls   %{time_appconnect}s\nfirst %{time_starttransfer}s\ntotal %{time_total}s\n' \
  https://ashfak.dev
```

Each line is cumulative from the start, so the gaps between them are the cost of each step. Run it twice: the second run is usually faster because DNS is cached. Then run `curl -v https://ashfak.dev` to see the TLS handshake and the HTTP headers printed in full.

---

## Check yourself

> [!question]- Before the browser can send `GET /`, which three helper protocols have run, and what did each provide?
> [[DHCP]] gave the laptop its own IP address, gateway and DNS server. [[ARP]] gave the gateway's MAC address. DNS gave the server's IP address.

> [!question]- Your laptop's address is `192.168.0.12`. Why does the server never see that address?
> Your home router performs NAT: it rewrites the private source address (and port) to its own public address on the way out, and reverses the change for replies.

> [!question]- Can a router in the middle of the path see the URL path you requested? Can it see the hostname?
> It can't see the path: that is inside the encrypted HTTP request. It can see the destination IP, and a device inspecting the TLS ClientHello can read the hostname from the SNI field, which is sent in plain text.

> [!question]- Why is a second request to the same site usually much faster than the first?
> The DNS answer is cached, and the browser reuses the open TCP and TLS connection, which saves about three round trips.

> [!question]- Why does `traceroute` work at all?
> Each router decrements TTL and, when it reaches zero, drops the packet and sends back an ICMP "time exceeded" message from its own address. Sending probes with TTL 1, 2, 3… makes each router on the path reveal itself in turn.

---

## Recap

- [[DHCP]] and [[ARP]] run before you start; DNS runs when you press Enter.
- TCP's handshake creates a reliable, numbered byte stream; TLS's handshake encrypts it and proves the server's identity.
- Hop by hop, frames are rebuilt, TTL drops, the destination IP stays fixed, and NAT rewrites your private source address.
- A cold HTTPS request costs about **4 round trips** before the first byte. Caching, connection reuse, TLS 1.3, HTTP/2, QUIC and CDNs all exist to cut that number.

_Next: [[DHCP]]: zoom into the very first step, how a laptop with no address gets one._

### References

1. Mockapetris, P. _Domain Names — Concepts and Facilities_ and _Implementation and Specification._ RFC 1034 and RFC 1035, IETF, November 1987.
2. Eddy, W. (ed.). _Transmission Control Protocol (TCP)._ RFC 9293, IETF, August 2022. §3.5 — The three-way handshake.
3. Rescorla, E. _The Transport Layer Security (TLS) Protocol Version 1.3._ RFC 8446, IETF, August 2018. §2 — Handshake overview.
4. Fielding, R., Nottingham, M., Reschke, J. (eds.). _HTTP Semantics_ and _HTTP/1.1._ RFC 9110 and RFC 9112, IETF, June 2022.
5. Srisuresh, P., Egevang, K. _Traditional IP Network Address Translator (Traditional NAT)._ RFC 3022, IETF, January 2001.
6. Iyengar, J., Thomson, M. (eds.). _QUIC: A UDP-Based Multiplexed and Secure Transport._ RFC 9000, IETF, May 2021.
7. Kurose, J. F., Ross, K. W. _Computer Networking: A Top-Down Approach._ 8th ed., Pearson, 2021. §2.2 (HTTP), §2.4 (DNS), §3.5 (TCP).
8. [alex/what-happens-when](https://github.com/alex/what-happens-when) — A community-written, far more detailed version of this question, down to keyboard interrupts.
9. [curl man page — the `--write-out` variables](https://curl.se/docs/manpage.html#-w)
