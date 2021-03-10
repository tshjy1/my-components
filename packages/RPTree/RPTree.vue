<template>
  <Tree
    ref="tree"
    v-bind="$attrs"
    @on-check-change="_onCheckChange"
    @on-select-change="_onSelectChange"
    @on-toggle-expand="_onToggleExpand"
  ></Tree>
</template>
<script>
export default {
  name: 'RpTree',
  data() {
    return {};
  },
  methods: {
    _onCheckChange() {
      let notes = this.getCheckedAndIndeterminateNodes();
      this.$emit('on-check-change', notes);
    },
    _onSelectChange(nodes) {
      this.$emit('on-select-change', nodes);
    },
    _onToggleExpand(node) {
      this.$emit('on-toggle-expand', node);
    },
    getCheckedAndIndeterminateNodes() {
      /* public API */
      /* It will be created by mounted life hook */
    },
    getCheckedNodes() {
      /* public API */
      return this.getCheckedAndIndeterminateNodes();
    },
    getSelectedNodes() {
      /* public API */
      return this.tree.getSelectedNodes();
    },
  },
  mounted() {
    this.tree = this.$refs.tree;
    // 以下方法为了兼容view-design 2.x 和 3.x
    this.getCheckedAndIndeterminateNodes =
      this.tree.getCheckedAndIndeterminateNodes ||
      (() =>
        this.tree.flatState
          .filter((obj) => obj.node.checked || obj.node.indeterminate)
          .map((obj) => obj.node));
  },
};
</script>



