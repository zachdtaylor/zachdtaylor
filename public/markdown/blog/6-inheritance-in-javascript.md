As someone who learned to code in C++, JavaScript was confusing to me when I first started learning it. One of the main reasons for my confusion was that the object-oriented concepts I was used to were seemingly nowhere to be found. Sure, you could create objects in JavaScript, but to me, they seemed more like a `map` in C++ or a `dict` in Python.

I certainly didn't understand how inheritance could work, and for a while, I just assumed that inheritance wasn't possible in JavaScript. Turns out, inheritance is possible in JavaScript, but it is done through the use of prototype objects.

## Prototype Objects

The [Mozilla docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) explain prototype objects like this:

> When it comes to inheritance, JavaScript only has one construct: objects. Each object has a private property which holds a link to another object called its **prototype**. That prototype object has a prototype of its own, and so on until an object is reached with `null` as its prototype. By definition, null has no prototype, and acts as the final link in this prototype chain.

So, in JavaScript, there is no such thing as a `class` in the traditional sense. There are only objects. Each object has an attribute called a prototype that you can access via `obj.__proto__`. When you try to access an attribute on an object instance, JavaScript will first check the attributes of that object. If the attribute is not found there, it will check the object's prototype, then the prototype's prototype, and so on, until it finds the attribute or reaches the end of the prototype chain.

## An Example

To define an object type in an object-oriented language like Java or Python, you would create a class and give it a special method called a constructor. For example, to define a `Product` object type in Java, you could write

```java
public class Product {
  double price;

  public Product(double price) {
    this.price = price;
  }
}
```

To define an object type in JavaScript, you only create the constructor. For example, we could create a `Product` constructor like this.

```javascript
function Product(price) {
  this.price = price
}
```

To create a new object using the `Product` constructor, you would do

```javascript
let product = new Product(10)
```

When you call `new` in this line, the variable `product` gets injected as `this` in the `Product` constructor. Therefore, if you log the output of `product.price` you should get `10`.

Now what if we wanted to add a method to all instances of `Product`? In Java, we would add a method to the class, like this.

```java
public class Product {
  double price;

  public Product(double price) {
    this.price = price;
  }

  public String sayPrice() {
    return "I cost $" + String.valueOf(this.price);
  }
}
```

In JavaScript, we add the method as an attribute on `Product`'s `prototype`.

```javascript
Product.prototype.sayPrice = function () {
  return `I cost $${this.price}`
}
```

We could now call `sayPrice` on the `product` instance.

```javascript
product.sayPrice()
// Output: I cost $10
```

If you log `Product.prototype` and `product.__proto__` you will notice that they are the same object. When JavaScript sees that `sayPrice` is not an attribute of `product`, it checks its `__proto__` and finds the `sayPrice` method there.

## Inheritance

Now suppose we wanted to define a `Book` object type that inherits from `Product`. In Java, we would extend the base class.

```java
public class Book extends Product {
  int pages;

  public Book(int pages, double price) {
    super(price);
    this.pages = pages;
  }
}
```

In JavaScript, we would create a `Book` constructor, inside of which we call the `Product` constructor, passing `this` as the context.

```javascript
function Book(pages, price) {
  Product.call(this, price)
  this.pages = pages
}
```

Now if we create a book with

```javascript
let book = new Book(154, 10)
```

we will get an object that has both the `price` and `pages` attributes. However, if we try to call

```javascript
book.sayPrice()
```

we will get a `TypeError: book.sayPrice is not a function`. This is because we haven't updated `Book`'s `prototype` object. To fix this, we can do

```javascript
Book.prototype = Object.create(Product.prototype)
```

This sets `Book`'s `prototype` to an empty object whose prototype is `Product.prototype`. In other words,

```javascript
Book.prototype.__proto__ === Product.prototype
// Output: true
```

We can now run

```javascript
let book = new Book(154, 10)
book.sayPrice()
// Output: I cost 10
```

and JavaScript will find `sayPrice` on `book.__proto__.__proto__`.

There is one other thing I should mention. By default, every constructor's `prototype` is an object with one attribute, `constructor`, which is a reference to the constructor itself. You can check this by running

```javascript
Product.prototype.constructor === Product
// Output: true
```

When we set `Book.prototype = Object.create(Product.prototype)`, we overwrote `Book`'s default `prototype`, so `book.constructor === Product`, which isn't correct. We can fix this by either adding the `constructor` property afterwards

```javascript
Book.prototype = Object.create(Product.prototype)
Object.defineProperty(Book.prototype, "constructor", {
  value: Book,
  enumerable: false,
  writable: true,
})
```

or by replacing the `Object.create` line with `Object.assign`

```javascript
Book.prototype = Object.assign(Book.prototype, Product.prototype)
```

Now `Book.prototype.constructor === Book` should be true.

## What About JavaScript's `class` Keyword?

JavaScript does have a `class` keyword, but it's just syntactic sugar for what we did above. It allows you to create the constructor and set methods on the `prototype` all in one block. For example, we could create an equivalent `Product` type with

```javascript
class Product {
  constructor(price) {
    this.price = price
  }
  sayPrice() {
    return `I cost $${this.price}`
  }
}
```

If you log `Product.prototype`, you'll see that it is an object with both `constructor` and `sayPrice` properties, just like we had before. We can also create the `Book` sub type with

```javascript
class Book extends Product {
  constructor(pages, price) {
    super(price)
    this.pages = pages
  }
}
```

Defining `Book` this way will automatically set `Book.prototype` and ensure that `book.constructor` is correct.

## Conclusion

Objects in JavaScript are a bit confusing at first since they are quite different than in most other languages. I encourage you to open the dev tools in your browser and play around with these examples to get a feel for them. I hope this helps you understand JavaScript a little better!
