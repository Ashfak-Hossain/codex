---
title: GCD (Greatest Common Divisor)
description: Dive into the world of GCD. Explore gcd euclid's algorithm, why it works and how it works with perfect example and c++ code.
tags:
  - basic
  - math
date: 2025-01-13
---

**GCD** (Greatest Common Divisor) is also known as **HCF** (Highest Common Factor) or **GCF** (Greatest Common Factor). What is GCD ? GCD of two or more integers $(i \ne 0)$ is the largest int which divides both integers without leaving a reminder.
For integers $a$ and $b$ , $gcd(a, b)$ denotes the largest positive integers $d$ such that $d \mid a$ and $d \mid b$ where $a \mid b$ means $a$ divides $b$.

Example of **GCD** :

$$
\begin{array}{cc}
12 & \{1, 2, 3, {\color{red} 4}, 6, 12\} \\
8 & \{1,2,{\color{red} 4},8\} \\
\hline
\gcd(12,8) & \max(12 \cap 8) = \color{red}{4}
\end{array}
$$

### How can we find this mysterious common integer ?

One of the most efficient algorithms to find GCD is **Euclid's Algorithm**. The idea is based on the principle that the GCD of two numbers also divides their difference.
The algorithm can be expressed as follows:

```cpp
int gcd(int a, int b) {
  if (b == 0)
    return a;
  return gcd(b, a % b);
}
```

### Why does this algorithm work ?

The algorithm works because of the properties of divisibility. If a number $d$ divides both $a$ and $b$, then it must also divide their difference $a - b$. This means that the GCD of $a$ and $b$ is the same as the GCD of $b$ and $a \mod b$. By repeatedly applying this process, we eventually reduce one of the numbers to zero, at which point the other number is the GCD.

### Example of Euclid's Algorithm in action:

Let's find the GCD of 48 and 18 using Euclid's Algorithm:

1. Start with `gcd(48, 18)`.
2. Since 18 is not zero, we calculate `gcd(18, 48 % 18)`.
3. Calculate `48 % 18`, which gives us 12, so we now have `gcd(18, 12)`.
4. Since 12 is not zero, we calculate `gcd(12, 18 % 12)`.
5. Calculate `18 % 12`, which gives us 6, so we now have `gcd(12, 6)`.
6. Since 6 is not zero, we calculate `gcd(6, 12 % 6)`.
7. Calculate `12 % 6`, which gives us 0, so we now have `gcd(6, 0)`.
8. Since 0 is zero, we return 6 as the GCD.
9. Thus, `gcd(48, 18) = 6`.

### Conclusion

The GCD of two numbers can be efficiently calculated using Euclid's Algorithm, which is based on the principle of divisibility. This algorithm reduces the problem step by step until it reaches a base case, making it a powerful tool for finding the greatest common divisor of any two integers.

```cpp
#include <iostream>
using namespace std;

int gcd(int a, int b) {
  if (b == 0)
    return a;
  return gcd(b, a % b);
}

int main() {
  int x = 48, y = 18;
  cout << "GCD of " << x << " and " << y << " is " << gcd(x, y) << endl;
  return 0;
}
```

This code will output:

```
GCD of 48 and 18 is 6
```

This implementation of Euclid's Algorithm efficiently computes the GCD of two integers, demonstrating the power of recursion and the properties of divisibility.
