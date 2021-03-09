import extend from 'extend';
import qs from 'qs';
import './extendArray';
import { HomeRouterName } from '@/const';
import Message from '../../packages/message/index';

let util = {};
/*
util.showThisRoute = function(itAccess, currentAccess) {
    if (typeof itAccess === 'object' && itAccess.isArray()) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
}; */
function flattenMenuData(list, data) {
  list.push(data);
  if (data.actionUrl === 'home_index') {
    data.actionUrl = HomeRouterName;
  }

  //使用后台数据校正写死的数据
  if (data.actionUrl === HomeRouterName) {
    window.$store.commit(window.$moduleName + '/setHomePageInfo', data);
  }

  (data.children || []).forEach(item => flattenMenuData(list, item));
}

util.processMenusData = function(data) {
  if (!data) {
    Message.error({
      content: '无菜单数据！',
      duration: 3
    });
    return;
  }

  window.$store.commit(window.$moduleName + '/setUserMenuTree', data);
  let menus = [];
  for (let m of data) {
    flattenMenuData(menus, m);
  }

  // let actionUrl = [];
  // for (let u of menus) {
  //     if (u.actionUrl != null && u.actionUrl != ' ') actionUrl.push(u.actionUrl);
  // }

  // window.$store.commit(window.$moduleName + '/setScopeUrl', actionUrl.join(','));
  window.$store.commit(window.$moduleName + '/setUserMenu', menus);
  window.$store.commit(window.$moduleName + '/setOpenedList');
  // 用户操作权限
  // this.window.$store.commit(window.$moduleName + '/setOptionRight', data.rightBtnList);
  // 维度操作类型
  // this.window.$store.commit(window.$moduleName + '/setDimensionOperationType', data.dimensionObjectType);
  window.$store.commit(window.$moduleName + '/changeTagsLang', data);
};

function registerActiveEvent(currentDefaultPost) {
  localStorage.defaultPost = currentDefaultPost;
  window.addEventListener('focus', () => {
    if (localStorage.defaultPost != sessionStorage.PostId) {
      delete localStorage.pageOpenedList;
      window.location.reload();
    }
  });
}

util.GetLoginData = function() {
  return window.$http
    .post(`${window.RPConfig.mgt}/security/getLoginData`, {}, null, { cache: true })
    .then(res => res && res.data)
    .then(res => {
      if (!res) {
        Message.error({
          content: 'GetLoginData服务异常！',
          duration: 0
        });
        return;
      }

      const _userMenu = window.$store.state[window.$moduleName]['userMenu'];
      if (_userMenu.length === 0) {
        util.processMenusData(res.menuTreeVoList);
        // sessionStorage.RoleId
        sessionStorage.PostId = res.defaultPost;
        registerActiveEvent(res.defaultPost);
        sessionStorage.LangCode = res.defaultLocal; //TD
        sessionStorage.productCode = res.defaultProductCode;
        sessionStorage.userRepository = res.userRepository;
        sessionStorage.userCenter = res.userCenter;
      }

      return res;
    });
};

util.getPathObjByName = function(list, menuId) {
  if (!menuId) return;
  let _userMenu = window.$store.state[window.$moduleName]['userMenu'];
  let i = _userMenu.findIndex(item => {
    return item.menuId == menuId;
  });
  if (i > -1) {
    list.unshift({
      title: _userMenu[i].menuName,
      path: _userMenu[i].actionUrl,
      name: _userMenu[i].name
    });
    util.getPathObjByName(list, _userMenu[i].menuModuleId);
  }
};

// 约定多开缓存路由path规则
const DynamicCachePath = 'dynamic-cache';
util.isDynamicCacheRoute = function(routeName) {
  return routeName.indexOf(DynamicCachePath) > -1;
};

/**
 * vm Vue的实例
 * name 路由名字
 * title 显示在 tags 的文字
 * params 是传给路由的参数对象
 * query 是传递给路由的url拼接类型的参数
 */
