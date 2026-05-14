---
title: Extended Euclidean Algorithm
description: Bézout's identity, back-substitution, the coefficient recurrence, correctness proof, and how this one algorithm sits underneath modular inverses, Diophantine equations, and CRT.
tags:
  - number-theory
  - math
date: 2026-01-12
---

Plain GCD answers _what_ the greatest common divisor of $a$ and $b$ is. The **Extended Euclidean Algorithm** answers something stronger, _how to build it_ — it returns two integers $x, y$ such that:

$$
{\color{royalblue}a}\,x \;+\; {\color{teal}b}\,y \;=\; \gcd(a,\, b)
$$

Same runtime as plain GCD ($O(\log \min(a, b))$), but those two extra integers are the missing ingredient behind **modular inverses**, **Diophantine equations**, and the **Chinese Remainder Theorem**.

_Prereqs: [[Greatest Common Divisor]] · basic modular arithmetic._

---

## Bézout's Identity

**Theorem (Bézout).** For any integers $a$ and $b$, integers $x, y \in \mathbb{Z}$ exist such that:

$$
{\color{royalblue}a}\,x \;+\; {\color{teal}b}\,y \;=\; \gcd({\color{royalblue}a},\, {\color{teal}b})
$$

This is not obvious. $\gcd(48, 18) = 6$ — but can we really find _integers_ $x, y$ (not fractions) with $48x + 18y = 6$? Yes:

$$
{\color{royalblue}48} \cdot ({\color{crimson}-1}) \;+\; {\color{teal}18} \cdot ({\color{teal}3}) \;=\; -48 + 54 \;=\; {\color{darkorange}6}
$$

Existence can be proved abstractly (well-ordering: the smallest positive value of $ax + by$ divides both $a$ and $b$). But the cleaner approach is **constructive**: the algorithm below actually finds $(x, y)$, which proves they exist by producing them.

---

## Walking the Chain: Back-Substitution

Run plain GCD on $({\color{royalblue}48},\ {\color{teal}18})$. Every division has the form $a = q \cdot b + r$:

$$
\begin{array}{rclcr}
{\color{royalblue}48} &=& 2 \cdot {\color{teal}18}       &+& {\color{darkorange}12} \\[4pt]
{\color{teal}18}       &=& 1 \cdot {\color{darkorange}12} &+& {\color{crimson}6}  \\[4pt]
{\color{darkorange}12} &=& 2 \cdot {\color{crimson}6}    &+& 0
\end{array}
$$

The last nonzero remainder is the GCD: ${\color{crimson}6}$.

Each row also tells us how to express a remainder as a combination of the two numbers above it:

$$
{\color{darkorange}12} \;=\; {\color{royalblue}48} - 2 \cdot {\color{teal}18}
\qquad\qquad
{\color{crimson}6} \;=\; {\color{teal}18} - 1 \cdot {\color{darkorange}12}
$$

The trick is **chaining these together**.

### Substitute upward

Start with the GCD expressed in terms of the previous two remainders:

$$
{\color{crimson}6} \;=\; {\color{teal}18} - 1 \cdot \underbrace{{\color{darkorange}12}}_{\text{not original — eliminate}}
$$

Replace ${\color{darkorange}12}$ with its expression in terms of $48$ and $18$:

$$
{\color{crimson}6} \;=\; {\color{teal}18} - 1 \cdot \bigl({\color{royalblue}48} - 2 \cdot {\color{teal}18}\bigr)
$$

Expand and collect like terms:

$$
{\color{crimson}6} \;=\; \underbrace{{\color{teal}18} + 2 \cdot {\color{teal}18}}_{3 \cdot {\color{teal}18}} \;-\; {\color{royalblue}48} \;=\; 3 \cdot {\color{teal}18} \;-\; 1 \cdot {\color{royalblue}48}
$$

Only the original numbers remain — done:

$$
\boxed{\ {\color{royalblue}48} \cdot ({\color{crimson}-1}) + {\color{teal}18} \cdot ({\color{teal}3}) = {\color{crimson}6} \qquad\Rightarrow\qquad x = -1,\ y = 3\ }
$$

