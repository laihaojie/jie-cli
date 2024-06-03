// import clipboardy from 'clipboardy'
import chalk from 'chalk'

import clipboard from 'copy-paste'

export function copyToClipboard(text: string, isConsole = true) {
  clipboard.copy(text, () => {
    if (isConsole)
      console.log(`Copied to clipboard:${chalk.green(` ${text}`)}`)
  })
}
