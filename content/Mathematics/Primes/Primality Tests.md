---
title: Primality Tests
description: Deciding whether a number is prime — trial division and its √n wall, the Fermat test built on Fermat's little theorem, why Carmichael numbers defeat it, and the Miller–Rabin strong test with its square-root-of-1 trick, error bound, and a deterministic base set that settles every 64-bit integer.
tags:
  - number-theory
  - math
date: 2026-05-16
---

"Is $n$ prime?" sounds like it should cost a factorization — find a divisor, or prove none exists. It does not. **Primality testing** and **factoring** split apart sharply: you can certify a $300$-digit number prime in milliseconds, yet factoring that same number would outlast the universe. That gap is not a footnote — it is the foundation RSA stands on.

The reason is that primality has a _shortcut_. A prime $p$ leaves a fingerprint on the exponent $a^{p-1}$, and that fingerprint can be checked without ever finding a factor. This page walks the ladder of tests — trial division, the Fermat test, and finally **Miller–Rabin**, fast enough and certain enough to be the primality routine inside every cryptography library and competitive-programming template.

_Prereqs: [[Modular Arithmetic|modular arithmetic]] · [[Binary Exponentiation|modular exponentiation]] · [[Prime Factorization|prime factorization]]._

---

## At a Glance

$$
\boxed{\ p \text{ prime},\ \gcd(a, p) = 1 \ \Longrightarrow\ a^{p-1} \equiv 1 \pmod p\ }
$$

Miller–Rabin turns that identity into a test. The version below is **deterministic for every 64-bit integer** — the twelve prime bases $\{2, 3, \dots, 37\}$ leave no composite undetected below $2^{64}$.

```cpp
using u64 = uint64_t;
using u128 = __uint128_t;

u64 power(u64 a, u64 d, u64 m) {            // a^d mod m, via binary exponentiation
  u64 r = 1; a %= m;
  while (d) {
    if (d & 1) r = (u128)r * a % m;
    a = (u128)a * a % m;
    d >>= 1;
  }
  return r;
}

bool is_prime(u64 n) {
  if (n < 2) return false;
  for (u64 p : {2,3,5,7,11,13,17,19,23,29,31,37})
    if (n % p == 0) return n == p;          // small prime, or a multiple of one

  int s = 0; u64 d = n - 1;
  while ((d & 1) == 0) d >>= 1, ++s;        // n - 1 = 2^s * d, with d odd

  for (u64 a : {2,3,5,7,11,13,17,19,23,29,31,37}) {
    u64 x = power(a, d, n);
    if (x == 1 || x == n - 1) continue;     // this base is satisfied
    bool composite = true;
    for (int r = 1; r < s; ++r) {
      x = (u128)x * x % n;
      if (x == n - 1) { composite = false; break; }
    }
    if (composite) return false;            // a is a witness — n is composite
  }
  return true;
}
```

**Complexity:** $O(\log n)$ modular multiplications per base, a fixed $12$ bases — effectively $O(\log n)$, with the heavy step being one [[Binary Exponentiation|modular exponentiation]].

---

## Trial Division — The Honest Baseline

The definition itself is an algorithm: $n$ is prime iff no integer in $[2, n-1]$ divides it. And you never need to look past $\sqrt{n}$ — if $n = a \cdot b$ with $a \le b$, then $a \le \sqrt{n}$, so the smaller factor always shows up first.

```cpp
bool is_prime_trial(int64_t n) {
  if (n < 2) return false;
  for (int64_t d = 2; d * d <= n; d++)
    if (n % d == 0) return false;
  return true;
}
```

**Complexity:** $O(\sqrt n)$. That is fine for $n \le 10^{12}$ or so — a million divisions — and trial division has one quality nothing else here offers: when it says composite, it hands you a factor for free.

But $\sqrt n$ is a wall. For a $40$-digit number $\sqrt n \approx 10^{20}$ — unreachable. Cryptographic primes have hundreds of digits. We need a test whose cost scales with the _number of digits_ of $n$, not its square root. That means leaving divisors behind and reading $n$'s primality off an **exponent** instead.

---

