---
title: Euler's Totient Function
description: φ(n) — counting the integers coprime to n. The prime-power formula, a proof that φ is multiplicative, O(√n) and sieve computation, the divisor-sum identity, and the proof of Euler's theorem that powers modular arithmetic.
tags:
  - number-theory
  - math
date: 2026-05-15
---

[[Greatest Common Divisor|Coprimeness]] is a yes/no question: do two numbers share a factor? **Euler's totient function** turns it into a count. For a positive integer $n$,

$$
\varphi(n) \;=\; \#\bigl\{\,k : 1 \le k \le n,\ \gcd(k, n) = 1\,\bigr\}
$$

— the number of integers from $1$ to $n$ that are coprime to $n$. A small quantity with an outsized reach: it is the size of the multiplicative group modulo $n$, the exponent in **Euler's theorem**, the reason RSA works, and the key to modular inverses when the modulus is not prime.

This page builds $\varphi$ from scratch — a formula, a proof that it is multiplicative, two ways to compute it, and the theorem it exists to serve.

_Prereqs: [[Greatest Common Divisor]] · [[Prime Factorization|prime factorization]] · [[Modular Arithmetic|basic modular arithmetic]]._

---

## At a Glance

$$
\boxed{\ \varphi(n) \;=\; n \prod_{p \mid n} \left(1 - \frac{1}{p}\right)\ }
\qquad (p \text{ ranges over distinct primes dividing } n)
$$

```cpp
int64_t phi(int64_t n) {
  int64_t result = n;
  for (int64_t p = 2; p * p <= n; p++) {
    if (n % p == 0) {
      while (n % p == 0) n /= p;
      result -= result / p;          // apply the factor (1 - 1/p)
    }
  }
  if (n > 1) result -= result / n;   // a prime factor larger than √n is left
  return result;
}
```

**Complexity:** $O(\sqrt{n})$ for one value; $O(n \log\log n)$ to sieve all of $1 \dots n$.

---

## First Values

Count by hand. For $n = 12$, the integers in $[1, 12]$ coprime to $12$ are ${\color{royalblue}1, 5, 7, 11}$ — so $\varphi(12) = 4$.

$$
\begin{array}{c|cccccccccc}
n & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 & 10 \\
\hline
\varphi(n) & 1 & 1 & 2 & 2 & 4 & 2 & 6 & 4 & 6 & 4
\end{array}
$$

Two patterns jump out, and both will become theorems:

- $\varphi(p) = p - 1$ for primes — $2, 3, 5, 7$ give $1, 2, 4, 6$.
- The values are erratic for composites — $\varphi$ depends on the _prime structure_ of $n$, not its size.

By convention $\varphi(1) = 1$: the only integer in $[1, 1]$ is $1$, and $\gcd(1, 1) = 1$.

---

## Building the Formula

### Primes

If $p$ is prime, every one of $1, 2, \dots, p-1$ is coprime to it, and only $p$ itself is not:

$$
\varphi(p) = p - 1
$$

### Prime powers

For $p^k$, an integer fails to be coprime exactly when it is a **multiple of $p$**. The multiples of $p$ in $[1, p^k]$ are $p, 2p, \dots, p^{k-1}\cdot p$ — there are $p^{k-1}$ of them. Everything else is coprime:

$$
\varphi(p^k) \;=\; p^k - p^{k-1} \;=\; p^k\left(1 - \frac{1}{p}\right)
$$

Check: $\varphi(9) = 9 - 3 = 6$, $\varphi(8) = 8 - 4 = 4$. ✓

### The multiplicative property

To handle a general $n$, we need to know how $\varphi$ behaves across a product.

> **Theorem.** If $\gcd(m, n) = 1$, then $\varphi(mn) = \varphi(m)\,\varphi(n)$.

**Proof.** Take each number $k$ in the range $[0, mn)$ and record the two remainders it leaves — one when divided by $m$, one when divided by $n$:

$$
k \;\longmapsto\; (k \bmod m,\ \ k \bmod n)
$$

Because $\gcd(m, n) = 1$, the [[Chinese Remainder Theorem]] makes this map a **bijection** (a perfect one-to-one matching) between $[0, mn)$ and $[0, m) \times [0, n)$ — every pair of remainders comes from exactly one $k$, and no two values of $k$ share a pair.

Now restrict to coprime elements. A number is coprime to $mn$ iff it shares no prime with $m$ **and** none with $n$:

$$
\gcd(k, mn) = 1 \quad\Longleftrightarrow\quad \gcd(k, m) = 1 \ \text{ and }\ \gcd(k, n) = 1
$$

So the bijection carries the $\varphi(mn)$ residues coprime to $mn$ exactly onto the pairs (coprime to $m$, coprime to $n$), of which there are $\varphi(m)\cdot\varphi(n)$. Equal sets, equal counts. $\square$

