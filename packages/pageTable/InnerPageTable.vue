<template>
  <div class="inner-table" :ref="refKeys.innerTable">
    <div :ref="refKeys.innerTableWrap">
      <!-- 搜索按钮 -->
      <div class="search-bar run-search-bar" style="background: none">
        <div>
          <slot name="search-bar"></slot>
        </div>
        <div>
          <slot name="handle-bar"></slot>
        </div>
      </div>
      <div class="selection-area" v-if="hasSelectionArea && selectionAreaItem && allSelection.length > 0">
        <Tag
          v-for="item in allSelection"
          :key="item[selectionAreaItem.key]"
          :name="item[selectionAreaItem.key]"
          closable
          @on-close="closeTag"
          >{{ item[selectionAreaItem.title] }}</Tag
        >
      </div>
      <!-- 表格按钮/表格/分页 -->
      <div class="single-table-con">
        <div class="table-bar">
          <slot name="table-bar"></slot>
        </div>
        <Table
          size="small"
          :ref="refKeys.table"
          :loading="loading"
          @on-current-change="onCurrentChange"
          :highlight-row="highlightRow"
          :max-height="tableHeight"
          :data="tableData"
          :columns="tableColumns"
          @on-selection-change="selectionChange"
          @on-sort-change="sortHandle"
          @on-row-click="rowClickHandle"
          :row-class-name="rowClassNameFn"
          v-bind="$attrs"
          :border="border"
        ></Table>
        <!-- 分页 -->
        <div style="margin: 10px 0px 10px 10px; overflow: hidden" v-if="isPage">
          <div style="float: right">
            <Page
              :placement="placement"
              :total="total"
              :show-total="showTotal"
              :page-size-opts="pageSizeOpts"
              :show-sizer="showSizer"
              :page-size="pageSize"
              :current="currentPage"
              @on-change="changePage"
              size="small"
              :transfer="true"
              @on-page-size-change="changePageSize"
            ></Page>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { hasClass } from "../const";

