<template>
  <div id="remote-select-example">
    <Form :v-model="modelForm" :label-width="60">
      <Row :gutter="20">
        <Col span="8">
          <Form-item prop="code" :label="$t('common.role')">
            <RemoteSelect
              :value="modelForm.code"
              :loadFn="loadData"
              :config="{ valueAttr: 'code', textAttr: 'name', keyAttr: 'id' }"
              @change="getRoleInfo"
            />
          </Form-item>
        </Col>
      </Row>
      <Row :gutter="20">
        <Col span="8">
          <Form-item prop="code">
            <div class="custom-form-label" slot="label">
              <div class="title">{{$t('common.role')}}</div>
              <div class="mark">({{$t('common.multiple')}})</div>
            </div>
            <RemoteSelect
              :value="modelForm.code"
              :loadFn="loadData"
              :config="{ valueAttr: 'code', textAttr: 'name', keyAttr: 'id' }"
              @change="getRoleInfo"
              multiple
              string-mode
            />
          </Form-item>
        </Col>
      </Row>
      <Row :gutter="20" class="code-row-bg">
        <Col span="10">
          <Form-item prop="code" label="code">
            <Input v-model="modelForm.code" disabled/>
          </Form-item>
        </Col>
        <Col span="10">
          <Form-item prop="name" label="name">
            <Input v-model="modelForm.name" disabled/>
          </Form-item>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
import SelfAdaption from '../../../../packages/SelfAdaption/SelfAdaption'

export default {
  data() {
    return {
      modelForm: {
        code: '',
        name: ''
      },
      originalData: [
        {
          id: '0001',
          name: '杨逍',
          code: 2021001
        },
        {
          id: '0002',
          name: '张无忌',
          code: 2021002
        },
        {
          id: '0003',
          name: '赵敏',
          code: 2021003
        },
        {
          id: '0004',
          name: '张三丰',
          code: 2021004
        },
        {
          id: '0005',
          name: '小昭',
          code: 2021005
        },
        {
          id: '0006',
          name: '周芷若',
          code: 2021006
        },
        {
          id: '0007',
          name: '殷野王',
          code: 2021007
        },
        {
          id: '0008',
          name: '殷素素',
          code: 2021008
        },
        {
          id: '0009',
          name: '张翠山',
          code: 2021009
        },
        {
          id: '0010',
          name: '殷阿离',
          code: 2021010
        },
        {
          id: '0011',
          name: '金花',
          code: 2021011
        },
        {
          id: '0012',
          name: '金毛',
          code: 2021012
        }
      ]
    }
  },
  created() {
    console.log('-----------SelfAdaption----', SelfAdaption)
  },
  methods: {
    loadData(params) {
      const { name } = params.condition
      let records = []
      if (name) {
        records = this.originalData.filter(item => item.name.search(name) !== -1)
      } else {
        records = this.originalData
      }
      return Promise.resolve({ data: { records }})
    },
    getRoleInfo(selectObj) {
      this.modelForm.name = selectObj && selectObj.label || ''
      this.modelForm.code = selectObj && selectObj.value || ''
    }
  }
}
</script>

<style lang="less"></style>
