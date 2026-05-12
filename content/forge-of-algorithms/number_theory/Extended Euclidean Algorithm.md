---
title: Extended Euclidean Algorithm
description: Bézout's identity, back-substitution, the coefficient recurrence, and why this single algorithm unlocks modular inverse, Diophantine equations, and CRT.
tags:
  - number-theory
  - math
date: 2025-01-13
---

The plain GCD algorithm calculates **what** the greatest common divisor is. The extended version also shows **how to build it** — as a linear combination of the two inputs. That extra piece is what makes modular inverses, Diophantine equations, and the Chinese Remainder Theorem computable.

---

## Bézout's Identity

**Theorem.** For any integers $a$ and $b$, there exist integers $x, y \in \mathbb{Z}$ such that:

$$
{\color{royalblue}a}x + {\color{teal}b}y \;=\; \gcd({\color{royalblue}a},\, {\color{teal}b})
$$

This is not obvious. $\gcd(48, 18) = 6$, but is it possible to find integers $x, y$ such that $48x + 18y = 6$? Yes:

$$
48 \cdot ({\color{crimson}-1}) + 18 \cdot ({\color{teal}3}) = -48 + 54 = {\color{darkorange}6}
$$

The Extended Euclidean Algorithm finds exactly these $x$ and $y$, with the same runtime as plain GCD: $O(\log \min(a, b))$.

---

## Feel It: Back-Substitution

Run GCD **forward** to record the divisions, then read **backward** to assemble the combination.

### Forward

Run $\gcd({\color{royalblue}48},\ {\color{teal}18})$, writing every step as $a = q \cdot b + r$:

$$
\begin{array}{rclcr}
{\color{royalblue}48} &=& 2 \cdot {\color{teal}18} &+& {\color{darkorange}12} \\[6pt]
{\color{teal}18} &=& 1 \cdot {\color{darkorange}12} &+& {\color{crimson}6}  \\[6pt]
{\color{darkorange}12} &=& 2 \cdot {\color{crimson}6}  &+& 0
\end{array}
$$

Last nonzero remainder: $\gcd = {\color{crimson}6}$.

### Backward

Goal: express ${\color{crimson}6}$ using only the original numbers ${\color{royalblue}48}$ and ${\color{teal}18}$. Intermediate remainders (${\color{darkorange}12}$) must be eliminated one by one.

$$
{\color{crimson}6} \;=\; {\color{teal}18} - 1 \cdot \underbrace{{\color{darkorange}12}}_{\text{not original — remove this}}
$$

using ${\color{darkorange}12} = {\color{royalblue}48} - 2 \cdot {\color{teal}18}$:

$$
{\color{crimson}6}
\;=\; {\color{teal}18} - 1 \cdot \bigl({\color{royalblue}48} - 2 \cdot {\color{teal}18}\bigr)
$$

**Now**,

$$
{\color{crimson}6}
\;=\; {\color{teal}18} - {\color{royalblue}48} + 2 \cdot {\color{teal}18}
\;=\; 3 \cdot {\color{teal}18} - 1 \cdot {\color{royalblue}48}
$$

$$
\boxed{\ {\color{royalblue}48} \cdot ({\color{crimson}-1}) + {\color{teal}18} \cdot ({\color{teal}3}) = {\color{crimson}6} \qquad\Rightarrow\qquad x = {\color{crimson}-1},\quad y = {\color{teal}3}\ }
$$

The pattern is always the same: at each backward step, take the previous remainder and replace it with its definition from the line above. With $n$ GCD steps, have to do $n - 1$ substitutions. Every intermediate remainder cancels out and only the original inputs survive.

This method is perfect for understanding. In code it needs all intermediate steps stored, the recurrence avoids that entirely.

---

## The Recurrence

The recursive structure of GCD gives us a natural way to propagate the Bézout coefficients.

**Claim.** If `ext_gcd(b, a % b)` returns $(g,\ x_1,\ y_1)$ satisfying:

$$
{\color{teal}b} \cdot x_1 + ({\color{royalblue}a} \bmod {\color{teal}b}) \cdot y_1 \;=\; g
$$

then we can derive the solution for `ext_gcd(a, b)`.

**Derivation.** Since ${\color{royalblue}a} \bmod {\color{teal}b} = {\color{royalblue}a} - \lfloor {\color{royalblue}a}/{\color{teal}b} \rfloor \cdot {\color{teal}b}$, substitute:

$$
{\color{teal}b} \cdot x_1 + \Bigl({\color{royalblue}a} - \Bigl\lfloor\frac{{\color{royalblue}a}}{{\color{teal}b}}\Bigr\rfloor \cdot {\color{teal}b}\Bigr) \cdot y_1 \;=\; g
$$

$$
{\color{royalblue}a} \cdot y_1 \;+\; {\color{teal}b} \cdot \Bigl(x_1 - \Bigl\lfloor\frac{{\color{royalblue}a}}{{\color{teal}b}}\Bigr\rfloor \cdot y_1\Bigr) \;=\; g
$$

