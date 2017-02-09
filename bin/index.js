#!/usr/bin/env node

const deploy   = require('./../index.js')
const fs       = require('fs-extra')
const path     = require('path')
const sh       = require('kool-shell')
const minimist = require('minimist')
const minimistOpts = {
  string: [
    'cache',
  ],
  alias: {
    cache : ['c'],
    force : ['f'],
    help  : ['h']
  },
}

const args = process.argv.slice(2)
const argv = minimist(args, minimistOpts)

const entry = argv._ && argv._[0] ? argv._[0] : undefined
let opts = {}
Object.keys(minimistOpts.alias).forEach(key => {
  if (
  argv.hasOwnProperty(key) !== undefined &&
  typeof argv[key] !== 'undefined'
  ) {
    opts[key] = argv[key]
  }
})

if (opts.help) {
  console.log(fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf-8'))
  sh.exit(0)
}

deploy(entry, opts)