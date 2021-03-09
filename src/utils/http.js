/**
 * 引入axios，创建axios实例
 * 封装axios请求拦截器
 */
import axios from 'axios';
import util from '../utils/util';
import Message from '../../packages/message/index';
// import { spinShow, spinHide } from './globalLoading';

let apiCache = new Map();
const CancelToken = axios.CancelToken;
// const storeFlag = "cache_";

// 配置请求头
var instance = axios.create({
  timeout: 20000
});

function getFormSetString(obj) {
  var paramArr = [];
  for (const key in obj) {
    paramArr.push(`${key}=${obj[key]}`);
  }
  return paramArr.join('&');
}

window.addEventListener('message', receiveMessage);

function receiveMessage(event) {
  // For Chrome, the origin property is in the event.originalEvent
  let origin = event.origin || event.originalEvent.origin;
  if (origin !== location.origin) return;

  if (event.data === 'RefreshToken') {
    refreshToken().then(() => event.source.postMessage('SendToken'));
  }
}

let headers = {
  'Content-Type': 'application/json;charset=UTF-8',
  Pragma: 'no-cache',
  PostId: getPostId() || sessionStorage.getItem('PostId')
};

function getPostId() {
  try {
    const component = window.$store.state[window.$moduleName] || {};
    return component.currentPost ? component.currentPost.postId : '';
  } catch (error) {
    return sessionStorage.getItem('PostId');
  }
}

export function getHttpHeaders(config = {}) {
  let _headers = Object.assign({}, headers, {
    RoleId: sessionStorage.RoleId || '',
    LangCode: sessionStorage.LangCode || '',
    ...config.headers
  });

  let auth = localStorage.Authorization;
  _headers.authorization = auth ? 'Bearer ' + auth : '';

  return _headers;
}

export function setHttpHeaders(config = {}) {
  headers = {
    ...headers,
    ...config
  };
}

let refreshQuery = [],
  canRefreshToken = true;

function clearRefreshQuery() {
  let resolve;
  while ((resolve = refreshQuery.shift())) {
    resolve();
  }
}

function refreshToken() {
  return new Promise((resolve, reject) => {
    let needRefresh = !util.isAuthValid() && !!localStorage.Authorization;
    if (!needRefresh) {
      resolve();
    } else {
      if (canRefreshToken) {
        canRefreshToken = false;
        let refreshToken = localStorage.RefreshToken;
        let domain = window.location.hostname;
        let url = window.RPConfig.oauth + '/refreshToken?refresh_token=' + refreshToken + '&domain=' + domain;
        _post(url)
          .then(res => {
            canRefreshToken = true;
            if (res && res.data && res.data.retCode && res.data.retCode == '1') {
              res = res.data.data;
              util.setLoginInfo(res);
              resolve();
              clearRefreshQuery();
            } else {
              window.$channel.$emit('LoginOutEvent');
              reject(new Error('Oauth 服务有问题'));
            }
          })
          .catch(e => {
            canRefreshToken = true;
            reject(e);
          });
      } else {
        refreshQuery.push(resolve);
      }
    }
  });
}

function appendUrlParam(url, paramStr) {
  let dash;
  if (url.indexOf('?') > -1) {
    dash = '&';
  } else {
    dash = '?';
  }

  return url + dash + paramStr;
}

// 获取当前时间
function getNowTime() {
  return new Date().getTime();
}

// 获取超时时间设置
function getExpireTime() {
  return window.RPConfig.expire_time || (window.RPConfig.expire_time = 5 * 60 * 1000);
}

function getCacheKey({ url, data }) {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }

  return url + data;
}

let clearCacheEventInited = false;
// request 拦截器  在请求或响应被 then 或 catch 处理前拦截它们
instance.interceptors.request.use(
  config => {
    // 加载效果-显示
    // let { showLoading = window.RPConfig.showLoading } = config;
    // if (showLoading) {
    //   spinShow();
    // }
    let contentType = config.headers['Content-Type'];
    contentType = contentType && contentType.toLowerCase();
    // 请求参数序列化
    if (config.method === 'post' && config.data) {
      let requestType = config.data.requestType;
      delete config.data.requestType;
      if (requestType === 'formSet') {
        config.data = getFormSetString(config.data);
      } else if (requestType === 'query') {
        config.url = appendUrlParam(config.url, getFormSetString(config.data));
      } else if (contentType && contentType.indexOf('application/json') > -1) {
        config.data = JSON.stringify(config.data);
      }
    }

    // 如果需要缓存--考虑到并不是所有接口都需要缓存的情况
    if (config.cache) {
      if (!clearCacheEventInited) {
        clearCacheEventInited = true;
        window.$channel.$on('ClearAPICache', () => {
          apiCache.clear();
        });
      }

      let source = CancelToken.source();
      config.cancelToken = source.token;
      // 去缓存池获取缓存数据
      const cacheKey = getCacheKey(config);
      let data = apiCache.get(cacheKey);
      // 获取当前时间戳
      let now = getNowTime();
      // 如果开启取模式, 不校验数据有效性
      // 判断缓存池中是否存在已有数据 存在的话 再判断是否过期
      // 未过期 source.cancel会取消当前的请求 并将内容返回到拦截器的err中
      if (data && (now - data.expire < getExpireTime())) {
        source.cancel(data);
        // 加载效果-隐藏
        // if (showLoading) {
        //   spinHide();
        // }
      }
    }

    return config;
  },
  error => {
    // 对错误请求的处理
    // 弹出错误消息
    Message.error({
      content: error.message,
      closable: true
    });
    return Promise.reject(error);
  }
);

