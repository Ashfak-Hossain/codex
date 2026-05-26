---
title: Modular Arithmetic
description: The congruence a ≡ b (mod m) — residue classes, why addition, subtraction, and multiplication pass cleanly through a modulus while division does not, normalizing negative remainders, the overflow bound, and the ring ℤ/mℤ that every modular algorithm computes inside.
tags:
  - number-theory
  - math
date: 2026-05-16
---

A clock never shows $25$ o'clock. Five hours after $21$:00 it reads $2$:00 — the count wraps once it passes $24$. **Modular arithmetic** is that wrap-around made into a number system: pick a modulus $m$, and from then on only the **remainder** after dividing by $m$ matters. Two numbers that leave the same remainder are treated as the same.

That single move — collapsing infinitely many integers into $m$ buckets — is what makes huge computations finite. A hash table folds keys into a fixed range, [[Binary Exponentiation|modular exponentiation]] keeps a $10^{18}$-digit power small, RSA lives entirely inside it. This page sets up the rules: what survives the collapse, what breaks, and the one trap (negative remainders) that bites every beginner.

_Prereqs: integer division and remainders · [[Greatest Common Divisor]]._

---

## At a Glance

$$
\boxed{\ a \equiv b \pmod m \quad\Longleftrightarrow\quad m \mid (a - b)\ }
$$

```cpp
int64_t mod(int64_t a, int64_t m) {   // canonical representative in [0, m)
  return ((a % m) + m) % m;           // works for negative a, unlike plain a % m
}
```

**Operations that pass through a modulus:** $+$, $-$, $\times$, and powers. **Division does not** — it needs a [[Modular Inverse]].

**Complexity:** every reduction is $O(1)$.

---

## Clocks and Remainders

Fix a modulus $m > 0$. Dividing any integer $a$ by $m$ leaves a remainder:

$$
a = q m + r, \qquad 0 \le r < m
$$

The remainder $r$ is written $a \bmod m$. Modular arithmetic throws away the quotient $q$ and keeps only $r$ — the position on the clock face, not how many full laps were run.

$$
17 \bmod 12 = 5, \qquad 29 \bmod 12 = 5, \qquad 5 \bmod 12 = 5
$$

All three sit at the same clock position. Modular arithmetic declares them **equal in the eyes of $m$** — and that declaration is the congruence relation.

---

## The Congruence Relation

Two integers are **congruent modulo $m$** when they leave the same remainder:

$$
a \equiv b \pmod m \quad\Longleftrightarrow\quad a \bmod m = b \bmod m \quad\Longleftrightarrow\quad m \mid (a - b)
$$

The three phrasings are interchangeable; the rightmost — "$m$ divides $a - b$" — is the one proofs lean on, because it turns a statement about remainders into plain divisibility.

$$
17 \equiv 5 \pmod{12}, \qquad -7 \equiv 5 \pmod{12}, \qquad 100 \equiv 0 \pmod{4}
$$

### An equivalence relation: residue classes

Congruence behaves like equality — it is **reflexive** ($a \equiv a$), **symmetric** ($a \equiv b \Rightarrow b \equiv a$), and **transitive** ($a \equiv b,\ b \equiv c \Rightarrow a \equiv c$); each follows in one line from $m \mid (a-b)$. So it partitions all of $\mathbb{Z}$ into exactly $m$ disjoint **residue classes**, one per remainder:

$$
\begin{array}{c|l}
\textbf{class} & \textbf{members} \\
\hline
[0] & \dots,\ -8,\ -4,\ 0,\ 4,\ 8,\ \dots \\
[1] & \dots,\ -7,\ -3,\ 1,\ 5,\ 9,\ \dots \\
[2] & \dots,\ -6,\ -2,\ 2,\ 6,\ 10,\ \dots \\
[3] & \dots,\ -5,\ -1,\ 3,\ 7,\ 11,\ \dots \\
\end{array}
\qquad (m = 4)
$$

