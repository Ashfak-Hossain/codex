---
title: Modular Inverse
description: Why division breaks in modular arithmetic and how to repair it — existence via Bézout, five ways to compute the inverse (Extended Euclid, Fermat, Euler, linear recurrence, batch prefix), and the nCr-mod-p pattern every CP problem leans on.
tags:
  - number-theory
  - math
date: 2025-04-22
---

In ordinary arithmetic, dividing by $a$ means multiplying by $1/a$. The number $1/a$ is whatever you have to multiply $a$ by to get $1$ — its **inverse**. Nothing dramatic.

Modular arithmetic only gives you $\{0, 1, \dots, m-1\}$ and the operations $+,\ -,\ \times$. There is no $1/a$ in that set. So the moment a problem asks for

$$
\frac{a}{b} \bmod m
$$

you are stuck — until you notice that division was never really about fractions. It was about _undoing a multiplication_. The **modular inverse** of $a$ is the element ${\color{royalblue}a^{-1}}$ of $\{0, \dots, m-1\}$ that undoes multiplication by $a$:

$$
{\color{royalblue}a} \cdot {\color{royalblue}a^{-1}} \;\equiv\; 1 \pmod{m}
$$

Find that one number and division becomes multiplication again. This page is about finding it — when it exists, and the five standard ways to compute it.

_Prereqs: [[Greatest Common Divisor]] · [[Extended Euclidean Algorithm]] · [[Modular Arithmetic|basic modular arithmetic]]._

---

## Why Division Breaks

Take $m = 5$ and ask for $6 / 2$. The honest answer is $3$, and indeed $3 \bmod 5 = 3$. So far division looks harmless.

Now try $6 / 4 \pmod 5$. As a fraction $6/4 = 1.5$ — not an integer, so "reduce mod 5" is meaningless. Yet the modular world _does_ have a sensible answer. We want some $x$ with

$$
{\color{teal}4} \cdot x \;\equiv\; {\color{teal}6} \;\equiv\; 1 \pmod 5
$$

Testing $x = 0,1,2,3,4$: only $x = 4$ works, since $4 \cdot 4 = 16 \equiv 1$. So "$6/4$" mod $5$ is $4$.

The lesson: **modular division is not fraction division.** You cannot divide; you can only multiply by an inverse. And sometimes that inverse does not exist at all — try to invert $2$ modulo $4$:

$$
2 \cdot 0,\ 2 \cdot 1,\ 2 \cdot 2,\ 2 \cdot 3 \;=\; 0,\ 2,\ 0,\ 2 \pmod 4
$$

The value $1$ never appears. Multiplication by $2$ collapses four inputs onto two outputs — information is lost, and a lossy map cannot be undone. That collapse is the whole story of when inverses exist.

---

## When Does an Inverse Exist?

> **Theorem.** $a$ has an inverse modulo $m$ **if and only if** $\gcd(a, m) = 1$.

