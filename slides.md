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
5. Use Web Standards whenever possible

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
layout: center
---
# Deno tries to act like a browser
which has some pros and cons

---
layout: statement
---
# Package Management
A couple ways of dependency management

---
# Deps.ts

<v-click>

Recommended for libraries since it can be overidden by an import_map

```ts
//deps.ts
export { ensureDir } from 'https://deno.land/std@0.190.0/fs/mod.ts'
export { readableStreamFromReader, readerFromReadableStream } from 'https://deno.land/std@0.190.0/streams/mod.ts'

//main.ts
import { ensureDir, readableSteamFromReader } from './deps.ts'
```

</v-click>

---


# import_map.json

<v-click>

The "final say" in what version of a package to use. Recommended for Apps.

```json
{
  "imports":{
    "https://deno.land/std@0.177.0/": "https://deno.land/std@0.190.0/",
    "fs": "https://deno.land/std@0.190.0/fs/mod.ts",
    "streams": "https://deno.land/std@0.190.0/streams/mod.ts",
    "templates/": "./templates/"
  },
  "scopes": {
    "https://deno.land/x/thingy/": {
      "https://deno.land/std@0.177.0/": "./patched/"
    }
  }
}
```
```js
import { ensureDir } from 'fs'
import { readableStreaFromReader } from 'streams'
import { UploadPage } from './templates/upload.js'
```

</v-click>

<!-- There's jspm.io which is a sort of package manager for import_maps, but its more meant for moving your package.json over to an import_map.
 It also has issues if you use "imports" like "./templates/" because its trying to install those paths -->

---

# package.json

<v-click>

Nice if you're migrating to Deno, but who does that?

Installs into a node_modules directory so you can run things with npm.

Doesn't FULLY support package.json. You can only run "basic" commands. So I couldn't have Unocss running with Deno, I had to use node or bun for that.

</v-click>

---
layout: center
---

# Packages are pulled at runtime
Like a browser!
 
As the browser parses the `<script>`s and `<link>`s it downloads them

As deno parses `import`s it downloads them [^1]


Node you'd do that all ahead of time with `npm install`

[^1]: You can cache ahead of time, but I've had issues with that...

<!-- It can be hard to specify every single file that might have a dependency. If a library doesn't use deps.ts then you're stuck downloading at runtime -->

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
```
<!--
the `Deno` object is a global helper/namespace for Deno apis separate from the std library.
-->

---

# TODO: HTML Rendering

---

# Web Streams are the default in Deno. They're nice.
Intuitive duck typing!
<v-clicks>

Like how a `Thenable` implements a `then()` method:

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

---

# Deno frustrations

- Frequent breaking API changes
  - It felt like 50% of the Stack Overflow posts I read were outdated and were only a year or so old
- Deno.MODULE being moved to its own `std/` lib without any deprecation notice in the code
  - If you try to use a module it should say "hey this was moved to its own std library!"
- std/node vanished?

# The Node App

## Uses the [Nitro](https://nitro.unjs.io) framework

- Javascript
- Templates with HTM (tagged templatel literals)
- Interactive components with Alpine.js
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

---

# TODO: Node still king of dev tooling