## Fermat's Test — Primality by Exponent

[[Euler's Totient Function|Fermat's little theorem]] is the opening:

> **Fermat's Little Theorem.** If $p$ is prime and $\gcd(a, p) = 1$, then $a^{p-1} \equiv 1 \pmod p$.

Read it as a _necessary condition_. If $n$ is prime, then $a^{n-1} \bmod n$ **must** equal $1$ for every base $a$ coprime to $n$. So flip it into a test by contraposition:

> If $a^{n-1} \not\equiv 1 \pmod n$ for even a single base $a$, then $n$ is **definitely composite**. Such an $a$ is a **Fermat witness**.

```cpp
bool fermat_test(int64_t n, int64_t a) {     // false  =>  n is definitely composite
  return power(a, n - 1, n) == 1;
}
```

One modular exponentiation — $O(\log n)$ multiplications — settles a base. The catch is the other direction: $a^{n-1} \equiv 1$ does **not** prove $n$ prime. A composite $n$ that passes for base $a$ is a **Fermat pseudoprime** to that base, and $a$ is a **Fermat liar**. The hope is that a few random bases make a liar unlikely.

That hope has a hole.

---

## Where Fermat Fails: Carmichael Numbers

For most composites, liars are rare and a handful of random bases expose them. But a thin, infinite family of composites passes the Fermat test for **every** base coprime to them:

> **Carmichael number.** A composite $n$ with $a^{n-1} \equiv 1 \pmod n$ for _all_ $a$ coprime to $n$.

The smallest is

$$
561 = 3 \cdot 11 \cdot 17
$$

No coprime base is a Fermat witness for $561$ — the test calls it "probably prime" every time, and it is wrong every time. Carmichael numbers are sparse but there are infinitely many of them (Alford–Granville–Pomerance, 1994), so "just pick more bases" never fixes the Fermat test. The flaw is structural, and patching it needs a strictly stronger idea.

---

## Miller–Rabin: Catching the Liars

### The key fact — square roots of 1

Miller–Rabin extracts more from the same exponentiation by leaning on one extra property of primes:

> **Lemma.** If $p$ is prime, the only solutions of $x^2 \equiv 1 \pmod p$ are $x \equiv 1$ and $x \equiv -1$.

**Proof.** $x^2 \equiv 1$ means $p \mid x^2 - 1 = (x-1)(x+1)$. Since $p$ is prime, it must divide one of the factors — so $x \equiv 1$ or $x \equiv -1 \pmod p$. $\square$

For a **composite** $n$, this can break: there may exist a **nontrivial square root of 1** — some $x \not\equiv \pm 1$ with $x^2 \equiv 1 \pmod n$. Finding one is an ironclad proof that $n$ is composite. Modulo $561$, for instance, $67^2 = 4489 = 8 \cdot 561 + 1 \equiv 1$, yet $67 \not\equiv \pm 1$ — a rogue root the Fermat test never inspects.

### The strong test

Factor all the powers of two out of the exponent:

$$
n - 1 = 2^s \cdot d, \qquad d \text{ odd}
$$

Now look at the chain that climbs from $a^d$ to $a^{n-1}$ by repeated squaring:

$$
a^{d},\quad a^{2d},\quad a^{4d},\quad \dots,\quad a^{2^{s-1} d},\quad a^{2^s d} = a^{n-1}
$$

Each term is the square of the one before. If $n$ is prime, Fermat forces the last term to be $1$ — and then the lemma forces its square root (the previous term) to be $\pm 1$, and so on down the chain. So for a **prime** $n$, one of two things must hold:

$$
a^{d} \equiv 1 \pmod n
\qquad\text{or}\qquad
a^{2^{r} d} \equiv -1 \pmod n \ \text{ for some } 0 \le r < s
$$

If **neither** holds, the chain reaches $1$ from some value other than $-1$ — a nontrivial square root surfaced — and $n$ is composite. That base $a$ is a **Miller–Rabin witness**, and unlike the Fermat test, no Carmichael number can hide from it.

### Algorithm

