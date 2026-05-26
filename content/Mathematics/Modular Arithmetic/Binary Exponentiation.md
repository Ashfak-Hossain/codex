---
title: Binary Exponentiation
description: Computing aⁿ in O(log n) instead of O(n) — the repeated-squaring trick, the binary-expansion view, a proof by loop invariant, modular exponentiation, and the jump to matrix powers and fast Fibonacci.
tags:
  - number-theory
  - math
date: 2026-05-15
---

Computing $a^n$ looks like it costs $n - 1$ multiplications — multiply by $a$, again, again, $n$ times over. For $n = 10^{18}$ that is a non-starter.

But $n$ has only about $\log_2 n$ **binary digits**, and that is the real size of the problem. **Binary exponentiation** (also called _exponentiation by squaring_) computes $a^n$ in $O(\log n)$ multiplications by exploiting one tiny identity:

$$
a^n \;=\; \bigl(a^{n/2}\bigr)^2
$$

In words: instead of stepping the exponent up by $1$, square the result and the exponent _doubles_ — and that costs just one multiplication. Chain that, and an exponent of $10^{18}$ falls in about $60$ steps. The idea is old — it appears in Pingala's _Chandaḥśāstra_ over two thousand years ago — and today it sits inside every modular-arithmetic routine, primality test, and `pow` implementation.

_Prereqs: binary representation of integers · [[Modular Arithmetic|basic modular arithmetic]]._

---

## At a Glance

$$
\boxed{\ a^n \text{ in } O(\log n) \text{ multiplications}\ }
$$

```cpp
int64_t power(int64_t a, int64_t b, int64_t m) {
  a %= m;
  int64_t result = 1;
  while (b > 0) {
    if (b & 1) result = result * a % m;   // bit set: fold a^(2^i) in
    a = a * a % m;                        // climb to the next power: a^(2^(i+1))
    b >>= 1;
  }
  return result;
}
```

**Complexity:** $O(\log n)$ time, $O(1)$ space.

---

## The Naive Approach

Multiply by $a$, one factor at a time:

```cpp
int64_t power_naive(int64_t a, int64_t b) {
  int64_t result = 1;
  for (int64_t i = 0; i < b; i++) result *= a;
  return result;
}
```

**Complexity:** $O(b)$. For $b = 10^{18}$ that is a billion billion multiplications — hopeless. The exponent is huge, but it is huge precisely because it takes few _digits_ to write. That is the opening.

---

## The Idea: Two Ways to See It

### View 1 — Recursive halving

Every exponent is either even or odd, and each case shrinks $n$ by half:

$$
a^n =
\begin{cases}
\bigl(a^{n/2}\bigr)^2 & n \text{ even} \\[6pt]
a \cdot a^{n-1} & n \text{ odd} \\[6pt]
1 & n = 0
\end{cases}
$$

The even case is the engine: one multiplication (the squaring) cuts the exponent in half. The odd case peels off a single factor of $a$ to make the exponent even again. Since $n$ at least halves every one or two steps, the recursion is $O(\log n)$ deep.

### View 2 — The binary expansion

The same algorithm, read forward. Write $n$ in binary — that is, as a sum of distinct powers of two, $n = \sum_i b_i 2^i$, where each bit $b_i$ is $0$ or $1$. Then

$$
a^n \;=\; a^{\sum_i b_i 2^i} \;=\; \prod_{\,i\,:\;b_i = 1} a^{2^i}
$$

So $a^n$ is the product of the powers $a^{2^i}$ for exactly those bits $i$ that are set in $n$. And the powers $a^{2^i}$ form a **squaring chain** — each is the square of the one before:

$$
a^{2^0} \xrightarrow{\;(\,\cdot\,)^2\;} a^{2^1} \xrightarrow{\;(\,\cdot\,)^2\;} a^{2^2} \xrightarrow{\;(\,\cdot\,)^2\;} \cdots
$$

**Worked example.** Take $3^{13}$. In binary $13 = {\color{royalblue}1101_2} = 8 + 4 + 1$, so

$$
3^{13} \;=\; 3^{8} \cdot 3^{4} \cdot 3^{1}
$$

Build the squaring chain $3^1, 3^2, 3^4, 3^8$ and multiply in the three that correspond to set bits:

$$
3^{13} \;=\; {\color{crimson}6561} \cdot {\color{crimson}81} \cdot {\color{crimson}3} \;=\; 1{,}594{,}323
$$

Three squarings to build the chain ($3^1\!\to3^2\!\to3^4\!\to3^8$), two more multiplications to combine — five in total, versus twelve for the naive loop. The gap explodes as $n$ grows.

