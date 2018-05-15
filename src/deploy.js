const sh = require('kool-shell/namespaced')('brocessing_ghp')
const ghp = require('./gh-pages.js')

function deploy (entry, opts) {
  entry = entry || process.cwd()

  const pages = ghp(entry, opts)
  return pages.deploy()
    .then((url) => {
      console.log()
      sh.success('📦  New build pushed on the gh-pages branch !')
      sh.success(`🌍  Check out ${sh.colors.yellow(url)}`)
      sh.exit(0)
    })
    .catch((err) => {
      console.log()

      if (err === 'Nothing to commit') {
        sh.warn('Nothing to commit.')
        sh.exit(0)
      }

      sh.error('💀  Error during the deployment')
      let error
      if (err.stderr) error = err.stderr
      else if (err.stdout) error = err.stdout
      else error = err
      console.log()
      process.stdout.write(sh.colors.openTag.red)
      console.log(error)
      process.stdout.write(sh.colors.closeTag.red)
      sh.exit(0)
    })
}

module.exports = deploy
