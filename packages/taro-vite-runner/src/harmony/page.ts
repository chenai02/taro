import { appendVirtualModulePrefix, prettyPrintJson, stripVirtualModulePrefix } from '../utils'

import type { PluginOption } from 'vite'
import type { TaroCompiler } from '../utils/compiler/harmony'

const PAGE_SUFFIX = '.ets?page-loader=true'

export default function (compiler: TaroCompiler): PluginOption {
  return {
    name: 'taro:vite-harmony-page',
    enforce: 'pre',
    resolveId (source, _importer, options) {
      if (compiler?.isPage(source) && options.isEntry) {
        if (compiler.getPageById(source)?.isNative) return null
        return appendVirtualModulePrefix(source + PAGE_SUFFIX)
      }
      return null
    },
    load (id) {
      if (compiler && id.endsWith(PAGE_SUFFIX)) {
        const {
          creatorLocation,
          importFrameworkStatement,
          // frameworkArgs,
        } = compiler.loaderMeta
        const rawId = stripVirtualModulePrefix(id).replace(PAGE_SUFFIX, '')
        const page = compiler.getPageById(rawId)

        if (!page) {
          compiler.logger.warn(`编译页面 ${rawId} 失败!`)
          process.exit(1)
        }

        const pageConfig = prettyPrintJson(page.config)

        let instantiatePage = [
          '@Component',
          `@Entry
struct Index {
  page\n
  scroller: Scroller = new Scroller()\n
  @State node: TaroElement = new TaroElement("Block")\n
  aboutToAppear() {
    const params = router.getParams() || {}

    this.page = createPageConfig(component, '${page.name}')
    this.page.onLoad(params, (instance) => {
      this.node = instance
    })
  }

  build() {
    Scroll(this.scroller) {
      Column() {
        if (this.node.tagName === 'VIEW') {
          TaroView({ node: this.node })
        } else if (this.node.tagName === 'TEXT') {
          TaroText({ node: this.node })
        } else if (this.node.tagName === 'IMAGE') {
          TaroImage({ node: this.node })
        } else if (this.node.tagName === 'SCROLL-VIEW') {
          TaroScrollView({ node: this.node })
        } else if (this.node.tagName === 'BUTTON') {
          TaroButton({ node: this.node })
        }
      }
    }
  }
}`,
        ].filter(e => typeof e === 'string').join('\n')

        if (typeof compiler.loaderMeta.modifyInstantiate === 'function') {
          instantiatePage = compiler.loaderMeta.modifyInstantiate(instantiatePage, 'page')
        }

        return [
          'import TaroView from "@tarojs/components/view"',
          'import TaroText from "@tarojs/components/text"',
          'import TaroImage from "@tarojs/components/image"',
          'import TaroButton from "@tarojs/components/button"',
          'import TaroScrollView from "@tarojs/components/scrollView"',
          'import { TaroElement } from "@tarojs/runtime"',
          `import component from "${rawId}"`,
          `import { createPageConfig, ReactMeta } from '${creatorLocation}'`,
          "import router from '@ohos.router';",
          importFrameworkStatement,
          `var config = ${pageConfig}`,
          page.config.enableShareTimeline ? 'component.enableShareTimeline = true' : null,
          page.config.enableShareAppMessage ? 'component.enableShareAppMessage = true' : null,
          '',
          instantiatePage,
        ].filter(e => typeof e === 'string').join('\n')
      }
    },
  }
}