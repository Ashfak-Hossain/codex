---
title: Sieve of Eratosthenes
description: Finding every prime up to N — the cross-out idea, why the inner loop starts at p² , the O(N log log N) bound from Mertens' theorem, the O(N) linear sieve that also yields smallest prime factors, and a segmented sieve for ranges far past memory.
tags:
  - number-theory
  - math
date: 2026-05-16
---

To find the primes up to $N$, you could test each number one by one — that is what [[Primality Tests]] does. Around $240$ BC, Eratosthenes of Cyrene saw the cheaper move: don't hunt for primes, **erase the composites**. Every composite is a multiple of some smaller prime, so walk through the primes in order and strike out their multiples. Whatever is never struck is prime, for free — its primality was _proven_ by the absence of a crossing-out.

That inversion — generate instead of test — is what makes the sieve fast. Testing $N$ numbers individually costs a primality check each; the sieve shares all the work, spending only about $\log\log N$ operations per number on average. This page builds it from the cross-out idea to the $O(N)$ linear sieve and a segmented version that reaches primes far past what memory could hold.

_Prereqs: primes and divisibility._

---

## At a Glance

$$
\boxed{\ \text{cross out every multiple of every prime} \;\le\; \sqrt N \ }
$$

```cpp
// is_prime[i] = true  iff  i is prime, for all i in [0, n].
vector<bool> sieve(int n) {
  vector<bool> is_prime(n + 1, true);
  is_prime[0] = is_prime[1] = false;
  for (int p = 2; (int64_t)p * p <= n; p++)
    if (is_prime[p])                          // p survived => p is prime
      for (int m = p * p; m <= n; m += p)     // cross out p², p²+p, p²+2p, …
        is_prime[m] = false;
  return is_prime;
}
```

**Complexity:** $O(N \log\log N)$ time, $O(N)$ space — effectively linear.

---

## The Idea

Lay out the integers $2, 3, \dots, N$, all provisionally "prime". Sweep upward. The first untouched number is $2$ — prime — so cross out $4, 6, 8, \dots$. The next untouched is $3$ — prime — cross out its multiples. The next is $5$, and so on.

The invariant that makes this correct:

> When the sweep reaches $p$ and finds it **not yet crossed out**, $p$ is prime.

Why: if $p$ were composite, it would have a prime factor $q < p$, and the round for $q$ would already have crossed $p$ out. Surviving to its own turn uncrossed is a certificate of primality. Conversely every composite _is_ crossed — by (the round of) its smallest prime factor. So the survivors are exactly the primes.

### Two optimizations that are not optional

**Start the inner loop at $p^2$, not $2p$.** Any multiple $k p$ with $k < p$ has a prime factor smaller than $p$, so it was already struck in an earlier round. The first multiple that $p$ is the _first_ to reach is $p \cdot p$.

**Stop the outer loop at $\sqrt N$.** If $p > \sqrt N$ then $p^2 > N$, so the inner loop has nothing to cross. Every composite $\le N$ has a prime factor $\le \sqrt N$, so all of them are already gone by the time the outer loop stops.

---

## Trace: sieve up to 30

Each prime crosses out its multiples starting at $p^2$:

|              prime $p$ | $p^2$ | newly crossed (step $p$)                              |
| ---------------------: | ----: | :---------------------------------------------------- |
| ${\color{royalblue}2}$ |   $4$ | $4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30$ |
| ${\color{royalblue}3}$ |   $9$ | $9, 15, 21, 27$ (12, 18, 24, 30 already gone)         |
| ${\color{royalblue}5}$ |  $25$ | $25$ (15 already gone)                                |

The outer loop stops here: $7^2 = 49 > 30$. Whatever stands uncrossed is prime:

$$
{\color{crimson}2,\ 3,\ 5,\ 7,\ 11,\ 13,\ 17,\ 19,\ 23,\ 29}
$$

(The inner loop does re-touch a few already-crossed cells — harmless; `is_prime[m] = false` is idempotent.)

---

## Complexity

The cost is dominated by the inner loop. For a prime $p$, it runs from $p^2$ to $N$ in steps of $p$ — about $N/p$ iterations. Sum over all primes:

$$
\sum_{\substack{p \le \sqrt N \\ p \text{ prime}}} \frac{N}{p}
\;\le\;
N \sum_{p \le N} \frac{1}{p} .
$$

The sum of prime reciprocals is _not_ the harmonic series — it grows far slower. **Mertens' theorem** pins it down:

$$
\sum_{p \le N} \frac{1}{p} \;=\; \ln\ln N \;+\; M \;+\; o(1),
$$

with $M \approx 0.2615$ the Meissel–Mertens constant. Hence

$$
\text{total work} \;=\; O(N \log\log N).
$$

For all practical $N$, $\log\log N$ is below $6$ — the sieve is linear in everything but name. Space is one byte (or one bit) per number, $O(N)$.

> **Note — memory, not time, is the wall.** A `vector<bool>` packs $8$ flags per byte, so $N = 10^9$ needs $\approx 125$ MB; an odds-only sieve (skip even numbers entirely) halves both time and space. Past that, switch to the segmented sieve below.

---

## The Linear Sieve

