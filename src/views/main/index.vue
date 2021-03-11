<template>
  <div id="main_content" :style="{ height: `${mainHeightBox}px` }">
    <div class="main_nav">
      <mainHeader v-model="langKey"/>
    </div>
    <div class="main_sidlider_menu">
      <sideMenu :menulist="menuList"/>
    </div>
    <div class="main_center">
      <div class="main_content_show">
        <router-view />
      </div>
    </div>
    <div class="main_footer">
      Copyright © {{$t('common.user')}}
    </div>
  </div>
</template>

<script>
import mainHeader from './main-header'
import sideMenu from './side-menu'
import menuConfig from '@/utils/menu.json'

export default {
  components: {
    mainHeader,
    sideMenu
  },
  data() {
    return {
      mainHeightBox: document.documentElement.clientHeight,
      langKey: localStorage.getItem('lang') || sessionStorage.getItem('lang') || 'LANG-CN'
    }
  },
  computed: {
    menuList() {
      return menuConfig[this.langKey]
    }
  },
  watch: {
    langKey(newV) {
      this.$i18n.locale = newV;
      sessionStorage.setItem('lang', newV)
    }
  }
}
</script>

<style lang="less">
#main_content {
  height: 100%;
  position: relative;
  background-color: #f0f0f0;
  .main_nav {
    position: absolute;
    top: 0;
    height: 50px;
    width: 100%;
    background-color: white;
    border-bottom: .5px solid #dcdee2;
  }

  .main_sidlider_menu,
  .main_center {
    height: calc(100% - 120px);
  }

  .main_sidlider_menu {
    position: absolute;
    top: 60px;
    left: 0;
    width: 200px;
    background-color: #515a6e;
    border: .5px solid #515a6e;
    border-left: none;
    .ivu-menu-submenu-title {
      padding: 10px 10px;
      display: flex;
      span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 22px;
      }
    }
    .ivu-menu-item {
      text-align: left;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 10px 10px;
    }
    .ivu-menu-submenu .ivu-menu-item {
      padding-left: 36px!important;
    }
    .ivu-menu-vertical .ivu-menu-submenu-title-icon {
      font-size: 20px;
      right: 0px;
    }
  }

  .main_center {
    position: absolute;
    top: 60px;
    left: 210px;
    width: calc(100% - 220px);
    overflow: auto;
    background-color: #fff;
    padding: 10px;
    border: .5px solid #dcdee2;
  }
  .main_footer {
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 50px;
    width: 100%;
    background-color: @mainColor;
    border-top: .5px solid #dcdee2;
    text-align: center;
    font-size: 12px;
    color: gray;
    line-height: 50px;
  }
}
</style>