The set of these $m$ classes is written $\mathbb{Z}/m\mathbb{Z}$. Every modular algorithm computes inside this finite set — that is the whole point: an unbounded problem becomes a bounded one.

---

## Arithmetic That Survives the Modulus

The reason congruence is useful, and not just a relabelling, is that it **respects arithmetic**. You can replace any number by a congruent one — _before, during, or after_ a calculation — and the result's class is unchanged.

> **Theorem (compatibility).** If $a \equiv b \pmod m$ and $c \equiv d \pmod m$, then
> $$a + c \equiv b + d, \qquad a - c \equiv b - d, \qquad a\,c \equiv b\,d \pmod m.$$

**Proof.** By definition $a - b = m s$ and $c - d = m t$ for some integers $s, t$.

- _Sum._ $(a + c) - (b + d) = (a - b) + (c - d) = m(s + t)$, so $m \mid (a+c)-(b+d)$. ✓
- _Product._ Split the difference through a shared middle term:
  $$a c - b d = c(a - b) + b(c - d) = m\,(c s + b t),$$
  so $m \mid a c - b d$. ✓

Subtraction is the sum rule applied to $-c$, and **powers** follow by induction from the product rule: $a^k \equiv b^k \pmod m$ for every $k \ge 0$. $\square$

In the form used constantly in code:

$$
(x + y) \bmod m = \bigl((x \bmod m) + (y \bmod m)\bigr) \bmod m
$$

$$
(x \cdot y) \bmod m = \bigl((x \bmod m)\cdot(y \bmod m)\bigr) \bmod m
$$

**Reduce early, reduce often.** Because reduction can happen at any stage, the practical rule is to take `% m` after every operation — that keeps intermediate values small and away from overflow without ever changing the answer.

### Worked example — reduce early

Compute ${\color{royalblue}123 \cdot 456} \bmod 100$ without ever forming the full product:

$$
123 \equiv {\color{crimson}23}, \qquad 456 \equiv {\color{crimson}56} \pmod{100}
$$

$$
123 \cdot 456 \;\equiv\; 23 \cdot 56 \;=\; 1288 \;\equiv\; {\color{crimson}88} \pmod{100}
$$

Check against the direct route: $123 \cdot 456 = 56088$, and $56088 \bmod 100 = 88$. ✓ The reduced path never handled a number above $1288$.

---

## What Breaks: Division

Addition, subtraction, multiplication, powers — all survive. **Division does not**, and seeing exactly why is the gateway to [[Modular Inverse|modular inverses]].

The hopeful move is _cancellation_: from $a c \equiv b c \pmod m$, conclude $a \equiv b$. It fails. Modulo $6$,

$$
{\color{crimson}4 \cdot 2} = 8 \equiv 2 \pmod 6, \qquad {\color{crimson}1 \cdot 2} = 2 \equiv 2 \pmod 6
$$

So $4 \cdot 2 \equiv 1 \cdot 2 \pmod 6$ — yet $4 \not\equiv 1 \pmod 6$. The common factor $2$ **cannot** be cancelled. The reason is structural: $\gcd(2, 6) = 2 \ne 1$, so multiplying by $2$ is not reversible mod $6$ — it merges distinct classes.

> **The rule.** Cancelling $c$ from a congruence mod $m$ is valid **iff** $\gcd(c, m) = 1$. Equivalently, "dividing by $c$" means multiplying by its [[Modular Inverse]] $c^{-1}$, which exists exactly when $c$ is coprime to $m$.

When $m$ is prime, every nonzero residue is coprime to it, so division always works — which is why prime moduli are the comfortable choice in competitive programming.

---

## Negative Numbers and Normalization

Mathematically $a \bmod m$ lives in $[0, m)$. **C++ disagrees.** The `%` operator truncates the quotient toward zero, so the remainder takes the sign of the dividend:

```cpp
-7 % 3   // == -1  in C++, not 2
 7 % -3  // ==  1
```

