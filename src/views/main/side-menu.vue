<template>
  <div>
    <Menu theme="dark" accordion width="100%">
      <template v-for="item in menulist" >
        <Submenu v-if="item.children && item.children.length > 0" :key="item.menuKey" :name="item.menuKey">
          <template slot="title">
            <Icon class="menu_title_icon" :type="item.icon || 'ios-list-box'" />
            <span>{{item.name}}</span>
          </template>
          <side-menu :menulist="item.children"/>
        </Submenu>
        <MenuItem v-else :name="item.menuKey" :to="item.path" :key="item.name">
          <Icon :type="item.icon || 'md-arrow-dropright'" />
          {{item.name}}
        </MenuItem>
      </template>
    </Menu>
  </div>
</template>

<script>
export default {
  name: 'side-menu',
  props: {
    menulist: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="less">
.menu_title_icon {
  float: left;
  font-size: 20px;
}
</style>
