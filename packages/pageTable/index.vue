<template>
  <div class="rp-page-table-box pageTabel-searchAdapt-OneTwo">
    <InnerPageTable ref="pageTable" :config="pageTableConfig">
      <!-- 搜索选择框 -->
      <Form
        v-if="searchFields.length > 0"
        :model="searchForm"
        ref="searchForm"
        slot="search-bar"
        :label-position="searchLabelPosition || 'top'"
        :class="searchFormClass || 'ivu-form-no-margin-bottom'"
        inline
      >
        <template>
          <Row :gutter="16">
            <Col span="6">
              <Form-item v-for="item in searchFields" :key="item.field" :label="item.label">
                <Select
                  v-if="item.comType === ComTypes.Select"
                  v-model="searchForm[item.field]"
                  :loading="item.loading"
                  class="search-form-select"
                  size="large"
                  :placeholder="item.placeholder"
                  @on-change="search(1)"
                >
                  <Option
                    v-for="opt in item.options"
                    :value="opt[item.valueField]"
                    :key="opt[item.valueField]"
                    :title="opt.title"
                    >{{ opt[item.textField] }}</Option
                  >
                </Select>
                <Input
                  v-else
                  type="text"
                  v-model="searchForm[item.field]"
                  :placeholder="item.placeholder"
                  size="large"
                  :maxlength="item.maxlength || 30"
                  @on-enter="search(1)"
                />
              </Form-item>
              <!-- 查询重置按钮 -->
              <Form-item prop="button" class="handle-bar-one">
                <div class="rp-handle-bar" v-if="formButtons.length > 0">
                  <RPButton v-for="btn in formButtons" :key="btn.optType" :handler="getClickEvent(btn)" v-bind="btn" />
                </div>
              </Form-item>
            </Col>
          </Row>
        </template>
      </Form>
      <!-- 查询重置按钮 -->
      <div class="rp-handle-bar" v-if="formButtons.length > 0" slot="handle-bar">
        <RPButton v-for="btn in formButtons" :key="btn.optType" :handler="getClickEvent(btn)" v-bind="btn" />
      </div>
      <!-- 表格按钮 -->
      <div v-if="tableButtons.length > 0" slot="table-bar">
        <RPButton v-for="btn2 in tableButtons" :key="btn2.text" v-bind="btn2" />
        <RPButton v-if="isSortColumnsKey" optType="setup" :handler="sortColumns" text="调整列序" />
      </div>
    </InnerPageTable>
  </div>
</template>
<script>
import InnerPageTable from "./InnerPageTable.vue";
import { ComTypes } from "../../../src/const.js";
import sortColumns from "./sortColumns.vue";

const startPage = 1;
export default {
  name: "PageTable",
  components: { InnerPageTable },
  props: {
    config: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    let pageTableConfig = {
      customDataProcess: null,
      loadDataFn: null,
      resource: null,
      highlightRow: false,
      action: null,
      columns: [],
      columnsFn: null,
      initParam: {},
      autoFirst: false,
      // hasAsnyncLoaders: false,
      pageSize: 10,
      showTotal: true,
      showSizer: true,
      pageSizeOpts: [10, 20, 50, 100],
      isPage: true,
      onSelectionChange: _ => _,
      rowClickHandle: _ => _,
      formButtons: [{ optType: "search" }, { optType: "reset" }],
      formDirection: null,
      searchLabelPosition: null,
      searchFormClass: null,
      searchFields: [],
      tableButtons: [],
      title: null,
      isSortColumnsKey: "",
      ...this.config
    };

    let data = {
      ComTypes,
      searchForm: {},
      ...pageTableConfig
    };

    data.searchFields.forEach(item => {
      data.searchForm[item.field] = item.initValue;
    });

    // 由 pageTable 控制获取数据, 不需要 inner 控制
    this.pageTableConfig = Object.assign({}, pageTableConfig, { autoFirst: false });
    return data;
  },
  created() {
    this.processOptionLoaders();
  },
  // computed: {},
  // mounted: function() {
  //   this.autoFirst && !this.hasAsnyncLoaders && this.search(startPage);
  // },
  // beforeMount: function() {},
  // mounted: function() {},
  // beforeDestroy: function() {},
  // destroyed: function() {},
  methods: {
    processOptionLoaders() {
      let asnycRequests = [];
      this.searchFields.forEach(item => {
        if (typeof item.optionLoader === "function") {
          // this.hasAsnyncLoaders = true;
          item.loading = true;
          asnycRequests.push(
            item.optionLoader().then(res => {
              item.loading = false;
              item.options = res;
              if (item.initValue === undefined || item.initValue === null) {
                this.searchForm[item.field] = res[0] && res[0][item.valueField];
              }
            })
          );
        }
      });

      Promise.all(asnycRequests).then(() => this.autoFirst && this.search(startPage));
    },
    // 查询/重置按钮事件
    getClickEvent(btn) {
      return btn.optType === "search" ? this.search : this.reset;
    },
    resetFields() {
      for (let item of this.searchFields) {
        this.searchForm[item.field] = item.initValue;
      }
    },
    // 搜索框发生改变
    search(page) {
      this.$refs["pageTable"].load(this.searchForm, startPage);
    },
    // 重置
    reset() {
      this.resetFields();
      this.search(startPage); //请求第一页
    },
    sortColumns() {
      let _this = this;
      new this.$pageModal(
        sortColumns,
        {
          props: {
            deColumns: _this.$refs.pageTable.tableColumns,
            isSortColumnsKey: _this.isSortColumnsKey
          }
        },
        response => {
          if (response) {
            _this.$refs.pageTable.getColumns();
          }
        }
      );
    }
  }
  // watch: {},
  // directives: {}
};
</script>
<style lang="less">
.rp-page-table-box {
  .ivu-form-no-margin-bottom {
    .ivu-form-item-label {
      font-size: 14px;
    }
    .ivu-select-large.ivu-select-single .ivu-select-selection {
      height: 34px;
    }
    .ivu-input-large {
      height: 34px;
    }
  }
  .rp-handle-bar {
    button {
      margin-left: 14px;
    }
    // 查询按钮样式
    button:first-child {
      background-color: #ff6f4b;
      border-color: #ff6f4b;
    }
    // 重置按钮样式
    button:not(:first-child) {
      color: #ff6f4b;
      background-color: #ffffff;
      border-color: #ff6f4b;
    }
  }
  .table-bar {
    button {
      margin-right: 10px;
    }
    // 第一个按钮样式
    button:first-child {
      background-color: #ff6f4b;
      border-color: #ff6f4b;
    }
    // 后续按钮样式
    button:not(:first-child) {
      color: #ff6f4b;
      background-color: #ffffff;
      border-color: #ff6f4b;
    }
  }
  .search-form-select {
    width: 140px;
  }
}
</style>
<style lang="less">
@import "./index.less";
</style>
