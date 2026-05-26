---
title: Prime Factorization
description: Breaking n into its prime building blocks — the Fundamental Theorem of Arithmetic, trial division and its √n wall, and a smallest-prime-factor sieve for fast batch queries.
tags:
  - number-theory
  - math
date: 2026-05-16
---

Multiplying two primes is instant. Recovering them from the product is not — and that lopsidedness is not a quirk, it is a load-bearing wall. RSA encrypts behind a number $n = pq$ that anyone can see; its safety is the bet that no one can pull $p$ and $q$ back out.

**Prime factorization** is that reverse direction: write $n$ as a product of primes. Every integer has exactly one such form — the primes are its atoms — so factoring is, in a sense, learning what a number _is_. This page goes from the theorem that guarantees the factorization exists, through trial division, to a sieve that factors many small numbers in one preprocessing pass.

_Prereqs: divisibility and primes · [[Primality Tests]] · [[Greatest Common Divisor]]._

---

## At a Glance

$$
\boxed{\ n \;=\; p_1^{a_1}\, p_2^{a_2} \cdots p_r^{a_r} \qquad\text{— unique up to ordering}\ }
$$

```cpp
// Trial division: every prime factor and its exponent, in O(√n).
vector<pair<int64_t,int>> factorize(int64_t n) {
  vector<pair<int64_t,int>> f;
  for (int64_t d = 2; d * d <= n; d++) {
    if (n % d == 0) {
      int e = 0;
      while (n % d == 0) n /= d, e++;     // strip every copy of d
      f.push_back({d, e});
    }
  }
  if (n > 1) f.push_back({n, 1});         // one prime above √n may remain
  return f;
}
```

**Complexity:** $O(\sqrt n)$ for one number by trial division; $O(N \log\log N)$ to sieve smallest-prime-factors for all of $1 \dots N$.

---

## The Fundamental Theorem of Arithmetic

Factorization is only well posed because the answer is **unique**.

> **Fundamental Theorem of Arithmetic.** Every integer $n > 1$ is a product of primes, and that product is unique up to the order of the factors.

**Existence** is quick, by strong induction. If $n$ is prime, it is its own product. Otherwise $n = a \cdot b$ with $1 < a, b < n$; both $a$ and $b$ factor into primes by the induction hypothesis, and concatenating those lists factors $n$.

**Uniqueness** rests on one fact about primes:

> **Euclid's Lemma.** If a prime $p$ divides a product $a \cdot b$, then $p \mid a$ or $p \mid b$.

Suppose some integer had two different prime factorizations. Cancel any primes common to both sides; what remains is an equation with no shared prime, yet the primes on the left still divide the product on the right — and Euclid's lemma forces one of them to divide some prime on the right, meaning they are equal. Contradiction. So the factorization is one of a kind. $\square$

This uniqueness is why $\varphi$, $\gcd$, the divisor count — every multiplicative function — can be read straight off the exponents $a_i$.

---

## Trial Division

The defining algorithm: sweep candidate divisors upward, and each time one divides $n$, strip out **every** copy of it before moving on. Stripping as you go guarantees the next divisor that hits is prime — all smaller primes are already gone.

Two facts make it fast:

- **Stop at $\sqrt n$.** If $n$ has a factor, the smaller of any factor pair is $\le \sqrt n$.
- **At most one prime exceeds $\sqrt n$.** Two such would multiply past $n$. So whatever survives the loop with $n > 1$ is itself that final prime — caught by the trailing `if`.

```cpp
vector<pair<int64_t,int>> factorize(int64_t n) {
  vector<pair<int64_t,int>> f;
  for (int64_t d = 2; d * d <= n; d++) {
    if (n % d == 0) {
      int e = 0;
      while (n % d == 0) n /= d, e++;
      f.push_back({d, e});
    }
  }
  if (n > 1) f.push_back({n, 1});
  return f;
}
```

