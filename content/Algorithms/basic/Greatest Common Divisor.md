---
title: GCD - 2300 Years old Algorithm
description: GCD - from Euclid's ancient proof to key properties, LCM, coprimeness, and every competitive programming pattern you need to recognize.
tags:
  - basic
  - math
date: 2025-01-13
---

Around <font color="#4f81bd">300</font> BC, a Greek mathematician Euclid wrote _The Elements_ - 13 books that became the most influential mathematics text in history. Book VII contains something interesting: an algorithm to find the greatest common divisor of two numbers. 2300 years later, that same algorithm runs in every computer, inside cryptography libraries, compilers, and cp solutions.

---

## What Is GCD?

The **Greatest Common Divisor** of two integers $a$ and $b$. $\gcd(a, b)$, is the largest positive integer that divides both without remainder. Also called **HCF** (Highest Common Factor) or **GCF** (Greatest Common Factor).

$$\gcd(a, b) = \max\{d \in \mathbb{Z}^+ : d \mid a \text{ and } d \mid b\}$$

Let's find $\gcd(48, 18)$ - list all divisors, find the common ones:

$$
\begin{array}{cl}
\text{Divisors of } 48\text{:} & \{{\color{royalblue}1},\ {\color{royalblue}2},\ {\color{royalblue}3},\ 4,\ {\color{crimson}\mathbf{6}},\ 8,\ 12,\ 16,\ 24,\ 48\} \\[6pt]
\text{Divisors of } 18\text{:} & \{{\color{royalblue}1},\ {\color{royalblue}2},\ {\color{royalblue}3},\ {\color{crimson}\mathbf{6}},\ 9,\ 18\} \\[6pt]
\hline\\[-8pt]
\gcd(48,\ 18) & = \boxed{\ {\color{crimson}\mathbf{6}}\ }
\end{array}
$$

Simple. But what if the numbers are $10^{18}$? We need something efficient.

### The Zeroth Convention

$$\gcd(a,\ 0) = a \qquad \gcd(0,\ 0) = 0$$

Zero is divisible by every integer, so every integer divides $(a, 0)$, making $a$ the greatest. This will be the base case of this algorithm.

---

## The Naive Approach

Iterate from $\min(a, b)$ to 1 and return the first common divisor:

```cpp
auto gcd_naive = [](int a, int b) -> int {
  for(int i = min(a, b); i >= 1; i--) {
    if(a % i == 0 and b % i == 0) {
      return i;
    }
  }
  return 1;
};
```

**Complexity:** $O(\min(a, b))$. If $a = 10^9$, that's a billion iterations. Useless for large inputs.

---

## Euclid's Algorithm

Subtracting $b$ from $a$ doesn't change the GCD:

$$
\gcd({\color{royalblue}a},\ {\color{teal}b}) \;=\; \gcd({\color{royalblue}a} - {\color{teal}b},\ {\color{teal}b})
$$

Repeated subtraction is correct but slow — $\gcd(10^9,\ 1)$ takes $10^9$ steps. Modulo does all those subtractions into one shot:

$$
\underbrace{{\color{royalblue}a} - {\color{teal}b} - \cdots - {\color{teal}b}}_{\lfloor a/b \rfloor \text{ times}} \;=\; {\color{darkorange}a \bmod b}
$$

$$
\boxed{\ \gcd({\color{royalblue}a},\ {\color{teal}b}) \;=\; \gcd({\color{teal}b},\ {\color{darkorange}a \bmod b})\ }
$$

Repeat until the remainder is zero:

$$
\gcd({\color{royalblue}a},\ {\color{teal}b})
\;\longrightarrow\;
\gcd({\color{teal}b},\ {\color{darkorange}r_1})
\;\longrightarrow\;
\gcd({\color{darkorange}r_1},\ r_2)
\;\longrightarrow\;
\cdots
\;\longrightarrow\;
\gcd(g,\ {\color{crimson}0}) = g
$$

The subtraction form. Correct, no modulo, just slower:

```cpp
auto gcd = [](int a, int b) -> int {
  while (a != b) {
    a > b ? a -= b : b -= a;
  }
  return a;
};
```

### Proof

#### Lemma (Linear Combination Closure)