util.openPage = function(vm, name, title, params, query) {
  //为了兼容以前的结构, 不可更改入参
  const targetInfo = { name, params, query, title };
  const dynamicCreate = util.isDynamicCacheRoute(name);
  if (dynamicCreate && params) {
    // eslint-disable-next-line no-console
    console.error(
      '由于浏览器的工作原理导致, 当使用多开路由时, 用地址栏的url方式访问该路由, 将导致 params 无法取到! 所以此时避免使用 params !'
    );
  }

  const _route = {
    name,
    params,
    query,
    title
  };

  const paramsString = JSON.stringify(params);
  const queryString = JSON.stringify(query);
  const matchedRoutes = window.$store.state[window.$moduleName].pageOpenedList.filter((item, index) => {
    const isDynamic = util.isDynamicCacheRoute(item.name);
    if (
      (!isDynamic && item.name === name) || //不是多开缓存, 只需比较name
      (isDynamic && //是多开缓存, 就要比较 name params query
        //由于item.name已经被改变
        (item.name === name || (item.meta && item.meta.name === name)) &&
        JSON.stringify(item.params) === paramsString &&
        JSON.stringify(item.query) === queryString)
    ) {
      vm.$store.commit(window.$moduleName + '/moveToSecond', index);
      vm.$router.push(item);
      return true;
    }
  });
  if (matchedRoutes.length === 0) {
    // console.log(vm.$router.options.routes);
    const reuseRoute = findReuseRoute(targetInfo, vm.$router.options.routes);
    // console.log(reuseRoute);
    if (reuseRoute) {
      _route.name = reuseRoute.name;
    } else if (dynamicCreate) {
      const newRouteName = util.createDynamicRoute(targetInfo, vm.$router).name;
      _route.name = newRouteName;
    }

    // 把原名放meta方便查找
    _route.meta = targetInfo;
    vm.$router.push(_route);
    vm.$store.commit(window.$moduleName + '/insertIntoOpenedList', _route);
  }

  vm.$store.commit(window.$moduleName + '/insertToCachePage', _route);
};

function findReuseRoute(targetInfo, allRoutes) {
  const { name, params, query, title } = targetInfo;
  const paramsJson = JSON.stringify(params);
  const queryJson = JSON.stringify(query);
  for (let len = allRoutes.length - 1, i = len; i >= 0; i--) {
    const item = allRoutes[i];
    const itemInfo = item.meta;
    if (
      itemInfo &&
      itemInfo.name === name &&
      JSON.stringify(itemInfo.params) === paramsJson &&
      JSON.stringify(itemInfo.query) === queryJson &&
      itemInfo.title === title
    ) {
      return item;
    } else if (item.children) {
      let res = findReuseRoute(targetInfo, item.children);
      // console.log(res);
      if (res) {
        // console.log(res);
        return res;
      }
    }
  }
}

let flag = 1; //区分新增路由的标志
let numEndStrReg = /\d+$/;
util.createDynamicRoute = function(targetInfo, router) {
  let name = targetInfo.name;
  let allRoutes = router.options.routes;
  let res = findRouteComponentAndParentRoute(allRoutes, name);
  if (res) {
    let { dynamicCom, parentRoute } = res;
    dynamicCom = Object.assign({}, dynamicCom);
    const matched = numEndStrReg.exec(name);
    let newName;
    if (matched) {
      flag = +matched[0];
      newName = name;
    } else {
      newName = name + flag;
    }

    flag++;
    dynamicCom.name = newName;
    const newRoute = {
      path: newName,
      name: newName,
      meta: targetInfo,
      component: dynamicCom
    };

    parentRoute.push(newRoute);
    router.addRoutes(allRoutes);
    return newRoute;
  } else {
    throw new Error('没有找到对应的动态路由配置, 系统无法正常运行!'); //TD: 考虑跳到首页去的方法
  }
};