```cpp
bool miller_rabin(u64 n, u64 a, u64 d, int s) {   // true => n is composite
  u64 x = power(a, d, n);
  if (x == 1 || x == n - 1) return false;         // first chain condition met
  for (int r = 1; r < s; ++r) {
    x = (u128)x * x % n;                          // climb the squaring chain
    if (x == n - 1) return false;                 // hit -1: base satisfied
  }
  return true;                                    // never hit ±1 => witness
}
```

### Trace — `561` against base 2

$561 - 1 = 560 = 2^4 \cdot 35$, so $s = 4$ and $d = 35$. Start at $x = 2^{35} \bmod 561 = {\color{royalblue}263}$, then square, watching for $560$ (which is $-1 \bmod 561$):

| step         | $x$                              | $\equiv 1$? | $\equiv 560$? |
| :----------- | :------------------------------- | :---------: | :-----------: |
| $x = 2^{35}$ | ${\color{royalblue}263}$         |     no      |      no       |
| square       | $263^2 \equiv 166$               |      —      |      no       |
| square       | $166^2 \equiv 67$                |      —      |      no       |
| square       | $67^2 \equiv {\color{crimson}1}$ |      —      |      no       |

The chain hit $1$ — but it arrived from ${\color{crimson}67}$, not from $\pm 1$. That nontrivial square root is the witness: Miller–Rabin declares $561$ **composite** on the very first base.

Compare the Fermat test on the same number. $2^{560} = (2^{35})^{2^4}$ squares $263 \to 166 \to 67 \to 1 \to 1$, ending at $1$ — so Fermat reports "probably prime" and is fooled. Miller–Rabin saw the _same_ arithmetic but inspected the step into $1$, and caught the lie. That extra glance is the whole difference.

---

## How Many Bases Are Enough?

### The randomized bound

Miller–Rabin's safety net is a theorem of Rabin:

> For any odd composite $n$, **at least $3/4$** of the bases in $[2, n-2]$ are witnesses.

So a composite can fool _at most_ one base in four. The non-witnesses are called **strong liars**, and unlike Fermat liars they never reach $100\%$ — there is no Carmichael analogue. Test $k$ independent random bases:

$$
\Pr[\text{composite passes all } k] \;\le\; \left(\tfrac14\right)^{k} = 4^{-k}
$$

At $k = 20$ that is below $10^{-12}$ — rarer than a hardware fault. For most numbers the true liar fraction is minuscule, so the $1/4$ figure is a pessimistic worst case.

### Deterministic base sets

For _bounded_ $n$, randomness can be dropped entirely. Exhaustive searches have pinned down small fixed base sets that catch **every** composite below a threshold:

$$
\begin{array}{ll}
\hline
\textbf{Bases (all primes)} & \textbf{Deterministic for all } n < \\
\hline\\[-8pt]
\{2,\,3\}                          & 1{,}373{,}653 \\[3pt]
\{2,\,3,\,5,\,7\}                  & 3{,}215{,}031{,}751 \\[3pt]
\{2,3,5,7,11,13,17\}               & 341{,}550{,}071{,}728{,}321 \\[3pt]
\{2,3,5,7,11,13,17,19,23,29,31,37\} & 3.3 \times 10^{23} \ (>\, 2^{64}) \\[3pt]
\hline
\end{array}
$$

The last row is the one that matters in practice: those twelve bases decide **every `unsigned long long`** with no error at all — that is exactly the `is_prime` in _At a Glance_. A known faster alternative covers all $n < 2^{64}$ with just **seven** bases, $\{2,\ 325,\ 9375,\ 28178,\ 450775,\ 9780504,\ 1795265022\}$ — these are deliberately _composite_ numbers found by search, not primes.

> **Note.** These deterministic guarantees are _unconditional but bounded_ — verified only up to the stated thresholds. Miller's original test gave a fully general deterministic algorithm using bases up to $O(\log^2 n)$, but only assuming the unproven Generalized Riemann Hypothesis. Rabin's randomization traded that hypothesis for a coin flip.

---

## Testing One Number vs. an Entire Range

Match the tool to the question:

