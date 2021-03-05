// 公共-单选/多选
export function commonColumns() {
  const data = [
    {
      title: this.configSure.tableTitle.code,
      width: 140,
      key: this.configSure.tableKey.code
    },
    {
      title: this.configSure.tableTitle.name,
      key: this.configSure.tableKey.name
    }
  ]
  if (!this.notSummaryFlag) {
    data.push({
      title: this.$t('module.apportionmentRules.isParent'),
      width: 90,
      render: (h, { row }) => {
        return h('span', {}, row.summaryFlag === 'Y' ? this.$t('common.yes') : this.$t('common.no'))
      }
    })
  }
  if (this.isMultiple) {
    data.unshift({
      type: 'selection',
      width: 60,
      align: 'center'
    })
  } else {
    data.push({
      title: this.$t('common.operating'),
      align: 'left',
      fixed: 'right',
      width: 60,
      render: (h, { row }) => {
        return h('RowTools', {
          props: {
            data: [
              {
                type: 'icon',
                icon: 'md-checkmark-circle-outline',
                active: this.entityInfo.codeAttr === row[this.configSure.tableKey.code],
                text: this.$t('common.select'),
                handle: () => {
                  this.returnData(row)
                }
              }
            ]
          }
        })
      }
    })
  }
  return data;
}
