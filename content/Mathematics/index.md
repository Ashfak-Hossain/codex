---
title: Mathematics
description: Mathematics notes for competitive programming and interviews — a complete number-theory track across three chapters, plus a complete combinatorics chapter.
---

# Mathematics

Notes on the mathematics behind algorithms and competitive programming. The material so far is a full **number-theory track** (three chapters, read in order — each assumes the one before it), plus a complete **combinatorics chapter**.

## 1 · Euclidean Algorithms

The oldest algorithms in the book — divisibility and the GCD.

- [[Greatest Common Divisor]] — computing $\gcd(a,b)$ by the modulo recurrence in $O(\log n)$.
- [[Extended Euclidean Algorithm]] — $\gcd$ together with Bézout coefficients $a x + b y = \gcd(a,b)$.

## 2 · Modular Arithmetic

Arithmetic on a clock — the machinery every modular algorithm runs on.

- [[Modular Arithmetic]] — the congruence $a \equiv b \pmod m$; what survives a modulus and what breaks.
- [[Binary Exponentiation]] — $a^n$ in $O(\log n)$ by repeated squaring.
- [[Modular Inverse]] — undoing multiplication modulo $m$; five ways to compute $a^{-1}$.
- [[Linear Congruences]] — solving $a x \equiv b \pmod m$ and counting its solutions.
- [[Chinese Remainder Theorem]] — solving a system $x \equiv r_i \pmod{m_i}$ with coprime moduli.

## 3 · Primes

The building blocks of the integers — finding them, testing them, breaking numbers into them.

- [[Sieve of Eratosthenes]] — every prime up to $N$ in $O(N \log\log N)$.
- [[Primality Tests]] — is one number prime? Trial division to deterministic Miller–Rabin.
- [[Prime Factorization]] — trial division and a smallest-prime-factor sieve.
- [[Euler's Totient Function]] — $\varphi(n)$, counting coprimes; Euler's theorem.

## 4 · Combinatorics

The art of counting without listing — the toolkit behind probability and a huge share of competitive-programming problems.

- [[Counting Principles]] — the rule of product (AND) and rule of sum (OR); the foundation everything else builds on.
- [[Permutations and Combinations]] — arranging versus choosing: $nPr$ and $nCr$.
- [[Binomial Coefficients]] — Pascal's triangle, the binomial theorem, and core identities.
- [[Inclusion–Exclusion]] — counting overlapping sets; derangements.

---

_The number-theory track is complete end to end — from $\gcd$ through the [[Chinese Remainder Theorem]] — and the combinatorics track is now complete too, from [[Counting Principles]] through [[Inclusion–Exclusion]]._
