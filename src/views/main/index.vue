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
      langKey: localStorage.getItem('lang') || 'LANG-CN'
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
    .ivu-menu-submenu-title {
      padding: 14px 15px;
      display: flex;
    }
    .ivu-menu-item {
      padding-left: 0!important;
    }
    .ivu-menu-vertical .ivu-menu-submenu-title-icon {
      font-size: 20px;
      right: 15px;
    }
  }

  .main_center {
    position: absolute;
    top: 60px;
    left: 210px;
    width: calc(100% - 220px);
    overflow: auto;
    background-color: #fff;
  }
  .main_footer {
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 50px;
    width: 100%;
    background-color: @mainColor;
  }
}
</style>
