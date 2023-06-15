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
5. Use Web Standard APIs whenever possible

---
layout: two-cols
---

# Deno <logos-deno class="text-2rem text-center" />
- Initial release: May 15 2018
- Written in Rust
- Web standards focused
- Browser-like <v-click> <small class="opacity-60 italic"> I'll explain later </small> </v-click>
- First-class tooling, typescript, std library

<template #right>

# Node <logos-nodejs-icon class="text-2rem text-center" />
- Initial release: May 16, 2009
- Written in C/C++
- Common JS
- Minimal "std library"
- NPM
</template>

<!-- Web standards means everything is probably on MDN -->

---
layout: two-cols
---

# The Deno App

## Uses the [Hono](https://hono.dev/) framework
A framework for the "Edge"

- Typescript
- Templates with JSX
- No build step

```ts
import { Hono } from 'https://deno.land/x/hono/mod.ts'
const app = new Hono()

app.get('/', (c) => c.text('Hono!'))
```


<template #right>

<div class="text-center">
    <logos-deno class="text-10rem text-center" />
  </div>
</template>


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

Only works with packages from npm.

Doesn't FULLY support package.json. You can only run "basic" commands, though I don't exactly know what that means. I could run UnoCSS soooooo...

```ts
//package.json
{
  "dependencies":{
    "hono": "latest"
  }
}

//app.ts
import { Hono } from 'hono'
const app = new Hono()

```


</v-click>

---
layout: center
---

# Packages are pulled at runtime
Like a browser!
 
As the browser parses the `<script>`s and `<link>`s it downloads them

As deno parses `import`s it downloads them [^1]

With Node you'd do that all ahead of time with `npm install`

[^1]: You can cache ahead of time with `deno cache`, but I've had issues with getting it to cache *everything*

<!-- It can be hard to specify every single file that might have a dependency. Fresh for example kept downloading some Preact related package at runtime.-->

---

# Serving static files

Deno made this easy. Here's the route that serves static files from the
`./extracted` directory

```ts
import { serveDir } from "https://deno.land/std/http/file_server.ts"; //Deno's std static file server

Deno.serve(req => serveDir(req, { fsRoot: Deno.cwd() + "/extracted/news/html", quiet: true }))
```

<!--
the `Deno` object is a global helper/namespace for Deno apis separate from the std library
Hono actually provides a helper for static files, but this works too.
-->

---

# HTML Rendering

<v-click>

JSX 🤢

```tsx
import { BasePage } from "templates/base.tsx";
import { FileUpload } from "components/FileUpload.tsx";

export const UploadPage = (props: { message?: string } = {}) => (
  <BasePage>
    <form
      x-data="{file: null, loading: false}"
      action="/upload"
      method="POST"
      enctype="multipart/form-data"
      {...{ "@submit": "loading=true" }} /* WHYYYYY */
    >
    ...
    </form>
  </BasePage>
);
```

```ts
import { UploadPage } from "templates/upload.tsx";

app.get( "/upload" ,basicAuth({ username: "admin", password: Deno.env.get("AUTH_PASSWORD") }),
  (ctx) => {
    return ctx.html(render(UploadPage()));
  },
);

```
</v-click>

<!-- Deno.env.get is Deno's builtin environment variables stuff -->

---
layout: center
---

# Don't forget to do this to get JSX to work

```jsonc
//deno.jsonc
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
```
---

# Web Streams are the default in Deno. They're nice.
- You can pipe ReadableStreams to WritableStreams
- WritableStreams need to be closed
- You can read from StreamReaders
- You can write to StreamWriters
- TransformStreams have a StreamReader and StreamWriter to read and write

<v-clicks>

```js
const writableStream = new WritableStream()
const writer = writableStream.getWriter()
const readableStream = new ReadableStream()

const transformer = new TransformStream()

const reader = readableStream.pipeThrough(transformer).getReader()

for await (const chunk of reader.read()){
  writer.write(chunk)  
}
writer.close()

// await readableStream.pipeTo(writableStream)

```
</v-clicks>

---

# How I used streams

```js {1-3|1-9|1-16|17-35|all}
const fsFile = await Deno.create(Deno.cwd() + "/uploads/report.tar.gz");
await file.stream().pipeTo(fsFile.writable) //this writes the report.tar.gz file

//get a FsFile for our newly created file
const uploadedFile = await Deno.open(
  Deno.cwd() + "/uploads/report.tar.gz",
  { read: true },
);

await ensureDir(Deno.cwd() + "/extracted");
//uploadedFile.readable is a ReadableStream so we can pipe it to writable streams
const gzipReader = uploadedFile.readable.pipeThrough(
  new DecompressionStream("gzip"), //DecompressionStream is a TransformableStream
)
  .getReader()
const untar = new Untar(readerFromStreamReader(gzipReader));
for await (const entry of untar) { //async iteration of untar
  if (entry.type === "file") {
    await ensureFile(`${Deno.cwd()}/extracted/${entry.fileName}`);
    const writer = await Deno.create(
      `${Deno.cwd()}/extracted/${entry.fileName}`,
    );
    await copy(entry, writer);
    writer.close();
  }
}
```

---

# Deno frustrations

- Frequent breaking API changes
  - It felt like 50% of the Stack Overflow posts I read were outdated and were only a year or so old
- Deno.MODULE being moved to its own `std/` lib without any deprecation notice in the code
  - If you try to use a module it should say "hey this was moved to its own std library!"
- std/node vanished?

---

# The Node App

## Uses the [Hono](https://hono.dev/) framework
A framework for the "Edge"

- Javascript
- Templates with [HTM](https://github.com/developit/htm)
- No build step

```ts
import { Hono } from 'hono'
import html from '#html'
const app = new Hono()

app.get('/', (c) => c.html(html`<h1>'Hono!'</h1>`))
```

<template #right>

<div class="text-center">
    <logos-nodejs-icon class="text-10rem text-center" />
  </div>
</template>

---

# Subpath Imports

I discovered this while trying to find if Node supported something like importmaps. They fix having to figure out the relative import path of a module.

No more '../../../db/tables/something' paths!

Has to start with a '#'.

```json{1,4-10}
//package.json
{
  "dependencies": {...},
  "imports": {
    "#html": "./templates/html.js",
    "#templates/*": "./templates/*",
    "#components/*": "./templates/components/*"
  }
}
```

```js
//templates/components/MessageComponent.js
import html from '#html'

export default function MessageComponent(){
  return html`<h1> Message! </h1>
}
```

---

# TODO: Rendering with HTM

---

# TODO: Node streams

---

# TODO: How I used node streams

---
layout: two-cols
title: Final Comparisons
---


## Deno

Lower peak memory usage
- peaked around 190ish MB

Fewer 3rd party dependencies
- hono
- preact
- preact-render-to-string

<template #right>

## Node

Higher peak memory usage
- peaked around 210ish MB

More 3rd party dependencies
- hono
- htm
- vhtml
- fs-extra
- tar-stream

</template>
