---
title: Linear Congruences
description: Solving a·x ≡ b (mod m) — the solvability test gcd(a,m) ∣ b, why a solvable congruence has exactly gcd(a,m) solutions spaced m/gcd apart, building them from a single Bézout pair, and the reduction that collapses the coprime case to a modular inverse.
tags:
  - number-theory
  - math
date: 2026-05-16
---

[[Modular Inverse]] cracked one equation: $a x \equiv 1 \pmod m$. The **linear congruence** is the general form,

$$
a x \equiv b \pmod m
$$

and the jump is larger than the extra symbol suggests. An inverse exists only when $a$ is coprime to $m$ — drop that guarantee and the equation can have **no solution, one, or many**. A clock with $12$ hours: $4x \equiv 8$ has two answers ($x = 2$ and $x = 8$), while $4x \equiv 5$ has none, because $4x$ on a $12$-clock only ever lands on even numbers.

The whole behaviour is governed by a single quantity, $\gcd(a, m)$. This page pins down when a solution exists, exactly how many there are, and how to list them all from one run of the [[Extended Euclidean Algorithm]].

_Prereqs: [[Modular Arithmetic|modular arithmetic]] · [[Greatest Common Divisor]] · [[Extended Euclidean Algorithm]] · [[Modular Inverse]]._

---

## At a Glance

$$
\boxed{\ a x \equiv b \pmod m \ \text{ is solvable} \iff g \mid b, \quad g = \gcd(a, m)\ }
$$

When it is solvable there are **exactly $g$** solutions modulo $m$, spaced $m/g$ apart.

```cpp
// ext_gcd: returns g = gcd(a,b) and x,y with a*x + b*y = g — see Extended Euclidean.
int64_t ext_gcd(int64_t a, int64_t b, int64_t& x, int64_t& y) {
  if (b == 0) { x = 1; y = 0; return a; }
  int64_t x1, y1;
  int64_t g = ext_gcd(b, a % b, x1, y1);
  x = y1;
  y = x1 - y1 * (a / b);
  return g;
}

// All solutions of a*x ≡ b (mod m) in [0, m). Empty vector if none exist.
vector<int64_t> solve_congruence(int64_t a, int64_t b, int64_t m) {
  a = ((a % m) + m) % m;
  b = ((b % m) + m) % m;
  int64_t x, y;
  int64_t g = ext_gcd(a, m, x, y);
  if (b % g != 0) return {};                       // g ∤ b  =>  no solution
  int64_t step = m / g;
  int64_t x0 = ((x % step) * ((b / g) % step)) % step;
  x0 = (x0 % step + step) % step;                  // one solution, in [0, step)
  vector<int64_t> sols;
  for (int64_t k = 0; k < g; k++)
    sols.push_back(x0 + k * step);
  return sols;
}
```

**Complexity:** $O(\log m)$ for the Euclidean call, plus $O(g)$ to list the solutions.

---

## The Equation

A linear congruence asks for every integer $x$ with

$$
a x \equiv b \pmod m,
$$

counted up to congruence — solutions are residue classes modulo $m$, not individual integers. The first move is to stop reading "$\equiv$" and start reading "$=$ plus a multiple of $m$":

$$
a x \equiv b \pmod m
\quad\Longleftrightarrow\quad
a x - b = m(-y) \ \text{ for some integer } y
\quad\Longleftrightarrow\quad
a x + m y = b .
$$

So a linear congruence in one unknown is a **linear Diophantine equation** in two unknowns wearing a disguise. Everything below is really a fact about which integers the expression $a x + m y$ can hit.

---

## When Is There a Solution?

> **Theorem (solvability).** $a x \equiv b \pmod m$ has a solution **if and only if** $g \mid b$, where $g = \gcd(a, m)$.

**Proof.** By the rewrite above, a solution exists iff $b$ can be written as $a x + m y$ for some integers $x, y$. Now [[Extended Euclidean Algorithm|Bézout]] tells us exactly which integers are reachable: the set

$$
\{\, a x + m y : x, y \in \mathbb{Z} \,\}
$$

is precisely the set of **multiples of $g = \gcd(a, m)$**. Every term $a x + m y$ is divisible by $g$ (since $g$ divides both $a$ and $m$), and Bézout produces the value $g$ itself, hence every multiple of it. So $b$ is reachable iff $b$ is a multiple of $g$. $\square$

The clock example falls straight out. For $4x \equiv 5 \pmod{12}$, $g = \gcd(4, 12) = 4$, and $4 \nmid 5$ — unsolvable. For $4x \equiv 8 \pmod{12}$, $4 \mid 8$ — solvable.

---

## How Many Solutions?

A solvable congruence is never _uniquely_ solvable unless $g = 1$. The exact count is $g$.

> **Theorem (count).** If $g \mid b$, then $a x \equiv b \pmod m$ has **exactly $g$** solutions modulo $m$.

