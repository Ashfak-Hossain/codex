---
title: Chinese Remainder Theorem
description: Solving a system of congruences x ≡ rᵢ (mod mᵢ) — why pairwise-coprime moduli give a unique answer modulo their product, the explicit Mᵢ-and-inverse construction, the iterative pairwise merge you actually code, and the general case when moduli share factors.
tags:
  - number-theory
  - math
date: 2026-05-16
---

A problem from Sunzi's _Mathematical Classic_, written in China some sixteen centuries ago:

> There is an unknown number of things. Counted by threes, $2$ are left over; by fives, $3$ are left over; by sevens, $2$ are left over. How many things?

In modern notation, find $x$ with

$$
x \equiv 2 \pmod 3, \qquad x \equiv 3 \pmod 5, \qquad x \equiv 2 \pmod 7.
$$

[[Linear Congruences|A single congruence]] pins $x$ to one residue class. A *system* of them, with **coprime moduli**, pins it down completely: the **Chinese Remainder Theorem** says there is exactly one answer modulo the product $3 \cdot 5 \cdot 7 = 105$. It is $23$ — and this page is about why such an $x$ always exists, why it is unique, and how to compute it.

_Prereqs: [[Modular Arithmetic|modular arithmetic]] · [[Modular Inverse]] · [[Linear Congruences]] · [[Extended Euclidean Algorithm]]._

---

## At a Glance

$$
\boxed{\ \begin{array}{c} x \equiv r_i \pmod{m_i}\ \text{for all } i, \ \text{ with the } m_i \text{ pairwise coprime} \\[4pt] \Longrightarrow\ \text{a unique } x \bmod M, \quad M = m_1 m_2 \cdots m_k \end{array}\ }
$$

```cpp
// a^{-1} mod m via Extended Euclid — see the Modular Inverse page.
int64_t mod_inverse(int64_t a, int64_t m) {
  int64_t g = m, x = 0, x1 = 1, a1 = ((a % m) + m) % m;
  while (a1) {
    int64_t q = g / a1;
    tie(x, x1) = make_tuple(x1, x - q * x1);
    tie(g, a1) = make_tuple(a1, g - q * a1);
  }
  return (x % m + m) % m;                       // assumes gcd(a, m) = 1
}

// Merge x ≡ r1 (mod m1) and x ≡ r2 (mod m2), coprime moduli.
pair<int64_t, int64_t> crt_merge(int64_t r1, int64_t m1, int64_t r2, int64_t m2) {
  int64_t k = ((r2 - r1) % m2 * mod_inverse(m1, m2) % m2 + m2) % m2;
  int64_t M = m1 * m2;
  int64_t r = (r1 + m1 * k) % M;
  return {(r % M + M) % M, M};
}

// Solve a whole system; moduli must be pairwise coprime.
pair<int64_t, int64_t> crt(const vector<int64_t>& rem, const vector<int64_t>& mod) {
  int64_t r = 0, m = 1;                          // x ≡ 0 (mod 1): no constraint yet
  for (size_t i = 0; i < rem.size(); i++)
    tie(r, m) = crt_merge(r, m, rem[i], mod[i]);
  return {r, m};                                 // x ≡ r (mod m), m = ∏ mod[i]
}
```

**Complexity:** $O(k \log M)$ for $k$ congruences — one modular inverse per merge.

---

## The Theorem

> **Chinese Remainder Theorem.** Let $m_1, m_2, \dots, m_k$ be **pairwise coprime** (every pair shares no factor). For any residues $r_1, \dots, r_k$, the system
> $$x \equiv r_1 \pmod{m_1}, \quad \dots, \quad x \equiv r_k \pmod{m_k}$$
> has a solution, and that solution is **unique modulo** $M = m_1 m_2 \cdots m_k$.

Two claims in one — *existence* (a solution is there) and *uniqueness* (only one, mod $M$). Both need proof, and the proofs are constructive: they hand you the number.

**Uniqueness.** Suppose $x$ and $x'$ both satisfy every congruence. Then $x \equiv x' \pmod{m_i}$ for each $i$, so each $m_i$ divides $x - x'$. When the $m_i$ are pairwise coprime, a number divisible by all of them is divisible by their **product** — so $M \mid (x - x')$, i.e. $x \equiv x' \pmod M$. At most one solution exists in $[0, M)$. $\square$