let _findHelperCache = {};
function findRouteComponentAndParentRoute(routes, routeName) {
  routeName = routeName.replace(/\d/g, '');
  if (_findHelperCache[routeName]) {
    return _findHelperCache[routeName];
  }

  let parentRoute = routes || [];
  for (var len = parentRoute.length - 1, i = len; i >= 0; i--) {
    let item = parentRoute[i];
    if (item.name && item.name.indexOf(routeName) > -1) {
      return (_findHelperCache[routeName] = {
        dynamicCom: item.component,
        parentRoute
      });
    } else if (item.children && item.children.length > 0) {
      let res = findRouteComponentAndParentRoute(item.children, routeName);
      if (res) {
        return res;
      }
    }
  }
}

util.getDynamicCacheRouteTitle = function(routes, routeName) {
  routeName = routeName.replace(/\d/g, '');
  for (var len = routes.length - 1, i = len; i >= 0; i--) {
    let item = routes[i];
    if (item.name && item.name === routeName) {
      return item.title;
    } else if (item.children && item.children.length > 0) {
      let res = util.getDynamicCacheRouteTitle(item.children, routeName);
      if (res) {
        return res;
      }
    }
  }
};

util.removeOtherDynamicTags = function(routeName) {
  let openedPage = localStorage.pageOpenedList;
  let finded = false;
  if (openedPage) {
    openedPage = JSON.parse(openedPage);
    openedPage = openedPage.filter(item => {
      //处理已保存的错误数据
      if (item.path === HomeRouterName) {
        item.name = HomeRouterName;
      }

      let itemName = item.name || item.path;
      // 非多开路由
      if (itemName.indexOf(DynamicCachePath) === -1) {
        return true;
      }

      //是多开的只留一个匹配的
      if (itemName === routeName && !finded) {
        finded = true;
        return true;
      }
    });

    localStorage.pageOpenedList = JSON.stringify(openedPage);
  }
};

util.closeCurrentPage = function(vm, name) {
  vm.$store.commit(window.$moduleName + '/removeTag', name);
  let lastRouter = '';
  let _pageOpenedList = window.$store.state[window.$moduleName].pageOpenedList;
  if (_pageOpenedList.length > 1) {
    lastRouter = _pageOpenedList[1];
  } else {
    lastRouter = _pageOpenedList[0];
  }
  vm.$router.push(lastRouter);
};

util.getUrlCode = function(url) {
  if (url && url.lastIndexOf('code.') > 0) {
    return url.substr(url.lastIndexOf('code.') + 5);
  } else {
    return null;
  }
};

util.getLoginType = function(url) {
  if (url) {
    let indexLoginType = url.lastIndexOf('loginType.');
    let indexLoginAccount = url.lastIndexOf('.loginAccount');
    return url.substr(indexLoginType + 10, indexLoginAccount - indexLoginType - 10);
  } else {
    return null;
  }
};

util.getLoginAccount = function(url) {
  if (url) {
    let indexLoginAccount = url.lastIndexOf('loginAccount.');
    let indexService = url.lastIndexOf('.service');
    return url.substr(indexLoginAccount + 13, indexService - indexLoginAccount - 13);
  } else {
    return null;
  }
};

util.getService = function(url) {
  if (url) {
    let index = url.lastIndexOf('service.');
    return url.substr(index + 8);
  } else {
    return null;
  }
};

util.clearAuth = () => {
  localStorage.Authorization = '';
  localStorage.RefreshToken = '';
  // localStorage.crctoken = '';
  //清空流程超级管理员租户信息
  localStorage.tenant = '';
};

util.redirectToLogin = function(url = window.location.href) {
  util.clearAuth();
  let targetUrl = window.RPConfig.cas_url + url;
  window.location.href = targetUrl;
  //如果是其它域, 终止执行后续代码
  if (targetUrl.indexOf('//') > -1 && targetUrl.indexOf(window.location.host) === -1) {
    throw new Error('页面需要跳转到CAS!');
  }
};

