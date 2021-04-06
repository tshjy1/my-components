<template>
  <Select
    ref="select-com"
    :value="validValue"
    :loading="loadingData"
    :remote-method="loadData"
    :max-tag-count="$attrs['max-tag-count'] || 1"
    v-bind="$attrs"
    transfer
    clearable
    filterable
    remote
    label-in-value
    @on-change="onValueChange"
    @on-query-change="onQueryChange"
  >
    <Option
      v-for="item in dataList"
      :value="item[config.valueAttr]"
      :key="item[config.keyAttr || config.valueAttr] || item.id || item[config.valueAttr]"
      >{{ item[config.textAttr] }}</Option
    >
  </Select>
</template>
<script>
import { debounce } from 'lodash'
import { prepareSelectQueryData } from '../const'

export default {
  name: 'RemoteSelect',
  props: {
    value: [String, Number, Array],
    loadFn: Function,// 数据请求方法：返回前后端约定的报文格式
    config: Object,// 配置select的key/value，和返回值
    params: {// 其他附带的查询条件，
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      validValue: this.getValidValue(),
      needSpecial: !!this.value || this.value === 0,
      loadingData: true,
      dataList: []
    }
  },
  created: function () {
    this.loadData = debounce(this._loadData, 300)
    this.startLoadData()
  },
  methods: {
    getValidValue() {
      let res
      if ('string-mode' in this.$attrs) {
        res = this.value && this.value.split(',')
      } else {
        res = this.value
      }

      return res
    },
    _loadData(queryStr) {
      this.loadingData = true
      let paramKey
      if (this.needSpecial) {
        paramKey = this.config.valueAttr
        this.needSpecial = false
      } else {
        paramKey = this.config.searchAttr || this.config.textAttr
      }

      if (this.lastQueryStr === queryStr && this.lastParamKey === paramKey) {
        return
      } else {
        this.lastQueryStr = queryStr
        this.lastParamKey = paramKey
      }

      const customParams = Object.assign({ [paramKey]: queryStr }, this.params || {})
      this.loadFn(
        prepareSelectQueryData(customParams)
      )
        .then(res => (res && res.data && res.data.records) || [])
        .then(list => {
          this.loadingData = false
          let helper = {}
          let res = []
          list.forEach(item => {
            let key = item[this.config.keyAttr || this.config.valueAttr] || item.id || item[this.config.valueAttr]
            if (!helper[key]) {
              helper[key] = 1
              res.push(item)
            }
          })

          this.dataList = res
        })
    },
    onValueChange(queryInfo) {
      if ('string-mode' in this.$attrs) {
        let value = [],
          label = []

        queryInfo.forEach(selectObj => {
          value.push((selectObj && selectObj.value) || '')
          label.push((selectObj && selectObj.label) || '')
        })

        queryInfo = {
          value: value.join(','),
          label: label.join(',')
        }
      }

      this.$emit('change', queryInfo)
    },
    onQueryChange(queryStr) {
      this.$refs['select-com'].filterQueryChange = false
      if (queryStr === '') {
        this.loadData('')
      }
    },
    startLoadData() {
      let searchValue = this.validValue
      if (Array.isArray(this.validValue)) {
        searchValue = ''
      } else {
        searchValue = searchValue || ''
      }

      this._loadData(searchValue)
    }
  }
}
</script>