So the coefficients for $(a, b)$ are:

$$
\boxed{\ x \;=\; y_1 \qquad y \;=\; x_1 - \left\lfloor\frac{a}{b}\right\rfloor \cdot y_1\ }
$$

**Base case.** When $b = 0$: $\gcd(a, 0) = a$, and $a \cdot 1 + 0 \cdot 0 = a$, so $x = 1,\ y = 0$.

---

## The Algorithm

Recursive - exact derivation directly:

```cpp
int ext_gcd(int a, int b, int& x, int& y) {
  if (b == 0) {
    x = 1;
    y = 0;
    return a;
  }
  int x1, y1;
  int d = ext_gcd(b, a % b, x1, y1);
  x = y1;
  y = x1 - y1 * (a / b);
  return d;
}

// Usage
int x, y;
int g = ext_gcd(48, 18, x, y);
// g=6, x=-1, y=3  =>  48*(-1) + 18*3 = 6
```

Iterative - no stack, a little bit faster than recursive:

```cpp
int ext_gcd(int a, int b, int& x, int& y) {
  x = 1, y = 0;
  int x1 = 0, y1 = 1, a1 = a, b1 = b;
  while (b1) {
    int q = a1 / b1;
    tie(x,  x1) = make_tuple(x1,  x  - q * x1);
    tie(y,  y1) = make_tuple(y1,  y  - q * y1);
    tie(a1, b1) = make_tuple(b1,  a1 - q * b1);
  }
  return a1;
}
```

### Trace: `ext_gcd(48, 18, x, y)`

| $a_1$ | $b_1$ | $q$ | $x$ | $y$ |
| ----: | ----: | :-: | --: | --: |
|    48 |    18 |  —  |   1 |   0 |
|    18 |    12 |  2  |   0 |   1 |
|    12 |     6 |  1  |   1 |  −2 |
|     6 |     0 |  2  |  −1 |   3 |

Result: $x = {\color{crimson}-1},\ y = {\color{teal}3}$. Check: $48 \cdot (-1) + 18 \cdot 3 = 6$.

---

## The General Solution

The Bézout pair $(x_0, y_0)$ is **one** solution. Every other solution has the form:

$$
x \;=\; x_0 + \frac{b}{g} \cdot k
\qquad
y \;=\; y_0 - \frac{a}{g} \cdot k
\qquad k \in \mathbb{Z}
$$

where $g = \gcd(a, b)$. There are infinitely many integer solutions, equally spaced.

**Why?** Adding $b/g$ to $x$ and subtracting $a/g$ from $y$ preserves the sum: the change to $ax$ is $a \cdot b/g$, the change to $by$ is $-b \cdot a/g$, and they cancel.

---

## What It Unlocks

The Bézout pair $(x, y)$ is the key for many topics - each one is covered fully in own blog, so just a pointer here.

**[[Modular Inverse]]** — If $\gcd(a, m) = 1$, then running `ext_gcd(a, m, x, y)` gives you $ax + my = 1$, which means $ax \equiv 1 \pmod{m}$. That $x$ (normalized to $[0, m)$) is the modular inverse of $a$. If $\gcd(a, m) \neq 1$, no inverse exists — the Bézout sum is always a multiple of the GCD, so it can never reach 1.

**[[Linear Diophantine Equations]]** — The equation $ax + by = c$ has integer solutions if and only if $\gcd(a, b) \mid c$. When it does, you get the full solution family by scaling the Bézout pair by $c / g$ and using the general solution formula from the section above.

**[[Chinese Remainder Theorem]]** — Merging two congruences $x \equiv r_1 \pmod{m_1}$ and $x \equiv r_2 \pmod{m_2}$ reduces to solving a linear Diophantine equation, which needs exactly this algorithm.

---

## Maybe you don't need these -\_-

**The coefficients are bounded.** If $b > 0$, the algorithm guarantees $|x| \leq b / (2g)$ and $|y| \leq a / (2g)$. It won't give astronomically large coefficients.

**Sign of $x$ and $y$.** For $a, b > 0$, one of $x, y$ will be non-positive and the other non-negative (they have opposite signs, unless $\gcd = a$ or $\gcd = b$).

**$\gcd(a, b) = 1$ is necessary for modular inverse.** If $\gcd(a, m) = d > 1$, then $ax + my$ is always a multiple of $d$, so it can never equal 1. No inverse exists.

---

## References

1. Bézout, É. _Théorie générale des équations algébriques_. Paris, 1779. — Statement of the identity for polynomials; the integer case was known earlier through Euclid's work.

2. Knuth, D. E. _The Art of Computer Programming_, Vol. 2: Seminumerical Algorithms_, 3rd ed. Addison-Wesley, 1997. §4.5.2 — Full derivation of the extended algorithm and the coefficient bounds.

3. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. Theorem 25 — Proof of Bézout's identity from first principles.

4. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.2 — Extended GCD, modular inverse, and their role in RSA.
