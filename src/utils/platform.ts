export class Platform {
  static get isWin() {
    return process.platform === 'win32'
  }

  static get isMac() {
    return process.platform === 'darwin'
  }
}
