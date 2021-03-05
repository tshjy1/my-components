<template>
  <Input
    clearable
    v-model="nameAttr"
    v-bind="$attrs"
    size="small"
    @click.native="selectEntity"
    readonly
  />
</template>
<script>
import EntityList from './EntityList.vue'
import { getEntityConfig } from './selectEntityConfig.js'


export default {
  name: 'select-entity-list',
  props: {
    entityInfo: Object,
    period: String,
    config: Object, // 自定义弹框配置，不选择模板
    params: {
      type: Object,
      default: () => {}
    },
    // config模板类型，参考@tools/selectEntityConfig,
    templateType: String, // needMoreApi为true时，多个接口用,号隔开
    // 多选配置
    isMultiple: Boolean,
    allselection: Array,
    selectionAreaItem: Object, // {key: 唯一值，例如ID，title：选中显示}

    // 调用两个接口：国家、省办、市办等先调用关系表，如果没有数据，再调用值集表
    needMoreApi: Boolean,
    templateCoustonArray: Array, // 自定义配置数组模板
    notSummaryFlag: Boolean
  },
  data() {
    return {
      nameAttr: this.entityInfo.customAttr || this.entityInfo.nameAttr,
      hasTemplateCon: null,
      templateConfigArray: null
    }
  },
  watch: {
    entityInfo(newVal) {
      this.nameAttr = newVal.customAttr || newVal.nameAttr
    }
  },
  created() {
    this.setTemplate()
  },
  methods: {
    setTemplate() {
      if(!!this.needMoreApi) {
        this.templateConfigArray = this.templateCoustonArray || getEntityConfig(this.templateType, this)
      } else {
        if (!!this.templateType) this.hasTemplateCon = getEntityConfig(this.templateType, this)
      }
    },
    processRes(res) {
      this.$emit('change', res)
    },
    selectEntity(e) {
      if (e.target && e.target.nodeName === 'INPUT') {
        new this.$pageModal(
          EntityList,
          {
            props: {
              config: this.hasTemplateCon || this.config,
              entityInfo: this.entityInfo || {},
              period: this.period,
              params: this.params,
              isMultiple: this.isMultiple,
              // 多选
              allselection: this.allselection,
              selectionAreaItem: this.selectionAreaItem,
              // 多接口模板
              needMoreApi: this.needMoreApi,
              templateConfig: this.templateConfigArray,

              // 不显示是否父级
              notSummaryFlag: this.notSummaryFlag
            }
          },
          res => res && this.processRes(res)
        )
      } else {
        this.isMultiple ? this.processRes([]) : this.processRes({})
      }
    }
  }
}
</script>
