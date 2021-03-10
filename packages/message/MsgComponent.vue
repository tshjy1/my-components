<template>
  <div class="msg-lab">
    <div
      :class="{
        'msg-lab_title': true,
        'success': type === 'success',
        'error':type === 'error',
        'info':type === 'info'
        }"
    >
      <span @click="changeDrop">{{item.content}}</span>
      <Icon
        @click="changeDrop"
        v-if="!dropdwon && item.more"
        type="ios-arrow-forward"
        size="18"
        class="msg-icon"
      />
      <Icon v-if="dropdwon" @click="item.closer" size="18" type="md-close" class="msg-icon" />
    </div>
    <template v-if="item.more">
      <div class="msg-lab_more" v-show="dropdwon">
        <div>请求ID：{{item.more.traceId}}</div>
        <div>错误编码：{{item.more.code}}</div>
        <div>错误信息：{{item.more.msg}}</div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'rp-msg',
  data() {
    return {
      dropdwon: false
    };
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'info'
    }
  },
  methods: {
    changeDrop() {
      if (!this.item.more) return;
      this.dropdwon = !this.dropdwon;
      typeof this.item.clearTime === 'function' && this.item.clearTime();
    }
  }
};
</script>

<style scoped lang="less">
.msg-lab {
  box-sizing: border-box;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
  width: auto;
  transition: all 0.5s;
  &_title {
    width: 300px;
    display: flex;
    justify-content: center;
    padding: 15px 30px;
    color: #fff;
    span {
      font-size: 14px;
      margin-left: 6px;
      letter-spacing: 0.22px;
      cursor: pointer;
      width: 240px;
      overflow-wrap: break-word;
      text-align: center;
    }
  }
  &_more {
    width: 300px;
    padding: 16px;
    align-items: center;
    > div {
      line-height: 28px;
      font-size: 14px;
      color: #666;
      letter-spacing: 0.22px;
      overflow-wrap: break-word;
    }
  }
}
.msg-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
}
.success {
  background-color: #1fcbae;
}
.error {
  background-color: #e23928;
}
.info {
  background-color: #fff;
  color: #333;
}
</style>