> **Careful:** $\varphi$ is _multiplicative_ but **not** _completely_ multiplicative — the coprimality condition is essential. $\varphi(2 \cdot 2) = \varphi(4) = 2$, yet $\varphi(2)\varphi(2) = 1$.

### Assembling it

Every $n > 1$ factors into prime powers $n = p_1^{a_1} p_2^{a_2} \cdots p_r^{a_r}$, and distinct prime powers are pairwise coprime. Apply multiplicativity across them, then the prime-power formula to each:

$$
\varphi(n) = \prod_{i=1}^{r} \varphi(p_i^{a_i})
       = \prod_{i=1}^{r} p_i^{a_i}\!\left(1 - \frac{1}{p_i}\right)
       = \;\boxed{\ n \prod_{p \mid n} \left(1 - \frac{1}{p}\right)\ }
$$

**Example.** $36 = 2^2 \cdot 3^2$, so

$$
\varphi(36) = 36\left(1 - \tfrac12\right)\left(1 - \tfrac13\right) = 36 \cdot \tfrac12 \cdot \tfrac23 = 12
$$

---

## Computing φ(n) for One n

The formula needs only the **distinct primes** of $n$, not the exponents. Trial-divide up to $\sqrt{n}$; each time a new prime $p$ appears, strip every copy of it and fold in the factor $1 - 1/p$ as `result -= result / p`.

```cpp
int64_t phi(int64_t n) {
  int64_t result = n;
  for (int64_t p = 2; p * p <= n; p++) {
    if (n % p == 0) {
      while (n % p == 0) n /= p;       // remove all copies of p
      result -= result / p;            // result *= (1 - 1/p)
    }
  }
  if (n > 1) result -= result / n;     // n is now 1 or a single large prime
  return result;
}
```

The final `if` catches the case where, after stripping small factors, a prime larger than $\sqrt{n}$ remains — there can be at most one.

### Trace: `phi(36)`

| $p$ | $n$ (remaining) | action                | $result$                       |
| --: | --------------: | :-------------------- | :----------------------------- |
|   — |              36 | start                 | $36$                           |
|   2 |      $36 \to 9$ | strip $2$s, $-\,36/2$ | $36 - 18 = 18$                 |
|   3 |       $9 \to 1$ | strip $3$s, $-\,18/3$ | $18 - 6 = {\color{crimson}12}$ |

Loop ends ($p \cdot p > n$); $n = 1$, so the final `if` does nothing. Output $\varphi(36) = 12$.

> **Why `result -= result / p` and not floating point.** Multiplying by $1 - 1/p$ directly would mean `result * (1 - 1.0/p)` — floating-point rounding on large integers. The subtraction form is exact: it is safe because $p \mid result$ at that moment (every prime stripped so far still divides `result`).

---

## Computing φ for All of 1 … n

For a whole range, a sieve is far better than $n$ separate factorizations. Seed `phi[i] = i`, then for each prime $p$ apply the factor $1 - 1/p$ to every multiple of $p$ — exactly the [[Sieve of Eratosthenes]] structure.

```cpp
vector<int> phi(n + 1);
iota(phi.begin(), phi.end(), 0);          // phi[i] = i
for (int p = 2; p <= n; p++) {
  if (phi[p] == p) {                      // untouched  =>  p is prime
    for (int m = p; m <= n; m += p)
      phi[m] -= phi[m] / p;               // fold (1 - 1/p) into every multiple
  }
}
```

The test `phi[p] == p` works because the first prime dividing any composite would already have lowered its entry below its index. Only a genuine prime reaches the loop with `phi[p]` still equal to `p`.

### Trace: sieve up to $n = 10$

Each row applies one prime; bold entries change.

$$
\begin{array}{l|cccccccccc}
 & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 & 10 \\
\hline
\text{seed } i      & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 & 10 \\
p = 2 & 1 & \mathbf{1} & 3 & \mathbf{2} & 5 & \mathbf{3} & 7 & \mathbf{4} & 9 & \mathbf{5} \\
p = 3 & 1 & 1 & \mathbf{2} & 2 & 5 & \mathbf{2} & 7 & 4 & \mathbf{6} & 5 \\
p = 5 & 1 & 1 & 2 & 2 & \mathbf{4} & 2 & 7 & 4 & 6 & \mathbf{4} \\
p = 7 & 1 & 1 & 2 & 2 & 4 & 2 & \mathbf{6} & 4 & 6 & 4
\end{array}
$$

The last row matches the hand-counted table at the top. **Complexity:** $O(n \log\log n)$ — the same harmonic-sum bound as the prime sieve.

---

## Euler's Theorem

This is what $\varphi$ was built for — the law underneath modular inverses, exponent reduction, and RSA.

> **Euler's Theorem.** If $\gcd(a, n) = 1$, then $a^{\varphi(n)} \equiv 1 \pmod n$.

