<template>
  <div class="header-box">
    <Row>
      <Col :span="5">
        <div class="logo-box">
          <img width="110px" height="50px" src="../../assets/logo.png" >
        </div>
      </Col>
      <Col :span="12">
        <!-- 暂定 -->
      </Col>
      <Col :span="7" class="LandA_box">
        <div class="lang_box">
          <Select transfer v-model="langKey">
            <Option v-for="item in langList" :value="item.key" :key="item.key">{{ item.value }}</Option>
          </Select>
        </div>
        <!-- 头像、个人中心 -->
        <div class="avatar_box">
          <Avatar :src="avatarURL"></Avatar>
          <span>{{$t('common.user')}}</span>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import { langList } from '@/const'
import avatarURL from '../../assets/avatar.jpg'

export default {
  props: {
    value: {
      type: String,
      default() {
        return 'LANG-CN'
      }
    }
  },
  data() {
    return {
      avatarURL,
      langList,
      langKey: this.value
    }
  },
  watch: {
    langKey(newV) {
      this.$emit('input', newV)
    }
  }
}
</script>

<style lang="less">
.header-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ivu-row, .ivu-col {
    height: 100%;
  }
  .logo-box {
    display: flex;
    flex-direction: row;
    img {
      margin: 0 10px;
    }
  }
  .LandA_box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    cursor: pointer;
  }
  .lang_box {
    width: 60%;
    min-width: 100px;
    margin: 0 5px;
  }
  .avatar_box {
    width: 20%;
    min-width: 100px;
    margin: 0 5px;
    overflow:hidden; //超出的文本隐藏
    text-overflow:ellipsis; //溢出用省略号显示
    white-space:nowrap; //溢出不换行 （只显示一行）
  }
}
</style>
