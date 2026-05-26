---
title: Inclusion–Exclusion
description: Counting overlapping sets - the inclusion-exclusion principle for two, three, and n sets, why the signs alternate, the complement form, derangements as the classic application, and the bitmask implementation.
tags:
  - combinatorics
  - math
date: 2026-05-18
---

The [[Counting Principles]] page gave the rule of sum one warning label: the cases must **not overlap**. Add two overlapping piles and you count the overlap twice.

But overlapping sets are everywhere — "numbers divisible by 2 or 3", "people who speak French or German". You can't always force your cases apart. The **inclusion–exclusion principle** is the rule of sum's grown-up form: it lets the sets overlap and then corrects the double-counting precisely. It's the last tool of this chapter, and it ties the previous three together.

---

## The problem, with two sets

Count the elements in $A \cup B$. Add the sizes:

$$
|A| + |B|
$$

Every element in the overlap $A \cap B$ just got counted **twice** — once in $|A|$, once in $|B|$. So subtract it back out once:

$$
|A \cup B| = |A| + |B| - |A \cap B|
$$

That's the whole idea in miniature: **add the singles, subtract the doubles.**

<font color="#4f81bd">**Example.**</font> Among $1$ to $100$, how many are divisible by $2$ or $3$?

$$
\left\lfloor\tfrac{100}{2}\right\rfloor + \left\lfloor\tfrac{100}{3}\right\rfloor - \left\lfloor\tfrac{100}{6}\right\rfloor = 50 + 33 - 16 = 67
$$

The numbers divisible by *both* 2 and 3 are exactly the multiples of $\operatorname{lcm}(2,3)=6$ — counted twice, removed once.

---

## Three sets: it starts to swing

$$
|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|
$$

Follow one element sitting in **all three** sets. The singles count it $+3$. The pairwise intersections remove it $-3$. It's now at zero — wrong, it should be counted once. So the triple intersection adds it back $+1$. Net: exactly $1$. ✓

The signs *swing*: add singles, subtract pairs, add triples. Each correction overshoots, and the next term reels it back.

---

## The general principle

For any sets $A_1, A_2, \dots, A_n$:

$$
\left| \bigcup_{i=1}^{n} A_i \right| = \sum_{\emptyset \neq S \subseteq \{1,\dots,n\}} (-1)^{|S|+1} \left| \bigcap_{i \in S} A_i \right|
$$

Unpacked: run over every non-empty group of sets; intersect them; add the size if the group is **odd**-sized, subtract if **even**. $2^n - 1$ terms in total.

**Why does it work?** Take an element in exactly $m$ of the sets ($m \ge 1$) and total its contributions. It appears in $\binom{m}{k}$ of the $k$-fold intersections, each carrying sign $(-1)^{k+1}$:

$$
\sum_{k=1}^{m} (-1)^{k+1} \binom{m}{k} = 1 - \sum_{k=0}^{m} (-1)^{k} \binom{m}{k} + 1 = 1 - 0 = 1
$$

That middle sum is the **alternating row sum** from [[Binomial Coefficients]] — it vanishes. Every element, no matter how many sets it lives in, is counted exactly once. The principle is correct *because* of a binomial identity. The chapter closing its own loop.

---

## The complement form (the one you'll actually use)

Most real problems don't ask for a union. They ask: *how many objects have **none** of these properties?* That's the complement, and it's cleaner — no $+1$ sign-flip, just plain alternating signs.

Let $A_i$ be the set of objects *with* property $i$, inside a universe of size $N$:

$$
\left| \overline{A_1} \cap \cdots \cap \overline{A_n} \right| = \sum_{S \subseteq \{1,\dots,n\}} (-1)^{|S|} \left| \bigcap_{i \in S} A_i \right|
$$

The empty set $S$ contributes the whole universe $N$ (an empty intersection is everything). Read it as: **start with everything, subtract each bad property, add back each pair, subtract each triple…** This is the form behind almost every inclusion–exclusion problem you'll meet.

---

## The classic: derangements

> $n$ people each toss their hat in a pile. Each grabs a hat at random. How many ways result in **nobody** getting their own hat back?

An arrangement where *no* element sits in its original spot is a **derangement**, written $D_n$ or $!n$. This is the textbook inclusion–exclusion problem — "none of the properties," where property $i$ is "person $i$ got their own hat."