**Proof $(\Leftarrow)$.** Suppose $\gcd(a, m) = 1$. By [[Extended Euclidean Algorithm|Bézout's identity]] there exist integers $x, y$ with

$$
{\color{royalblue}a}\,x \;+\; {\color{teal}m}\,y \;=\; 1
$$

Reduce both sides modulo $m$. The term ${\color{teal}m}\,y$ vanishes, leaving ${\color{royalblue}a}\,x \equiv 1 \pmod m$. So $x$ — once normalized into $[0, m)$ — is the inverse.

**Proof $(\Rightarrow)$.** Suppose an inverse $x$ exists: $a x \equiv 1 \pmod m$. Then $a x - 1 = m y$ for some integer $y$, i.e. $a x - m y = 1$. Let $d = \gcd(a, m)$. Since $d \mid a$ and $d \mid m$, $d$ divides the whole left side, so $d \mid 1$. The only positive divisor of $1$ is $1$, hence $d = 1$. $\square$

The two halves say the same thing from both directions: an inverse is _exactly_ a Bézout coefficient in disguise. This is why the inverse problem is really the [[Extended Euclidean Algorithm]] wearing a different hat.

**Two clean consequences.**

- If $m$ is **prime**, then $\gcd(a, m) = 1$ for every $a \in \{1, \dots, m-1\}$ — _every_ nonzero residue is invertible. This is why competitive programming loves prime moduli like $10^9 + 7$ and $998244353$.
- The inverse, when it exists, is **unique** in $[0, m)$. If $a x \equiv 1$ and $a x' \equiv 1$, then $a(x - x') \equiv 0$; multiplying by $x$ gives $x - x' \equiv 0$, so $x = x'$.

---

## Method 1 — Extended Euclidean

This works for **any** modulus, prime or not. It is the direct cash-out of the existence proof: run [[Extended Euclidean Algorithm|`ext_gcd`]] on $(a, m)$, take the coefficient of $a$, normalize it.

```cpp
int64_t ext_gcd(int64_t a, int64_t b, int64_t& x, int64_t& y) {
  if (b == 0) { x = 1; y = 0; return a; }
  int64_t x1, y1;
  int64_t g = ext_gcd(b, a % b, x1, y1);
  x = y1;
  y = x1 - y1 * (a / b);
  return g;
}

// Returns a^{-1} mod m, or -1 if no inverse exists.
int64_t mod_inverse(int64_t a, int64_t m) {
  int64_t x, y;
  int64_t g = ext_gcd(a % m, m, x, y);
  if (g != 1) return -1;            // gcd != 1  =>  not invertible
  return (x % m + m) % m;           // normalize into [0, m)
}
```

The `(x % m + m) % m` double-mod is the usual guard against C++'s `%` returning a negative remainder — `ext_gcd` happily produces negative coefficients.

### Trace: invert $3$ modulo $11$

Run the division chain $a = q\cdot b + r$ on $(3, 11)$:

$$
\begin{array}{rclcr}
{\color{royalblue}11} &=& 3 \cdot {\color{teal}3}       &+& {\color{darkorange}2} \\[4pt]
{\color{teal}3}       &=& 1 \cdot {\color{darkorange}2} &+& {\color{crimson}1}  \\[4pt]
{\color{darkorange}2} &=& 2 \cdot {\color{crimson}1}    &+& 0
\end{array}
$$

Back-substitute to express ${\color{crimson}1}$ in terms of $3$ and $11$:

$$
{\color{crimson}1} \;=\; {\color{teal}3} - 1\cdot{\color{darkorange}2}
       \;=\; {\color{teal}3} - 1\cdot\bigl({\color{royalblue}11} - 3\cdot{\color{teal}3}\bigr)
       \;=\; 4\cdot{\color{teal}3} \;-\; 1\cdot{\color{royalblue}11}
$$

So $3 \cdot {\color{royalblue}4} + 11 \cdot (-1) = 1$, giving $x = 4$. It is already in $[0, 11)$, so

$$
\boxed{\ 3^{-1} \equiv 4 \pmod{11}\ } \qquad\text{check: } 3 \cdot 4 = 12 \equiv 1 \pmod{11}
$$

**Complexity.** $O(\log m)$ — same as plain GCD. This is the most general method and a fine default.

---

## Method 2 — Fermat's Little Theorem (prime modulus)

When $m$ is **prime**, there is a one-liner. No `ext_gcd`, just fast exponentiation.

> **Fermat's Little Theorem.** If $p$ is prime and $p \nmid a$, then
> $$ a^{\,p-1} \equiv 1 \pmod p $$

Split off one factor of $a$:

$$
a^{\,p-1} = a \cdot a^{\,p-2} \equiv 1 \pmod p
\quad\Longrightarrow\quad
\boxed{\ a^{-1} \equiv a^{\,p-2} \pmod p\ }
$$

The inverse is just $a$ raised to the power $p - 2$. Compute it with [[Binary Exponentiation|binary exponentiation]] in $O(\log p)$:

```cpp
int64_t power(int64_t a, int64_t b, int64_t m) {
  a %= m;
  int64_t result = 1;
  while (b > 0) {
    if (b & 1) result = result * a % m;
    a = a * a % m;
    b >>= 1;
  }
  return result;
}

// Valid only when m is prime and a is not a multiple of m.
int64_t mod_inverse(int64_t a, int64_t m) {
  return power(a, m - 2, m);
}
```

### Why $a^{p-1} \equiv 1$

Take the nonzero residues $\{1, 2, \dots, p-1\}$ and multiply each by $a$. Because $a$ is invertible, this map is a **bijection** — it just shuffles the set:

$$
\{\,a\cdot 1,\ a\cdot 2,\ \dots,\ a\cdot(p-1)\,\} \;=\; \{\,1,\ 2,\ \dots,\ p-1\,\} \pmod p
$$

Multiply each side together. The left gives $a^{\,p-1}\cdot(p-1)!$, the right gives $(p-1)!$:

$$
a^{\,p-1} \cdot (p-1)! \;\equiv\; (p-1)! \pmod p
$$

Since $p$ is prime, $(p-1)!$ shares no factor with $p$, so it is invertible — cancel it from both sides and $a^{\,p-1} \equiv 1$ remains. $\square$

### Aside: what is $(p-1)!$ worth?

That proof multiplied $(p-1)!$ across both sides and cancelled it — but never asked what the value _is_. The answer is a small classic.

> **Wilson's Theorem.** $p$ is prime **iff** $(p-1)! \equiv -1 \pmod p$.

And the reason is pure inverse-pairing. Group the residues $\{1, 2, \dots, p-1\}$ into pairs $\{x,\ x^{-1}\}$ — each such pair multiplies to $1$ and drops out of the product. The only survivors are the **self-inverse** elements, $x$ with $x^2 \equiv 1$, i.e. $(x-1)(x+1) \equiv 0$. Since $p$ is prime that forces $x \equiv 1$ or $x \equiv p-1$. So the whole factorial collapses to

$$
(p-1)! \;\equiv\; 1 \cdot (p-1) \;\equiv\; -1 \pmod p
$$

Not needed for the inverse itself — but it is the same "pair each element with its inverse" idea, pushed one step further.

> **Trap.** Two ways this bites. **(1)** Fermat needs a **prime** modulus — applying $a^{m-2}$ when $m$ is composite gives a confidently wrong number. **(2)** Unlike Method 1, this code does **not** detect non-invertibility: when $a \equiv 0 \pmod m$ it silently returns $0$ — a plausible-looking value, not an error sentinel. Reduce and guard the input, or fall back to Method 1 whenever $a$ might be a multiple of $m$.

---

## Method 3 — Euler's Theorem (general modulus, coprime)

Fermat is the special case of a broader law that handles **any** modulus, as long as $\gcd(a, m) = 1$.

> **Euler's Theorem.** If $\gcd(a, m) = 1$, then
> $$ a^{\,\varphi(m)} \equiv 1 \pmod m $$

Here $\varphi(m)$ is [[Euler's Totient Function|Euler's totient]] — the count of integers in $[1, m]$ coprime to $m$. The same one-factor split as before gives

$$
\boxed{\ a^{-1} \equiv a^{\,\varphi(m) - 1} \pmod m\ }
$$

When $m = p$ is prime, $\varphi(p) = p - 1$ and this collapses back to Fermat. In practice Method 3 is only worth it when you already know $\varphi(m)$; otherwise computing $\varphi(m)$ needs the factorization of $m$, and at that point Method 1 is simpler and faster.

---

## Method 4 — All Inverses $1 \dots n$ in Linear Time

Sometimes you do not want one inverse — you want **every** inverse $1^{-1}, 2^{-1}, \dots, n^{-1}$ modulo a prime $p$. Calling Method 1 or 2 for each is $O(n \log p)$. There is an $O(n)$ recurrence.

Write the division of $p$ by $i$ as $p = \lfloor p/i \rfloor \cdot i + (p \bmod i)$. Reduce modulo $p$:

$$
0 \;\equiv\; \left\lfloor \tfrac{p}{i} \right\rfloor \cdot i \;+\; (p \bmod i) \pmod p
$$

Multiply through by $i^{-1}\,(p \bmod i)^{-1}$ and rearrange:

$$
\boxed{\ i^{-1} \;\equiv\; -\left\lfloor \tfrac{p}{i} \right\rfloor \cdot (p \bmod i)^{-1} \pmod p\ }
$$

Since $p \bmod i < i$, that inverse on the right is **already computed** — fill the table bottom-up from $\text{inv}[1] = 1$.

```cpp
vector<int64_t> inv(n + 1);
inv[1] = 1;
for (int i = 2; i <= n; i++) {
  inv[i] = (p - (p / i) * inv[p % i] % p) % p;   // -(p/i)*inv[p%i], kept positive
}
```

### Trace: inverses modulo $p = 11$

$$
\begin{array}{cll}
\text{inv}[1] &= 1 & \\[4pt]
\text{inv}[2] &= -\lfloor 11/2\rfloor \cdot \text{inv}[1] = -5\cdot 1 \equiv {\color{royalblue}6} & (2\cdot 6 = 12 \equiv 1) \\[4pt]
\text{inv}[3] &= -\lfloor 11/3\rfloor \cdot \text{inv}[2] = -3\cdot 6 = -18 \equiv {\color{royalblue}4} & (3\cdot 4 = 12 \equiv 1) \\[4pt]
\text{inv}[4] &= -\lfloor 11/4\rfloor \cdot \text{inv}[3] = -2\cdot 4 = -8 \equiv {\color{royalblue}3} & (4\cdot 3 = 12 \equiv 1) \\[4pt]
\text{inv}[5] &= -\lfloor 11/5\rfloor \cdot \text{inv}[1] = -2\cdot 1 \equiv {\color{royalblue}9} & (5\cdot 9 = 45 \equiv 1)
\end{array}
$$

Every row reuses an earlier row — that is the linear time.

---

## Method 5 — Batch Inversion of Arbitrary Values

Method 4 inverts the _consecutive_ values $1 \dots n$. The more common situation is different: you hold $n$ **arbitrary** values $a_1, \dots, a_n$ — not a range — and want every $a_i^{-1}$. The prefix-product trick does this with **exactly one** true modular inversion plus $O(n)$ multiplications, and works for **any** modulus (as long as every $a_i$ is invertible).

**The idea.** Let $p_i$ be the running product, with $p_0 = 1$:

$$
p_i \;=\; a_1 \cdot a_2 \cdots a_i
$$

Invert only the **last** prefix, $p_n^{-1}$ — one call to Method 1 or 2. Now two identities let you sweep backward:

$$
a_i^{-1} \;=\; p_{i-1} \cdot p_i^{-1}
\qquad\qquad
p_{i-1}^{-1} \;=\; a_i \cdot p_i^{-1}
$$

The first reads $\dfrac{a_1 \cdots a_{i-1}}{a_1 \cdots a_i} = \dfrac{1}{a_i}$. The second peels one factor off the running inverse so the next step has $p_{i-1}^{-1}$ ready. Walk $i$ from $n$ down to $1$, carrying a single `cur` $= p_i^{-1}$.

```cpp
// Inverses of arbitrary a[0..n-1] mod m. Every a[i] must be invertible.
vector<int64_t> batch_inverse(const vector<int64_t>& a, int64_t m) {
  int n = a.size();
  vector<int64_t> prefix(n + 1), inv(n);
  prefix[0] = 1;
  for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] * a[i] % m;

  int64_t cur = mod_inverse(prefix[n], m);   // the single real inversion
  for (int i = n - 1; i >= 0; i--) {
    inv[i] = prefix[i] * cur % m;            // a[i]^{-1} = p_{i-1} * p_i^{-1}
    cur = cur * a[i] % m;                    // p_{i-1}^{-1} = a[i] * p_i^{-1}
  }
  return inv;
}
```

### Trace: invert $\{3, 4, 5\}$ modulo $11$

Prefix products: $p_0 = 1,\ p_1 = 3,\ p_2 = 12 \equiv 1,\ p_3 = 5$. One inversion gives $\text{cur} = p_3^{-1} = 5^{-1} = 9$.

| $i$ | $a_i$ | $p_i$ |  $a_i^{-1} = p_i \cdot \text{cur}$ | check                     | $\text{cur} \leftarrow a_i \cdot \text{cur}$ |
| --: | ----: | ----: | ---------------------------------: | :------------------------ | -------------------------------------------: |
|   2 |     5 |     1 | $1 \cdot 9 = {\color{royalblue}9}$ | $5 \cdot 9 = 45 \equiv 1$ |                         $9 \cdot 5 \equiv 1$ |
|   1 |     4 |     3 | $3 \cdot 1 = {\color{royalblue}3}$ | $4 \cdot 3 = 12 \equiv 1$ |                         $1 \cdot 4 \equiv 4$ |
|   0 |     3 |     1 | $1 \cdot 4 = {\color{royalblue}4}$ | $3 \cdot 4 = 12 \equiv 1$ |                         $4 \cdot 3 \equiv 1$ |

One inversion, three multiplications per element — the rest is bookkeeping. This is the trick behind computing inverse factorials in [[Modular Combinatorics]] and is heavily used wherever modular inverses appear in a hot loop.

---

## Which Method Do I Use?

| Method                | Modulus            | Cost                               | Use when                            |
| :-------------------- | :----------------- | :--------------------------------- | :---------------------------------- |
| **Extended Euclid**   | any                | $O(\log m)$                        | general default; modulus not prime  |
| **Fermat**            | prime only         | $O(\log p)$                        | $m$ is prime — the CP default       |
| **Euler**             | any, $\gcd(a,m)=1$ | $O(\log m)$ + cost of $\varphi(m)$ | you already know $\varphi(m)$       |
| **Linear recurrence** | prime only         | $O(n)$ for all of $1\dots n$       | you need every inverse $1\dots n$   |
| **Batch (prefix)**    | any                | $O(n)$ + one inversion             | many inverses of _arbitrary_ values |

Rule of thumb: **prime modulus, one inverse → Fermat. Every inverse $1\dots n$ → linear recurrence. Many arbitrary values → batch prefix trick. Anything else → Extended Euclid.**

---

## The Payoff: $\binom{n}{r} \bmod p$

This is the single most common reason CP problems need inverses. The binomial coefficient

$$
\binom{n}{r} = \frac{n!}{r!\,(n-r)!}
$$

has factorials too large to store, and that division cannot be done directly modulo $p$. Replace each division by multiplication by an inverse. Precompute factorials and **inverse factorials** once, then every query is $O(1)$:

```cpp
const int64_t MOD = 1e9 + 7;
const int N = 1e6 + 5;
int64_t fact[N], inv_fact[N];

void precompute() {
  fact[0] = 1;
  for (int i = 1; i < N; i++) fact[i] = fact[i - 1] * i % MOD;

  inv_fact[N - 1] = power(fact[N - 1], MOD - 2, MOD);   // one Fermat inverse
  for (int i = N - 2; i >= 0; i--)
    inv_fact[i] = inv_fact[i + 1] * (i + 1) % MOD;       // walk down: O(N) total
}

int64_t nCr(int n, int r) {
  if (r < 0 || r > n) return 0;
  return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD;
}
```

Two ideas worth pausing on:

- Only **one** real inverse is computed — `inv_fact[N-1]` via Fermat. Every smaller inverse factorial drops out of the identity $\dfrac{1}{i!} = \dfrac{1}{(i+1)!}\cdot(i+1)$, which is the downward loop. The whole precompute is $O(N)$.
- Modular division of any two values is now trivial: $\dfrac{a}{b} \bmod p = a \cdot b^{-1} \bmod p$.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Input} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
\gcd(a, m) > 1 & \text{no inverse} & \text{Bézout sum is a multiple of } \gcd,\ \text{never } 1 \\[4pt]
a \equiv 0 \pmod m & \text{no inverse} & 0 \cdot x \equiv 0 \ne 1 \text{ for any } x \\[4pt]
a^{-1} \bmod 1 & 0 & \text{the only residue mod } 1 \text{ is } 0 \\[4pt]
\text{Fermat on composite } m & \text{wrong answer} & a^{m-2} \ne a^{-1} \text{ unless } m \text{ prime} \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **Negative `%` in C++/Java.** `ext_gcd` returns a possibly-negative $x$. Always finish with `(x % m + m) % m`.
- **Overflow.** For $m$ near $10^9$, a product $a \cdot b$ reaches $10^{18}$ — fine in `int64_t`, but declare _everything_ (`a, b, result, x, y`) as `int64_t`. For $m$ near $10^{18}$, the product overflows and you need `__int128` or a `mulmod`.
- **Normalize the input first.** Pass `a % m` (made non-negative) into `mod_inverse`, not a raw huge or negative `a`.
- **Always check existence** when the modulus is not guaranteed prime — return a sentinel like $-1$ rather than silently emitting garbage.

---

## References

1. Fermat, P. de. Letter to Frénicle de Bessy, 18 October 1640. — First statement of $a^{p-1} \equiv 1 \pmod p$, given without proof.

2. Euler, L. "Theoremata arithmetica nova methodo demonstrata." _Novi Commentarii Academiae Scientiarum Petropolitanae_, vol. 8, 1763, pp. 74–104. — Introduces the totient function and proves the generalization $a^{\varphi(m)} \equiv 1$.

3. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. §§5.3–6.5 — Fermat's and Euler's theorems, residue classes, and invertibility.

4. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.4 — Solving modular linear equations and the role of the inverse.

5. Knuth, D. E. _The Art of Computer Programming_, Vol. 2: _Seminumerical Algorithms_, 3rd ed. Addison-Wesley, 1997. §4.5.2 — Extended Euclid and modular reciprocals.

6. [CP Algorithms — Modular Multiplicative Inverse](https://cp-algorithms.com/algebra/module-inverse.html)
