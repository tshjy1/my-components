import Vue from "vue";
import OriginSidelip from "./index.vue";
import { getStyle } from "../../utils/assist";
class Sidelip {
  constructor(component = {}, option = {}, callback, hostCom) {
    let self = this;
    this.callback = callback;
    option.on = option.on || {};
    option.on = {
      Close: data => {
        this.close(data);
      },
      SetPageActions: data => {
        this.setPageActions(data);
      },
      SetActionsState: param => {
        this.setActionsState(param.btn, param.state);
      },
      SetTitle: val => {
        this.setTitle(val);
      },
      SetCloseHook: fn => {
        this.instance.closeHook = fn;
      }
    };

    this.instance = new Vue({
      i18n: $app.$i18n,
      el: document.createElement("div"),
      render(createElement) {
        return createElement(
          OriginSidelip,
          {
            props: {
              full: option.full,
              isNav: option.isNav,
              closeHook: self.closeHook.bind(self)
            },
            on: {
              Close: data => {
                self.close(data);
              }
            }
          },
          [createElement(component, option, this.$slots.default)]
        );
      }
    });

    this.instance.closeHook = () => Promise.resolve(true);
    let container;
    if (option.full) {
      container = document.querySelector("#main") || document.body;
    } else {
      container = document.querySelector(".single-page") || hostCom.$el.parentElement;
      const containerPosition = getStyle(container, "positon");
      if (containerPosition === "static" || !containerPosition) {
        container.style.position = "relative";
        containerPosition &&
          $channel.$once("ResetContainerStyle", () => {
            container.style.position = containerPosition;
          });
      }
    }

    const scrollTop = container.scrollTop;
    this.containerInfo = {
      container,
      scrollTop
    };
    container.scrollTop = 0;
    container.style.overflowY = "hidden";

    container.appendChild(this.instance.$el);
    // $instanceSidelipArray.push(this);
    $channel.$once("RouterChangeBefore", () => {
      this.close();
    });
  }
  closeHook() {
    return this.instance.closeHook();
  }
  close(data) {
    // if (this.instance.$children.length < 1) {
    //   return;
    // }
    const { container, scrollTop } = this.containerInfo;
    container.scrollTop = scrollTop;
    container.style.overflowY = "auto";

    setTimeout(() => {
      const child = this.instance && this.instance.$children[0];
      child && child.$destroy && child.$destroy();
      if (this.callback) {
        this.callback(data);
        this.callback = null;
      }

      $channel.$emit("ResetContainerStyle");
      // $once 触发之后，监听器就会被移除。
      // $channel.$off("RouterChangeBefore");
      this.instance = null;
      // $instanceSidelipArray.pop();
    }, 100);
  }
  setPageActions(data) {
    this.instance.$children[0].setPageActions(data);
  }
  setActionsState(action, state) {
    this.instance.$children[0].setActionsState(action, state);
  }
  setTitle(val) {
    this.instance.$children[0].setTitle(val);
  }
}
// window.$instanceSidelipArray = [];
export default Sidelip;
// (component, option, sidelipOption) => {
//   $instanceSidelipArray.push(new Sidelip(component, option, sidelipOption));
//   return $instanceSidelipArray[$instanceSidelipArray.length - 1];
// };