If $d \mid x$ and $d \mid y$, then for any integers $\alpha, \beta$:

$$
d \mid (\alpha x + \beta y)
$$

**Proof.** Let $x = dm$ and $y = dn$ for some $m, n \in \mathbb{Z}$. Then

$$
\alpha x + \beta y = \alpha(dm) + \beta(dn) = d(\alpha m + \beta n)
$$

which is an integer multiple of $d$. $\square$

Given integers $a$ and $b$ with $b > 0$, the division algorithm guarantees unique integers $q$ (quotient) and $r$ (remainder) such that

$$
{\color{royalblue}a = q \cdot b + r}, \qquad 0 \le r < b
$$

#### Main Claim

**Theorem.** The pairs $(a, b)$ and $(b, r)$ share an identical set of common divisors. Consequently:

$$
\gcd(a, b) = \gcd(b, r)
$$

**Proof.** We show both sets of common divisors coincide:

$$
{\color{royalblue}d \mid a}\ \text{ and }\ {\color{royalblue}d \mid b}
\quad\Longleftrightarrow\quad
{\color{teal}d \mid b}\ \text{ and }\ {\color{teal}d \mid r}
$$

#### Forward $(\Rightarrow)$

Suppose ${\color{royalblue}d \mid a}$ and ${\color{royalblue}d \mid b}$. $a = dm$ and $b = dn$. Since $r = a - qb$ is a linear combination of $a$ and $b$:

$$
r = a - qb = dm - q(dn) = d(m - qn)
$$

The Lemma gives ${\color{teal}d \mid r}$. Together with ${\color{teal}d \mid b}$, every common divisor of $(a, b)$ is also a common divisor of $(b, r)$.

#### Backward $(\Leftarrow)$

Suppose ${\color{teal}d \mid b}$ and ${\color{teal}d \mid r}$. $b = dn$ and $r = dk$. Since $a = qb + r$ is a linear combination of $b$ and $r$:

$$
a = qb + r = q(dn) + dk = d(qn + k)
$$

The Lemma gives ${\color{royalblue}d \mid a}$. Together with ${\color{royalblue}d \mid b}$, every common divisor of $(b, r)$ is also a common divisor of $(a, b)$.

#### Conclusion

Both inclusions hold, so the two sets are equal:

$$
\bigl\{ d \in \mathbb{Z}^{+} : {\color{royalblue}d \mid a} \text{ and } {\color{royalblue}d \mid b} \bigr\} = \bigl\{ d \in \mathbb{Z}^{+} : {\color{teal}d \mid b} \text{ and } {\color{teal}d \mid r} \bigr\}
$$

Equal sets have equal maxima:

$$
\boxed{\ \gcd(a, b) = \gcd(b, r) \qquad \square\ }
$$

### The Algorithm

```cpp
// Recursive (std::function for self-reference)
std::function<int(int, int)> gcd = [&](int a, int b) -> int {
    return b ? gcd(b, a % b) : a;
};

// Iterative, no stack overflow risk
auto gcd = [](int a, int b) -> int {
  while(b) {
    a %= b;
    swap(a, b);
  }
  return a;
};
```

### Debug: gcd(48, 18)

| Step |                           $a$ | $b$ |              $a \bmod b$ |
| :--: | ----------------------------: | --: | -----------------------: |
|  1   |                            48 |  18 | ${\color{darkorange}12}$ |
|  2   |                            18 |  12 |      ${\color{orange}6}$ |
|  3   |                            12 |   6 |        ${\color{teal}0}$ |
|  4   | ${\color{crimson}\mathbf{6}}$ |   0 |                        - |

Remainder shrink to ${\color{teal}0}$. $a$ is the answer: ${\color{crimson}\mathbf{6}}$.

---

## Complexity

### Lamé's Theorem (1844)

The number of steps never exceeds five times the number of decimal digits of the smaller input:

$$\text{steps} \leq 5 \cdot \lfloor\log_{10} \min(a, b)\rfloor + 1 \quad \Longrightarrow \quad O(\log (\min(a, b)))$$

### The Worst Case: Fibonacci Numbers

What makes Euclid's algorithm work the hardest? Consecutive Fibonacci numbers:

