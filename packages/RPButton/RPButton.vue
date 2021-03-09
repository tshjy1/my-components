<template>
  <Button @click="clickProcess" v-bind="config">{{config.text||""}}</Button>
</template>
<script>
import Locale from "../mixins/locale";
export default {
  name: "RPButton",
  // components: {},
  mixins: [Locale],
  props: {
    /**
     * 默认关闭快捷键
     */
    isShortCut: {
      type: Boolean,
      default: false,
      required: false
    },
    controlType: {
      type: Number,
      default: 0,
      required: false
    }
  },
  data() {
    return {
      config: {},
      defaultConfig: {
        search: {
          optType: "search",
          btnType: "warning",
          size: "default",
          // icon: "ios-search",
          text: this.t("i.rp_button.search"),
          charKey: "F"
        },
        reset: {
          optType: "reset",
          // icon: "md-refresh",
          //   btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.reset"),
          charKey: "R"
        },
        create: {
          optType: "create",
          // icon: "md-add",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.create"),
          charKey: "O"
        },
        modify: {
          optType: "modify",
          // icon: "md-create",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.modify"),
          charKey: "M"
        },
        delete: {
          optType: "delete",
          // icon: "ios-trash",
          // btnType: "error",
          size: "default",
          text: this.t("i.rp_button.delete"),
          charKey: "D"
        },
        save: {
          optType: "save",
          // icon: "md-checkmark",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.save"),
          charKey: "S"
        },
        setup: {
          optType: "setup",
          // icon: "md-settings",
          // btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.setting"),
          charKey: "E"
        },
        confirm: {
          optType: "confirm",
          // icon: "md-checkmark",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.confirm"),
          charKey: "I"
        },
        enable: {
          optType: "enable",
          // icon: "ios-unlock",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.enable"),
          charKey: "U"
        },
        disable: {
          optType: "disable",
          // icon: "md-lock",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.disable"),
          charKey: "N"
        },
        cancel: {
          optType: "cancel",
          icon: "md-close",
          // btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.cancel"),
          charKey: "Q"
        },
        common: {
          optType: "common",
          icon: "",
          btnType: "warning",
          size: "default",
          text: this.t("i.rp_button.button")
        }
      },
      isDelaying: false
    };
  },
  computed: {
    hasHandlerProp() {
      return typeof this.config.handler === "function";
    }
  },
  created() {
    this.getConfig(this.$attrs);
    if (this.isShortCut) {
      this.initListener();
    }
  },
  // beforeMount: function() {},
  // mounted: function() {},
  // beforeDestroy: function() {},
  destroyed: function () {
    // 备注 如果keepalive缓存了组件 需要额外在activited与deactivated处理 绑定与解绑
    if (this.isShortCut) {
      document.removeEventListener("keydown", this.processKeyDown);
    }
  },
  methods: {
    clickProcess(e) {
      // 点击添加按钮后失去焦点
      if (this.config.optType == "create") {
        this.$el.blur();
      }

      if (this.isDelaying) {
        // 不响应
        return;
      } else {
        // 设置延时响应标志
        this.isDelaying = true;
        let clickDelayTime = 1000;
        if (this.config.clickDelayTime != undefined && typeof this.config.clickDelayTime == "number") {
          clickDelayTime = this.config.clickDelayTime;
        }
        setTimeout(() => {
          this.isDelaying = false;
        }, clickDelayTime);

        if (this.hasHandlerProp) {
          this.config.handler();
        } else {
          this.$emit("click", e);
        }
      }
    },
    getConfig(val) {
      let config = this.defaultConfig[val.optType || "common"];
      this.config = { ...config, ...val };
      this.config.type = this.config.btnType;
    },
    getKeyCode(charKey) {
      return charKey.toUpperCase().charCodeAt(0);
    },
    processKeyDown(e) {
      let keyCode = e.keyCode || e.which || e.charCode;
      let ctrlKey = e.ctrlKey || e.metaKey;
      let shiftKey = e.shiftKey;
      let altKey = e.altKey;
      let charKeyCode = this.getKeyCode(this.config.charKey);
      let _controlType = this.controlType;
      if (
        (_controlType == 0 && ctrlKey && keyCode == charKeyCode) ||
        (_controlType == 1 && altKey && keyCode == charKeyCode) ||
        (_controlType == 2 && ctrlKey && altKey && keyCode == charKeyCode) ||
        (_controlType == 3 && ctrlKey && shiftKey && keyCode == charKeyCode) ||
        (_controlType == 4 && altKey && shiftKey && keyCode == charKeyCode) ||
        (_controlType == 5 && keyCode == 13)
      ) {
        this.clickProcess();
        e.preventDefault();
        return false;
      }

      return true;
    },
    initListener() {
      document.addEventListener("keydown", this.processKeyDown);
    }
  },
  watch: {
    $attrs(val) {
      this.getConfig(val);
    }
  }
  // directives: {}
};
</script>
