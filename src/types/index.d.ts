interface Config {
  lang: string
  co: Record<string, string>
  initConfig: Record<string, string>
}

interface CreateMeta {
  [key: string]: {
    templateUrl: string
    effect?: (options: Record<string, string>) => void
    prompt?: {
      type: string
      message: string
      name: string
      choices?: { name: string }[]
    }[]
  }
}

interface ReplacePackageNameOptions {
  packageName: string
  workDir?: string
}
