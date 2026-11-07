---
title: Callout demo
description: Draft demo of the notebook's callout set. Not published; Quartz only builds content/.
---

Every callout type in the set, using the Networking track's parcel world. Switch themes with the sun and moon button at the top left. Use Tab, then Enter or Space, to open and close the collapsible ones.

## Each type with its default title

> [!plain]
> Your data gets wrapped in layers before it leaves your laptop. Each layer does one job and trusts the layer below it to do the rest.

> [!analogy]
> Picture a letter inside a locked box, inside a numbered parcel, with an address label on the outside, riding in a van. Each wrapping has one job, and the van driver never opens the box.

> [!aha]
> Only the two endpoints open every layer. Routers in between open only the bottom two or three.

> [!pitfall]
> A MAC address only gets a packet to the next machine. It changes at every hop, while the IP address stays the same from end to end. (Network address translation, or NAT, is the exception, and it gets its own page later.)

> [!try]
> Ask your computer which way it would send a packet to `1.1.1.1`:
>
> ```bash
> # Linux
> ip route get 1.1.1.1
> # macOS
> route get 1.1.1.1
> ```
>
> Notice the gateway in the output. That's the first stop on the packet's journey.

> [!deeper]-
> An Ethernet header is 14 bytes. An IPv4 header is at least 20 bytes and a TCP header is at least 20 bytes. On a link that carries 1500 bytes of IP packet, that leaves at most 1460 bytes for your data.
>
> See [RFC 791](https://www.rfc-editor.org/rfc/rfc791) and [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293).

> [!question]- Does a router on the way read your HTTP request?
> No. It opens the link and network layers to decide where to send the packet next, and leaves everything inside alone. With TLS on, the request is encrypted anyway.

## With your own title

> [!aha] Layers turn a product into a sum
> With A applications and N kinds of network, you'd otherwise need A × N implementations. With a shared middle layer you need A + N.

> [!deeper]- A long title that has to wrap onto a second line on a phone, to check that the icon and the arrow stay in place
> The body of a collapsed callout stays out of the Tab order until you open it, like this link to [RFC 1122](https://www.rfc-editor.org/rfc/rfc1122).

## Rich content inside

> [!plain] A list and inline code
> Three things every host needs:
>
> - an address, such as `192.168.0.12`
> - a way out, called the default gateway
> - a way to look up names, called DNS

> [!pitfall] A table
> | Symptom | Likely cause |
> | ------------------ | ------------------ |
> | Can't reach a name | DNS |
> | Can't reach an IP | Routing or gateway |

The last section sits under a normal paragraph, so you can compare callout text with body text.
