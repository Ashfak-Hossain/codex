// Interactive widgets for notebook pages. A note embeds one with a placeholder:
//   <div class="nbw" data-widget="packet-journey"></div>

type LayerKey = "app" | "tls" | "tcp" | "net" | "link"

const LNAME: Record<LayerKey, string> = {
  app: "Application",
  tls: "Security",
  tcp: "Transport",
  net: "Network",
  link: "Link",
}
const ORDER: LayerKey[] = ["app", "tls", "tcp", "net", "link"]

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/* ------------------------------------------------------------------ */
/* packet-journey                                                     */
/* ------------------------------------------------------------------ */

interface JNode {
  name: string
  sub: string
  layers: LayerKey[]
}
interface JStep {
  node: number
  lit: LayerKey
  wraps: LayerKey[]
  src: string
  ttl: number
  link: string
  t: string
  p: string
  m: string
}

const NODES: JNode[] = [
  { name: "Your laptop", sub: "192.168.0.12", layers: ORDER },
  { name: "Home router", sub: "Wi-Fi to fibre", layers: ["net", "link"] },
  { name: "ISP router", sub: "Dhaka", layers: ["net", "link"] },
  { name: "Edge router", sub: "Singapore", layers: ["net", "link"] },
  { name: "Server", sub: "104.21.x.x :443", layers: ORDER },
]

const PLAIN = "GET / HTTP/1.1\nHost: ashfak.dev\nAccept: text/html"
const CIPHER = "9f 3a c1 07 e4 5b 22 d8 0c 71 af 3e 98 b2 4d 61 … (GET / is in here, unreadable)"