$${\color{royalblue}F_{n+1}} \xrightarrow{\ \gcd\ } {\color{royalblue}F_n} \xrightarrow{\ \gcd\ } {\color{royalblue}F_{n-1}} \xrightarrow{\ \gcd\ } \cdots \xrightarrow{\ \gcd\ } {\color{teal}1}$$

Because $F_{n+1} = {\color{crimson}1} \cdot F_n + F_{n-1}$, the quotient is always exactly ${\color{crimson}1}$ - the slowest possible reduction. Since $F_n \approx \phi^n / \sqrt{5}$ where $\phi \approx 1.618$:

$$\text{steps} \leq \log_\phi N \approx 1.44 \log_2 N$$

> $\gcd({\color{royalblue}89},\ {\color{royalblue}55}) = \gcd(F_{11},\ F_{10})$ takes exactly **10 steps**.

> For $a, b \leq 10^{18}$, at most $\approx 87$ steps. Treat it as $O(1)$ in competitive programming.

---

## Properties

### Fundamental

$$
\begin{array}{ll}
\gcd(a, b) = \gcd(b, a) & \text{commutativity} \\[6pt]
\gcd(a,\ \gcd(b, c)) = \gcd(\gcd(a, b),\ c) & \text{associativity} \\[6pt]
{\color{royalblue}\gcd(ma, mb) = m \cdot \gcd(a, b)} & \text{scaling} \\[6pt]
{\color{teal}\gcd(a + kb,\ b) = \gcd(a, b)} & \text{shift invariance}
\end{array}
$$

The <font color="teal">last one</font> is exactly why Euclid's algorithm works - subtracting any multiple of $b$ from $a$ preserves the GCD.

### Maybe you don't need these -\_-

**Dividing by GCD gives coprime numbers:**

$$\gcd(a, b) = d \quad\Longrightarrow\quad \gcd\!\left(\frac{a}{d},\ \frac{b}{d}\right) = 1$$

**Coprime isolation:** If $\gcd(a, b) = 1$, then $b$ is completely invisible through $a$:

$$\gcd(a, b) = 1 \quad\Longrightarrow\quad \gcd(a,\ bc) = \gcd(a,\ c)$$

**Sequence identity:**

$${\color{royalblue}\gcd(a^n - 1,\ a^m - 1) = a^{\gcd(n,m)} - 1}$$

**GCD via differences** - a powerful trick:

$$
\gcd(\underbrace{a_1,\ a_2,\ \ldots,\ a_n}_{\text{array}}) = \gcd\!\Big({\color{royalblue}a_1},\ {\color{darkorange}a_2 - a_1},\ {\color{darkorange}a_3 - a_2},\ \ldots,\ {\color{darkorange}a_n - a_{n-1}}\Big)
$$

The GCD of an array equals the GCD of the first element and all consecutive differences.

---

## LCM - GCD's Twin

The **Least Common Multiple** $\text{lcm}(a, b)$ is the smallest positive integer divisible by both.

$$\text{lcm}(a, b) = \frac{a \cdot b}{\gcd(a, b)}$$

**Why?** Look at the prime factorizations of $48$ and $18$:

$$
\begin{array}{rcccl}
48 &=& 2^{\color{crimson}4} &\cdot& 3^{\color{royalblue}1} \\[4pt]
18 &=& 2^{\color{crimson}1} &\cdot& 3^{\color{royalblue}2} \\[6pt]
\hline\\[-8pt]
\gcd &=& 2^{{\color{crimson}\min(4,1)}} &\cdot& 3^{{\color{royalblue}\min(1,2)}} \;=\; 2^1 \cdot 3^1 = {\color{teal}6} \\[4pt]
\text{lcm} &=& 2^{{\color{crimson}\max(4,1)}} &\cdot& 3^{{\color{royalblue}\max(2,1)}} \;=\; 2^4 \cdot 3^2 = {\color{teal}144}
\end{array}
$$

GCD takes $\min$ exponents, LCM takes $\max$. Since $\min(x,y) + \max(x,y) = x + y$:

$${\color{teal}\gcd(a,b) \cdot \text{lcm}(a,b) = a \cdot b}$$

### The Overflow Trap

> <font color="crimson">**Warning:**</font> Never write `a * b / gcd(a, b)`.

