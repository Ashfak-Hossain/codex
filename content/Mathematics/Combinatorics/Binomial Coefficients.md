---
title: Binomial Coefficients
description: Pascal's triangle, the binomial theorem, and the core identities of the binomial coefficient - row sums, the hockey-stick identity, Vandermonde's identity, and how to compute a table of nCr.
tags:
  - combinatorics
  - math
date: 2026-05-18
---

The [[Permutations and Combinations]] page introduced $\binom{n}{r}$ as a count — the number of ways to choose $r$ things from $n$. This page shows the other half of its life: $\binom{n}{r}$ is also an **algebra coefficient**. The same number that counts committees also tells you what happens when you expand $(a+b)^n$.

That double identity — counting object *and* algebra coefficient — is why $\binom{n}{r}$ is called the **binomial coefficient**, and it's where a pile of useful identities comes from.

---

## Pascal's triangle

Stack the binomial coefficients in a triangle, row $n$ holding $\binom{n}{0}, \binom{n}{1}, \dots, \binom{n}{n}$:

$$
\begin{array}{ccccccccc}
 & & & & 1 & & & & \\
 & & & 1 & & 1 & & & \\
 & & 1 & & 2 & & 1 & & \\
 & 1 & & 3 & & 3 & & 1 & \\
1 & & 4 & & 6 & & 4 & & 1 \\
\end{array}
$$

You don't compute these from the factorial formula — you *grow* the triangle. Every entry is the sum of the two above it, with $1$s down both edges. That growth rule is **Pascal's rule** from the last page:

$$
\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}
$$

The reasoning was: tag one specific object; a group of $r$ either includes it ($\binom{n-1}{r-1}$ ways to fill the rest) or excludes it ($\binom{n-1}{r}$ ways). Two non-overlapping cases — rule of sum — so you add. The triangle is just that recurrence drawn out.

---

## The binomial theorem

Here's where the *coefficient* name is earned. Expand $(a+b)^n$:

$$
(a+b)^n = \sum_{r=0}^{n} \binom{n}{r} a^{n-r} b^{r}
$$

For example:

$$
(a+b)^3 = \binom{3}{0}a^3 + \binom{3}{1}a^2 b + \binom{3}{2}a b^2 + \binom{3}{3}b^3 = a^3 + 3a^2 b + 3ab^2 + b^3
$$

The coefficients $1, 3, 3, 1$ are exactly row 3 of Pascal's triangle.

**Why does choosing show up in algebra?** Write $(a+b)^3$ as three factors side by side:

$$
(a+b)(a+b)(a+b)
$$

To expand, you walk through the three brackets and from each one pick either an $a$ or a $b$. A term like $a^2 b$ comes from every way to pick $b$ from exactly *one* of the three brackets — and "choose 1 bracket out of 3" is $\binom{3}{1} = 3$. The coefficient of $a^{n-r}b^r$ counts which $r$ brackets donated a $b$. That's a combination. The binomial theorem is just combinatorics wearing an algebra costume.

---

## Identities that fall out for free

Once you see $\binom{n}{r}$ as "choose $r$", these stop being formulas to memorize and become sentences to read.

### Row sum: every subset, counted by size

$$
\sum_{r=0}^{n} \binom{n}{r} = 2^n
$$

The left side sorts all subsets of an $n$-set by their size and adds the piles. The right side is the total subset count from [[Counting Principles]]. Same subsets, two ways of counting — so they're equal. (Or: set $a=b=1$ in the binomial theorem.) Row 4 of the triangle: $1+4+6+4+1 = 16 = 2^4$. ✓

### Alternating sum: it all cancels

$$
\sum_{r=0}^{n} (-1)^r \binom{n}{r} = 0 \qquad (n \ge 1)
$$

Plug $a=1, b=-1$ into the theorem. Combinatorially: the even-sized subsets and the odd-sized subsets of a non-empty set are *equal in number*. A small preview of the cancellation that powers [[Inclusion–Exclusion]].

### Symmetry

$$
\binom{n}{r} = \binom{n}{n-r}
$$

Choosing who's *in* is the same as choosing who's *out* — which is why the triangle is a mirror.

### Hockey-stick identity

$$
\sum_{i=r}^{n} \binom{i}{r} = \binom{n+1}{r+1}
$$

In the triangle, this is a diagonal of entries summing to the one just below-and-left of where the diagonal ends — the shape traces a hockey stick. To *read* it: count $(r+1)$-subsets of $\{1, \dots, n+1\}$ by their largest element. If the largest is $i+1$, the other $r$ members come from $\{1,\dots,i\}$ — that's $\binom{i}{r}$. Sum over every possible largest element and you've counted them all.

