---
title: Glossary
description: "Every networking term in the notebook, in plain words. Hover over a link anywhere to see its entry."
tags:
  - glossary
---

Every term the notebook uses, explained in plain words, each with an analogy and the page that teaches it properly. Anywhere in the notebook, hover over a linked term to see its entry without leaving the page.

## A

- [[ACK]]: A reply that confirms something arrived.
- [[ALPN]]: How client and server agree, during the TLS handshake, which application protocol to speak, such as HTTP/2.
- [[Application layer]]: The top layer, where programs speak their own protocol, such as HTTP or DNS.
- [[ARP]]: Finds the MAC address that belongs to an IP address on your network. Has its own page.
- [[ARP cache]]: A machine's short-term memory of which MAC address belongs to which IP address on its network.
- [[ARP spoofing]]: An attack that sends fake ARP replies so traffic meant for one machine goes to the attacker.

## B

- [[BOOTP]]: DHCP's older predecessor; DHCP messages still use its format.
- [[Broadcast]]: A message sent to every machine on the local network at once.
- [[Byte stream]]: What TCP gives a program: an ordered flow of bytes, with no built-in message boundaries.

## C

- [[CDN]]: A network of servers around the world that keeps copies of a site's content close to its readers.
- [[Certificate]]: A signed document that ties a website's name to a public key, so the browser can check it's talking to the real site.
- [[Certificate authority]]: An organisation whose signature on a certificate browsers trust.
- [[Connection refused]]: An immediate "no" from the other machine: it's there, but nothing is listening on that port.

## D

- [[Default gateway]]: The router a machine sends packets to when the destination isn't on its own network.
- [[DHCP]]: Gives a machine its IP address, gateway and DNS servers when it joins a network. Has its own page.
- [[DHCP snooping]]: A switch feature that only lets DHCP server replies in from trusted ports and records who got which address.
- [[DHCP starvation]]: An attack that uses up every address in a DHCP pool with fake requests.
- [[DNS]]: The internet's phone book: it turns names like ashfak.dev into IP addresses.
- [[DORA]]: The four DHCP messages: Discover, Offer, Request, Acknowledge.
- [[Dynamic ARP Inspection]]: A switch feature that drops ARP replies that don't match the addresses DHCP handed out.

## E

- [[Encapsulation]]: Each layer wrapping the data in its own header on the way down, and unwrapping it on the way up.
- [[Ephemeral port]]: A temporary port number the operating system picks for the client end of a connection.

## F

- [[Frame]]: The unit the link layer sends: data wrapped with a link header that names the next machine's MAC address.
- [[Framing]]: How a program marks where each message starts and ends inside a byte stream.

## G

- [[Gratuitous ARP]]: An ARP message a machine sends about its own address without being asked.

## H

- [[Handshake]]: The first messages two sides exchange to agree on a connection before real data flows.
- [[Header]]: A small block of information a layer puts in front of the data: addresses, lengths, numbers.
- [[HSTS]]: A rule a site gives browsers: "only ever reach me over HTTPS".
- [[HTTP]]: The web's request-and-response protocol: a browser asks for a resource, a server answers with a status and content.
- [[HTTPS]]: HTTP sent inside a TLS-encrypted connection, normally on port 443.

## I

- [[ICMP]]: IP's messenger for errors and tests, such as "destination unreachable"; ping uses it.
- [[IETF]]: The open group of engineers that develops internet standards and publishes them as RFCs.
- [[IP]]: The internet's network-layer protocol: it carries packets from a source address to a destination address.
- [[IP address]]: A number that identifies a machine's network connection, so packets can be sent to it from anywhere.

## L

- [[Layer]]: One level of the networking stack, with one job, trusting the level below for everything else.
- [[Lease]]: The time-limited loan of an IP address that a DHCP server gives a machine.
- [[Link layer]]: The bottom layer, which moves a frame one hop, to the next machine on the same network.
- [[Link-local address]]: An address a machine gives itself, starting with 169.254, when it can't get one from DHCP.
- [[Load balancer]]: A machine that spreads incoming connections or requests across several servers.

## M

- [[MAC address]]: A 48-bit hardware address that gets a frame to the next machine on the same network.
- [[Man-in-the-middle]]: An attacker who secretly sits between two parties and can read or change what they send.

## N

- [[NAT]]: Rewriting addresses at the router so many devices can share one public IPv4 address.
- [[Network interface]]: The hardware or virtual device a machine uses to connect to a network, such as a Wi-Fi card.
- [[Network layer]]: The layer that carries packets from one network to another using IP addresses.

## O

- [[OSI model]]: A seven-layer reference model for networking; the real internet uses a simpler model that maps onto it.

## P

- [[Packet]]: The unit the network layer sends: data wrapped in an IP header with the source and destination addresses.
- [[Port]]: A number from 0 to 65535 that picks which program on a machine gets the data.
- [[Port security]]: A switch feature that limits which or how many MAC addresses can use a port.
- [[Proxy ARP]]: A router answering ARP questions on behalf of machines on another network.

## Q

- [[QUIC]]: A transport protocol over UDP that combines the connection and TLS handshakes; HTTP/3 runs on it.

## R

- [[Relay agent]]: A router that forwards DHCP broadcasts to a DHCP server on another network.
- [[RFC]]: A numbered document that defines an internet standard, such as RFC 791 for IP.
- [[Rogue DHCP server]]: An unauthorised DHCP server that hands out wrong settings, such as the attacker as gateway.
- [[Round trip]]: The time for a message to reach the other end and the reply to come back.
- [[Router]]: A device that forwards packets between networks, choosing the next hop from the destination IP address.

## S

- [[Security layer]]: In this notebook's model, the layer that encrypts the data and proves who the server is, usually TLS.
- [[Segment]]: A piece of a TCP byte stream with a TCP header holding ports and sequence numbers.
- [[Sequence number]]: The number TCP gives each byte, so the receiver can put data in order and spot gaps.
- [[SNI]]: The site name a browser sends at the start of TLS, so a server hosting many sites picks the right certificate.
- [[Subnet mask]]: Says which part of an IP address names the network and which part names the machine.
- [[Switch]]: A device that connects machines in one network and forwards frames by MAC address.

## T

- [[TCP]]: The transport protocol that gives programs a reliable, ordered byte stream over an unreliable network.
- [[Timed out]]: No answer at all before the wait ran out: something on the way dropped the packets, or the machine is down.
- [[TLS]]: The protocol that encrypts a connection and proves the server's identity with a certificate.
- [[Transport layer]]: The layer that gets data to the right program on a machine and, with TCP, delivers it complete and in order.
- [[TTL]]: A countdown that limits how long something lives: router hops for an IP packet, seconds for a cached DNS answer.

## U

- [[UDP]]: A lightweight transport protocol that sends separate messages with no handshake and no delivery promise.
- [[Unicast]]: A message sent from one machine to exactly one other machine.
- [[URL]]: A web address: the scheme, the host name and the path, such as https://ashfak.dev/notes.
