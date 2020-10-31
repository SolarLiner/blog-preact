---
title: Object-oriented Rust
subtile: An experiment with procedural macros
author: Nathan Graule
date: 2020-10-31
tags:
  - Rust
  - OO
  - Object-Oriented
  - proc-macro
  - Procedural Macro
series:
  part: 1
---
# Introduction

As you may know, Rust is not *really* an object-oriented language, at least not
in the same way most languages that boast the name look like, anyway. Rust
definitely has objects, but a big part of what I'll call "practical OO"
implementations has to do with extending and overriding behavior, using
paradigms like superclasses and subclasses, method overriding, etc. Your
traditional C# class might inherit from a superclass that defines a more
general behavior and extends functionality by overriding the superclass's
behavior. The canonical example of object-oriented languages is a "Person >
Employee > Employer" data hierarchy:

```csharp
namespace OOExample
{
    public class Person
    {
	public string FirstName { get; set; }
	public string? MiddleName { get; set; }
	public string LastName { get; set; }

	public override string ToString()
	{
	    return MiddleName != null ? $"{FirstName} {MiddleName[0]}. {LastName}" : $"{FirstName} {LastName}";
	}
    }

    public class Employee : Person
    {
	public string Company { get; set; }
	public decimal Salary { get; set; }

	public override string ToString()
	{
	    var name = base.ToString();
	    return $"{name} @ {Company} for ${Salary}";
	}
    }

    public class Employer : Employee
    {
	public string Department { get; set; }

	public override string ToString()
	{
	    var name = base.ToString();
	    return $"At {Department}: {name}";
	}
    }
}
```

Several things are going on here. First, you see through the various
implementations of `ToString` that we are replacing behavior for something that
includes the superclass's definition and adding to it. This shows that in
subclasses, the superclass's function is still available, though it is scoped
by the `base` keyword. But this also means that in the subclass, the
superclass's fields are also available.

Let's use those `ToString` functions in the following snippets of code:

```csharp
var person = new Person {FirstName = "Nathan", LastName = "Graule"};
var employee = new Employee {FirstName = "John", LastName = "Doe", Company = "ACME, Inc.", Salary = 150000};
var employer = new Employer
{
    FirstName = "Jane", MiddleName = "Cavendish", LastName = "Peterson", Department = "Finances",
	      Company = "ACME, Inc.", Salary = 350000
};

Console.WriteLine(person); // Console.WriteLine calls ToString on the object to show it to the console
Console.WriteLine(employee);
Console.WriteLine(employer);

// The employer changes her first name
employer.FirstName = "Emily";
Console.Write("-----\nPost name-change: ");
Console.WriteLine(employer);
```

And this is the result:

```
Nathan Graule
John Doe @ ACME, Inc. for $150000
At Finances: Jane C. Peterson @ ACME, Inc. for $350000
-----
Post name-change: At Finances: Emily C. Peterson @ ACME, Inc. for $350000
```

This behavior is really the foundation of the object-oriented abstractions of
every "practical OO" languages available. Here we discuss a way to bring that
back into Rust.

# Inheritance in C++

Having no idea where to start, I took inspiration with how C++ handled its
inheritance implementation, given that it had to stay compatible with C (at
least with its first version \[link missing]), and its structs. Long story
short, the main concept is to embed the superclass into the subclass, so that
all methods that reference the superclass's fields still work within the
subclass. New fields are then appended after the superclass structure.

The matter is much more complicated with overrides to the superclass's methods,
as behavior is dependent on how the superclass method was declared in the first
place, and what type the instance is declared as (either the subclass or the
superclass). It's a rather subtle part of C++ and not having much actual
experience with the language I won't explain further; also we don't even need
to concern ourselves with that in our implementations of Rust inheritance.

# Inheritance in Rust

As with the C++ implementation, my implementation for Rust simply embeds the
superclass structure into the subclass. This is done by creating a `parent`
field in the subtype and assigning it the type of the superclass. Though in
Rust, internal representation of non `repr(C)` structures are not standardized,
it is how it's done currently by the compiler, and it doesn't matter anyway
because we rely on stable, public APIs to implement inheritance instead of
hacking at the compiler.

