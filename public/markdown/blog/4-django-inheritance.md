## The Problem

I currently work for a company that sells medical devices. Several months ago, I was tasked with building a system using Django that would allow our sales reps to easily search through our products and build a quote to send off to a customer. Some of the requirements of the system are:

1. We have several product types. There are some attributes that are common to all types, and some that are unique to a specific type.
2. We need to be able to search across all product types at once.
3. A rep can have multiple quotes, and each quote has one or more products. The products could be of any type.
4. Each product type should have its own section in Django's admin site so the corresponding product manager can go in and manage the data.

At this point it was pretty clear to me that inheritance would play a big part in our data model. Inheritance nicely solves each of the requirements:

1. We could have a base `Product` class that has attributes common to all types, then each product type could be a subclass that adds its own, unique, attributes.
2. Searching across all product types would be as simple as searching through anything that is a `Product`
3. A quote can store a list of `Product` objects and remain ignorant of the product type
4. We can register each subclass of `Product` to Django's admin site individually

The thing that was still unclear to me was how inheritance should be translated to the database. Django only works with relational databases, and I had never tried modeling inheritance in a relational database before. After doing some research, I came across two main ways of modeling inheritance in a relational database. I want to discuss each method, which one we chose and why, and some thoughts about our decision in hindsight.

## Multi-Table Inheritance

Multi-table inheritance is where the superclass, as well as each subclass, map to their own database tables. The shared fields are stored on the superclass table and the type-specific fields are stored on their respective tables. Each subclass table then has an extra column that contains the id of the corresponding row in the parent class table. In Django, the model classes might look something like this

```python
from django.db import models

class Product(models.Model):
  part_number = models.CharField(max_length=25)
  price = models.CharField(max_length=25)

class Label(Product):
  dimensions = models.CharField(max_length=25)

class FaceMask(Product):
  COLOR_CHOICES = [
      ('Blue', 'Blue'),
      ('White', 'White')
  ]
  color = models.CharField(max_length=25, choices=COLOR_CHOICES)
```

and the tables would look like this

![jpg](/images/blog/4-django-inheritance/multi-inheritance.jpg)

Great. Now we can add each product type to the admin where they can be edited individually. We can also add generic products to a `Quote` like this

```python
class Quote(models.Model):
  name = models.CharField(max_length=25)
  products = models.ManyToManyField(Product)
```

## Single-Table Inheritance

As the name might imply, single-table inheritance uses only one table to store the attributes of the superclass as well as all subclasses. Instead of differentiating the subclass types by table, a `type` column is used to know what type of object that particular row corresponds to. In Django that would look like this:

```python
class Product(models.Model):
  # Type field
  TYPE_CHOICES = [
    ('Label', 'Label'),
    ('Face Mask', 'Face Mask')
  ]
  product_type = models.CharField(max_length=25, choices=TYPE_CHOICES)

  # Common Fields
  part_number = models.CharField(max_length=25)
  price = models.CharField(max_length=25)

  # Label fields
  label_dimensions = models.CharField(max_length=25)

  # Face Mask fields
  COLOR_CHOICES = [
      ('Blue', 'Blue'),
      ('White', 'White')
  ]
  face_mask_color = models.CharField(max_length=25, choices=COLOR_CHOICES)
```

and the table would look like this

![jpg](/images/blog/4-django-inheritance/single-inheritance.jpg)

I was initially unsatisfied with this way of doing inheritance because it was unclear to me how we could show each type individually in the admin. That was until I came across Django's proxy models and `Manager` classes. With proxy models, we can achieve the same effect as multi-table inheritance while still storing everything in one table.

```python
class LabelManager(models.Manager):
  def get_queryset(self):
    return super().get_queryset().filter(product_type='Label')

class Label(Product):
  objects = LabelManager()

  class Meta:
    proxy = True

class FaceMaskManager(models.Manager):
  def get_queryset(self):
    return super().get_queryset().filter(product_type='Face Mask')

class FaceMask(Product):
  objects = FaceMaskManager()

  class Meta:
    proxy = True
```

Django's `Manager` class basically allows you to apply a default filter when querying objects. Using the above code, we could do `Label.objects.all()` to get all `Label` objects, for example. The `proxy = True` meta option tells Django to not create a separate table for `Label` or `FaceMask` objects. We can register proxy models to the admin, we just need to make sure we tell the admin to only display the relevant fields.

```python
@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
  fields = ('part_number', 'price', 'dimensions')

@admin.register(FaceMask)
class FaceMaskAdmin(admin.ModelAdmin):
  fields = ('part_number', 'price', 'color')
```

## What We Chose

The biggest benefit of single table inheritance is that you only have to run one query on one table to get the information you need. Multi-table inheritance necessitates joining the superclass and subclass tables. We knew we would be doing a lot of product queries and we were concerned about all the `JOIN` operations slowing down our application. Also, we were originally planning on storing only a couple product types so we didn't expect that the product table would get very large. We chose single-table inheritance to model our product data for these reasons.

However, I'm starting to think that multi-table inheritance might have been the better choice. With changing requirements for the application, we have needed to store several more product types. The product table has become bloated with blank entries since there are not many attributes in common between our product types. It makes the product table confusing and difficult to manage, and I think it would have been worth the trade-off of slower queries. Thankfully, single-table inheritance works just fine, and as I mentioned, we do get performance benefits out of it.

## Conclusion

I suppose the lesson learned here is that if your subclasses don't have many fields in common, multi-table inheritance is the way to go. It is much more efficient memory-wise as you don't risk bloating the database with lots of blank entries. Single-table inheritance will always be more efficient query-wise, though, since no `JOIN` operations are necessary. As with most things, there is a trade-off and the right choice depends on your use case.
