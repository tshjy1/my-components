<template>
  <div>
    <Form :v-model="modelForm" :label-width="120">
      <Row>
        <Col span="8">
          <Form-item prop="time" :label="$t('module.compExamples.dateType')">
            <Select v-model="dateType" style="width:200px">
                <Option v-for="item in dateList" :value="item.value" :key="item.value">{{ item.value }}</Option>
            </Select>
          </Form-item>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <Form-item prop="time" :label="$t('module.compExamples.dateValue')">
            <datePickerStr :dateType="dateType" v-model="modelForm.dateValue"/>
          </Form-item>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <Form-item prop="time" :label="$t('module.compExamples.test')">
            <Input v-model="modelForm.dateValue" disabled/>
          </Form-item>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dateType: 'year',
      modelForm: {
        dateValue: ''
      },
      dateList: [
        {
          value: 'year'
        },
        {
          value: 'month'
        },
        {
          value: 'date'
        },
        {
          value: 'datetime'
        }
      ]
    }
  }
}
</script>

<style>

</style>