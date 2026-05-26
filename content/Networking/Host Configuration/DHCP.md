---
title: DHCP
description: "The Dynamic Host Configuration Protocol explained hands-on - how a host with no address gets one automatically through the four-message DORA handshake, the message format and key options, leases and renewal timers, relay agents, the commands to watch it live, security attacks, and a troubleshooting guide."
tags:
  - host-configuration
  - networking
  - cs
date: 2026-05-16
---

A laptop joins a Wi-Fi network and a second later it can browse the web — yet a moment before, it had no IP address, no subnet mask, no gateway, no DNS server. It could not have *asked* a server for these: asking by name needs DNS, reaching a server needs a gateway, and using the link needs an address. Every prerequisite depends on the thing being requested.

The **Dynamic Host Configuration Protocol** (DHCP) breaks that cycle the only way possible — with **broadcasts**. A host with no address can still shout a frame to everyone on the link, and a DHCP server listening there shouts back a complete network identity.

---

## TL;DR

DHCP automatically gives a new host its **IP address — plus subnet mask, gateway, and DNS** — through a four-message handshake called **DORA**.

```text
Client (no IP yet)                               DHCP Server
        |                                              |
        |  1. DISCOVER  — broadcast "anyone out there?" |
        |---------------------------------------------> |
        |  2. OFFER     — "you can have 192.168.1.50"   |
        | <--------------------------------------------- |
        |  3. REQUEST   — broadcast "I'll take .50"     |
        |---------------------------------------------> |
        |  4. ACK       — "confirmed — here's your mask,|
        |                  gateway, DNS, 24 h lease"    |
        | <--------------------------------------------- |
        |                                              |
   the address is now configured and usable
```

- **D**iscover → **O**ffer → **R**equest → **A**ck.
- Runs over **UDP** — client port `68`, server port `67`.
- The address is a **lease**: valid for a fixed time, then renewed or returned.
- Covers **one network**; a **relay agent** extends it across routers.

---

## Why It Exists

A host joining a network needs, at minimum:

| It needs…           | …so that it can…                              |
| ------------------- | --------------------------------------------- |
| an **IP address**   | be addressed on the network                   |
| a **subnet mask**   | tell which addresses are local vs. remote     |
| a **default gateway** | reach anything outside its own network      |
| **DNS servers**     | resolve names like `example.com`               |

Assigning all of this by hand does not scale, and it does not survive mobility — a laptop hopping between networks would need reconfiguring at every stop. DHCP makes it **dynamic**: addresses come from a pool, are leased for a bounded time, and return for reuse when a device leaves or powers off.

The hard part is the bootstrap: the client needs this configuration *before* it has any usable address. That is why the whole conversation runs over broadcasts.

---

## How It Works

The handshake is four messages — **DORA**. Watch which are broadcast and which are unicast; that detail is what makes it work before the client has an address.

**Step 1 — DISCOVER (client broadcasts).**
With no address of its own, the client cannot name a server or even know one exists. It broadcasts a DISCOVER from source IP `0.0.0.0` to `255.255.255.255`, tagged with a random **transaction ID** that will tie all four messages together, and carrying its own MAC address as identification.

**Step 2 — OFFER (server replies).**
Every DHCP server that hears the DISCOVER picks a free address from its pool and offers it — the proposed address travels in the `yiaddr` ("your IP address") field, alongside the mask, gateway, DNS, and lease time. If several servers exist, the client receives several offers.

**Step 3 — REQUEST (client broadcasts).**
The client picks one offer (usually the first to arrive) and broadcasts a REQUEST. This is **broadcast on purpose**: it names the chosen server inside a *server identifier* option, so every server learns the outcome at once — the chosen one commits the lease, and the others see their offer was declined and return their tentative address to the pool.

**Step 4 — ACK (server confirms).**
The chosen server commits the binding and replies with an ACK carrying the final, confirmed configuration. The client then adopts the address — typically after one safety check that nobody else is using it (a gratuitous [[ARP]] for the address; if someone answers, it sends a DECLINE and restarts).

