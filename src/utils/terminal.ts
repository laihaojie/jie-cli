import fs from 'node:fs'
import path, { dirname, resolve } from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { Platform } from './platform'

export function getGitBashPath(): string[] {
  const gitDirs: Set<string> = new Set()

  // Look for git.exe on the PATH and use that if found. git.exe is located at
  // `<installdir>/cmd/git.exe`. This is not an unsafe location because the git executable is
  // located on the PATH which is only controlled by the user/admin.
  const gitExePath = findExecutable('git.exe')

  if (gitExePath) {
    const gitExeDir = dirname(gitExePath)
    gitDirs.add(resolve(gitExeDir, '../..'))
  }
  function addTruthy<T>(set: Set<T>, value: T | undefined): void {
    if (value) {
      set.add(value)
    }
  }

  // Add common git install locations
  addTruthy(gitDirs, process.env.ProgramW6432)
  addTruthy(gitDirs, process.env.ProgramFiles)
  addTruthy(gitDirs, process.env['ProgramFiles(X86)'])
  addTruthy(gitDirs, `${process.env.LocalAppData}\\Program`)

  const gitBashPaths: string[] = []
  for (const gitDir of gitDirs) {
    gitBashPaths.push(
      `${gitDir}\\Git\\bin\\bash.exe`,
    )
  }

  // Add special installs that don't follow the standard directory structure
  gitBashPaths.push(`${process.env.UserProfile}\\scoop\\apps\\git\\current\\bin\\bash.exe`)
  gitBashPaths.push(`${process.env.UserProfile}\\scoop\\apps\\git-with-openssh\\current\\bin\\bash.exe`)

  let gitBashPath
  gitBashPaths.some((path) => {
    if (fs.existsSync(path)) {
      gitBashPath = path
      return true
    }
    return false
  })

  if (!gitBashPath) {
    console.log(chalk.yellow('Git Bash 没有找到, 请安装Git确保环境变量中有git.exe'))
  }

  return gitBashPath
}

function findExecutable(command: string, cwd?: string, paths?: string[], env: any = process.env, exists = promisesExists): string | undefined {
  // If we have an absolute path then we take it.
  if (path.isAbsolute(command)) {
    return exists(command) ? command : undefined
  }
  if (cwd === undefined) {
    cwd = process.cwd()
  }
  const dir = path.dirname(command)
  if (dir !== '.') {
    // We have a directory and the directory is relative (see above). Make the path absolute
    // to the current working directory.
    const fullPath = path.join(cwd, command)
    return exists(fullPath) ? fullPath : undefined
  }
  const envPath = getCaseInsensitive(env, 'PATH')
  if (paths === undefined && typeof envPath === 'string') {
    paths = envPath.split(path.delimiter)
  }
  // No PATH environment. Make path absolute to the cwd.
  if (paths === undefined || paths.length === 0) {
    const fullPath = path.join(cwd, command)
    return exists(fullPath) ? fullPath : undefined
  }
  // We have a simple file name. We get the path variable from the env
  // and try to find the executable on the path.
  for (const pathEntry of paths) {
    // The path entry is absolute.
    let fullPath: string
    if (path.isAbsolute(pathEntry)) {
      fullPath = path.join(pathEntry, command)
    }
    else {
      fullPath = path.join(cwd, pathEntry, command)
    }

    if (exists(fullPath)) {
      return fullPath
    }
    if (Platform.isWin) {
      let withExtension = `${fullPath}.com`
      if (exists(withExtension)) {
        return withExtension
      }
      withExtension = `${fullPath}.exe`
      if (exists(withExtension)) {
        return withExtension
      }
    }
  }
  const fullPath = path.join(cwd, command)
  return exists(fullPath) ? fullPath : undefined
}

function getCaseInsensitive(target, key): any {
  const lowercaseKey = key.toLowerCase()
  const equivalentKey = Object.keys(target).find(k => k.toLowerCase() === lowercaseKey)
  return equivalentKey ? target[equivalentKey] : target[key]
}

function promisesExists(path: string): boolean {
  try {
    fs.accessSync(path)
    return true
  }
  catch {
    return false
  }
}
