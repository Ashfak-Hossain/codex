---
title: Counting Principles
description: The two rules every counting problem is built from - the rule of product (AND) and the rule of sum (OR), how to tell them apart, counting by bijection, and dividing away overcounting.
tags:
  - combinatorics
  - math
date: 2026-05-18
---

Combinatorics has a reputation for being scary. It is not. It is just **counting** — the same counting you did on your fingers as a kid, except the numbers got too big to use your fingers.

How many 8-character passwords exist? How many ways can 10 people sit at a table? You are never going to list them all. So instead of listing, you learn a couple of rules — and honestly, there are only **two**. Every counting problem in this whole chapter is those two rules in a trench coat. Meet them now and the rest is just costume changes.

---

## Meet the Rule of Product

The Rule of Product never met a choice it didn't want to multiply. Hand it a task built from **steps**, and it pounces:

> If a task happens in steps — step 1 in $m$ ways **and** step 2 in $n$ ways — the whole task happens in $m \times n$ ways.

Its favorite word is **AND**. Step 1 happens, *and then* step 2 happens. Both occur.

Picture getting dressed: <font color="#4f81bd">3 shirts</font>, <font color="#c0504d">2 pairs of jeans</font>. Lay out every outfit:

$$
\begin{array}{c|cc}
 & \text{jeans}_1 & \text{jeans}_2 \\
\hline
\text{shirt}_1 & (s_1, j_1) & (s_1, j_2) \\
\text{shirt}_2 & (s_2, j_1) & (s_2, j_2) \\
\text{shirt}_3 & (s_3, j_1) & (s_3, j_2) \\
\end{array}
$$

It's a grid. $3$ rows, $2$ columns, $3 \times 2 = 6$ cells. The Rule of Product just measures the grid. That's it. That's the whole trick.

And it doesn't stop at two steps — feed it as many as you like. An 8-character password using lowercase letters? Every slot independently picks from 26 letters:

$$
\underbrace{26 \times 26 \times \cdots \times 26}_{8 \text{ slots}} = 26^8 \approx 2.09 \times 10^{11}
$$

**Why multiply and not add?** Because every shirt walks into the room and finds *the same two pairs of jeans waiting for it*. Three shirts, two jeans each — you're counting "2" three times over. That's multiplication.

---

## Meet the Rule of Sum

The Rule of Product's quieter partner is the Rule of Sum. It doesn't multiply — it prefers **options**.

> If a task can be done as **case A or case B**, with no overlap, and A has $m$ ways while B has $n$ ways, the task has $m + n$ ways.

Its favorite word is **OR**. You pick *one* case. These are alternatives, not steps — a fork in the road, not two rooms in a row.

Say you commute by **bus or train**: <font color="#4f81bd">3 bus routes</font>, <font color="#c0504d">2 train routes</font>. One trip uses one route:

$$
3 \;+\; 2 \;=\; 5 \text{ possible trips}
$$

Nobody rides a bus *and* a train on the same trip, so there's no grid here — just a pile of 3 plus a pile of 2.

The Rule of Sum has **one rule of its own**: the cases must not overlap. If some route somehow counted as both a bus and a train, you'd count it twice and the Rule of Sum would quietly lie to you. When cases *do* overlap, you call in the specialist — [[Inclusion–Exclusion]], a later page. For now, keep your piles separate.

---

## The only question that matters

Nearly every beginner mistake is summoning the wrong rule. The cure is one question, asked out loud:

> **Do I do both things, or do I pick one?**

| What's happening | Magic word | Rule | Operation |
|---|---|---|---|
| Do this **and then** that | AND | Product | $\times$ |
| Do this **or** that (separate cases) | OR | Sum | $+$ |

Read the problem. Underline every *and* and every *or*. They're not grammar — they're instructions telling you which rule to call.

---

## When the two team up

Real problems don't pick a side — they use both. The combo move:

> **Split into cases (OR), multiply the steps inside each case (AND), then add the cases up.**

**The mission.** How many length-3 strings are *all digits* or *all lowercase letters*?

- Case A — all digits: each slot picks from 10 → $10 \times 10 \times 10 = 1000$
- Case B — all letters: each slot picks from 26 → $26 \times 26 \times 26 = 17576$

A string can't be all-digits *and* all-letters, so the cases don't overlap — the Rule of Sum is safe:

