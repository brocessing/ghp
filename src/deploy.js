'use strict'

const sh   = require('kool-shell')
const ghp  = require('./gh-pages.js')

function deploy (entry, opts) {
  entry = entry || process.cwd()

  const pages = ghp(entry, opts)
  return pages.deploy()
    .then((url) => {
      sh
        .success('📦  New build pushed on the gh-pages branch !')
        .success(`🌍  Check out ${url}`)
        .exit(0)
    })
    .catch((err) => { sh.error('💀  Error during the deployment').error(err).exit(0) })
}

module.exports = deploy