A negative remainder is a frequent source of wrong answers — array indices go out of bounds, hashes land in the wrong bucket. The fix is to normalize back into $[0, m)$:

```cpp
int64_t mod(int64_t a, int64_t m) {
  return ((a % m) + m) % m;
}
```

`a % m` lands in $(-m, m)$; adding `m` lifts it to $(0, 2m)$; the final `% m` folds it down to $[0, m)$. One `+ m` is enough — `a % m` is never more negative than $-(m-1)$.

### Trace: `mod(a, 7)`

|   $a$ | `a % 7` (C++) | `+ 7` |       `% 7` → result |
| ----: | ------------: | ----: | -------------------: |
|  $16$ |           $2$ |   $9$ | ${\color{crimson}2}$ |
| $-16$ |          $-2$ |   $5$ | ${\color{crimson}5}$ |
|  $-3$ |          $-3$ |   $4$ | ${\color{crimson}4}$ |
|   $7$ |           $0$ |   $7$ | ${\color{crimson}0}$ |

Check $-16$: mathematically $-16 = (-3)\cdot 7 + 5$, so $-16 \equiv 5 \pmod 7$. ✓

---

## Overflow

Reducing after every step keeps each _operand_ below $m$ — but the **product** of two operands near $m$ reaches roughly $(m - 1)^2$ before its own `% m` runs.

$$
m \approx 10^9 \;\Longrightarrow\; (m-1)^2 \approx 10^{18} \;<\; 9.2 \times 10^{18} \;=\; \texttt{int64\_t}_{\max}
$$

So a modulus up to about $3 \times 10^9$ is safe in `int64_t`. Past that — a modulus near $10^{18}$ — the intermediate product overflows even though both inputs are reduced. Then either:

- promote the multiplication to `__int128`, or
- use [[Binary Exponentiation|binary multiplication]] (`mulmod`), which builds the product by doubling-and-adding so it never forms a value above $m$.

> **Note.** `int` overflows far sooner: two operands near $10^9$ already exceed the `int` range $\approx 2.1 \times 10^9$. Default to `int64_t` (`long long`) for anything modular.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Case} & \textbf{Behaviour} & \textbf{Why} \\
\hline\\[-8pt]
m = 1 & \text{every } a \equiv 0 & \text{one residue class; } 1 \mid (a-b) \text{ always} \\[4pt]
m = 2 & a \bmod m \text{ is parity} & 0 = \text{even},\ 1 = \text{odd} \\[4pt]
m = 0 & \text{undefined} & \texttt{\% 0} \text{ is undefined behaviour in C++} \\[4pt]
a < 0 & \texttt{a \% m} < 0 \text{ in C++} & \text{truncation — normalize with } ((a\%m)+m)\%m \\[4pt]
\hline
\end{array}
$$

**Other things to watch:**

- **Negative modulus.** `a % -m` is legal C++ but rarely what you mean; pass a positive modulus and treat $m$ as $|m|$.
- **Reduce inputs first.** In any modular routine, take `a %= m` up front — it guards against a large or negative `a` slipping a stray overflow or negative remainder into the first step.
- **Mixing signed and unsigned.** Comparing or `%`-ing a signed value against an `unsigned`/`size_t` silently converts the negative one to a huge positive — keep modular code uniformly signed (`int64_t`).
- **The modulus is a constant — name it.** A typo in a repeated literal like `1000000007` is hard to spot; use `const int64_t MOD = 1e9 + 7;`.

---

## References

1. Gauss, C. F. _Disquisitiones Arithmeticae_. Leipzig, 1801. §§1–12 — Introduces the congruence notation $\equiv$ and the theory of residue classes.

2. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. §5 — Congruences and residues.

3. Niven, I., Zuckerman, H. S., Montgomery, H. L. _An Introduction to the Theory of Numbers_, 5th ed. Wiley, 1991. Ch. 2 — Congruences, residue classes, and the ring $\mathbb{Z}/m\mathbb{Z}$.

4. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31 — Number-theoretic algorithms and modular arithmetic on a computer.
