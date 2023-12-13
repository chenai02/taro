import { findChildNodeWithDFS } from '../../utils'
import { bindFocus } from '../bind'
import { createTaroEvent, eventHandler, TaroEvent } from '../event'
import { TaroElement } from './element'

import type {
  CheckboxGroupProps,
  InputProps,
  PickerDateProps,
  PickerMultiSelectorProps,
  PickerSelectorProps, PickerTimeProps,
  RadioGroupProps,
  StandardProps
} from '../../../components/types'
import type { TaroAny } from '../../utils'
import type { TaroCheckboxElement, TaroRadioElement } from './normal'
import type { TaroSliderElement } from './slider'
import type { TaroSwitchElement } from './switch'

interface FormWidgetProps extends StandardProps {
  name?: string
  value?: string | number | number[] | string[] | Record<string, TaroAny>[]
}

class TaroFormWidgetElement<T extends FormWidgetProps = FormWidgetProps> extends TaroElement<T> {
  _value: TaroAny = ''

  constructor (tagName: string) {
    super(tagName)

    bindFocus(this)
  }

  public get name () {
    return this._attrs.name || ''
  }

  public set name (val: string) {
    this._attrs.name = val
  }

  public get value () {
    return ''
  }

  public set value (val: TaroAny) {
    this._value = val
    this._attrs.value = val
  }
}

class TaroInputElement extends TaroFormWidgetElement<InputProps> {
  text = ''

  constructor() {
    super('Input')

    this.text = this._attrs.value || ''
  }

  public get value () {
    return this.text
  }

  public set value (val: string) {
    this.text = val
    this._attrs.value = val
    // TODO: update
  }
}

class TaroCheckboxGroupElement extends TaroFormWidgetElement<CheckboxGroupProps> {
  constructor() {
    super('CheckboxGroup')
  }

  public get value () {
    // TODO: 待完善
    return null
    // if (this._instance) {
    //   return this._instance.getValues()
    // }
  }
}

class TaroRadioGroupElement extends TaroFormWidgetElement<RadioGroupProps> {
  constructor() {
    super('RadioGroup')
  }

  public get value () {
    // TODO: 待完善
    return null
    // if (this._instance) {
    //   return this._instance.getValues()
    // }
  }
}

class TaroPickerElement extends TaroFormWidgetElement<PickerSelectorProps | PickerTimeProps | PickerDateProps | PickerMultiSelectorProps> {
  select: TaroAny

  constructor() {
    super('Picker')
  }

  public get value () {
    if (this.select instanceof Array) {
      return this.select.join(',')
    }

    return this.select
  }

  public set value (val: TaroAny) {
    this.select = val
  }
}

class TaroFormElement extends TaroFormWidgetElement {
  constructor() {
    super('Form')

    // 监听submit冒泡
    this.addEventListener('submit-btn', (e: TaroEvent) => {
      e.stopPropagation()
      const formResult: Record<string, string> = {}
      findChildNodeWithDFS<TaroFormWidgetElement>(this as TaroElement, item => {
        switch (item.nodeName) {
          case 'INPUT':
          case 'SLIDER':
          case 'SWITCH':
          case 'RADIO-GROUP':
          case 'CHECKBOX-GROUP':
          case 'PICKER': {
            formResult[item.name] = item.value
            break
          }
        }
        return false
      }, true)
      const event: TaroEvent = createTaroEvent('submit', { detail: { value: formResult } }, this)
      eventHandler(event, 'submit', this)
    })

    // 监听reset冒泡
    this.addEventListener('reset-btn', (e: TaroEvent) => {
      findChildNodeWithDFS(this, (item: TaroFormWidgetElement) => {
        e.stopPropagation()
        switch (item.nodeName) {
          case 'INPUT': {
            item.value = (item as TaroInputElement)._attrs.value
            break
          }
          case 'SLIDER': {
            item.value = (item as TaroSliderElement)._attrs.value
            break
          }
          case 'SWITCH': {
            item.value = (item as TaroSwitchElement)._attrs.checked
            break
          }
          case 'RADIO-GROUP': {
            item.getElementsByTagName<TaroRadioElement>('RADIO').forEach((element: TaroRadioElement) => {
              element.checked = element._attrs.checked || false
              element.updateComponent()
            })
            break
          }
          case 'CHECKBOX-GROUP': {
            item.getElementsByTagName<TaroCheckboxElement>('CHECKBOX').forEach((element: TaroCheckboxElement) => {
              element.checked = element._attrs.checked || false
              element.updateComponent()
            })
            break
          }
          case 'PICKER': {
            item.value = (item as TaroPickerElement)._attrs.value
            break
          }
        }
        return false
      }, true)
    })
  }

  public get value () {
    const val = this._attrs.value
    return val == null ? '' : val
  }

  public set value (val: string | boolean | number | TaroAny[]) {
    this.setAttribute('value', val)
  }
}

const FormElement = TaroFormElement

export {
  FormElement,
  TaroCheckboxGroupElement,
  TaroFormElement,
  TaroFormWidgetElement,
  TaroInputElement,
  TaroPickerElement,
  TaroRadioGroupElement,
}