If $a = b = 10^9$, then $a \cdot b = 10^{18}$ - at the edge of int64_t overflow. Always divide first:

```cpp
int64_t lcm(int64_t a, int64_t b) {
    return a / gcd(a, b) * b;
}
```

Safe because $\gcd(a, b)$ always divides $a$.

---

## Coprimeness

Two numbers are **coprime** if $\gcd(a, b) = 1$ - they share no prime factor.

### A useless Fact

Pick two positive integers at random. As their range grows:

$$\boxed{\ P\!\left(\gcd(a, b) = 1\right) = \frac{6}{\pi^2} \approx {\color{crimson}60.79\%}\ }$$

GCD connects to $\pi$ through the Basel series:

$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6} \quad\Longrightarrow\quad \prod_p \frac{1}{1 - p^{-2}} = \zeta(2) = \frac{\pi^2}{6} \quad\Longrightarrow\quad P(\text{coprime}) = \frac{1}{\zeta(2)} = \frac{6}{\pi^2}$$

The intuition: the probability that a prime $p$ divides **both** random integers is $1/p^2$. The probability that **no** prime does is the product over all primes - which Euler showed equals $6/\pi^2$.

Coprimeness is the foundation of **[[Euler's Totient Function]]** $\varphi(n)$, which counts integers in range $[1, n]$ that coprime to $n$.

---

## GCD of an Array

By associativity, just fold left:

```cpp
int g = 0;
for (int x : arr) {
  g = gcd(g, x);
}
```

Starting from $g = 0$ works because $\gcd(0, x) = x$.

**Early termination:** Once $g = 1$ it can never decrease again. Break immediately:

```cpp
int g = arr[0];
for (int i = 1; i < n and g != 1; i++) {
  g = gcd(g, arr[i]);
}
```

**Structural insight:** As you extend a prefix, the GCD is non-increasing:

$$g_1 \geq g_2 \geq g_3 \geq \cdots \geq g_n \quad\text{and each drop is by a factor} \geq 2$$

So there are at most $O(\log \max a_i)$ **distinct** prefix GCD values.

---

## Edge Cases

$$
\begin{array}{ccc}
\hline
\textbf{Input} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
\gcd(0,\ 0) & 0 & \text{convention} \\[4pt]
\gcd(0,\ n) & n & \text{everything divides } 0 \\[4pt]
\gcd(1,\ n) & 1 & \text{1 divides everything} \\[4pt]
\gcd({\color{crimson}-a},\ b) & \gcd(|a|,\ b) & \text{take absolute values} \\[4pt]
\hline
\end{array}
$$

`std::gcd` handles negatives in C++17. If using `__gcd`, wrap with `abs()` yourself.

$${\color{royalblue}\text{The ideas don't age.}}$$

---

## References

1. Euclid. _Elements_, Book VII, Propositions 1–2. c. 300 BC. — The original algorithm, stated in terms of repeated subtraction of line segments.

2. Lamé, G. "Note sur la limite du nombre des divisions dans la recherche du plus grand commun diviseur entre deux nombres entiers." _Comptes Rendus de l'Académie des Sciences_, vol. 19, 1844, pp. 867–869. — First proof that the number of steps is bounded by $5 \log_{10} \min(a, b)$.

3. Cesàro, E. "Question 75 (solution)." Mathesis, vol. 3, 1885, p. 224. — First published proof that the probability of two random integers being coprime is $6/\pi^2$.

4. Euler, L. "De summis serierum reciprocarum." Commentarii Academiae Scientiarum Petropolitanae_, vol. 7, 1740, pp. 123–134. — Solution to the Basel problem: $\sum 1/n^2 = \pi^2/6$, which underlies the coprimeness probability.

5. Knuth, D. E. _The Art of Computer Programming_, Vol. 2: _Seminumerical Algorithms_, 3rd ed. Addison-Wesley, 1997. §4.5.2 — Detailed analysis of the Euclidean algorithm including the Fibonacci worst case and step-count bounds.

6. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.2 — GCD, extended GCD, and their role in modular arithmetic.

7. [CP Algorithms](https://cp-algorithms.com/algebra/euclid-algorithm.html#practice-problems)