Universe: all $n!$ permutations. Fix property $i$ (person $i$ has their hat); the other $n-1$ are free → $(n-1)!$. Fix any $k$ specified people → $(n-k)!$, and there are $\binom{n}{k}$ ways to choose which $k$. The complement form gives:

$$
D_n = \sum_{k=0}^{n} (-1)^k \binom{n}{k} (n-k)! = n! \sum_{k=0}^{n} \frac{(-1)^k}{k!}
$$

That tail is the series for $e^{-1}$, so $D_n \approx n!/e$ — **about 37% of all shuffles** are derangements, and the ratio barely moves as $n$ grows. There's also a clean recurrence, handy in code:

$$
D_n = (n-1)\,(D_{n-1} + D_{n-2}), \qquad D_0 = 1,\ D_1 = 0
$$

```cpp
// Derangement counts D[0..n]
vector<long long> D(n + 1);
D[0] = 1;
if (n >= 1) D[1] = 0;
for (int i = 2; i <= n; i++)
    D[i] = (long long)(i - 1) * (D[i - 1] + D[i - 2]);
```

---

## Implementing the general principle

When the $n$ properties have no symmetry, just sum over all $2^n$ subsets directly. A bitmask **is** a subset — bit $i$ set means "property $i$ is in $S$":

```cpp
// Count objects with NONE of n properties (complement form).
// intersection_size(mask) = |objects having ALL properties in mask|.
long long countNone(int n) {
    long long answer = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        int bits = __builtin_popcount(mask);
        long long term = intersection_size(mask);
        answer += (bits & 1) ? -term : term;   // odd subset subtracts
    }
    return answer;
}
```

- **Complexity:** $O(2^n)$ calls to `intersection_size`. Practical up to roughly $n \le 20$ — beyond that, you need structure (like the derangement symmetry above) instead of brute subsets.

---

## A worked example

> How many integers in $[1, 100]$ are divisible by **none** of $2$, $3$, or $5$?

Complement form. Universe $N = 100$; properties = divisibility by $2$, $3$, $5$. Each intersection counts multiples of the relevant lcm:

$$
\begin{aligned}
&100 && \text{(empty set: everything)}\\
-\;&\lfloor 100/2\rfloor - \lfloor 100/3\rfloor - \lfloor 100/5\rfloor && = -(50 + 33 + 20)\\
+\;&\lfloor 100/6\rfloor + \lfloor 100/10\rfloor + \lfloor 100/15\rfloor && = +(16 + 10 + 6)\\
-\;&\lfloor 100/30\rfloor && = -3
\end{aligned}
$$

$$
100 - 103 + 32 - 3 = 26
$$

Those 26 are the integers coprime to $30 = 2\cdot3\cdot5$. Run the same argument over the distinct primes of any $n$ and you've **derived [[Euler's Totient Function|Euler's totient]]** — inclusion–exclusion is exactly where that formula's $\prod(1 - 1/p)$ comes from.

---

## Common pitfalls

- **Using the rule of sum on overlapping cases.** If cases can overlap, plain addition double-counts — that's the entire reason this principle exists.
- **Getting the sign backwards.** Union form: odd subsets *add*. Complement form: odd subsets *subtract*. Pick one form and hold it.
- **Forgetting the empty-set term.** In complement form, $S = \emptyset$ contributes the full universe $N$. Drop it and every count collapses.
- **Brute-forcing too many properties.** $2^n$ explodes. Past $n \approx 20$, exploit symmetry — count by *how many* properties hold, as the derangement formula does.

---

## Summary

- **Two sets:** $|A \cup B| = |A| + |B| - |A \cap B|$ — add singles, subtract the overlap.
- **General:** alternate over all $2^n - 1$ non-empty intersections; odd subsets add, even subtract.
- **It's correct because** the alternating binomial sum from [[Binomial Coefficients]] is zero — every element nets to a count of one.
- **Complement form** ("none of the properties") is the workhorse: start with everything, alternate the corrections.
- **Derangements** $D_n \approx n!/e$ are the classic application; the $O(2^n)$ bitmask sum handles the general case.

---

_That closes the **Combinatorics** chapter. You started with two counting rules in [[Counting Principles]], split the world by order in [[Permutations and Combinations]], met the coefficient that counts and expands in [[Binomial Coefficients]], and just learned to count through overlap. Four pages, one toolkit — return to the [[Combinatorics|chapter index]] for the map._
