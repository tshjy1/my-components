<template>
  <div class="rool-tool">
    <!-- <template v-if="data.length < 3"> -->
    <a
      @click="onClick(item.handle, item.hidden)"
      class="t-action-btn"
      :class="getClass(item)"
      v-for="(item, index) in data"
      :key="index"
    >
      <Tooltip :content="item.text" placement="top" :transfer="true" v-if="item.type == 'icon' && !item.loading">
        <Icon :type="item.icon"></Icon>
      </Tooltip>
      <label v-else-if="item.type != 'icon' && !item.loading" style="cursor: pointer">{{ item.text }}</label>
      <Spin v-if="item.loading"></Spin>
    </a>
    <!-- </template> -->
    <!-- <template v-if="data.length >= 3">
      <Dropdown @on-click="clickDropdown" :transfer="true">
        <a href="javascript:void(0)">
          <Icon :size="26" type="ios-more"></Icon>
        </a>
        <DropdownMenu slot="list">
          <template v-for="(item, index) in data">
            <DropdownItem :disabled="item.disabled" :key="item.index" :name="index + ''">
              <Icon :type="item.icon"></Icon>
              {{item.text}}
            </DropdownItem>
          </template>
        </DropdownMenu>
      </Dropdown>
    </template> -->
  </div>
</template>
<script>
export default {
  name: "RowTools",
  components: {},
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {};
  },
  computed: {},
  created: function () {},
  beforeMount: function () {},
  mounted: function () {},
  beforeDestroy: function () {},
  destroyed: function () {},
  methods: {
    getClass(item) {
      return { "is-hidden": item.hidden, "icon-active": item.active };
    },
    handle() {},
    clickDropdown(index) {
      this.data[index].handle();
    },
    onClick(handle, hidden) {
      if (hidden) {
        return;
      }
      handle();
    }
  },
  watch: {},
  directives: {}
};
</script>
<style lang="less">
.rool-tool {
  // display: flex;
  .ivu-spin {
    float: left;
  }
  .t-action-btn {
    &:not(:last-child) {
      margin-right: 5px;
    }
    i {
      font-size: 20px;
      color: #828282;
    }
    & + strong {
      position: relative;
      top: -5px;
      left: 5px;
    }
  }
  a {
    color: #515a6e;
  }
  .is-hidden {
    // visibility: hidden;
    display: none;
  }

  .icon-active .ivu-icon {
    color: #57d0bb;
  }
}
</style>