This `parent` attribute holds all data and methods of the supertype, so how do
we make them available to the subtype ? The answer is the `Deref` trait.
`Deref` is tied to the `&` operator; in other words, the expressions `&x` and
`x.deref()` are equivalent. Moreover, this works for any method on
`Deref::Target` that references `Self`; that is,
`x.deref().method_referencing_self()` is equivalent to
`x.method_referencing_self()`. This is used by smart pointer types like `Box`
or `Rc` to make the inner type more readily accessible when wrapped by those.
And since attribute access is a "method" that references `self`, it follows
that fields of the target type are available as well. The Rust compiler will
also traverse a chain of `Deref` all the way to the correct type,
automatically, allowing multiple wrappers to be used on a value while still
being able to call the value's methods directly ([Read more on
`Deref`](https://doc.rust-lang.org/std/ops/trait.Deref.html)).

What happens with a method name collision ? What if we have `Supertype::foo`
and `Subtype::foo` ? The reference entry on [method call
expressions](https://doc.rust-lang.org/reference/expressions/method-call-expr.html)
tells us that first the methods implemented on the type directly are resolved,
then those implemented for its immutable reference, then for its mutable
reference. If no methods are found then all traits implemented by the type and
its (imm)mutable references are searched, in that order (note that for various
reasons, it is impossible to implement a method directly on the type that has
the same name as a method implemented from a trait). At the end, an [unsized
coercion](https://doc.rust-lang.org/reference/type-coercions.html#unsized-coercions)
is made as a last attempt to find the last possibly remaining candidate
methods. This means that Rust will first look for methods implemented on the
subtype before moving on to `Deref` and trying the methods available to its
target type. In effect, this means Rust has given us a way to override methods,
for free !

This, however, comes with caveats. If a method on the subtype "shadows" the
subtype method, then that method will only be accessible with [Universal
Function Call Syntax](https://doc.rust-lang.org/1.7.0/book/ufcs.html), and only
for methods that reference `self`, not those who need it by value (this means
no `Supertype::into(subtype_value)`, for example). Instead, the access to the
parent structure must first be made, before calling the method on it.
Furthermore, traits implemented by the supertype will only be carried into the
subtype for references (using coercion  as given by `Deref`). The subtype would
need to re-implement traits that call by value by manually delegating the work
to the supertype. And lastly, as written in the section about C++ inheritance,
no runtime selection of which method to call is done. In Rust, types are erased
during compilation which means there is no way of knowing which variable has
which type; therefore only at compilation can this information be known. This
means that the method called with always be that of its type or any method
higher up the `Deref` chain. If a function accepts a value of type
`&Supertype`, then passing a `&Subtype` will still call the method of the
supertype instead. In Rust, there is no concept of `virtual` methods as in C++.

All in all, what does this approach give us ?

* Access to supertype's methods and fields directly from the subtype
* Simple overriding of methods

It should be noted the following downsides of this approach:

* Possible boilerplate re-implementing all useful traits we need carried from
  the supertype
* Inheritance only works on structs with named fields, and not on enums or
  unions, or even tuple structs
* We're reserving a field name for the supertype instance in the subtype,
  restricting the set of valid subtypes possibles (only an inconvenience, but
  should still be noted).
* Generic types are not supported by the tokenizer.

That is not bad for this experiment. Let's get our hands dirty.

# Implementing the inheritance machinery

In order to make inheritance work in Rust, the following is needed:

* A `parent` attribute containing the supertype instance
* A `Deref` implementation to get access to the supertype's fields and methods
* An `extend` function which will take a supertype instance, every attribute in
  the subtype, and return a constructed instance of the subtype. This is to
  mirror the `super()` method available in constructors in OO langauges, and
  facilitate the construction of inherited types.

Written manually, this is what this would look like:

```rust
#[derive(Copy, Clone, Debug, Default, Eq, PartialEq)]
struct Superclass {
value: u32,
}

impl Superclass {
    pub fn increment(&mut self) {
	self.value += 1;
    }
}

#[derive(Copy, Clone, Debug, Default, Eq, PartialEq)]
struct Subclass {
parent: Superclass
	    other: bool
}

impl Deref for Subclass {
    type Target = Superclass;

    fn deref(&self) -> &Self::Target {
	&self.parent
    }
}

// Not talked about in this article, but `DerefMut`, as the name suggests,
// is the mutable equivalent of `Deref`.
impl DerefMut for Subclass {
    fn deref_mut(&mut self) -> &Self::Target {
	&mut self.parent
    }
}

impl Subclass {
    pub fn new(value: u32) -> Self {
	Self::extend(Superclass {value}, false)
    }

    pub fn decrement(&mut self) {
	self.value -= 1;
	self.other = true;
    }

    fn extend(parent: Superclass, other: bool) -> Self {
	Self {
	    parent,
		other,
	}
    }
}
```

This rather silly example hopefully concretely showcases the workings of the
implementation. But we can automate a lot of this by using one of Rust's more
powerful features, tying it all back to the reason I started experimenting with
this: **procedural macros**.

## Declarative inheritance and procedural macros

A procedural macro is a function that executes at compile time, and transforms
  the stream of tokens the compiler reads off the source file. This is a *very*
  powerful feature that allows authors to basically do anything they want with
  the source code (and is how `serde` derives implementations of
  (de)serialization).

Several types of procedural macros exist: function macros, attribute macros and
derive macros. The function type macros is the most similar to the ones defined
using `macro_rules!`, as it can be called "like a function", hence its name.
Attribute macros attach themselves to other items in the source code using the
`#[]` syntax, used for example with derives or to specify conditional
compilation. The last type, the derive macro, accompany a trait that the macro
automatically derives, for instance the `Szeiralize` and `Deserialize` traits
and associated derive macros of the `serde` crate. It should be easy, using an
attribute macro, to automatically derive `Deref` and `DerefMut`
implementations, as well as generating the `extend` helper function.

This is where the `syn` and `quote` crates come in. They're respectively a Rust
parser and a Rust code generation crate, that are designed to work for
procedural macros. We'll use the first one to parse the struct definition and
get access to its pieces (like field declarations), and the second one to
specify a template that will turn our new syntax back into a token stream.

```rust
extern crate proc_macro;

use proc_macro::TokenStream;
use quote::{quote, ToTokens};
use syn::{parse_macro_input, Fields};

#[proc_macro_attribute]
pub fn inherit(attr: TokenStream, item: TokenStream) -> TokenStream {
    // Use syn to parse the token stream into a struct definition (this will produce errors at
    // compile time if the attribute macro is used on something else).
    let syn::ItemStruct {
	attrs,
	    ident,
	    fields,
	    generics,
	    vis,
	    ..
    } = parse_macro_input!(item);
    // Extract some more information to aid in the code generation
    let fields = if let Fields::Named(f) = fields {
	f.named // Only extract named fields
    } else {
	// Panic on tuple structs, which aren't supported
	panic!("Only named structs can be subclassed");
    }
    // Get the identifiers out of the fields
    let field_idents = fields.iter().filter_map(|f| f.ident.as_ref()).collect::<Vec<_>>();
    // Get the subclass out of the attribute argument (`Subclass` in `#[inherit(Subclass)]`)
    let subclass = parse_macro_input!(attr as syn::Ident);

    // Perform code generation by specifying a template where `#value` will be replaced by
    // the content of `value`:
    (quote! {
#(#attrs)*
#vis struct #ident #generics {
parent: #subclass,
#fields,
}

impl ::std::ops::Deref for #ident {
type Target = #subclass;

fn deref(&self) -> &Self::Target {
&self.parent
}
}

impl ::std::ops::DerefMut for #ident {
fn deref_mut(&mut self) -> &mut Self::Target {
&mut self.parent
}
}

impl ::std::borrow::Borrow<#subclass> for #ident {
    fn borrow(&self) -> &#subclass {
	&self.parent
    }
}

impl ::std::borrow::BorrowMut<#subclass> for #ident {
    fn borrow_mut(&mut self) -> &mut #subclass {
	&mut self.parent
    }
}