$$
1000 + 17576 = 18576
$$

Split, multiply, add. That rhythm cracks an enormous fraction of counting problems.

---

## Counting by bijection: the disguise trick

Sometimes the thing you want to count is a slippery mess — but it's secretly wearing a disguise, and underneath it's something *easy*. If you can match your messy set one-to-one with an easy set, they must be the same size. That perfect matching has a fancy name, **bijection**, but it's just "everyone has exactly one dance partner."

> If every item of $A$ pairs with exactly one item of $B$ and vice versa, then $|A| = |B|$.

**The mission.** How many subsets does a set of $n$ elements have? Listing subsets is a headache. So unmask them: match each subset to a binary string — slot $i$ is `1` if element $i$ is in, `0` if out.

$$
\{a, c\} \;\longleftrightarrow\; 1\,0\,1\,0 \qquad (\text{from } \{a,b,c,d\})
$$

Every subset is one string, every string is one subset — flawless pairing. And strings are easy: the Rule of Product says $2^n$. So a set of $n$ elements has $2^n$ subsets, and you never listed a single one.

The lesson: when counting gets hard, don't push harder — find the easy thing it's secretly equal to.

---

## Dividing away the overcounting

The Rule of Product is enthusiastic. Sometimes *too* enthusiastic — it counts the same outcome more than once. If every real outcome got counted exactly $k$ times, just **divide by $k$** and the overcounting evaporates.

**The mission.** Seat 3 people around a *round* table. In a straight row there are $3 \times 2 \times 1 = 6$ orders. But a circle has no "first seat" — rotate everyone one chair over and it's the *same* arrangement. Each real seating got counted $3$ times (once per rotation), so:

$$
\frac{3 \times 2 \times 1}{3} = 2 \text{ genuinely different circular seatings}
$$

"Count loosely, then divide by the duplication" is one of the most powerful moves in the book — it's literally how the combination $\binom{n}{r}$ is born on the next page, [[Permutations and Combinations]].

---

## A boss fight: the no-repeats PIN

> A PIN is 4 digits. How many PINs have **no two neighbouring digits equal**?

Think in steps (AND), but watch the choices carefully — the rules of the dungeon shrink them:

- Digit 1: anything → $10$ ways
- Digit 2: anything *except* digit 1 → $9$ ways
- Digit 3: anything except digit 2 → $9$ ways
- Digit 4: anything except digit 3 → $9$ ways

$$
10 \times 9 \times 9 \times 9 = 7290
$$

The plot twist: a step's count isn't always the full menu — a constraint can steal an option. Reading that constraint right *is* the whole skill.

Don't trust me — make the computer check:

```cpp
// Brute force — fine for tiny sizes, perfect for
// confirming the formula didn't lie to us.
int count = 0;
for (int n = 0; n < 10000; n++) {
    int d[4] = { n / 1000, n / 100 % 10, n / 10 % 10, n % 10 };
    bool ok = true;
    for (int i = 0; i + 1 < 4; i++)
        if (d[i] == d[i + 1]) ok = false;
    count += ok;
}
// count == 7290  ✓
```

---

## Traps the dungeon leaves for you

- **Multiplying when you should add.** "Bus *or* train" is a sum. Write $3 \times 2$ and you've answered a different question — "a bus leg *and* a train leg" — for a trip nobody took.
- **Adding overlapping cases.** The Rule of Sum demands disjoint piles. Overlap means double-counting; that's a job for [[Inclusion–Exclusion]].
- **Forgetting a constraint shrinks the menu.** In the PIN fight, steps 2–4 had 9 choices, not 10. Re-read the restriction *before* you multiply.
- **"Arrange" vs "choose".** Arranging cares about order; choosing doesn't. Mix them up and you overcount — [[Permutations and Combinations]] sorts this out for good.

---

## The recap

- **Rule of Product (AND):** steps in a row → multiply. It's just measuring a grid.
- **Rule of Sum (OR):** separate, non-overlapping cases → add. It's just stacking piles.
- **Team-up:** split into cases, multiply inside each, add across them.
- **Bijection:** count a hard set by pairing it with an easy twin.
- **Divide:** counted everything $k$ times? Divide by $k$.

Master those five moves and the rest of combinatorics is just choosing which one to pull out.

_Next: [[Permutations and Combinations]] — arranging things versus choosing them._
