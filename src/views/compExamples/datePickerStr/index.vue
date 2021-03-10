<template>
  <div>
    <Row>
      <Col span="8">
        <datePickerStr dateType="year" v-model="dateValue"/>
      </Col>
      <Col span="8">{{$t('module.test.test1')}}: {{dateValue}}</Col>
    </Row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dateValue: ''
    }
  },
}
</script>

<style>

</style>