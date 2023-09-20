/**
 * 鸿蒙SDK API Version 6
 * 将页面滚动到目标位置
 * - 支持选择器（只支持id选择器和 class 选择器，暂不支持子选择器、后代选择器、跨自定义组件选择器、多选择器并集）
 * - 滚动距离
 * 文档地址 https://developer.harmonyos.com/cn/docs/documentation/doc-references/js-framework-syntax-js-0000000000611432
 */
import { Current } from '@tarojs/runtime'

import { callAsyncFail, callAsyncSuccess, findChildNodeWithDFS } from '../utils'

import type Taro from '@tarojs/taro'

type pageScrollTo = typeof Taro.pageScrollTo

// TODO
export const getCurrentPages = () => []

export const pageScrollTo: pageScrollTo = (options) => {
  return new Promise((resolve, reject) => {
    const taro = (Current as any).taro
    const page = taro.getCurrentInstance().page
    const scroller = page.scroller
    const { xOffset, yOffset } = scroller.currentOffset()
    const res = { errMsg: 'pageScrollTo:ok' }
    const error = { errMsg: 'pageScrollTo:fail' }
    const { scrollTop, selector = '', duration, offsetTop = 0 } = options

    if (scrollTop && selector) {
      console.warn('"scrollTop" 或 "selector" 建议只设一个值，全部设置会忽略selector')
    }

    let scrollValue = -1
    if (scrollTop || typeof scrollTop === 'number') {
      scrollValue = scrollTop
    } else if (selector) {
      const node = findChildNodeWithDFS(page.node, selector)
      // @ts-ignore
      const info = node?.instance?.info

      if (info) {
        scrollValue = info.globalPosition.y + yOffset + offsetTop
      }
    }

    if (scrollValue === -1) {
      return callAsyncFail(reject, { errMsg: 'pageScrollTo:fail, 请检查传入的 scrollTop 或 selector 是否合法' }, options)
    }

    try {
      page.scroller.scrollTo({
        xOffset,
        yOffset: scrollValue,
        animation: {
          duration: duration,
          // @ts-ignore
          curve: Curve.Linear
        }
      })

      setTimeout(() => {
        callAsyncSuccess(resolve, res, options)
      }, duration)
    } catch (_) {
      callAsyncFail(reject, error, options)
    }
  })
}
