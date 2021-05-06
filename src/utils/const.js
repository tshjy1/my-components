/**
 * 读取文件内容
 * @param {*} response 文件流数据
 * @returns 返回文件内容
 */
export function judgeErrorByResponseType(response) {
  return new Promise((resolve, reject) => {
    // 判断是文件流，而且是JSON格式
    if (response.headers['content-type'].includes('json')) {
      // 此处拿到的data才是blob
      const { data } = response
      const reader = new FileReader()
      reader.onload = () => {
        const { result } = reader
        const errorInfos = JSON.parse(result)
        resolve(errorInfos)
      }
      reader.onerror = err => {
        resolve(err)
      }
      reader.readAsText(data)
    } else {
      resolve(response)
    }
  })
}