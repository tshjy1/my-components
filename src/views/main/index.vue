<template>
  <div>
    <Row>
      <Col span="8">
        <datePickerStr dateType="year" v-model="dateValue"/>
      </Col>
      <Col span="8">{{$t('module.test.test1')}}: {{dateValue}}</Col>
    </Row>
    <div style="width: 800px;height: 600px;border: 1px solid green;margin: 20px auto;">
      <keep-alive :include="[]">
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dateValue: ''
    }
  },
  created() {
  },
  methods: {
    
  }
}
</script>

<style>

</style>