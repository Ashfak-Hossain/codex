---
title: Permutations and Combinations
description: Arranging versus choosing - permutations nPr and the factorial, combinations nCr, why nCr divides nPr by r!, repetition variants, and the core identities.
tags:
  - combinatorics
  - math
date: 2026-05-18
---

The [[Counting Principles]] page left you with one unfinished question: when does **order matter**? That single question splits the world of counting in two.

- **Permutations** — arrangements, where order *matters*. `ABC` and `CBA` are different.
- **Combinations** — selections, where order *does not matter*. `ABC` and `CBA` are the same group.

Same objects, same "pick $r$ of them" — but two different counts. This page builds both, and shows they're really the same formula with one extra division.

---

## Permutations: when order matters

> A **permutation** is an ordered arrangement. The number of ways to arrange $r$ objects chosen from $n$ distinct objects is written $P(n, r)$ or $nPr$.

Start with the cleanest case: arrange *all* $n$ objects. Use the rule of product, filling positions left to right and watching the menu shrink:

$$
\underbrace{n}_{\text{pos }1} \times \underbrace{(n-1)}_{\text{pos }2} \times \underbrace{(n-2)}_{\text{pos }3} \times \cdots \times 1
$$

Each position uses up one object, so the next has one fewer to offer. That product is the **factorial**:

$$
n! = n \times (n-1) \times (n-2) \times \cdots \times 2 \times 1, \qquad 0! = 1
$$

Why is $0! = 1$? Because there is exactly **one** way to arrange nothing — do nothing. The convention isn't arbitrary; it keeps every formula below honest.

Now the general case — arrange only $r$ of the $n$. You fill $r$ positions and then stop:

$$
nPr = \underbrace{n \times (n-1) \times \cdots \times (n-r+1)}_{r \text{ factors}} = \frac{n!}{(n-r)!}
$$

The $(n-r)!$ in the denominator simply cancels off the tail you never used.

<font color="#4f81bd">**Example.**</font> 3 runners take gold, silver, bronze out of 8 athletes. Order matters — gold ≠ bronze:

$$
8P3 = \frac{8!}{5!} = 8 \times 7 \times 6 = 336
$$

---

## Permutations with repetition

If objects can repeat — each position refills from the *full* set every time — the menu never shrinks. It's just the rule of product, plain:

$$
n^r
$$

This is your 8-character password from the last page: $26^8$. Repetition allowed, order matters.

---

## Combinations: when order stops mattering

Now you only want the *group*, not its order. A 3-person committee is the same committee no matter who you name first.

> A **combination** is an unordered selection. The number of ways to choose $r$ objects from $n$ distinct objects is written $C(n, r)$, $nCr$, or $\binom{n}{r}$ (read "$n$ choose $r$").

Here's the key move — and it's the "count loosely, then divide" trick from [[Counting Principles]]:

1. Count the **ordered** picks first: that's $nPr$.
2. But every group of $r$ objects was counted once for *each* of its orderings — and $r$ objects have $r!$ orderings.
3. So divide the overcounting away.

$$
\binom{n}{r} = \frac{nPr}{r!} = \frac{n!}{r!\,(n-r)!}
$$

<font color="#c0504d">**Example.**</font> Choose a 3-person committee from 8 people. Order doesn't matter:

$$
\binom{8}{3} = \frac{8 \times 7 \times 6}{3!} = \frac{336}{6} = 56
$$

Same $336$ ordered picks as the medal example — divided by the $3! = 6$ orderings that no longer count as different.

A handy way to read the relationship:

$$
nPr = \binom{n}{r} \times r! \qquad\Longleftrightarrow\qquad \text{arrange} = \text{choose, then order}
$$

---

## Combinations with repetition

What if you can pick the same item more than once — say, 3 scoops of ice cream from 5 flavours, repeats allowed, and order doesn't matter? A short bijection (a trick called *stars and bars*) gives:

$$
\left(\!\!\binom{n}{r}\!\!\right) = \binom{n + r - 1}{r}
$$