**Proof.** Suppose $x$ and $x'$ are both solutions. Then $a x \equiv a x' \pmod m$, so $m \mid a(x - x')$. Divide through by $g$:

$$
\frac{m}{g} \;\Bigm|\; \frac{a}{g}\,(x - x') .
$$

Since $\gcd(a/g,\ m/g) = 1$, the factor $a/g$ carries no weight — $m/g$ must divide $x - x'$ itself. So **any two solutions are congruent modulo $m/g$**, and conversely anything congruent to a solution modulo $m/g$ is again a solution. The residue classes modulo $m$ that collapse to a single class modulo $m/g$ are

$$
x_0,\quad x_0 + \tfrac{m}{g},\quad x_0 + 2\tfrac{m}{g},\quad \dots,\quad x_0 + (g-1)\tfrac{m}{g},
$$

exactly $g$ of them. $\square$

The picture: the solutions form an **arithmetic progression** with common difference $m/g$, evenly threaded around the modulus.

---

## Finding the Solutions

Two equivalent routes — pick whichever reads more clearly.

### Route 1 — scale a Bézout pair

Run [[Extended Euclidean Algorithm|`ext_gcd`]] on $(a, m)$ to get $g$ and a pair $(x, y)$ with $a x + m y = g$. Multiply the whole identity by $b/g$ (an integer, since $g \mid b$):

$$
a \cdot \underbrace{\left(x \cdot \tfrac{b}{g}\right)}_{x_0} + m \cdot \left(y \cdot \tfrac{b}{g}\right) = b
\quad\Longrightarrow\quad
a\, x_0 \equiv b \pmod m .
$$

That $x_0$ is one solution; the other $g - 1$ come from adding multiples of $m/g$.

### Route 2 — divide through, then invert

Because $g$ divides $a$, $b$, and $m$, the whole congruence can be **reduced**:

$$
a x \equiv b \pmod m
\quad\Longrightarrow\quad
\frac{a}{g}\, x \equiv \frac{b}{g} \pmod{\frac{m}{g}} .
$$

Now $\gcd(a/g,\ m/g) = 1$, so $a/g$ is invertible and the reduced congruence has the **unique** solution

$$
x \equiv \frac{b}{g} \cdot \left(\frac{a}{g}\right)^{\!-1} \pmod{\frac{m}{g}} .
$$

This is the cleanest way to _see_ the structure: a linear congruence is a [[Modular Inverse|modular inverse]] problem hiding behind a common factor $g$. Strip the factor and what is left is a single inverse; the original modulus $m$ then unfolds that one reduced solution into $g$ copies.

When $b = 1$ and $g = 1$, both routes collapse to exactly the modular inverse — the linear congruence is its strict generalization.

---

## Worked Example

Solve $\;{\color{royalblue}6x \equiv 8 \pmod{14}}$.

**Solvable?** $g = \gcd(6, 14) = 2$, and $2 \mid 8$. ✓ — so there are exactly $g = 2$ solutions.

**Reduce** (Route 2). Divide through by $g = 2$:

$$
3x \equiv 4 \pmod 7 .
$$

**Invert.** $\gcd(3, 7) = 1$, and $3^{-1} \equiv 5 \pmod 7$ (since $3 \cdot 5 = 15 \equiv 1$). So

$$
x \equiv 4 \cdot 5 = 20 \equiv {\color{crimson}6} \pmod 7 .
$$

**Unfold** to modulus $14$, stepping by $m/g = 7$:

$$
x \equiv {\color{crimson}6} \quad\text{and}\quad x \equiv 6 + 7 = {\color{crimson}13} \pmod{14}.
$$

**Check.** $6 \cdot 6 = 36 = 2 \cdot 14 + 8 \equiv 8$ ✓, and $6 \cdot 13 = 78 = 5 \cdot 14 + 8 \equiv 8$ ✓.

### Trace: `solve_congruence(6, 8, 14)`

| stage            | value                                                     |
| :--------------- | :-------------------------------------------------------- |
| `ext_gcd(6, 14)` | $g = 2,\ x = -2,\ y = 1$ (check: $6(-2)+14(1)=2$)         |
| solvable?        | $8 \bmod 2 = 0$ ✓                                         |
| `step` $= m/g$   | $14 / 2 = 7$                                              |
| $x_0$            | $(-2) \cdot (8/2) = -8 \equiv {\color{crimson}6} \pmod 7$ |
| solutions        | $6,\quad 6 + 7 = 13$                                      |

And the unsolvable sibling: $6x \equiv 9 \pmod{14}$ has $g = 2$ with $2 \nmid 9$, so `solve_congruence` returns an empty vector — no $x$ exists.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Case} & \textbf{Behaviour} & \textbf{Why} \\
\hline\\[-8pt]
g \nmid b & \text{no solution} & b \text{ is not a reachable value } a x + m y \\[4pt]
g = 1 & \text{unique solution} & a \text{ invertible: } x \equiv b\,a^{-1} \\[4pt]
g = m & \text{solvable} \Rightarrow a \equiv 0,\ \text{all } x & a x \equiv 0 \equiv b \text{ for every } x \\[4pt]
b = 0 & x \equiv 0 \ \text{and } g-1 \text{ more} & x = 0 \text{ always works} \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **Normalize first.** Reduce $a$ and $b$ into $[0, m)$ before the Euclidean call; a negative or oversized input otherwise leaks a wrong sign into $x_0$.
- **Overflow.** The product $x \cdot (b/g)$ can reach $\approx m^2$. For $m$ near $10^9$ it fits in `int64_t`; for $m$ near $10^{18}$ promote to `__int128`. Reducing `x % step` first (as the code does) keeps it small in the common case.
- **Don't forget the other $g-1$.** A frequent bug is returning only $x_0$. Unless $g = 1$, that is a fraction of the answer set — list the full progression $x_0 + k\,(m/g)$.
- **$m = 1$.** Every integer is $\equiv 0 \pmod 1$, so the single solution is $x \equiv 0$. The formula handles it; just be aware the "answer" is trivial.

---

## References

1. Gauss, C. F. _Disquisitiones Arithmeticae_. Leipzig, 1801. §§29–37 — Linear congruences, solvability, and the count of incongruent solutions.

2. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. §5.4 — Congruences of the first degree.

3. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.4 — Solving modular linear equations.

4. [CP Algorithms — Linear Congruence Equation](https://cp-algorithms.com/algebra/linear_congruence_equation.html)
