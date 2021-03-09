<!--
 * @Author: Jayken
 * @Email: jaykenxie@outlook.com
 * @Date: 2019-08-12 10:31:49
 -->
<template>
  <div>
    <Alert>提示：请以拖拽的方式对列序进行置换调整，多选列、序号列、展开列不可被置换</Alert>
    <Table
      ref="sortColumnsTable"
      :data="tableColumns"
      :columns="columns"
      :draggable="true"
      @on-drag-drop="dragColumns"
    ></Table>
  </div>
</template>
<script>
export default {
  props: {
    deColumns: {
      type: Array,
      default() {
        return [];
      }
    },
    isSortColumnsKey: {
      type: String,
      default() {
        return "";
      }
    }
  },
  data() {
    return {
      tableColumns: [],
      columns: [
        {
          title: "排序号",
          type: "index",
          align: "center"
        },
        {
          title: "列名",
          key: "title",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                attrs: {
                  class: "ivu-table-cell ivu-table-cell-ellipsis",
                  title: params.row.title ? params.row.title : "/"
                }
              },
              params.row.title ? params.row.title : "/"
            );
          }
        },
        {
          title: "列类型",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                attrs: {
                  class: "ivu-table-cell ivu-table-cell-ellipsis",
                  title: params.row.type ? params.row.type : "normal"
                }
              },
              params.row.type ? params.row.type : "normal"
            );
          }
        }
      ]
    };
  },
  computed: {},
  created: function() {
    this.tableColumns = this.deColumns;
    this.$emit("SetTitle", "调整列序");
    this.$emit("SetPageWidth", 700);
    this.$emit("SetPageActions", [
      {
        text: "保存",
        theme: "primary",
        handle: () => {
          this.save();
        }
      },
      {
        text: "关闭",
        theme: "primary",
        handle: () => {
          this.$emit("Close", false);
        }
      }
    ]);
  },
  methods: {
    save() {
      let storageTableData = [];
      this.$refs.sortColumnsTable.data.forEach((item, index) => {
        storageTableData.push({
          title: item.title ? item.title : "",
          type: item.type ? item.type : "",
          sortNum: index
        });
      });
      localStorage.setItem(this.isSortColumnsKey, JSON.stringify(storageTableData));
      this.$emit("Close", true);
    },
    dragColumns(index1, index2) {
      let tableData = this.$refs.sortColumnsTable.data;
      if (
        (!tableData[index1].type || tableData[index1].type == "html") &&
        (!tableData[index2].type || tableData[index2].type == "html")
      ) {
        let temp = tableData[index1];
        tableData[index1] = tableData[index2];
        tableData[index2] = temp;
        this.tableColumns = [].concat(tableData);
      } else {
        this.$message.warning("多选列、序号列、展开列不可被置换");
      }
    }
  }
};
</script>
<style scoped>
div {
  overflow-y: hidden;
}
</style>