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

/* istanbul ignore next */
const trim = function(string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

/* istanbul ignore next */
export function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}

/* istanbul ignore next */
export function addClass(el, cls) {
  if (!el) return;
  let curClass = el.className;
  const classes = (cls || '').split(' ');

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/* istanbul ignore next */
export function removeClass(el, cls) {
  if (!el || !cls) return;
  const classes = cls.split(' ');
  let curClass = ' ' + el.className + ' ';

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

export function prepareSelectQueryData(conditionObj) {
  let queryObj = {
    pageNum: 0,
    pageSize: window.RPConfig.largePageSize,
    condition: {}
  }

  Object.assign(queryObj.condition, conditionObj)
  return queryObj
}