(The pairwise-coprime condition is doing real work here. Without it, "divisible by each $m_i$" only forces divisibility by their *lcm*, which is smaller than the product.)

---

## Why a Solution Exists — the Construction

Existence is proved by building $x$ outright. The trick: assemble it from $k$ pieces, where piece $i$ handles congruence $i$ and is **invisible** to all the others.

For each $i$, let

$$
M_i = \frac{M}{m_i} = \prod_{j \ne i} m_j .
$$

$M_i$ is the product of *every modulus except* $m_i$, so it is divisible by each $m_j$ ($j \ne i$) and **coprime to** $m_i$ (it shares no factor with it). Being coprime to $m_i$, it has an inverse there:

$$
y_i = M_i^{-1} \pmod{m_i} .
$$

Now form

$$
\boxed{\ x \;=\; \sum_{i=1}^{k} r_i \, M_i \, y_i \pmod M\ }
$$

Check it against congruence $j$. Look at the sum modulo $m_j$:

- **Every term with $i \ne j$ vanishes** — it contains the factor $M_i$, which is a multiple of $m_j$. So $r_i M_i y_i \equiv 0 \pmod{m_j}$.
- **The term $i = j$ survives** as $r_j \, M_j \, y_j \equiv r_j \cdot (M_j M_j^{-1}) \equiv r_j \cdot 1 = r_j \pmod{m_j}$.

So $x \equiv r_j \pmod{m_j}$ for every $j$ — the construction satisfies the whole system. $\square$

Each $M_i y_i$ is a tailored switch: $\equiv 1 \pmod{m_i}$, $\equiv 0$ at every other modulus. The solution is just those switches weighted by the residues.

---

## Worked Example — Sunzi's Problem

$x \equiv 2 \pmod 3$, $\;x \equiv 3 \pmod 5$, $\;x \equiv 2 \pmod 7$. Here $M = 3 \cdot 5 \cdot 7 = 105$.

$$
\begin{array}{c|c|c|c}
i & m_i & M_i = M/m_i & y_i = M_i^{-1} \bmod m_i \\
\hline
1 & 3 & 35 & 35^{-1} \equiv 2^{-1} \equiv {\color{royalblue}2} \pmod 3 \\
2 & 5 & 21 & 21^{-1} \equiv 1^{-1} \equiv {\color{royalblue}1} \pmod 5 \\
3 & 7 & 15 & 15^{-1} \equiv 1^{-1} \equiv {\color{royalblue}1} \pmod 7 \\
\end{array}
$$

Assemble:

$$
x = \underbrace{2 \cdot 35 \cdot 2}_{140} \;+\; \underbrace{3 \cdot 21 \cdot 1}_{63} \;+\; \underbrace{2 \cdot 15 \cdot 1}_{30} \;=\; 233 \;\equiv\; {\color{crimson}23} \pmod{105}.
$$

Check: $23 = 7\cdot3 + 2$, $\;23 = 4\cdot5 + 3$, $\;23 = 3\cdot7 + 2$. ✓ All three remainders land — and $23$ is the *only* answer below $105$.

---

## Computing It — the Iterative Merge

The $\sum r_i M_i y_i$ formula is the cleanest *proof*, but it needs every modulus in hand at once. In code it is tidier to **fold the system two congruences at a time** — and this version extends painlessly to the non-coprime case below.

**Merging two.** Given $x \equiv r_1 \pmod{m_1}$ and $x \equiv r_2 \pmod{m_2}$ with $\gcd(m_1, m_2) = 1$. The first congruence says $x = r_1 + m_1 k$ for some integer $k$. Substitute into the second:

$$
r_1 + m_1 k \equiv r_2 \pmod{m_2}
\quad\Longrightarrow\quad
m_1 k \equiv r_2 - r_1 \pmod{m_2}.
$$

That is a [[Linear Congruences|linear congruence]] in $k$, and since $\gcd(m_1, m_2) = 1$ it has the unique solution

$$
k \equiv (r_2 - r_1)\, m_1^{-1} \pmod{m_2}.
$$