export default {
  name: "InnerPageTable",
  components: {},
  props: {
    config: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      minHeight: 46 + 39, //至少显示一行数据时的高度(表头加表行). 不计算, 省性能
      resource: null, //组件会会直接使用这里的数据进行页面表格绘制!
      highlightRow: false, //(view-design table 的 highlight-row 属性) 是否支持高亮选中的行，即单选
      action: null, //pageTable 组件会用这个属性值通过全局注册的 vuex 变量 $store 来调用 action 获取数据. 但若传递了 loadDataFn , 这个参数失效!
      initParam: {}, //查询数据时的初始参数配置
      autoFirst: false, //组件是否主动获取第一页数据
      pageSize: 10, //分页组件的默认每页条数
      showTotal: true, //是否显示总数
      showSizer: true, //是否显示分页，用来改变page-size
      pageSizeOpts: [10, 20, 50, 100], //每页条数切换的配置
      isPage: true, //是否要显示分页组件
      onSelectionChange: _ => _, //在多选模式下有效，只要选中项发生变化时就会触发
      rowClickHandle: _ => _, //单击某一行时触发
      loadDataFn: null, //通过传递 loadDataFn 方法自己取表格数据
      customDataProcess: null, //通过传递 customDataProcess 函数, 自己来处理服务返回的或传递给 resource 的数据
      isSortColumnsKey: "", //启用表格列顺序调整功能，并配置表格唯一标识码，调整后的列顺序只在当前浏览器存储生效，配置参考："tableKey"。 存储在 localStorage
      columns: [], //表格列配置
      columnsFn: null, //获取表格列配置的函数
      hasSelectionArea: false, //是否显示已选项区域，配合列表多选使用，表格中勾选的行将显示在表格头部，能跨页多选。
      selectionAreaItem: { key: "id", title: "configName" }, //配置已选项区域中标签的唯一标识和显示名称对应列表中的字段，配置参考:{ key: "列表字段id", title: "列表字段name" }
      allSelection: [], // 初始化多选，必须放在congfig前面避免数据被覆盖
      tableHeight: undefined, // 表格高度
      autoMaxHeight: true, //自动最大高度, 即自适应容器高度
      rowClassNameFn: _ => _, // 给某一行指定一个样式名称
      border: false, // 表格边框设置，默认false
      resizable: false, // 表格列是否可拖动改变宽度，默认false
      ...this.config,
      /////////////////////////////////////////////////// 内部使用属性 //////////////////////////////////////////////////////////
      // currentPage: 1,
      tableData: [], //表格数据
      total: 0,
      selection: [],
      loading: false,
      param: {
        commonPageDTO: {
          //currentPage: 1,
          // pageSize: 10
        },
        sortDTO: {
          fieldName: "",
          orderBy: ""
        },
        condition: {}
      },
      isSelectionChange: false,
      currentRow: undefined,
      tableColumns: [],
      refKeys: {
        innerTable: Symbol("innerTable"),
        innerTableWrap: Symbol("innerTableWrap"),
        table: Symbol("table")
      },
      // 添加阴影: 获取表格和右侧操作栏
      table: [],
      fixedRight: []
    };
  },
  computed: {
    placement() {
      let pageTotal = 0;
      if (this.total % this.pageSize == 0) {
        pageTotal = this.total / this.pageSize;
      } else {
        pageTotal = this.total / this.pageSize + 1;
      }
      pageTotal = parseInt(pageTotal);
      return this.total % this.pageSize < 3 && this.currentPage == pageTotal ? "bottom" : "top";
    },
    lang() {
      let _store = this.$store || window.$store;
      return _store && _store.state && _store.state["tsj-components"] && _store.state["tsj-components"].lang;
    }
  },
  created: function () {
    this.dataCompatibilityProcess();
    this.getColumns();
    for (let c of this.tableColumns) {
      if (!~"selection".indexOf(c.type)) {
        // c.ellipsis = true;
        // 无render函数的统一添加字段过长的title提示
        this.initTableEllipsisColumn(c);
      }
    }

    this.autoFirst && this.load();
  },
  beforeMount: function () {},
  mounted() {
    this.$nextTick(() => {
      if (this.autoMaxHeight && !this.checkIfInPageModel()) {
        this.setTableScroll();
        // 窗口变化重新计算
        window.addEventListener("resize", this.setTableScroll);
      }
    });

    // 添加阴影
    setTimeout(() => {
      this.initTableBoxShadow();
    }, 500);

    // 添加阴影
    this.tableChange();

    // 给search-bar label添加title
    this.initSearchBarLableTitle(this.lang);
    $channel.$on("ChangeSelfAdaptionStatus", this.setTableScroll);
  },
  destroyed() {
    $channel.$off("ChangeSelfAdaptionStatus", this.setTableScroll);
    window.removeEventListener("resize", this.setTableScroll);
  },
  // 页面缓存：离开取消监听
  deactivated() {
    $channel.$off("ChangeSelfAdaptionStatus", this.setTableScroll);
    window.removeEventListener("resize", this.setTableScroll);
  },
  // 页面缓存：进入重新监听
  activated() {
    this.setTableScroll();
    window.addEventListener("resize", this.setTableScroll);
    $channel.$on("ChangeSelfAdaptionStatus", this.setTableScroll);
  },
  methods: {
    // 添加阴影：当表格窗口大小改变/滚动条滚动的时候
    tableChange() {
      // 获取所有表格和右侧操作栏
      this.table = window.document.getElementsByClassName("ivu-table-body");
      this.fixedRight = window.document.getElementsByClassName("ivu-table-fixed-right");

      window.addEventListener("resize", () => {
        // 延迟调用，否则当窗口迅速拖动，dom还没来得及渲染完，scrollWidth、clientWidth还获取不到准确的数值
        setTimeout(() => {
          this.initTableBoxShadow();
        }, 500);
      });

      // 给每个表格加滚动事件
      for (let i = 0, l = this.table.length; i < l; i++) {
        // 获取最初的滚动距离
        let l = this.table[i].scrollTop;
        // 当滚动条滚动的时候
        this.table[i].onscroll = () => {
          // 与最初滚动距离比较是否有变化，变化了为横向滚动
          if (this.table[i].scrollLeft !== l) {
            this.setTableBoxShadow();
          }
        };
      }
    },
    // 添加阴影：初始的表格阴影
    initTableBoxShadow() {
      for (let i = 0, l = this.table.length; i < l; i++) {
        // 当内容宽度小于或等于元素内部宽度的px值时，判定为出现滚动条
        let isScroll = this.table[i] && this.table[i].scrollWidth > this.table[i].clientWidth;
        if (this.fixedRight[i]) {
          // 没有滚动条时，隐藏阴影
          if (!isScroll) {
            this.fixedRight[i].style["boxShadow"] = "none";
          } else {
            this.setTableBoxShadow();
          }
        }
      }
    },
    // 添加阴影：增加操作栏的阴影
    setTableBoxShadow() {
      for (let i = 0, l = this.table.length; i < l; i++) {
        // 滚动条是否滚到最右侧,（内容实际宽度 - 滚动条左侧宽度 = 窗口宽度）就判断为滚动条滚到最右侧，
        // let isScrollRight = table && table.scrollWidth - Math.round(table.scrollLeft) = table.clientWidth;
        // 但是（内容实际宽度 - 滚动条左侧宽度） 有的情况会有偏差，比窗口宽度少了1px或多了3/4px，导致不相等，
        // 所以才用（（内容实际宽度 - 滚动条左侧宽度）-窗口宽度）的绝对值<=4就判断为滚动条到了最右侧，使波动偏差在-4至4之间均成立
        let isScrollRight =
          Math.abs(
            this.table[i] &&
              this.table[i].scrollWidth - Math.round(this.table[i].scrollLeft) - this.table[i].clientWidth
          ) <= 4;
        if (this.fixedRight[i]) {
          // 滚动条是否滚到最右侧，隐藏阴影
          if (isScrollRight) {
            this.fixedRight[i].style["boxShadow"] = "none";
          } else {
            this.fixedRight[i].style["boxShadow"] = "";
          }
        }
      }
    },
    // 数据兼容性处理, 苦逼的事
    dataCompatibilityProcess() {
      this.setCurrentPage(this.currentPage || this.param.commonPageDTO.currentPage);
      this.setPageSize(this.isPage ? this.pageSize || this.param.pageSize || this.param.commonPageDTO.pageSize : 1000);
    },
    setCurrentPage(newValue) {
      this.currentPage = this.param.pageNum = this.param.commonPageDTO.currentPage = newValue || 1;
    },
    setPageSize(newValue) {
      this.pageSize = this.param.pageSize = this.param.commonPageDTO.pageSize = newValue || 10;
    },
    setTotal(newValue) {
      this.total = newValue;
    },
    initTableEllipsisColumn(columnItem) {
      this.$set(columnItem, "ellipsis", true);
      if (!columnItem.render) {
        this.$set(columnItem, "render", (h, params) => {
          return h("span", { attrs: { title: params.row[params.column.key] } }, params.row[params.column.key]);
        });
      }
    },
    // 表格的事件
    onCurrentChange(currentRow) {
      this.currentRow = Object.assign({}, currentRow);
    },
    getHighlightRow() {
      return this.currentRow;
    },
    getColumns() {
      let propsTableColumns = [];
      if (localStorage.getItem(this.isSortColumnsKey) && localStorage.getItem(this.isSortColumnsKey) != "") {
        let localTableColumns = JSON.parse(localStorage.getItem(this.isSortColumnsKey));
        if (typeof this.columnsFn == "function") {
          propsTableColumns = [].concat(this.columnsFn());
        } else {
          propsTableColumns = [].concat(this.columns);
        }

        propsTableColumns.sort(this.localColumnsSort(localTableColumns));
      } else {
        if (typeof this.columnsFn == "function") {
          propsTableColumns = [].concat(this.columnsFn());
        } else {
          propsTableColumns = [].concat(this.columns);
        }
      }
      // 根据resizable条件判断,是否需要列拖拽
      if (this.resizable) this.border = true
      propsTableColumns.map(item => {
        item.minWidth = item.minWidth || 120;
        if (this.setResizeAble(item)) {
          item.resizable = this.resizable
          item.width = item.width || 'auto';
        }
      });

      this.tableColumns = propsTableColumns;
    },
    // 判断是否添加拖拽
    setResizeAble(item) {
      return this.resizable && item.type !== 'selection' && item.type !== 'index' && !item.fixed
    },
    localColumnsSort(list) {
      return (a, b) => {
        let val1 = list.filter(item => {
          if (item["title"] != "") {
            return item["title"] == a["title"];
          } else {
            return item["type"] == a["type"];
          }
        })[0].sortNum;
        let val2 = list.filter(item => {
          if (item["title"] != "") {
            return item["title"] == b["title"];
          } else {
            return item["type"] == b["type"];
          }
        })[0].sortNum;
        return val1 - val2;
      };
    },
    refresh() {
      this.setCurrentPage(1);
      this.$nextTick(() => {
        this.load();
      });
    },
    load(param = {}, page) {
      this.selection = [];

      //为了兼容各种请求结构
      const _condition = this.param.condition || {};
      const _param = Object.assign({}, this.param);
      delete _param.condition;

      this.param = Object.assign({}, _param, this.initParam, param);
      this.param.condition = Object.assign({}, this.initParam, _condition, param);

      this.loading = true;
      if (!page || typeof page == "object") {
        this.setCurrentPage(1);
      } else {
        this.setCurrentPage(page);
      }

      this.runLoadProcess();
    },
    runLoadProcess() {
      if (typeof this.loadDataFn === "function") {
        this.loadDataFn(this);
      } else if (this.action) {
        this.loadAjax(this.initParam);
      } else {
        this.loadLocal();
      }
    },
    loadAjax(_initParam) {
      const _store = window.$store || this.$store;
      let _param = {
        ...(_initParam || {}),
        ...this.param
      };

      _store && _store.dispatch && _store.dispatch(this.action, _param).then(this.responseProcess);
    },
    loadLocal() {
      if (!this.isPage) {
        this.$nextTick(() => {
          this.tableData = [].concat(this.resource);
          this.loading = false;
        });
        return;
      }

      this.setTotal(this.resource.length);
      let start = (this.currentPage - 1) * this.pageSize;

      let end = start + this.pageSize;
      end = this.resource.length > end ? end : this.resource.length;
      this.tableData = [];
      for (let i = start; i < end; i++) {
        this.tableData.push(this.resource[i]);
      }
      if (this.hasSelectionArea) this.checkedRow()
      this.$nextTick(() => {
        this.loading = false;
      });
    },
    responseProcess(res) {
      this.loading = false;
      if (!res) return;
      if (this.customDataProcess) {
        this.customDataProcess(this, res);
        return;
      }

      this.setCurrentPage(res.currentPage || res.pageNum || 1);
      this.setTotal(res.total || 0);
      this.tableData = [];
      // let _list = [];
      // //console.log(res.recordList);
      for (let item of res.recordList || res.records || []) {
        this.tableData.push(item);
        // _list.push(item.userName);
      }
      if (this.hasSelectionArea) this.checkedRow() // 分页多选时有效
      // 添加阴影
      setTimeout(() => {
        this.initTableBoxShadow();
      }, 500);
    },
    getTableData() {
      return this.tableData;
    },
    // 页码改变的回调，返回改变后的页码
    changePage(page) {
      this.setCurrentPage(page);
      this.load({}, page); //为了兼容老的用法, load不传值默认是第一页
      // this.checkedRow();// 异步请求时，存在问题
      // 页码切换自定义事件
      this.$emit("page-change", page);
    },
    // 切换每页条数时的回调，返回切换后的每页条数
    changePageSize(pageSize) {
      this.setPageSize(pageSize);
      // 改变pageSize时，如果page!=1,组件会设置page=1，触发changePage
      if (this.currentPage == 1) {
        this.load(); //为了兼容老的用法, load不传值默认是第一页
        // this.checkedRow(); // 异步请求时，存在问题
      }
    },
    // 选中项发生变化时就会触发
    selectionChange(selection) {
      // 更新标签栏
      this.updateAllSelection(selection);
      this.isSelectionChange = true;
      this.selection = selection;
      if (typeof this.onSelectionChange == "function") {
        this.onSelectionChange(selection);
      }
    },
    getSelectioned() {
      return this.isSelectionChange ? this.selection : undefined;
    },
    clearSelected() {
      this.selection = [];
    },
    // 远程排序事件
    sortHandle(obj, b, c) {
      this.param.sortDTO.fieldName = obj.key;
      this.param.sortDTO.orderBy = obj.order;
      if (this.param.sortDTO.orderBy == "normal") {
        this.param.sortDTO = {
          fieldName: "",
          orderBy: ""
        };
      }

      if (obj.order == "desc") {
        this.param.descs = [toLine(obj.key)];
        this.param.ascs = [];
      } else if (obj.order == "asc") {
        this.param.ascs = [toLine(obj.key)];
        this.param.descs = [];
      } else {
        this.param.ascs = [];
        this.param.descs = [];
      }

      this.refresh();
    },
    getSortData() {
      return this.param.sortDTO;
    },
    getTableObj() {
      return this.$refs["table"];
    },
    closeTag(event, name) {
      // 唯一标识
      let key;
      if (this.selectionAreaItem && this.selectionAreaItem.key) {
        key = this.selectionAreaItem.key;
      } else {
        return;
      }
      // 更新标签栏
      for (let index = 0; index < this.allSelection.length; index++) {
        const item = this.allSelection[index];
        if (name == item[key]) {
          this.allSelection.splice(index, 1);
          break;
        }
      }
      // 更新表格
      for (let i = 0; i < this.tableData.length; i++) {
        let row = this.tableData[i];
        if (name == row[key]) {
          row._checked = false;
        } else {
          row._checked = false;
          for (let j = 0; j < this.selection.length; j++) {
            const checkedRow = this.selection[j];
            if (row[key] == checkedRow[key]) {
              row._checked = true;
              break;
            }
          }
        }
      }
      // 更新已选择
      for (let index = 0; index < this.selection.length; index++) {
        const item = this.selection[index];
        if (name == item[key]) {
          this.selection.splice(index, 1);
          break;
        }
      }
      this.tableData = this.tableData.concat([]);
    },
    // 更新标签栏
    updateAllSelection(newSelection) {
      // 唯一标识
      let key;
      if (this.selectionAreaItem && this.selectionAreaItem.key) {
        key = this.selectionAreaItem.key;
      } else {
        return;
      }
      // 新增的选项
      // 本页新增 = 本页已选New - 本页已选Old
      let increasedData = newSelection.filter(newData => {
        for (let index = 0; index < this.selection.length; index++) {
          const oldData = this.selection[index];
          if (oldData[key] == newData[key]) {
            return false;
          }
        }
        return true;
      });
      // 减少的选项
      // 本页减少 = 本页已选Old - 本页已选New
      let reducedData = this.selection.filter(oldData => {
        for (let index = 0; index < newSelection.length; index++) {
          const newData = newSelection[index];
          if (oldData[key] == newData[key]) {
            return false;
          }
        }
        return true;
      });
      // 标签栏 = 标签栏 + 本页新增 - 本页减少
      reducedData.forEach(reduced => {
        for (let index = 0; index < this.allSelection.length; index++) {
          const selectionData = this.allSelection[index];
          if (selectionData[key] == reduced[key]) {
            this.allSelection.splice(index, 1);
            return;
          }
        }
      });
      this.allSelection = this.allSelection.concat(increasedData);
    },
    // 回显已勾选项
    checkedRow() {
      // 唯一标识
      let key;
      if (this.selectionAreaItem && this.selectionAreaItem.key) {
        key = this.selectionAreaItem.key;
      } else {
        return;
      }
      this.tableData.forEach(row => {
        for (let index = 0; index < this.allSelection.length; index++) {
          const element = this.allSelection[index];
          if (row[key] == element[key]) {
            row._checked = true;
            this.selection.push(element);
            return;
          }
        }
        row._checked = false;
      });
    },
    checkIfInPageModel() {
      let parentEle = this.$el.parentElement;
      while (parentEle) {
        if (hasClass(parentEle, "core-modal-body")) {
          return true;
        } else {
          parentEle = parentEle.parentElement;
        }
      }
    },
    getValidParentElem(elem) {
      while (!elem["previousElementSibling"] && !elem["nextElementSibling"]) {
        elem = elem.parentElement;
      }

      return elem.parentElement;
    },

    // 设置表格内滚动
    setTableScroll() {
      const { table, innerTable: comWrap, innerTableWrap: tableWrap } = this.refKeys;

      // 父级元素
      const comWrapElem = this.$refs[comWrap];
      let parentNode = this.getValidParentElem(comWrapElem); //comWrapElem.parentElement;
      // 若父元素没有设置高度 则自动设置
      if (!parentNode.style.height && !parentNode.style.minHeight) {
        parentNode.style.minHeight = `100%`;
      }

      const parentNodeHeight = parentNode.clientHeight;
      // 获取整体高度
      // const boxHeight = this.$refs[comWrap].clientHeight;
      let otherHeight = this.getOtherHeight(comWrapElem);
      // 获取内框高度
      const tableWrapHeight = this.$refs[tableWrap].clientHeight;
      // 获取表格数据行以外元素高度
      // 获取表格元素
      const tbody = this.$refs[table].$el;
      const rests = tableWrapHeight - tbody.clientHeight;
      let tableMaxHeight = parentNodeHeight - otherHeight - rests - 10;
      if (tableMaxHeight < this.minHeight) {
        tableMaxHeight = this.minHeight;
      }

      // 设置最大表格高度
      this.tableHeight = tableMaxHeight;
    },
    getOtherHeight(comElem) {
      while (!comElem["previousElementSibling"] && !comElem["nextElementSibling"]) {
        comElem = comElem.parentElement;
      }

      let margins = [],
        sibling = comElem,
        otherHeight = 0;

      while ((sibling = sibling["previousElementSibling"])) {
        otherHeight += sibling.offsetHeight;
        this.processMargin(margins, sibling);
      }

      this.processMargin(margins, comElem);

      sibling = comElem;
      while ((sibling = sibling["nextElementSibling"])) {
        otherHeight += sibling.offsetHeight;
        this.processMargin(margins, sibling);
      }

      let len = margins.length;
      let totolMargin = margins[0] + margins[len - 1];
      for (let i = 1, len = margins.length; i < len - 1; ) {
        totolMargin += Math.max(margins[i], margins[i + 1]);
        i += 2;
      }

      otherHeight += totolMargin;
      return otherHeight;
    },
    processMargin(list, elem) {
      let computedStyle = window.getComputedStyle(elem);
      list.push(+computedStyle.marginTop.replace("px", ""));
      list.push(+computedStyle.marginBottom.replace("px", ""));
    },
    exportCsv(config) {
      this.$refs[this.refKeys.table].exportCsv(config);
    },
    // 给search-bar中的搜索lable添加title
    initSearchBarLableTitle(lang) {
      const { innerTableWrap } = this.refKeys;
      const _innerTableWrap = this.$refs[innerTableWrap];
      const ivuFormItemLabel = _innerTableWrap.getElementsByClassName("ivu-form-item-label");
      const searchBar = _innerTableWrap.getElementsByClassName("search-bar")[0];

      if (lang && searchBar) {
        let enClass = "search-bar-flex-en";
        if (lang != "zh-CN") {
          this.addClass(searchBar, enClass);
        } else {
          this.removeClass(searchBar, enClass);
        }
      }
      if (ivuFormItemLabel && ivuFormItemLabel.length) {
        for (let i = 0; i < ivuFormItemLabel.length; i++) {
          let item = ivuFormItemLabel[i];
          item.setAttribute("title", item.innerText);
        }
      }
    },
    hasClass(el, className) {
      let reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return reg.test(el.className);
    },
    addClass(el, className) {
      if (this.hasClass(el, className)) {
        return;
      }

      let newClass = el.className.split(" ");
      newClass.push(className);
      el.className = newClass.join(" ");
    },
    removeClass(el, newClass) {
      var defaultClass = el.className.split(" ");
      var nClass = newClass.split(" ");
      let result = [];
      nClass.map(item => {
        result = defaultClass.filter(v => v != item);
        return item;
      });
      el.className = result.join(" ");
    }
  },
  watch: {
    lang() {
      this.getColumns();
      this.$nextTick(() => {
        this.initSearchBarLableTitle(this.lang);
      });
    },
    "config.resource": {
      handler(newVal) {
        this.resource = newVal;
        Array.isArray(this.resource) && this.loadLocal();
      },
      deep: true
    },
    config: {
      handler(newVal) {
        Object.assign(this.$data, newVal);
      },
      deep: true
    },
    tableData: {
      handler(val) {
        // tableData 数据变化的回调，用于处理一下复杂逻辑
        const { tableDataCallback } = this;
        typeof tableDataCallback === "function" && tableDataCallback(val, this);
      },
      deep: true
    }
  },
  directives: {}
};
function toLine(name) {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}
</script>
<style lang="less">
@import "./index.less";
</style>
