import MsgComponent from './MsgComponent.vue';
import methods from './methods';
import Vue from 'vue';

class Message {
  constructor(closes) {
    const msgBox = document.createElement('div');
    msgBox.setAttribute('class', 'msg-box');
    this.msgBox = msgBox;
    document.body.appendChild(msgBox);
    this.closes = closes;
  }
  getComponent(props) {
    const Instance = new Vue({
      i18n: window.$app.$i18n,
      render(h) {
        return h(MsgComponent, {
          props
        });
      }
    });
    return Instance.$mount();
  }
  append(type = 'info', item) {
    item.closer = closer;
    item.clearTime = clearTime;

    const { removeNode, msgBox, closes, getComponent } = this;

    const component = getComponent({ type, item });

    let timer = null;

    const { duration = 3, onClose } = item;
    function closer() {
      // 移除msg节点
      removeNode(msgBox, component.$el);
      clearTimeout(timer);
      typeof onClose === 'function' && onClose();
      // 删除掉closes 记录的closer
      closes.forEach((fn, i) => {
        if (fn === closer) {
          closes.splice(i, 1);
        }
      });
    }
    // 当路由发生变化关闭且删除事件
    const vm = this;
    function clearTime() {
      clearTimeout(timer);
      vm.closes.push(closer);
    }
    // 添加到弹窗通道
    msgBox.appendChild(component.$el);
    // 计时关闭
    timer = setTimeout(closer, duration * 1000);
  }
  removeNode(msgBox, child) {
    msgBox.removeChild(child);
  }
}

export default (function() {
  let closes = [];
  const instance = new Message(closes);
  function openMessage(type, opt) {
    //TD: 出现message框就认为不应显示loading
    // window.$channel.$emit('HideAllLoading');
    const _opt = typeof opt === 'string' ? { content: opt } : opt;
    instance.append(type, _opt);
  }
  // 添加方法
  methods(openMessage, closes);
  return openMessage;
})();