This is the same skeleton as the `phi(n)` routine in [[Euler's Totient Function]] — strip distinct primes, handle one large leftover — because computing $\varphi$ _is_ factorization with a running product.

### Trace: `factorize(360)`

| $d$ |                   $n$ remaining | action             | factors collected                        |
| --: | ------------------------------: | :----------------- | :--------------------------------------- |
|   — |                             360 | start              | —                                        |
|   2 | $360 \to {\color{royalblue}45}$ | strip three $2$s   | $2^3$                                    |
|   3 |   $45 \to {\color{royalblue}5}$ | strip two $3$s     | $2^3 \cdot 3^2$                          |
|   — |                               5 | loop ends, $n > 1$ | $2^3 \cdot 3^2 \cdot {\color{crimson}5}$ |

The loop stops once $d \cdot d > n$ ($4 \cdot 4 > 5$); the leftover $5$ is the lone prime above $\sqrt{360}$. Result: $360 = {\color{crimson}2^3 \cdot 3^2 \cdot 5}$.

**Complexity:** $O(\sqrt n)$ — fine up to $n \approx 10^{14}$. Testing only $2$ and then odd $d$ halves the constant; a $6k\pm1$ wheel shaves it further. But the asymptotic wall stays.

---

## A Sieve for Many Queries

Factoring thousands of numbers below some bound $N$? Do not run trial division thousands of times. Precompute the **smallest prime factor** `spf[i]` of every $i \le N$ once, with the [[Sieve of Eratosthenes]] structure:

```cpp
vector<int> spf(N + 1);
iota(spf.begin(), spf.end(), 0);                  // spf[i] = i
for (int p = 2; (int64_t)p * p <= N; p++)
  if (spf[p] == p)                                // p still itself => p is prime
    for (int m = p * p; m <= N; m += p)
      if (spf[m] == m) spf[m] = p;                // first prime to reach m wins
```

After this, factoring is a walk: divide out `spf[n]`, repeat.

```cpp
vector<int> factorize_fast(int n) {               // primes of n, with multiplicity
  vector<int> f;
  while (n > 1) { f.push_back(spf[n]); n /= spf[n]; }
  return f;
}
```

Each division shrinks $n$ by at least a factor of $2$, so a query costs $O(\log n)$.

### Trace: `factorize_fast(12)`

With `spf` built up to $12$ — `spf[12] = 2`, `spf[6] = 2`, `spf[3] = 3`:

$$
12 \xrightarrow{\;\div\, spf[12]=2\;} 6 \xrightarrow{\;\div\, spf[6]=2\;} 3 \xrightarrow{\;\div\, spf[3]=3\;} 1
$$

Collected primes ${\color{crimson}2, 2, 3}$ — so $12 = 2^2 \cdot 3$.

**Complexity:** $O(N \log\log N)$ to build, $O(\log n)$ per query, $O(N)$ memory — practical for $N \le 10^7$ or so.

---

## Where Trial Division Dies

Trial division's $O(\sqrt n)$ is fatal exactly where factoring matters most. A semiprime $n = pq$ with $p, q$ near $\sqrt n$ — the RSA shape — has no small factor at all, so the loop must grind all the way to $\sqrt n$. For a $40$-digit $n$ that is $10^{20}$ divisions: untouchable.

Beating this needs a method whose cost scales with $\sqrt p$ — the _smallest_ prime factor — instead of $\sqrt n$. For a hard semiprime $p \approx \sqrt n$, so $\sqrt p \approx n^{1/4}$: squaring the reach. **Pollard's rho** is the classic algorithm that gets there, by colliding into a factor rather than searching for one — it has its own page.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Input} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
n = 1 & \text{empty factorization} & \text{a product of no primes; the loop never runs} \\[4pt]
n = 0 & \text{undefined} & 0 \text{ has no prime factorization} \\[4pt]
n \text{ prime} & n^1 & \text{the trailing } \texttt{if}\ \text{catches it as the lone leftover} \\[4pt]
n = 2 & 2^1 & \text{the first divisor the loop tries} \\[4pt]
n < 0 & \text{factor } |n| & \text{handle the sign separately} \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **The trailing `if` is not optional.** Dropping `if (n > 1)` silently loses the one prime factor above $\sqrt n$ — `factorize(14)` would return only $2$, never the $7$.
- **Loop bound, not `d <= sqrt(n)`.** Test `d * d <= n`, not a floating-point `sqrt`; rounding can stop the loop one divisor short. As $n$ shrinks while factors are stripped, the bound also tightens for free.
- **Sieve memory.** The `spf` array is $O(N)$ — fine for $N \le 10^7$, hopeless for $N = 10^{18}$. Factor a single large value with trial division instead.

---

## References

1. Euclid. _Elements_, Books VII–IX. c. 300 BC. — Euclid's lemma and the infinitude of primes, the foundation of unique factorization.

2. Gauss, C. F. _Disquisitiones Arithmeticae_. Leipzig, 1801. Art. 16. — The first rigorous statement and proof of the Fundamental Theorem of Arithmetic.

3. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. §1.3 — The Fundamental Theorem of Arithmetic and Euclid's lemma.

4. [CP Algorithms — Integer Factorization](https://cp-algorithms.com/algebra/factorization.html)