const STEPS: JStep[] = [
  {
    node: 0,
    lit: "app",
    wraps: ["app"],
    src: "192.168.0.12",
    ttl: 64,
    link: "",
    t: "The browser writes the message",
    p: "This is the only part anyone actually wrote. Everything that happens next is wrapping and unwrapping envelopes around these few bytes.",
    m: "The letter, written in a language both of you read.",
  },
  {
    node: 0,
    lit: "tls",
    wraps: ["tls", "app"],
    src: "192.168.0.12",
    ttl: 64,
    link: "",
    t: "TLS encrypts and seals it",
    p: "The keys were agreed during the TLS handshake. From now on nobody on the path can read the request, and if anyone changes a single bit, the seal check fails at the other end.",
    m: "The letter goes into a locked box. Only your friend has the key.",
  },
  {
    node: 0,
    lit: "tcp",
    wraps: ["tcp", "tls", "app"],
    src: "192.168.0.12",
    ttl: 64,
    link: "",
    t: "TCP adds ports and a sequence number",
    p: "The destination port (443) says which program on the server gets this. The sequence number says which piece of the byte stream it is. The laptop keeps a copy until the server acknowledges it.",
    m: "The box is numbered, the flat number is written on it, and you want a signed receipt.",
  },
  {
    node: 0,
    lit: "net",
    wraps: ["net", "tcp", "tls", "app"],
    src: "192.168.0.12",
    ttl: 64,
    link: "",
    t: "IP adds the from and to addresses",
    p: "Your source address came from DHCP. The destination is the server's address, which DNS supplied, and it will not change for the whole trip. TTL starts at 64 and drops by one at every router, so a packet caught in a loop eventually dies.",
    m: "The building address goes on the label.",
  },
  {
    node: 0,
    lit: "link",
    wraps: ["link", "net", "tcp", "tls", "app"],
    src: "192.168.0.12",
    ttl: 64,
    link: "Wi-Fi frame · laptop MAC → home router MAC",
    t: "Wi-Fi wraps it in a frame for the next hop",
    p: "The frame is addressed to your home router, not the server: the link layer only ever reaches the next machine. The laptop learned the router's MAC address with ARP.",
    m: "A rickshaw takes the parcel to the local post office. The driver only knows that one trip.",
  },
  {
    node: 1,
    lit: "net",
    wraps: ["link", "net", "tcp", "tls", "app"],
    src: "your public IP (NAT)",
    ttl: 63,
    link: "Fibre frame · home router MAC → ISP router MAC",
    t: "Home router: unwrap, read IP, rewrap",
    p: "It throws away the Wi-Fi frame, reads only the IP header and checks its routing table: not local, so send it to the ISP. One exception to 'IP never changes': NAT rewrites your private source address to your public one. Then it builds a brand new frame for the fibre link.",
    m: "The post office reads the address and puts the parcel on a truck. New vehicle, same label.",
  },
  {
    node: 2,
    lit: "net",
    wraps: ["link", "net", "tcp", "tls", "app"],
    src: "your public IP (NAT)",
    ttl: 62,
    link: "Frame · ISP router MAC → next router MAC",
    t: "ISP router: the same job again",
    p: "Unwrap the frame, read the destination IP, pick the next hop toward Singapore, decrement TTL, rewrap. It never opens TCP and cannot see inside TLS. Real paths have ten to twenty hops like this.",
    m: "A sorting centre. It reads only the label.",
  },
  {
    node: 3,
    lit: "link",
    wraps: ["link", "net", "tcp", "tls", "app"],
    src: "your public IP (NAT)",
    ttl: 61,
    link: "Ethernet frame · edge router MAC → server MAC",
    t: "Edge router: the last hop",
    p: "This router knows the server is on its own local network, so it resolves the server's MAC address with ARP and addresses this final frame directly to it.",
    m: "The last delivery van, addressed to the building's door.",
  },
  {
    node: 4,
    lit: "link",
    wraps: ["net", "tcp", "tls", "app"],
    src: "your public IP (NAT)",
    ttl: 61,
    link: "",
    t: "Server: the frame is for me",
    p: "The network card sees its own MAC address as the destination, strips the frame and passes the packet up.",
    m: "The parcel is off the van.",
  },
  {
    node: 4,
    lit: "net",
    wraps: ["tcp", "tls", "app"],
    src: "",
    ttl: 0,
    link: "",
    t: "Server: the IP address is mine",
    p: "The kernel sees its own IP as the destination, strips the IP header and passes the segment to TCP.",
    m: "Right building.",
  },
  {
    node: 4,
    lit: "tcp",
    wraps: ["tls", "app"],
    src: "",
    ttl: 0,
    link: "",
    t: "Server TCP: right program, right order",
    p: "Port 443 tells the kernel which process gets these bytes. Sequence numbers put pieces back in order and drop duplicates. An ACK goes back, so your laptop can delete its copy.",
    m: "The right flat. Your friend signs the receipt and the courier stops worrying.",
  },
  {
    node: 4,
    lit: "tls",
    wraps: ["app"],
    src: "",
    ttl: 0,
    link: "",
    t: "Server TLS: check the seal, decrypt",
    p: "The authentication tag is verified first. If even one bit changed on the way, the check fails and the connection is torn down. Otherwise the record is decrypted.",
    m: "Your friend unlocks the box and checks the seal is unbroken.",
  },
  {
    node: 4,
    lit: "app",
    wraps: ["app"],
    src: "",
    ttl: 0,
    link: "",
    t: "The web server reads GET /",
    p: "Exactly the bytes your browser wrote, no more and no less. The response now makes the same journey in reverse.",
    m: "Your friend reads the letter, and writes back.",
  },
]

function header(k: LayerKey, s: JStep): string {
  switch (k) {
    case "app":
      return "HTTP message"
    case "tls":
      return "TLS record · application data · sealed with an auth tag"
    case "tcp":
      return "src port 52814 → dst port 443 · seq 1001 · ack 5001"
    case "net":
      return "src " + s.src + " → dst 104.21.x.x · TTL " + s.ttl
    case "link":
      return s.link
  }
}

function parseSteps(attr: string | undefined): number[] {
  const all = STEPS.map((_, i) => i)
  if (!attr) return all
  const out: number[] = []
  for (const part of attr.split(",")) {
    const [a, b] = part.split("-").map((x) => parseInt(x.trim(), 10))
    if (Number.isNaN(a)) continue
    const end = Number.isNaN(b) || b === undefined ? a : b
    for (let i = a; i <= end; i++) if (i >= 0 && i < STEPS.length) out.push(i)
  }
  return out.length ? out : all
}