- **One large $n$** (or many unrelated ones) → **Miller–Rabin**. $O(\log n)$ per query, no memory.
- **Every prime up to $N$** → the **[[Sieve of Eratosthenes]]**. $O(N \log\log N)$ time and an $O(N)$ array, but it produces _all_ primes in one sweep — far better than $N$ separate tests.

A common pattern uses both: sieve the small primes once, trial-divide by those to strip easy factors, then hand the survivor to Miller–Rabin.

---

## Complexity

Each base runs one modular exponentiation — $O(\log n)$ modular multiplications — followed by at most $s - 1 < \log_2 n$ more squarings. With a fixed set of $k$ bases:

$$
O\!\left(k \log n\right) \text{ modular multiplications}, \qquad O(1) \text{ space}
$$

For 64-bit $n$ each modular multiplication is a single `__int128` product, so the whole test is a few hundred machine multiplications — microseconds. Against trial division's $O(\sqrt n)$, this is the difference between $\log n \approx 64$ and $\sqrt n \approx 4 \times 10^9$ operations.

> A truly _general_ deterministic polynomial-time test exists — **AKS** (Agrawal–Kayal–Saxena, 2002) settled "PRIMES is in P". But its constants are enormous; in practice Miller–Rabin, deterministic on every range that fits in a machine word, is what everyone runs.

---

## Edge Cases

$$
\begin{array}{lll}
\hline
\textbf{Input} & \textbf{Result} & \textbf{Why} \\
\hline\\[-8pt]
n < 2 & \text{not prime} & 0,\ 1,\ \text{and negatives are excluded by definition} \\[4pt]
n = 2 & \text{prime} & \text{the only even prime} \\[4pt]
n = 3 & \text{prime} & \text{caught by the small-prime check} \\[4pt]
\text{even } n > 2 & \text{composite} & \text{divisible by } 2 \\[4pt]
n \in \{2,\dots,37\} & \text{handled directly} & \text{the trial-division loop returns } n == p \\[4pt]
\hline
\end{array}
$$

**Other things that bite:**

- **Overflow in the multiply.** $x \cdot x$ for $x$ near $2^{64}$ overflows a `u64`. The `(u128)` cast is mandatory — without `__int128`, fall back to a [[Binary Exponentiation|binary-multiplication]] `mulmod`.
- **A base $\ge n$.** When $n$ is itself tiny, a base may exceed it; `power` reduces with `a %= m` first, and the small-prime loop returns before Miller–Rabin ever sees such a case.
- **$1$ is not prime.** It is a unit, not a prime — the guard `n < 2` covers it. $1$ being composite-or-prime is a definition error, not an edge case to test.
- **Don't trust a plain Fermat test.** Carmichael numbers ($561, 1105, 1729, \dots$) pass it for all coprime bases. If you only need a quick filter, fine — but never _certify_ with it.
- **Probabilistic vs. deterministic.** With random bases the answer is "prime" with tiny error; with the fixed 12-base set on $n < 2^{64}$ it is exact. Pick deliberately.

---

## References

1. Miller, G. L. "Riemann's Hypothesis and Tests for Primality." _Journal of Computer and System Sciences_, vol. 13, no. 3, 1976, pp. 300–317. — The deterministic test, conditional on the Generalized Riemann Hypothesis.

2. Rabin, M. O. "Probabilistic Algorithm for Testing Primality." _Journal of Number Theory_, vol. 12, no. 1, 1980, pp. 128–138. — The randomized test and the $3/4$-witness bound.

3. Jaeschke, G. "On Strong Pseudoprimes to Several Bases." _Mathematics of Computation_, vol. 61, no. 204, 1993, pp. 915–926. — Verified deterministic base sets for bounded ranges.

4. Alford, W. R., Granville, A., Pomerance, C. "There Are Infinitely Many Carmichael Numbers." _Annals of Mathematics_, vol. 139, no. 3, 1994, pp. 703–722.

5. Agrawal, M., Kayal, N., Saxena, N. "PRIMES Is in P." _Annals of Mathematics_, vol. 160, no. 2, 2004, pp. 781–793.

6. [CP Algorithms — Primality Tests](https://cp-algorithms.com/algebra/primality_tests.html)
