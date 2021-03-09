<template>
  <transition :name="'sidelip-down'" @after-leave="afterLeave" @after-enter="afterEnter">
    <div :class="{ 'sidelip-warp': !full, 'sidelip-warp-full': full }" v-if="state > -99" :style="style">
      <div class="view-box-content">
        <div class="sidelip-bar-wrapper" v-if="isNav">
          <div class="sidelip-bar-info">
            <Button type="default" size="small" icon="ios-undo" @click="hide"></Button>
            <span>{{ title }}</span>
          </div>
          <div class="sidelip-bar-buttons">
            <Button
              size="small"
              @click="item.handle()"
              :loading="actionState[item.action]"
              v-for="(item, index) in actions"
              :key="index"
              :type="item.theme"
              :icon="item.icon"
              >{{ item.text }}</Button
            >
          </div>
        </div>
        <div class="sidelip-con">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: "sidelip",
  components: {},
  props: {
    full: {
      type: Boolean,
      default() {
        return false;
      }
    },
    isNav: {
      type: Boolean,
      default() {
        return true;
      }
    },
    closeHook: {
      type: Function,
      default() {
        return Promise.resolve(true);
      }
    }
    // hostCom: Object
  },
  data() {
    return {
      display: false,
      state: -99,
      actions: [],
      actionState: {},
      title: "",
      style: {},
      width: "",
      height: ""
    };
  },
  computed: {},
  created: function () {
    // this.resize();
    // $channel.$on("ToggleSidebarMenu", () => {
    //   this.$nextTick(() => {
    //     this.resize();
    //   });
    // });
  },
  beforeMount: function () {},
  mounted: function () {
    this.state = -1;
    // window.onresize = () => {
    //   this.resize();
    // };
  },
  beforeDestroy: function () {},
  destroyed: function () {
    // window.onresize = null;
    this.$emit("Close");
    this.$el.remove();
    // document.querySelector(".single-page").removeChild(this.$el);
  },
  methods: {
    hide() {
      this.closeHook().then(
        res => {
          if (res) {
            this.state = -99;
          }
        },
        () => {}
      );
    },
    afterLeave() {
      this.$destroy();
    },
    afterEnter() {
      this.state = 0;
    },
    setPageActions(data) {
      this.actions = data;
      for (let a of data) {
        if (a.action) {
          this.$set(this.actionState, a.action, false);
        }
      }
    },
    setActionsState(action, payload) {
      this.actionState[action] = payload;
    },
    setTitle(val) {
      this.title = val;
    }
    // resize() {
    //   if (this.full) {
    //     this.style.width = "100%";
    //   } else {
    //     let menuElem = document.querySelector(".sidebar-menu-con");
    //     let singlePageElem = document.querySelector(".single-page");
    //     if (menuElem && singlePageElem) {
    //       // 菜单区域宽度
    //       let menuWidth = menuElem.offsetWidth;
    //       // 工作区域左边距
    //       let offsetLeft = singlePageElem.offsetLeft;
    //       let borderWidth = 1;

    //       this.style = {
    //         width: `${document.body.offsetWidth -
    //           menuWidth -
    //           (offsetLeft + borderWidth) * 2}px`
    //       };
    //     } else {
    //       this.style = {
    //         width: `${this.hostCom.$el.offsetWidth}px`
    //       };
    //     }
    //   }
    // }
  },
  directives: {}
};
</script>