function mountJourney(root: HTMLElement) {
  const steps = parseSteps(root.dataset.steps)
  root.innerHTML =
    '<div class="nbw-route">' +
    NODES.map(
      (n, i) =>
        '<div class="nbw-node" data-i="' +
        i +
        '"><div class="nbw-nname">' +
        n.name +
        '</div><div class="nbw-nsub">' +
        n.sub +
        '</div><div class="nbw-mini">' +
        ORDER.map(
          (k) =>
            '<span class="nbw-L-' +
            k +
            (n.layers.includes(k) ? "" : " nbw-gone") +
            '" data-k="' +
            k +
            '">' +
            LNAME[k] +
            "</span>",
        ).join("") +
        "</div></div>",
    ).join("") +
    "</div>" +
    '<div class="nbw-controls"><button class="nbw-btn" data-act="prev">Back</button>' +
    '<button class="nbw-btn nbw-primary" data-act="next">Next step</button>' +
    '<button class="nbw-btn" data-act="play" aria-pressed="false">Play</button>' +
    '<div class="nbw-progress"><i></i></div><span class="nbw-count"></span></div>' +
    '<div class="nbw-jbody"><div><div class="nbw-cap">On the wire right now</div><div class="nbw-env"></div></div>' +
    '<div class="nbw-narr" aria-live="polite"></div></div>'

  let pos = 0
  let lastWraps: LayerKey[] = []
  let lastLink = ""
  let timer: number | undefined

  const envEl = root.querySelector(".nbw-env") as HTMLElement
  const narrEl = root.querySelector(".nbw-narr") as HTMLElement
  const countEl = root.querySelector(".nbw-count") as HTMLElement
  const barEl = root.querySelector(".nbw-progress i") as HTMLElement
  const playBtn = root.querySelector('[data-act="play"]') as HTMLButtonElement

  function draw() {
    const s = STEPS[steps[pos]]
    root.querySelectorAll<HTMLElement>(".nbw-node").forEach((el) => {
      const i = Number(el.dataset.i)
      el.classList.toggle("nbw-here", i === s.node)
      el.querySelectorAll<HTMLElement>(".nbw-mini span").forEach((sp) => {
        const k = sp.dataset.k as LayerKey
        sp.classList.remove("nbw-on", "nbw-lit")
        if (i === s.node && NODES[i].layers.includes(k)) {
          sp.classList.add(k === s.lit ? "nbw-lit" : "nbw-on")
        }
      })
    })
    const sealed = s.wraps.includes("tls")
    let html = ""
    let close = ""
    for (const k of s.wraps) {
      const fresh = !lastWraps.includes(k) || (k === "link" && s.link !== lastLink)
      const cls = "nbw-envbox nbw-L-" + k + (fresh ? " nbw-fresh" : "")
      if (k === "app") {
        html +=
          '<div class="' +
          cls +
          '"><div class="nbw-h"><b>APPLICATION</b>' +
          header(k, s) +
          '</div><div class="nbw-payload' +
          (sealed ? " nbw-cipher" : "") +
          '">' +
          esc(sealed ? CIPHER : PLAIN).replace(/\n/g, "<br>") +
          "</div></div>"
      } else {
        html +=
          '<div class="' +
          cls +
          '"><div class="nbw-h"><b>' +
          LNAME[k].toUpperCase() +
          "</b>" +
          esc(header(k, s)) +
          "</div>"
        close += "</div>"
      }
    }
    envEl.innerHTML = html + close
    lastWraps = s.wraps.slice()
    lastLink = s.link
    narrEl.innerHTML =
      '<div class="nbw-meta">at: ' +
      NODES[s.node].name +
      " · layer: " +
      LNAME[s.lit] +
      "</div><h4>" +
      s.t +
      "</h4><p>" +
      s.p +
      '</p><div class="nbw-metaphor"><b>The parcel:</b> ' +
      s.m +
      "</div>"
    countEl.textContent = pos + 1 + " / " + steps.length
    barEl.style.width = ((pos + 1) / steps.length) * 100 + "%"
  }

  function stop() {
    if (timer !== undefined) window.clearInterval(timer)
    timer = undefined
    playBtn.setAttribute("aria-pressed", "false")
    playBtn.textContent = "Play"
  }

  function onClick(e: Event) {
    const btn = (e.target as HTMLElement).closest("button")
    if (!btn) return
    const act = btn.dataset.act
    if (act === "next") {
      if (pos === steps.length - 1) {
        pos = 0
        lastWraps = []
      } else pos++
      draw()
    } else if (act === "prev") {
      pos = Math.max(0, pos - 1)
      draw()
    } else if (act === "play") {
      if (timer !== undefined) return stop()
      if (pos === steps.length - 1) {
        pos = 0
        lastWraps = []
        draw()
      }
      playBtn.setAttribute("aria-pressed", "true")
      playBtn.textContent = "Pause"
      timer = window.setInterval(() => {
        if (pos >= steps.length - 1) return stop()
        pos++
        draw()
      }, 3400)
    }
  }

  root.addEventListener("click", onClick)
  draw()
  window.addCleanup(() => {
    stop()
    root.removeEventListener("click", onClick)
  })
}

