import clipboardy from 'clipboardy'
import chalk from 'chalk'

export function copyToClipboard(text: string, isConsole = true) {
  clipboardy.writeSync(text)

  if (isConsole)
    console.log(`Copied to clipboard:${chalk.green(` ${text}`)}`)
}
