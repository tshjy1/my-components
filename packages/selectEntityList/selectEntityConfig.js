/**
 * 
 * @param {*} errMsg 错误校验提示
 * @param {*} selfValidMark 检验字段校验条件（避免死循环）
 * @param {*} relativeValidMark 关联字段校验条件（避免死循环）
 * @param {*} relativeField 关联字段
 * @param {*} currentField 当前字段
 * @param {*} vm this
 * @param {*} ref form
 * @param {*} validMark 控制是否校验
 */
export function createValidateFunc({ errMsg, selfValidMark, validMark, relativeValidMark, relativeField, currentField, vm, ref = 'dataForm' }) {
  return function (rule, value, callback) {
    vm[selfValidMark] = false
    if (vm[relativeValidMark]) {
      vm.$refs[ref].validateField(relativeField)
    }

    vm[selfValidMark] = true
    setTimeout(() => {
      const checkForm = !vm.modelForm[relativeField] && !vm.modelForm[currentField]
      const isCheck = !!validMark ? checkForm && vm[validMark] : checkForm
      if (isCheck) {
        callback(new Error(errMsg))
      } else {
        callback()
      }
    }, 100)
  }
}
import { commonColumns } from './columns.js'

/**
 * 模板配置
 * @param {*} type 
 * @param {*} _this 
 */
export function templateConfig(type, _this) {
  const config = {}
  return config[type] || {}
}

export function getValueSet(type) {
  let valueSetConfig = {
    modelTitle: '',
    keyCode: '',
    keyName: '',
    keyCodeTitle: '',
    keyNameTitle: '',
    keyFun: null
  }
  switch(type) {
    case 'hfmAccount': 
    
    default: break;
  }
  return valueSetConfig
}

function getConfig(template) {
  return {
    dialogTitle: template.modelTitle,
    searchFields: [// 约定默第一个字段为code第二个为name
      {
        label: template.keyCodeTitle,
        field: template.keyCode
      },
      {
        label: template.keyNameTitle,
        field: template.keyName
      }
    ],
    columnsCreater: commonColumns,
    queryEntityList: template.keyFun,
    tableTitle: { code: template.keyCodeTitle, name: template.keyNameTitle },
    tableKey: { code: template.keyCode, name: template.keyName },
    params: template.params || {}
  }
}
/**
 * 通过Type获取selectEntityList组件config配置
 */
export function getEntityConfig(type, _this) {
  if (!type) return {}
  if (_this.needMoreApi) {
    const typeArray = type.split(',')
    const template = []
    typeArray.forEach(item => {
      template.push(getConfig(templateConfig(item, _this)))
    })
    return template
  } else {
    const template = templateConfig(type, _this)
    return getConfig(template)
  }
}