Plug $k$ back: $x = r_1 + m_1 k$ is the merged residue, unique modulo $m_1 m_2$. Two congruences have become one. Fold the list — starting from the empty constraint $x \equiv 0 \pmod 1$ — and the whole system collapses to a single $x \equiv r \pmod M$.

### Trace: `crt` on Sunzi's problem

Folding $(2,3),\ (3,5),\ (2,7)$, carrying the running pair $(r, m)$:

| step | merge in        | $(r, m)$ before | $m_1^{-1} \bmod m_2$ | $k$ | $(r, m)$ after  |
| :--: | :-------------- | :-------------- | :------------------: | :-: | :-------------- |
|  1   | $x \equiv 2\ (3)$ | $(0,\ 1)$       |         $1$          | $2$ | $(2,\ 3)$       |
|  2   | $x \equiv 3\ (5)$ | $(2,\ 3)$       |         $2$          | $2$ | $(8,\ 15)$      |
|  3   | $x \equiv 2\ (7)$ | $(8,\ 15)$      |         $1$          | $1$ | $({\color{crimson}23},\ 105)$ |

Each row checks out — $8 \equiv 2\ (3),\ 8 \equiv 3\ (5)$ — and the last lands on $x \equiv 23 \pmod{105}$, the same answer the formula gave.

---

## When the Moduli Share Factors

Drop pairwise-coprimeness and two things change: a solution may **fail to exist**, and when it does it is unique only modulo the **lcm**, not the product.

Merging $x \equiv r_1 \pmod{m_1}$ and $x \equiv r_2 \pmod{m_2}$ now leads to $m_1 k \equiv r_2 - r_1 \pmod{m_2}$ — a linear congruence whose solvability rule (from [[Linear Congruences]]) is:

$$
\boxed{\ \text{solvable} \iff g \mid (r_2 - r_1), \qquad g = \gcd(m_1, m_2)\ }
$$

Intuitively the two congruences must **agree on the overlap**: they have to prescribe the same residue modulo $g$. If they do, the merge succeeds and the combined modulus is $\operatorname{lcm}(m_1, m_2) = m_1 m_2 / g$; if they contradict each other mod $g$, the system has no solution at all. The iterative merge handles this with one extra check per step — solve the linear congruence instead of multiplying by a plain inverse.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Case} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
k = 1 & x \equiv r_1 \pmod{m_1} & \text{one congruence, nothing to merge} \\[4pt]
m_i = 1 & \text{no constraint} & \text{every } x \equiv 0 \pmod 1 \\[4pt]
\text{moduli not coprime} & \text{may be unsolvable} & \text{need } \gcd(m_i,m_j) \mid (r_i - r_j) \\[4pt]
\text{contradictory system} & \text{no solution} & \text{e.g. } x\equiv0\,(2),\ x\equiv1\,(4) \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **Overflow.** The merge forms $m_1 m_2$ and $m_1 k$. Both stay below the running product $M$, so if the final $M$ fits in `int64_t` you are safe; if $M$ approaches $10^{18}$, the product $(r_2-r_1)\cdot m_1^{-1}$ can still overflow — promote to `__int128`.
- **Normalize residues and the answer.** Reduce each $r_i$ into $[0, m_i)$ first, and finish with `(r % M + M) % M` — `r2 - r1` is freely negative.
- **Coprimeness is an assumption, not a check.** The `crt` above is silent if moduli share a factor; guard the inputs, or use the general merge that tests $g \mid (r_2 - r_1)$.
- **Empty system.** Zero congruences leave $x \equiv 0 \pmod 1$ — the identity the fold starts from. Harmless, but know that is what you get.

---

## References

1. Sunzi. _Sunzi Suanjing_ (孫子算經), c. 3rd–5th century AD. — The original "things unknown in number" problem, the theorem's namesake.

2. Qin Jiushao. _Mathematical Treatise in Nine Sections_ (數書九章), 1247. — The first general procedure for the theorem, the "Dayan aggregation" method.

3. Gauss, C. F. _Disquisitiones Arithmeticae_. Leipzig, 1801. Art. 32–36. — The modern formulation in the language of congruences.

4. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.5 — The Chinese Remainder Theorem and its computational use.

5. [CP Algorithms — Chinese Remainder Theorem](https://cp-algorithms.com/algebra/chinese-remainder-theorem.html)
