<p align="center">
  <img src="https://github.com/brocessing/ghp/raw/master/assets/logo.gif" alt="logo">
</p>
<h1 align="center">ghp</h1>
<h3 align="center">Automagically deploy your app on Github pages</h3>

<div align="center">
  <!-- License -->
  <a href="https://raw.githubusercontent.com/brocessing/ghp/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" />
  </a>
  <!-- Standard -->
  <a href="http://standardjs.com/">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard" />
  </a>
  <!-- npm version -->
  <a href="https://www.npmjs.com/package/ghp">
    <img src="https://img.shields.io/npm/v/ghp.svg?style=flat-square" alt="Standard" />
  </a>
</div>

<br>
<br>
<br>

## CLI

### installation
```sh
npm install -g ghp
```

### usage
```
ghp
ghp DIRECTORY
ghp DIRECTORY --force
ghp DIRECTORY --cache <cacheDirectory>
ghp DIRECTORY --message <msg>
ghp --help

Options:
  -h, --help              Show this screen.
  -m, --message=<msg>     Use the given <msg> as the commit message.
  -f, --force             Deploy without checking for uncommited changes.
  -q, --quiet             Suppress step summary messages.
  -c, --cache=<cacheDir>  Specify a cache directory.
```

## Node.js

### installation
```sh
npm install -S ghp
```

### usage
```js
var ghp = require('ghp')
ghp.deploy(path, options)
```

### options

+ **`options.message`**
  + commit message for the gh-pages branch, 
  + *default `':package: Update gh-pages'`*

+ **`options.quiet`**
  + suppress step summary messages
  + *default `false`*

+ **`options.force`**
  + skip the uncommited changes step
  + *default `false`*

+ **`options.cwd`**
  + git cwd
  + *default `process.cwd()`*



## License
[MIT](https://tldrlegal.com/license/mit-license).
