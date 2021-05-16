## The Problem

The problem is stated as follows:

> If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5,
> 6 and 9. The sum of these multiples is 23. Find the sum of all the multiples of 3 or 5
> below $n=1000$.

## My Solution

The obvious way to tackle this problem would be to simply loop
through all numbers from 1 to 1000, check if the number is a multiple of 3 or 5, and, if so, add it
to a running total. But what fun would that be? Plus, that solution would slow down
as $n$ increases. In fact, it has $O(n)$ time complexity. I think we can do better.

Instead of looping through every number, we can do a bit of math to figure out an explicit
formula for the solution. And, of course, an explicit formula always has $O(1)$ time complexity,
which is a major improvement!

We ultimately want the sum of multiples of 3 or 5, but to make it simple let's just do multiples
of 3 first. We can incorporate multiples of 5 later. The first thing to notice is that all
multiples of 3 below $n$ are exactly $3, 3(2), 3(3), ..., 3(a)$ where $a$ is the largest integer
such that $3a \lt n$. The sum of these is $3\sum_{k=1}^a{k}$. Similarly, the sum of all multiples
of 5 less than $n$ is $5\sum_{k=1}^b{k}$ where $b$ is the largest integer such that $5b \lt n$.

As it turns out, there is a well-known formula for the sum $\sum_{k=1}^a{k}$, and it can be
verified quite easily by induction.

<div style="padding: 1em; border: 1px solid black; margin: 1rem 0;">

**Theorem** $\sum_{k=1}^n{k} = \frac{n(n+1)}{2}$ for all $n \geq 1$.

_Proof._
The equation clearly holds when $n=1$ and $n=2$. Now suppose the equation holds
when $n = m \geq 2$. Then

  <div style="text-align: center">

$$\sum_{k=1}^{m+1}{k} = \sum_{k=1}^m{k} + m + 1 = \frac{m(m+1)}{2} + \frac{2(m + 1)}{2} = \frac{(m+1)(m+2)}{2}$$

  </div>

Thus the equation holds for $n = m + 1$, so by the principle of induction it holds
for all $n \geq 1$.

</div>

Admittedly, I pulled the formula $\frac{n(n+1)}{2}$ out of thin air, and you might be wondering
where that comes from. It's easy to verify that it's the correct formula, but figuring out
what the formula is in the first place isn't as simple. There's a pretty neat way to figure it
out using discrete calculus, and I'd like to cover that in a future post. For now, let's just
go with it.

Okay, so now we have a formula to calculate the sum of all multiples of 3 less than $n$ and
the sum of all multiples of 5 less than $n$. All that's left now is to combine the two. It's
tempting to just add

<div style="text-align: center">

$$ \frac{3a(a+1)}{2} + \frac{5b(b+1)}{2} $$

</div>

but that wouldn't be correct because we're counting the common multiples of 3 and 5 twice!

<div style="text-align: center">

3 + 6 + 9 + 12 + <span style="color: red">15</span> + ...

</div>

<div style="text-align: center">

5 + 10 + <span style="color: red">15</span> + 20 + 25 + ...

</div>

We need to subtract the sum of all common multiples of 3 and 5. How do we find all the
multiples of 3 and 5? Well, the first one is 15. The next one is 30. After that, 45.
It seems like a multiple of 3 and 5 is also a multiple of $15 = \text{lcm}(3,5)$.
The following theorem proves this fact.

<div style="padding: 1em; border: 1px solid black; margin: 1rem 0;">

**Theorem** Let $a, b, c \in \mathbb{Z}$. Then $b \mid a$ and $c \mid a$ if and only if
$\text{lcm}(b, c) \mid a$. In other words, an integer is a multiple $b$ and $c$ if
and only if it is a multiple of $\text{lcm}(b,c)$.

_Proof._
Set $n = \text{lcm}(b, c)$, and suppose $b \mid a$ and $c \mid a$. By the
division algorithm, $a = pn + r$ for some $p,r \in \mathbb{Z}$, where $0 \leq r < n$.
Thus, since $b \mid a$ and $b \mid n$, we have $b \mid r$. By the same reasoning, we
also have $c \mid r$. Since $r$ is a common multiple of $b$ and $c$ and $r < n$,
$r$ must be $0$. Thus $a = pn$, that is, $n \mid a$.
Conversely, let $k, j \in \mathbb{Z}$ such that $n = kb$ and $n = jc$. Then if
$n \mid a$, we have, for some $m \in \mathbb{Z}$, $a = mn = (mk)b = (mj)c$, and thus
$c \mid a$ and $b \mid a$.

</div>

Now we can combine these two theorems to show that the sum of all multiples of 3 and 5
is $15\sum_{k=1}^c{k}$ where $c$ is the largest integer such that $15c \lt n$. Now we have
our answer! The sum of all multiples of 3 or 5 less than $n$ is

<div style="text-align: center">

$$ \frac{3a(a+1)}{2} + \frac{5b(b+1)}{2} - \frac{15c(c+1)}{2} $$

</div>

Plugging in $n=1000$, we have $a=333$, $b=199$ and $c=66$, and we have

<div style="text-align: center">

$$ \frac{3(333)(333+1)}{2} + \frac{5(199)(199+1)}{2} - \frac{15(66)(66+1)}{2} = 233168$$

</div>

The following code implements our solution for an arbitrary input $n$. Note that it has
time complexity $O(1)$!

```python
import math

n_minus_1 = int(input("n=")) - 1

a = math.floor(n_minus_1/3)
b = math.floor(n_minus_1/15)
c = math.floor(n_minus_1/15)

solution = int((3*a*(a+1) + 5*b*(b+1) - 15*c*(c+1))/2)

print("Solution:", solution)
```

    Solution: 233168
