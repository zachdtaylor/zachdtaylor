One of the main reasons I, and many others, love React is that it allows us to organize markup into reusable pieces.

Custom React hooks allow us to do the same thing with application state.

I think the name custom hooks can make them seem more complicated than they actually are. A custom hook is just a function that happens to call some special functions in the React library.

Because they are just functions, they can do all the things functions can do. They are reusable, and they can help you maintain separation of concerns in your application, resulting in clean, maintainable, easy-to-read code.

Let's look at an example.

## An Example

React applications typically need to do some asynchronous tasks. Say we need to generate a PDF and render it in an `iframe`. The process of generating a PDF can take a few seconds, so we'll probably want to start the process, then show some loading indicator while it's running, then display either the PDF or an error message once it's finished. A first attempt might look something like this:

```jsx
const generatePDF = (contents) => {
  // Generate PDF
  ...
  // Returns a promise
}

const PDF = ({ pdfContents }) => {
  const [{ status, data, error }, setState] = React.useReducer(
    (prevState, newState) => ({ ...prevState, ...newState }),
    { status: 'idle', data: null, error: null }
  )

  React.useEffect(() => {
    setState({ status: 'pending' })
    generatePDF(pdfContents).then(
      (data) => setState({ data, status: 'resolved' }),
      (error) => setState({ error, status: 'rejected' })
    )
  }, [pdfContents])

  if (status === 'pending') {
    return <Spinner />
  }

  if (status === 'rejected') {
    return <Error message={error} />
  }

  return <iframe title="PDF" src={pdf} />
}
```

A React component's primary responsibility is to return some markup for React to render, but in this example, we have to scroll past _over half_ of the function body before we get to that point. It feels like the component is doing too much. It's also not immediately clear what the calls to `useReducer` and `useEffect` are for.

When a function gets too long and confusing, a good thing to do is to split it up into several shorter, more focused functions. We will likely have more asynchronous tasks to perform in other components, so let's first extract the logic for handling loading, error, and success states to its own function. (The following was inspired by [this](https://github.com/kentcdodds/bookshelf/blob/main/src/utils/hooks.js).)

```javascript
import React from 'react'

const useAsync = () => {
  const [{ status, data, error }, setState] = React.useReducer(
    (prevState, newState) => ({ ...prevState, ...newState }),
    { status: 'idle', data: null, error: null }
  )

  const run = React.useCallback((promise) => {
    if (!promise || !promise.then) {
      throw new Error(
        `The argument passed to useAsync().run must be a promise.`
      )
    }
    setState({ status: 'pending' })
    return promise.then(
      (data) => setState({ data, status: 'resolved' })
      (error) => setState({ error, status: 'rejected' })
    )
  }, [])

  return {
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isError: status === 'rejected',
    isSuccess: status === 'resolved',
    run,
    data,
    error,
  }
}
```

This is a custom hook. Again, I want to point out that it is just a function. It just happens to be called a custom hook in React land because 1) its name starts with `use` and 2) it calls functions in the React library whose names start with `use`.

Now we can change the PDF component to this:

```jsx
const generatePDF = (contents) => {
  // Generate PDF
  ...
  // Returns a promise
}

const PDF = ({ pdfContents }) => {
  const { data: pdf, isLoading, error, isError, run } = useAsync()
  React.useEffect(() => {
    run(generatePDF(pdfContents))
  }, [run, pdfContents])

  if (isLoading) {
    return <Spinner />
  }

  if (isError) {
    return <Error message={error} />
  }

  return <iframe title="PDF" src={pdf} />
}
```

This is a lot better, but it still kind of feels like the component is doing too much. Let's extract the `useAsync` and `useEffect` calls to another function.

```jsx
const generatePDF = (contents) => {
  // Generate PDF
  ...
  // Returns a promise
}

const usePDF = (pdfContents) => {
  const { data: pdf, isLoading, error, isError, run } = useAsync()
  React.useEffect(() => {
    run(generatePDF(pdfContents))
  }, [run, pdfContents])
  return { pdf, isLoading, isError, error }
}

const PDF = ({ pdfContents }) => {
  const { pdf, isLoading, isError, error } = usePDF(pdfContents)

  if (isLoading) {
    return <Spinner />
  }

  if (isError) {
    return <Error message={error} />
  }

  return <iframe title="PDF" src={pdf} />
}
```

The `PDF` component looks _so_ much better. All the work of generating the PDF and handling the loading, error, and success states has been reduced to one line, so the component can focus on rendering markup.

It's now very clear what the `PDF` component does: it generates a PDF with the provided props, and returns either a `Spinner`, `Error`, or the pdf in an `iframe`. No more trying to decipher the ambiguous calls to `useReducer` and `useEffect`.

### This is nothing new

If you ignore the fact that we're working in a React application, the previous example should feel very familiar to you. Again, all we're doing is taking one big function and splitting it up into smaller functions that each have a single responsibility.

There's nothing new here, which is what makes custom hooks so powerful. It's just one function (the component) calling another function (`usePDF`) calling more functions (`useAsync` and `useEffect`). React only requires that you follow [two rules](https://reactjs.org/docs/hooks-rules.html) when calling custom hooks, but besides that, all of your intuition about functions can immediately be applied.

## Better Dev Tools

Besides just making your code a lot more maintainable, custom hooks make your application easier to debug by improving what you see in the react dev tools.

Let's take a simple example. Say you were building a user registration form. How would you hold the form state? I see a lot of code that looks like this:

```jsx
import React from "react"

const RegisterForm = ({ onSubmit }) => {
  const [username, setUsername] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  return (
    <form>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      ...
    </form>
  )
}
```

This works fine, but when you open up the React dev tools in your browser, you'll see this:

![Screen Shot 2021-01-21 at 10.34.53 PM](https://dev-to-uploads.s3.amazonaws.com/i/3a5pfepqia4bo9nc5ch4.png)

This isn't very helpful. It's not clear at all that these pieces of state belong to the form.

To make this a bit clearer, we can extract all these `useState` calls to another function. Better yet, we can also replace all the `useState` calls with one `useReducer` call.

```jsx
import React from "react"

const useRegisterForm = () => {
  return React.useReducer(
    (prevState, newState) => ({ ...prevState, ...newState }),
    {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
    }
  )
}

const RegisterForm = ({ onSubmit }) => {
  const [registerForm, setRegisterForm] = useRegisterForm()

  return (
    <form>
      <input
        value={registerForm.username}
        onChange={(e) => setRegisterForm({ username: e.target.value })}
      />
      ...
    </form>
  )
}
```

Now the dev tools are much clearer:

![Screen Shot 2021-01-21 at 10.36.40 PM](https://dev-to-uploads.s3.amazonaws.com/i/9jbx66x4u55dlui4218j.png)

Notice that all of the state in the `useRegisterForm` hook is shown under `RegisterForm`. This will happen with every custom hook; a hook named `useCustomHook` will show up as `CustomHook` in the dev tools.

## How much?

Custom hooks are awesome, but how often should you extract your state to custom hooks?

Honestly, I think you should move state to custom hooks more often than not. As we've discussed, they allow you keep related pieces of state together which improves the readability of your components. And with the added benefits of being reusable and improved dev tools, it's hard to justify not using them all the time.

## Conclusion

It took me a while to figure out how helpful custom hooks are, but once I did, I never looked back. I use them all the time now and my code is much better for it. If you haven't been using custom hooks in your applications, I highly recommend you start.