> **Why two round trips, not one?** The OFFER alone could assign an address — but DISCOVER is a broadcast that *every* server answers. Without the explicit REQUEST naming a single winner, every server would think its offer was taken and the pool would drain instantly. REQUEST/ACK is the commit step of a two-phase handshake.

### The lease

A DHCP address is **leased, not given** — valid only for the lease time, then it returns to the pool. That is what keeps a finite pool usable as devices come and go. The client renews well before expiry, governed by two timers set when the lease is granted:

| Timer  | Fires at        | The client then…                                                       |
| ------ | --------------- | ----------------------------------------------------------------------- |
| **T1** | 50% of lease    | **unicasts** a REQUEST to its own server to extend the lease.            |
| **T2** | 87.5% of lease  | gives up on that server and **broadcasts** a REQUEST to any server.      |
| expiry | 100%            | drops the address and starts over from DISCOVER.                         |

A renewal is just a REQUEST/ACK pair — no DISCOVER needed, since the client already holds a working address. T1 tries the cheap path (its own server, by unicast); T2 widens the search only if that fails — a graceful fallback for when the original server has gone down.

---

## On the Wire

DHCP is built on the older **BOOTP** format: a fixed header followed by a variable list of **options**. Key header fields:

| Field    | Meaning                                                          |
| -------- | ---------------------------------------------------------------- |
| `op`     | request (client→server) or reply (server→client).               |
| `xid`    | Transaction ID — random, binds the four messages of one handshake. |
| `ciaddr` | Client IP — filled only on renewal, when the client already has one. |
| `yiaddr` | "Your" IP — the address the server is assigning.                 |
| `chaddr` | Client hardware address — the MAC identifying the client.        |
| `giaddr` | Gateway/relay IP — stamped by a relay agent (see below).         |
| `options`| Variable list of typed values — the real payload.               |

The message type itself (DISCOVER, OFFER, …) is just **option 53** — structurally, DHCP is BOOTP plus a rich options block. The options you will see most:

| Option | Name              | Carries                                              |
| -----: | ----------------- | ---------------------------------------------------- |
|      1 | Subnet mask       | Which addresses are on-link.                         |
|      3 | Router            | Default gateway(s).                                  |
|      6 | DNS servers       | Name resolvers.                                      |
|     51 | Lease time        | How long the binding is valid, in seconds.           |
|     53 | Message type      | DISCOVER / OFFER / REQUEST / ACK / NAK …             |
|     54 | Server identifier | Which server — the field that decides REQUEST's winner. |

### Crossing routers: the relay agent

DHCP depends on broadcasts, and **routers do not forward broadcasts** — so a DISCOVER cannot leave its own network. Putting a server on every network would be wasteful.

The fix is a **DHCP relay agent** (an "IP helper"), usually the router itself. It catches DHCP broadcasts on a network and forwards them as **unicast** to a central server, stamping its own address into the `giaddr` field. That field does double duty: it tells the central server *which network the client is on* (so it picks from the right address pool) and gives it an address to reply to. One central server can then cover an entire organisation.

---

## See It Yourself

**Watch a full handshake** — capture ports 67 and 68 while a device connects:

```text
$ sudo tcpdump -i eth0 -n port 67 or port 68
BOOTP/DHCP, Request from a8:5e:45:..., DHCP-Message: Discover
BOOTP/DHCP, Reply,                      DHCP-Message: Offer
BOOTP/DHCP, Request from a8:5e:45:...,  DHCP-Message: Request
BOOTP/DHCP, Reply,                      DHCP-Message: ACK
```

That is DORA, live. In Wireshark the display filter is `dhcp` (older versions: `bootp`).

**Trigger it manually** — release the current lease and ask for a new one:

```text
$ sudo dhclient -r eth0          # send RELEASE, give up the address
$ sudo dhclient -v eth0          # run DORA again, verbosely
DHCPDISCOVER on eth0 ...
DHCPOFFER  of 192.168.1.50 from 192.168.1.1
DHCPREQUEST for 192.168.1.50 ...
DHCPACK    of 192.168.1.50 from 192.168.1.1
```

**Inspect the result** — the address and lease the client is holding:

```text
$ ip addr show eth0              # the assigned address
$ cat /var/lib/dhcp/dhclient.leases    # lease records: address, times, options
```

On Windows the equivalents are `ipconfig /release`, `ipconfig /renew`, and `ipconfig /all`.

---

## Security

Like [[ARP]], base DHCP has **no authentication** — neither side proves who it is. Two attacks follow directly.

**Rogue DHCP server.** Anyone on the network can run a DHCP server, and a client takes whichever OFFER arrives first. An attacker's server can win that race and hand out a configuration of its choosing — most dangerously a **gateway or DNS server pointing at the attacker**, putting them in a man-in-the-middle position for all the victim's traffic. (Often this is not even malicious: a home router plugged into the wrong port becomes an accidental rogue server.)

**DHCP starvation.** An attacker floods DISCOVERs with thousands of fake MAC addresses, draining the address pool so genuine clients get nothing — a denial of service. It pairs naturally with the rogue-server attack: starve the real server, then be the only one still answering.

The defences live on the switch:

- **DHCP snooping** — the switch trusts only the port where the real server lives and drops server messages (OFFER, ACK) arriving on any other port, silencing a rogue server. It also builds an IP/MAC/port binding table that **Dynamic ARP Inspection** then reuses to stop [[ARP]] spoofing.
- **Port security** — cap the number of MAC addresses per port, blunting the starvation flood.

---

## Troubleshooting

| Symptom                                              | Likely cause                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Device has a `169.254.x.x` address                   | No DHCP server answered — it fell back to link-local (APIPA). Server down or unreachable. |
| Clients on one network get addresses, another doesn't| Missing or misconfigured **relay agent** on that network's router.                  |
| Two devices end up with the same IP                  | A pool address collides with a static address — the post-ACK [[ARP]] check should catch it and DECLINE. |
| Server hands out addresses from the wrong subnet     | The server is ignoring `giaddr` from the relay, or the relay isn't stamping it.     |
| Pool exhausted, new clients get nothing              | Lease time too long for the churn, or a **DHCP starvation** attack.                 |
| Client loses connectivity exactly at mid-lease       | Renewal (T1) is failing — server unreachable; watch it limp to T2's broadcast.      |

> **Key idea:** a `169.254.x.x` address is the universal "DHCP didn't work" signal — the client is on the wire but never got a lease.

---

## Recap

- DHCP automatically configures a new host: **IP address, subnet mask, gateway, and DNS**.
- It works through the **DORA** handshake — Discover, Offer, Request, Ack — over UDP ports 67/68.
- The address is a **time-limited lease**, renewed at the **T1/T2** timers.
- A **relay agent** carries the broadcast-based conversation across routers to a central server.
- It has **no authentication**, exposing it to **rogue servers** and **starvation**; defend with DHCP snooping and port security.
- DHCP gives a host its IP — and [[ARP]] then maps that IP to hardware so frames can actually be delivered.

### References

1. Droms, R. _Dynamic Host Configuration Protocol._ RFC 2131, IETF, March 1997. — The core specification.
2. Alexander, S., Droms, R. _DHCP Options and BOOTP Vendor Extensions._ RFC 2132, IETF, March 1997.
3. Patrick, M. _DHCP Relay Agent Information Option._ RFC 3046, IETF, January 2001.
4. Kurose, J. F., Ross, K. W. _Computer Networking: A Top-Down Approach._ 8th ed., Pearson, 2021. §4.3.3.
5. [Cisco — Configuring DHCP Snooping](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-x/configuration_guide/sec/b_17x_sec_9300_cg/configuring_dhcp_snooping.html)
