---
title: Modular Arithmetic
description: Arithmetic on a clock — congruences, fast exponentiation, modular inverses, linear congruences, and systems of them via the Chinese Remainder Theorem. The machinery every modular algorithm runs on.
---

# Modular Arithmetic

Computing with remainders. This chapter sets up the congruence relation, then the three operations built on top of it that the rest of the notes depend on.

1. [[Modular Arithmetic]] — the congruence $a \equiv b \pmod m$; why $+,-,\times$ pass through a modulus and division does not.
2. [[Binary Exponentiation]] — $a^n$ in $O(\log n)$ by repeated squaring; the backbone of modular exponentiation.
3. [[Modular Inverse]] — undoing multiplication modulo $m$; five ways to compute $a^{-1}$.
4. [[Linear Congruences]] — solving $a x \equiv b \pmod m$: when it is solvable and all $\gcd(a,m)$ solutions.
5. [[Chinese Remainder Theorem]] — solving a *system* $x \equiv r_i \pmod{m_i}$: coprime moduli give one unique answer modulo their product.

_Builds on [[Extended Euclidean Algorithm]]; continue with [[Sieve of Eratosthenes]]._
