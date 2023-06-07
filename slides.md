---
theme: default
class: text-center
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
title: Deno vs Node DX
layout: intro
background: /milky-way.jpeg
---

# <logos-deno /> Deno vs <logos-nodejs-icon/> Node.js

## DX Overview

A show-and-tell of a somewhat simple app

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---

# Table of contents

<Toc></Toc>

---
layout: center
---

<div class="max-w-65ch">

# Who am I?

https://twitch0125.github.io

My name is Kaleb Ercanbrack. I do JavaScript development, mostly frontend but
I've been learning a lot of Backend JS lately.

</div>

<!--
Here is another comment.
-->

---
layout: iframe-right
url: https://naba-dump.fly.dev
scale: 0.5
---

# App Overview

1. Have a form at `/upload`
   1. handle a .tar.gz file upload from this form
   2. use basic-auth
2. extract and save the files in the .tar.gz
3. serve the extracted files
4. Be able to host on a server for free (or close to free)


---
layout: two-cols
---

# The Deno App

## Uses Deno's [Fresh](https://fresh.deno.dev) framework

- Typescript
- Templates with JSX
- Interactive component "islands" with Preact
- File-based routing

```txt
routes/
 ┣ [...path].ts
 ┣ index.ts
 ┗ upload.tsx
```

<template #right>

<div class="text-center">
    <logos-deno class="text-10rem text-center" />
  </div>
</template>

---

# Serving static files

Deno made this easy. Here's the route that serves static files from the
`./extracted` directory

<div>
```txt {1,2}
routes/
 ┣ [...path].ts
 ┣ index.ts
 ┗ upload.tsx
```
</div>

```ts {4-20|1,2|all}
import { Handlers } from "$fresh/server.ts"; // `$fresh/` is defined in an import map
import { serveDir } from "file_server"; //Deno's std static file server

export const handler: Handlers = { 
  async GET(req) { 
    return await serveDir(req, { fsRoot: Deno.cwd() + "/extracted/news/html", quiet: true });
  }
};

````
<!--
the `Deno` object is a global helper/namespace for Deno apis separate from the std library.
-->

---

# TODO: HTML Rendering

---

# Web Streams are the default in Deno. They're nice.
Intuitive duck typing!
<v-clicks>

Like how a promise implements a `then()` method:

```js
const myPromise = {
  then: function(){}
}
```

A reader implements a `reader()` method

```js
const myReader = {
  reader: function() {}
}
```

A writer implements a `write()` method

```js
const myWriter = {
  write: function () {},
};
```
</v-clicks>

---

# But are also kinda weird...

There are Readers/Writers and Stream Readers/Writers, but they're not always interchangable. There's also some weird naming going on...

```js {1-4|1-13}
const uploadedFile = await Deno.open(
  Deno.cwd() + "/uploads/report.tar.gz",
  { read: true },
);

//uploadFile.readable is a ReadableStream
const gzipReader = uploadedFile.readable.pipeThrough(
  new DecompressionStream("gzip"),
)
  .getReader() //getReader returns a ReadableStreamDefaultReader or a "StreamReader", not a "Reader"

//get a Reader from a StreamReader
const untar = new Untar(readerFromStreamReader(gzipReader));
for await (const entry of untar) { ... }
```


---

# ✅ import maps

I like import maps. Tooling could be better

---
layout: two-cols
---

# The Node App

## Uses the [Nitro](https://fresh.deno.dev) framework

- Typescript
- Templates with JSX
- Interactive component "islands" with Preact
- File-based routing

```txt
routes/
 ┣ [...path].ts
 ┣ index.ts
 ┗ upload.tsx
```

<template #right>

<div class="text-center">
    <logos-nodejs-icon class="text-10rem text-center" />
  </div>
</template>