---

## The Algorithm

The iterative form walks the bits of $b$ from least to most significant. `result` accumulates the answer; `a` climbs the squaring chain.

```cpp
int64_t power(int64_t a, int64_t b) {
  int64_t result = 1;
  while (b > 0) {
    if (b & 1) result *= a;   // current bit set: multiply this chain link in
    a *= a;                   // square: advance a from a^(2^i) to a^(2^(i+1))
    b >>= 1;                  // drop the bit we just processed
  }
  return result;
}
```

The recursive form mirrors View 1 directly:

```cpp
int64_t power(int64_t a, int64_t b) {
  if (b == 0) return 1;
  int64_t half = power(a, b / 2);
  return (b & 1) ? half * half * a : half * half;
}
```

Both are $O(\log b)$ multiplications. The iterative version uses $O(1)$ space; the recursive one uses $O(\log b)$ stack — negligible, but the iterative form is the usual choice.

> **Note.** On the final iteration the loop squares `a` one last time even though `b` is about to hit $0$ — that result is never used. Harmless, but worth knowing if a stray squaring would overflow; the modular version below never cares.

### Trace: `power(3, 13)`

| step | $b$                       | bit $b\,\&\,1$ | $result$                                    | $a$ (after squaring) |
| :--: | :------------------------ | :------------: | :------------------------------------------ | :------------------- |
|  —   | ${\color{royalblue}1101}$ |       —        | $1$                                         | $3$                  |
|  1   | ${\color{royalblue}1101}$ |      $1$       | $1 \cdot 3 = {\color{crimson}3}$            | $3^2 = 9$            |
|  2   | ${\color{royalblue}110}$  |      $0$       | $3$                                         | $9^2 = 81$           |
|  3   | ${\color{royalblue}11}$   |      $1$       | $3 \cdot 81 = {\color{crimson}243}$         | $81^2 = 6561$        |
|  4   | ${\color{royalblue}1}$    |      $1$       | $243 \cdot 6561 = {\color{crimson}1594323}$ | —                    |

Output: $3^{13} = 1{,}594{,}323$. The set bits $\{0, 2, 3\}$ of $13$ pulled in $3^1$, $3^4$, $3^8$ — exactly the binary-expansion product.

---

## Proof of Correctness

**Claim.** `power(a, n)` returns $a^n$ for every integer $n \ge 0$.

**Loop invariant.** Let $a_0$ be the original base and $n$ the original exponent. Before every iteration of the `while` loop,

$$
result \cdot a^{\,b} \;=\; a_0^{\,n}
$$

**Initialization.** Before the first iteration $result = 1$, $a = a_0$, $b = n$, so $result \cdot a^b = 1 \cdot a_0^{n} = a_0^n$. ✓

**Maintenance.** Suppose the invariant holds. Write the updated values as $result'\!, a'\!, b'$.