/* ------------------------------------------------------------------ */
/* tcp-sim                                                            */
/* ------------------------------------------------------------------ */

interface Pkt {
  kind: "data" | "ack"
  seq: number
  el: HTMLButtonElement
  t0: number
  dur: number
  dead: boolean
}

function mountTcpSim(root: HTMLElement) {
  const N = 6
  const slots = (cls: string) =>
    '<div class="nbw-slots ' +
    cls +
    '">' +
    Array.from({ length: N }, (_, i) => '<div class="nbw-slot">' + (i + 1) + "</div>").join("") +
    "</div>"
  root.innerHTML =
    '<div class="nbw-controls"><button class="nbw-btn nbw-primary" data-act="send">Send 6 segments</button>' +
    '<button class="nbw-btn" data-act="reset">Reset</button>' +
    '<label class="nbw-check"><input type="checkbox" class="nbw-chaos"> Chaotic network (random delays)</label></div>' +
    '<div class="nbw-simgrid">' +
    '<div class="nbw-endbox"><div class="nbw-t">Sender</div><div class="nbw-lbl">segment state</div>' +
    slots("nbw-snd") +
    '<div class="nbw-lbl">keeps a copy until ACKed</div></div>' +
    '<div class="nbw-lane"><div class="nbw-track" style="top:6px">data segments →</div><div class="nbw-track" style="top:70px">← acknowledgements</div></div>' +
    '<div class="nbw-endbox"><div class="nbw-t">Receiver</div><div class="nbw-lbl">reorder buffer</div>' +
    slots("nbw-rcv") +
    '<div class="nbw-lbl">delivered to the app, in order</div><div class="nbw-appout"></div></div>' +
    "</div>" +
    '<div class="nbw-counters">' +
    ["sent:segments sent", "lost:destroyed by you", "retx:retransmits", "dup:duplicates ignored"]
      .map((x) => {
        const [k, l] = x.split(":")
        return '<div class="nbw-counter"><b data-c="' + k + '">0</b><span>' + l + "</span></div>"
      })
      .join("") +
    "</div>" +
    '<div class="nbw-log" aria-live="polite"></div>'

  const lane = root.querySelector(".nbw-lane") as HTMLElement
  const logEl = root.querySelector(".nbw-log") as HTMLElement
  const chaos = root.querySelector(".nbw-chaos") as HTMLInputElement
  const appOut = root.querySelector(".nbw-appout") as HTMLElement

  let pk: Pkt[] = []
  let acked: Record<number, boolean> = {}
  let lastSent: Record<number, number> = {}
  let rcv: Record<number, boolean> = {}
  let next = 1
  let queue: { seq: number; at: number }[] = []
  let c = { sent: 0, lost: 0, retx: 0, dup: 0 }
  let done = false
  let raf = 0

  const slot = (side: string, seq: number) =>
    root.querySelectorAll<HTMLElement>("." + side + " .nbw-slot")[seq - 1]
  const setSlot = (side: string, seq: number, cls: string) => {
    const el = slot(side, seq)
    if (el) el.className = "nbw-slot" + (cls ? " " + cls : "")
  }
  const counters = () =>
    root.querySelectorAll<HTMLElement>("[data-c]").forEach((b) => {
      b.textContent = String(c[b.dataset.c as keyof typeof c])
    })
  const log = (msg: string, cls?: string) => {
    const d = document.createElement("div")
    if (cls) d.className = cls
    d.textContent = msg
    logEl.appendChild(d)
    logEl.scrollTop = logEl.scrollHeight
  }
  const travel = () => (chaos.checked ? 1700 + Math.random() * 2600 : 2600)

  function reset() {
    cancelAnimationFrame(raf)
    raf = 0
    lane.querySelectorAll(".nbw-pkt").forEach((p) => p.remove())
    pk = []
    acked = {}
    lastSent = {}
    rcv = {}
    next = 1
    queue = []
    c = { sent: 0, lost: 0, retx: 0, dup: 0 }
    done = false
    for (let s = 1; s <= N; s++) {
      setSlot("nbw-snd", s, "")
      setSlot("nbw-rcv", s, "")
    }
    appOut.textContent = ""
    logEl.innerHTML = ""
    log('Press "Send 6 segments", then click packets in flight to destroy them.')
    counters()
  }

  function spawn(kind: "data" | "ack", seq: number, retx: boolean) {
    const el = document.createElement("button")
    el.className = "nbw-pkt " + (kind === "data" ? "nbw-data" : "nbw-ackp")
    el.textContent = kind === "data" ? "#" + seq : "ACK " + seq
    el.setAttribute(
      "aria-label",
      (kind === "data" ? "Segment " : "Acknowledgement ") + seq + ", click to destroy",
    )
    el.style.left = (kind === "data" ? 6 : 94) + "%"
    lane.appendChild(el)
    const p: Pkt = { kind, seq, el, t0: performance.now(), dur: travel(), dead: false }
    el.addEventListener("click", () => {
      if (p.dead) return
      p.dead = true
      c.lost++
      counters()
      el.classList.add("nbw-lost")
      log(
        kind === "data"
          ? "✕ You destroyed segment #" + seq + ". The receiver will never see it."
          : "✕ You destroyed ACK " + seq + ". The segment arrived, but the sender doesn't know.",
        "nbw-bad",
      )
      window.setTimeout(() => el.remove(), 900)
      pk = pk.filter((x) => x !== p)
    })
    pk.push(p)
    if (kind === "data") {
      c.sent++
      lastSent[seq] = performance.now()
      if (!acked[seq]) setSlot("nbw-snd", seq, "nbw-fly")
      if (retx) c.retx++
      counters()
    }
  }

  function arrive(p: Pkt) {
    p.el.remove()
    pk = pk.filter((x) => x !== p)
    const s = p.seq
    if (p.kind === "data") {
      if (rcv[s]) {
        c.dup++
        counters()
        log(
          "⟳ Duplicate #" + s + " arrived. Already have it → thrown away, ACK sent again.",
          "nbw-warn",
        )
      } else {
        rcv[s] = true
        if (s > next)
          log("→ #" + s + " arrived but #" + next + " is missing. Held in the buffer.", "nbw-warn")
        else log("→ #" + s + " arrived in order.")
        while (rcv[next]) next++
        for (let i = 1; i <= N; i++)
          if (rcv[i]) setSlot("nbw-rcv", i, i < next ? "nbw-del" : "nbw-buf")
        appOut.textContent = Array.from({ length: next - 1 }, (_, i) => i + 1).join(" ")
      }
      spawn("ack", s, false)
    } else if (!acked[s]) {
      acked[s] = true
      setSlot("nbw-snd", s, "nbw-ack")
      log("✓ ACK " + s + " received. Sender deletes its copy of #" + s + ".", "nbw-ok")
    }
  }

  function tick(now: number) {
    for (const p of pk.slice()) {
      if (p.dead) continue
      const f = Math.min(1, (now - p.t0) / p.dur)
      p.el.style.left = (p.kind === "data" ? 6 + f * 88 : 94 - f * 88) + "%"
      if (f >= 1) arrive(p)
    }
    if (queue.length && now >= queue[0].at) spawn("data", queue.shift()!.seq, false)
    const rto = chaos.checked ? 9500 : 6500
    for (let s = 1; s <= N; s++) {
      if (lastSent[s] && !acked[s] && now - lastSent[s] > rto) {
        log("⏱ No ACK for #" + s + " within the timeout → retransmit.", "nbw-warn")
        spawn("data", s, true)
      }
    }
    let all = true
    for (let s = 1; s <= N; s++) if (!acked[s]) all = false
    if (all && !done && next > N) {
      done = true
      log(
        "✓ Done. The app received 1 2 3 4 5 6, in order, each exactly once" +
          (c.lost
            ? ", even though " + c.lost + " packet" + (c.lost > 1 ? "s were" : " was") + " lost"
            : "") +
          (c.dup ? " and " + c.dup + " duplicate" + (c.dup > 1 ? "s" : "") + " arrived" : "") +
          ".",
        "nbw-ok",
      )
    }
    raf = !done || pk.length ? requestAnimationFrame(tick) : 0
  }

  function onClick(e: Event) {
    const btn = (e.target as HTMLElement).closest("button")
    if (!btn || !btn.dataset.act) return
    if (btn.dataset.act === "reset") reset()
    if (btn.dataset.act === "send") {
      reset()
      logEl.innerHTML = ""
      const now = performance.now()
      for (let s = 1; s <= N; s++) queue.push({ seq: s, at: now + (s - 1) * 420 })
      log("Sending #1 to #6. Each one is kept until its ACK comes back.")
      raf = requestAnimationFrame(tick)
    }
  }

  root.addEventListener("click", onClick)
  reset()
  window.addCleanup(() => {
    cancelAnimationFrame(raf)
    root.removeEventListener("click", onClick)
  })
}

