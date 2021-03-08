<template>
  <DatePicker
    :type="dateType"
    v-model="roughPeriod"
    style="width: 100%"
    @on-change="changeValue"
    :clearable="false"
    :disabled="config.disabled"
  ></DatePicker>
</template>
<script>
import { formatDate } from '../const'

export default {
  name: 'datePickerStr',
  props: {
    value: String,
    config: {
      type: Object,
      default() {
        return {}
      }
    },
    dateType: {
      type: String,
      default() {
        return 'date'
      }
    }
  },
  data() {
    return {
      roughPeriod: this.value
    }
  },

  methods: {
    changeValue() {
      let _roughPeriod = this.roughPeriod
      this.$emit('input', _roughPeriod ? formatDate(_roughPeriod, this.dateType) : _roughPeriod)
    }
  },
  watch: {
    value(newVal) {
      this.roughPeriod = newVal
    }
  }
}
</script>
<style lang="less"></style>
