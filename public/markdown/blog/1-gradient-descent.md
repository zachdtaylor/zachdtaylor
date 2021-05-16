```python
import numpy as np
from matplotlib import pyplot as plt, animation
from mpl_toolkits.mplot3d import Axes3D
import scipy.optimize as opt
import scipy.linalg as la
```

## An Idea

Gradient descent is an iterative optimization method which, given a function $f: \mathbb{R}^n \rightarrow \mathbb{R}$, finds a minimizer of $f$ by repeatedly taking steps in the direction of the negative gradient $-Df$ until some stopping criteria is met. It's important to recognize that the gradient is a function $Df: \mathbb{R}^n \rightarrow \mathbb{R}^n$ which takes as input a vector $\mathbf{x}$ and outputs another vector $Df(\mathbf{x})$. This output vector $Df(\mathbf{x})$ points in the direction of greatest increase of $f$ at $\mathbf{x}$. Thus, moving in the opposite direction ensures we move in the direction of greatest decrease.

With that general idea in mind, the actual gradient descent method is defined as follows. Given an initial starting point $x_0$, define a sequence $(\mathbf{x}_k)_{k=0}^{\infty}$ recursively as

$$\mathbf{x}_{k+1} = \mathbf{x}_k - \alpha_kDf(\mathbf{x}_k)$$

where $\alpha_k \in \mathbb{R}$ is called the step size. It can be shown that the sequence $(\mathbf{x}_k)_{k=0}^{\infty}$ converges for all initial guesses. A proof of convergence goes beyond my focus here, but the fact that it does converge is very important to the success of gradient descent. Otherwise, there would be no guarantee that gradient descent ever reaches a minimizer, which would render it useless as a practical optimization method.

There are many ways one could choose the step size $\alpha_k$. One way is to define a new function $\phi_k : \mathbb{R} \rightarrow \mathbb{R}$ as

$$\phi_k(\alpha) = f(\mathbf{x}_k - \alpha Df(\mathbf{x}_k))$$

and minimize this at each step. The function $\phi_k$ is a one dimensional function that is the same as $f$ along the slice in the direction of the gradient.

A necessary condition for a point to minimize $f$ is that the gradient will output the zero vector with that point as input. If the gradient does not output zero, then the input is not a minimizer. Thus, in order to know when to stop the algorithm, we can check the norm of the gradient output and stop when it reaches 0. In practice, we actually only need to check that the gradient is very close to zero. It will likely never be exactly zero because of the way floating point numbers work.

## An Example

To help visualize gradient descent, let's do a simple example. Let $\mathbf{x} = [x_1, x_2]$ and let $f(\mathbf{x}) = x_1^2 + 7x_2^2 + 2x_1 + x_2 + 2$, so $Df(\mathbf{x}) = \begin{bmatrix}2x_1 + 2 & 14x_2 + 1 \end{bmatrix}$. Suppose we start gradient descent at the point $\mathbf{x}_0 = [0, 1]$. We have $f(\mathbf{x}_0) = 10$ and $Df(\mathbf{x}_0) = \begin{bmatrix}2 & 15\end{bmatrix}$. A 3d graph and contour plot of $f$ are shown below. The point $[\mathbf{x}_0, f(\mathbf{x}_0)] = [0, 1, 10]$ is the orange dot and the negative gradient vector $-Df(\mathbf{x}_0) = [-2, -15]$ is the black arrow.

```python
f = lambda x: x[0]**2 + 7*x[1]**2 + 2*x[0] + x[1] + 2
Df = lambda x: np.array([2*x[0] + 2, 14*x[1] + 1])

x, y = np.linspace(-1.2, 1.2, 1000), np.linspace(-1.2, 1.2, 1000)
X, Y = np.meshgrid(x, y)
Z = f([X, Y])
ax = plt.axes(projection='3d')
ax.plot_surface(X, Y, Z)
ax.plot([0],[1],[10], marker='.', ms=20)
ax.view_init(elev=20, azim=45)
ax.set_xlabel('x', size=15)
ax.set_ylabel('y', size=15)
plt.show()

plt.contour(X, Y, Z, levels=np.logspace(0, 1, 8))
plt.quiver([0], [1], [-2], [-15])
plt.plot(0, 1, marker='.', color='orange', ms=20)
plt.xlabel('x', size=15)
plt.ylabel('y', size=15)
plt.show()
```

![png](/images/blog/gradient-descent/output_2_0.png)

![png](/images/blog/gradient-descent/output_2_1.png)