// response拦截器  对请求结果做一些处理
instance.interceptors.response.use(
  response => {
    const { config } = response;
    // 加载效果-隐藏
    // let { showLoading = window.RPConfig.showLoading } = config;
    // if (showLoading) {
    //   spinHide();
    // }
    const { cache } = config;
    if (cache) {
      // 缓存数据 并将当前时间存入 方便之后判断是否过期
      let data = {
        expire: getNowTime(),
        data: response
      };

      const cacheKey = getCacheKey(config);
      apiCache.set(cacheKey, data);
      // if (isSetProxy || isGetProxy) {
        // try {
        //   localStorage[storeFlag + cacheKey] = JSON.stringify(data);
        // } catch (error) {
        //   console.error(error);
        // }
      // }
    }

    return response;
  },
  error => {
    // 请求拦截器中的source.cancel会将内容发送到error中
    // 通过axios.isCancel(error)来判断是否返回有数据 有的话直接返回给用户
    if (axios.isCancel(error)) return Promise.resolve(error.message.data);
    // 如果没有的话 则是正常的接口错误 直接返回错误信息给用户
    return Promise.reject(error);
  }
);

function getErrorMessage(e) {
  let msg, code, traceId;
  let data = e.response && e.response.data;
  if (data) {
    msg = data.message || data.msg || data.error || data.error_description;
    code = data.code;
    traceId = data.traceId;
  }

  msg = msg || e.message || e;
  code = code || (e.response && e.response.status);
  //系统异常：feign.FeignException: status 400 reading UserProxyClient#updateUser(UserVo);
  //content: { 'code': 'USER_ERROR.USER_NOT_EXIST', 'message': 'USER_NOT_EXIST', 'traceId': '3696949d15e22433' }

  const pos = msg.indexOf('message');
  if (pos >= 0) {
    msg = msg.substr(pos + 10);
    msg = msg.substr(msg.indexOf('') + 1);
    msg = msg.substring(0, msg.indexOf(''));
  }

  return { msg, code, traceId };
}

function exceptionProcess(e, error) {
  const resStatus = e.response && e.response.status;
  const { msg, code, traceId } = getErrorMessage(e);
  if (resStatus == 401 || (resStatus == 500 && msg == '会话超时')) {
    Message.error({
      content: '授权失败,系统自动重新登录!',
      duration: 3,
      onClose: () => {
        window.$channel.$emit('LoginOutEvent');
      }
    });
  } else if (!error) {
    if (resStatus == 404 || status == 404) {
      Message.error({
        content: '服务接口未找到！',
        duration: 3
      });
    } else if (msg) {
      const errMsg = '错误信息: ' + msg;
      Message.error({
        content: msg,
        more: { msg, code, traceId },
        onClose: _ => _
      });

      throw new Error(errMsg);
    }
  } else {
    error(e.response || e);
  }
}

/**
 * refresh token 时不要在走对外的post 方法, 否则当需要刷新 token 时, 会多调一次 refreshToken
 */
function _post(url, params, error, config) {
  if (Object.prototype.toString.call(params) === '[object Object]') {
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        params[key] = '';
      }
    });
  }

  return instance
    .post(url, params, {
      ...config,
      headers: getHttpHeaders(config)
    })
    .catch(e => {
      exceptionProcess(e, error);
    });
}

/**
 * 封装并导出get方法、post方法。
 */
export const http = {
  /**
   * Axios 的实例对象
   */
  instance,
  /**
   * 获取项目对 Axios 的 http 头的配置对象
   * @param {Object} config 用户定制的配置, 默认为空对象
   */
  getHttpHeaders,
  /**
   * 设置项目后续请求对 Axios 的 http 头的配置
   * @param {Object} config 用户定制的配置, 默认为空对象
   */
  setHttpHeaders,
  /**
   * 在与服务交互时检测token过期状态并适时刷新token
   */
  refreshToken,
  /**
   * get请求
   * @param {String} url 服务地址
   * @param {Object} params 请求参数
   * @param {Funciton} error 异常处理函数. 若不配置, 将使用默认处理
   * @param {Object} config 配置请求设置, 常用语设置content-type, timeout 等 axios 的特殊设置。以及 showLoading 控制是否添加加载效果, true为添加，false为不添加，默认取 window.RPConfig.showLoading 配置项
   */
  async get(url, params, error, config = {}) {
    if (error && typeof error !== 'function') {
      console.error('参数传递有误吧? 第三个参数是异常处理函数, 第四个参数是 Axios 的配置对象!');
    }

    await refreshToken();
    return instance
      .get(url, {
        params,
        ...config,
        headers: getHttpHeaders(config)
      })
      .catch(e => {
        exceptionProcess(e, error);
      });
  },
  /**
   * post请求
   * @param {String} url 服务地址
   * @param {Object} params 请求参数
   * @param {Funciton} error 异常处理函数. 若不配置, 将使用默认处理
   * @param {Object} config 配置请求设置, 常用语设置content-type, timeout 等 axios 的特殊设置。以及 showLoading 控制是否添加加载效果, true为添加，false为不添加，默认取 window.RPConfig.showLoading 配置项
   */
  async post() {
    // if (error && typeof error !== 'function') {
    //   console.error('参数传递有误吧? 第三个参数是异常处理函数, 第四个参数是 Axios 的配置对象!');
    // }

    await refreshToken();
    return _post.apply(undefined, arguments);
  }
};
