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
      <Col :span="7">
        <div class="avatar_box">
          <!-- 多语言选择 -->
          <!-- 头像登录信息、个人中心 -->
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {}
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
}
</style>