impl ::std::convert::AsRef<#subclass> for #ident {
    fn as_ref(&self) -> &#subclass {
	&self.parent
    }
}

impl ::std::convert::AsMut<#subclass> for #ident {
    fn as_mut(&mut self) -> &mut #subclass {
	&mut self.parent
    }
}

impl ::std::convert::From<#ident> for #subclass {
    fn from(v: #ident) -> Self {
	v.parent
    }
}

impl #ident {
    fn extend(parent: #subclass, #fields) -> Self {
	Self {
	    parent,
#(#field_idents),*
	}
    }
}
})
.into()
    }
```

Not so hard ! `quote` especially makes the job that much easier by providing a
way to write Rust code directly into a macro that will produce the equivalent
token stream.

Most of the content of the macro is taken by this template specification. I've
added a bunch of helpful derived traits as well, like `Borrow`/`BorrowMut` and
`AsRef`/`AsMut`. We can now write the following:

```rust
use inherit::inherit;

#[derive(Copy, Clone, Debug, Default, Eq, PartialEq)]
struct Superclass {
value: u32,
}

impl Superclass {
    pub fn increment(&mut self) {
	self.value += 1;
    }
}

#[inherit(Superclass)]
#[derive(Copy, Clone, Debug, Default, Eq, PartialEq)]
struct Subclass {
other: bool
}