The pattern: at each backward step, replace the latest intermediate remainder with the expression from the line above. With $n$ division steps, you do $n - 1$ substitutions. Every intermediate cancels out, only the originals survive.

This is the **constructive proof** of Bézout's identity. But coding it directly is awkward because you need to store every quotient before unwinding. The next section avoids that by computing the coefficients during the _forward_ pass.

---

## The Recurrence

We want $(x, y)$ such that $a x + b y = g$ without storing the full chain.

**Setup.** Suppose the recursive call `ext_gcd(b, a mod b)` has already returned coefficients $(x_1, y_1)$ satisfying:

$$
{\color{teal}b} \cdot x_1 \;+\; ({\color{royalblue}a} \bmod {\color{teal}b}) \cdot y_1 \;=\; g
$$

We need to convert these into $(x, y)$ for the original pair $(a, b)$.

**Derivation.** Use the definition $a \bmod b = a - \lfloor a/b \rfloor \cdot b$:

$$
{\color{teal}b} \cdot x_1 \;+\; \Bigl({\color{royalblue}a} - \bigl\lfloor a/b \bigr\rfloor \cdot {\color{teal}b}\Bigr) \cdot y_1 \;=\; g
$$

Regroup so the $a$ and $b$ terms are separated:

$$
{\color{royalblue}a} \cdot \underbrace{y_1}_{x} \;+\; {\color{teal}b} \cdot \underbrace{\Bigl(x_1 - \bigl\lfloor a/b \bigr\rfloor \cdot y_1\Bigr)}_{y} \;=\; g
$$

That's the answer:

$$
\boxed{\ x \;=\; y_1 \qquad y \;=\; x_1 - \bigl\lfloor a/b \bigr\rfloor \cdot y_1\ }
$$

**Base case.** When $b = 0$: $\gcd(a, 0) = a$, and $a \cdot 1 + 0 \cdot 0 = a$, so $x = 1,\ y = 0$.

Two formulas and a base case — that's the whole algorithm.

---

## Proof of Correctness

**Claim.** `ext_gcd(a, b)` returns $(g, x, y)$ with $g = \gcd(a, b)$ and $a x + b y = g$.

**Induction on $b$.**

_Base case_ ($b = 0$). The function returns $(a, 1, 0)$. Indeed $\gcd(a, 0) = a$, and $a \cdot 1 + 0 \cdot 0 = a$.

_Inductive step_ ($b > 0$). Assume the recursive call `ext_gcd(b, a mod b)` is correct: it returns $(g, x_1, y_1)$ with $g = \gcd(b, a \bmod b)$ and $b x_1 + (a \bmod b) y_1 = g$.

From [[Greatest Common Divisor |plain Euclid]], $\gcd(b, a \bmod b) = \gcd(a, b)$, so the returned $g$ is correct. The derivation in the previous section shows the new coefficients $(y_1,\ x_1 - \lfloor a/b \rfloor \cdot y_1)$ satisfy $a x + b y = g$.

**Termination.** Since $0 \le a \bmod b < b$, the second argument strictly decreases on each call. Eventually it hits $0$ and the base case triggers.

---

## The Algorithm

Recursive — mirrors the derivation:

```cpp
int64_t ext_gcd(int64_t a, int64_t b, int64_t& x, int64_t& y) {
  if (b == 0) {
    x = 1;
    y = 0;
    return a;
  }
  int64_t x1, y1;
  int64_t d = ext_gcd(b, a % b, x1, y1);
  x = y1;
  y = x1 - y1 * (a / b);
  return d;
}

// Usage
int64_t x, y;
int64_t g = ext_gcd(48, 18, x, y);
// g = 6, x = -1, y = 3  =>  48*(-1) + 18*3 = 6
```

Iterative — no stack, slightly faster:

```cpp
int64_t ext_gcd(int64_t a, int64_t b, int64_t& x, int64_t& y) {
  x = 1, y = 0;
  int64_t x1 = 0, y1 = 1, a1 = a, b1 = b;
  while (b1) {
    int64_t q = a1 / b1;
    tie(x,  x1) = make_tuple(x1, x  - q * x1);
    tie(y,  y1) = make_tuple(y1, y  - q * y1);
    tie(a1, b1) = make_tuple(b1, a1 - q * b1);
  }
  return a1;
}
```