### Vandermonde's identity

$$
\binom{m+n}{r} = \sum_{k=0}^{r} \binom{m}{k}\binom{n}{r-k}
$$

Split a group of $m+n$ people into an $m$-team and an $n$-team. To choose $r$ people total, take $k$ from the first team and $r-k$ from the second — then sum over every split of $k$. Counting the same selection two ways, again.

Notice the pattern: **every identity is one set counted two different ways.** That's the entire trick — it even has a name, a *combinatorial proof* or "double counting."

---

## Computing binomial coefficients

There is no single "binomial coefficient algorithm" — there are **four**, and picking the wrong one is how solutions time out or overflow. The right choice depends on two questions: *do you need one value or a whole table?* and *is there a modulus?* Work through all four; the decision table at the end ties them together.

The naive route — literally $\frac{n!}{r!(n-r)!}$ — is a trap. $\binom{60}{30}$ is about $1.18 \times 10^{17}$ and fits in a 64-bit integer, yet $60!$ overflows it by *fifty orders of magnitude*. The answer fits; the intermediate factorials do not. Every method below exists to dodge that.

### Method 1 — multiplicative formula (one exact value)

For a single $\binom{n}{r}$ as a true integer, never form factorials. Build the answer one factor at a time, **interleaving** multiplications and divisions so the running value stays small:

```cpp
// One exact C(n, r) — O(r) time, O(1) space, no full factorials.
long long binom(int n, int r) {
    if (r < 0 || r > n) return 0;
    r = min(r, n - r);                       // symmetry: shorten the loop
    long long result = 1;
    for (int i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1); // multiply, THEN divide
    }
    return result;
}
```

The division is **always exact** — never a remainder. After step $i$ the running product is $\binom{n}{i+1}$ multiplied out, and a product of $i+1$ consecutive integers is always divisible by $(i+1)!$, so $(i+1)$ divides in cleanly. Multiply *before* dividing or the invariant breaks.

- **Use when:** you need a handful of exact values and the answer fits in 64 bits ($n \le 62$ or so for the full row).
- **Complexity:** $O(r)$ time, $O(1)$ space.

### Method 2 — Pascal's triangle (a whole table)

Need *many* coefficients, or a modulus that isn't prime? Grow the triangle. Pascal's rule uses **only addition**, so it works under *any* modulus — no inverses, no prime requirement:

```cpp
// Full table C[n][r] for all n, r <= N — O(N^2).
const int N = 1000;
vector<vector<long long>> C(N + 1, vector<long long>(N + 1, 0));
for (int n = 0; n <= N; n++) {
    C[n][0] = 1;
    for (int r = 1; r <= n; r++) {
        C[n][r] = C[n - 1][r - 1] + C[n - 1][r];   // % MOD here if needed
    }
}
```

- **Use when:** $n$ is small ($\le$ a few thousand), you want lots of values, or the modulus is composite/awkward.
- **Complexity:** $O(N^2)$ time and space. Only $O(N)$ space if you keep one rolling row.

### Method 3 — modulo a prime (the competitive-programming workhorse)

This is the one you'll reach for most. The answer is wanted modulo a prime $p$ (famously $10^9+7$), with $n$ up to $10^6$ or so. You can't divide under a modulus — so multiplication by a [[Modular Inverse|modular inverse]] stands in for it:

$$
\binom{n}{r} \equiv n! \cdot (r!)^{-1} \cdot \big((n-r)!\big)^{-1} \pmod p
$$

Precompute every factorial and every *inverse* factorial once. The clever part: you don't run a modular inverse for each one. Invert the **largest** factorial a single time (via Fermat's little theorem, $a^{-1} \equiv a^{p-2}$), then walk **backwards** — since $(i-1)!^{-1} = i!^{-1} \cdot i$:

```cpp
const int MOD = 1e9 + 7;
const int MAXN = 1e6 + 5;
long long fact[MAXN], inv_fact[MAXN];

long long power(long long a, long long b, long long m) {
    long long res = 1; a %= m;
    while (b) {
        if (b & 1) res = res * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return res;
}

void precompute() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++)
        fact[i] = fact[i - 1] * i % MOD;
    inv_fact[MAXN - 1] = power(fact[MAXN - 1], MOD - 2, MOD);  // one Fermat inverse
    for (int i = MAXN - 1; i > 0; i--)
        inv_fact[i - 1] = inv_fact[i] * i % MOD;               // walk backwards
}

long long binom(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD;
}
```

- **Use when:** the modulus is a prime larger than $n$ — the standard CP setting.
- **Complexity:** $O(n)$ precompute (a *single* $O(\log p)$ inversion, not $n$ of them), then **$O(1)$ per query**.