**Proof.** Let $R = \{r_1, r_2, \dots, r_{\varphi(n)}\}$ be the **reduced residues** — the residues mod $n$ that are coprime to $n$. Multiply every one of them by $a$.

Because $\gcd(a, n) = 1$, multiplying by $a$ just shuffles $R$ around — it lands back on the same set. Two checks: each $a\,r_i$ is still coprime to $n$ (so it stays inside $R$), and no two collide, since $a r_i \equiv a r_j$ would force $r_i \equiv r_j$. So $\{a r_1, \dots, a r_{\varphi(n)}\}$ is just $R$ in a different order.

Take the product of each set:

$$
\prod_{i} (a\, r_i) \;\equiv\; \prod_{i} r_i \pmod n
\qquad\Longrightarrow\qquad
a^{\varphi(n)} \prod_i r_i \;\equiv\; \prod_i r_i \pmod n
$$

The product $\prod r_i$ is itself coprime to $n$, hence invertible — cancel it from both sides:

$$
\boxed{\ a^{\varphi(n)} \equiv 1 \pmod n\ } \qquad\square
$$

When $n = p$ is prime, $\varphi(p) = p - 1$ and this is exactly [[Modular Inverse|Fermat's Little Theorem]]. Euler's theorem is the same bijection argument, generalized from $\{1, \dots, p-1\}$ to the reduced residues of any modulus. It gives the inverse on any coprime modulus: $a^{-1} \equiv a^{\varphi(n) - 1} \pmod n$ — one [[Binary Exponentiation|modular exponentiation]] away.

---

## The Divisor-Sum Identity

A surprising fact, due to Gauss: the totients of all divisors of $n$ add back up to $n$.

$$
\boxed{\ \sum_{d \mid n} \varphi(d) = n\ }
$$

**Proof.** Sort the integers $1, 2, \dots, n$ by their gcd with $n$. Every such gcd is some divisor $d \mid n$. How many $k \in [1, n]$ have $\gcd(k, n) = d$? Writing $k = d j$, the condition becomes $\gcd(j, n/d) = 1$ with $j \in [1, n/d]$ — there are exactly $\varphi(n/d)$ such $j$.

Each integer lands in exactly one class, so the classes partition $[1, n]$:

$$
n = \sum_{d \mid n} \varphi(n/d) = \sum_{d \mid n} \varphi(d)
$$

The last step just relabels: as $d$ runs over the divisors of $n$, so does $n/d$. $\square$

**Check** ($n = 12$, divisors $1,2,3,4,6,12$): $\varphi(1)+\varphi(2)+\varphi(3)+\varphi(4)+\varphi(6)+\varphi(12) = 1+1+2+2+2+4 = 12$. ✓

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Input} & \textbf{Value} & \textbf{Why} \\
\hline\\[-8pt]
\varphi(1) & 1 & \gcd(1,1) = 1 \text{; the empty product equals } 1 \\[4pt]
\varphi(p) & p - 1 & \text{a prime is coprime to all below it} \\[4pt]
\varphi(2) & 1 & \text{only } 1 \text{ is coprime to } 2 \\[4pt]
\varphi(n)\ (n > 2) & \text{even} & \text{residues pair up as } k \leftrightarrow n-k \\[4pt]
\hline
\end{array}
$$

**Other things to watch:**

- **$\varphi(0)$ is not defined** — there is no range $[1, 0]$ to count. Guard $n \ge 1$.
- **Overflow.** In the $O(\sqrt n)$ routine, `p * p` can overflow for $n$ near $10^{18}$; use `int64_t` and, if needed, compare `p <= n / p` instead.
- **The trailing `if (n > 1)`** is not optional — drop it and any $n$ with a large prime factor (e.g. $n = 2 \cdot 10^9 + \dots$) returns a wrong answer.
- **Sieve memory.** The all-of-$1\dots n$ sieve needs an $O(n)$ array — fine for $n \le 10^7$ or so, not for $n = 10^{18}$ (factor a single value instead).

---

## References

1. Euler, L. "Theoremata arithmetica nova methodo demonstrata." _Novi Commentarii Academiae Scientiarum Petropolitanae_, vol. 8, 1763, pp. 74–104. — Introduces the totient and proves $a^{\varphi(n)} \equiv 1$.

2. Gauss, C. F. _Disquisitiones Arithmeticae_. Leipzig, 1801. Art. 38–39. — The notation and the divisor-sum identity $\sum_{d \mid n} \varphi(d) = n$.

3. Hardy, G. H., Wright, E. M. _An Introduction to the Theory of Numbers_, 6th ed. Oxford University Press, 2008. §§5.5, 16.1–16.3 — Multiplicative functions and the totient.

4. Apostol, T. M. _Introduction to Analytic Number Theory_. Springer, 1976. Ch. 2 — Arithmetical functions, multiplicativity, and Möbius inversion.

5. [CP Algorithms — Euler's Totient Function](https://cp-algorithms.com/algebra/phi-function.html)
