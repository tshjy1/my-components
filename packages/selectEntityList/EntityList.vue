<template>
  <div>
    <SelfAdaption ref="SelfAdaption">
      <Form :model="formSearch" ref="form" slot="adaption-bar" class="ivu-form-no-margin-bottom" inline>
        <template>
          <Form-item v-for="item in configSure.searchFields" :prop="item.field" :label="item.label" :key="item.label">
            <Input
              v-model="formSearch[item.field]"
              :placeholder="$t('common.warning.enter') + item.label"
              size="small"
              :maxlength="200"
            />
          </Form-item>
          <!-- 查询\重置按钮 -->
          <Form-item prop="button" class="search-solt-btn">
            <RPButton optType="search" @click="search(1)" />
            <RPButton optType="reset" @click="formReset" />
          </Form-item>
        </template>
      </Form>
    </SelfAdaption>
    <InnerPageTable ref="dataTable" :config="tableConfig" v-if="!updateApi"> </InnerPageTable>
  </div>
</template>
<script>
export default {
  props: {
    entityInfo: Object,
    period: String,
    config: Object,
    params: {
      type: Object,
      default: () => {}
    },
    // 多选配置
    isMultiple: Boolean,
    allselection: Array,
    selectionAreaItem: Object,

    // 调用两个接口：国家、省办、市办等先调用关系表，如果没有数据，再调用值集表
    needMoreApi: Boolean,
    templateConfig: Array, // 多个API接口配置，循环取值，没有返回值调用下一个接口直到有返回值,

    // 为true时不显示是否父级
    notSummaryFlag: Boolean
  },
  data() {
    return {
      formSearch: {
        period: this.period,
        ...this.params
      },
      configSure: this.needMoreApi ? this.templateConfig[0] : this.config,
      tempIndex: 0,
      updateApi: false
    }
  },
  computed: {
    tableConfig() {
      return {
        loadDataFn: this.queryList,
        columnsFn: this.configSure.columnsCreater.bind(this),
        initParam: this.configSure.params || {},
        hasSelectionArea: this.isMultiple,
        selectionAreaItem: this.selectionAreaItem,
        allSelection: this.allselection || []
      }
    },
    actions() {
      return [
        {
          text: this.$t('common.close'),
          theme: 'primary',
          handle: () => {
            this.$emit('Close')
          }
        }
      ]
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.search()
  },
  methods: {
    init() {
      if (this.isMultiple) { // 多选确定按钮
        this.actions.unshift(
          {
            text: this.$t('common.confirm1'),
            theme: 'primary',
            handle: () => {
              this.determine()
            }
          }
        )
      }
      this.$emit('SetTitle', this.$t('common.select') + this.configSure.dialogTitle)
      this.$emit('SetPageWidth', 700)
      this.$emit('SetPageActions', this.actions)
    },
    returnData(_entityInfo) {//约定searchFields第一个字段为code第二个为name，自定义配置请注意
      if(this.needMoreApi) {
        let res = {}
        res.code = _entityInfo[this.configSure.searchFields[0].field]
        res.name = _entityInfo[this.configSure.searchFields[1].field]
        this.$emit('Close', res)
      } else {
        let res = {}
        this.configSure.searchFields.forEach(item => {
          res[item.field] = _entityInfo[item.field]
        })
        this.$emit('Close', res)
      }
    },
    formReset() {
      this.$refs['form'].resetFields()
      this.search(1)
    },
    // 获取列表
    queryList({ responseProcess, param }) {
      this.configSure.queryEntityList(param).then(res => {
        if (res.status !== 200){
          responseProcess(res.data)
          return
        }
        if(this.needMoreApi) {// 循环查询
          if (this.tempIndex == (this.templateConfig.length -1)) {// 最后一个接口直接返回数据
            responseProcess(res.data)
            return
          }
          const resData = res.data.records.length == 0
          if (resData) {
            this.tempIndex ++
          } else {// 有数据直接返回数据
            responseProcess(res.data)
            return
          }
        } else {
          responseProcess(res.data)
        }
      })
    },
    search(page) {
      if (!page) page = this.$refs['dataTable'].currentPage
      this.$refs['dataTable'].load(this.formSearch, page)
    },
    // 多选确认
    determine() {
      const allSelection = this.$refs['dataTable'].allSelection
      this.$emit('Close', allSelection)
    },
  },
  watch: {
    tempIndex(newV) {
      this.configSure = this.templateConfig[newV]
      this.updateApi = true
      this.$nextTick(() => {
        this.updateApi = false
        this.$nextTick(() => {
          this.init()
          this.formReset()
        })
      })
    }
  }
}
</script>
