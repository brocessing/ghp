#!/usr/bin/env node

const deploy   = require('./../index.js')
const fs       = require('fs-extra')
const path     = require('path')
const sh       = require('kool-shell/namespaced')('brocessing_ghp')
const minimist = require('minimist')
const minimistOpts = {
  string: [
    'cache',
    'message',
  ],
  alias: {
    cache : ['c'],
    force : ['f'],
    help  : ['h'],
    message : ['m'],
    quiet : ['q'],
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