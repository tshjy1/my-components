/**
 * 
 * @param {*} dateTime 字符串/时间
 */
export function formatDate(dateTime, type) {
  let date = new Date(dateTime)
  let Y = date.getFullYear() + ''
  let M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  let D = date.getDate() + ''
  let H = date.getHours() + ':'
  let m = date.getMinutes() + ':'
  let S = date.getHours() + ''
  switch(type) {
    case 'year': return Y;
    case 'month': return Y + '-' + M;
    case 'date': return Y + '-' + M + '-' + D;
    case 'datetime': return Y + '-' + M + '-' + D + ' ' + H + m + S;
    default: return ''
  }
}