util.on = (function() {
  if (document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();

util.getUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const toStr = Object.prototype.toString;
util.isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }

  return toStr.call(arr) === '[object Array]';
};
util.inOf = function(arr, targetArr) {
  let res = true;
  arr.map(item => {
    if (targetArr.indexOf(item) < 0) {
      res = false;
    }
  });
  return res;
};

util.oneOf = function(ele, targetArr) {
  if (targetArr.indexOf(ele) >= 0) {
    return true;
  } else {
    return false;
  }
};

util.copyPros = function(source, target, excludeNames = []) {
  // 强制都是深拷贝
  let tempTarget = extend(true, {}, target);
  if (util.isPlainObject(source)) {
    // eslint-disable-next-line no-console
    console.error('source must be a object!');
    return;
  }
  if (util.isPlainObject(target)) {
    // eslint-disable-next-line no-console
    console.error('target must be a object!');
    return;
  }
  if (excludeNames && util.isPlainObject(excludeNames)) {
    // eslint-disable-next-line no-console
    console.error('excludeNames must be a array!');
    return;
  }
  for (let key of Object.keys(source)) {
    if (!excludeNames || !excludeNames.includes(key)) {
      source[key] = tempTarget[key];
    }
  }
  return source;
};

//用这个
util.getUrlParams = function(url = location.href) {
  // !!!这里不能取location.search,因为如果值里面有#那么会有截断现象，只能取href
  let searchStr = url.split('?')[1];
  let result = {};
  if (!searchStr) {
    return result;
  } else {
    return qs.parse(searchStr);
  }
};

util.closeWebPage = function() {
  if (navigator.userAgent.indexOf('MSIE') > 0) {
    if (navigator.userAgent.indexOf('MSIE 6.0') > 0) {
      window.opener = null;
      window.close();
    } else {
      window.open('', '_top');
      window.top.close();
    }
  } else if (navigator.userAgent.indexOf('Firefox') > 0) {
    window.location.href = 'about:blank ';
  } else {
    window.opener = null;
    window.open('', '_self', '');
    window.close();
  }
};

util.getParamValueByKey = function(name) {
  return (
    decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [undefined, ''])[1].replace(
        /\+/g,
        '%20'
      )
    ) || null
  );
};

util.isAuthValid = () => {
  // 如果开启取模式, 不校验数据有效性
  // if (window.RPConfig.proxyLevel === 'GET') {
  //   return true;
  // } else {
    let refreshTime = localStorage.RefreshTime;
    if (!refreshTime) {
      refreshTime = new Date();
    } else {
      refreshTime = new Date(refreshTime);
    }

    let nowTime = new Date();
    var diff = nowTime.getTime() - refreshTime;
    diff = Math.abs(diff / 1000);
    return localStorage.Authorization && diff < localStorage.ExpiresIn * 0.8;
  // }
};

// const storeFlag = 'cache_';
// const _proxyLevel = window.RPConfig.proxyLevel;
// const isSetProxy = _proxyLevel === 'SET' || _proxyLevel === 'GET';

util.setLoginInfo = res => {
  localStorage.RefreshToken = res.refresh_token;
  localStorage.ExpiresIn = res.expires_in;
  localStorage.RefreshTime = new Date();
  localStorage.Authorization = res.access_token;

  // if (isSetProxy) {
  //   Object.keys(localStorage).forEach(key => {
  //     if (key.indexOf(storeFlag) > -1) {
  //       delete localStorage[key];
  //     }
  //   });
  // }
};

util.isPlainObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

util.getParams = url => {
  let params = {};
  let paramStr = url.split('?')[1];
  if (!paramStr) {
    // 没有参数时
    return params;
  }
  let paramArr = paramStr.split('&');
  paramArr.forEach(element => {
    var str = element.split('=');
    params[str[0]] = str[1];
  });
  return params;
};

export default util;