impl Subclass {
    pub fn new(value: u32) -> Self {
	Self::extend(Superclass {value}, false)
    }
}

impl Subclass {
    pub fn decrement(&mut self) {
	self.value -= 1;
	self.other = true;
    }
}
```

And Rust will expand it to this:

```rust
#![feature(prelude_import)]
#[prelude_import]
use std::prelude::v1::*;
#[macro_use]
extern crate std;
use inherit::inherit;
struct Superclass {
value: u32,
}
impl Superclass {
    pub fn increment(&mut self) {
	self.value += 1;
    }
}
struct Subclass {
parent: Superclass,
	    other: bool,
}

// ... Skipping all derived traits

impl ::std::ops::Deref for Subclass {
    type Target = Superclass;
    fn deref(&self) -> &Self::Target {
	&self.parent
    }
}
impl ::std::ops::DerefMut for Subclass {
    fn deref_mut(&mut self) -> &mut Self::Target {
	&mut self.parent
    }
}
impl ::std::borrow::Borrow<Superclass> for Subclass {
    fn borrow(&self) -> &Superclass {
	&self.parent
    }
}
impl ::std::borrow::BorrowMut<Superclass> for Subclass {
    fn borrow_mut(&mut self) -> &mut Superclass {
	&mut self.parent
    }
}
impl ::std::convert::AsRef<Superclass> for Subclass {
    fn as_ref(&self) -> &Superclass {
	&self.parent
    }
}
impl ::std::convert::AsMut<Superclass> for Subclass {
    fn as_mut(&mut self) -> &mut Superclass {
	&mut self.parent
    }
}
impl ::std::convert::From<Subclass> for Superclass {
    fn from(v: Subclass) -> Self {
	v.parent
    }
}
impl Subclass {
    fn extend(parent: Superclass, other: bool) -> Self {
	Self { parent, other }
    }
}
impl Subclass {
    pub fn new(value: u32) -> Self {
	Self::extend(Superclass { value }, false)
    }
}
impl Subclass {
    pub fn decrement(&mut self) {
	self.value -= 1;
	self.other = true;
    }
}
```

Pretty neat ! With this we can now create type hierarchies and all the
~~hair-pulling~~ exciting things about object-oriented programming !

# Conclusion

In case that wasn't obvious, *don't* try this at home. Not only OO paradigms
are 100% replaceable by more functional ones, but this implementation is too
restrictive to see any kind of general use. This may be useful only in the case
where you need to specialize objects while retaining a common behavior to pass
to functions. And even then, traits do this very thing in a safer manner.

As an experiment, though, it is fun to think about and actually implement. And
that is to say nothing of how actually fun it was to implement the attribute
macro in the end. Such a thing would normally be met with resentment at trying
to bend the inner workings of the compiler to your will; but in the case of
Rust, the API was well designed and the implementation easier as a result.
Macros *can* feel this good !