### Method 4 — Lucas's theorem (astronomically large $n$, small prime)

Method 3 needs `fact[]` sized to $n$. If $n$ is $10^{18}$, that array can't exist. When the prime $p$ is *small*, **Lucas's theorem** rescues you. Write $n$ and $r$ in base $p$; then the coefficient mod $p$ is the product of the coefficients of the matching digits:

$$
\binom{n}{r} \equiv \prod_{i} \binom{n_i}{r_i} \pmod p,
\qquad n = \sum_i n_i\,p^i,\quad r = \sum_i r_i\,p^i
$$

Each digit is below $p$, so every small coefficient comes from `fact[]`/`inv_fact[]` sized only to $p$. If any digit has $r_i > n_i$, the whole product is $0$:

```cpp
// C(n, r) mod p for huge n, r. p prime and small;
// fact[]/inv_fact[] precomputed mod p, sized to p.
long long lucas(long long n, long long r, int p) {
    if (r == 0) return 1;
    int ni = n % p, ri = r % p;
    if (ri > ni) return 0;                                  // a digit fails
    long long lo = fact[ni] * inv_fact[ri] % p
                              * inv_fact[ni - ri] % p;
    return lo * lucas(n / p, r / p, p) % p;                 // recurse on higher digits
}
```

- **Use when:** $n$ is enormous but the prime modulus is small enough to tabulate.
- **Complexity:** $O(p)$ precompute, then $O(p + \log_p n)$ per query.

### Beyond: prime powers and arbitrary moduli

If the modulus is a **prime power** $p^b$, factorials share the factor $p$ and aren't invertible — you strip out the powers of $p$ first (counting them with Legendre's formula), invert what's left, and reattach. For a fully **composite** modulus, factor it, solve modulo each prime power, and glue the answers with the [[Chinese Remainder Theorem]]. These are rare in practice — know they exist, reach for them only when a problem truly forces a non-prime modulus.

### Which method to use

| Your situation | Method | Per-query cost |
|---|---|---|
| A few exact values, $n \lesssim 62$ | Multiplicative formula | $O(r)$ |
| Many values, small $n$, any modulus | Pascal's triangle | $O(1)$ after $O(n^2)$ |
| Mod a prime $p > n$, $n \le 10^6$ | Factorials + inverse factorials | $O(1)$ after $O(n)$ |
| $n$ huge, prime $p$ small | Lucas's theorem | $O(p + \log_p n)$ |
| Modulus a prime power / composite | Strip $p$ / CRT | varies |

Identify the row first. The code is just the row's lookup.

---

## A worked example

> A grid is 4 squares wide and 3 squares tall. You start at the bottom-left corner and may only step **right** or **up**. How many paths reach the top-right corner?

Every path is a sequence of moves: $4$ rights (R) and $3$ ups (U), in some order — $7$ moves total. A path *is* an arrangement of `RRRRUUU`.

So the question becomes: out of $7$ move-slots, which $3$ are the ups? That choice fixes the whole path:

$$
\binom{7}{3} = 35 \text{ paths}
$$

This "lattice path = which slots get the U" bijection is a combinatorics staple — and it's secretly why Pascal's rule works: a path either ends with a final R or a final U, splitting the count exactly like $\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$.

---

## Common pitfalls

- **Off-by-one in the row.** Row $n$ has $n+1$ entries, indexed $\binom{n}{0}$ through $\binom{n}{n}$. Row 4 is `1 4 6 4 1`, not `1 3 3 1`.
- **Swapping the exponents in the theorem.** The term is $\binom{n}{r}a^{n-r}b^{r}$ — the exponent of $b$ matches the *bottom* of the coefficient.
- **Calling factorials in a loop.** Repeated $\frac{n!}{r!(n-r)!}$ overflows and wastes time. Build the triangle once, or use the multiplicative loop.
- **Forgetting $n \ge 1$ on the alternating sum.** For $n=0$ the sum is $\binom{0}{0} = 1$, not $0$.

---

## Summary

- **Pascal's triangle** grows by Pascal's rule, $\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$.
- **Binomial theorem:** $(a+b)^n = \sum_r \binom{n}{r} a^{n-r} b^r$ — the coefficient counts which brackets donated a $b$.
- **Row sum** $= 2^n$, **alternating sum** $= 0$, plus **hockey-stick** and **Vandermonde**.
- Every identity is *one set counted two ways* — that's a combinatorial proof.
- **In code:** build the triangle in $O(n^2)$ with additions only.

_Next: [[Inclusion–Exclusion]] — counting when your cases overlap, and the cancellation that fixes it._
