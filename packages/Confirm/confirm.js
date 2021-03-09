import ConfirmComponent from "./index.vue";
import Vue from "vue";

function confirm(option = {}) {
  return new Promise((onOk, onCancel) => {
    const Instance = new Vue({
      i18n: $app.$i18n,
      render(h) {
        return h(ConfirmComponent, {
          props: { show: true, option, handler: { onOk, onCancel } }
        });
      }
    });
    Instance.$mount();
  });
}

`error,success,warning`.split(",").forEach(type => {
  confirm[type] = function(opt = {}) {
    const _opt = typeof opt === "string" ? { content: opt } : opt;
    return confirm(Object.assign(_opt, { type }));
  };
});
export default confirm;