**Why the iterative form works.** It's the same recurrence unrolled forward. The remainder pair evolves by one linear map

$$
\begin{pmatrix} a_1 \\ b_1 \end{pmatrix}_{i+1} \;=\; \begin{pmatrix} 0 & 1 \\ 1 & -q_i \end{pmatrix} \begin{pmatrix} a_1 \\ b_1 \end{pmatrix}_i, \qquad q_i = \left\lfloor \tfrac{a_1}{b_1} \right\rfloor_i
$$

and the **same matrix** is applied to the coefficient pairs $(x, x_1)$ and $(y, y_1)$ — that is why the three `tie()` updates have identical shape. The remainder pair drives the quotients $q_i$; the other two ride along. The invariants

$$
a \cdot x + b \cdot x_1 \;=\; a_1, \qquad a \cdot y + b \cdot y_1 \;=\; b_1
$$

hold after every iteration — when $b_1 = 0$ the first reads $a\,x + b\,x_1 = a_1 = g$, surfacing the Bézout pair. This matrix view is the seed of [[Continued Fractions]] and the [[Stern–Brocot Tree]].

### Trace: `ext_gcd(48, 18, x, y)`

| $a_1$ | $b_1$ | $q$ | $x$ | $y$ |
| ----: | ----: | :-: | --: | --: |
|    48 |    18 |  —  |   1 |   0 |
|    18 |    12 |  2  |   0 |   1 |
|    12 |     6 |  1  |   1 |  −2 |
|     6 |     0 |  2  |  −1 |   3 |

Output: $g = 6$, $x = -1$, $y = 3$. Verify: $48 \cdot (-1) + 18 \cdot 3 = 6$.

---

## All Integer Solutions

The algorithm returns **one** $(x_0, y_0)$ — but there are infinitely many integer pairs satisfying $a x + b y = g$. The full family is:

$$
\boxed{\ x \;=\; x_0 + \dfrac{b}{g} \cdot k, \qquad y \;=\; y_0 - \dfrac{a}{g} \cdot k, \qquad k \in \mathbb{Z}\ }
$$

**Why this works.** Adding $b/g$ to $x$ adds $a \cdot b/g$ to the sum $ax$. Subtracting $a/g$ from $y$ subtracts $b \cdot a/g$ from $by$. Both changes equal $ab/g$ in magnitude, opposite in sign — they cancel.

**Why it's the only family.** Suppose $(x', y')$ is another solution: $a x' + b y' = g$. Subtracting from $a x_0 + b y_0 = g$:

$$
a (x_0 - x') = b (y' - y_0)
$$

Both sides are divisible by $g$ (since $g \mid a$ and $g \mid b$), so dividing gives an integer identity:

$$
(a/g)(x_0 - x') = (b/g)(y' - y_0)
$$

Since $\gcd(a/g,\ b/g) = 1$, the factor $b/g$ must divide $x_0 - x'$. So $x' = x_0 + k \cdot (b/g)$ for some integer $k$, and the matching $y' = y_0 - k \cdot (a/g)$ follows.

**Example.** For $48 x + 18 y = 6$, $g = 6$, so $b/g = 3$ and $a/g = 8$. Starting from $(x_0, y_0) = (-1, 3)$:

|  $k$ |  $x$ |   $y$ | check            |
| ---: | ---: | ----: | :--------------- |
| $-1$ | $-4$ |  $11$ | $-192 + 198 = 6$ |
|  $0$ | $-1$ |   $3$ | $-48 + 54 = 6$   |
|  $1$ |  $2$ |  $-5$ | $96 - 90 = 6$    |
|  $2$ |  $5$ | $-13$ | $240 - 234 = 6$  |

### Smallest non-negative $x$

Most CP problems don't want any solution — they want the smallest $x \ge 0$. With $(x_0, y_0)$ in hand, reduce $x_0$ modulo $b/g$:

$$
\boxed{\ x_{\min} \;=\; \Bigl(\,x_0 \bmod \tfrac{b}{g} \;+\; \tfrac{b}{g}\,\Bigr) \bmod \tfrac{b}{g}\ }
$$

The double-mod handles the C/C++ convention where `%` of a negative can return a negative. The matching $y$ is recovered from $y = (g - a x_{\min}) / b$.

### Bridge to linear congruences

The same machinery solves $a x \equiv b \pmod m$: it has a solution iff $g = \gcd(a, m) \mid b$, in which case there are exactly $g$ distinct solutions modulo $m$, all obtained from one Bézout pair. Full treatment in its own page — [[Linear Congruences]].

---

## What It Unlocks

The Bézout pair $(x, y)$ is the key ingredient for several topics, each covered fully in its own page:

**[[Modular Inverse]]** — when $\gcd(a, m) = 1$, `ext_gcd(a, m, x, y)` returns $x$ satisfying $a x + m y = 1$, which is exactly $a x \equiv 1 \pmod{m}$. Normalize $x$ to $[0, m)$ and you have $a^{-1} \bmod m$. If $\gcd(a, m) > 1$, the Bézout sum is always a multiple of the GCD and can never equal $1$ — no inverse exists.

**[[Linear Diophantine Equations]]** — $a x + b y = c$ has integer solutions iff $\gcd(a, b) \mid c$. When it does, scale the Bézout pair by $c / g$ and apply the general-solution family above.

**[[Chinese Remainder Theorem]]** — merging $x \equiv r_1 \pmod{m_1}$ and $x \equiv r_2 \pmod{m_2}$ reduces to solving a linear Diophantine equation, which uses this algorithm at its heart.

---

## Notes Worth Knowing

**Coefficients stay small.** For $b > 0$, the algorithm guarantees $|x| \le b/(2g)$ and $|y| \le a/(2g)$. The bound is preserved inductively by the updates $x \leftarrow y_1$ and $y \leftarrow x_1 - q\, y_1$ — see Knuth §4.5.2 for the full proof. So the final $(x, y)$ never blow up beyond the inputs.

**Use 64-bit integers.** Even with the bound above, the intermediate $q \cdot x_1$ during iteration can briefly exceed it. For inputs near $10^9$ or larger, declare every variable (`a, b, x, y, x1, y1, q`) as `int64_t` — the snippets above already do this. For inputs up to $10^{18}$ with $g = 1$, you may need `__int128` for the products.

**Sign behavior.** For positive inputs $a, b > 0$: if $a \nmid b$ and $b \nmid a$, then $\operatorname{sgn}(x) = -\operatorname{sgn}(y)$ — the two coefficients always come out with opposite signs. In the divisible cases one of them is zero.

**Edge cases.** `ext_gcd(a, 0)` returns $(a, 1, 0)$ directly. `ext_gcd(0, b)` recurses once and returns $(b, 0, 1)$. Both are correct. `ext_gcd(0, 0)` is **undefined by convention** — $\gcd(0,0) = 0$ and any $(x, y)$ satisfies $0\cdot x + 0\cdot y = 0$, so there is no canonical pair. Guard at the call site.

**Negative inputs.** The algorithm runs correctly for negative $a$ or $b$, but the conventional GCD is always non-negative. If your application requires that, take absolute values first.

**Why $\gcd(a, m) = 1$ matters for inverse.** $a x + m y$ is always a multiple of $\gcd(a, m)$. If that GCD is $d > 1$, the sum can never equal $1$, so $a$ has no inverse modulo $m$.

---

## References

1. Bézout, É. _Théorie générale des équations algébriques_. Paris, 1779. — Statement of the identity for polynomials; the integer case was already implicit in Euclid's work.

2. Knuth, D. E. _The Art of Computer Programming_, Vol. 2: _Seminumerical Algorithms_, 3rd ed. Addison-Wesley, 1997. §4.5.2 — Full derivation, coefficient bounds, and proof that the algorithm produces the smallest-magnitude solution.

3. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. Theorem 25 — Well-ordering proof of Bézout's identity.

4. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.2 — Extended GCD, modular inverse, and the RSA connection.