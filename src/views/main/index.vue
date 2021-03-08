<template>
  <div>
    <Row>
      <Col span="8">
        <datePickerStr dateType="year" v-model="dateValue"/>
      </Col>
      <Col span="8">col-8</Col>
      <Col span="8">col-8</Col>
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
  watch: {
    dateValue(newV) {
      console.log('==========', typeof newV, newV)
    }
  }
}
</script>

<style>

</style>