/* ------------------------------------------------------------------ */
/* latency-scale                                                      */
/* ------------------------------------------------------------------ */

const LAT: [string, string, number, string, LayerKey][] = [
  ["Read from CPU L1 cache", "~1 ns", 1, "1 second", "app"],
  ["Read from main memory (RAM)", "~100 ns", 100, "1.7 minutes", "app"],
  ["Random read from an SSD", "~100 µs", 1e5, "1.2 days", "tcp"],
  ["Round trip inside one data centre", "~0.5 ms", 5e5, "5.8 days", "tcp"],
  ["Round trip Dhaka → Singapore", "~60 ms", 6e7, "1.9 years", "net"],
  ["Cold HTTPS request to Singapore (~4 round trips)", "~240 ms", 2.4e8, "7.6 years", "tls"],
  ["Round trip Dhaka → US west coast", "~250 ms", 2.5e8, "7.9 years", "net"],
]

function mountLatency(root: HTMLElement) {
  const maxL = Math.log10(3e8)
  let human = true
  root.innerHTML =
    '<div class="nbw-controls"><button class="nbw-btn" data-act="toggle" aria-pressed="true">Showing: 1 ns stretched to 1 s</button></div>' +
    '<div class="nbw-lat">' +
    LAT.map(
      (r) =>
        '<div class="nbw-latrow nbw-L-' +
        r[4] +
        '"><div class="nbw-what">' +
        r[0] +
        '</div><div class="nbw-bar"><i style="width:' +
        Math.max(3, ((Math.log10(r[2]) + 0.3) / (maxL + 0.3)) * 100).toFixed(1) +
        '%"></i></div><div class="nbw-human" data-real="' +
        r[1] +
        '" data-human="' +
        r[3] +
        '">' +
        r[3] +
        "</div></div>",
    ).join("") +
    '</div><div class="nbw-cap">Log scale: each step to the right is roughly ten times slower. Typical values, rounded.</div>'

  function onClick(e: Event) {
    const btn = (e.target as HTMLElement).closest("button")
    if (!btn) return
    human = !human
    btn.setAttribute("aria-pressed", String(human))
    btn.textContent = human ? "Showing: 1 ns stretched to 1 s" : "Showing: real time"
    root.querySelectorAll<HTMLElement>(".nbw-human").forEach((el) => {
      el.textContent = (human ? el.dataset.human : el.dataset.real) ?? ""
    })
  }
  root.addEventListener("click", onClick)
  window.addCleanup(() => root.removeEventListener("click", onClick))
}

/* ------------------------------------------------------------------ */

const MOUNTS: Record<string, (el: HTMLElement) => void> = {
  "packet-journey": mountJourney,
  "tcp-sim": mountTcpSim,
  "latency-scale": mountLatency,
}

document.addEventListener("nav", () => {
  document.querySelectorAll<HTMLElement>(".nbw[data-widget]").forEach((el) => {
    const mount = MOUNTS[el.dataset.widget ?? ""]
    if (mount) mount(el)
  })
})