In the contour plot, darker colors represent lower values. As you can see, the negative gradient vector is pointing in the direction of greatest decrease of $f$ at $\mathbf{x}_0$.

Now let's visualize the function $\phi$. At $\mathbf{x}_0$, we have $\phi(\alpha) = f(\mathbf{x}_0 - \alpha Df(\mathbf{x}_0)) = f([-2\alpha, 1 - 15\alpha])$. The function $\phi$ is a parameterization of the curve along $f$ in the direction of $-Df(\mathbf{x}_0)$. A value of $\alpha = 0$ represents the input $\mathbf{x_0}$ and as $\alpha$ increases, we move in the 1-d slice of $f$ along $-Df(\mathbf{x}_0)$. The next graph is a visualization of that slice.

```python
phi = lambda a: f([-2*a, 1-15*a])
a = np.linspace(-.01, 2/15, 100)
plt.plot(a, phi(a))
plt.plot(0, 10, '.', ms=15)
plt.xlabel(r'$\alpha$', size=15)
plt.show()
```

![png](/images/blog/gradient-descent/output_4_0.png)

## An Implementation

The code below implements the gradient descent algorithm.

```python
def gradient_descent(f, Df, x0, maxiter=100, tol=1e-5):
    """Compute the minimizer of f using the method of gradient descent.

    Parameters:
        f (function): The objective function. Accepts a NumPy array of shape
            (n,) and returns a float.
        Df (function): The first derivative of f. Accepts and returns a NumPy
            array of shape (n,).
        x0 ((n,) ndarray): The initial guess.
        maxiter (int): The maximum number of iterations to compute.
        tol (float): The stopping tolerance.

    Returns:
        ((n,) ndarray): The approximate minimizer of f.
        (float): The minimum value of f.
        (int): The number of iterations computed.
    """
    for k in range(1, maxiter+1):
        # Compute derivative and check stopping criterion
        dfx0 = Df(x0)
        if la.norm(dfx0, ord=np.inf) < tol:
            break

        # Define and optimize 1-D function in the direction of negative gradient
        phi = lambda a: f(x0 - a*dfx0)
        x0 = x0 - opt.minimize_scalar(phi).x*dfx0

    return x0, f(x0), k
```

Let's use this function to find a minimizer of $f$ from our example above.

```python
minimizer, value = gradient_descent(f, Df, np.array([0, 1]))[:2]
print("Minimizer: ", minimizer)
print("Minimum value: ", value)
```

    Minimizer:  [-0.99999701 -0.07142863]
    Minimum value:  0.964285714295

## Considerations

While minimizing $\phi$ at each stage of the algorithm works, it may not always be the best choice. One reason for this is that finding the minimizer of $\phi$ may take a significant amount of time. That time might be better used for computing the next iteration. Often a good, but not optimal, step size is sufficient to guarantee minimization. This can be difficult, though, because if the step size is too large, the method can overshoot and move to a higher point rather than descend.

The other reason is that the function might be narrow canyon near a minimum. In this case, gradient descent can oscillate between either side of the canyon and descend very slowly. A good example of this type of function is the rosenbrock function, defined as $f(x,y) = (1-x)^2 + 100(y - x^2)^2$. The global minimizer of the rosenbrock function is $(1,1)$. The contour plot below shows how steep and narrow this function is.

```python
x = np.linspace(-5, 5, 200)
X, Y = np.meshgrid(x, x)
Z = opt.rosen([X, Y])
fig, ax = plt.subplots()
cax = ax.contourf(X, Y, Z, 50)
fig.colorbar(cax)
plt.show()
```

![png](/images/blog/gradient-descent/output_10_0.png)

Gradient descent takes over 11,000 iterations to compute the minimizer starting at $(-2,-2)$, which is relatively close to the minimizer.

```python
gradient_descent(opt.rosen, opt.rosen_der, np.array([-2,-2]), maxiter=20000)
```

    (array([ 0.9999912 ,  0.99998234]), 7.775709809680371e-11, 11990)

## Use in Deep Learning

One of the most well-known uses of gradient descent is in deep learning. Deep learning refers to the use of "deep" neural networks for artificial intelligence. Neural networks can become quite complex, but when it comes down to it, a neural network is just a function. Specifically, it's function that is defined by a large set of parameters. When someone refers to a neural network "learning", what's really going on is the network is adjusting these parameters in order to produce more sensible output. One of the most common ways it can adjust these parameters is by treating them as inputs to another function called the loss function, then optimizing the loss function with gradient descent.