- _$b$ even._ Then $result' = result$, $a' = a^2$, $b' = b/2$. So
  $$result' \cdot a'^{\,b'} = result \cdot (a^2)^{b/2} = result \cdot a^{b} = a_0^n.$$
- _$b$ odd._ Then $result' = result \cdot a$, $a' = a^2$, $b' = (b-1)/2$. So
  $$result' \cdot a'^{\,b'} = result \cdot a \cdot (a^2)^{(b-1)/2} = result \cdot a \cdot a^{\,b-1} = result \cdot a^{b} = a_0^n.$$

Either way the invariant survives. ✓

**Termination.** Each iteration does `b >>= 1`, so $b$ strictly decreases and reaches $0$. At that point the invariant reads $result \cdot a^{0} = result = a_0^n$ — the returned value is exactly $a^n$. $\square$

---

## Complexity

Each iteration halves $b$, so the loop runs $\lfloor \log_2 b \rfloor + 1$ times. Every iteration does at most two multiplications (one for the bit, one squaring):

$$
\text{multiplications} \;\le\; 2\bigl(\lfloor \log_2 b \rfloor + 1\bigr) \;=\; O(\log b)
$$

Against the naive $O(b)$, this is the difference between $60$ operations and $10^{18}$ for $b \approx 10^{18}$. Space is $O(1)$ for the iterative form.

> This is **not** always the theoretical minimum number of multiplications — finding the shortest such sequence is the _addition-chain_ problem, studied at length in Knuth §4.6.3 and hard to optimize exactly. Binary exponentiation is the simple, near-optimal choice everyone actually uses.

---

## Modular Exponentiation

In competitive programming you almost never want the raw $a^n$ — it overflows instantly. You want $a^n \bmod m$. Reduce after every multiplication so values never escape $[0, m)$:

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
```

This works because `mod` distributes over multiplication: $(x \cdot y) \bmod m = \bigl((x \bmod m)(y \bmod m)\bigr) \bmod m$. Reducing early changes nothing about the final answer, but keeps every intermediate small.

**Overflow watch.** A product like `result * a` reaches $(m-1)^2$. For $m \approx 10^9$ that is $\approx 10^{18}$ — safely inside `int64_t` (max $\approx 9.2 \times 10^{18}$). For $m$ near $10^{18}$ the product overflows; switch to `__int128` or a [binary-multiplication `mulmod`](#binary-multiplication-the-same-trick) (next section).

Modular exponentiation is the workhorse behind [[Modular Inverse|modular inverses]] — via Fermat ($a^{-1} \equiv a^{p-2}$) for a prime modulus, or [[Euler's Totient Function|Euler]] ($a^{-1} \equiv a^{\varphi(n)-1}$) for any coprime modulus — [[Primality Tests|Miller–Rabin primality testing]], and RSA.

---

## Variations

### Binary multiplication: the same trick

When even a single product $a \cdot b$ overflows (both near $10^{18}$), apply the identical idea to **multiplication** — replace "square" with "double" and "multiply" with "add":

```cpp
int64_t mulmod(int64_t a, int64_t b, int64_t m) {
  a %= m;
  int64_t result = 0;
  while (b > 0) {
    if (b & 1) result = (result + a) % m;
    a = (a + a) % m;
    b >>= 1;
  }
  return result;
}
```

Multiplication is repeated addition exactly as exponentiation is repeated multiplication — the $O(\log n)$ trick is the same skeleton.

### Matrix exponentiation: fast linear recurrences

`power` works for **any associative operation**. Swap numbers for matrices and you can evaluate a linear recurrence in logarithmic time. Fibonacci is the classic:

$$
\begin{pmatrix} 1 & 1 \\ 1 & 0 \end{pmatrix}^{n}
=
\begin{pmatrix} F_{n+1} & F_{n} \\ F_{n} & F_{n-1} \end{pmatrix}
$$

Raise the $2 \times 2$ matrix to the $n$-th power by binary exponentiation — multiplications become $2\times2$ matrix products — and $F_n$ falls out in $O(\log n)$. The same construction handles any constant-coefficient recurrence; full treatment in [[Matrix Exponentiation]].

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Input} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
a^{0} & 1 & \text{empty product; the loop never runs} \\[4pt]
0^{0} & 1 & \text{convention used here — the loop returns } result = 1 \\[4pt]
a^{1} & a & \text{single set bit} \\[4pt]
b < 0 & \text{undefined} & \text{no integer power; use a modular inverse first} \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **Negative exponents.** $a^{-n}$ is not an integer. Modulo a coprime $m$, compute $(a^{-1})^{n}$ — take the [[Modular Inverse]] first, then exponentiate.
- **Overflow without a modulus.** Plain `power(a, b)` overflows `int64_t` for tiny inputs ($2^{63}$ already exceeds it). Either work modulo something or use big integers.
- **Reduce the base first.** In the modular form, `a %= m` up front guards against a large or negative `a`. For a negative `a`, follow with `(a % m + m) % m`.
- **`b` must be unsigned-safe.** `b >>= 1` on a negative `b` is a bug — guard $b \ge 0$ at the call site.
- **Degenerate modulus $m = 1$.** Every value is $0 \bmod 1$, but `power(a, 0, 1)` returns `1` — the initial `result` is never reduced. Append `% m` to the return, or guard the call, if $m = 1$ can occur.

---

## References

1. Pingala. _Chandaḥśāstra_. c. 2nd century BC. — Contains an early description of computing powers by repeated squaring, in the course of enumerating poetic metres.

2. Knuth, D. E. _The Art of Computer Programming_, Vol. 2: _Seminumerical Algorithms_, 3rd ed. Addison-Wesley, 1997. §4.6.3 — "Evaluation of Powers": binary exponentiation, addition chains, and why optimal chains are hard.

3. Cormen, T. H., Leiserson, C. E., Rivest, R. L., Stein, C. _Introduction to Algorithms_, 4th ed. MIT Press, 2022. §31.6 — Modular exponentiation and its role in primality testing and RSA.

4. [CP Algorithms — Binary Exponentiation](https://cp-algorithms.com/algebra/binary-exp.html)
