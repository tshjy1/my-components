<template>
  <div>
    <Modal
      class="rp-confirm"
      v-model="modalShow"
      @on-visible-change="changeVisible"
      :closable="!!option.closable"
      width="300px"
    >
      <div class="rp-confirm-content">
        <img :src="icons[option.type || 'warning']" alt="confirm icon" />
        <!-- 确认删除？ -->
        <p>{{ option.content || t("i.rp_confirmTest.confirmDelete") }}</p>
      </div>
      <div class="rp-confirm-footer" slot="footer">
        <!-- 确定 -->
        <button @click="onClickOk" class="rp-confirm--btnleft">{{ option.okText || t("i.rp_confirmTest.ok") }}</button>
        <!-- 取消 -->
        <button @click="onClickCancel" class="rp-confirm--btnright">
          {{ option.cancelText || t("i.rp_confirmTest.cancel") }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Locale from "../../mixins/locale";
export default {
  name: "rp-confirm",
  mixins: [Locale],
  data: () => ({
    modalShow: false,
    icons: {
      warning: require("./icons/warning.png"),
      error: require("./icons/error.png"),
      success: require("./icons/success.png")
    }
  }),
  props: {
    show: {
      type: Boolean,
      default: false
    },
    option: {
      type: Object,
      default: () => ({})
    },
    handler: Object
  },
  watch: {
    show: {
      handler(val) {
        this.modalShow = val;
      },
      immediate: true
    }
  },
  methods: {
    changeVisible(show) {
      const { visibleChange } = this.option;
      typeof visibleChange === "function" && visibleChange(show);
      this.onClickCancel(show);
    },
    onClickOk(event) {
      const { onOk } = this.handler;
      typeof onOk === "function" && onOk(event);
      this.modalShow = false;
    },
    onClickCancel(event) {
      const { onCancel } = this.handler;
      typeof onCancel === "function" && onCancel(event);
      this.modalShow = false;
    }
  }
};
</script>

<style lang="less">
.rp-confirm {
  .ivu-modal-content {
    border-radius: 0;
    padding: 10px;
  }
  .ivu-modal-footer {
    border-top: 0;
  }
  .ivu-modal-footer button + button {
    margin-left: 20px;
  }
  .rp-confirm-footer {
    text-align: center;
  }
  .rp-confirm-content {
    width: 100%;
    text-align: center;
    img {
      width: 90px;
      height: 90px;
    }
    p {
      font-size: 16px;
      color: #333;
    }
  }
  button {
    width: 90px;
    height: 30px;
    border: 1px solid #ff6f4b;
    cursor: pointer;
    outline: none;
  }
  &--btnleft {
    background-color: #ff6f4b;
    color: #fff;
  }
  &--btnright {
    background-color: #fff;
    color: #ff6f4b;
  }
}
</style>