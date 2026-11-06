---
title: Connectivity Debug Ladder
description: "A layer-by-layer method for any 'it can't connect' problem - check your own address, then the name, the route, the port, TLS and the application, with the exact commands, what each result means, why 'refused' and 'timed out' are completely different, and the same ladder for Postgres, Redis, Kafka, Docker and Kubernetes."
tags:
  - troubleshooting
  - networking
  - cs
date: 2026-11-06
---

"It can't connect." That sentence covers a typo in a hostname, a firewall silently dropping packets, a service that crashed, an expired certificate and a wrong password, and each of those has a completely different fix. Guessing between them wastes hours.

The way out is to use the layer model as a checklist. Test one layer at a time, from the bottom up. Each rung of the ladder asks one question, answered by one command. **The first rung that fails is where the problem is**, and every rung above it is irrelevant until you fix it.

_Prereqs: [[Layers and Encapsulation]] · [[A Packet's Journey]] · helpful: [[DHCP]] and [[ARP]] for rung 0._

---

## TL;DR

```text
 5  App answers correctly?   curl -v https://host/health
 4  TLS handshake works?     openssl s_client -connect host:443
 3  Port listening?          nc -vz host 443
 2  Packets reach it?        mtr host        (or traceroute)
 1  Name resolves?           dig +short host
 0  Am I on the network?     ip addr  ·  ipconfig getifaddr en0
 ▲
 climb from 0 · stop at the first rung that fails · fix it · climb again
```

- **Refused** means the machine answered and nothing is listening. **Timed out** means nobody answered at all. They point to completely different fixes.
- The ladder is the same for a website, Postgres, Redis or Kafka. Only rung 5 changes.
- Always climb **from where the failing client runs**: from inside the container, the pod or the server, not from your laptop.

---

## Rung 0: Am I on the network at all?

```bash
ip addr                       # Linux: look for "inet" on your interface
ipconfig getifaddr en0        # macOS: your Wi-Fi address
ip route | grep default       # Linux: is there a default gateway?
netstat -rn | grep default    # macOS
```

| You see                                 | It means                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A normal address such as `192.168.0.12` | [[DHCP]] worked. Go up a rung.                                                                        |
| `169.254.x.x`                           | DHCP failed: the machine picked a link-local address itself. Nothing beyond the local link will work. |
| No address, or no default route         | Not connected, or no gateway configured. Check the cable, Wi-Fi, or DHCP.                             |

If you have an address but can't reach anything, check that the gateway's MAC address resolves (`ip neigh` or `arp -a`). A missing or "incomplete" entry for the gateway is an [[ARP]] problem.

---

## Rung 1: Does the name resolve?

```bash
dig +short ashfak.dev         # just the address(es)
dig ashfak.dev @1.1.1.1       # ask a specific resolver, bypassing yours
```

| You see                 | It means                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| An IP address           | DNS works. Check it is the address you expect, then go up.                                    |
| Nothing, or `NXDOMAIN`  | The record doesn't exist: a typo, a missing record, or the domain's DNS isn't set up.         |
| `SERVFAIL` or a timeout | The resolver can't get an answer: try another resolver with `@1.1.1.1`.                       |
| An old IP address       | A cached answer. It lasts until the record's TTL expires; check the TTL in full `dig` output. |

A classic trap: your laptop resolves the name differently from the server or container, because they use different resolvers or a different `/etc/hosts`. Run the command where the failing client runs.

---

## Rung 2: Can packets reach the machine?

```bash
ping -c 4 ashfak.dev
mtr ashfak.dev                # live view of every hop with loss and latency (brew install mtr)
traceroute ashfak.dev
```

| You see                                              | It means                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Replies with steady latency                          | The path works. Go up.                                                                           |
| Loss that starts at one hop and continues to the end | A real problem on the path from that hop onward.                                                 |
| Loss at a middle hop only, but the end is fine       | Harmless. That router just deprioritises replies to probes.                                      |
| No replies at all                                    | **Not conclusive.** Many servers and cloud firewalls block ICMP (ping). Rung 3 is the real test. |

---

## Rung 3: Is something listening on the port?

This is the most informative rung, because TCP gives three distinct answers.

```bash
nc -vz ashfak.dev 443         # -v verbose, -z just test the connection, send no data
nc -vz -w 3 db.internal 5432  # Linux: give up after 3 seconds  (macOS: -G 3)
```

| You see                  | It means                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `succeeded` / `open`     | The TCP handshake completed: a program accepted the connection. Go up.                                      |
| **`Connection refused`** | The machine **answered** with a TCP reset (RST): it's reachable, but **nothing is listening** on that port. |
| **Timed out**            | **Nobody answered.** Packets are being silently dropped, or the IP is wrong or down.                        |

### Refused vs timed out

These two look similar in an error log, but they send you to opposite places:

```text
REFUSED                              TIMED OUT
client ── SYN ──▶ server             client ── SYN ──▶ ✕ dropped
client ◀── RST ── server             client ── SYN ──▶ ✕ (retry)
"nobody home on that port"           client ── SYN ──▶ ✕ (give up)

network fine, service is not         path or firewall is the problem
```

Causes of **refused**: the service isn't running or crashed; it listens on a different port; or it listens only on `127.0.0.1`, which means "this machine only" and rejects outside connections. Check on the server with `ss -tlnp` (Linux) or `lsof -iTCP -sTCP:LISTEN` (macOS).

Causes of **timed out**: a firewall rule that drops traffic (a cloud security group, `ufw`, a corporate firewall); the wrong IP address; the host being down; or a missing route. A firewall that _rejects_ instead of _drops_ produces "refused" or an ICMP error instead, which is why a timeout almost always means "something is silently eating packets".

---

## Rung 4: Does the TLS handshake succeed?

```bash
openssl s_client -connect ashfak.dev:443 -servername ashfak.dev </dev/null
```

Read the `Verify return code` line near the end, and the certificate's `subject` and dates.

| You see                                  | It means                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Verify return code: 0 (ok)`             | TLS is fine. Go up.                                                                                                                        |
| `certificate has expired`                | Renew it. (Automated renewal, such as Let's Encrypt, has probably stopped.)                                                                |
| Hostname mismatch                        | The certificate was issued for a different name. Often a missing `-servername`, a wrong DNS record, or a missing subject alternative name. |
| `unable to get local issuer certificate` | The server isn't sending its intermediate certificate, or the client doesn't trust the CA (common with self-signed certificates).          |

---

## Rung 5: Does the application answer correctly?

```bash
curl -v https://ashfak.dev/health
```

| You see                     | It means                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `2xx`                       | Working.                                                                                                                             |
| `4xx`                       | The server understood and **your request** is wrong: path, auth, method or body.                                                     |
| `5xx`                       | The server failed while handling it. Read the server's logs.                                                                         |
| `502` or `504` from a proxy | The proxy (Nginx, a load balancer, Cloudflare) can't reach **its** upstream. Climb the ladder again, from the proxy towards the app. |

If it works but is slow, time each phase to see which rung is slow (DNS, TCP, TLS or the server itself):

```bash
curl -o /dev/null -s -w 'dns %{time_namelookup}  tcp %{time_connect}  tls %{time_appconnect}  first-byte %{time_starttransfer}  total %{time_total}\n' https://ashfak.dev
```

---

## The same ladder for other services

Rungs 0 to 3 are identical for anything that speaks TCP. Only rung 5 changes:

| Service          | Rung 3 (port)        | Rung 5 (application)                                |
| ---------------- | -------------------- | --------------------------------------------------- |
| Postgres         | `nc -vz db 5432`     | `pg_isready -h db -p 5432`, then `psql`             |
| Redis            | `nc -vz cache 6379`  | `redis-cli -h cache ping` → `PONG`                  |
| Kafka / Redpanda | `nc -vz broker 9092` | `kcat -b broker:9092 -L` (lists brokers and topics) |
| RabbitMQ         | `nc -vz mq 5672`     | the management UI on port 15672                     |

Kafka has one extra trap: the broker you first contact replies with the **advertised address** of each broker, and the client then connects to _that_ address. If the advertised address is wrong (for example a container-internal hostname), rung 3 works against the bootstrap address but the real connections fail.

### Containers and Kubernetes

- **`localhost` inside a container means the container itself**, not your laptop and not the other containers. Containers on the same Docker network reach each other by service name (`db:5432`).
- A service inside a container that listens on `127.0.0.1` refuses connections from outside the container. It must listen on `0.0.0.0`.
- In Kubernetes, climb the ladder **from inside the cluster**. This starts a temporary pod with `dig`, `nc`, `curl`, `mtr` and more already installed:

```bash
kubectl run -it --rm debug --image=nicolaka/netshoot -- bash
```

---

## Quick lookup: symptom to rung

| Error message                                        | Rung | Look at                                                                               |
| ---------------------------------------------------- | ---- | ------------------------------------------------------------------------------------- |
| `Could not resolve host`, `ENOTFOUND`, `NXDOMAIN`    | 1    | DNS record, resolver, `/etc/hosts`                                                    |
| `No route to host`, `Network is unreachable`         | 0–2  | Your address, gateway, routes                                                         |
| `Connection timed out`, `ETIMEDOUT`                  | 2–3  | Firewall or security group, wrong IP                                                  |
| `Connection refused`, `ECONNREFUSED`                 | 3    | Service down, wrong port, bound to 127.0.0.1                                          |
| `Connection reset by peer`, `ECONNRESET`             | 3–5  | The server closed the connection mid-way: a crash, a proxy timeout, or a TLS mismatch |
| `certificate has expired`, `self-signed certificate` | 4    | Certificate renewal, CA trust                                                         |
| `401`, `403`, `404`                                  | 5    | Credentials, permissions, path                                                        |
| `502`, `503`, `504`                                  | 5    | The upstream behind the proxy                                                         |

---

## Check yourself

> [!question]- Your API logs `ECONNREFUSED 10.0.3.7:5432`. Is it more likely a firewall problem or a database problem?
> A database (or configuration) problem. "Refused" means a TCP reset came back, so the packets reached the machine. Most likely Postgres isn't running, is on another port, or is listening only on `127.0.0.1`.

> [!question]- `ping` to a cloud server gets no replies, but `curl https://…` to the same server works. Is the server down?
> No. Many cloud firewalls block ICMP. The TCP-based test is what matters, and it succeeded.

> [!question]- Your NestJS app in Docker connects to `localhost:5432` and fails, though Postgres runs in another container on the same Docker network. Why?
> Inside a container, `localhost` is the container itself. Connect to the Postgres container by its service name, for example `db:5432`.

> [!question]- A laptop shows the address `169.254.18.40`. Which rung fails, and which protocol do you investigate?
> Rung 0. A `169.254.x.x` address means [[DHCP]] did not get a lease.

> [!question]- Nginx returns `502 Bad Gateway`. Where do you run the ladder from?
> From the Nginx machine (or container) towards the upstream application it proxies to. The browser-to-Nginx path is already working.

---

## Recap

- Debug connectivity **bottom up**: address, name, route, port, TLS, application. Stop at the first rung that fails.
- **Refused** = reachable, nothing listening. **Timed out** = silently dropped or unreachable.
- `ping` failing proves little; `nc -vz` is the real reachability test.
- The same ladder works for every TCP service. Run it **from where the failing client runs**.

_Next: [[Latency Numbers]]: the System Design track begins with a feel for how long things take._

### References

1. Postel, J. _Internet Control Message Protocol._ RFC 792, IETF, September 1981. — Echo (ping) and Time Exceeded (traceroute).
2. Eddy, W. (ed.). _Transmission Control Protocol (TCP)._ RFC 9293, IETF, August 2022. §3.5.2 — Reset generation: when a host answers with RST.
3. Cheshire, S., Aboba, B., Guttman, E. _Dynamic Configuration of IPv4 Link-Local Addresses._ RFC 3927, IETF, May 2005. — Where `169.254.x.x` comes from.
4. Gregg, B. _Systems Performance: Enterprise and the Cloud._ 2nd ed., Addison-Wesley, 2020. Ch. 10 — Network analysis methodology and tools.
5. [mtr — a network diagnostic tool](https://github.com/traviscross/mtr)
6. [nicolaka/netshoot — a Docker and Kubernetes network troubleshooting container](https://github.com/nicolaka/netshoot)
7. [OpenSSL `s_client` documentation](https://docs.openssl.org/master/man1/openssl-s_client/)
