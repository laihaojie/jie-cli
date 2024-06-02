import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'index', name: 'jie' },
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  hooks: {
    'rollup:options': (ctx, options) => {
      // @ts-expect-error xxx
      options.plugins.push(
        {
          name: 'replace_string_decoder',
          generateBundle(outputOptions, bundle) {
            for (const [fileName, chunkOrAsset] of Object.entries<any>(bundle)) {
              if (['jie.mjs', 'jie.cjs'].includes(fileName))
                chunkOrAsset.code = chunkOrAsset.code.replaceAll('string_decoder/', 'string_decoder')
            }
          },
        },
      )
    },
  },
})
