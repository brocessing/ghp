const path = require('path')
const sh = require('kool-shell/namespaced')('brocessing_ghp')
const fs = require('fs-extra')
const tmp = require('tmp')

tmp.setGracefulCleanup()

const steps = 5
const defaultOpts = {
  cache   : path.join(process.cwd(), '.gh-pages-cache'),
  message : ':package: Update gh-pages',
  quiet   : false,
  cwd     : process.cwd(),
  force   : false,
}


function ghpages (copyPath, opts) {
  copyPath = copyPath || process.cwd()
  opts  = Object.assign({}, defaultOpts,  opts || {})

  let remote = ''
  let cleanupCallback

  const api = {
    deploy
  }

  const copyOptions = {
    clobber: true,
    dereference: false,
    preserveTimestamps: true,
    filter: function (path) {
      return path !== opts.cache && !(/(^|\/)\.[^\/\.]/g).test(path)
    }
  }

  function deploy () {
    return new Promise((resolve, reject) => {
      isEverythingCommit()
        .then(getRemoteGit)
        .then(() => {
          if (!opts.quiet) console.log()
          if (!opts.quiet) sh.step(1, steps, 'Rebuilding cache folder...')
        })
        .then(removeCacheFolder)
        .then(createCacheFolder)
        .then(() => {
          if (!opts.quiet) sh.step(2, steps, 'Init git and gh-pages branch...')
        })
        .then(gitInit)
        .then(addRemoteOrigin)
        .then(checkoutGhPages)
        .then(() => {
          if (!opts.quiet) sh.step(3, steps, 'Copying dist folder...')
        })
        .then(copyFiles)
        .then(() => commitAndPush(opts.message))
        .then(removeCacheFolder)
        .then(() => {
          let components = (/github\.com[:/]([0-9a-z_.-]+)\/([0-9a-z_.-]+)$/gi).exec(remote)
          if (components) {
            const author = components[1]
            let url = components[2]
            if (url && url.slice(-4) === '.git') url = url.slice(0, -4)
            resolve(`https://${author}.github.io/${url}/`)
          } else {
            resolve(null)
          }
        })
        .catch(reject)
    })
  }

  function getRemoteGit () {
    let errorMsg = 'No remote repository ! Deploy failed.'
    return new Promise((resolve, reject) => {
      sh.silentExec('git', ['config', '--get', 'remote.origin.url'], {cwd: opts.cwd})
        .then((res) => {
          if (!res || res.stdout === '') return reject(errorMsg)
          if (res.stderr && res.stderr !== '') return Promise.reject(res)
          remote = res.stdout.trim()
          resolve(remote)
        })
        .catch((e) => {
          if (e.stderr === undefined) return reject(e)
          if (e.stderr !== '' || e.stdout !== '') return reject(e)
          reject('Error with the command git config --get remote.origin.url')
        })
    })
  }

  function gitInit () {
    return sh.silentExec('git', ['init'], { cwd: opts.cache })
  }

  function addRemoteOrigin () {
    return sh.silentExec('git',
      ['remote', 'add', 'origin', remote],
      { cwd: opts.cache })
  }

  function removeCacheFolder () {
    return new Promise((resolve, reject) => {
      fs.remove(opts.cache, e => {
        try { cleanupCallback && cleanupCallback() } catch (e) {}
        return e ? reject(e) : resolve()
      })
    })
  }

  function createCacheFolder () {
    return new Promise((resolve, reject) => {
      tmp.dir((err, path, cb) => {
        if (err) reject(err)
        opts.cache = path
        cleanupCallback = cb
        fs.mkdirp(opts.cache, e => e ? reject(e) : resolve())
        resolve()
      })
    })
  }

  function isEverythingCommit () {
    if (opts.force) return Promise.resolve()
    return new Promise((resolve, reject) => {
      sh.silentExec('git', ['status', '--porcelain'], {cwd: opts.cwd})
        .then((res) => {
          if (res.stderr && res.stderr !== '') return Promise.reject(res)
          if (res.stdout.trim() !== '') reject('Uncommitted git changes! Deploy failed.')
          else resolve()
        })
        .catch((e) => {
          if (e.stderr === undefined) return reject(e)
          if (e.stderr !== '' || e.stdout !== '') return reject(e)
          reject('Error with the command git status --porcelain')
        })
    })
  }

  function copyFiles () {
    return new Promise((resolve, reject) => {
      fs.copy(copyPath, opts.cache, copyOptions, (err) => err ? reject(err) : resolve())
    })
  }

  function checkoutGhPages () {
    return new Promise((resolve, reject) => {
      sh.silentExec('git',
        ['show-ref', '--verify', '--opts.quiet', 'refs/heads/gh-pages'],
        {cwd: opts.cache})
        .then(() => {
          sh.silentExec('git', ['checkout', 'gh-pages'], {cwd: opts.cache})
            .then(resolve, reject)
        })
        .catch((e) => {
          sh.silentExec('git', ['checkout', '-b', 'gh-pages'], {cwd: opts.cache})
            .then(resolve, reject)
        })
    })
  }

  function commitAndPush (message) {
    return new Promise((resolve, reject) => {
      if (!opts.quiet) sh.step(4, steps, 'Adding files and commit...')
      sh.silentExec('git', ['add', '-A'], {cwd: opts.cache})
        .then(() => sh.silentExec('git',
          ['commit', '-m', message, '--no-verify'],
          {cwd: opts.cache}))
        .catch(e => {
          return (e.stdout && ~e.stdout.indexOf('othing to commit'))
            ? Promise.reject('Nothing to commit')
            : Promise.reject(e)
        }) // mute error if there is nothing to commit
        .then(() => {
          if (!opts.quiet) sh.step(5, steps, 'Pushing files - this may take a moment...')
        })
        .then(() => sh.silentExec('git',
          ['push', 'origin', 'gh-pages', '--force'],
          {cwd: opts.cache}))
        .then(resolve)
        .catch(reject)
    })
  }

  return api
}

module.exports = ghpages
