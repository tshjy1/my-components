<template>
  <!-- 区域自适应 -->
  <div class="self-adaption-wrap">
    <div class="no-search-flex" v-if="onSearch">
      <div class="slot-left">
        <slot name="adaption-left"></slot>
      </div>
      <div class="slot-right">
        <slot name="adaption-right"></slot>
      </div>
    </div>
    <div ref="searchBarEle" class="self-adaption-flex search-flex-w86" v-else>
      <div class="search-bar-wrap">
        <slot name="adaption-bar"></slot>

        <!-- 展开\收起 -->
        <div class="option-up-down" @click="handleUpDownOption($event)" state>
          <div class="mask"></div>
          <span class="up" v-if="!upDownState">
            {{ t("i.re_other.open") }}
            <Icon type="ios-arrow-down" />
          </span>
          <span class="down" v-else>
            {{ t("i.re_other.retract") }}
            <Icon type="ios-arrow-up" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Locale from "@/mixins/locale";
import debounce from "lodash.debounce";

export default {
  name: "SelfAdaption",
  mixins: [Locale],
  data() {
    return {
      upDownState: false // 状态，true为展开，false为收起
    };
  },
  props: {
    onSearch: {
      type: String,
      default() {
        return "";
      }
    }
  },
  computed: {
    lang() {
      let _store = this.$store || window.$store;
      return _store && _store.state && _store.state["tsj-components"].lang;
    }
  },
  watch: {
    lang() {
      this.initSearchBar();
    }
  },
  mounted() {
    this.$nextTick(() => {
      let _self = this;
      _self.initSearchBar();
      _self._initSearchBar = debounce(_self.initSearchBar, 100);
      window.addEventListener("resize", _self._initSearchBar);
    });
  },
  destroyed() {
    window.removeEventListener("resize", this._initSearchBar);
  },
  // 页面缓存：取消监听
  deactivated() {
    window.removeEventListener("resize", this._initSearchBar);
  },
  // 页面缓存重新添加监听
  activated() {
    this.$nextTick(() => {
      this.initSearchBar();
      window.addEventListener("resize", this._initSearchBar);
    });
  },
  methods: {
    // 展开收起操作
    handleUpDownOption(el) {
      let _thisEle = el.target.parentElement;
      this.upDownState ? _thisEle.setAttribute("state", "") : _thisEle.setAttribute("state", "1");
      this.upDownState = !this.upDownState;

      this.initSearchBar();
      $channel.$emit("ChangeSelfAdaptionStatus");
    },
    initSearchBar() {
      // 计算搜索区域
      try {
        let searchBarEle = this.$refs.searchBarEle;
        if (!searchBarEle) {
          return;
        }

        const w1080 = 1080;
        const w840 = 840;
        const w450 = 450;
        const w300 = 300;
        const ivuLt300 = "ivu-lt300";

        //按钮区域
        let searchBtnEle = searchBarEle.getElementsByClassName("search-solt-btn");
        //包括按钮的所有表单元素
        let searchBarItem = searchBarEle.getElementsByClassName("ivu-form-item");
        //整个组件外围元素
        let searchBarWrap = searchBarEle.getElementsByClassName("search-bar-wrap")[0];

        let formItemCount = searchBarItem.length;
        //外围父元素宽度
        let contentWidth = searchBarEle.offsetWidth;

        // 如果搜索插槽没有，则隐藏该插槽，避免div占位
        if (searchBarWrap && searchBarWrap.offsetHeight == 0) {
          searchBarWrap.parentElement.style.display = "none";
        }

        let colNumber = 4;
        if (contentWidth >= w840 && contentWidth <= w1080) {
          colNumber = 3;
        } else if (contentWidth >= w450 && contentWidth < w840) {
          colNumber = 2;
        } else if (contentWidth < w450) {
          colNumber = 1;
        }

        let validColNumber; //折叠时超过一列就减一,否则不减, 已达到按钮显示在第一行
        if (colNumber > 1) {
          validColNumber = colNumber - 1;
        } else {
          validColNumber = colNumber;
        }

        let hideNumber = 0;
        for (let _index = 0, len = formItemCount; _index < len; _index++) {
          let item = searchBarItem[_index];
          this.setTitle(item);

          if (contentWidth <= w300) {
            this.addClass(item, ivuLt300);
          } else {
            this.removeClass(item, ivuLt300);
            item.style.width = 100 / colNumber + "%";
          }

          // 存在按钮
          if (searchBtnEle.length) {
            let notBtnItemsCount = formItemCount - 1;
            //展开时
            if (this.upDownState) {
              if (_index >= validColNumber && _index < notBtnItemsCount) {
                item.style.display = "flex";
              }
              //折叠时
            } else {
              if (_index >= validColNumber && _index < notBtnItemsCount) {
                item.style.display = "none";
                hideNumber++;
              } else {
                item.style.display = "flex";
              }
            }
          }
        }

        let flex86 = "search-flex-w86";
        let flexSingle = "self-adaption-flex-single";

        // 没有隐藏子项，并且当前可显示数量大于或等于子项的长度, 则让搜索标题按不定宽显示
        this.removeClass(searchBarWrap, "search-bar-option");
        this.removeClass(searchBarEle, flexSingle);

        //无隐藏元素时
        if (hideNumber == 0 && colNumber >= formItemCount) {
          this.removeClass(searchBarEle, flex86);
        } else {
          this.addClass(searchBarEle, flex86);
          // 必须当按钮存在时才会出现操作展开、收起
          if (searchBtnEle.length) {
            this.addClass(searchBarWrap, "search-bar-option");
          }
        }

        // 只有在容器能容纳搜索子项和按钮项并且在一行显示时，按钮区域内容才居左显示
        if (hideNumber == 0 && colNumber >= formItemCount) {
          this.addClass(searchBarEle, flexSingle);
        }

        // 如果是英文则子项的表单不左对齐，对子项中只做最大宽度限制为 子项宽度的 70%
        let language = $store.state["tsj-components"].lang;
        let lang_en = "search-flex-en";
        switch (language) {
          case "en-US":
            this.addClass(searchBarEle, lang_en);
            this.removeClass(searchBarEle, flex86);
            break;
          default:
            this.removeClass(searchBarEle, lang_en);
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    setTitle(item) {
      // 非按钮元素
      if (!this.hasClass(item, "search-solt-btn")) {
        let itemLabelEle = item.getElementsByClassName("ivu-form-item-label")[0];
        if (itemLabelEle && !itemLabelEle.getAttribute("title")) {
          itemLabelEle.setAttribute("title", itemLabelEle.innerText);
        }
      }
    },
    hasClass(el, className) {
      let reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return reg.test(el.className);
    },
    addClass(el, className) {
      if (this.hasClass(el, className)) {
        return;
      }

      let newClass = el.className.split(" ");
      newClass.push(className);
      el.className = newClass.join(" ");
    },
    removeClass(el, newClass) {
      var defaultClass = el.className.split(" ");
      var nClass = newClass.split(" ");
      let result = [];
      nClass.map(item => {
        result = defaultClass.filter(v => v != item);
        return item;
      });
      el.className = result.join(" ");
    }
  }
};
</script>

<style lang="less">
// 搜索区域
.self-adaption-wrap {
  .no-search-flex {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .ivu-btn-warning {
      background-color: #ff6f4b;
      border-color: #ff6f4b;
      border-radius: 0;
    }

    .slot-left,
    .slot-right {
      display: flex;
      flex-wrap: wrap;
      .slot-item {
        padding: 0 5px;
        margin-bottom: 10px;
      }
    }
    .slot-right {
      flex: 1;
      justify-content: flex-end;
    }
  }
  .self-adaption-flex {
    min-width: 232px;
    padding: 0 5px 5px;

    .ivu-form-inline {
      display: flex;
      flex-flow: row wrap;
      padding: 0 !important;

      .ivu-form-item {
        margin-right: 0;
        padding: 0 5px;
        display: flex;
        align-items: center;

        .ivu-form-item-label {
          max-width: 50%;
          margin-right: 10px;
          text-align: right;
          display: flex;
          overflow: hidden;
          white-space: nowrap;
          vertical-align: middle;
          text-overflow: ellipsis;
          padding: 0;
          height: 100%;
          align-items: center;
          justify-content: flex-end;
        }

        .ivu-form-item-content {
          flex: 1 1;
          float: none;
          width: auto !important;
        }
        .search-form-select {
          width: 100%;
        }
      }

      .ivu-lt300 {
        // display: block!important;
        justify-content: flex-start;
        flex-direction: column;
        align-items: flex-start;
        width: 100% !important;
        .ivu-form-item-label {
          min-width: auto;
          width: 100% !important;
          padding-bottom: 8px !important;
          text-align: left;
          max-width: 100%;
          line-height: normal !important;
          justify-content: flex-start;
        }
        .ivu-form-item-content {
          width: 100% !important;
        }
      }

      // 搜索按钮
      .search-solt-btn {
        display: flex;
        justify-content: flex-end;
        text-align: right;
        flex-grow: 1;
        .ivu-form-item-content {
          display: flex;
          justify-content: flex-end;
          text-align: right;

          .ivu-btn-warning {
            padding: 4px 23px;
            background-color: #ff6f4b;
            border-color: #ff6f4b;
            border-radius: 0;
          }
          .ivu-btn-default {
            margin-left: 10px;
            background-color: #fff;
            color: #ff6f4b;
          }
        }
      }
    }

    .search-bar-wrap {
      .option-up-down {
        display: none;
      }
    }

    .search-bar-option {
      position: relative;
      .ivu-form-inline {
        .search-solt-btn {
          padding-right: 57px;
        }
      }
      .option-up-down {
        cursor: pointer;
        display: inline-block;
        position: absolute;
        right: 0;
        bottom: 0;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        color: #ff6f4b;
        .ivu-icon {
          font-size: 16px;
        }
        .mask {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 2;
        }
      }
    }
  }

  // 当搜索条件子项和按钮能在一行容纳时，按钮区域按钮居左展示
  .self-adaption-flex-single {
    .ivu-form-inline {
      // 搜索按钮
      .search-solt-btn {
        justify-content: flex-start;
        text-align: left;
        flex-grow: 1;
        .ivu-form-item-content {
          justify-content: flex-start;
          text-align: left;

          .ivu-btn {
            margin-left: 0;
            margin-right: 10px;
          }
        }
      }
    }
  }

  // 英文规则下, 搜索框前的标题只设最多宽度，放在输入框被压缩看不见
  .search-flex-en {
    .search-bar-option {
      .search-solt-btn {
        padding-right: 72px !important;
      }
    }
    .ivu-form-inline {
      .ivu-form-item {
        .ivu-form-item-label {
          min-width: auto;
          max-width: 70%;
          width: auto;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          white-space: normal !important;
          line-height: initial;
          height: auto;
        }
        // 修改在英文情况下，表单是下拉框时，lable中的文案显示不全问题
        .ivu-select-selection {
          position: relative;
          & > div {
            position: absolute;
            left: 0;
            right: 0;
          }
        }
      }
    }
  }
  // 多行，并且有title有超出界限，则设置固定宽度中文保持6个汉字的宽度
  .search-flex-w86 {
    .ivu-form-inline {
      .ivu-form-item {
        .ivu-form-item-label {
          min-width: 80px;
          width: 106px;
        }
      }
    }
  }
}
</style>