$O(N \log\log N)$ has a small redundancy: a composite like $12$ is crossed by $2$ **and** by $3$. The **linear sieve** crosses every composite _exactly once_ — by its smallest prime factor — reaching a true $O(N)$, and as a bonus it fills in the smallest-prime-factor array `spf` that powers fast factorization.

```cpp
vector<int> linear_sieve(int n) {
  vector<int> spf(n + 1, 0);          // spf[i] = smallest prime factor of i
  vector<int> primes;
  for (int i = 2; i <= n; i++) {
    if (spf[i] == 0) {                // i untouched => i is prime
      spf[i] = i;
      primes.push_back(i);
    }
    for (int p : primes) {
      if (p > spf[i] || (int64_t)i * p > n) break;
      spf[i * p] = p;                 // p is the smallest prime factor of i*p
    }
  }
  return spf;
}
```

**Why each composite is hit once.** Write any composite $c$ as $c = p \cdot i$ where $p$ is its smallest prime factor. Then $p \le \operatorname{spf}(i)$, so when the outer index reaches that exact $i$, the inner loop runs $p$ (the `break` admits primes up to $\operatorname{spf}(i)$) and sets $\operatorname{spf}[c] = p$. No other $(i, p)$ pair produces $c$ — the factorization $c = p \cdot i$ with $p$ smallest is unique. Total inner iterations $\approx N$, so the running time is genuinely $O(N)$.

The plain sieve is simpler and usually fast enough; reach for the linear sieve when you also want `spf` (see [[Prime Factorization]]) or a multiplicative function tabulated alongside.

---

## The Segmented Sieve

To list primes in $[L, R]$ when $R$ is huge — say $R = 10^{12}$ — an array of size $R$ is impossible. But you never needed one: every composite in $[L, R]$ has a prime factor $\le \sqrt R$. So sieve the **small** primes up to $\sqrt R$ once, then use them to cross out a window $[L, R]$ that is only as large as the answer you want.

```cpp
vector<int64_t> segmented_sieve(int64_t L, int64_t R) {   // primes in [L, R]
  int64_t lim = (int64_t)sqrtl((long double)R) + 1;
  vector<char> small(lim + 1, true);
  vector<int64_t> base;
  for (int64_t p = 2; p <= lim; p++)
    if (small[p]) {
      base.push_back(p);
      for (int64_t q = p * p; q <= lim; q += p) small[q] = false;
    }

  vector<char> is_prime(R - L + 1, true);
  for (int64_t p : base)
    // first multiple of p that is >= L and >= p²
    for (int64_t q = max(p * p, ((L + p - 1) / p) * p); q <= R; q += p)
      is_prime[q - L] = false;

  vector<int64_t> primes;
  for (int64_t i = L; i <= R; i++)
    if (i >= 2 && is_prime[i - L]) primes.push_back(i);
  return primes;
}
```

**Memory:** $O(\sqrt R + (R - L))$ — independent of how large $R$ is, as long as the window $R - L$ is modest. This is how prime tables deep into the $10^{12}$–$10^{18}$ range are produced.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Input} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
n < 2 & \text{no primes} & \text{the smallest prime is } 2 \\[4pt]
0,\ 1 & \text{not prime} & \text{set } is\_prime[0]=is\_prime[1]=\text{false explicitly} \\[4pt]
2 & \text{prime} & \text{the only even prime} \\[4pt]
n = \text{prime} & is\_prime[n] = \text{true} & \text{never reached as a multiple} \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **Overflow in `p * p`.** For $n$ near $2 \times 10^9$, the product $p \cdot p$ overflows a 32-bit `int`. Cast to `int64_t` in the loop bound — the snippets above do.
- **Forgetting $0$ and $1$.** A fresh `is_prime` array is all-`true`; $0$ and $1$ must be cleared by hand or they leak into the output.
- **Memory before time.** The plain sieve dies at the array size, not the clock — estimate $N/8$ bytes first. Use the segmented sieve for large or shifted ranges.
- **One number, not a range.** To test a single large $n$, do **not** sieve up to $n$ — that is the [[Primality Tests|Miller–Rabin]] use case. The sieve pays off only when you want _many_ primes.

---

## References

1. Nicomachus of Gerasa. _Introduction to Arithmetic_, Book I, ch. 13. c. 100 AD. — The earliest surviving description of the sieve, crediting Eratosthenes (c. 240 BC).

2. Mertens, F. "Ein Beitrag zur analytischen Zahlentheorie." _Journal für die reine und angewandte Mathematik_, vol. 78, 1874, pp. 46–62. — Proof that $\sum_{p \le N} 1/p = \ln\ln N + M + o(1)$, the bound behind $O(N\log\log N)$.

3. Gries, D., Misra, J. "A Linear Sieve Algorithm for Finding Prime Numbers." _Communications of the ACM_, vol. 21, no. 12, 1978, pp. 999–1003. — The $O(N)$ linear sieve.

4. Crandall, R., Pomerance, C. _Prime Numbers: A Computational Perspective_, 2nd ed. Springer, 2005. §3.2–3.3 — Sieving in practice, including segmented and wheel sieves.

5. [CP Algorithms — Sieve of Eratosthenes](https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html)