So 3 scoops from 5 flavours is $\binom{5 + 3 - 1}{3} = \binom{7}{3} = 35$. We'll meet stars and bars properly later — for now, just know the case exists.

---

## A field guide to the four cases

Every "pick $r$ from $n$" problem lands in exactly one box. Ask two questions: *does order matter?* and *can items repeat?*

| | Order matters | Order doesn't |
|---|---|---|
| **No repetition** | $nPr = \dfrac{n!}{(n-r)!}$ | $\dbinom{n}{r} = \dfrac{n!}{r!(n-r)!}$ |
| **Repetition allowed** | $n^r$ | $\dbinom{n+r-1}{r}$ |

Identifying the box *is* the problem. The formula is just lookup.

---

## Two identities worth knowing

**Symmetry.** Choosing which $r$ to *include* is the same as choosing which $n-r$ to *leave out*:

$$
\binom{n}{r} = \binom{n}{n-r}
$$

So $\binom{8}{3} = \binom{8}{5}$ — and you'd compute $\binom{8}{3}$ because smaller $r$ means less arithmetic.

**Pascal's rule.** Pick a specific object. Either it's in your group or it isn't:

$$
\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}
$$

The left term counts groups that *include* it; the right, groups that *exclude* it. This recurrence is the engine of Pascal's triangle — the whole story of the next page, [[Binomial Coefficients]].

---

## Computing it without exploding

$8!$ is fine; $25!$ overflows a 64-bit integer. Never build the full factorials — multiply and divide as you go, $r$ steps total:

```cpp
// nCr by the multiplicative formula — O(r), overflow-safe
// for results that themselves fit in long long.
long long nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    r = min(r, n - r);                 // symmetry: keep r small
    long long result = 1;
    for (int i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }
    return result;
}
```

The division is always exact: after multiplying $i+1$ consecutive integers, the running product is divisible by $(i+1)!$, so step $i$ divides cleanly. For many queries against a fixed modulus you'd precompute factorials and [[Modular Inverse|modular inverses]] instead — but that's a number-theory tie-in for another day.

---

## A worked example

> A standard deck has 52 cards. How many 5-card poker hands are possible? And how many of those are a *flush* (all 5 cards one suit)?

A poker hand is unordered — you don't care what order you're dealt. So it's a combination:

$$
\binom{52}{5} = \frac{52 \times 51 \times 50 \times 49 \times 48}{5!} = 2{,}598{,}960
$$

For a flush: first **choose the suit** (4 options), then **choose 5 cards from that suit's 13**. That's an AND — rule of product:

$$
4 \times \binom{13}{5} = 4 \times 1287 = 5148
$$

Split the decision, count each part, multiply. The [[Counting Principles]] rhythm never leaves you.

---

## Common pitfalls

- **Using a permutation when order doesn't matter.** A committee isn't a podium. If `{A,B,C}` and `{C,B,A}` are the same answer, you want $\binom{n}{r}$, not $nPr$.
- **Forgetting to divide by $r!$.** That missing division *is* the difference between the two — skip it and you overcount by exactly $r!$.
- **Building full factorials.** $n!$ overflows fast. Use the multiplicative loop above.
- **Mixing repetition rules.** "Can the same item appear twice?" decides between $n^r$ and the no-repetition formulas. Check it before reaching for a formula.

---

## Summary

- **Permutation** — order matters: $nPr = \dfrac{n!}{(n-r)!}$, or $n^r$ with repetition.
- **Combination** — order doesn't: $\binom{n}{r} = \dfrac{n!}{r!(n-r)!}$, or $\binom{n+r-1}{r}$ with repetition.
- **The bridge:** $\binom{n}{r} = nPr / r!$ — choosing is arranging with the orderings divided out.
- **Identities:** symmetry $\binom{n}{r} = \binom{n}{n-r}$, and Pascal's rule.
- **In code:** multiply-and-divide step by step; never form full factorials.

_Next: [[Binomial Coefficients]] — Pascal's triangle and the identities hiding inside $\binom{n}{r}$._
