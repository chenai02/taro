import typescript from '@rollup/plugin-typescript'
import * as path from 'path'
import externals from 'rollup-plugin-node-externals'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(new URL(import.meta.url))
const cwd = path.dirname(__filename)

const base = {
  plugins: [
    externals({
      peerDeps: true,
    }),
    typescript(),
  ]
}

// 供 CLI 编译时使用的 Taro 插件入口
const compileConfig = {
  input: path.join(cwd, 'src/index.ts'),
  output: {
    file: path.join(cwd, 'dist/index.js'),
    format: 'cjs',
    sourcemap: true,
    interop: 'compat',
    exports: 'named'
  },
  ...base
}

// 运行时入口
const runtimeConfig = {
  input: path.join(cwd, 'src/runtime.ts'),
  output: {
    file: path.join(cwd, 'dist/runtime.js'),
    format: 'es',
    sourcemap: true
  },
  ...base
}

export default [compileConfig, runtimeConfig]