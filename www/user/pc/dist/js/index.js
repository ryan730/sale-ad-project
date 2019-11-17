webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports) {

var Vue // late bind
var version
var map = (window.__VUE_HOT_MAP__ = Object.create(null))
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) { return }
  installed = true

  Vue = vue.__esModule ? vue.default : vue
  version = Vue.version.split('.').map(Number)
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = version[0] >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
        'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Ctor,
    options: options,
    instances: []
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot(id, options) {
  if (options.functional) {
    var render = options.render
    options.render = function (h, ctx) {
      var instances = map[id].instances
      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent)
      }
      return render(h, ctx)
    }
  } else {
    injectHook(options, initHookName, function() {
      var record = map[id]
      if (!record.Ctor) {
        record.Ctor = this.constructor
      }
      record.instances.push(this)
    })
    injectHook(options, 'beforeDestroy', function() {
      var instances = map[id].instances
      instances.splice(instances.indexOf(this), 1)
    })
  }
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook(options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]
    : [hook]
}

function tryWrap(fn) {
  return function (id, arg) {
    try {
      fn(id, arg)
    } catch (e) {
      console.error(e)
      console.warn(
        'Something went wrong during Vue component hot-reload. Full reload required.'
      )
    }
  }
}

function updateOptions (oldOptions, newOptions) {
  for (var key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key]
    }
  }
  for (var key$1 in newOptions) {
    oldOptions[key$1] = newOptions[key$1]
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id]
  if (!options) {
    record.instances.slice().forEach(function (instance) {
      instance.$forceUpdate()
    })
    return
  }
  if (typeof options === 'function') {
    options = options.options
  }
  if (record.Ctor) {
    record.Ctor.options.render = options.render
    record.Ctor.options.staticRenderFns = options.staticRenderFns
    record.instances.slice().forEach(function (instance) {
      instance.$options.render = options.render
      instance.$options.staticRenderFns = options.staticRenderFns
      // reset static trees
      // pre 2.5, all static trees are cahced together on the instance
      if (instance._staticTrees) {
        instance._staticTrees = []
      }
      // 2.5.0
      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = []
      }
      // 2.5.3
      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = []
      }
      // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)
      instance.$forceUpdate()
    })
  } else {
    // functional or no instance created yet
    record.options.render = options.render
    record.options.staticRenderFns = options.staticRenderFns

    // handle functional component re-render
    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options)
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        var injectStyles = record.options._injectStyles
        if (injectStyles) {
          var render = options.render
          record.options.render = function (h, ctx) {
            injectStyles.call(ctx)
            return render(h, ctx)
          }
        }
      }
      record.options._Ctor = null
      // 2.5.3
      if (Array.isArray(record.options.cached)) {
        record.options.cached = []
      }
      record.instances.slice().forEach(function (instance) {
        instance.$forceUpdate()
      })
    }
  }
})

exports.reload = tryWrap(function (id, options) {
  var record = map[id]
  if (options) {
    if (typeof options === 'function') {
      options = options.options
    }
    makeOptionsHot(id, options)
    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options
      }
      var newCtor = record.Ctor.super.extend(options)
      record.Ctor.options = newCtor.options
      record.Ctor.cid = newCtor.cid
      record.Ctor.prototype = newCtor.prototype
      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release()
      }
    } else {
      updateOptions(record.options, options)
    }
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn(
        'Root or manually mounted instance modified. Full reload required.'
      )
    }
  })
})


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(7))(4);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Logo_vue__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Logo_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Logo_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_8d8663a8_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Logo_vue__ = __webpack_require__(39);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(37)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-8d8663a8"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Logo_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_8d8663a8_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Logo_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/Logo.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-8d8663a8", Component.options)
  } else {
    hotAPI.reload("data-v-8d8663a8", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var WEBSITE = 'http://114.215.18.58:8080/sale';

exports.default = {
  BaseURL: '' + WEBSITE,

  // todo: 通过商品类型获取商品列表
  LIST: WEBSITE + '/api/commodity/getCommodityByType',

  // todo: 获取购物车列表
  CARTLIST: WEBSITE + '/api/shoppingCart/getCartList',

  // todo: 添加商品到购物车
  ADDTOCART: WEBSITE + '/api/shoppingCart/addCommodityToCart',
  getCommodityChannelByID: WEBSITE + '/api/commodity/getCommodityChannelByID',
  addCommodityToCart: WEBSITE + '/api/shoppingCart/addCommodityToCart',

  // todo: 修改商品数量
  changeCommodityNum: WEBSITE + '/api/shoppingCart/changeCommodityNum',

  // todo: 商品从购物车里删除
  delCommodity: WEBSITE + '/api/shoppingCart/delCommodity',

  // todo: 获取收货地址
  getCustomerReceivingAddr: WEBSITE + '/api/customer/getCustomerReceivingAddr',

  // todo: 提交购物车
  commitCart: WEBSITE + '/api/shoppingCart/commitCart'
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _codes = __webpack_require__(8);

var _codes2 = _interopRequireDefault(_codes);

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  getCartList: function getCartList(params) {
    _AJAX2.default.get({
      url: _urls2.default.CARTLIST,
      data: {
        params: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c'
        }
      },
      success: function success(res) {
        var data = res.data;

        if (data.code === _codes2.default.SUCCESS) {
          params.$store.dispatch('changeCartNum', {
            num: data.result.length
          });
          params.$store.dispatch('changeCartItems', data.result);
          typeof params.success === 'function' && params.success(data);
        }
      }
    });
  }
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = __webpack_require__(47);

var _axios2 = _interopRequireDefault(_axios);

var _qs = __webpack_require__(48);

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  get: function get(params) {
    _axios2.default.get(params.url, params.data).then(function (data) {
      typeof params.success === 'function' && params.success(data);
    }).catch(function (err) {
      console.error('err: ', err);
    });
  },
  post: function post(params) {
    _axios2.default.post(params.url, _qs2.default.stringify(params.data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (data) {
      typeof params.success === 'function' && params.success(data);
    }).catch(function (err) {
      console.error('err: ', err);
    });
  }
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = bundle_library;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  SUCCESS: 0
};

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Process_vue__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Process_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Process_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_d1b48d04_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Process_vue__ = __webpack_require__(77);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(75)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-d1b48d04"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Process_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_d1b48d04_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Process_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/Process.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-d1b48d04", Component.options)
  } else {
    hotAPI.reload("data-v-d1b48d04", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 10 */
/***/ (function(module, exports) {

var ENTITIES = [['Aacute', [193]], ['aacute', [225]], ['Abreve', [258]], ['abreve', [259]], ['ac', [8766]], ['acd', [8767]], ['acE', [8766, 819]], ['Acirc', [194]], ['acirc', [226]], ['acute', [180]], ['Acy', [1040]], ['acy', [1072]], ['AElig', [198]], ['aelig', [230]], ['af', [8289]], ['Afr', [120068]], ['afr', [120094]], ['Agrave', [192]], ['agrave', [224]], ['alefsym', [8501]], ['aleph', [8501]], ['Alpha', [913]], ['alpha', [945]], ['Amacr', [256]], ['amacr', [257]], ['amalg', [10815]], ['amp', [38]], ['AMP', [38]], ['andand', [10837]], ['And', [10835]], ['and', [8743]], ['andd', [10844]], ['andslope', [10840]], ['andv', [10842]], ['ang', [8736]], ['ange', [10660]], ['angle', [8736]], ['angmsdaa', [10664]], ['angmsdab', [10665]], ['angmsdac', [10666]], ['angmsdad', [10667]], ['angmsdae', [10668]], ['angmsdaf', [10669]], ['angmsdag', [10670]], ['angmsdah', [10671]], ['angmsd', [8737]], ['angrt', [8735]], ['angrtvb', [8894]], ['angrtvbd', [10653]], ['angsph', [8738]], ['angst', [197]], ['angzarr', [9084]], ['Aogon', [260]], ['aogon', [261]], ['Aopf', [120120]], ['aopf', [120146]], ['apacir', [10863]], ['ap', [8776]], ['apE', [10864]], ['ape', [8778]], ['apid', [8779]], ['apos', [39]], ['ApplyFunction', [8289]], ['approx', [8776]], ['approxeq', [8778]], ['Aring', [197]], ['aring', [229]], ['Ascr', [119964]], ['ascr', [119990]], ['Assign', [8788]], ['ast', [42]], ['asymp', [8776]], ['asympeq', [8781]], ['Atilde', [195]], ['atilde', [227]], ['Auml', [196]], ['auml', [228]], ['awconint', [8755]], ['awint', [10769]], ['backcong', [8780]], ['backepsilon', [1014]], ['backprime', [8245]], ['backsim', [8765]], ['backsimeq', [8909]], ['Backslash', [8726]], ['Barv', [10983]], ['barvee', [8893]], ['barwed', [8965]], ['Barwed', [8966]], ['barwedge', [8965]], ['bbrk', [9141]], ['bbrktbrk', [9142]], ['bcong', [8780]], ['Bcy', [1041]], ['bcy', [1073]], ['bdquo', [8222]], ['becaus', [8757]], ['because', [8757]], ['Because', [8757]], ['bemptyv', [10672]], ['bepsi', [1014]], ['bernou', [8492]], ['Bernoullis', [8492]], ['Beta', [914]], ['beta', [946]], ['beth', [8502]], ['between', [8812]], ['Bfr', [120069]], ['bfr', [120095]], ['bigcap', [8898]], ['bigcirc', [9711]], ['bigcup', [8899]], ['bigodot', [10752]], ['bigoplus', [10753]], ['bigotimes', [10754]], ['bigsqcup', [10758]], ['bigstar', [9733]], ['bigtriangledown', [9661]], ['bigtriangleup', [9651]], ['biguplus', [10756]], ['bigvee', [8897]], ['bigwedge', [8896]], ['bkarow', [10509]], ['blacklozenge', [10731]], ['blacksquare', [9642]], ['blacktriangle', [9652]], ['blacktriangledown', [9662]], ['blacktriangleleft', [9666]], ['blacktriangleright', [9656]], ['blank', [9251]], ['blk12', [9618]], ['blk14', [9617]], ['blk34', [9619]], ['block', [9608]], ['bne', [61, 8421]], ['bnequiv', [8801, 8421]], ['bNot', [10989]], ['bnot', [8976]], ['Bopf', [120121]], ['bopf', [120147]], ['bot', [8869]], ['bottom', [8869]], ['bowtie', [8904]], ['boxbox', [10697]], ['boxdl', [9488]], ['boxdL', [9557]], ['boxDl', [9558]], ['boxDL', [9559]], ['boxdr', [9484]], ['boxdR', [9554]], ['boxDr', [9555]], ['boxDR', [9556]], ['boxh', [9472]], ['boxH', [9552]], ['boxhd', [9516]], ['boxHd', [9572]], ['boxhD', [9573]], ['boxHD', [9574]], ['boxhu', [9524]], ['boxHu', [9575]], ['boxhU', [9576]], ['boxHU', [9577]], ['boxminus', [8863]], ['boxplus', [8862]], ['boxtimes', [8864]], ['boxul', [9496]], ['boxuL', [9563]], ['boxUl', [9564]], ['boxUL', [9565]], ['boxur', [9492]], ['boxuR', [9560]], ['boxUr', [9561]], ['boxUR', [9562]], ['boxv', [9474]], ['boxV', [9553]], ['boxvh', [9532]], ['boxvH', [9578]], ['boxVh', [9579]], ['boxVH', [9580]], ['boxvl', [9508]], ['boxvL', [9569]], ['boxVl', [9570]], ['boxVL', [9571]], ['boxvr', [9500]], ['boxvR', [9566]], ['boxVr', [9567]], ['boxVR', [9568]], ['bprime', [8245]], ['breve', [728]], ['Breve', [728]], ['brvbar', [166]], ['bscr', [119991]], ['Bscr', [8492]], ['bsemi', [8271]], ['bsim', [8765]], ['bsime', [8909]], ['bsolb', [10693]], ['bsol', [92]], ['bsolhsub', [10184]], ['bull', [8226]], ['bullet', [8226]], ['bump', [8782]], ['bumpE', [10926]], ['bumpe', [8783]], ['Bumpeq', [8782]], ['bumpeq', [8783]], ['Cacute', [262]], ['cacute', [263]], ['capand', [10820]], ['capbrcup', [10825]], ['capcap', [10827]], ['cap', [8745]], ['Cap', [8914]], ['capcup', [10823]], ['capdot', [10816]], ['CapitalDifferentialD', [8517]], ['caps', [8745, 65024]], ['caret', [8257]], ['caron', [711]], ['Cayleys', [8493]], ['ccaps', [10829]], ['Ccaron', [268]], ['ccaron', [269]], ['Ccedil', [199]], ['ccedil', [231]], ['Ccirc', [264]], ['ccirc', [265]], ['Cconint', [8752]], ['ccups', [10828]], ['ccupssm', [10832]], ['Cdot', [266]], ['cdot', [267]], ['cedil', [184]], ['Cedilla', [184]], ['cemptyv', [10674]], ['cent', [162]], ['centerdot', [183]], ['CenterDot', [183]], ['cfr', [120096]], ['Cfr', [8493]], ['CHcy', [1063]], ['chcy', [1095]], ['check', [10003]], ['checkmark', [10003]], ['Chi', [935]], ['chi', [967]], ['circ', [710]], ['circeq', [8791]], ['circlearrowleft', [8634]], ['circlearrowright', [8635]], ['circledast', [8859]], ['circledcirc', [8858]], ['circleddash', [8861]], ['CircleDot', [8857]], ['circledR', [174]], ['circledS', [9416]], ['CircleMinus', [8854]], ['CirclePlus', [8853]], ['CircleTimes', [8855]], ['cir', [9675]], ['cirE', [10691]], ['cire', [8791]], ['cirfnint', [10768]], ['cirmid', [10991]], ['cirscir', [10690]], ['ClockwiseContourIntegral', [8754]], ['clubs', [9827]], ['clubsuit', [9827]], ['colon', [58]], ['Colon', [8759]], ['Colone', [10868]], ['colone', [8788]], ['coloneq', [8788]], ['comma', [44]], ['commat', [64]], ['comp', [8705]], ['compfn', [8728]], ['complement', [8705]], ['complexes', [8450]], ['cong', [8773]], ['congdot', [10861]], ['Congruent', [8801]], ['conint', [8750]], ['Conint', [8751]], ['ContourIntegral', [8750]], ['copf', [120148]], ['Copf', [8450]], ['coprod', [8720]], ['Coproduct', [8720]], ['copy', [169]], ['COPY', [169]], ['copysr', [8471]], ['CounterClockwiseContourIntegral', [8755]], ['crarr', [8629]], ['cross', [10007]], ['Cross', [10799]], ['Cscr', [119966]], ['cscr', [119992]], ['csub', [10959]], ['csube', [10961]], ['csup', [10960]], ['csupe', [10962]], ['ctdot', [8943]], ['cudarrl', [10552]], ['cudarrr', [10549]], ['cuepr', [8926]], ['cuesc', [8927]], ['cularr', [8630]], ['cularrp', [10557]], ['cupbrcap', [10824]], ['cupcap', [10822]], ['CupCap', [8781]], ['cup', [8746]], ['Cup', [8915]], ['cupcup', [10826]], ['cupdot', [8845]], ['cupor', [10821]], ['cups', [8746, 65024]], ['curarr', [8631]], ['curarrm', [10556]], ['curlyeqprec', [8926]], ['curlyeqsucc', [8927]], ['curlyvee', [8910]], ['curlywedge', [8911]], ['curren', [164]], ['curvearrowleft', [8630]], ['curvearrowright', [8631]], ['cuvee', [8910]], ['cuwed', [8911]], ['cwconint', [8754]], ['cwint', [8753]], ['cylcty', [9005]], ['dagger', [8224]], ['Dagger', [8225]], ['daleth', [8504]], ['darr', [8595]], ['Darr', [8609]], ['dArr', [8659]], ['dash', [8208]], ['Dashv', [10980]], ['dashv', [8867]], ['dbkarow', [10511]], ['dblac', [733]], ['Dcaron', [270]], ['dcaron', [271]], ['Dcy', [1044]], ['dcy', [1076]], ['ddagger', [8225]], ['ddarr', [8650]], ['DD', [8517]], ['dd', [8518]], ['DDotrahd', [10513]], ['ddotseq', [10871]], ['deg', [176]], ['Del', [8711]], ['Delta', [916]], ['delta', [948]], ['demptyv', [10673]], ['dfisht', [10623]], ['Dfr', [120071]], ['dfr', [120097]], ['dHar', [10597]], ['dharl', [8643]], ['dharr', [8642]], ['DiacriticalAcute', [180]], ['DiacriticalDot', [729]], ['DiacriticalDoubleAcute', [733]], ['DiacriticalGrave', [96]], ['DiacriticalTilde', [732]], ['diam', [8900]], ['diamond', [8900]], ['Diamond', [8900]], ['diamondsuit', [9830]], ['diams', [9830]], ['die', [168]], ['DifferentialD', [8518]], ['digamma', [989]], ['disin', [8946]], ['div', [247]], ['divide', [247]], ['divideontimes', [8903]], ['divonx', [8903]], ['DJcy', [1026]], ['djcy', [1106]], ['dlcorn', [8990]], ['dlcrop', [8973]], ['dollar', [36]], ['Dopf', [120123]], ['dopf', [120149]], ['Dot', [168]], ['dot', [729]], ['DotDot', [8412]], ['doteq', [8784]], ['doteqdot', [8785]], ['DotEqual', [8784]], ['dotminus', [8760]], ['dotplus', [8724]], ['dotsquare', [8865]], ['doublebarwedge', [8966]], ['DoubleContourIntegral', [8751]], ['DoubleDot', [168]], ['DoubleDownArrow', [8659]], ['DoubleLeftArrow', [8656]], ['DoubleLeftRightArrow', [8660]], ['DoubleLeftTee', [10980]], ['DoubleLongLeftArrow', [10232]], ['DoubleLongLeftRightArrow', [10234]], ['DoubleLongRightArrow', [10233]], ['DoubleRightArrow', [8658]], ['DoubleRightTee', [8872]], ['DoubleUpArrow', [8657]], ['DoubleUpDownArrow', [8661]], ['DoubleVerticalBar', [8741]], ['DownArrowBar', [10515]], ['downarrow', [8595]], ['DownArrow', [8595]], ['Downarrow', [8659]], ['DownArrowUpArrow', [8693]], ['DownBreve', [785]], ['downdownarrows', [8650]], ['downharpoonleft', [8643]], ['downharpoonright', [8642]], ['DownLeftRightVector', [10576]], ['DownLeftTeeVector', [10590]], ['DownLeftVectorBar', [10582]], ['DownLeftVector', [8637]], ['DownRightTeeVector', [10591]], ['DownRightVectorBar', [10583]], ['DownRightVector', [8641]], ['DownTeeArrow', [8615]], ['DownTee', [8868]], ['drbkarow', [10512]], ['drcorn', [8991]], ['drcrop', [8972]], ['Dscr', [119967]], ['dscr', [119993]], ['DScy', [1029]], ['dscy', [1109]], ['dsol', [10742]], ['Dstrok', [272]], ['dstrok', [273]], ['dtdot', [8945]], ['dtri', [9663]], ['dtrif', [9662]], ['duarr', [8693]], ['duhar', [10607]], ['dwangle', [10662]], ['DZcy', [1039]], ['dzcy', [1119]], ['dzigrarr', [10239]], ['Eacute', [201]], ['eacute', [233]], ['easter', [10862]], ['Ecaron', [282]], ['ecaron', [283]], ['Ecirc', [202]], ['ecirc', [234]], ['ecir', [8790]], ['ecolon', [8789]], ['Ecy', [1069]], ['ecy', [1101]], ['eDDot', [10871]], ['Edot', [278]], ['edot', [279]], ['eDot', [8785]], ['ee', [8519]], ['efDot', [8786]], ['Efr', [120072]], ['efr', [120098]], ['eg', [10906]], ['Egrave', [200]], ['egrave', [232]], ['egs', [10902]], ['egsdot', [10904]], ['el', [10905]], ['Element', [8712]], ['elinters', [9191]], ['ell', [8467]], ['els', [10901]], ['elsdot', [10903]], ['Emacr', [274]], ['emacr', [275]], ['empty', [8709]], ['emptyset', [8709]], ['EmptySmallSquare', [9723]], ['emptyv', [8709]], ['EmptyVerySmallSquare', [9643]], ['emsp13', [8196]], ['emsp14', [8197]], ['emsp', [8195]], ['ENG', [330]], ['eng', [331]], ['ensp', [8194]], ['Eogon', [280]], ['eogon', [281]], ['Eopf', [120124]], ['eopf', [120150]], ['epar', [8917]], ['eparsl', [10723]], ['eplus', [10865]], ['epsi', [949]], ['Epsilon', [917]], ['epsilon', [949]], ['epsiv', [1013]], ['eqcirc', [8790]], ['eqcolon', [8789]], ['eqsim', [8770]], ['eqslantgtr', [10902]], ['eqslantless', [10901]], ['Equal', [10869]], ['equals', [61]], ['EqualTilde', [8770]], ['equest', [8799]], ['Equilibrium', [8652]], ['equiv', [8801]], ['equivDD', [10872]], ['eqvparsl', [10725]], ['erarr', [10609]], ['erDot', [8787]], ['escr', [8495]], ['Escr', [8496]], ['esdot', [8784]], ['Esim', [10867]], ['esim', [8770]], ['Eta', [919]], ['eta', [951]], ['ETH', [208]], ['eth', [240]], ['Euml', [203]], ['euml', [235]], ['euro', [8364]], ['excl', [33]], ['exist', [8707]], ['Exists', [8707]], ['expectation', [8496]], ['exponentiale', [8519]], ['ExponentialE', [8519]], ['fallingdotseq', [8786]], ['Fcy', [1060]], ['fcy', [1092]], ['female', [9792]], ['ffilig', [64259]], ['fflig', [64256]], ['ffllig', [64260]], ['Ffr', [120073]], ['ffr', [120099]], ['filig', [64257]], ['FilledSmallSquare', [9724]], ['FilledVerySmallSquare', [9642]], ['fjlig', [102, 106]], ['flat', [9837]], ['fllig', [64258]], ['fltns', [9649]], ['fnof', [402]], ['Fopf', [120125]], ['fopf', [120151]], ['forall', [8704]], ['ForAll', [8704]], ['fork', [8916]], ['forkv', [10969]], ['Fouriertrf', [8497]], ['fpartint', [10765]], ['frac12', [189]], ['frac13', [8531]], ['frac14', [188]], ['frac15', [8533]], ['frac16', [8537]], ['frac18', [8539]], ['frac23', [8532]], ['frac25', [8534]], ['frac34', [190]], ['frac35', [8535]], ['frac38', [8540]], ['frac45', [8536]], ['frac56', [8538]], ['frac58', [8541]], ['frac78', [8542]], ['frasl', [8260]], ['frown', [8994]], ['fscr', [119995]], ['Fscr', [8497]], ['gacute', [501]], ['Gamma', [915]], ['gamma', [947]], ['Gammad', [988]], ['gammad', [989]], ['gap', [10886]], ['Gbreve', [286]], ['gbreve', [287]], ['Gcedil', [290]], ['Gcirc', [284]], ['gcirc', [285]], ['Gcy', [1043]], ['gcy', [1075]], ['Gdot', [288]], ['gdot', [289]], ['ge', [8805]], ['gE', [8807]], ['gEl', [10892]], ['gel', [8923]], ['geq', [8805]], ['geqq', [8807]], ['geqslant', [10878]], ['gescc', [10921]], ['ges', [10878]], ['gesdot', [10880]], ['gesdoto', [10882]], ['gesdotol', [10884]], ['gesl', [8923, 65024]], ['gesles', [10900]], ['Gfr', [120074]], ['gfr', [120100]], ['gg', [8811]], ['Gg', [8921]], ['ggg', [8921]], ['gimel', [8503]], ['GJcy', [1027]], ['gjcy', [1107]], ['gla', [10917]], ['gl', [8823]], ['glE', [10898]], ['glj', [10916]], ['gnap', [10890]], ['gnapprox', [10890]], ['gne', [10888]], ['gnE', [8809]], ['gneq', [10888]], ['gneqq', [8809]], ['gnsim', [8935]], ['Gopf', [120126]], ['gopf', [120152]], ['grave', [96]], ['GreaterEqual', [8805]], ['GreaterEqualLess', [8923]], ['GreaterFullEqual', [8807]], ['GreaterGreater', [10914]], ['GreaterLess', [8823]], ['GreaterSlantEqual', [10878]], ['GreaterTilde', [8819]], ['Gscr', [119970]], ['gscr', [8458]], ['gsim', [8819]], ['gsime', [10894]], ['gsiml', [10896]], ['gtcc', [10919]], ['gtcir', [10874]], ['gt', [62]], ['GT', [62]], ['Gt', [8811]], ['gtdot', [8919]], ['gtlPar', [10645]], ['gtquest', [10876]], ['gtrapprox', [10886]], ['gtrarr', [10616]], ['gtrdot', [8919]], ['gtreqless', [8923]], ['gtreqqless', [10892]], ['gtrless', [8823]], ['gtrsim', [8819]], ['gvertneqq', [8809, 65024]], ['gvnE', [8809, 65024]], ['Hacek', [711]], ['hairsp', [8202]], ['half', [189]], ['hamilt', [8459]], ['HARDcy', [1066]], ['hardcy', [1098]], ['harrcir', [10568]], ['harr', [8596]], ['hArr', [8660]], ['harrw', [8621]], ['Hat', [94]], ['hbar', [8463]], ['Hcirc', [292]], ['hcirc', [293]], ['hearts', [9829]], ['heartsuit', [9829]], ['hellip', [8230]], ['hercon', [8889]], ['hfr', [120101]], ['Hfr', [8460]], ['HilbertSpace', [8459]], ['hksearow', [10533]], ['hkswarow', [10534]], ['hoarr', [8703]], ['homtht', [8763]], ['hookleftarrow', [8617]], ['hookrightarrow', [8618]], ['hopf', [120153]], ['Hopf', [8461]], ['horbar', [8213]], ['HorizontalLine', [9472]], ['hscr', [119997]], ['Hscr', [8459]], ['hslash', [8463]], ['Hstrok', [294]], ['hstrok', [295]], ['HumpDownHump', [8782]], ['HumpEqual', [8783]], ['hybull', [8259]], ['hyphen', [8208]], ['Iacute', [205]], ['iacute', [237]], ['ic', [8291]], ['Icirc', [206]], ['icirc', [238]], ['Icy', [1048]], ['icy', [1080]], ['Idot', [304]], ['IEcy', [1045]], ['iecy', [1077]], ['iexcl', [161]], ['iff', [8660]], ['ifr', [120102]], ['Ifr', [8465]], ['Igrave', [204]], ['igrave', [236]], ['ii', [8520]], ['iiiint', [10764]], ['iiint', [8749]], ['iinfin', [10716]], ['iiota', [8489]], ['IJlig', [306]], ['ijlig', [307]], ['Imacr', [298]], ['imacr', [299]], ['image', [8465]], ['ImaginaryI', [8520]], ['imagline', [8464]], ['imagpart', [8465]], ['imath', [305]], ['Im', [8465]], ['imof', [8887]], ['imped', [437]], ['Implies', [8658]], ['incare', [8453]], ['in', [8712]], ['infin', [8734]], ['infintie', [10717]], ['inodot', [305]], ['intcal', [8890]], ['int', [8747]], ['Int', [8748]], ['integers', [8484]], ['Integral', [8747]], ['intercal', [8890]], ['Intersection', [8898]], ['intlarhk', [10775]], ['intprod', [10812]], ['InvisibleComma', [8291]], ['InvisibleTimes', [8290]], ['IOcy', [1025]], ['iocy', [1105]], ['Iogon', [302]], ['iogon', [303]], ['Iopf', [120128]], ['iopf', [120154]], ['Iota', [921]], ['iota', [953]], ['iprod', [10812]], ['iquest', [191]], ['iscr', [119998]], ['Iscr', [8464]], ['isin', [8712]], ['isindot', [8949]], ['isinE', [8953]], ['isins', [8948]], ['isinsv', [8947]], ['isinv', [8712]], ['it', [8290]], ['Itilde', [296]], ['itilde', [297]], ['Iukcy', [1030]], ['iukcy', [1110]], ['Iuml', [207]], ['iuml', [239]], ['Jcirc', [308]], ['jcirc', [309]], ['Jcy', [1049]], ['jcy', [1081]], ['Jfr', [120077]], ['jfr', [120103]], ['jmath', [567]], ['Jopf', [120129]], ['jopf', [120155]], ['Jscr', [119973]], ['jscr', [119999]], ['Jsercy', [1032]], ['jsercy', [1112]], ['Jukcy', [1028]], ['jukcy', [1108]], ['Kappa', [922]], ['kappa', [954]], ['kappav', [1008]], ['Kcedil', [310]], ['kcedil', [311]], ['Kcy', [1050]], ['kcy', [1082]], ['Kfr', [120078]], ['kfr', [120104]], ['kgreen', [312]], ['KHcy', [1061]], ['khcy', [1093]], ['KJcy', [1036]], ['kjcy', [1116]], ['Kopf', [120130]], ['kopf', [120156]], ['Kscr', [119974]], ['kscr', [120000]], ['lAarr', [8666]], ['Lacute', [313]], ['lacute', [314]], ['laemptyv', [10676]], ['lagran', [8466]], ['Lambda', [923]], ['lambda', [955]], ['lang', [10216]], ['Lang', [10218]], ['langd', [10641]], ['langle', [10216]], ['lap', [10885]], ['Laplacetrf', [8466]], ['laquo', [171]], ['larrb', [8676]], ['larrbfs', [10527]], ['larr', [8592]], ['Larr', [8606]], ['lArr', [8656]], ['larrfs', [10525]], ['larrhk', [8617]], ['larrlp', [8619]], ['larrpl', [10553]], ['larrsim', [10611]], ['larrtl', [8610]], ['latail', [10521]], ['lAtail', [10523]], ['lat', [10923]], ['late', [10925]], ['lates', [10925, 65024]], ['lbarr', [10508]], ['lBarr', [10510]], ['lbbrk', [10098]], ['lbrace', [123]], ['lbrack', [91]], ['lbrke', [10635]], ['lbrksld', [10639]], ['lbrkslu', [10637]], ['Lcaron', [317]], ['lcaron', [318]], ['Lcedil', [315]], ['lcedil', [316]], ['lceil', [8968]], ['lcub', [123]], ['Lcy', [1051]], ['lcy', [1083]], ['ldca', [10550]], ['ldquo', [8220]], ['ldquor', [8222]], ['ldrdhar', [10599]], ['ldrushar', [10571]], ['ldsh', [8626]], ['le', [8804]], ['lE', [8806]], ['LeftAngleBracket', [10216]], ['LeftArrowBar', [8676]], ['leftarrow', [8592]], ['LeftArrow', [8592]], ['Leftarrow', [8656]], ['LeftArrowRightArrow', [8646]], ['leftarrowtail', [8610]], ['LeftCeiling', [8968]], ['LeftDoubleBracket', [10214]], ['LeftDownTeeVector', [10593]], ['LeftDownVectorBar', [10585]], ['LeftDownVector', [8643]], ['LeftFloor', [8970]], ['leftharpoondown', [8637]], ['leftharpoonup', [8636]], ['leftleftarrows', [8647]], ['leftrightarrow', [8596]], ['LeftRightArrow', [8596]], ['Leftrightarrow', [8660]], ['leftrightarrows', [8646]], ['leftrightharpoons', [8651]], ['leftrightsquigarrow', [8621]], ['LeftRightVector', [10574]], ['LeftTeeArrow', [8612]], ['LeftTee', [8867]], ['LeftTeeVector', [10586]], ['leftthreetimes', [8907]], ['LeftTriangleBar', [10703]], ['LeftTriangle', [8882]], ['LeftTriangleEqual', [8884]], ['LeftUpDownVector', [10577]], ['LeftUpTeeVector', [10592]], ['LeftUpVectorBar', [10584]], ['LeftUpVector', [8639]], ['LeftVectorBar', [10578]], ['LeftVector', [8636]], ['lEg', [10891]], ['leg', [8922]], ['leq', [8804]], ['leqq', [8806]], ['leqslant', [10877]], ['lescc', [10920]], ['les', [10877]], ['lesdot', [10879]], ['lesdoto', [10881]], ['lesdotor', [10883]], ['lesg', [8922, 65024]], ['lesges', [10899]], ['lessapprox', [10885]], ['lessdot', [8918]], ['lesseqgtr', [8922]], ['lesseqqgtr', [10891]], ['LessEqualGreater', [8922]], ['LessFullEqual', [8806]], ['LessGreater', [8822]], ['lessgtr', [8822]], ['LessLess', [10913]], ['lesssim', [8818]], ['LessSlantEqual', [10877]], ['LessTilde', [8818]], ['lfisht', [10620]], ['lfloor', [8970]], ['Lfr', [120079]], ['lfr', [120105]], ['lg', [8822]], ['lgE', [10897]], ['lHar', [10594]], ['lhard', [8637]], ['lharu', [8636]], ['lharul', [10602]], ['lhblk', [9604]], ['LJcy', [1033]], ['ljcy', [1113]], ['llarr', [8647]], ['ll', [8810]], ['Ll', [8920]], ['llcorner', [8990]], ['Lleftarrow', [8666]], ['llhard', [10603]], ['lltri', [9722]], ['Lmidot', [319]], ['lmidot', [320]], ['lmoustache', [9136]], ['lmoust', [9136]], ['lnap', [10889]], ['lnapprox', [10889]], ['lne', [10887]], ['lnE', [8808]], ['lneq', [10887]], ['lneqq', [8808]], ['lnsim', [8934]], ['loang', [10220]], ['loarr', [8701]], ['lobrk', [10214]], ['longleftarrow', [10229]], ['LongLeftArrow', [10229]], ['Longleftarrow', [10232]], ['longleftrightarrow', [10231]], ['LongLeftRightArrow', [10231]], ['Longleftrightarrow', [10234]], ['longmapsto', [10236]], ['longrightarrow', [10230]], ['LongRightArrow', [10230]], ['Longrightarrow', [10233]], ['looparrowleft', [8619]], ['looparrowright', [8620]], ['lopar', [10629]], ['Lopf', [120131]], ['lopf', [120157]], ['loplus', [10797]], ['lotimes', [10804]], ['lowast', [8727]], ['lowbar', [95]], ['LowerLeftArrow', [8601]], ['LowerRightArrow', [8600]], ['loz', [9674]], ['lozenge', [9674]], ['lozf', [10731]], ['lpar', [40]], ['lparlt', [10643]], ['lrarr', [8646]], ['lrcorner', [8991]], ['lrhar', [8651]], ['lrhard', [10605]], ['lrm', [8206]], ['lrtri', [8895]], ['lsaquo', [8249]], ['lscr', [120001]], ['Lscr', [8466]], ['lsh', [8624]], ['Lsh', [8624]], ['lsim', [8818]], ['lsime', [10893]], ['lsimg', [10895]], ['lsqb', [91]], ['lsquo', [8216]], ['lsquor', [8218]], ['Lstrok', [321]], ['lstrok', [322]], ['ltcc', [10918]], ['ltcir', [10873]], ['lt', [60]], ['LT', [60]], ['Lt', [8810]], ['ltdot', [8918]], ['lthree', [8907]], ['ltimes', [8905]], ['ltlarr', [10614]], ['ltquest', [10875]], ['ltri', [9667]], ['ltrie', [8884]], ['ltrif', [9666]], ['ltrPar', [10646]], ['lurdshar', [10570]], ['luruhar', [10598]], ['lvertneqq', [8808, 65024]], ['lvnE', [8808, 65024]], ['macr', [175]], ['male', [9794]], ['malt', [10016]], ['maltese', [10016]], ['Map', [10501]], ['map', [8614]], ['mapsto', [8614]], ['mapstodown', [8615]], ['mapstoleft', [8612]], ['mapstoup', [8613]], ['marker', [9646]], ['mcomma', [10793]], ['Mcy', [1052]], ['mcy', [1084]], ['mdash', [8212]], ['mDDot', [8762]], ['measuredangle', [8737]], ['MediumSpace', [8287]], ['Mellintrf', [8499]], ['Mfr', [120080]], ['mfr', [120106]], ['mho', [8487]], ['micro', [181]], ['midast', [42]], ['midcir', [10992]], ['mid', [8739]], ['middot', [183]], ['minusb', [8863]], ['minus', [8722]], ['minusd', [8760]], ['minusdu', [10794]], ['MinusPlus', [8723]], ['mlcp', [10971]], ['mldr', [8230]], ['mnplus', [8723]], ['models', [8871]], ['Mopf', [120132]], ['mopf', [120158]], ['mp', [8723]], ['mscr', [120002]], ['Mscr', [8499]], ['mstpos', [8766]], ['Mu', [924]], ['mu', [956]], ['multimap', [8888]], ['mumap', [8888]], ['nabla', [8711]], ['Nacute', [323]], ['nacute', [324]], ['nang', [8736, 8402]], ['nap', [8777]], ['napE', [10864, 824]], ['napid', [8779, 824]], ['napos', [329]], ['napprox', [8777]], ['natural', [9838]], ['naturals', [8469]], ['natur', [9838]], ['nbsp', [160]], ['nbump', [8782, 824]], ['nbumpe', [8783, 824]], ['ncap', [10819]], ['Ncaron', [327]], ['ncaron', [328]], ['Ncedil', [325]], ['ncedil', [326]], ['ncong', [8775]], ['ncongdot', [10861, 824]], ['ncup', [10818]], ['Ncy', [1053]], ['ncy', [1085]], ['ndash', [8211]], ['nearhk', [10532]], ['nearr', [8599]], ['neArr', [8663]], ['nearrow', [8599]], ['ne', [8800]], ['nedot', [8784, 824]], ['NegativeMediumSpace', [8203]], ['NegativeThickSpace', [8203]], ['NegativeThinSpace', [8203]], ['NegativeVeryThinSpace', [8203]], ['nequiv', [8802]], ['nesear', [10536]], ['nesim', [8770, 824]], ['NestedGreaterGreater', [8811]], ['NestedLessLess', [8810]], ['nexist', [8708]], ['nexists', [8708]], ['Nfr', [120081]], ['nfr', [120107]], ['ngE', [8807, 824]], ['nge', [8817]], ['ngeq', [8817]], ['ngeqq', [8807, 824]], ['ngeqslant', [10878, 824]], ['nges', [10878, 824]], ['nGg', [8921, 824]], ['ngsim', [8821]], ['nGt', [8811, 8402]], ['ngt', [8815]], ['ngtr', [8815]], ['nGtv', [8811, 824]], ['nharr', [8622]], ['nhArr', [8654]], ['nhpar', [10994]], ['ni', [8715]], ['nis', [8956]], ['nisd', [8954]], ['niv', [8715]], ['NJcy', [1034]], ['njcy', [1114]], ['nlarr', [8602]], ['nlArr', [8653]], ['nldr', [8229]], ['nlE', [8806, 824]], ['nle', [8816]], ['nleftarrow', [8602]], ['nLeftarrow', [8653]], ['nleftrightarrow', [8622]], ['nLeftrightarrow', [8654]], ['nleq', [8816]], ['nleqq', [8806, 824]], ['nleqslant', [10877, 824]], ['nles', [10877, 824]], ['nless', [8814]], ['nLl', [8920, 824]], ['nlsim', [8820]], ['nLt', [8810, 8402]], ['nlt', [8814]], ['nltri', [8938]], ['nltrie', [8940]], ['nLtv', [8810, 824]], ['nmid', [8740]], ['NoBreak', [8288]], ['NonBreakingSpace', [160]], ['nopf', [120159]], ['Nopf', [8469]], ['Not', [10988]], ['not', [172]], ['NotCongruent', [8802]], ['NotCupCap', [8813]], ['NotDoubleVerticalBar', [8742]], ['NotElement', [8713]], ['NotEqual', [8800]], ['NotEqualTilde', [8770, 824]], ['NotExists', [8708]], ['NotGreater', [8815]], ['NotGreaterEqual', [8817]], ['NotGreaterFullEqual', [8807, 824]], ['NotGreaterGreater', [8811, 824]], ['NotGreaterLess', [8825]], ['NotGreaterSlantEqual', [10878, 824]], ['NotGreaterTilde', [8821]], ['NotHumpDownHump', [8782, 824]], ['NotHumpEqual', [8783, 824]], ['notin', [8713]], ['notindot', [8949, 824]], ['notinE', [8953, 824]], ['notinva', [8713]], ['notinvb', [8951]], ['notinvc', [8950]], ['NotLeftTriangleBar', [10703, 824]], ['NotLeftTriangle', [8938]], ['NotLeftTriangleEqual', [8940]], ['NotLess', [8814]], ['NotLessEqual', [8816]], ['NotLessGreater', [8824]], ['NotLessLess', [8810, 824]], ['NotLessSlantEqual', [10877, 824]], ['NotLessTilde', [8820]], ['NotNestedGreaterGreater', [10914, 824]], ['NotNestedLessLess', [10913, 824]], ['notni', [8716]], ['notniva', [8716]], ['notnivb', [8958]], ['notnivc', [8957]], ['NotPrecedes', [8832]], ['NotPrecedesEqual', [10927, 824]], ['NotPrecedesSlantEqual', [8928]], ['NotReverseElement', [8716]], ['NotRightTriangleBar', [10704, 824]], ['NotRightTriangle', [8939]], ['NotRightTriangleEqual', [8941]], ['NotSquareSubset', [8847, 824]], ['NotSquareSubsetEqual', [8930]], ['NotSquareSuperset', [8848, 824]], ['NotSquareSupersetEqual', [8931]], ['NotSubset', [8834, 8402]], ['NotSubsetEqual', [8840]], ['NotSucceeds', [8833]], ['NotSucceedsEqual', [10928, 824]], ['NotSucceedsSlantEqual', [8929]], ['NotSucceedsTilde', [8831, 824]], ['NotSuperset', [8835, 8402]], ['NotSupersetEqual', [8841]], ['NotTilde', [8769]], ['NotTildeEqual', [8772]], ['NotTildeFullEqual', [8775]], ['NotTildeTilde', [8777]], ['NotVerticalBar', [8740]], ['nparallel', [8742]], ['npar', [8742]], ['nparsl', [11005, 8421]], ['npart', [8706, 824]], ['npolint', [10772]], ['npr', [8832]], ['nprcue', [8928]], ['nprec', [8832]], ['npreceq', [10927, 824]], ['npre', [10927, 824]], ['nrarrc', [10547, 824]], ['nrarr', [8603]], ['nrArr', [8655]], ['nrarrw', [8605, 824]], ['nrightarrow', [8603]], ['nRightarrow', [8655]], ['nrtri', [8939]], ['nrtrie', [8941]], ['nsc', [8833]], ['nsccue', [8929]], ['nsce', [10928, 824]], ['Nscr', [119977]], ['nscr', [120003]], ['nshortmid', [8740]], ['nshortparallel', [8742]], ['nsim', [8769]], ['nsime', [8772]], ['nsimeq', [8772]], ['nsmid', [8740]], ['nspar', [8742]], ['nsqsube', [8930]], ['nsqsupe', [8931]], ['nsub', [8836]], ['nsubE', [10949, 824]], ['nsube', [8840]], ['nsubset', [8834, 8402]], ['nsubseteq', [8840]], ['nsubseteqq', [10949, 824]], ['nsucc', [8833]], ['nsucceq', [10928, 824]], ['nsup', [8837]], ['nsupE', [10950, 824]], ['nsupe', [8841]], ['nsupset', [8835, 8402]], ['nsupseteq', [8841]], ['nsupseteqq', [10950, 824]], ['ntgl', [8825]], ['Ntilde', [209]], ['ntilde', [241]], ['ntlg', [8824]], ['ntriangleleft', [8938]], ['ntrianglelefteq', [8940]], ['ntriangleright', [8939]], ['ntrianglerighteq', [8941]], ['Nu', [925]], ['nu', [957]], ['num', [35]], ['numero', [8470]], ['numsp', [8199]], ['nvap', [8781, 8402]], ['nvdash', [8876]], ['nvDash', [8877]], ['nVdash', [8878]], ['nVDash', [8879]], ['nvge', [8805, 8402]], ['nvgt', [62, 8402]], ['nvHarr', [10500]], ['nvinfin', [10718]], ['nvlArr', [10498]], ['nvle', [8804, 8402]], ['nvlt', [60, 8402]], ['nvltrie', [8884, 8402]], ['nvrArr', [10499]], ['nvrtrie', [8885, 8402]], ['nvsim', [8764, 8402]], ['nwarhk', [10531]], ['nwarr', [8598]], ['nwArr', [8662]], ['nwarrow', [8598]], ['nwnear', [10535]], ['Oacute', [211]], ['oacute', [243]], ['oast', [8859]], ['Ocirc', [212]], ['ocirc', [244]], ['ocir', [8858]], ['Ocy', [1054]], ['ocy', [1086]], ['odash', [8861]], ['Odblac', [336]], ['odblac', [337]], ['odiv', [10808]], ['odot', [8857]], ['odsold', [10684]], ['OElig', [338]], ['oelig', [339]], ['ofcir', [10687]], ['Ofr', [120082]], ['ofr', [120108]], ['ogon', [731]], ['Ograve', [210]], ['ograve', [242]], ['ogt', [10689]], ['ohbar', [10677]], ['ohm', [937]], ['oint', [8750]], ['olarr', [8634]], ['olcir', [10686]], ['olcross', [10683]], ['oline', [8254]], ['olt', [10688]], ['Omacr', [332]], ['omacr', [333]], ['Omega', [937]], ['omega', [969]], ['Omicron', [927]], ['omicron', [959]], ['omid', [10678]], ['ominus', [8854]], ['Oopf', [120134]], ['oopf', [120160]], ['opar', [10679]], ['OpenCurlyDoubleQuote', [8220]], ['OpenCurlyQuote', [8216]], ['operp', [10681]], ['oplus', [8853]], ['orarr', [8635]], ['Or', [10836]], ['or', [8744]], ['ord', [10845]], ['order', [8500]], ['orderof', [8500]], ['ordf', [170]], ['ordm', [186]], ['origof', [8886]], ['oror', [10838]], ['orslope', [10839]], ['orv', [10843]], ['oS', [9416]], ['Oscr', [119978]], ['oscr', [8500]], ['Oslash', [216]], ['oslash', [248]], ['osol', [8856]], ['Otilde', [213]], ['otilde', [245]], ['otimesas', [10806]], ['Otimes', [10807]], ['otimes', [8855]], ['Ouml', [214]], ['ouml', [246]], ['ovbar', [9021]], ['OverBar', [8254]], ['OverBrace', [9182]], ['OverBracket', [9140]], ['OverParenthesis', [9180]], ['para', [182]], ['parallel', [8741]], ['par', [8741]], ['parsim', [10995]], ['parsl', [11005]], ['part', [8706]], ['PartialD', [8706]], ['Pcy', [1055]], ['pcy', [1087]], ['percnt', [37]], ['period', [46]], ['permil', [8240]], ['perp', [8869]], ['pertenk', [8241]], ['Pfr', [120083]], ['pfr', [120109]], ['Phi', [934]], ['phi', [966]], ['phiv', [981]], ['phmmat', [8499]], ['phone', [9742]], ['Pi', [928]], ['pi', [960]], ['pitchfork', [8916]], ['piv', [982]], ['planck', [8463]], ['planckh', [8462]], ['plankv', [8463]], ['plusacir', [10787]], ['plusb', [8862]], ['pluscir', [10786]], ['plus', [43]], ['plusdo', [8724]], ['plusdu', [10789]], ['pluse', [10866]], ['PlusMinus', [177]], ['plusmn', [177]], ['plussim', [10790]], ['plustwo', [10791]], ['pm', [177]], ['Poincareplane', [8460]], ['pointint', [10773]], ['popf', [120161]], ['Popf', [8473]], ['pound', [163]], ['prap', [10935]], ['Pr', [10939]], ['pr', [8826]], ['prcue', [8828]], ['precapprox', [10935]], ['prec', [8826]], ['preccurlyeq', [8828]], ['Precedes', [8826]], ['PrecedesEqual', [10927]], ['PrecedesSlantEqual', [8828]], ['PrecedesTilde', [8830]], ['preceq', [10927]], ['precnapprox', [10937]], ['precneqq', [10933]], ['precnsim', [8936]], ['pre', [10927]], ['prE', [10931]], ['precsim', [8830]], ['prime', [8242]], ['Prime', [8243]], ['primes', [8473]], ['prnap', [10937]], ['prnE', [10933]], ['prnsim', [8936]], ['prod', [8719]], ['Product', [8719]], ['profalar', [9006]], ['profline', [8978]], ['profsurf', [8979]], ['prop', [8733]], ['Proportional', [8733]], ['Proportion', [8759]], ['propto', [8733]], ['prsim', [8830]], ['prurel', [8880]], ['Pscr', [119979]], ['pscr', [120005]], ['Psi', [936]], ['psi', [968]], ['puncsp', [8200]], ['Qfr', [120084]], ['qfr', [120110]], ['qint', [10764]], ['qopf', [120162]], ['Qopf', [8474]], ['qprime', [8279]], ['Qscr', [119980]], ['qscr', [120006]], ['quaternions', [8461]], ['quatint', [10774]], ['quest', [63]], ['questeq', [8799]], ['quot', [34]], ['QUOT', [34]], ['rAarr', [8667]], ['race', [8765, 817]], ['Racute', [340]], ['racute', [341]], ['radic', [8730]], ['raemptyv', [10675]], ['rang', [10217]], ['Rang', [10219]], ['rangd', [10642]], ['range', [10661]], ['rangle', [10217]], ['raquo', [187]], ['rarrap', [10613]], ['rarrb', [8677]], ['rarrbfs', [10528]], ['rarrc', [10547]], ['rarr', [8594]], ['Rarr', [8608]], ['rArr', [8658]], ['rarrfs', [10526]], ['rarrhk', [8618]], ['rarrlp', [8620]], ['rarrpl', [10565]], ['rarrsim', [10612]], ['Rarrtl', [10518]], ['rarrtl', [8611]], ['rarrw', [8605]], ['ratail', [10522]], ['rAtail', [10524]], ['ratio', [8758]], ['rationals', [8474]], ['rbarr', [10509]], ['rBarr', [10511]], ['RBarr', [10512]], ['rbbrk', [10099]], ['rbrace', [125]], ['rbrack', [93]], ['rbrke', [10636]], ['rbrksld', [10638]], ['rbrkslu', [10640]], ['Rcaron', [344]], ['rcaron', [345]], ['Rcedil', [342]], ['rcedil', [343]], ['rceil', [8969]], ['rcub', [125]], ['Rcy', [1056]], ['rcy', [1088]], ['rdca', [10551]], ['rdldhar', [10601]], ['rdquo', [8221]], ['rdquor', [8221]], ['CloseCurlyDoubleQuote', [8221]], ['rdsh', [8627]], ['real', [8476]], ['realine', [8475]], ['realpart', [8476]], ['reals', [8477]], ['Re', [8476]], ['rect', [9645]], ['reg', [174]], ['REG', [174]], ['ReverseElement', [8715]], ['ReverseEquilibrium', [8651]], ['ReverseUpEquilibrium', [10607]], ['rfisht', [10621]], ['rfloor', [8971]], ['rfr', [120111]], ['Rfr', [8476]], ['rHar', [10596]], ['rhard', [8641]], ['rharu', [8640]], ['rharul', [10604]], ['Rho', [929]], ['rho', [961]], ['rhov', [1009]], ['RightAngleBracket', [10217]], ['RightArrowBar', [8677]], ['rightarrow', [8594]], ['RightArrow', [8594]], ['Rightarrow', [8658]], ['RightArrowLeftArrow', [8644]], ['rightarrowtail', [8611]], ['RightCeiling', [8969]], ['RightDoubleBracket', [10215]], ['RightDownTeeVector', [10589]], ['RightDownVectorBar', [10581]], ['RightDownVector', [8642]], ['RightFloor', [8971]], ['rightharpoondown', [8641]], ['rightharpoonup', [8640]], ['rightleftarrows', [8644]], ['rightleftharpoons', [8652]], ['rightrightarrows', [8649]], ['rightsquigarrow', [8605]], ['RightTeeArrow', [8614]], ['RightTee', [8866]], ['RightTeeVector', [10587]], ['rightthreetimes', [8908]], ['RightTriangleBar', [10704]], ['RightTriangle', [8883]], ['RightTriangleEqual', [8885]], ['RightUpDownVector', [10575]], ['RightUpTeeVector', [10588]], ['RightUpVectorBar', [10580]], ['RightUpVector', [8638]], ['RightVectorBar', [10579]], ['RightVector', [8640]], ['ring', [730]], ['risingdotseq', [8787]], ['rlarr', [8644]], ['rlhar', [8652]], ['rlm', [8207]], ['rmoustache', [9137]], ['rmoust', [9137]], ['rnmid', [10990]], ['roang', [10221]], ['roarr', [8702]], ['robrk', [10215]], ['ropar', [10630]], ['ropf', [120163]], ['Ropf', [8477]], ['roplus', [10798]], ['rotimes', [10805]], ['RoundImplies', [10608]], ['rpar', [41]], ['rpargt', [10644]], ['rppolint', [10770]], ['rrarr', [8649]], ['Rrightarrow', [8667]], ['rsaquo', [8250]], ['rscr', [120007]], ['Rscr', [8475]], ['rsh', [8625]], ['Rsh', [8625]], ['rsqb', [93]], ['rsquo', [8217]], ['rsquor', [8217]], ['CloseCurlyQuote', [8217]], ['rthree', [8908]], ['rtimes', [8906]], ['rtri', [9657]], ['rtrie', [8885]], ['rtrif', [9656]], ['rtriltri', [10702]], ['RuleDelayed', [10740]], ['ruluhar', [10600]], ['rx', [8478]], ['Sacute', [346]], ['sacute', [347]], ['sbquo', [8218]], ['scap', [10936]], ['Scaron', [352]], ['scaron', [353]], ['Sc', [10940]], ['sc', [8827]], ['sccue', [8829]], ['sce', [10928]], ['scE', [10932]], ['Scedil', [350]], ['scedil', [351]], ['Scirc', [348]], ['scirc', [349]], ['scnap', [10938]], ['scnE', [10934]], ['scnsim', [8937]], ['scpolint', [10771]], ['scsim', [8831]], ['Scy', [1057]], ['scy', [1089]], ['sdotb', [8865]], ['sdot', [8901]], ['sdote', [10854]], ['searhk', [10533]], ['searr', [8600]], ['seArr', [8664]], ['searrow', [8600]], ['sect', [167]], ['semi', [59]], ['seswar', [10537]], ['setminus', [8726]], ['setmn', [8726]], ['sext', [10038]], ['Sfr', [120086]], ['sfr', [120112]], ['sfrown', [8994]], ['sharp', [9839]], ['SHCHcy', [1065]], ['shchcy', [1097]], ['SHcy', [1064]], ['shcy', [1096]], ['ShortDownArrow', [8595]], ['ShortLeftArrow', [8592]], ['shortmid', [8739]], ['shortparallel', [8741]], ['ShortRightArrow', [8594]], ['ShortUpArrow', [8593]], ['shy', [173]], ['Sigma', [931]], ['sigma', [963]], ['sigmaf', [962]], ['sigmav', [962]], ['sim', [8764]], ['simdot', [10858]], ['sime', [8771]], ['simeq', [8771]], ['simg', [10910]], ['simgE', [10912]], ['siml', [10909]], ['simlE', [10911]], ['simne', [8774]], ['simplus', [10788]], ['simrarr', [10610]], ['slarr', [8592]], ['SmallCircle', [8728]], ['smallsetminus', [8726]], ['smashp', [10803]], ['smeparsl', [10724]], ['smid', [8739]], ['smile', [8995]], ['smt', [10922]], ['smte', [10924]], ['smtes', [10924, 65024]], ['SOFTcy', [1068]], ['softcy', [1100]], ['solbar', [9023]], ['solb', [10692]], ['sol', [47]], ['Sopf', [120138]], ['sopf', [120164]], ['spades', [9824]], ['spadesuit', [9824]], ['spar', [8741]], ['sqcap', [8851]], ['sqcaps', [8851, 65024]], ['sqcup', [8852]], ['sqcups', [8852, 65024]], ['Sqrt', [8730]], ['sqsub', [8847]], ['sqsube', [8849]], ['sqsubset', [8847]], ['sqsubseteq', [8849]], ['sqsup', [8848]], ['sqsupe', [8850]], ['sqsupset', [8848]], ['sqsupseteq', [8850]], ['square', [9633]], ['Square', [9633]], ['SquareIntersection', [8851]], ['SquareSubset', [8847]], ['SquareSubsetEqual', [8849]], ['SquareSuperset', [8848]], ['SquareSupersetEqual', [8850]], ['SquareUnion', [8852]], ['squarf', [9642]], ['squ', [9633]], ['squf', [9642]], ['srarr', [8594]], ['Sscr', [119982]], ['sscr', [120008]], ['ssetmn', [8726]], ['ssmile', [8995]], ['sstarf', [8902]], ['Star', [8902]], ['star', [9734]], ['starf', [9733]], ['straightepsilon', [1013]], ['straightphi', [981]], ['strns', [175]], ['sub', [8834]], ['Sub', [8912]], ['subdot', [10941]], ['subE', [10949]], ['sube', [8838]], ['subedot', [10947]], ['submult', [10945]], ['subnE', [10955]], ['subne', [8842]], ['subplus', [10943]], ['subrarr', [10617]], ['subset', [8834]], ['Subset', [8912]], ['subseteq', [8838]], ['subseteqq', [10949]], ['SubsetEqual', [8838]], ['subsetneq', [8842]], ['subsetneqq', [10955]], ['subsim', [10951]], ['subsub', [10965]], ['subsup', [10963]], ['succapprox', [10936]], ['succ', [8827]], ['succcurlyeq', [8829]], ['Succeeds', [8827]], ['SucceedsEqual', [10928]], ['SucceedsSlantEqual', [8829]], ['SucceedsTilde', [8831]], ['succeq', [10928]], ['succnapprox', [10938]], ['succneqq', [10934]], ['succnsim', [8937]], ['succsim', [8831]], ['SuchThat', [8715]], ['sum', [8721]], ['Sum', [8721]], ['sung', [9834]], ['sup1', [185]], ['sup2', [178]], ['sup3', [179]], ['sup', [8835]], ['Sup', [8913]], ['supdot', [10942]], ['supdsub', [10968]], ['supE', [10950]], ['supe', [8839]], ['supedot', [10948]], ['Superset', [8835]], ['SupersetEqual', [8839]], ['suphsol', [10185]], ['suphsub', [10967]], ['suplarr', [10619]], ['supmult', [10946]], ['supnE', [10956]], ['supne', [8843]], ['supplus', [10944]], ['supset', [8835]], ['Supset', [8913]], ['supseteq', [8839]], ['supseteqq', [10950]], ['supsetneq', [8843]], ['supsetneqq', [10956]], ['supsim', [10952]], ['supsub', [10964]], ['supsup', [10966]], ['swarhk', [10534]], ['swarr', [8601]], ['swArr', [8665]], ['swarrow', [8601]], ['swnwar', [10538]], ['szlig', [223]], ['Tab', [9]], ['target', [8982]], ['Tau', [932]], ['tau', [964]], ['tbrk', [9140]], ['Tcaron', [356]], ['tcaron', [357]], ['Tcedil', [354]], ['tcedil', [355]], ['Tcy', [1058]], ['tcy', [1090]], ['tdot', [8411]], ['telrec', [8981]], ['Tfr', [120087]], ['tfr', [120113]], ['there4', [8756]], ['therefore', [8756]], ['Therefore', [8756]], ['Theta', [920]], ['theta', [952]], ['thetasym', [977]], ['thetav', [977]], ['thickapprox', [8776]], ['thicksim', [8764]], ['ThickSpace', [8287, 8202]], ['ThinSpace', [8201]], ['thinsp', [8201]], ['thkap', [8776]], ['thksim', [8764]], ['THORN', [222]], ['thorn', [254]], ['tilde', [732]], ['Tilde', [8764]], ['TildeEqual', [8771]], ['TildeFullEqual', [8773]], ['TildeTilde', [8776]], ['timesbar', [10801]], ['timesb', [8864]], ['times', [215]], ['timesd', [10800]], ['tint', [8749]], ['toea', [10536]], ['topbot', [9014]], ['topcir', [10993]], ['top', [8868]], ['Topf', [120139]], ['topf', [120165]], ['topfork', [10970]], ['tosa', [10537]], ['tprime', [8244]], ['trade', [8482]], ['TRADE', [8482]], ['triangle', [9653]], ['triangledown', [9663]], ['triangleleft', [9667]], ['trianglelefteq', [8884]], ['triangleq', [8796]], ['triangleright', [9657]], ['trianglerighteq', [8885]], ['tridot', [9708]], ['trie', [8796]], ['triminus', [10810]], ['TripleDot', [8411]], ['triplus', [10809]], ['trisb', [10701]], ['tritime', [10811]], ['trpezium', [9186]], ['Tscr', [119983]], ['tscr', [120009]], ['TScy', [1062]], ['tscy', [1094]], ['TSHcy', [1035]], ['tshcy', [1115]], ['Tstrok', [358]], ['tstrok', [359]], ['twixt', [8812]], ['twoheadleftarrow', [8606]], ['twoheadrightarrow', [8608]], ['Uacute', [218]], ['uacute', [250]], ['uarr', [8593]], ['Uarr', [8607]], ['uArr', [8657]], ['Uarrocir', [10569]], ['Ubrcy', [1038]], ['ubrcy', [1118]], ['Ubreve', [364]], ['ubreve', [365]], ['Ucirc', [219]], ['ucirc', [251]], ['Ucy', [1059]], ['ucy', [1091]], ['udarr', [8645]], ['Udblac', [368]], ['udblac', [369]], ['udhar', [10606]], ['ufisht', [10622]], ['Ufr', [120088]], ['ufr', [120114]], ['Ugrave', [217]], ['ugrave', [249]], ['uHar', [10595]], ['uharl', [8639]], ['uharr', [8638]], ['uhblk', [9600]], ['ulcorn', [8988]], ['ulcorner', [8988]], ['ulcrop', [8975]], ['ultri', [9720]], ['Umacr', [362]], ['umacr', [363]], ['uml', [168]], ['UnderBar', [95]], ['UnderBrace', [9183]], ['UnderBracket', [9141]], ['UnderParenthesis', [9181]], ['Union', [8899]], ['UnionPlus', [8846]], ['Uogon', [370]], ['uogon', [371]], ['Uopf', [120140]], ['uopf', [120166]], ['UpArrowBar', [10514]], ['uparrow', [8593]], ['UpArrow', [8593]], ['Uparrow', [8657]], ['UpArrowDownArrow', [8645]], ['updownarrow', [8597]], ['UpDownArrow', [8597]], ['Updownarrow', [8661]], ['UpEquilibrium', [10606]], ['upharpoonleft', [8639]], ['upharpoonright', [8638]], ['uplus', [8846]], ['UpperLeftArrow', [8598]], ['UpperRightArrow', [8599]], ['upsi', [965]], ['Upsi', [978]], ['upsih', [978]], ['Upsilon', [933]], ['upsilon', [965]], ['UpTeeArrow', [8613]], ['UpTee', [8869]], ['upuparrows', [8648]], ['urcorn', [8989]], ['urcorner', [8989]], ['urcrop', [8974]], ['Uring', [366]], ['uring', [367]], ['urtri', [9721]], ['Uscr', [119984]], ['uscr', [120010]], ['utdot', [8944]], ['Utilde', [360]], ['utilde', [361]], ['utri', [9653]], ['utrif', [9652]], ['uuarr', [8648]], ['Uuml', [220]], ['uuml', [252]], ['uwangle', [10663]], ['vangrt', [10652]], ['varepsilon', [1013]], ['varkappa', [1008]], ['varnothing', [8709]], ['varphi', [981]], ['varpi', [982]], ['varpropto', [8733]], ['varr', [8597]], ['vArr', [8661]], ['varrho', [1009]], ['varsigma', [962]], ['varsubsetneq', [8842, 65024]], ['varsubsetneqq', [10955, 65024]], ['varsupsetneq', [8843, 65024]], ['varsupsetneqq', [10956, 65024]], ['vartheta', [977]], ['vartriangleleft', [8882]], ['vartriangleright', [8883]], ['vBar', [10984]], ['Vbar', [10987]], ['vBarv', [10985]], ['Vcy', [1042]], ['vcy', [1074]], ['vdash', [8866]], ['vDash', [8872]], ['Vdash', [8873]], ['VDash', [8875]], ['Vdashl', [10982]], ['veebar', [8891]], ['vee', [8744]], ['Vee', [8897]], ['veeeq', [8794]], ['vellip', [8942]], ['verbar', [124]], ['Verbar', [8214]], ['vert', [124]], ['Vert', [8214]], ['VerticalBar', [8739]], ['VerticalLine', [124]], ['VerticalSeparator', [10072]], ['VerticalTilde', [8768]], ['VeryThinSpace', [8202]], ['Vfr', [120089]], ['vfr', [120115]], ['vltri', [8882]], ['vnsub', [8834, 8402]], ['vnsup', [8835, 8402]], ['Vopf', [120141]], ['vopf', [120167]], ['vprop', [8733]], ['vrtri', [8883]], ['Vscr', [119985]], ['vscr', [120011]], ['vsubnE', [10955, 65024]], ['vsubne', [8842, 65024]], ['vsupnE', [10956, 65024]], ['vsupne', [8843, 65024]], ['Vvdash', [8874]], ['vzigzag', [10650]], ['Wcirc', [372]], ['wcirc', [373]], ['wedbar', [10847]], ['wedge', [8743]], ['Wedge', [8896]], ['wedgeq', [8793]], ['weierp', [8472]], ['Wfr', [120090]], ['wfr', [120116]], ['Wopf', [120142]], ['wopf', [120168]], ['wp', [8472]], ['wr', [8768]], ['wreath', [8768]], ['Wscr', [119986]], ['wscr', [120012]], ['xcap', [8898]], ['xcirc', [9711]], ['xcup', [8899]], ['xdtri', [9661]], ['Xfr', [120091]], ['xfr', [120117]], ['xharr', [10231]], ['xhArr', [10234]], ['Xi', [926]], ['xi', [958]], ['xlarr', [10229]], ['xlArr', [10232]], ['xmap', [10236]], ['xnis', [8955]], ['xodot', [10752]], ['Xopf', [120143]], ['xopf', [120169]], ['xoplus', [10753]], ['xotime', [10754]], ['xrarr', [10230]], ['xrArr', [10233]], ['Xscr', [119987]], ['xscr', [120013]], ['xsqcup', [10758]], ['xuplus', [10756]], ['xutri', [9651]], ['xvee', [8897]], ['xwedge', [8896]], ['Yacute', [221]], ['yacute', [253]], ['YAcy', [1071]], ['yacy', [1103]], ['Ycirc', [374]], ['ycirc', [375]], ['Ycy', [1067]], ['ycy', [1099]], ['yen', [165]], ['Yfr', [120092]], ['yfr', [120118]], ['YIcy', [1031]], ['yicy', [1111]], ['Yopf', [120144]], ['yopf', [120170]], ['Yscr', [119988]], ['yscr', [120014]], ['YUcy', [1070]], ['yucy', [1102]], ['yuml', [255]], ['Yuml', [376]], ['Zacute', [377]], ['zacute', [378]], ['Zcaron', [381]], ['zcaron', [382]], ['Zcy', [1047]], ['zcy', [1079]], ['Zdot', [379]], ['zdot', [380]], ['zeetrf', [8488]], ['ZeroWidthSpace', [8203]], ['Zeta', [918]], ['zeta', [950]], ['zfr', [120119]], ['Zfr', [8488]], ['ZHcy', [1046]], ['zhcy', [1078]], ['zigrarr', [8669]], ['zopf', [120171]], ['Zopf', [8484]], ['Zscr', [119989]], ['zscr', [120015]], ['zwj', [8205]], ['zwnj', [8204]]];

var alphaIndex = {};
var charIndex = {};

createIndexes(alphaIndex, charIndex);

/**
 * @constructor
 */
function Html5Entities() {}

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.decode = function(str) {
    if (!str || !str.length) {
        return '';
    }
    return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
        var chr;
        if (entity.charAt(0) === "#") {
            var code = entity.charAt(1) === 'x' ?
                parseInt(entity.substr(2).toLowerCase(), 16) :
                parseInt(entity.substr(1));

            if (!(isNaN(code) || code < -32768 || code > 65535)) {
                chr = String.fromCharCode(code);
            }
        } else {
            chr = alphaIndex[entity];
        }
        return chr || s;
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.decode = function(str) {
    return new Html5Entities().decode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.encode = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var charInfo = charIndex[str.charCodeAt(i)];
        if (charInfo) {
            var alpha = charInfo[str.charCodeAt(i + 1)];
            if (alpha) {
                i++;
            } else {
                alpha = charInfo[''];
            }
            if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
            }
        }
        result += str.charAt(i);
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.encode = function(str) {
    return new Html5Entities().encode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.encodeNonUTF = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        var charInfo = charIndex[c];
        if (charInfo) {
            var alpha = charInfo[str.charCodeAt(i + 1)];
            if (alpha) {
                i++;
            } else {
                alpha = charInfo[''];
            }
            if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
            }
        }
        if (c < 32 || c > 126) {
            result += '&#' + c + ';';
        } else {
            result += str.charAt(i);
        }
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.encodeNonUTF = function(str) {
    return new Html5Entities().encodeNonUTF(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.encodeNonASCII = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        if (c <= 255) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.encodeNonASCII = function(str) {
    return new Html5Entities().encodeNonASCII(str);
 };

/**
 * @param {Object} alphaIndex Passed by reference.
 * @param {Object} charIndex Passed by reference.
 */
function createIndexes(alphaIndex, charIndex) {
    var i = ENTITIES.length;
    var _results = [];
    while (i--) {
        var e = ENTITIES[i];
        var alpha = e[0];
        var chars = e[1];
        var chr = chars[0];
        var addChar = (chr < 32 || chr > 126) || chr === 62 || chr === 60 || chr === 38 || chr === 34 || chr === 39;
        var charInfo;
        if (addChar) {
            charInfo = charIndex[chr] = charIndex[chr] || {};
        }
        if (chars[1]) {
            var chr2 = chars[1];
            alphaIndex[alpha] = String.fromCharCode(chr) + String.fromCharCode(chr2);
            _results.push(addChar && (charInfo[chr2] = alpha));
        } else {
            alphaIndex[alpha] = String.fromCharCode(chr);
            _results.push(addChar && (charInfo[''] = alpha));
        }
    }
}

module.exports = Html5Entities;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    var obj;

    while (queue.length) {
        var item = queue.pop();
        obj = item.obj[item.prop];

        if (Array.isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }

    return obj;
};

exports.arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function merge(target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports.arrayToObject(target, options);
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                if (target[i] && typeof target[i] === 'object') {
                    target[i] = exports.merge(target[i], item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = exports.merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

exports.assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

exports.decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function encode(str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

exports.compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    return compactQueue(queue);
};

exports.isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function isBuffer(obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;

module.exports = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo: 完成兄弟组件之间的通信
exports.default = new _vue2.default();

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Success_vue__ = __webpack_require__(84);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Success_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Success_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_30ea8b75_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Success_vue__ = __webpack_require__(85);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(83)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-30ea8b75"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Success_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_30ea8b75_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Success_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/Success.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-30ea8b75", Component.options)
  } else {
    hotAPI.reload("data-v-30ea8b75", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponGift_vue__ = __webpack_require__(133);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponGift_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponGift_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ed0e2a92_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_CouponGift_vue__ = __webpack_require__(134);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(132)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-ed0e2a92"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponGift_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ed0e2a92_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_CouponGift_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/CouponGift.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ed0e2a92", Component.options)
  } else {
    hotAPI.reload("data-v-ed0e2a92", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponOrder_vue__ = __webpack_require__(136);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponOrder_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponOrder_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6eead9d7_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_CouponOrder_vue__ = __webpack_require__(137);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(135)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-6eead9d7"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_CouponOrder_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6eead9d7_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_CouponOrder_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/CouponOrder.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6eead9d7", Component.options)
  } else {
    hotAPI.reload("data-v-6eead9d7", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(7))(13);

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(19);
module.exports = __webpack_require__(30);


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hotClient = __webpack_require__(20);

hotClient.subscribe(function (event) {
  if (event.action === 'reload') {
    window.location.reload();
  }
});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {/*eslint-env browser*/
/*global __resourceQuery __webpack_public_path__*/

var options = {
  path: "/__webpack_hmr",
  timeout: 20 * 1000,
  overlay: true,
  reload: false,
  log: true,
  warn: true,
  name: '',
  autoConnect: true
};
if (false) {
  var querystring = require('querystring');
  var overrides = querystring.parse(__resourceQuery.slice(1));
  setOverrides(overrides);
}

if (typeof window === 'undefined') {
  // do nothing
} else if (typeof window.EventSource === 'undefined') {
  console.warn(
    "webpack-hot-middleware's client requires EventSource to work. " +
    "You should include a polyfill if you want to support this browser: " +
    "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events#Tools"
  );
} else {
  if (options.autoConnect) {
    connect();
  }
}

/* istanbul ignore next */
function setOptionsAndConnect(overrides) {
  setOverrides(overrides);
  connect();
}

function setOverrides(overrides) {
  if (overrides.autoConnect) options.autoConnect = overrides.autoConnect == 'true';
  if (overrides.path) options.path = overrides.path;
  if (overrides.timeout) options.timeout = overrides.timeout;
  if (overrides.overlay) options.overlay = overrides.overlay !== 'false';
  if (overrides.reload) options.reload = overrides.reload !== 'false';
  if (overrides.noInfo && overrides.noInfo !== 'false') {
    options.log = false;
  }
  if (overrides.name) {
    options.name = overrides.name;
  }
  if (overrides.quiet && overrides.quiet !== 'false') {
    options.log = false;
    options.warn = false;
  }

  if (overrides.dynamicPublicPath) {
    options.path = __webpack_require__.p + options.path;
  }
}

function EventSourceWrapper() {
  var source;
  var lastActivity = new Date();
  var listeners = [];

  init();
  var timer = setInterval(function() {
    if ((new Date() - lastActivity) > options.timeout) {
      handleDisconnect();
    }
  }, options.timeout / 2);

  function init() {
    source = new window.EventSource(options.path);
    source.onopen = handleOnline;
    source.onerror = handleDisconnect;
    source.onmessage = handleMessage;
  }

  function handleOnline() {
    if (options.log) console.log("[HMR] connected");
    lastActivity = new Date();
  }

  function handleMessage(event) {
    lastActivity = new Date();
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](event);
    }
  }

  function handleDisconnect() {
    clearInterval(timer);
    source.close();
    setTimeout(init, options.timeout);
  }

  return {
    addMessageListener: function(fn) {
      listeners.push(fn);
    }
  };
}

function getEventSourceWrapper() {
  if (!window.__whmEventSourceWrapper) {
    window.__whmEventSourceWrapper = {};
  }
  if (!window.__whmEventSourceWrapper[options.path]) {
    // cache the wrapper for other entries loaded on
    // the same page with the same options.path
    window.__whmEventSourceWrapper[options.path] = EventSourceWrapper();
  }
  return window.__whmEventSourceWrapper[options.path];
}

function connect() {
  getEventSourceWrapper().addMessageListener(handleMessage);

  function handleMessage(event) {
    if (event.data == "\uD83D\uDC93") {
      return;
    }
    try {
      processMessage(JSON.parse(event.data));
    } catch (ex) {
      if (options.warn) {
        console.warn("Invalid HMR message: " + event.data + "\n" + ex);
      }
    }
  }
}

// the reporter needs to be a singleton on the page
// in case the client is being used by multiple bundles
// we only want to report once.
// all the errors will go to all clients
var singletonKey = '__webpack_hot_middleware_reporter__';
var reporter;
if (typeof window !== 'undefined') {
  if (!window[singletonKey]) {
    window[singletonKey] = createReporter();
  }
  reporter = window[singletonKey];
}

function createReporter() {
  var strip = __webpack_require__(22);

  var overlay;
  if (typeof document !== 'undefined' && options.overlay) {
    overlay = __webpack_require__(24);
  }

  var styles = {
    errors: "color: #ff0000;",
    warnings: "color: #999933;"
  };
  var previousProblems = null;
  function log(type, obj) {
    var newProblems = obj[type].map(function(msg) { return strip(msg); }).join('\n');
    if (previousProblems == newProblems) {
      return;
    } else {
      previousProblems = newProblems;
    }

    var style = styles[type];
    var name = obj.name ? "'" + obj.name + "' " : "";
    var title = "[HMR] bundle " + name + "has " + obj[type].length + " " + type;
    // NOTE: console.warn or console.error will print the stack trace
    // which isn't helpful here, so using console.log to escape it.
    if (console.group && console.groupEnd) {
      console.group("%c" + title, style);
      console.log("%c" + newProblems, style);
      console.groupEnd();
    } else {
      console.log(
        "%c" + title + "\n\t%c" + newProblems.replace(/\n/g, "\n\t"),
        style + "font-weight: bold;",
        style + "font-weight: normal;"
      );
    }
  }

  return {
    cleanProblemsCache: function () {
      previousProblems = null;
    },
    problems: function(type, obj) {
      if (options.warn) {
        log(type, obj);
      }
      if (overlay && type !== 'warnings') overlay.showProblems(type, obj[type]);
    },
    success: function() {
      if (overlay) overlay.clear();
    },
    useCustomOverlay: function(customOverlay) {
      overlay = customOverlay;
    }
  };
}

var processUpdate = __webpack_require__(29);

var customHandler;
var subscribeAllHandler;
function processMessage(obj) {
  switch(obj.action) {
    case "building":
      if (options.log) {
        console.log(
          "[HMR] bundle " + (obj.name ? "'" + obj.name + "' " : "") +
          "rebuilding"
        );
      }
      break;
    case "built":
      if (options.log) {
        console.log(
          "[HMR] bundle " + (obj.name ? "'" + obj.name + "' " : "") +
          "rebuilt in " + obj.time + "ms"
        );
      }
      // fall through
    case "sync":
      if (obj.name && options.name && obj.name !== options.name) {
        return;
      }
      if (obj.errors.length > 0) {
        if (reporter) reporter.problems('errors', obj);
      } else {
        if (reporter) {
          if (obj.warnings.length > 0) {
            reporter.problems('warnings', obj);
          } else {
            reporter.cleanProblemsCache();
          }
          reporter.success();
        }
        processUpdate(obj.hash, obj.modules, options);
      }
      break;
    default:
      if (customHandler) {
        customHandler(obj);
      }
  }

  if (subscribeAllHandler) {
    subscribeAllHandler(obj);
  }
}

if (module) {
  module.exports = {
    subscribeAll: function subscribeAll(handler) {
      subscribeAllHandler = handler;
    },
    subscribe: function subscribe(handler) {
      customHandler = handler;
    },
    useCustomOverlay: function useCustomOverlay(customOverlay) {
      if (reporter) reporter.useCustomOverlay(customOverlay);
    },
    setOptionsAndConnect: setOptionsAndConnect
  };
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)(module)))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(7))(37);

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ansiRegex = __webpack_require__(23)();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g;
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

/*eslint-env browser*/

var clientOverlay = document.createElement('div');
clientOverlay.id = 'webpack-hot-middleware-clientOverlay';
var styles = {
  background: 'rgba(0,0,0,0.85)',
  color: '#E8E8E8',
  lineHeight: '1.2',
  whiteSpace: 'pre',
  fontFamily: 'Menlo, Consolas, monospace',
  fontSize: '13px',
  position: 'fixed',
  zIndex: 9999,
  padding: '10px',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  overflow: 'auto',
  dir: 'ltr',
  textAlign: 'left'
};
for (var key in styles) {
  clientOverlay.style[key] = styles[key];
}

var ansiHTML = __webpack_require__(25);
var colors = {
  reset: ['transparent', 'transparent'],
  black: '181818',
  red: 'E36049',
  green: 'B3CB74',
  yellow: 'FFD080',
  blue: '7CAFC2',
  magenta: '7FACCA',
  cyan: 'C3C2EF',
  lightgrey: 'EBE7E3',
  darkgrey: '6D7891'
};
ansiHTML.setColors(colors);

var Entities = __webpack_require__(26).AllHtmlEntities;
var entities = new Entities();

exports.showProblems =
function showProblems(type, lines) {
  clientOverlay.innerHTML = '';
  lines.forEach(function(msg) {
    msg = ansiHTML(entities.encode(msg));
    var div = document.createElement('div');
    div.style.marginBottom = '26px';
    div.innerHTML = problemType(type) + ' in ' + msg;
    clientOverlay.appendChild(div);
  });
  if (document.body) {
    document.body.appendChild(clientOverlay);
  }
};

exports.clear =
function clear() {
  if (document.body && clientOverlay.parentNode) {
    document.body.removeChild(clientOverlay);
  }
};

var problemColors = {
  errors: colors.red,
  warnings: colors.yellow
};

function problemType (type) {
  var color = problemColors[type] || colors.red;
  return (
    '<span style="background-color:#' + color + '; color:#fff; padding:2px 4px; border-radius: 2px">' +
      type.slice(0, -1).toUpperCase() +
    '</span>'
  );
}


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = ansiHTML

// Reference to https://github.com/sindresorhus/ansi-regex
var _regANSI = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/

var _defColors = {
  reset: ['fff', '000'], // [FOREGROUD_COLOR, BACKGROUND_COLOR]
  black: '000',
  red: 'ff0000',
  green: '209805',
  yellow: 'e8bf03',
  blue: '0000ff',
  magenta: 'ff00ff',
  cyan: '00ffee',
  lightgrey: 'f0f0f0',
  darkgrey: '888'
}
var _styles = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
}
var _openTags = {
  '1': 'font-weight:bold', // bold
  '2': 'opacity:0.5', // dim
  '3': '<i>', // italic
  '4': '<u>', // underscore
  '8': 'display:none', // hidden
  '9': '<del>' // delete
}
var _closeTags = {
  '23': '</i>', // reset italic
  '24': '</u>', // reset underscore
  '29': '</del>' // reset delete
}

;[0, 21, 22, 27, 28, 39, 49].forEach(function (n) {
  _closeTags[n] = '</span>'
})

/**
 * Converts text with ANSI color codes to HTML markup.
 * @param {String} text
 * @returns {*}
 */
function ansiHTML (text) {
  // Returns the text if the string has no ANSI escape code.
  if (!_regANSI.test(text)) {
    return text
  }

  // Cache opened sequence.
  var ansiCodes = []
  // Replace with markup.
  var ret = text.replace(/\033\[(\d+)*m/g, function (match, seq) {
    var ot = _openTags[seq]
    if (ot) {
      // If current sequence has been opened, close it.
      if (!!~ansiCodes.indexOf(seq)) { // eslint-disable-line no-extra-boolean-cast
        ansiCodes.pop()
        return '</span>'
      }
      // Open tag.
      ansiCodes.push(seq)
      return ot[0] === '<' ? ot : '<span style="' + ot + ';">'
    }

    var ct = _closeTags[seq]
    if (ct) {
      // Pop sequence
      ansiCodes.pop()
      return ct
    }
    return ''
  })

  // Make sure tags are closed.
  var l = ansiCodes.length
  ;(l > 0) && (ret += Array(l + 1).join('</span>'))

  return ret
}

/**
 * Customize colors.
 * @param {Object} colors reference to _defColors
 */
ansiHTML.setColors = function (colors) {
  if (typeof colors !== 'object') {
    throw new Error('`colors` parameter must be an Object.')
  }

  var _finalColors = {}
  for (var key in _defColors) {
    var hex = colors.hasOwnProperty(key) ? colors[key] : null
    if (!hex) {
      _finalColors[key] = _defColors[key]
      continue
    }
    if ('reset' === key) {
      if (typeof hex === 'string') {
        hex = [hex]
      }
      if (!Array.isArray(hex) || hex.length === 0 || hex.some(function (h) {
        return typeof h !== 'string'
      })) {
        throw new Error('The value of `' + key + '` property must be an Array and each item could only be a hex string, e.g.: FF0000')
      }
      var defHexColor = _defColors[key]
      if (!hex[0]) {
        hex[0] = defHexColor[0]
      }
      if (hex.length === 1 || !hex[1]) {
        hex = [hex[0]]
        hex.push(defHexColor[1])
      }

      hex = hex.slice(0, 2)
    } else if (typeof hex !== 'string') {
      throw new Error('The value of `' + key + '` property must be a hex string, e.g.: FF0000')
    }
    _finalColors[key] = hex
  }
  _setTags(_finalColors)
}

/**
 * Reset colors.
 */
ansiHTML.reset = function () {
  _setTags(_defColors)
}

/**
 * Expose tags, including open and close.
 * @type {Object}
 */
ansiHTML.tags = {}

if (Object.defineProperty) {
  Object.defineProperty(ansiHTML.tags, 'open', {
    get: function () { return _openTags }
  })
  Object.defineProperty(ansiHTML.tags, 'close', {
    get: function () { return _closeTags }
  })
} else {
  ansiHTML.tags.open = _openTags
  ansiHTML.tags.close = _closeTags
}

function _setTags (colors) {
  // reset all
  _openTags['0'] = 'font-weight:normal;opacity:1;color:#' + colors.reset[0] + ';background:#' + colors.reset[1]
  // inverse
  _openTags['7'] = 'color:#' + colors.reset[1] + ';background:#' + colors.reset[0]
  // dark grey
  _openTags['90'] = 'color:#' + colors.darkgrey

  for (var code in _styles) {
    var color = _styles[code]
    var oriColor = colors[color] || '000'
    _openTags[code] = 'color:#' + oriColor
    code = parseInt(code)
    _openTags[(code + 10).toString()] = 'background:#' + oriColor
  }
}

ansiHTML.reset()


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  XmlEntities: __webpack_require__(27),
  Html4Entities: __webpack_require__(28),
  Html5Entities: __webpack_require__(10),
  AllHtmlEntities: __webpack_require__(10)
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

var ALPHA_INDEX = {
    '&lt': '<',
    '&gt': '>',
    '&quot': '"',
    '&apos': '\'',
    '&amp': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': '\'',
    '&amp;': '&'
};

var CHAR_INDEX = {
    60: 'lt',
    62: 'gt',
    34: 'quot',
    39: 'apos',
    38: 'amp'
};

var CHAR_S_INDEX = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;',
    '&': '&amp;'
};

/**
 * @constructor
 */
function XmlEntities() {}

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.encode = function(str) {
    if (!str || !str.length) {
        return '';
    }
    return str.replace(/<|>|"|'|&/g, function(s) {
        return CHAR_S_INDEX[s];
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.encode = function(str) {
    return new XmlEntities().encode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.decode = function(str) {
    if (!str || !str.length) {
        return '';
    }
    return str.replace(/&#?[0-9a-zA-Z]+;?/g, function(s) {
        if (s.charAt(1) === '#') {
            var code = s.charAt(2).toLowerCase() === 'x' ?
                parseInt(s.substr(3), 16) :
                parseInt(s.substr(2));

            if (isNaN(code) || code < -32768 || code > 65535) {
                return '';
            }
            return String.fromCharCode(code);
        }
        return ALPHA_INDEX[s] || s;
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.decode = function(str) {
    return new XmlEntities().decode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.encodeNonUTF = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        var alpha = CHAR_INDEX[c];
        if (alpha) {
            result += "&" + alpha + ";";
            i++;
            continue;
        }
        if (c < 32 || c > 126) {
            result += '&#' + c + ';';
        } else {
            result += str.charAt(i);
        }
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.encodeNonUTF = function(str) {
    return new XmlEntities().encodeNonUTF(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.encodeNonASCII = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLenght = str.length;
    var result = '';
    var i = 0;
    while (i < strLenght) {
        var c = str.charCodeAt(i);
        if (c <= 255) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.encodeNonASCII = function(str) {
    return new XmlEntities().encodeNonASCII(str);
 };

module.exports = XmlEntities;


/***/ }),
/* 28 */
/***/ (function(module, exports) {

var HTML_ALPHA = ['apos', 'nbsp', 'iexcl', 'cent', 'pound', 'curren', 'yen', 'brvbar', 'sect', 'uml', 'copy', 'ordf', 'laquo', 'not', 'shy', 'reg', 'macr', 'deg', 'plusmn', 'sup2', 'sup3', 'acute', 'micro', 'para', 'middot', 'cedil', 'sup1', 'ordm', 'raquo', 'frac14', 'frac12', 'frac34', 'iquest', 'Agrave', 'Aacute', 'Acirc', 'Atilde', 'Auml', 'Aring', 'Aelig', 'Ccedil', 'Egrave', 'Eacute', 'Ecirc', 'Euml', 'Igrave', 'Iacute', 'Icirc', 'Iuml', 'ETH', 'Ntilde', 'Ograve', 'Oacute', 'Ocirc', 'Otilde', 'Ouml', 'times', 'Oslash', 'Ugrave', 'Uacute', 'Ucirc', 'Uuml', 'Yacute', 'THORN', 'szlig', 'agrave', 'aacute', 'acirc', 'atilde', 'auml', 'aring', 'aelig', 'ccedil', 'egrave', 'eacute', 'ecirc', 'euml', 'igrave', 'iacute', 'icirc', 'iuml', 'eth', 'ntilde', 'ograve', 'oacute', 'ocirc', 'otilde', 'ouml', 'divide', 'oslash', 'ugrave', 'uacute', 'ucirc', 'uuml', 'yacute', 'thorn', 'yuml', 'quot', 'amp', 'lt', 'gt', 'OElig', 'oelig', 'Scaron', 'scaron', 'Yuml', 'circ', 'tilde', 'ensp', 'emsp', 'thinsp', 'zwnj', 'zwj', 'lrm', 'rlm', 'ndash', 'mdash', 'lsquo', 'rsquo', 'sbquo', 'ldquo', 'rdquo', 'bdquo', 'dagger', 'Dagger', 'permil', 'lsaquo', 'rsaquo', 'euro', 'fnof', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigmaf', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'thetasym', 'upsih', 'piv', 'bull', 'hellip', 'prime', 'Prime', 'oline', 'frasl', 'weierp', 'image', 'real', 'trade', 'alefsym', 'larr', 'uarr', 'rarr', 'darr', 'harr', 'crarr', 'lArr', 'uArr', 'rArr', 'dArr', 'hArr', 'forall', 'part', 'exist', 'empty', 'nabla', 'isin', 'notin', 'ni', 'prod', 'sum', 'minus', 'lowast', 'radic', 'prop', 'infin', 'ang', 'and', 'or', 'cap', 'cup', 'int', 'there4', 'sim', 'cong', 'asymp', 'ne', 'equiv', 'le', 'ge', 'sub', 'sup', 'nsub', 'sube', 'supe', 'oplus', 'otimes', 'perp', 'sdot', 'lceil', 'rceil', 'lfloor', 'rfloor', 'lang', 'rang', 'loz', 'spades', 'clubs', 'hearts', 'diams'];
var HTML_CODES = [39, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 34, 38, 60, 62, 338, 339, 352, 353, 376, 710, 732, 8194, 8195, 8201, 8204, 8205, 8206, 8207, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8224, 8225, 8240, 8249, 8250, 8364, 402, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 931, 932, 933, 934, 935, 936, 937, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 977, 978, 982, 8226, 8230, 8242, 8243, 8254, 8260, 8472, 8465, 8476, 8482, 8501, 8592, 8593, 8594, 8595, 8596, 8629, 8656, 8657, 8658, 8659, 8660, 8704, 8706, 8707, 8709, 8711, 8712, 8713, 8715, 8719, 8721, 8722, 8727, 8730, 8733, 8734, 8736, 8743, 8744, 8745, 8746, 8747, 8756, 8764, 8773, 8776, 8800, 8801, 8804, 8805, 8834, 8835, 8836, 8838, 8839, 8853, 8855, 8869, 8901, 8968, 8969, 8970, 8971, 9001, 9002, 9674, 9824, 9827, 9829, 9830];

var alphaIndex = {};
var numIndex = {};

var i = 0;
var length = HTML_ALPHA.length;
while (i < length) {
    var a = HTML_ALPHA[i];
    var c = HTML_CODES[i];
    alphaIndex[a] = String.fromCharCode(c);
    numIndex[c] = a;
    i++;
}

/**
 * @constructor
 */
function Html4Entities() {}

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.decode = function(str) {
    if (!str || !str.length) {
        return '';
    }
    return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
        var chr;
        if (entity.charAt(0) === "#") {
            var code = entity.charAt(1).toLowerCase() === 'x' ?
                parseInt(entity.substr(2), 16) :
                parseInt(entity.substr(1));

            if (!(isNaN(code) || code < -32768 || code > 65535)) {
                chr = String.fromCharCode(code);
            }
        } else {
            chr = alphaIndex[entity];
        }
        return chr || s;
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.decode = function(str) {
    return new Html4Entities().decode(str);
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.encode = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var alpha = numIndex[str.charCodeAt(i)];
        result += alpha ? "&" + alpha + ";" : str.charAt(i);
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.encode = function(str) {
    return new Html4Entities().encode(str);
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.encodeNonUTF = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var cc = str.charCodeAt(i);
        var alpha = numIndex[cc];
        if (alpha) {
            result += "&" + alpha + ";";
        } else if (cc < 32 || cc > 126) {
            result += "&#" + cc + ";";
        } else {
            result += str.charAt(i);
        }
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.encodeNonUTF = function(str) {
    return new Html4Entities().encodeNonUTF(str);
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.encodeNonASCII = function(str) {
    if (!str || !str.length) {
        return '';
    }
    var strLength = str.length;
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        if (c <= 255) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.encodeNonASCII = function(str) {
    return new Html4Entities().encodeNonASCII(str);
};

module.exports = Html4Entities;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Based heavily on https://github.com/webpack/webpack/blob/
 *  c0afdf9c6abc1dd70707c594e473802a566f7b6e/hot/only-dev-server.js
 * Original copyright Tobias Koppers @sokra (MIT license)
 */

/* global window __webpack_hash__ */

if (false) {
  throw new Error("[HMR] Hot Module Replacement is disabled.");
}

var hmrDocsUrl = "https://webpack.js.org/concepts/hot-module-replacement/"; // eslint-disable-line max-len

var lastHash;
var failureStatuses = { abort: 1, fail: 1 };
var applyOptions = { 				
  ignoreUnaccepted: true,
  ignoreDeclined: true,
  ignoreErrored: true,
  onUnaccepted: function(data) {
    console.warn("Ignored an update to unaccepted module " + data.chain.join(" -> "));
  },
  onDeclined: function(data) {
    console.warn("Ignored an update to declined module " + data.chain.join(" -> "));
  },
  onErrored: function(data) {
    console.error(data.error);
    console.warn("Ignored an error while updating module " + data.moduleId + " (" + data.type + ")");
  } 
}

function upToDate(hash) {
  if (hash) lastHash = hash;
  return lastHash == __webpack_require__.h();
}

module.exports = function(hash, moduleMap, options) {
  var reload = options.reload;
  if (!upToDate(hash) && module.hot.status() == "idle") {
    if (options.log) console.log("[HMR] Checking for updates on the server...");
    check();
  }

  function check() {
    var cb = function(err, updatedModules) {
      if (err) return handleError(err);

      if(!updatedModules) {
        if (options.warn) {
          console.warn("[HMR] Cannot find update (Full reload needed)");
          console.warn("[HMR] (Probably because of restarting the server)");
        }
        performReload();
        return null;
      }

      var applyCallback = function(applyErr, renewedModules) {
        if (applyErr) return handleError(applyErr);

        if (!upToDate()) check();

        logUpdates(updatedModules, renewedModules);
      };

      var applyResult = module.hot.apply(applyOptions, applyCallback);
      // webpack 2 promise
      if (applyResult && applyResult.then) {
        // HotModuleReplacement.runtime.js refers to the result as `outdatedModules`
        applyResult.then(function(outdatedModules) {
          applyCallback(null, outdatedModules);
        });
        applyResult.catch(applyCallback);
      }

    };

    var result = module.hot.check(false, cb);
    // webpack 2 promise
    if (result && result.then) {
        result.then(function(updatedModules) {
            cb(null, updatedModules);
        });
        result.catch(cb);
    }
  }

  function logUpdates(updatedModules, renewedModules) {
    var unacceptedModules = updatedModules.filter(function(moduleId) {
      return renewedModules && renewedModules.indexOf(moduleId) < 0;
    });

    if(unacceptedModules.length > 0) {
      if (options.warn) {
        console.warn(
          "[HMR] The following modules couldn't be hot updated: " +
          "(Full reload needed)\n" +
          "This is usually because the modules which have changed " +
          "(and their parents) do not know how to hot reload themselves. " +
          "See " + hmrDocsUrl + " for more details."
        );
        unacceptedModules.forEach(function(moduleId) {
          console.warn("[HMR]  - " + moduleMap[moduleId]);
        });
      }
      performReload();
      return;
    }

    if (options.log) {
      if(!renewedModules || renewedModules.length === 0) {
        console.log("[HMR] Nothing hot updated.");
      } else {
        console.log("[HMR] Updated modules:");
        renewedModules.forEach(function(moduleId) {
          console.log("[HMR]  - " + moduleMap[moduleId]);
        });
      }

      if (upToDate()) {
        console.log("[HMR] App is up to date.");
      }
    }
  }

  function handleError(err) {
    if (module.hot.status() in failureStatuses) {
      if (options.warn) {
        console.warn("[HMR] Cannot check for update (Full reload needed)");
        console.warn("[HMR] " + err.stack || err.message);
      }
      performReload();
      return;
    }
    if (options.warn) {
      console.warn("[HMR] Update check failed: " + err.stack || err.message);
    }
  }

  function performReload() {
    if (reload) {
      if (options.warn) console.warn("[HMR] Reloading page");
      window.location.reload();
    }
  }
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

var _router = __webpack_require__(31);

var _router2 = _interopRequireDefault(_router);

var _Index = __webpack_require__(144);

var _Index2 = _interopRequireDefault(_Index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _vue2.default({
  el: '#main',
  router: _router2.default,
  components: { Index: _Index2.default },
  render: function render(callback) {
    return callback(_Index2.default);
  }
});

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(32);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _iview = __webpack_require__(33);

var _iview2 = _interopRequireDefault(_iview);

var _Index = __webpack_require__(34);

var _Index2 = _interopRequireDefault(_Index);

var _Login = __webpack_require__(55);

var _Login2 = _interopRequireDefault(_Login);

var _List = __webpack_require__(59);

var _List2 = _interopRequireDefault(_List);

var _ShoppingCart = __webpack_require__(72);

var _ShoppingCart2 = _interopRequireDefault(_ShoppingCart);

var _PayInLine = __webpack_require__(79);

var _PayInLine2 = _interopRequireDefault(_PayInLine);

var _Success = __webpack_require__(14);

var _Success2 = _interopRequireDefault(_Success);

var _ConfirmOrder = __webpack_require__(86);

var _ConfirmOrder2 = _interopRequireDefault(_ConfirmOrder);

var _Details = __webpack_require__(94);

var _Details2 = _interopRequireDefault(_Details);

var _Information = __webpack_require__(102);

var _Information2 = _interopRequireDefault(_Information);

var _Personal = __webpack_require__(106);

var _Personal2 = _interopRequireDefault(_Personal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);
_vue2.default.use(_iview2.default);

exports.default = new _vueRouter2.default({
  routes: [{
    path: '/',
    name: 'index',
    component: _Index2.default
  }, {
    path: '/login',
    name: 'login',
    component: _Login2.default
  }, {
    path: '/list/:id',
    name: 'list',
    component: _List2.default
  }, {
    path: '/detail/:id',
    name: 'detail',
    component: _Details2.default,
    meta: ['首页', '购买红酒']
  }, {
    path: '/cart',
    name: 'cart',
    component: _ShoppingCart2.default
  }, {
    path: '/confirm',
    name: 'confirm',
    component: _ConfirmOrder2.default
  }, {
    path: '/pay',
    name: 'pay',
    component: _PayInLine2.default
  }, {
    path: '/success/:type',
    name: 'success',
    component: _Success2.default,
    props: true
  }, {
    path: '/information/:type',
    name: 'information',
    component: _Information2.default,
    props: true
  }, {
    path: '/personal',
    name: 'personal',
    component: _Personal2.default
  }]
});

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(7))(14);

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(7))(35);

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7e264344_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Index_vue__ = __webpack_require__(51);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(35)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-7e264344"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7e264344_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Index_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/Index.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7e264344", Component.options)
  } else {
    hotAPI.reload("data-v-7e264344", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 35 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _carousel = __webpack_require__(40);

var _carousel2 = _interopRequireDefault(_carousel);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'index',
  components: {
    Logo: _Logo2.default,
    Carousel: _carousel2.default
  },
  mounted: function mounted() {
    _Cart2.default.getCartList({
      $store: this.$store
    });
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),
/* 37 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//

exports.default = {
  name: 'login',
  props: ['title']
};

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("router-link", { attrs: { to: "/" } }, [
    _c("div", { staticClass: "logo" }, [_vm._v(_vm._s(_vm.title))])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-8d8663a8", esExports)
  }
}

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_carousel_vue__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_carousel_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_carousel_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_361a56c1_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_carousel_vue__ = __webpack_require__(43);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(41)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-361a56c1"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_carousel_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_361a56c1_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_carousel_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/carousel.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-361a56c1", Component.options)
  } else {
    hotAPI.reload("data-v-361a56c1", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 41 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'carousel',
  data: function data() {
    return {
      value: 0
    };
  }
};

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "Carousel",
    { staticClass: "carousel", attrs: { autoplay: "autoplay" } },
    [
      _c("CarouselItem", [
        _c("img", {
          staticClass: "kzj",
          attrs: { src: __webpack_require__(44) }
        })
      ]),
      _c("CarouselItem", [
        _c("img", {
          staticClass: "xgla",
          attrs: { src: __webpack_require__(45) }
        })
      ]),
      _c("CarouselItem", [
        _c("img", {
          staticClass: "ttc",
          attrs: { src: __webpack_require__(46) }
        })
      ])
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-361a56c1", esExports)
  }
}

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/banner1.jpg";

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/banner2.jpg";

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/banner3.jpg";

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(7))(15);

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stringify = __webpack_require__(49);
var parse = __webpack_require__(50);
var formats = __webpack_require__(12);

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(11);
var formats = __webpack_require__(12);

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify( // eslint-disable-line func-name-matching
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    formatter,
    encodeValuesOnly
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        } else {
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts ? utils.assign({}, opts) : {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
    if (typeof options.format === 'undefined') {
        options.format = formats['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encode ? encoder : null,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly
        ));
    }

    var joined = keys.join(delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    return joined.length > 0 ? prefix + joined : '';
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(11);

var has = Object.prototype.hasOwnProperty;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder);
            val = options.decoder(part.slice(pos + 1), defaults.decoder);
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options) {
    var leaf = val;

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]') {
            obj = [];
            obj = obj.concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts ? utils.assign({}, opts) : {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.ignoreQueryPrefix = options.ignoreQueryPrefix === true;
    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};


/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "prods" },
    [
      _c("div", { staticClass: "top" }, [_c("Logo")], 1),
      _c("Carousel"),
      _c("router-link", { staticClass: "KZJ", attrs: { to: "/list/1010" } }, [
        _c("img", { attrs: { src: __webpack_require__(52) } })
      ]),
      _c(
        "router-link",
        { staticClass: "XGLL-SRL", attrs: { to: "/list/1020" } },
        [_c("img", { attrs: { src: __webpack_require__(53) } })]
      ),
      _c("router-link", { staticClass: "TTC", attrs: { to: "/list/1030" } }, [
        _c("img", { attrs: { src: __webpack_require__(54) } })
      ])
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-7e264344", esExports)
  }
}

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/pic2_index.png";

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/pic3_index.png";

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/pic4_index.png";

/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Login_vue__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Login_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Login_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_47cde65b_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Login_vue__ = __webpack_require__(58);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(56)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-47cde65b"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Login_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_47cde65b_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Login_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/Login.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-47cde65b", Component.options)
  } else {
    hotAPI.reload("data-v-47cde65b", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 56 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } } //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//-import Search from 'modules/Search.vue';


exports.default = {
  name: 'index',
  components: {
    //-Search,
    Logo: _Logo2.default
  },
  data: function data() {
    return {
      src: '13',
      name: '',
      password: ''
    };
  },

  methods: {
    /*detail页添加到购物车*/
    login: function login(result) {
      var _this = this;

      var url = _urls2.default.BaseURL + '/api/right/login';
      if (this.name === '') {
        alert('请填写用户名或手机号');
        this.$refs.inputName.focus();
        return;
      } else if (this.password === '') {
        alert('请填写用户密码');
        this.$refs.inputPS.focus();
        return;
      }
      _AJAX2.default.post({
        url: url,
        data: {
          accountID: this.name,
          password: this.password
        },
        success: function success(res) {
          _newArrowCheck(this, _this);

          console.log('login:', res);
          if (!res.data) {
            console.warn('返回异常:', res.config.url);
            return;
          }
          if (String(res.data.code) === '0') {
            //alert(res.data.msg);
            this.$router.push('/');
          } else {
            alert(res.data.msg);
            console.warn(res.data.msg);
          }
        }.bind(this)
      });
    }
  }
};

/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "login" } }, [
    _c("div", { staticClass: "top" }, [_c("Logo")], 1),
    _c("main", { staticClass: "main" }, [
      _c("img", { staticClass: "img", attrs: { src: _vm.src } }),
      _c("div", { staticClass: "login-area" }, [
        _vm._m(0, false, false),
        _c("div", { staticClass: "form" }, [
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model:name",
                value: _vm.name,
                expression: "name",
                arg: "name"
              }
            ],
            ref: "inputName",
            staticClass: "name",
            attrs: { type: "text" },
            domProps: { value: _vm.name },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.name = $event.target.value
              }
            }
          }),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model:password",
                value: _vm.password,
                expression: "password",
                arg: "password"
              }
            ],
            ref: "inputPS",
            staticClass: "password",
            attrs: { type: "password", placeholder: "填写您的登录密码" },
            domProps: { value: _vm.password },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.password = $event.target.value
              }
            }
          }),
          _vm._m(1, false, false),
          _c("a", { staticClass: "login-active", on: { click: _vm.login } }, [
            _vm._v("登 录")
          ])
        ])
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("h3", { staticClass: "title" }, [
      _c("span", [_vm._v("登录")]),
      _c("span", { staticClass: "no-login" }, [
        _vm._v("没有帐号？"),
        _c("a", { attrs: { href: "#" } }, [_vm._v("立即注册")])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "auto-login" }, [
      _c("div", { staticClass: "auto" }, [
        _c("input", { attrs: { type: "checkbox", id: "auto" } }),
        _c("label", { attrs: { for: "auto" } }, [_vm._v("自动登录")])
      ]),
      _c("a", { staticClass: "forget-password", attrs: { href: "#" } }, [
        _vm._v("忘记密码?")
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-47cde65b", esExports)
  }
}

/***/ }),
/* 59 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_bfd37fc8_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_List_vue__ = __webpack_require__(70);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(60)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-bfd37fc8"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_bfd37fc8_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_List_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/List.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-bfd37fc8", Component.options)
  } else {
    hotAPI.reload("data-v-bfd37fc8", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 60 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SubMenu = __webpack_require__(62);

var _SubMenu2 = _interopRequireDefault(_SubMenu);

var _List = __webpack_require__(66);

var _List2 = _interopRequireDefault(_List);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

var _codes = __webpack_require__(8);

var _codes2 = _interopRequireDefault(_codes);

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _EventBus = __webpack_require__(13);

var _EventBus2 = _interopRequireDefault(_EventBus);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } } //
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'list',
  components: {
    SubMenu: _SubMenu2.default,
    List: _List2.default,
    Logo: _Logo2.default
  },
  data: function data() {
    return {
      list: [],
      color: 'dark'
    };
  },
  mounted: function mounted() {
    var _this = this;

    // todo: 完成兄弟组件之间的通信
    _EventBus2.default.$on('updataList', function (params) {
      _newArrowCheck(this, _this);

      this.getList(params);
    }.bind(this));
    _Cart2.default.getCartList({
      $store: this.$store
    });
    this.getList({
      type: this.$route.params.id
    });
  },

  methods: {
    // todo: 读取端口列表信息
    getList: function getList(params) {
      var _this2 = this;

      _AJAX2.default.get({
        url: _urls2.default.LIST,
        data: {
          params: {
            flag: 1,
            commodityTypeID: params.type
          }
        },
        success: function success(res) {
          _newArrowCheck(this, _this2);

          var data = res.data;

          if (data.code === _codes2.default.SUCCESS) {
            var content = data.result.content || data.result;

            this.list = [];
            content.forEach(function (item) {
              _newArrowCheck(this, _this2);

              item.pic = item.pic ? _urls2.default.BaseURL + item.pic : '';
              this.list.push({
                id: item.commodityID,
                img: item.pic,
                name: item.commodityName,
                money: item.price
              });
            }.bind(this));
          } else {
            console.warn(res.data.msg);
          }
        }.bind(this)
      });
    }
  }
};

/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_SubMenu_vue__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_SubMenu_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_SubMenu_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_951eca64_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_SubMenu_vue__ = __webpack_require__(65);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(63)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-951eca64"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_SubMenu_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_951eca64_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_SubMenu_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/SubMenu.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-951eca64", Component.options)
  } else {
    hotAPI.reload("data-v-951eca64", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 63 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventBus = __webpack_require__(13);

var _EventBus2 = _interopRequireDefault(_EventBus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'subMenu',
  props: ['color'],
  data: function data() {
    return {
      kzj: true,
      xgla: false,
      ttc: false
    };
  },
  created: function created() {
    this.changeCurrent({ type: this.$route.params.id });
  },

  computed: {
    bg: function bg() {
      return this.color;
    }
  },
  methods: {
    // todo: 更新列表内容
    updateList: function updateList(evt) {
      var type = evt.target.getAttribute('type');

      // todo: 完成兄弟组件之间的通信
      _EventBus2.default.$emit('updataList', {
        type: type
      });

      // todo: 修改当前选中状态
      this.changeCurrent({
        type: type
      });
    },


    // todo: 修改当前选中状态
    changeCurrent: function changeCurrent(params) {
      switch (params.type) {
        case '1010':
          this.kzj = true;
          this.xgla = this.ttc = !this.kzj;
          break;
        case '1020':
          this.xgla = true;
          this.kzj = this.ttc = !this.xgla;
          break;
        case '1030':
          this.ttc = true;
          this.kzj = this.xgla = !this.ttc;
          break;
      }
      this.$router.replace('/list/' + params.type);
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("menu", { staticClass: "menu", class: _vm.bg }, [
    _c("ul", [
      _c("li", { class: { curr: _vm.kzj } }, [
        _c(
          "a",
          {
            attrs: { href: "#", type: "1010" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.updateList($event)
              }
            }
          },
          [_vm._v("口子窖")]
        ),
        _c("span")
      ]),
      _c("li", { class: { curr: _vm.xgla } }, [
        _c(
          "a",
          {
            attrs: { href: "#", type: "1020" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.updateList($event)
              }
            }
          },
          [_vm._v("香格里拉")]
        ),
        _c("span")
      ]),
      _c("li", { class: { curr: _vm.ttc } }, [
        _c(
          "a",
          {
            attrs: { href: "#", type: "1030" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.updateList($event)
              }
            }
          },
          [_vm._v("土特产")]
        ),
        _c("span")
      ])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-951eca64", esExports)
  }
}

/***/ }),
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_decff0c2_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_List_vue__ = __webpack_require__(69);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(67)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-decff0c2"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_List_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_decff0c2_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_List_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/List.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-decff0c2", Component.options)
  } else {
    hotAPI.reload("data-v-decff0c2", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 67 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } } //
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'list',
  props: ['list'],
  methods: {
    clickHandler: function clickHandler() {
      this.$router.push('/detail/' + this.$route.params.id);
    },
    addToCart: function addToCart(evt) {
      var _this = this;

      var target = evt.target;

      _AJAX2.default.post({
        url: _urls2.default.ADDTOCART,
        data: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c',
          commodityID: target.id,
          num: 1
        },
        success: function success(res) {
          _newArrowCheck(this, _this);

          this.$store.dispatch('changeCartNum', {
            num: this.$store.getters.getCartNum + 1
          });
          if (!res.data) {
            console.warn('返回异常:', res.config.url);
            return;
          }
          if (String(res.data.code) === '0') {
            alert(res.data.msg);
          } else {
            console.warn(res.data.msg);
          }
        }.bind(this)
      });
    }
  }
};

/***/ }),
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "list-items" }, [
    _c(
      "ul",
      _vm._l(_vm.list, function(item) {
        return _c("li", [
          _c("img", {
            attrs: { src: item.img },
            on: { click: _vm.clickHandler }
          }),
          _c("span", [_vm._v(_vm._s(item.name))]),
          _c("span", { staticClass: "money" }, [_vm._v(_vm._s(item.money))]),
          _c(
            "span",
            {
              staticClass: "add",
              attrs: { id: item.id },
              on: { click: _vm.addToCart }
            },
            [_vm._v("加入购物车")]
          )
        ])
      })
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-decff0c2", esExports)
  }
}

/***/ }),
/* 70 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "list" },
    [
      _c("div", { staticClass: "top" }, [_c("Logo")], 1),
      _c("SubMenu", { attrs: { color: _vm.color } }),
      _vm._m(0, false, false),
      _c("List", { attrs: { list: _vm.list } })
    ],
    1
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "banner" }, [
      _c("img", { attrs: { src: __webpack_require__(71) } })
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-bfd37fc8", esExports)
  }
}

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/list_banner.png";

/***/ }),
/* 72 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ShoppingCart_vue__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ShoppingCart_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ShoppingCart_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1057bdb4_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_ShoppingCart_vue__ = __webpack_require__(78);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(73)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-1057bdb4"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ShoppingCart_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1057bdb4_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_ShoppingCart_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/ShoppingCart.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1057bdb4", Component.options)
  } else {
    hotAPI.reload("data-v-1057bdb4", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 73 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Process = __webpack_require__(9);

var _Process2 = _interopRequireDefault(_Process);

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _codes = __webpack_require__(8);

var _codes2 = _interopRequireDefault(_codes);

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } } //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var time = void 0;

exports.default = {
  name: 'cart',
  components: {
    Process: _Process2.default,
    Logo: _Logo2.default
  },
  data: function data() {
    return {
      step: 1,
      steps: ['查看购物车', '确认订单信息', '在线付款', '收货'],
      items: []
    };
  },
  mounted: function mounted() {
    var _this = this;

    _Cart2.default.getCartList({
      $store: this.$store,
      success: function success(data) {
        _newArrowCheck(this, _this);

        data.result.forEach(function (item) {
          _newArrowCheck(this, _this);

          item.commodity.pic = item.commodity.pic ? _urls2.default.BaseURL + item.commodity.pic : '';
        }.bind(this));

        this.items = data.result;
      }.bind(this)
    });
  },

  methods: {
    // todo: 增加数量
    add: function add(index) {
      var item = this.items[index];

      item.num += 1;
      item.totalAmount = item.commodity.commodityChannel ? item.num * item.commodity.commodityChannel : item.num * item.commodity.price;
      this.changeCommodityNum({
        id: item.cartListID,
        num: item.num
      });
    },


    // todo: 删减数量
    reduce: function reduce(index) {
      var item = this.items[index];
      var val = item.num - 1;

      item.num = val > 0 ? val : 1;
      item.totalAmount = item.commodity.commodityChannel ? item.num * item.commodity.commodityChannel : item.num * item.commodity.price;
      this.changeCommodityNum({
        id: item.cartListID,
        num: item.num
      });
    },


    // todo: 删除条目
    del: function del(index, id) {
      var _this2 = this;

      _AJAX2.default.post({
        url: _urls2.default.delCommodity,
        data: {
          cartListID: id
        },
        success: function success(res) {
          _newArrowCheck(this, _this2);

          res.data.code === _codes2.default.SUCCESS ? this.items.splice(index, 1) : console.error(res.msg);
        }.bind(this)
      });
    },


    // todo: 每修改一次数量都要向后端记录一下
    changeCommodityNum: function changeCommodityNum(params) {
      var _this3 = this;

      var ms = 1000;

      clearTimeout(time);
      time = setTimeout(function () {
        _newArrowCheck(this, _this3);

        _AJAX2.default.post({
          url: _urls2.default.changeCommodityNum,
          data: {
            cartListID: params.id,
            num: params.num
          },
          success: function success(res) {
            res.data.code !== _codes2.default.SUCCESS && console.error(res.msg);
          }
        });
      }.bind(this), ms);
    },


    // todo: 立即结算
    commit: function commit() {
      var _this4 = this;

      console.log(this.$store);
      _AJAX2.default.post({
        url: _urls2.default.commitCart,
        data: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c',
          carts: this.$store.getters.getCartItems
        },
        success: function success(res) {
          _newArrowCheck(this, _this4);

          console.log(res);
        }.bind(this)
      });
      /*
      this.$router.push( {
        path: '/confirm'
      } );
      */
    }
  }
};

/***/ }),
/* 75 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

//
//
//
//
//
//
//
//

exports.default = {
  name: 'process',
  props: ['step', 'steps'],
  computed: {
    step_num: function step_num() {
      var _this = this;

      return function () {
        _newArrowCheck(this, _this);

        var step = void 0;

        switch (this.step) {
          case 1:
            step = 'step_1';
            break;
          case 2:
            step = 'step_2';
            break;
          case 3:
            step = 'step_3';
            break;
          case 4:
            step = 'step_4';
            break;
        }
        return step;
      }.bind(this);
    }
  }
};

/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "process", class: _vm.step_num() },
    _vm._l(_vm.steps, function(item, index) {
      return _c("span", { staticClass: "process-step" }, [
        _c("div", { staticClass: "step-wrap", attrs: { name: index } }, [
          _c("span", [_vm._v(_vm._s(index + 1))]),
          _c("em", { staticClass: "step" }, [_vm._v(_vm._s(item))])
        ])
      ])
    })
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-d1b48d04", esExports)
  }
}

/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "shopping-cart" }, [
    _c(
      "div",
      { staticClass: "top" },
      [
        _c("Logo"),
        _c("Process", { attrs: { step: _vm.step, steps: _vm.steps } })
      ],
      1
    ),
    _vm._m(0, false, false),
    _c(
      "div",
      { staticClass: "body" },
      [
        _c(
          "transition-group",
          { attrs: { name: "itemlist", tag: "div" } },
          _vm._l(_vm.items, function(item, index) {
            return _c("div", { key: item.cartListID, staticClass: "row" }, [
              _c("span", [
                _c("img", { attrs: { src: item.commodity.pic } }),
                _c("span", [_vm._v(_vm._s(item.commodity.commodityName))])
              ]),
              _c("span", { staticClass: "price" }, [
                _c("em", { staticClass: "line-through" }, [
                  _vm._v("指导价"),
                  _c("i", [_vm._v("￥" + _vm._s(item.commodity.price))])
                ]),
                _c("em", [
                  _vm._v(
                    "会员价 ￥" +
                      _vm._s(
                        typeof item.commodity.commodityChannel === "number"
                          ? item.commodity.commodityChannel
                          : 0
                      )
                  )
                ])
              ]),
              _c("span", { staticClass: "num" }, [
                _c(
                  "em",
                  {
                    staticClass: "reduce",
                    on: {
                      click: function($event) {
                        _vm.reduce(index)
                      }
                    }
                  },
                  [_vm._v("-")]
                ),
                _c("input", {
                  attrs: { type: "text" },
                  domProps: { value: item.num }
                }),
                _c(
                  "em",
                  {
                    staticClass: "add",
                    on: {
                      click: function($event) {
                        _vm.add(index)
                      }
                    }
                  },
                  [_vm._v("+")]
                )
              ]),
              _c("span", { staticClass: "count" }, [
                _vm._v(_vm._s(item.totalAmount))
              ]),
              _c("span", { staticClass: "operate" }, [
                _c(
                  "em",
                  {
                    on: {
                      click: function($event) {
                        _vm.del(index, item.cartListID)
                      }
                    }
                  },
                  [_vm._v("删除")]
                )
              ])
            ])
          })
        )
      ],
      1
    ),
    _c("div", { staticClass: "footer" }, [
      _c("span", { staticClass: "account", on: { click: _vm.commit } }, [
        _vm._v("立即结算")
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "header" }, [
      _c("span", { staticClass: "name" }, [_vm._v("商品")]),
      _c("span", { staticClass: "price" }, [_vm._v("单价")]),
      _c("span", { staticClass: "num" }, [_vm._v("数量")]),
      _c("span", { staticClass: "count" }, [_vm._v("小计")]),
      _c("span", { staticClass: "operate" }, [_vm._v("操作")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-1057bdb4", esExports)
  }
}

/***/ }),
/* 79 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PayInLine_vue__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PayInLine_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PayInLine_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1500791a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_PayInLine_vue__ = __webpack_require__(82);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(80)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-1500791a"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PayInLine_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1500791a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_PayInLine_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/PayInLine.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1500791a", Component.options)
  } else {
    hotAPI.reload("data-v-1500791a", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 80 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _Process = __webpack_require__(9);

var _Process2 = _interopRequireDefault(_Process);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'payinline',
  components: {
    Logo: _Logo2.default,
    Process: _Process2.default
  },
  data: function data() {
    return {
      step: 3,
      steps: ['查看购物车', '确认订单信息', '在线付款', '收货'],
      weixin: false,
      zhifubao: false
    };
  },
  mounted: function mounted() {
    _Cart2.default.getCartList({
      $store: this.$store
    });
  },

  methods: {
    // todo: 切换支付类型
    changePayType: function changePayType(type) {
      switch (type) {
        case 'weixin':
          this.weixin = true;
          this.zhifubao = !this.weixin;
          break;
        case 'zhifubao':
          this.zhifubao = true;
          this.weixin = !this.zhifubao;
          break;
      }
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),
/* 82 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "pay-in-line" }, [
    _c(
      "div",
      { staticClass: "top" },
      [
        _c("Logo"),
        _c("Process", { attrs: { step: _vm.step, steps: _vm.steps } })
      ],
      1
    ),
    _vm._m(0, false, false),
    _c("div", { staticClass: "pay-type" }, [
      _c("div", { staticClass: "title" }, [_vm._v("请选择支付方式")]),
      _c("div", { staticClass: "type" }, [
        _c("ul", [
          _c(
            "li",
            {
              class: { curr: _vm.weixin },
              on: {
                click: function($event) {
                  _vm.changePayType("weixin")
                }
              }
            },
            [_c("a", { staticClass: "weixin", attrs: { href: "#" } })]
          ),
          _c(
            "li",
            {
              class: { curr: _vm.zhifubao },
              on: {
                click: function($event) {
                  _vm.changePayType("zhifubao")
                }
              }
            },
            [_c("a", { staticClass: "zhifubao", attrs: { href: "#" } })]
          )
        ])
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "pay-info" }, [
      _c("div", { staticClass: "info" }, [
        _c("span", { staticClass: "title" }, [_vm._v("订单提交成功")]),
        _c("span", { staticClass: "orderID" }, [
          _vm._v("订单号：sdfasfadfasfasfasf")
        ]),
        _c("span", { staticClass: "time" }, [
          _vm._v("请在"),
          _c("em", [_vm._v("1小时59分59秒")]),
          _vm._v("内完成支付")
        ])
      ]),
      _c("div", { staticClass: "addr" }, [
        _c("span", { staticClass: "count" }, [_vm._v("应付金额：￥4800.00")]),
        _c("span", { staticClass: "name-addr" }, [
          _c("span", { staticClass: "name" }, [_vm._v("xxxx")]),
          _c("span", { staticClass: "arr" }, [
            _vm._v("北京市昌平区 兴科西路159号 大运家园 26-6-1603  130000000")
          ])
        ])
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-1500791a", esExports)
  }
}

/***/ }),
/* 83 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _Process = __webpack_require__(9);

var _Process2 = _interopRequireDefault(_Process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'sucessPay',
  components: {
    Logo: _Logo2.default,
    Process: _Process2.default
  },
  props: ['type'],
  data: function data() {
    return {
      mess: false,
      title: '',
      step: 4,
      steps: []
    };
  },
  mounted: function mounted() {
    this.upLoad();
  },

  watch: {
    $route: function $route() {
      this.upLoad();
    }
  },
  methods: {
    upLoad: function upLoad() {
      switch (this.type) {
        case 'pay':
          this.steps = ['查看购物车', '确认订单信息', '在线付款', '收货'];
          break;
        case 'pw':
          this.title = '修改密码';
          break;
        case 'register':
          this.title = '欢迎注册久隆商贸';
          break;
      }
    }
  }
};

/***/ }),
/* 85 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "sucess-pay" }, [
    _vm.type !== "phone"
      ? _c(
          "div",
          { staticClass: "top" },
          [
            _c("Logo", { attrs: { title: _vm.title } }),
            _vm.steps.length > 0
              ? _c("Process", { attrs: { step: _vm.step, steps: _vm.steps } })
              : _vm._e()
          ],
          1
        )
      : _vm._e(),
    _c("div", { staticClass: "info" }, [
      _vm.type === "pay"
        ? _c("div", [
            _c("span", { staticClass: "title" }, [_vm._v("支付完成")]),
            _c("span", { staticClass: "dis" }, [
              _vm._v("请您耐心等候，商品将尽快送到您的手中…")
            ])
          ])
        : _vm._e(),
      _vm.type === "pw"
        ? _c("div", [
            _c("span", { staticClass: "title" }, [_vm._v("修改成功")]),
            _vm._m(0, false, false)
          ])
        : _vm._e(),
      _vm.type === "register"
        ? _c("div", [
            _c("span", { staticClass: "title" }, [_vm._v("注册成功")]),
            _vm._m(1, false, false)
          ])
        : _vm._e(),
      _vm.type === "phone"
        ? _c("div", [
            _c("span", { staticClass: "title" }, [_vm._v("修改成功")]),
            _c("span", { staticClass: "dis" }, [_vm._v("您已成功修改手机号")])
          ])
        : _vm._e()
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "dis" }, [
      _vm._v("您已成功修改密码，"),
      _c("a", { attrs: { href: "#" } }, [_vm._v("立即登录")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "dis" }, [
      _vm._v("恭喜您成功注册久隆商贸,"),
      _c("a", { attrs: { href: "#" } }, [_vm._v("立即登录")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-30ea8b75", esExports)
  }
}

/***/ }),
/* 86 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ConfirmOrder_vue__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ConfirmOrder_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ConfirmOrder_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_32186c28_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_ConfirmOrder_vue__ = __webpack_require__(93);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(87)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-32186c28"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_ConfirmOrder_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_32186c28_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_ConfirmOrder_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/ConfirmOrder.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-32186c28", Component.options)
  } else {
    hotAPI.reload("data-v-32186c28", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 87 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _NewAddr = __webpack_require__(89);

var _NewAddr2 = _interopRequireDefault(_NewAddr);

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _Process = __webpack_require__(9);

var _Process2 = _interopRequireDefault(_Process);

var _codes = __webpack_require__(8);

var _codes2 = _interopRequireDefault(_codes);

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } } //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'confirmOrder',
  components: {
    Logo: _Logo2.default,
    NewAddr: _NewAddr2.default,
    Process: _Process2.default
  },
  data: function data() {
    return {
      step: 2,
      steps: ['查看购物车', '确认订单信息', '在线付款', '收货'],
      addrs: [],
      items: [],
      addrMore: false,
      count: 0, // ? 选择商品的个数
      amount: 0, // ? 商品总价
      memberCount: 0, // ? 会员总价
      discount: 0 // ? 优惠价 = 商品总价 - 会员总价
    };
  },
  mounted: function mounted() {
    var _this = this;

    this.getCustomerAddr();
    _Cart2.default.getCartList({
      $store: this.$store,
      success: function success(data) {
        _newArrowCheck(this, _this);

        data.result.forEach(function (item) {
          _newArrowCheck(this, _this);

          item.commodity.pic = item.commodity.pic ? _urls2.default.BaseURL + item.commodity.pic : '';
        }.bind(this));

        this.items = data.result;
        this.total().count();
        this.total().memberCount();
        this.total().discount();
      }.bind(this)
    });
  },

  methods: {
    // todo: 计算最后金额
    total: function total() {
      var _this2 = this;

      var num = void 0,
          _memberCount = void 0;

      this.count = this.items.length;

      return {
        // todo: 计算总价
        count: function count() {
          _newArrowCheck(this, _this2);

          this.items.forEach(function (item) {
            _newArrowCheck(this, _this2);

            num = item.commodity.price;
            this.amount += num;
          }.bind(this));
        }.bind(this),

        // todo: 计算会员价
        memberCount: function memberCount() {
          _newArrowCheck(this, _this2);

          this.items.forEach(function (item) {
            _newArrowCheck(this, _this2);

            _memberCount = item.commodity.commodityChannel || 0;
            this.memberCount += _memberCount;
          }.bind(this));
        }.bind(this),

        // todo: 计算优惠价
        discount: function discount() {
          _newArrowCheck(this, _this2);

          this.discount = this.amount - this.memberCount;
          this.discount = this.discount === this.amount ? 0 : this.discount;
        }.bind(this)
      };
    },


    // todo: 获取用户地址信息
    getCustomerAddr: function getCustomerAddr() {
      var _this3 = this;

      _AJAX2.default.post({
        url: _urls2.default.getCustomerReceivingAddr,
        data: {
          customerID: 'bcd26eda293a44e98b03d8d8a7a7a028'
        },
        success: function success(res) {
          _newArrowCheck(this, _this3);

          this.addrs = res.data.code === _codes2.default.SUCCESS ? res.data.result : this.addrs;
        }.bind(this)
      });
    },


    // todo: 使用其他收货地址
    showMoreAddrs: function showMoreAddrs() {
      this.addrMore = !this.addrMore;
    },


    // todo: 切换收货地址
    changeAddrDefault: function changeAddrDefault(index) {
      var item = this.addrs.splice(index, 1)[0];
      this.addrs.splice(0, 0, item);
      this.addrMore = false;
    },


    // todo: 去支付
    pay: function pay() {
      this.$router.push({
        path: '/pay'
      });
    }
  }
};

/***/ }),
/* 89 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_NewAddr_vue__ = __webpack_require__(91);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_NewAddr_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_NewAddr_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e55fd880_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_NewAddr_vue__ = __webpack_require__(92);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(90)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-e55fd880"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_NewAddr_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e55fd880_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_NewAddr_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/NewAddr.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-e55fd880", Component.options)
  } else {
    hotAPI.reload("data-v-e55fd880", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 90 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/***/ }),
/* 92 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0, false, false)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "new-addr" }, [
      _c("a", { staticClass: "close", attrs: { href: "#" } }),
      _c("div", { staticClass: "info" }, [
        _c("div", { staticClass: "title" }, [_vm._v("新增收货人地址")]),
        _c("dl", [
          _c("dt", [_vm._v("姓名")]),
          _c("dd", [
            _c("input", {
              staticClass: "name",
              attrs: { type: "text", placeholder: "填写收件人姓名" }
            })
          ]),
          _c("dt", [_vm._v("手机号码")]),
          _c("dd", [
            _c("input", {
              staticClass: "iphone",
              attrs: { type: "text", placeholder: "填写收件人手机号" }
            })
          ]),
          _c("dt", [_vm._v("所在地域")]),
          _c("dd", [
            _c("select", { staticClass: "range" }, [
              _c("option", [_vm._v("北京")])
            ])
          ]),
          _c("dt", [_vm._v("详细地址")]),
          _c("dd", [
            _c("input", {
              staticClass: "addr",
              attrs: { type: "text", placeholder: "请输入收件人详细地址" }
            })
          ])
        ])
      ]),
      _c("a", { staticClass: "save", attrs: { href: "#" } }, [
        _vm._v("保存收货人信息")
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-e55fd880", esExports)
  }
}

/***/ }),
/* 93 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "confirm-order" }, [
    _c("div", { staticClass: "cover" }, [_c("NewAddr")], 1),
    _c(
      "div",
      { staticClass: "top" },
      [
        _c("Logo"),
        _c("Process", { attrs: { step: _vm.step, steps: _vm.steps } })
      ],
      1
    ),
    _c("div", { staticClass: "order-addr" }, [
      _c("div", { staticClass: "title" }, [
        _c("span", { staticClass: "icon" }),
        _c("span", [_vm._v("确认收货地址")]),
        _c(
          "span",
          { staticClass: "add-addr", on: { click: _vm.showMoreAddrs } },
          [_vm._v("使用其他收货地址")]
        )
      ]),
      _c(
        "div",
        { staticClass: "addrs", class: { "addr-more": _vm.addrMore } },
        [
          _c(
            "ul",
            _vm._l(_vm.addrs, function(item, index) {
              return _c(
                "li",
                {
                  on: {
                    click: function($event) {
                      _vm.changeAddrDefault(index)
                    }
                  }
                },
                [
                  _c("span", { staticClass: "name" }, [
                    _vm._v(_vm._s(item.contacts))
                  ]),
                  _c("span", { staticClass: "addr" }, [
                    _vm._v(
                      _vm._s(item.receivingAddr) + " " + _vm._s(item.mobile)
                    )
                  ])
                ]
              )
            })
          )
        ]
      )
    ]),
    _c("div", { staticClass: "confirm" }, [
      _vm._m(0, false, false),
      _c(
        "div",
        { staticClass: "list" },
        [
          _vm._m(1, false, false),
          _vm._l(_vm.items, function(item) {
            return _c("div", { staticClass: "items" }, [
              _c("div", { staticClass: "content" }, [
                _c("span", { staticClass: "pic" }, [
                  _c("img", { attrs: { src: item.commodity.pic } }),
                  _c("span", { staticClass: "name-discount" }, [
                    _c("span", { staticClass: "name" }, [
                      _vm._v(_vm._s(item.commodity.commodityName))
                    ])
                  ])
                ]),
                _c("span", { staticClass: "money" }, [
                  _c("em", { staticClass: "line-through" }, [
                    _vm._v("指导价："),
                    _c("i", [_vm._v("￥" + _vm._s(item.commodity.price))])
                  ]),
                  _c("em", [
                    _vm._v(
                      "会员价：￥" +
                        _vm._s(
                          typeof item.commodity.commodityChannel === "number"
                            ? item.commodity.commodityChannel
                            : 0
                        )
                    )
                  ])
                ]),
                _c("span", { staticClass: "num" }, [_vm._v(_vm._s(item.num))]),
                _c("span", { staticClass: "count" }, [
                  _vm._v(_vm._s(item.totalAmount))
                ])
              ]),
              _vm._m(2, true, false)
            ])
          })
        ],
        2
      )
    ]),
    _vm._m(3, false, false),
    _c("div", { staticClass: "info" }, [
      _c("span", [
        _vm._v("共有"),
        _c("em", [_vm._v(_vm._s(_vm.count))]),
        _vm._v("件商品")
      ]),
      _c("span", { staticClass: "count" }, [
        _vm._v("总计: ￥" + _vm._s(_vm.memberCount))
      ])
    ]),
    _c("div", { staticClass: "price" }, [
      _c("span", [_vm._v("优惠: ￥" + _vm._s(_vm.discount))]),
      _c("span", [_vm._v("商品总价：￥" + _vm._s(_vm.amount))])
    ]),
    _c("span", { staticClass: "pay", on: { click: _vm.pay } }, [
      _vm._v("去支付")
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "title" }, [
      _c("span", { staticClass: "icon" }),
      _c("span", [_vm._v("确认订单")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "title" }, [
      _c("span", [_vm._v("商品")]),
      _c("span", [_vm._v("单价")]),
      _c("span", [_vm._v("数量")]),
      _c("span", [_vm._v("小计")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "coupon" }, [
      _c("span", [_vm._v("多买多送，买六送一")]),
      _c("span", [_vm._v("[赠品] xxxxxx")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "coupon_more" }, [
      _c("div", { staticClass: "title" }, [_vm._v("订单赠品")]),
      _c("div", { staticClass: "items" }, [
        _c("span", [
          _c("img", { attrs: { src: "" } }),
          _c("span", [_vm._v("xxxx")])
        ]),
        _c("span", [_vm._v("*1")])
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-32186c28", esExports)
  }
}

/***/ }),
/* 94 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue__ = __webpack_require__(96);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_035d0634_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Details_vue__ = __webpack_require__(101);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(95)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-035d0634"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_035d0634_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Details_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/Details.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-035d0634", Component.options)
  } else {
    hotAPI.reload("data-v-035d0634", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 95 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _Details = __webpack_require__(97);

var _Details2 = _interopRequireDefault(_Details);

var _AJAX = __webpack_require__(6);

var _AJAX2 = _interopRequireDefault(_AJAX);

var _codes = __webpack_require__(8);

var _codes2 = _interopRequireDefault(_codes);

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } } //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'detail',
  data: function data() {
    var _this = this;

    return {
      infoData: {},
      num: 1,
      color: 'white',
      crumb: function crumb() {
        _newArrowCheck(this, _this);

        var ca = JSON.parse(JSON.stringify(this.$route.meta));
        var cr = '';
        if (ca && ca instanceof Array) {
          ca.push(this.getProductType());
          this.infoData.commodityName && ca.push(this.infoData.commodityName);
          cr = ca.join('&nbsp>&nbsp');
        }
        // 首页 > 购买红酒 > 香格里拉 > {{infoData.commodityName}}
        return cr.length > 0 ? '当前位置：' + cr : '';
      }.bind(this)
    };
  },

  components: {
    Detail: _Details2.default,
    Logo: _Logo2.default
  },
  computed: {
    getPic: function getPic() {
      return this.infoData.pic ? _urls2.default.BaseURL + this.infoData.pic : '';
    }
  },
  mounted: function mounted() {
    this.getPageInfor();
    _Cart2.default.getCartList({
      $store: this.$store
    });
  },

  methods: {
    /* 获取detail页面内容 */
    getPageInfor: function getPageInfor() {
      var _this2 = this;

      _AJAX2.default.get({
        url: _urls2.default.getCommodityChannelByID,
        data: {
          params: {
            commodityID: 'e9ae793335844215a602b4c6c0542567'
          }
        },
        success: function success(res) {
          _newArrowCheck(this, _this2);

          if (!res.data) {
            console.warn('返回异常:', res.config.url);
            return;
          }
          if (String(res.data.code) === '0') {
            this.infoData = res.data.result;
          } else {
            console.warn(res.data.msg);
          }
        }.bind(this)
      });
    },
    getProductType: function getProductType() {
      var type = this.$route.params.id;
      var name = '香格里拉';
      switch (type) {
        case '1010':
          name = '口子窖';
          break;
        case '1020':
          name = '香格里拉';
          break;
        case '1030':
          name = '土特产';
          break;
      }
      return name;
    },
    numHandler: function numHandler(val) {
      if (val > 0) {
        this.num++;
      } else if (val < 0) {
        this.num--;
      }
      this.num = Math.max(0, this.num);
    },

    /* detail页添加到购物车 */
    addCommodityToCart: function addCommodityToCart() {
      var _this3 = this;

      _AJAX2.default.post({
        url: _urls2.default.addCommodityToCart,
        data: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c',
          commodityID: 'e9ae793335844215a602b4c6c0542567',
          num: this.num
        },
        success: function success(res) {
          _newArrowCheck(this, _this3);

          if (!res.data) {
            console.warn('返回异常:', res.config.url);
            return;
          }

          if (res.data.code === _codes2.default.SUCCESS) {
            alert(res.data.msg);
          } else {
            console.warn(res.data.msg);
          }
        }.bind(this)
      });
    }
  }
};

/***/ }),
/* 97 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue__ = __webpack_require__(99);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_11ed6bd1_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Details_vue__ = __webpack_require__(100);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(98)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-11ed6bd1"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Details_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_11ed6bd1_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Details_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/Details.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-11ed6bd1", Component.options)
  } else {
    hotAPI.reload("data-v-11ed6bd1", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 98 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urls = __webpack_require__(4);

var _urls2 = _interopRequireDefault(_urls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  props: {
    infoData: {
      type: Object,
      required: true,
      default: {}
    }
  },
  methods: {
    getProductPic: function getProductPic(url) {
      return this.infoData.pic ? _urls2.default.BaseURL + url : '';
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),
/* 100 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "detail-info" }, [
    _c("div", { staticClass: "product-detail" }, [
      _c(
        "div",
        { staticClass: "commodityImgs" },
        _vm._l(_vm.infoData.commodityImgs, function(item) {
          return _c(
            "div",
            {
              staticClass: "product-item",
              style: { order: item.sequenceNumber }
            },
            [_c("img", { attrs: { src: _vm.getProductPic(item.imgUrl) } })]
          )
        })
      ),
      _c(
        "div",
        { staticClass: "brandImgs" },
        _vm._l(_vm.infoData.brandImgs, function(item) {
          return _c(
            "div",
            {
              staticClass: "product-item",
              style: { order: item.sequenceNumber }
            },
            [_c("img", { attrs: { src: _vm.getProductPic(item.imgUrl) } })]
          )
        })
      ),
      _c(
        "div",
        { staticClass: "companyImgs" },
        _vm._l(_vm.infoData.companyImgs, function(item) {
          return _c(
            "div",
            {
              staticClass: "product-item",
              style: { order: item.sequenceNumber }
            },
            [_c("img", { attrs: { src: _vm.getProductPic(item.imgUrl) } })]
          )
        })
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-11ed6bd1", esExports)
  }
}

/***/ }),
/* 101 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "details" },
    [
      _c("div", { staticClass: "top" }, [_c("Logo")], 1),
      _c("div", {
        staticClass: "bread-crumbs",
        domProps: { innerHTML: _vm._s(_vm.crumb()) }
      }),
      _c("div", { staticClass: "detail" }, [
        _c("div", { staticClass: "product-info" }, [
          _c("img", { attrs: { src: _vm.getPic } }),
          _c("div", { staticClass: "introdution" }, [
            _c("div", { staticClass: "name" }, [
              _vm._v(_vm._s(_vm.infoData.commodityName))
            ]),
            _c("div", { staticClass: "info" }, [
              _c("span", [
                _vm._v("官方指导价："),
                _c("em", [_vm._v("￥" + _vm._s(_vm.infoData.price))])
              ]),
              _c("span", [
                _vm._v("商品编号：" + _vm._s(_vm.infoData.commodityCode))
              ]),
              _c("span", [_vm._v("商品品牌：" + _vm._s(_vm.getProductType()))])
            ]),
            _c("div", { staticClass: "count" }, [
              _c("span", [_vm._v("购买数量")]),
              _c("span", { staticClass: "counter" }, [
                _c(
                  "a",
                  {
                    staticClass: "reduce",
                    on: {
                      click: function($event) {
                        _vm.numHandler(-1)
                      }
                    }
                  },
                  [_vm._v("-")]
                ),
                _c("input", {
                  attrs: { type: "text" },
                  domProps: { value: _vm.num }
                }),
                _c(
                  "a",
                  {
                    staticClass: "add",
                    on: {
                      click: function($event) {
                        _vm.numHandler(1)
                      }
                    }
                  },
                  [_vm._v("+")]
                )
              ])
            ]),
            _c(
              "span",
              { staticClass: "buy", on: { click: _vm.addCommodityToCart } },
              [_vm._v("加入购物车")]
            )
          ])
        ])
      ]),
      _c("Detail", {
        attrs: { infoData: _vm.infoData },
        on: { click: _vm.addCommodityToCart }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-035d0634", esExports)
  }
}

/***/ }),
/* 102 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Information_vue__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Information_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Information_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2eb371c4_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Information_vue__ = __webpack_require__(105);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(103)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-2eb371c4"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Information_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2eb371c4_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Information_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/Information.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2eb371c4", Component.options)
  } else {
    hotAPI.reload("data-v-2eb371c4", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 103 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _Process = __webpack_require__(9);

var _Process2 = _interopRequireDefault(_Process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'infomation',
  components: {
    Logo: _Logo2.default,
    Process: _Process2.default
  },
  props: ['type'],
  data: function data() {
    return {
      title: '',
      step: 1,
      steps: []
    };
  },
  mounted: function mounted() {
    this.upLoad();
  },

  watch: {
    $route: function $route() {
      this.upLoad();
    }
  },
  methods: {
    upLoad: function upLoad() {
      switch (this.type) {
        case 'pw':
          this.title = '修改密码';
          this.stpes = ['填写信息', '修改成功'];
          break;
        case 'register':
          this.title = '欢迎注册久隆商贸';
          this.steps = ['填写信息', '注册成功'];
          break;
      }
    }
  }
};

/***/ }),
/* 105 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "infomation" } }, [
    _c(
      "div",
      { staticClass: "top" },
      [
        _c("Logo", { attrs: { title: _vm.title } }),
        _vm.type === "register"
          ? _c("div", { staticClass: "login" }, [
              _vm._v("已有帐号？"),
              _c("a", { attrs: { href: "#" } }, [_vm._v("立即登录")])
            ])
          : _vm._e()
      ],
      1
    ),
    _c(
      "main",
      { staticClass: "main" },
      [
        _c("Process", { attrs: { step: _vm.step, steps: _vm.steps } }),
        _c("div", { staticClass: "form" }, [
          _c("ul", [
            _vm._m(0, false, false),
            _vm._m(1, false, false),
            _c("li", [
              _vm.type === "register"
                ? _c("span", [_vm._v("设置密码")])
                : _c("span", [_vm._v("设置新密码")]),
              _c("input", {
                staticClass: "newPW",
                attrs: { type: "password", placeholder: "请设置您的密码" }
              })
            ]),
            _c("li", [
              _vm.type === "register"
                ? _c("span", [_vm._v("确认密码")])
                : _c("span", [_vm._v("确认新密码")]),
              _c("input", {
                staticClass: "conform",
                attrs: { type: "password", placeholder: "请确认您的密码" }
              })
            ])
          ]),
          _vm.type === "register"
            ? _c("a", { staticClass: "ok", attrs: { href: "#" } }, [
                _vm._v("注册")
              ])
            : _c("a", { staticClass: "ok", attrs: { href: "#" } }, [
                _vm._v("确认修改")
              ])
        ])
      ],
      1
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("li", [
      _c("span", [_vm._v("手机号码")]),
      _c("input", { staticClass: "phone", attrs: { type: "number" } })
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("li", [
      _c("span", [_vm._v("验证码")]),
      _c("input", { staticClass: "code", attrs: { type: "text" } }),
      _c("a", { staticClass: "getCode", attrs: { href: "#" } }, [
        _vm._v("获取验证码")
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-2eb371c4", esExports)
  }
}

/***/ }),
/* 106 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Personal_vue__ = __webpack_require__(108);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Personal_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Personal_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_0679b1be_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Personal_vue__ = __webpack_require__(143);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(107)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-0679b1be"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Personal_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_0679b1be_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Personal_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/vue_pages/Personal.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0679b1be", Component.options)
  } else {
    hotAPI.reload("data-v-0679b1be", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 107 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logo = __webpack_require__(3);

var _Logo2 = _interopRequireDefault(_Logo);

var _PersonalSetting = __webpack_require__(109);

var _PersonalSetting2 = _interopRequireDefault(_PersonalSetting);

var _MyOrdersList = __webpack_require__(129);

var _MyOrdersList2 = _interopRequireDefault(_MyOrdersList);

var _MyOrderDetail = __webpack_require__(139);

var _MyOrderDetail2 = _interopRequireDefault(_MyOrderDetail);

var _Cart = __webpack_require__(5);

var _Cart2 = _interopRequireDefault(_Cart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'personal',
  components: {
    Logo: _Logo2.default,
    PersonalSetting: _PersonalSetting2.default,
    MyOrderList: _MyOrdersList2.default,
    MyOrderDetail: _MyOrderDetail2.default
  },
  data: function data() {
    return {
      src: '',
      name: 'xxxx'
    };
  },
  mounted: function mounted() {
    _Cart2.default.getCartList({
      $store: this.$store
    });
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),
/* 109 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PersonalSetting_vue__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PersonalSetting_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PersonalSetting_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_323ff902_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_PersonalSetting_vue__ = __webpack_require__(128);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(110)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-323ff902"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_PersonalSetting_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_323ff902_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_PersonalSetting_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/PersonalSetting.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-323ff902", Component.options)
  } else {
    hotAPI.reload("data-v-323ff902", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 110 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseInfo = __webpack_require__(112);

var _BaseInfo2 = _interopRequireDefault(_BaseInfo);

var _BaseModifyPW = __webpack_require__(116);

var _BaseModifyPW2 = _interopRequireDefault(_BaseModifyPW);

var _BaseModifyPhone = __webpack_require__(120);

var _BaseModifyPhone2 = _interopRequireDefault(_BaseModifyPhone);

var _BaseAddr = __webpack_require__(124);

var _BaseAddr2 = _interopRequireDefault(_BaseAddr);

var _Success = __webpack_require__(14);

var _Success2 = _interopRequireDefault(_Success);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'personalSetting',
  components: {
    BaseInfo: _BaseInfo2.default,
    BaseModifyPW: _BaseModifyPW2.default,
    BaseModifyPhone: _BaseModifyPhone2.default,
    BaseAddr: _BaseAddr2.default,
    Success: _Success2.default
  },
  data: function data() {
    return {
      type: 'phone',
      isBaseInfo: true,
      isBaseModifyPW: false,
      isBaseModifyPhone: false,
      isBaseAddr: false,
      isSuccess: false
    };
  },

  methods: {
    change: function change(evt) {
      var type = evt.target.getAttribute('type');

      switch (type) {
        case 'baseInfo':
          this.isBaseInfo = true;
          this.isBaseModifyPW = this.isBaseAddr = this.isBaseModifyPhone = false;
          break;
        case 'baseAddr':
          this.isBaseAddr = true;
          this.isBaseModifyPW = this.isBaseInfo = this.isBaseModifyPhone = false;
          break;
        case 'baseModifyPW':
          this.isBaseModifyPW = true;
          this.isBaseAddr = this.isBaseInfo = this.isBaseModifyPhone = false;
          break;
        case 'baseModifyPhone':
          this.isBaseModifyPhone = true;
          this.isBaseAddr = this.isBaseInfo = this.isBaseModifyPW = false;
          break;
      }
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),
/* 112 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseInfo_vue__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseInfo_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseInfo_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ff053dc0_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseInfo_vue__ = __webpack_require__(115);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(113)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-ff053dc0"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseInfo_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ff053dc0_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseInfo_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/BaseInfo.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ff053dc0", Component.options)
  } else {
    hotAPI.reload("data-v-ff053dc0", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 113 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'baseInfo',
  data: function data() {
    return {
      src: 'images/photo.def.png',
      srcB: 'images/photo.def.png',
      srcM: 'images/photo.def.png',
      srcS: 'images/photo.def.png'
    };
  }
};

/***/ }),
/* 115 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "base-info" } }, [
    _c("h3", [_vm._v("基本信息")]),
    _vm._m(0, false, false),
    _c("h3", [_vm._v("头像设置")]),
    _c("div", { staticClass: "image" }, [
      _c("aside", { staticClass: "up-image" }, [
        _c("img", { attrs: { src: _vm.src } }),
        _vm._m(1, false, false)
      ]),
      _c("aside", { staticClass: "patten-image" }, [
        _c("span", [
          _vm._v("您上传的图像将会自动生成3个尺寸，请注意大中小尺寸是否清晰")
        ]),
        _c("img", { staticClass: "big", attrs: { src: _vm.srcB } }),
        _c("em", [_vm._v("大尺寸 140 * 140")]),
        _c("img", { staticClass: "medium", attrs: { src: _vm.srcM } }),
        _c("em", [_vm._v("中尺寸 60 * 60")]),
        _c("img", { staticClass: "samll", attrs: { src: _vm.srcS } }),
        _c("em", [_vm._v("小尺寸 32 * 32")])
      ])
    ]),
    _c("a", { staticClass: "save", attrs: { href: "#" } }, [_vm._v("保存")])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "info" }, [
      _c("ul", [
        _c("li", [
          _c("span", [_vm._v("用户名")]),
          _c("span", { staticClass: "name" }, [_vm._v("123132131")])
        ]),
        _c("li", [
          _c("span", [_vm._v("昵 称")]),
          _c("input", {
            staticClass: "nick-name",
            attrs: { type: "text", placeholder: "设置您的昵称" }
          })
        ]),
        _c("li", [
          _c("span", [_vm._v("性 别")]),
          _c("span", [
            _c("input", { attrs: { type: "radio", id: "secret" } }),
            _c("label", { attrs: { for: "secret" } }, [_vm._v("保密")])
          ]),
          _c("span", [
            _c("input", { attrs: { type: "radio", id: "male" } }),
            _c("label", { attrs: { for: "male" } }, [_vm._v("男")])
          ]),
          _c("span", [
            _c("input", { attrs: { type: "radio", id: "female" } }),
            _c("label", { attrs: { for: "female" } }, [_vm._v("女")])
          ])
        ])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "file" }, [
      _c("span", { staticClass: "txt" }, [_vm._v("上传头像")]),
      _c("input", { attrs: { type: "file" } }),
      _c("span", [_vm._v("仅支持PNG, JPG, GIF, 且文件小于2M")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-ff053dc0", esExports)
  }
}

/***/ }),
/* 116 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPW_vue__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPW_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPW_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_876f8b9a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseModifyPW_vue__ = __webpack_require__(119);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(117)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-876f8b9a"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPW_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_876f8b9a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseModifyPW_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/BaseModifyPW.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-876f8b9a", Component.options)
  } else {
    hotAPI.reload("data-v-876f8b9a", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 117 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/***/ }),
/* 119 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0, false, false)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { attrs: { id: "modify-pw" } }, [
      _c("ul", [
        _c("li", [
          _c("span", [_vm._v("旧密码")]),
          _c("input", { attrs: { type: "password" } }),
          _c("div", { staticClass: "forget" }, [
            _c("a", { attrs: { href: "#" } }, [_vm._v("忘记密码?")])
          ])
        ]),
        _c("li", [
          _c("span", [_vm._v("新密码")]),
          _c("input", { attrs: { type: "password" } })
        ]),
        _c("li", [
          _c("span", [_vm._v("确认新密码")]),
          _c("input", { attrs: { type: "password" } })
        ])
      ]),
      _c("a", { staticClass: "save", attrs: { href: "#" } }, [_vm._v("保存")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-876f8b9a", esExports)
  }
}

/***/ }),
/* 120 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPhone_vue__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPhone_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPhone_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4213715c_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseModifyPhone_vue__ = __webpack_require__(123);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(121)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-4213715c"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseModifyPhone_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4213715c_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseModifyPhone_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/BaseModifyPhone.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4213715c", Component.options)
  } else {
    hotAPI.reload("data-v-4213715c", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 121 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/***/ }),
/* 123 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0, false, false)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { attrs: { id: "modify-phone" } }, [
      _c("ul", [
        _c("li", [
          _c("span", [_vm._v("原手机号")]),
          _c("em", [_vm._v("123243423")])
        ]),
        _c("li", [
          _c("span", [_vm._v("新手机号")]),
          _c("input", { staticClass: "phone", attrs: { type: "number" } })
        ]),
        _c("li", [
          _c("span", [_vm._v("验证码")]),
          _c("input", {
            staticClass: "code",
            attrs: { type: "text", placeholder: "请输入验证码" }
          }),
          _c("a", { staticClass: "getCode", attrs: { href: "#" } }, [
            _vm._v("获取验证码")
          ])
        ])
      ]),
      _c("a", { staticClass: "ok", attrs: { href: "#" } }, [_vm._v("完成")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-4213715c", esExports)
  }
}

/***/ }),
/* 124 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseAddr_vue__ = __webpack_require__(126);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseAddr_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseAddr_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2d363ee3_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseAddr_vue__ = __webpack_require__(127);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(125)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-2d363ee3"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_BaseAddr_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2d363ee3_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_BaseAddr_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/BaseAddr.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d363ee3", Component.options)
  } else {
    hotAPI.reload("data-v-2d363ee3", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 125 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'addr',
  data: function data() {
    return {
      items: 5
    };
  }
};

/***/ }),
/* 127 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "addr" } }, [
    _c(
      "ul",
      _vm._l(_vm.items, function(item, index) {
        return _c("li", [_vm._m(0, true, false), _vm._m(1, true, false)])
      })
    ),
    _c("a", { staticClass: "add-addr", attrs: { href: "#" } }, [
      _vm._v("+ 新增收货地址")
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "name-addr-phone" }, [
      _c("span", { staticClass: "name" }, [_vm._v("xxxx")]),
      _c("span", { staticClass: "addr" }, [_vm._v("xxxx")]),
      _c("span", { staticClass: "phone" }, [_vm._v("12345678901")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "opper" }, [
      _c("input", { attrs: { type: "radio", id: "index" } }),
      _c("label", { attrs: { for: "index" } }, [_vm._v("默认地址")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-2d363ee3", esExports)
  }
}

/***/ }),
/* 128 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "personal-setting" }, [
    _c("header", { staticClass: "header" }, [
      _c("h3", [_vm._v("个人设置")]),
      _c("div", { staticClass: "change-info" }, [
        _c(
          "a",
          {
            staticClass: "base-info",
            class: { curr: _vm.isBaseInfo },
            attrs: { href: "#", type: "baseInfo" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.change($event)
              }
            }
          },
          [_vm._v("个人基本信息")]
        ),
        _c(
          "a",
          {
            staticClass: "addr",
            class: { curr: _vm.isBaseAddr },
            attrs: { href: "#", type: "baseAddr" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.change($event)
              }
            }
          },
          [_vm._v("收货地址")]
        ),
        _c(
          "a",
          {
            staticClass: "modify",
            class: { curr: _vm.isBaseModifyPW },
            attrs: { href: "#", type: "baseModifyPW" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.change($event)
              }
            }
          },
          [_vm._v("修改密码")]
        ),
        _c(
          "a",
          {
            staticClass: "phone",
            class: { curr: _vm.isBaseModifyPhone },
            attrs: { href: "#", type: "baseModifyPhone" },
            on: {
              click: function($event) {
                $event.preventDefault()
                _vm.change($event)
              }
            }
          },
          [_vm._v("更换手机")]
        )
      ])
    ]),
    _c(
      "section",
      [
        _c("BaseInfo", {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.isBaseInfo,
              expression: "isBaseInfo"
            }
          ]
        }),
        _c("BaseModifyPW", {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.isBaseModifyPW,
              expression: "isBaseModifyPW"
            }
          ]
        }),
        _c("BaseModifyPhone", {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.isBaseModifyPhone,
              expression: "isBaseModifyPhone"
            }
          ]
        }),
        _c("BaseAddr", {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.isBaseAddr,
              expression: "isBaseAddr"
            }
          ]
        }),
        _c("Success", {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.isSuccess,
              expression: "isSuccess"
            }
          ],
          attrs: { type: _vm.type }
        })
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-323ff902", esExports)
  }
}

/***/ }),
/* 129 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrdersList_vue__ = __webpack_require__(131);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrdersList_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrdersList_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c745c520_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_MyOrdersList_vue__ = __webpack_require__(138);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(130)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-c745c520"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrdersList_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c745c520_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_MyOrdersList_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/MyOrdersList.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c745c520", Component.options)
  } else {
    hotAPI.reload("data-v-c745c520", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 130 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CouponGift = __webpack_require__(15);

var _CouponGift2 = _interopRequireDefault(_CouponGift);

var _CouponOrder = __webpack_require__(16);

var _CouponOrder2 = _interopRequireDefault(_CouponOrder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'myOrder',
  components: {
    CouponGift: _CouponGift2.default,
    CouponOrder: _CouponOrder2.default
  },
  data: function data() {
    return {
      src: '',
      items: 3,
      section: 2
    };
  }
};

/***/ }),
/* 132 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'CouponGift'
};

/***/ }),
/* 134 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0, false, false)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { attrs: { id: "coupon-gift" } }, [
      _c("div", { staticClass: "cont" }, [
        _c("div", { staticClass: "gift-title" }, [
          _c("span", [_vm._v("订单赠品")])
        ]),
        _c("ul", [
          _c("li", [
            _c("span", [
              _c("img", { attrs: { src: "" } }),
              _c("span", [_vm._v("xxxxx")])
            ]),
            _c("span", [_vm._v("x1")])
          ])
        ])
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-ed0e2a92", esExports)
  }
}

/***/ }),
/* 135 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//

exports.default = {
  name: 'CouponOrder'
};

/***/ }),
/* 137 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0, false, false)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { attrs: { id: "coupon" } }, [
      _c("span", [_vm._v("多买多送，买六送一")]),
      _c("span", [_vm._v("[赠品] xxxxxxx")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-6eead9d7", esExports)
  }
}

/***/ }),
/* 138 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "my-order" } }, [
    _vm._m(0, false, false),
    _c(
      "main",
      { staticClass: "main" },
      [
        _vm._m(1, false, false),
        _vm._l(_vm.section, function(item) {
          return _c("section", [
            _c("div", { staticClass: "title" }, [
              _vm._v("2017-11-27 订单编号：1234567890")
            ]),
            _c("main", [
              _c("div", { staticClass: "item" }, [
                _c("div", { staticClass: "item-cont" }, [
                  _c(
                    "ul",
                    _vm._l(_vm.items, function(item) {
                      return _c(
                        "li",
                        [
                          _c("div", { staticClass: "prod" }, [
                            _c("span", [
                              _c("img", { attrs: { src: _vm.src } }),
                              _c("span", { staticClass: "name" }, [
                                _vm._v("xxxx")
                              ])
                            ]),
                            _c("span", [_vm._v("10")]),
                            _c("span", [_vm._v("￥1999")])
                          ]),
                          _c("CouponOrder")
                        ],
                        1
                      )
                    })
                  ),
                  _vm._m(2, true, false)
                ]),
                _c("aside", { staticClass: "gift" }, [_c("CouponGift")], 1)
              ])
            ])
          ])
        })
      ],
      2
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("h3", { staticClass: "title" }, [
      _c("span", [_vm._v("我的订单")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("nav", { staticClass: "nav" }, [
      _c("span", [_vm._v("商品")]),
      _c("span", [_vm._v("数量")]),
      _c("span", [_vm._v("合计")]),
      _c("span", [_vm._v("状态")]),
      _c("span", [_vm._v("操作")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("aside", { staticClass: "opear" }, [
      _c("span", [_vm._v("待支付 支付完成")]),
      _c("span", [
        _c("em", [_vm._v("立即支付")]),
        _c("em", [_vm._v("查看详情")])
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-c745c520", esExports)
  }
}

/***/ }),
/* 139 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrderDetail_vue__ = __webpack_require__(141);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrderDetail_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrderDetail_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3f7a13c2_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_MyOrderDetail_vue__ = __webpack_require__(142);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(140)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-3f7a13c2"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_MyOrderDetail_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3f7a13c2_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_MyOrderDetail_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/MyOrderDetail.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3f7a13c2", Component.options)
  } else {
    hotAPI.reload("data-v-3f7a13c2", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 140 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CouponGift = __webpack_require__(15);

var _CouponGift2 = _interopRequireDefault(_CouponGift);

var _CouponOrder = __webpack_require__(16);

var _CouponOrder2 = _interopRequireDefault(_CouponOrder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'MyOrderDetail',
  components: {
    CouponGift: _CouponGift2.default,
    CouponOrder: _CouponOrder2.default
  }
};

/***/ }),
/* 142 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "my-order-detail" } }, [
    _vm._m(0, false, false),
    _vm._m(1, false, false),
    _c("section", { staticClass: "order-cont" }, [
      _c("div", { staticClass: "title" }, [_vm._v("订单内容")]),
      _c(
        "main",
        { staticClass: "cont" },
        [
          _vm._m(2, false, false),
          _c("section", [
            _c("ul", [
              _c("li", [_vm._m(3, false, false), _c("CouponOrder")], 1)
            ])
          ]),
          _c("CouponGift"),
          _vm._m(4, false, false)
        ],
        1
      )
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("h3", { staticClass: "title" }, [
      _c("span", [_vm._v("订单详情")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("section", { staticClass: "order-info" }, [
      _c("div", { staticClass: "title" }, [_vm._v("订单信息")]),
      _c("div", { staticClass: "info" }, [
        _c("div", { staticClass: "status" }, [
          _c("span", { staticClass: "order-num" }, [
            _vm._v("订单号 DFD897987907")
          ]),
          _c("span", { staticClass: "st" }, [
            _vm._v("订单状态："),
            _c("em", [_vm._v("待支付")])
          ])
        ]),
        _c("address", { staticClass: "addr" }, [
          _c("div", { staticClass: "addr-info" }, [
            _c("div", { staticClass: "title" }, [_vm._v("收货信息")]),
            _c("ul", [
              _c("li", [
                _c("span", [_vm._v("收货人")]),
                _c("span", [_vm._v("xxxx")])
              ]),
              _c("li", [
                _c("span", [_vm._v("收货地址")]),
                _c("span", [_vm._v("sdfafafasfas")])
              ]),
              _c("li", [
                _c("span", [_vm._v("联系电话")]),
                _c("span", [_vm._v("12313123")])
              ])
            ])
          ]),
          _c("div", { staticClass: "pay-info" }, [
            _c("div", { staticClass: "title" }, [_vm._v("支付信息")]),
            _c("ul", [
              _c("li", [
                _c("span", [_vm._v("支付方式")]),
                _c("span", [_vm._v("微信支付")])
              ]),
              _c("li", [
                _c("span", [_vm._v("支付金额")]),
                _c("span", [_vm._v("478元")])
              ]),
              _c("li", [
                _c("span", [_vm._v("付款时间")]),
                _c("span", [_vm._v("2017-11-10")])
              ])
            ])
          ])
        ])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("nav", { staticClass: "nav" }, [
      _c("span", [_vm._v("商品")]),
      _c("span", [_vm._v("单价")]),
      _c("span", [_vm._v("数量")]),
      _c("span", [_vm._v("小计")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "item" }, [
      _c("span", [
        _c("img", { attrs: { src: "" } }),
        _c("span", { staticClass: "name" }, [_vm._v("asdfas")])
      ]),
      _c("span", { staticClass: "price" }, [
        _c("span", [_vm._v("指导价："), _c("em", [_vm._v("￥980")])]),
        _c("span", [_vm._v("会员价：￥987")])
      ]),
      _c("span", [_vm._v("10")]),
      _c("span", [_vm._v("￥808")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("section", { staticClass: "amount" }, [
      _c("div", { staticClass: "mount" }, [
        _c("span", [
          _vm._v(" \n共计"),
          _c("em", [_vm._v("3")]),
          _vm._v("件商品")
        ]),
        _c("span", [_vm._v("总计：￥7889")])
      ]),
      _c("div", { staticClass: "discount" }, [
        _c("span", [_vm._v("优惠：￥788")]),
        _c("span", [_vm._v("运费：￥89")]),
        _c("span", [_vm._v("商品总价：￥899")])
      ]),
      _c("div", { staticClass: "pay" }, [_vm._v("去支付")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-3f7a13c2", esExports)
  }
}

/***/ }),
/* 143 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "personal" } }, [
    _c("div", { staticClass: "top" }, [_c("Logo")], 1),
    _c("main", { staticClass: "main" }, [
      _c("div", { staticClass: "user-image" }, [
        _c("img", { attrs: { src: _vm.src } }),
        _c("div", { staticClass: "name" }, [
          _vm._v("欢迎您，" + _vm._s(_vm.name))
        ]),
        _c("span", { staticClass: "my-order" }, [_vm._v("我的订单")]),
        _c("span", { staticClass: "setting" }, [_vm._v("个人设置")])
      ]),
      _c("div", { staticClass: "user-info" }, [_c("MyOrderDetail")], 1)
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-0679b1be", esExports)
  }
}

/***/ }),
/* 144 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue__ = __webpack_require__(146);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_be5268ae_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Index_vue__ = __webpack_require__(160);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(145)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Index_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_be5268ae_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Index_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/Index.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-be5268ae", Component.options)
  } else {
    hotAPI.reload("data-v-be5268ae", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 145 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = __webpack_require__(147);

var _index2 = _interopRequireDefault(_index);

var _Header = __webpack_require__(152);

var _Header2 = _interopRequireDefault(_Header);

var _Footer = __webpack_require__(156);

var _Footer2 = _interopRequireDefault(_Footer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'index',
  store: _index2.default,
  components: {
    TopHeader: _Header2.default,
    BottomFooter: _Footer2.default
  }
}; //
//
//
//
//
//
//

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

var _vuex = __webpack_require__(17);

var _vuex2 = _interopRequireDefault(_vuex);

var _state = __webpack_require__(148);

var _state2 = _interopRequireDefault(_state);

var _mutations = __webpack_require__(149);

var _mutations2 = _interopRequireDefault(_mutations);

var _getters = __webpack_require__(150);

var _getters2 = _interopRequireDefault(_getters);

var _actions = __webpack_require__(151);

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vuex2.default);

exports.default = new _vuex2.default.Store({
  state: _state2.default,
  mutations: _mutations2.default,
  getters: _getters2.default,
  actions: _actions2.default
});

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  user: null, // todo：用户登录信息
  isLogin: false, // todo: 用户是否登录
  cartItems: [], // todo: 购物车列表内容
  cartNum: 0,
  orderInfo: []
};

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  changeCartNum: function changeCartNum(state, options) {
    state.cartNum = options.num;
  },
  changeCartItems: function changeCartItems(state, options) {
    state.cartItems = options.slice();
  },
  changeOrderInfo: function changeOrderInfo(state, options) {
    state.orderInfo = options.slice();
  }
};

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  getCartNum: function getCartNum(state) {
    return state.cartNum;
  },
  getCartItems: function getCartItems(state) {
    return state.cartItems;
  },
  getOrderInfo: function getOrderInfo(state) {
    return state.orderInfo;
  }
};

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  changeCartNum: function changeCartNum(_ref, options) {
    var commit = _ref.commit;

    commit('changeCartNum', options);
  },
  changeCartItems: function changeCartItems(_ref2, options) {
    var commit = _ref2.commit;

    commit('changeCartItems', options);
  },
  changeOrderInfo: function changeOrderInfo(_ref3, options) {
    var commit = _ref3.commit;

    commit('changeOrderInfo', options);
  }
};

/***/ }),
/* 152 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Header_vue__ = __webpack_require__(154);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Header_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Header_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_69c673ce_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Header_vue__ = __webpack_require__(155);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(153)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-69c673ce"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Header_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_69c673ce_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Header_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/Header.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-69c673ce", Component.options)
  } else {
    hotAPI.reload("data-v-69c673ce", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 153 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var _vuex = __webpack_require__(17);

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

exports.default = {
  name: 'Head',
  computed: _extends({}, (0, _vuex.mapState)({
    cartNum: function cartNum(state) {
      _newArrowCheck(undefined, undefined);

      return state.cartNum;
    }.bind(undefined)
  }))
};

/***/ }),
/* 155 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("header", { staticClass: "header" }, [
    _c("span", { staticClass: "title" }, [_vm._v("久隆商贸欢迎您")]),
    _c("ul", { staticClass: "info" }, [
      _vm._m(0, false, false),
      _c(
        "li",
        [
          _c(
            "router-link",
            { staticClass: "my-order", attrs: { to: "/personal" } },
            [_c("span", [_vm._v("我的订单")])]
          )
        ],
        1
      ),
      _c(
        "li",
        [
          _c("router-link", { attrs: { to: { path: "/cart" } } }, [
            _c("span", [_vm._v("购物车")])
          ]),
          _c("em", [_vm._v(_vm._s(_vm.cartNum))])
        ],
        1
      )
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("li", [_c("span", [_vm._v("张丽丽")])])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-69c673ce", esExports)
  }
}

/***/ }),
/* 156 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Footer_vue__ = __webpack_require__(158);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Footer_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Footer_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_48940fdc_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Footer_vue__ = __webpack_require__(159);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(157)
}
var normalizeComponent = __webpack_require__(2)
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-48940fdc"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_bustCache_Footer_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_48940fdc_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_template_compiler_preprocessor_engine_jade_node_modules_vue_loader_lib_selector_type_template_index_0_bustCache_Footer_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/modules/Footer.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {  return key !== "default" && key.substr(0, 2) !== "__"})) {  console.error("named exports are not supported in *.vue files.")}

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-48940fdc", Component.options)
  } else {
    hotAPI.reload("data-v-48940fdc", Component.options)
' + '  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 157 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//


/***/ }),
/* 159 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0, false, false)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("footer", { staticClass: "footer" }, [
      _c("div", { staticClass: "cp" }, [
        _c("span", [
          _vm._v(
            "皖公网安备 11000002000088 | 皖ICP证070359号 久隆商贸@2017 版权所有"
          )
        ])
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-48940fdc", esExports)
  }
}

/***/ }),
/* 160 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "index" } },
    [_c("TopHeader"), _c("router-view"), _c("BottomFooter")],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(0)      .rerender("data-v-be5268ae", esExports)
  }
}

/***/ })
],[18]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdnVlLWhvdC1yZWxvYWQtYXBpL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2RlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy92dWUvZGlzdC92dWUucnVudGltZS5lc20uanMgZnJvbSBkbGwtcmVmZXJlbmNlIGJ1bmRsZV9saWJyYXJ5Iiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Mb2dvLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdW5pdHMvQ09ORklHL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3VuaXRzL2NvcmUvQ2FydC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdW5pdHMvY29yZS9BSkFYLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImJ1bmRsZV9saWJyYXJ5XCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL3VuaXRzL0NPTkZJRy9jb2Rlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Qcm9jZXNzLnZ1ZSIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaHRtbC1lbnRpdGllcy9saWIvaHRtbDUtZW50aXRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3FzL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcXMvbGliL2Zvcm1hdHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3VuaXRzL2NvcmUvRXZlbnRCdXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9TdWNjZXNzLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Db3Vwb25HaWZ0LnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Db3Vwb25PcmRlci52dWUiLCJ3ZWJwYWNrOi8vL2RlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy92dWV4L2Rpc3QvdnVleC5lc20uanMgZnJvbSBkbGwtcmVmZXJlbmNlIGJ1bmRsZV9saWJyYXJ5Iiwid2VicGFjazovLy8uL3dlYnBhY2svbW9kdWxlcy9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS1ob3QtbWlkZGxld2FyZS9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vL2RlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy93ZWJwYWNrL2J1aWxkaW4vbW9kdWxlLmpzIGZyb20gZGxsLXJlZmVyZW5jZSBidW5kbGVfbGlicmFyeSIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3RyaXAtYW5zaS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYW5zaS1yZWdleC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spLWhvdC1taWRkbGV3YXJlL2NsaWVudC1vdmVybGF5LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9hbnNpLWh0bWwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2h0bWwtZW50aXRpZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2h0bWwtZW50aXRpZXMvbGliL3htbC1lbnRpdGllcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaHRtbC1lbnRpdGllcy9saWIvaHRtbDQtZW50aXRpZXMuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS1ob3QtbWlkZGxld2FyZS9wcm9jZXNzLXVwZGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlci9yb3V0ZXIuanMiLCJ3ZWJwYWNrOi8vL2RlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy92dWUtcm91dGVyL2Rpc3QvdnVlLXJvdXRlci5lc20uanMgZnJvbSBkbGwtcmVmZXJlbmNlIGJ1bmRsZV9saWJyYXJ5Iiwid2VicGFjazovLy9kZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvaXZpZXcvZGlzdC9pdmlldy5qcyBmcm9tIGRsbC1yZWZlcmVuY2UgYnVuZGxlX2xpYnJhcnkiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmRleC52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmRleC52dWU/YjFiMyIsIndlYnBhY2s6Ly8vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmRleC52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvTG9nby52dWU/MjZkOSIsIndlYnBhY2s6Ly8vc3JjL21vZHVsZXMvTG9nby52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvTG9nby52dWU/ZTM3MyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9jYXJvdXNlbC52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvY2Fyb3VzZWwudnVlPzQ3MTciLCJ3ZWJwYWNrOi8vL3NyYy9tb2R1bGVzL2Nhcm91c2VsLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9jYXJvdXNlbC52dWU/MGIyNCIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL2ltYWdlcy9iYW5uZXIxLmpwZyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL2ltYWdlcy9iYW5uZXIyLmpwZyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL2ltYWdlcy9iYW5uZXIzLmpwZyIsIndlYnBhY2s6Ly8vZGVsZWdhdGVkIC4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIGZyb20gZGxsLXJlZmVyZW5jZSBidW5kbGVfbGlicmFyeSIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcXMvbGliL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9xcy9saWIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9xcy9saWIvcGFyc2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmRleC52dWU/MDFlMyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL2ltYWdlcy9waWMyX2luZGV4LnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL2ltYWdlcy9waWMzX2luZGV4LnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL2ltYWdlcy9waWM0X2luZGV4LnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0xvZ2luLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0xvZ2luLnZ1ZT81YjU1Iiwid2VicGFjazovLy9zcmMvdmlld3MvdnVlX3BhZ2VzL0xvZ2luLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0xvZ2luLnZ1ZT8xNmNjIiwid2VicGFjazovLy8uL3NyYy92aWV3cy92dWVfcGFnZXMvTGlzdC52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9MaXN0LnZ1ZT9hMTBiIiwid2VicGFjazovLy9zcmMvdmlld3MvdnVlX3BhZ2VzL0xpc3QudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1N1Yk1lbnUudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1N1Yk1lbnUudnVlP2I0ZTAiLCJ3ZWJwYWNrOi8vL3NyYy9tb2R1bGVzL1N1Yk1lbnUudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1N1Yk1lbnUudnVlPzBjMjMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvTGlzdC52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvTGlzdC52dWU/MjFiYyIsIndlYnBhY2s6Ly8vc3JjL21vZHVsZXMvTGlzdC52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvTGlzdC52dWU/ZTk3YiIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0xpc3QudnVlPzFkNjkiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Fzc2V0cy9pbWFnZXMvbGlzdF9iYW5uZXIucG5nIiwid2VicGFjazovLy8uL3NyYy92aWV3cy92dWVfcGFnZXMvU2hvcHBpbmdDYXJ0LnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1Nob3BwaW5nQ2FydC52dWU/ODUwZSIsIndlYnBhY2s6Ly8vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9TaG9wcGluZ0NhcnQudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1Byb2Nlc3MudnVlPzA1NWYiLCJ3ZWJwYWNrOi8vL3NyYy9tb2R1bGVzL1Byb2Nlc3MudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1Byb2Nlc3MudnVlPzhiNjQiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9TaG9wcGluZ0NhcnQudnVlP2Y0MmYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9QYXlJbkxpbmUudnVlIiwid2VicGFjazovLy8uL3NyYy92aWV3cy92dWVfcGFnZXMvUGF5SW5MaW5lLnZ1ZT9lOWVkIiwid2VicGFjazovLy9zcmMvdmlld3MvdnVlX3BhZ2VzL1BheUluTGluZS52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9QYXlJbkxpbmUudnVlPzVjNzYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9TdWNjZXNzLnZ1ZT83OWRkIiwid2VicGFjazovLy9zcmMvdmlld3MvdnVlX3BhZ2VzL1N1Y2Nlc3MudnVlIiwid2VicGFjazovLy8uL3NyYy92aWV3cy92dWVfcGFnZXMvU3VjY2Vzcy52dWU/NmQzYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0NvbmZpcm1PcmRlci52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9Db25maXJtT3JkZXIudnVlP2E1OTAiLCJ3ZWJwYWNrOi8vL3NyYy92aWV3cy92dWVfcGFnZXMvQ29uZmlybU9yZGVyLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9OZXdBZGRyLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9OZXdBZGRyLnZ1ZT8wNGU3Iiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL05ld0FkZHIudnVlPzhlNGMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9Db25maXJtT3JkZXIudnVlPzI5M2YiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9EZXRhaWxzLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0RldGFpbHMudnVlP2QwM2EiLCJ3ZWJwYWNrOi8vL3NyYy92aWV3cy92dWVfcGFnZXMvRGV0YWlscy52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvRGV0YWlscy52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvRGV0YWlscy52dWU/NzVhMCIsIndlYnBhY2s6Ly8vc3JjL21vZHVsZXMvRGV0YWlscy52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvRGV0YWlscy52dWU/Mjk3YiIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0RldGFpbHMudnVlPzMxYjUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmZvcm1hdGlvbi52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmZvcm1hdGlvbi52dWU/YWQ0MyIsIndlYnBhY2s6Ly8vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmZvcm1hdGlvbi52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmZvcm1hdGlvbi52dWU/YTM2YiIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1BlcnNvbmFsLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1BlcnNvbmFsLnZ1ZT8wMDcxIiwid2VicGFjazovLy9zcmMvdmlld3MvdnVlX3BhZ2VzL1BlcnNvbmFsLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9QZXJzb25hbFNldHRpbmcudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1BlcnNvbmFsU2V0dGluZy52dWU/NjgwYSIsIndlYnBhY2s6Ly8vc3JjL21vZHVsZXMvUGVyc29uYWxTZXR0aW5nLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9CYXNlSW5mby52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvQmFzZUluZm8udnVlPzMyYWIiLCJ3ZWJwYWNrOi8vL3NyYy9tb2R1bGVzL0Jhc2VJbmZvLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9CYXNlSW5mby52dWU/NzBhOSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9CYXNlTW9kaWZ5UFcudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0Jhc2VNb2RpZnlQVy52dWU/OGZiMiIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9CYXNlTW9kaWZ5UFcudnVlP2QyNWIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvQmFzZU1vZGlmeVBob25lLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9CYXNlTW9kaWZ5UGhvbmUudnVlPzI0ODUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvQmFzZU1vZGlmeVBob25lLnZ1ZT80ZGI3Iiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0Jhc2VBZGRyLnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9CYXNlQWRkci52dWU/YjQ1MSIsIndlYnBhY2s6Ly8vc3JjL21vZHVsZXMvQmFzZUFkZHIudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0Jhc2VBZGRyLnZ1ZT9hNWMwIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL1BlcnNvbmFsU2V0dGluZy52dWU/OWI4ZiIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9NeU9yZGVyc0xpc3QudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL015T3JkZXJzTGlzdC52dWU/MDQzZiIsIndlYnBhY2s6Ly8vc3JjL21vZHVsZXMvTXlPcmRlcnNMaXN0LnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Db3Vwb25HaWZ0LnZ1ZT9hNmE4Iiwid2VicGFjazovLy9zcmMvbW9kdWxlcy9Db3Vwb25HaWZ0LnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Db3Vwb25HaWZ0LnZ1ZT9kZjNkIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0NvdXBvbk9yZGVyLnZ1ZT9hYTI4Iiwid2VicGFjazovLy9zcmMvbW9kdWxlcy9Db3Vwb25PcmRlci52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvQ291cG9uT3JkZXIudnVlPzM4YTciLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvTXlPcmRlcnNMaXN0LnZ1ZT85ZWZkIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL015T3JkZXJEZXRhaWwudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL015T3JkZXJEZXRhaWwudnVlPzU2YzkiLCJ3ZWJwYWNrOi8vL3NyYy9tb2R1bGVzL015T3JkZXJEZXRhaWwudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL015T3JkZXJEZXRhaWwudnVlP2JiNjUiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9QZXJzb25hbC52dWU/NGZmMSIsIndlYnBhY2s6Ly8vLi9zcmMvSW5kZXgudnVlIiwid2VicGFjazovLy8uL3NyYy9JbmRleC52dWU/NDBmMyIsIndlYnBhY2s6Ly8vc3JjL0luZGV4LnZ1ZSIsIndlYnBhY2s6Ly8vLi9zcmMvdnVleC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdnVleC9zdGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdnVleC9tdXRhdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Z1ZXgvZ2V0dGVycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdnVleC9hY3Rpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0hlYWRlci52dWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvSGVhZGVyLnZ1ZT9mZDI5Iiwid2VicGFjazovLy9zcmMvbW9kdWxlcy9IZWFkZXIudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0hlYWRlci52dWU/ZGNlMyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Gb290ZXIudnVlIiwid2VicGFjazovLy8uL3NyYy9tb2R1bGVzL0Zvb3Rlci52dWU/Mzc0ZSIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9Gb290ZXIudnVlPzMzYWIiLCJ3ZWJwYWNrOi8vLy4vc3JjL0luZGV4LnZ1ZT9lN2QyIl0sIm5hbWVzIjpbIldFQlNJVEUiLCJCYXNlVVJMIiwiTElTVCIsIkNBUlRMSVNUIiwiQUREVE9DQVJUIiwiZ2V0Q29tbW9kaXR5Q2hhbm5lbEJ5SUQiLCJhZGRDb21tb2RpdHlUb0NhcnQiLCJjaGFuZ2VDb21tb2RpdHlOdW0iLCJkZWxDb21tb2RpdHkiLCJnZXRDdXN0b21lclJlY2VpdmluZ0FkZHIiLCJjb21taXRDYXJ0IiwiZ2V0Q2FydExpc3QiLCJwYXJhbXMiLCJnZXQiLCJ1cmwiLCJkYXRhIiwidXNlcklEIiwic3VjY2VzcyIsInJlcyIsImNvZGUiLCJTVUNDRVNTIiwiJHN0b3JlIiwiZGlzcGF0Y2giLCJudW0iLCJyZXN1bHQiLCJsZW5ndGgiLCJ0aGVuIiwiY2F0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJlcnIiLCJwb3N0Iiwic3RyaW5naWZ5IiwiaGVhZGVycyIsImhvdENsaWVudCIsInJlcXVpcmUiLCJzdWJzY3JpYmUiLCJldmVudCIsImFjdGlvbiIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIiwiZWwiLCJyb3V0ZXIiLCJjb21wb25lbnRzIiwiSW5kZXgiLCJyZW5kZXIiLCJjYWxsYmFjayIsInVzZSIsInJvdXRlcyIsInBhdGgiLCJuYW1lIiwiY29tcG9uZW50IiwibWV0YSIsInByb3BzIiwiU3RvcmUiLCJzdGF0ZSIsIm11dGF0aW9ucyIsImdldHRlcnMiLCJhY3Rpb25zIiwidXNlciIsImlzTG9naW4iLCJjYXJ0SXRlbXMiLCJjYXJ0TnVtIiwib3JkZXJJbmZvIiwiY2hhbmdlQ2FydE51bSIsIm9wdGlvbnMiLCJjaGFuZ2VDYXJ0SXRlbXMiLCJzbGljZSIsImNoYW5nZU9yZGVySW5mbyIsImdldENhcnROdW0iLCJnZXRDYXJ0SXRlbXMiLCJnZXRPcmRlckluZm8iLCJjb21taXQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsU0FBUztBQUNwQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQ0FBQzs7Ozs7OztBQ25PRCw2Qzs7Ozs7O0FDQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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RDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSxtQkFBbUIsb0JBQW9CO0FBQ3ZDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0NBQXdDOztBQUV4QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsbUJBQW1CLG9CQUFvQjtBQUN2Qzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7O0FDaERBO0FBQUE7QUFDQTtBQUNBO0FBQ0EseUJBQTBUO0FBQzFUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDdUs7QUFDdks7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtFQUErRSx3REFBd0QsSUFBSTs7QUFFM0k7QUFDQSxXQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQ0FBQzs7QUFFRDs7Ozs7OztBQzdDQSx5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHdCQUF3QjtBQUNqRCxpQkFBaUIsb0JBQW9CO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7Ozs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxTQUFTLGNBQWMsRUFBRTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQyIsImZpbGUiOiJqcy9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBWdWUgLy8gbGF0ZSBiaW5kXG52YXIgdmVyc2lvblxudmFyIG1hcCA9ICh3aW5kb3cuX19WVUVfSE9UX01BUF9fID0gT2JqZWN0LmNyZWF0ZShudWxsKSlcbnZhciBpbnN0YWxsZWQgPSBmYWxzZVxudmFyIGlzQnJvd3NlcmlmeSA9IGZhbHNlXG52YXIgaW5pdEhvb2tOYW1lID0gJ2JlZm9yZUNyZWF0ZSdcblxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24gKHZ1ZSwgYnJvd3NlcmlmeSkge1xuICBpZiAoaW5zdGFsbGVkKSB7IHJldHVybiB9XG4gIGluc3RhbGxlZCA9IHRydWVcblxuICBWdWUgPSB2dWUuX19lc01vZHVsZSA/IHZ1ZS5kZWZhdWx0IDogdnVlXG4gIHZlcnNpb24gPSBWdWUudmVyc2lvbi5zcGxpdCgnLicpLm1hcChOdW1iZXIpXG4gIGlzQnJvd3NlcmlmeSA9IGJyb3dzZXJpZnlcblxuICAvLyBjb21wYXQgd2l0aCA8IDIuMC4wLWFscGhhLjdcbiAgaWYgKFZ1ZS5jb25maWcuX2xpZmVjeWNsZUhvb2tzLmluZGV4T2YoJ2luaXQnKSA+IC0xKSB7XG4gICAgaW5pdEhvb2tOYW1lID0gJ2luaXQnXG4gIH1cblxuICBleHBvcnRzLmNvbXBhdGlibGUgPSB2ZXJzaW9uWzBdID49IDJcbiAgaWYgKCFleHBvcnRzLmNvbXBhdGlibGUpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnW0hNUl0gWW91IGFyZSB1c2luZyBhIHZlcnNpb24gb2YgdnVlLWhvdC1yZWxvYWQtYXBpIHRoYXQgaXMgJyArXG4gICAgICAgICdvbmx5IGNvbXBhdGlibGUgd2l0aCBWdWUuanMgY29yZSBeMi4wLjAuJ1xuICAgIClcbiAgICByZXR1cm5cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHJlY29yZCBmb3IgYSBob3QgbW9kdWxlLCB3aGljaCBrZWVwcyB0cmFjayBvZiBpdHMgY29uc3RydWN0b3JcbiAqIGFuZCBpbnN0YW5jZXNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZXhwb3J0cy5jcmVhdGVSZWNvcmQgPSBmdW5jdGlvbiAoaWQsIG9wdGlvbnMpIHtcbiAgdmFyIEN0b3IgPSBudWxsXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIEN0b3IgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IEN0b3Iub3B0aW9uc1xuICB9XG4gIG1ha2VPcHRpb25zSG90KGlkLCBvcHRpb25zKVxuICBtYXBbaWRdID0ge1xuICAgIEN0b3I6IEN0b3IsXG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICBpbnN0YW5jZXM6IFtdXG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlIGEgQ29tcG9uZW50IG9wdGlvbnMgb2JqZWN0IGhvdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gbWFrZU9wdGlvbnNIb3QoaWQsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuZnVuY3Rpb25hbCkge1xuICAgIHZhciByZW5kZXIgPSBvcHRpb25zLnJlbmRlclxuICAgIG9wdGlvbnMucmVuZGVyID0gZnVuY3Rpb24gKGgsIGN0eCkge1xuICAgICAgdmFyIGluc3RhbmNlcyA9IG1hcFtpZF0uaW5zdGFuY2VzXG4gICAgICBpZiAoY3R4ICYmIGluc3RhbmNlcy5pbmRleE9mKGN0eC5wYXJlbnQpIDwgMCkge1xuICAgICAgICBpbnN0YW5jZXMucHVzaChjdHgucGFyZW50KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbmRlcihoLCBjdHgpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGluamVjdEhvb2sob3B0aW9ucywgaW5pdEhvb2tOYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWNvcmQgPSBtYXBbaWRdXG4gICAgICBpZiAoIXJlY29yZC5DdG9yKSB7XG4gICAgICAgIHJlY29yZC5DdG9yID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgICAgfVxuICAgICAgcmVjb3JkLmluc3RhbmNlcy5wdXNoKHRoaXMpXG4gICAgfSlcbiAgICBpbmplY3RIb29rKG9wdGlvbnMsICdiZWZvcmVEZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5zdGFuY2VzID0gbWFwW2lkXS5pbnN0YW5jZXNcbiAgICAgIGluc3RhbmNlcy5zcGxpY2UoaW5zdGFuY2VzLmluZGV4T2YodGhpcyksIDEpXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIEluamVjdCBhIGhvb2sgdG8gYSBob3QgcmVsb2FkYWJsZSBjb21wb25lbnQgc28gdGhhdFxuICogd2UgY2FuIGtlZXAgdHJhY2sgb2YgaXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBob29rXG4gKi9cblxuZnVuY3Rpb24gaW5qZWN0SG9vayhvcHRpb25zLCBuYW1lLCBob29rKSB7XG4gIHZhciBleGlzdGluZyA9IG9wdGlvbnNbbmFtZV1cbiAgb3B0aW9uc1tuYW1lXSA9IGV4aXN0aW5nXG4gICAgPyBBcnJheS5pc0FycmF5KGV4aXN0aW5nKSA/IGV4aXN0aW5nLmNvbmNhdChob29rKSA6IFtleGlzdGluZywgaG9va11cbiAgICA6IFtob29rXVxufVxuXG5mdW5jdGlvbiB0cnlXcmFwKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoaWQsIGFyZykge1xuICAgIHRyeSB7XG4gICAgICBmbihpZCwgYXJnKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1NvbWV0aGluZyB3ZW50IHdyb25nIGR1cmluZyBWdWUgY29tcG9uZW50IGhvdC1yZWxvYWQuIEZ1bGwgcmVsb2FkIHJlcXVpcmVkLidcbiAgICAgIClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlT3B0aW9ucyAob2xkT3B0aW9ucywgbmV3T3B0aW9ucykge1xuICBmb3IgKHZhciBrZXkgaW4gb2xkT3B0aW9ucykge1xuICAgIGlmICghKGtleSBpbiBuZXdPcHRpb25zKSkge1xuICAgICAgZGVsZXRlIG9sZE9wdGlvbnNba2V5XVxuICAgIH1cbiAgfVxuICBmb3IgKHZhciBrZXkkMSBpbiBuZXdPcHRpb25zKSB7XG4gICAgb2xkT3B0aW9uc1trZXkkMV0gPSBuZXdPcHRpb25zW2tleSQxXVxuICB9XG59XG5cbmV4cG9ydHMucmVyZW5kZXIgPSB0cnlXcmFwKGZ1bmN0aW9uIChpZCwgb3B0aW9ucykge1xuICB2YXIgcmVjb3JkID0gbWFwW2lkXVxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICByZWNvcmQuaW5zdGFuY2VzLnNsaWNlKCkuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlLiRmb3JjZVVwZGF0ZSgpXG4gICAgfSlcbiAgICByZXR1cm5cbiAgfVxuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG4gIH1cbiAgaWYgKHJlY29yZC5DdG9yKSB7XG4gICAgcmVjb3JkLkN0b3Iub3B0aW9ucy5yZW5kZXIgPSBvcHRpb25zLnJlbmRlclxuICAgIHJlY29yZC5DdG9yLm9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcbiAgICByZWNvcmQuaW5zdGFuY2VzLnNsaWNlKCkuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlLiRvcHRpb25zLnJlbmRlciA9IG9wdGlvbnMucmVuZGVyXG4gICAgICBpbnN0YW5jZS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICAgICAgLy8gcmVzZXQgc3RhdGljIHRyZWVzXG4gICAgICAvLyBwcmUgMi41LCBhbGwgc3RhdGljIHRyZWVzIGFyZSBjYWhjZWQgdG9nZXRoZXIgb24gdGhlIGluc3RhbmNlXG4gICAgICBpZiAoaW5zdGFuY2UuX3N0YXRpY1RyZWVzKSB7XG4gICAgICAgIGluc3RhbmNlLl9zdGF0aWNUcmVlcyA9IFtdXG4gICAgICB9XG4gICAgICAvLyAyLjUuMFxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVjb3JkLkN0b3Iub3B0aW9ucy5jYWNoZWQpKSB7XG4gICAgICAgIHJlY29yZC5DdG9yLm9wdGlvbnMuY2FjaGVkID0gW11cbiAgICAgIH1cbiAgICAgIC8vIDIuNS4zXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnN0YW5jZS4kb3B0aW9ucy5jYWNoZWQpKSB7XG4gICAgICAgIGluc3RhbmNlLiRvcHRpb25zLmNhY2hlZCA9IFtdXG4gICAgICB9XG4gICAgICAvLyBwb3N0IDIuNS40OiB2LW9uY2UgdHJlZXMgYXJlIGNhY2hlZCBvbiBpbnN0YW5jZS5fc3RhdGljVHJlZXMuXG4gICAgICAvLyBQdXJlIHN0YXRpYyB0cmVlcyBhcmUgY2FjaGVkIG9uIHRoZSBzdGF0aWNSZW5kZXJGbnMgYXJyYXlcbiAgICAgIC8vIChib3RoIGFscmVhZHkgcmVzZXQgYWJvdmUpXG4gICAgICBpbnN0YW5jZS4kZm9yY2VVcGRhdGUoKVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgLy8gZnVuY3Rpb25hbCBvciBubyBpbnN0YW5jZSBjcmVhdGVkIHlldFxuICAgIHJlY29yZC5vcHRpb25zLnJlbmRlciA9IG9wdGlvbnMucmVuZGVyXG4gICAgcmVjb3JkLm9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcblxuICAgIC8vIGhhbmRsZSBmdW5jdGlvbmFsIGNvbXBvbmVudCByZS1yZW5kZXJcbiAgICBpZiAocmVjb3JkLm9wdGlvbnMuZnVuY3Rpb25hbCkge1xuICAgICAgLy8gcmVyZW5kZXIgd2l0aCBmdWxsIG9wdGlvbnNcbiAgICAgIGlmIChPYmplY3Qua2V5cyhvcHRpb25zKS5sZW5ndGggPiAyKSB7XG4gICAgICAgIHVwZGF0ZU9wdGlvbnMocmVjb3JkLm9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB0ZW1wbGF0ZS1vbmx5IHJlcmVuZGVyLlxuICAgICAgICAvLyBuZWVkIHRvIGluamVjdCB0aGUgc3R5bGUgaW5qZWN0aW9uIGNvZGUgZm9yIENTUyBtb2R1bGVzXG4gICAgICAgIC8vIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgICAgIHZhciBpbmplY3RTdHlsZXMgPSByZWNvcmQub3B0aW9ucy5faW5qZWN0U3R5bGVzXG4gICAgICAgIGlmIChpbmplY3RTdHlsZXMpIHtcbiAgICAgICAgICB2YXIgcmVuZGVyID0gb3B0aW9ucy5yZW5kZXJcbiAgICAgICAgICByZWNvcmQub3B0aW9ucy5yZW5kZXIgPSBmdW5jdGlvbiAoaCwgY3R4KSB7XG4gICAgICAgICAgICBpbmplY3RTdHlsZXMuY2FsbChjdHgpXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyKGgsIGN0eClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlY29yZC5vcHRpb25zLl9DdG9yID0gbnVsbFxuICAgICAgLy8gMi41LjNcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlY29yZC5vcHRpb25zLmNhY2hlZCkpIHtcbiAgICAgICAgcmVjb3JkLm9wdGlvbnMuY2FjaGVkID0gW11cbiAgICAgIH1cbiAgICAgIHJlY29yZC5pbnN0YW5jZXMuc2xpY2UoKS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgICBpbnN0YW5jZS4kZm9yY2VVcGRhdGUoKVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG5cbmV4cG9ydHMucmVsb2FkID0gdHJ5V3JhcChmdW5jdGlvbiAoaWQsIG9wdGlvbnMpIHtcbiAgdmFyIHJlY29yZCA9IG1hcFtpZF1cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zLm9wdGlvbnNcbiAgICB9XG4gICAgbWFrZU9wdGlvbnNIb3QoaWQsIG9wdGlvbnMpXG4gICAgaWYgKHJlY29yZC5DdG9yKSB7XG4gICAgICBpZiAodmVyc2lvblsxXSA8IDIpIHtcbiAgICAgICAgLy8gcHJlc2VydmUgcHJlIDIuMiBiZWhhdmlvciBmb3IgZ2xvYmFsIG1peGluIGhhbmRsaW5nXG4gICAgICAgIHJlY29yZC5DdG9yLmV4dGVuZE9wdGlvbnMgPSBvcHRpb25zXG4gICAgICB9XG4gICAgICB2YXIgbmV3Q3RvciA9IHJlY29yZC5DdG9yLnN1cGVyLmV4dGVuZChvcHRpb25zKVxuICAgICAgcmVjb3JkLkN0b3Iub3B0aW9ucyA9IG5ld0N0b3Iub3B0aW9uc1xuICAgICAgcmVjb3JkLkN0b3IuY2lkID0gbmV3Q3Rvci5jaWRcbiAgICAgIHJlY29yZC5DdG9yLnByb3RvdHlwZSA9IG5ld0N0b3IucHJvdG90eXBlXG4gICAgICBpZiAobmV3Q3Rvci5yZWxlYXNlKSB7XG4gICAgICAgIC8vIHRlbXBvcmFyeSBnbG9iYWwgbWl4aW4gc3RyYXRlZ3kgdXNlZCBpbiA8IDIuMC4wLWFscGhhLjZcbiAgICAgICAgbmV3Q3Rvci5yZWxlYXNlKClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlT3B0aW9ucyhyZWNvcmQub3B0aW9ucywgb3B0aW9ucylcbiAgICB9XG4gIH1cbiAgcmVjb3JkLmluc3RhbmNlcy5zbGljZSgpLmZvckVhY2goZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgaWYgKGluc3RhbmNlLiR2bm9kZSAmJiBpbnN0YW5jZS4kdm5vZGUuY29udGV4dCkge1xuICAgICAgaW5zdGFuY2UuJHZub2RlLmNvbnRleHQuJGZvcmNlVXBkYXRlKClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnUm9vdCBvciBtYW51YWxseSBtb3VudGVkIGluc3RhbmNlIG1vZGlmaWVkLiBGdWxsIHJlbG9hZCByZXF1aXJlZC4nXG4gICAgICApXG4gICAgfVxuICB9KVxufSlcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1ob3QtcmVsb2FkLWFwaS9kaXN0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gKF9fd2VicGFja19yZXF1aXJlX18oNykpKDQpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGRlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy92dWUvZGlzdC92dWUucnVudGltZS5lc20uanMgZnJvbSBkbGwtcmVmZXJlbmNlIGJ1bmRsZV9saWJyYXJ5XG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbHMgX19WVUVfU1NSX0NPTlRFWFRfXyAqL1xuXG4vLyBJTVBPUlRBTlQ6IERvIE5PVCB1c2UgRVMyMDE1IGZlYXR1cmVzIGluIHRoaXMgZmlsZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGEgcnVudGltZSB1dGlsaXR5IGZvciBjbGVhbmVyIGNvbXBvbmVudCBtb2R1bGUgb3V0cHV0IGFuZCB3aWxsXG4vLyBiZSBpbmNsdWRlZCBpbiB0aGUgZmluYWwgd2VicGFjayB1c2VyIGJ1bmRsZS5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVDb21wb25lbnQgKFxuICByYXdTY3JpcHRFeHBvcnRzLFxuICBjb21waWxlZFRlbXBsYXRlLFxuICBmdW5jdGlvbmFsVGVtcGxhdGUsXG4gIGluamVjdFN0eWxlcyxcbiAgc2NvcGVJZCxcbiAgbW9kdWxlSWRlbnRpZmllciAvKiBzZXJ2ZXIgb25seSAqL1xuKSB7XG4gIHZhciBlc01vZHVsZVxuICB2YXIgc2NyaXB0RXhwb3J0cyA9IHJhd1NjcmlwdEV4cG9ydHMgPSByYXdTY3JpcHRFeHBvcnRzIHx8IHt9XG5cbiAgLy8gRVM2IG1vZHVsZXMgaW50ZXJvcFxuICB2YXIgdHlwZSA9IHR5cGVvZiByYXdTY3JpcHRFeHBvcnRzLmRlZmF1bHRcbiAgaWYgKHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBlc01vZHVsZSA9IHJhd1NjcmlwdEV4cG9ydHNcbiAgICBzY3JpcHRFeHBvcnRzID0gcmF3U2NyaXB0RXhwb3J0cy5kZWZhdWx0XG4gIH1cblxuICAvLyBWdWUuZXh0ZW5kIGNvbnN0cnVjdG9yIGV4cG9ydCBpbnRlcm9wXG4gIHZhciBvcHRpb25zID0gdHlwZW9mIHNjcmlwdEV4cG9ydHMgPT09ICdmdW5jdGlvbidcbiAgICA/IHNjcmlwdEV4cG9ydHMub3B0aW9uc1xuICAgIDogc2NyaXB0RXhwb3J0c1xuXG4gIC8vIHJlbmRlciBmdW5jdGlvbnNcbiAgaWYgKGNvbXBpbGVkVGVtcGxhdGUpIHtcbiAgICBvcHRpb25zLnJlbmRlciA9IGNvbXBpbGVkVGVtcGxhdGUucmVuZGVyXG4gICAgb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBjb21waWxlZFRlbXBsYXRlLnN0YXRpY1JlbmRlckZuc1xuICAgIG9wdGlvbnMuX2NvbXBpbGVkID0gdHJ1ZVxuICB9XG5cbiAgLy8gZnVuY3Rpb25hbCB0ZW1wbGF0ZVxuICBpZiAoZnVuY3Rpb25hbFRlbXBsYXRlKSB7XG4gICAgb3B0aW9ucy5mdW5jdGlvbmFsID0gdHJ1ZVxuICB9XG5cbiAgLy8gc2NvcGVkSWRcbiAgaWYgKHNjb3BlSWQpIHtcbiAgICBvcHRpb25zLl9zY29wZUlkID0gc2NvcGVJZFxuICB9XG5cbiAgdmFyIGhvb2tcbiAgaWYgKG1vZHVsZUlkZW50aWZpZXIpIHsgLy8gc2VydmVyIGJ1aWxkXG4gICAgaG9vayA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAvLyAyLjMgaW5qZWN0aW9uXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgY29udGV4dCB8fCAvLyBjYWNoZWQgY2FsbFxuICAgICAgICAodGhpcy4kdm5vZGUgJiYgdGhpcy4kdm5vZGUuc3NyQ29udGV4dCkgfHwgLy8gc3RhdGVmdWxcbiAgICAgICAgKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LiR2bm9kZSAmJiB0aGlzLnBhcmVudC4kdm5vZGUuc3NyQ29udGV4dCkgLy8gZnVuY3Rpb25hbFxuICAgICAgLy8gMi4yIHdpdGggcnVuSW5OZXdDb250ZXh0OiB0cnVlXG4gICAgICBpZiAoIWNvbnRleHQgJiYgdHlwZW9mIF9fVlVFX1NTUl9DT05URVhUX18gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnRleHQgPSBfX1ZVRV9TU1JfQ09OVEVYVF9fXG4gICAgICB9XG4gICAgICAvLyBpbmplY3QgY29tcG9uZW50IHN0eWxlc1xuICAgICAgaWYgKGluamVjdFN0eWxlcykge1xuICAgICAgICBpbmplY3RTdHlsZXMuY2FsbCh0aGlzLCBjb250ZXh0KVxuICAgICAgfVxuICAgICAgLy8gcmVnaXN0ZXIgY29tcG9uZW50IG1vZHVsZSBpZGVudGlmaWVyIGZvciBhc3luYyBjaHVuayBpbmZlcnJlbmNlXG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Ll9yZWdpc3RlcmVkQ29tcG9uZW50cykge1xuICAgICAgICBjb250ZXh0Ll9yZWdpc3RlcmVkQ29tcG9uZW50cy5hZGQobW9kdWxlSWRlbnRpZmllcilcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gdXNlZCBieSBzc3IgaW4gY2FzZSBjb21wb25lbnQgaXMgY2FjaGVkIGFuZCBiZWZvcmVDcmVhdGVcbiAgICAvLyBuZXZlciBnZXRzIGNhbGxlZFxuICAgIG9wdGlvbnMuX3NzclJlZ2lzdGVyID0gaG9va1xuICB9IGVsc2UgaWYgKGluamVjdFN0eWxlcykge1xuICAgIGhvb2sgPSBpbmplY3RTdHlsZXNcbiAgfVxuXG4gIGlmIChob29rKSB7XG4gICAgdmFyIGZ1bmN0aW9uYWwgPSBvcHRpb25zLmZ1bmN0aW9uYWxcbiAgICB2YXIgZXhpc3RpbmcgPSBmdW5jdGlvbmFsXG4gICAgICA/IG9wdGlvbnMucmVuZGVyXG4gICAgICA6IG9wdGlvbnMuYmVmb3JlQ3JlYXRlXG5cbiAgICBpZiAoIWZ1bmN0aW9uYWwpIHtcbiAgICAgIC8vIGluamVjdCBjb21wb25lbnQgcmVnaXN0cmF0aW9uIGFzIGJlZm9yZUNyZWF0ZSBob29rXG4gICAgICBvcHRpb25zLmJlZm9yZUNyZWF0ZSA9IGV4aXN0aW5nXG4gICAgICAgID8gW10uY29uY2F0KGV4aXN0aW5nLCBob29rKVxuICAgICAgICA6IFtob29rXVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBmb3IgdGVtcGxhdGUtb25seSBob3QtcmVsb2FkIGJlY2F1c2UgaW4gdGhhdCBjYXNlIHRoZSByZW5kZXIgZm4gZG9lc24ndFxuICAgICAgLy8gZ28gdGhyb3VnaCB0aGUgbm9ybWFsaXplclxuICAgICAgb3B0aW9ucy5faW5qZWN0U3R5bGVzID0gaG9va1xuICAgICAgLy8gcmVnaXN0ZXIgZm9yIGZ1bmN0aW9hbCBjb21wb25lbnQgaW4gdnVlIGZpbGVcbiAgICAgIG9wdGlvbnMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyV2l0aFN0eWxlSW5qZWN0aW9uIChoLCBjb250ZXh0KSB7XG4gICAgICAgIGhvb2suY2FsbChjb250ZXh0KVxuICAgICAgICByZXR1cm4gZXhpc3RpbmcoaCwgY29udGV4dClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVzTW9kdWxlOiBlc01vZHVsZSxcbiAgICBleHBvcnRzOiBzY3JpcHRFeHBvcnRzLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXIuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtOGQ4NjYzYThcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vTG9nby52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL0xvZ28udnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi04ZDg2NjNhOFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vTG9nby52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtOGQ4NjYzYThcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvTG9nby52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LThkODY2M2E4XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtOGQ4NjYzYThcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL0xvZ28udnVlXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IFdFQlNJVEUgPSAnaHR0cDovLzExNC4yMTUuMTguNTg6ODA4MC9zYWxlJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBCYXNlVVJMOiBgJHtXRUJTSVRFfWAsXG5cbiAgLy8gdG9kbzog6YCa6L+H5ZWG5ZOB57G75Z6L6I635Y+W5ZWG5ZOB5YiX6KGoXG4gIExJU1Q6IGAke1dFQlNJVEV9L2FwaS9jb21tb2RpdHkvZ2V0Q29tbW9kaXR5QnlUeXBlYCxcblxuICAvLyB0b2RvOiDojrflj5botK3nianovabliJfooahcbiAgQ0FSVExJU1Q6IGAke1dFQlNJVEV9L2FwaS9zaG9wcGluZ0NhcnQvZ2V0Q2FydExpc3RgLFxuXG4gIC8vIHRvZG86IOa3u+WKoOWVhuWTgeWIsOi0reeJqei9plxuICBBRERUT0NBUlQ6IGAke1dFQlNJVEV9L2FwaS9zaG9wcGluZ0NhcnQvYWRkQ29tbW9kaXR5VG9DYXJ0YCxcbiAgZ2V0Q29tbW9kaXR5Q2hhbm5lbEJ5SUQ6IGAke1dFQlNJVEV9L2FwaS9jb21tb2RpdHkvZ2V0Q29tbW9kaXR5Q2hhbm5lbEJ5SURgLFxuICBhZGRDb21tb2RpdHlUb0NhcnQ6IGAke1dFQlNJVEV9L2FwaS9zaG9wcGluZ0NhcnQvYWRkQ29tbW9kaXR5VG9DYXJ0YCxcblxuICAvLyB0b2RvOiDkv67mlLnllYblk4HmlbDph49cbiAgY2hhbmdlQ29tbW9kaXR5TnVtOiBgJHtXRUJTSVRFfS9hcGkvc2hvcHBpbmdDYXJ0L2NoYW5nZUNvbW1vZGl0eU51bWAsXG5cbiAgLy8gdG9kbzog5ZWG5ZOB5LuO6LSt54mp6L2m6YeM5Yig6ZmkXG4gIGRlbENvbW1vZGl0eTogYCR7V0VCU0lURX0vYXBpL3Nob3BwaW5nQ2FydC9kZWxDb21tb2RpdHlgLFxuXG4gIC8vIHRvZG86IOiOt+WPluaUtui0p+WcsOWdgFxuICBnZXRDdXN0b21lclJlY2VpdmluZ0FkZHI6IGAke1dFQlNJVEV9L2FwaS9jdXN0b21lci9nZXRDdXN0b21lclJlY2VpdmluZ0FkZHJgLFxuXG4gIC8vIHRvZG86IOaPkOS6pOi0reeJqei9plxuICBjb21taXRDYXJ0OiBgJHtXRUJTSVRFfS9hcGkvc2hvcHBpbmdDYXJ0L2NvbW1pdENhcnRgXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3VuaXRzL0NPTkZJRy91cmxzLmpzIiwiaW1wb3J0IENPREVTIGZyb20gJ0AvdW5pdHMvQ09ORklHL2NvZGVzJztcbmltcG9ydCBVUkxTIGZyb20gJ0AvdW5pdHMvQ09ORklHL3VybHMnO1xuaW1wb3J0IGFqYXggZnJvbSAnQC91bml0cy9jb3JlL0FKQVgnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGdldENhcnRMaXN0KCBwYXJhbXMgKSB7XG4gICAgYWpheC5nZXQoIHtcbiAgICAgIHVybDogVVJMUy5DQVJUTElTVCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgdXNlcklEOiAnNzAzZDA2NWIwYjY4NGFlOWJmNGZhM2JlNjdhNDcyNmMnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzdWNjZXNzKCByZXMgKSB7XG4gICAgICAgIGxldCBkYXRhID0gcmVzLmRhdGE7XG5cbiAgICAgICAgaWYgKCBkYXRhLmNvZGUgPT09IENPREVTLlNVQ0NFU1MgKSB7XG4gICAgICAgICAgcGFyYW1zLiRzdG9yZS5kaXNwYXRjaCggJ2NoYW5nZUNhcnROdW0nLCB7XG4gICAgICAgICAgICBudW06IGRhdGEucmVzdWx0Lmxlbmd0aFxuICAgICAgICAgIH0gKTtcbiAgICAgICAgICBwYXJhbXMuJHN0b3JlLmRpc3BhdGNoKCAnY2hhbmdlQ2FydEl0ZW1zJywgZGF0YS5yZXN1bHQgKTtcbiAgICAgICAgICB0eXBlb2YgcGFyYW1zLnN1Y2Nlc3MgPT09ICdmdW5jdGlvbicgJiYgcGFyYW1zLnN1Y2Nlc3MoIGRhdGEgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91bml0cy9jb3JlL0NhcnQuanMiLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFFzIGZyb20gJ3FzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBnZXQoIHBhcmFtcyApIHtcbiAgICBheGlvcy5nZXQoXG4gICAgICBwYXJhbXMudXJsLFxuICAgICAgcGFyYW1zLmRhdGFcbiAgICApLnRoZW4oIGRhdGEgPT4ge1xuICAgICAgdHlwZW9mIHBhcmFtcy5zdWNjZXNzID09PSAnZnVuY3Rpb24nICYmIHBhcmFtcy5zdWNjZXNzKCBkYXRhICk7XG4gICAgfSApLmNhdGNoKCBlcnIgPT4ge1xuICAgICAgY29uc29sZS5lcnJvciggJ2VycjogJywgZXJyICk7XG4gICAgfSApO1xuICB9LFxuICBwb3N0KCBwYXJhbXMgKSB7XG4gICAgYXhpb3MucG9zdChcbiAgICAgIHBhcmFtcy51cmwsXG4gICAgICBRcy5zdHJpbmdpZnkoIHBhcmFtcy5kYXRhICksXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkudGhlbiggZGF0YSA9PiB7XG4gICAgICB0eXBlb2YgcGFyYW1zLnN1Y2Nlc3MgPT09ICdmdW5jdGlvbicgJiYgcGFyYW1zLnN1Y2Nlc3MoIGRhdGEgKTtcbiAgICB9ICkuY2F0Y2goIGVyciA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCAnZXJyOiAnLCBlcnIgKTtcbiAgICB9ICk7XG4gIH1cbn1cbjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91bml0cy9jb3JlL0FKQVguanMiLCJtb2R1bGUuZXhwb3J0cyA9IGJ1bmRsZV9saWJyYXJ5O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiYnVuZGxlX2xpYnJhcnlcIlxuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnQgZGVmYXVsdCB7XG4gIFNVQ0NFU1M6IDBcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdW5pdHMvQ09ORklHL2NvZGVzLmpzIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtZDFiNDhkMDRcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vUHJvY2Vzcy52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL1Byb2Nlc3MudnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi1kMWI0OGQwNFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vUHJvY2Vzcy52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtZDFiNDhkMDRcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvUHJvY2Vzcy52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LWQxYjQ4ZDA0XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtZDFiNDhkMDRcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL1Byb2Nlc3MudnVlXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBFTlRJVElFUyA9IFtbJ0FhY3V0ZScsIFsxOTNdXSwgWydhYWN1dGUnLCBbMjI1XV0sIFsnQWJyZXZlJywgWzI1OF1dLCBbJ2FicmV2ZScsIFsyNTldXSwgWydhYycsIFs4NzY2XV0sIFsnYWNkJywgWzg3NjddXSwgWydhY0UnLCBbODc2NiwgODE5XV0sIFsnQWNpcmMnLCBbMTk0XV0sIFsnYWNpcmMnLCBbMjI2XV0sIFsnYWN1dGUnLCBbMTgwXV0sIFsnQWN5JywgWzEwNDBdXSwgWydhY3knLCBbMTA3Ml1dLCBbJ0FFbGlnJywgWzE5OF1dLCBbJ2FlbGlnJywgWzIzMF1dLCBbJ2FmJywgWzgyODldXSwgWydBZnInLCBbMTIwMDY4XV0sIFsnYWZyJywgWzEyMDA5NF1dLCBbJ0FncmF2ZScsIFsxOTJdXSwgWydhZ3JhdmUnLCBbMjI0XV0sIFsnYWxlZnN5bScsIFs4NTAxXV0sIFsnYWxlcGgnLCBbODUwMV1dLCBbJ0FscGhhJywgWzkxM11dLCBbJ2FscGhhJywgWzk0NV1dLCBbJ0FtYWNyJywgWzI1Nl1dLCBbJ2FtYWNyJywgWzI1N11dLCBbJ2FtYWxnJywgWzEwODE1XV0sIFsnYW1wJywgWzM4XV0sIFsnQU1QJywgWzM4XV0sIFsnYW5kYW5kJywgWzEwODM3XV0sIFsnQW5kJywgWzEwODM1XV0sIFsnYW5kJywgWzg3NDNdXSwgWydhbmRkJywgWzEwODQ0XV0sIFsnYW5kc2xvcGUnLCBbMTA4NDBdXSwgWydhbmR2JywgWzEwODQyXV0sIFsnYW5nJywgWzg3MzZdXSwgWydhbmdlJywgWzEwNjYwXV0sIFsnYW5nbGUnLCBbODczNl1dLCBbJ2FuZ21zZGFhJywgWzEwNjY0XV0sIFsnYW5nbXNkYWInLCBbMTA2NjVdXSwgWydhbmdtc2RhYycsIFsxMDY2Nl1dLCBbJ2FuZ21zZGFkJywgWzEwNjY3XV0sIFsnYW5nbXNkYWUnLCBbMTA2NjhdXSwgWydhbmdtc2RhZicsIFsxMDY2OV1dLCBbJ2FuZ21zZGFnJywgWzEwNjcwXV0sIFsnYW5nbXNkYWgnLCBbMTA2NzFdXSwgWydhbmdtc2QnLCBbODczN11dLCBbJ2FuZ3J0JywgWzg3MzVdXSwgWydhbmdydHZiJywgWzg4OTRdXSwgWydhbmdydHZiZCcsIFsxMDY1M11dLCBbJ2FuZ3NwaCcsIFs4NzM4XV0sIFsnYW5nc3QnLCBbMTk3XV0sIFsnYW5nemFycicsIFs5MDg0XV0sIFsnQW9nb24nLCBbMjYwXV0sIFsnYW9nb24nLCBbMjYxXV0sIFsnQW9wZicsIFsxMjAxMjBdXSwgWydhb3BmJywgWzEyMDE0Nl1dLCBbJ2FwYWNpcicsIFsxMDg2M11dLCBbJ2FwJywgWzg3NzZdXSwgWydhcEUnLCBbMTA4NjRdXSwgWydhcGUnLCBbODc3OF1dLCBbJ2FwaWQnLCBbODc3OV1dLCBbJ2Fwb3MnLCBbMzldXSwgWydBcHBseUZ1bmN0aW9uJywgWzgyODldXSwgWydhcHByb3gnLCBbODc3Nl1dLCBbJ2FwcHJveGVxJywgWzg3NzhdXSwgWydBcmluZycsIFsxOTddXSwgWydhcmluZycsIFsyMjldXSwgWydBc2NyJywgWzExOTk2NF1dLCBbJ2FzY3InLCBbMTE5OTkwXV0sIFsnQXNzaWduJywgWzg3ODhdXSwgWydhc3QnLCBbNDJdXSwgWydhc3ltcCcsIFs4Nzc2XV0sIFsnYXN5bXBlcScsIFs4NzgxXV0sIFsnQXRpbGRlJywgWzE5NV1dLCBbJ2F0aWxkZScsIFsyMjddXSwgWydBdW1sJywgWzE5Nl1dLCBbJ2F1bWwnLCBbMjI4XV0sIFsnYXdjb25pbnQnLCBbODc1NV1dLCBbJ2F3aW50JywgWzEwNzY5XV0sIFsnYmFja2NvbmcnLCBbODc4MF1dLCBbJ2JhY2tlcHNpbG9uJywgWzEwMTRdXSwgWydiYWNrcHJpbWUnLCBbODI0NV1dLCBbJ2JhY2tzaW0nLCBbODc2NV1dLCBbJ2JhY2tzaW1lcScsIFs4OTA5XV0sIFsnQmFja3NsYXNoJywgWzg3MjZdXSwgWydCYXJ2JywgWzEwOTgzXV0sIFsnYmFydmVlJywgWzg4OTNdXSwgWydiYXJ3ZWQnLCBbODk2NV1dLCBbJ0JhcndlZCcsIFs4OTY2XV0sIFsnYmFyd2VkZ2UnLCBbODk2NV1dLCBbJ2JicmsnLCBbOTE0MV1dLCBbJ2Jicmt0YnJrJywgWzkxNDJdXSwgWydiY29uZycsIFs4NzgwXV0sIFsnQmN5JywgWzEwNDFdXSwgWydiY3knLCBbMTA3M11dLCBbJ2JkcXVvJywgWzgyMjJdXSwgWydiZWNhdXMnLCBbODc1N11dLCBbJ2JlY2F1c2UnLCBbODc1N11dLCBbJ0JlY2F1c2UnLCBbODc1N11dLCBbJ2JlbXB0eXYnLCBbMTA2NzJdXSwgWydiZXBzaScsIFsxMDE0XV0sIFsnYmVybm91JywgWzg0OTJdXSwgWydCZXJub3VsbGlzJywgWzg0OTJdXSwgWydCZXRhJywgWzkxNF1dLCBbJ2JldGEnLCBbOTQ2XV0sIFsnYmV0aCcsIFs4NTAyXV0sIFsnYmV0d2VlbicsIFs4ODEyXV0sIFsnQmZyJywgWzEyMDA2OV1dLCBbJ2JmcicsIFsxMjAwOTVdXSwgWydiaWdjYXAnLCBbODg5OF1dLCBbJ2JpZ2NpcmMnLCBbOTcxMV1dLCBbJ2JpZ2N1cCcsIFs4ODk5XV0sIFsnYmlnb2RvdCcsIFsxMDc1Ml1dLCBbJ2JpZ29wbHVzJywgWzEwNzUzXV0sIFsnYmlnb3RpbWVzJywgWzEwNzU0XV0sIFsnYmlnc3FjdXAnLCBbMTA3NThdXSwgWydiaWdzdGFyJywgWzk3MzNdXSwgWydiaWd0cmlhbmdsZWRvd24nLCBbOTY2MV1dLCBbJ2JpZ3RyaWFuZ2xldXAnLCBbOTY1MV1dLCBbJ2JpZ3VwbHVzJywgWzEwNzU2XV0sIFsnYmlndmVlJywgWzg4OTddXSwgWydiaWd3ZWRnZScsIFs4ODk2XV0sIFsnYmthcm93JywgWzEwNTA5XV0sIFsnYmxhY2tsb3plbmdlJywgWzEwNzMxXV0sIFsnYmxhY2tzcXVhcmUnLCBbOTY0Ml1dLCBbJ2JsYWNrdHJpYW5nbGUnLCBbOTY1Ml1dLCBbJ2JsYWNrdHJpYW5nbGVkb3duJywgWzk2NjJdXSwgWydibGFja3RyaWFuZ2xlbGVmdCcsIFs5NjY2XV0sIFsnYmxhY2t0cmlhbmdsZXJpZ2h0JywgWzk2NTZdXSwgWydibGFuaycsIFs5MjUxXV0sIFsnYmxrMTInLCBbOTYxOF1dLCBbJ2JsazE0JywgWzk2MTddXSwgWydibGszNCcsIFs5NjE5XV0sIFsnYmxvY2snLCBbOTYwOF1dLCBbJ2JuZScsIFs2MSwgODQyMV1dLCBbJ2JuZXF1aXYnLCBbODgwMSwgODQyMV1dLCBbJ2JOb3QnLCBbMTA5ODldXSwgWydibm90JywgWzg5NzZdXSwgWydCb3BmJywgWzEyMDEyMV1dLCBbJ2JvcGYnLCBbMTIwMTQ3XV0sIFsnYm90JywgWzg4NjldXSwgWydib3R0b20nLCBbODg2OV1dLCBbJ2Jvd3RpZScsIFs4OTA0XV0sIFsnYm94Ym94JywgWzEwNjk3XV0sIFsnYm94ZGwnLCBbOTQ4OF1dLCBbJ2JveGRMJywgWzk1NTddXSwgWydib3hEbCcsIFs5NTU4XV0sIFsnYm94REwnLCBbOTU1OV1dLCBbJ2JveGRyJywgWzk0ODRdXSwgWydib3hkUicsIFs5NTU0XV0sIFsnYm94RHInLCBbOTU1NV1dLCBbJ2JveERSJywgWzk1NTZdXSwgWydib3hoJywgWzk0NzJdXSwgWydib3hIJywgWzk1NTJdXSwgWydib3hoZCcsIFs5NTE2XV0sIFsnYm94SGQnLCBbOTU3Ml1dLCBbJ2JveGhEJywgWzk1NzNdXSwgWydib3hIRCcsIFs5NTc0XV0sIFsnYm94aHUnLCBbOTUyNF1dLCBbJ2JveEh1JywgWzk1NzVdXSwgWydib3hoVScsIFs5NTc2XV0sIFsnYm94SFUnLCBbOTU3N11dLCBbJ2JveG1pbnVzJywgWzg4NjNdXSwgWydib3hwbHVzJywgWzg4NjJdXSwgWydib3h0aW1lcycsIFs4ODY0XV0sIFsnYm94dWwnLCBbOTQ5Nl1dLCBbJ2JveHVMJywgWzk1NjNdXSwgWydib3hVbCcsIFs5NTY0XV0sIFsnYm94VUwnLCBbOTU2NV1dLCBbJ2JveHVyJywgWzk0OTJdXSwgWydib3h1UicsIFs5NTYwXV0sIFsnYm94VXInLCBbOTU2MV1dLCBbJ2JveFVSJywgWzk1NjJdXSwgWydib3h2JywgWzk0NzRdXSwgWydib3hWJywgWzk1NTNdXSwgWydib3h2aCcsIFs5NTMyXV0sIFsnYm94dkgnLCBbOTU3OF1dLCBbJ2JveFZoJywgWzk1NzldXSwgWydib3hWSCcsIFs5NTgwXV0sIFsnYm94dmwnLCBbOTUwOF1dLCBbJ2JveHZMJywgWzk1NjldXSwgWydib3hWbCcsIFs5NTcwXV0sIFsnYm94VkwnLCBbOTU3MV1dLCBbJ2JveHZyJywgWzk1MDBdXSwgWydib3h2UicsIFs5NTY2XV0sIFsnYm94VnInLCBbOTU2N11dLCBbJ2JveFZSJywgWzk1NjhdXSwgWydicHJpbWUnLCBbODI0NV1dLCBbJ2JyZXZlJywgWzcyOF1dLCBbJ0JyZXZlJywgWzcyOF1dLCBbJ2JydmJhcicsIFsxNjZdXSwgWydic2NyJywgWzExOTk5MV1dLCBbJ0JzY3InLCBbODQ5Ml1dLCBbJ2JzZW1pJywgWzgyNzFdXSwgWydic2ltJywgWzg3NjVdXSwgWydic2ltZScsIFs4OTA5XV0sIFsnYnNvbGInLCBbMTA2OTNdXSwgWydic29sJywgWzkyXV0sIFsnYnNvbGhzdWInLCBbMTAxODRdXSwgWydidWxsJywgWzgyMjZdXSwgWydidWxsZXQnLCBbODIyNl1dLCBbJ2J1bXAnLCBbODc4Ml1dLCBbJ2J1bXBFJywgWzEwOTI2XV0sIFsnYnVtcGUnLCBbODc4M11dLCBbJ0J1bXBlcScsIFs4NzgyXV0sIFsnYnVtcGVxJywgWzg3ODNdXSwgWydDYWN1dGUnLCBbMjYyXV0sIFsnY2FjdXRlJywgWzI2M11dLCBbJ2NhcGFuZCcsIFsxMDgyMF1dLCBbJ2NhcGJyY3VwJywgWzEwODI1XV0sIFsnY2FwY2FwJywgWzEwODI3XV0sIFsnY2FwJywgWzg3NDVdXSwgWydDYXAnLCBbODkxNF1dLCBbJ2NhcGN1cCcsIFsxMDgyM11dLCBbJ2NhcGRvdCcsIFsxMDgxNl1dLCBbJ0NhcGl0YWxEaWZmZXJlbnRpYWxEJywgWzg1MTddXSwgWydjYXBzJywgWzg3NDUsIDY1MDI0XV0sIFsnY2FyZXQnLCBbODI1N11dLCBbJ2Nhcm9uJywgWzcxMV1dLCBbJ0NheWxleXMnLCBbODQ5M11dLCBbJ2NjYXBzJywgWzEwODI5XV0sIFsnQ2Nhcm9uJywgWzI2OF1dLCBbJ2NjYXJvbicsIFsyNjldXSwgWydDY2VkaWwnLCBbMTk5XV0sIFsnY2NlZGlsJywgWzIzMV1dLCBbJ0NjaXJjJywgWzI2NF1dLCBbJ2NjaXJjJywgWzI2NV1dLCBbJ0Njb25pbnQnLCBbODc1Ml1dLCBbJ2NjdXBzJywgWzEwODI4XV0sIFsnY2N1cHNzbScsIFsxMDgzMl1dLCBbJ0Nkb3QnLCBbMjY2XV0sIFsnY2RvdCcsIFsyNjddXSwgWydjZWRpbCcsIFsxODRdXSwgWydDZWRpbGxhJywgWzE4NF1dLCBbJ2NlbXB0eXYnLCBbMTA2NzRdXSwgWydjZW50JywgWzE2Ml1dLCBbJ2NlbnRlcmRvdCcsIFsxODNdXSwgWydDZW50ZXJEb3QnLCBbMTgzXV0sIFsnY2ZyJywgWzEyMDA5Nl1dLCBbJ0NmcicsIFs4NDkzXV0sIFsnQ0hjeScsIFsxMDYzXV0sIFsnY2hjeScsIFsxMDk1XV0sIFsnY2hlY2snLCBbMTAwMDNdXSwgWydjaGVja21hcmsnLCBbMTAwMDNdXSwgWydDaGknLCBbOTM1XV0sIFsnY2hpJywgWzk2N11dLCBbJ2NpcmMnLCBbNzEwXV0sIFsnY2lyY2VxJywgWzg3OTFdXSwgWydjaXJjbGVhcnJvd2xlZnQnLCBbODYzNF1dLCBbJ2NpcmNsZWFycm93cmlnaHQnLCBbODYzNV1dLCBbJ2NpcmNsZWRhc3QnLCBbODg1OV1dLCBbJ2NpcmNsZWRjaXJjJywgWzg4NThdXSwgWydjaXJjbGVkZGFzaCcsIFs4ODYxXV0sIFsnQ2lyY2xlRG90JywgWzg4NTddXSwgWydjaXJjbGVkUicsIFsxNzRdXSwgWydjaXJjbGVkUycsIFs5NDE2XV0sIFsnQ2lyY2xlTWludXMnLCBbODg1NF1dLCBbJ0NpcmNsZVBsdXMnLCBbODg1M11dLCBbJ0NpcmNsZVRpbWVzJywgWzg4NTVdXSwgWydjaXInLCBbOTY3NV1dLCBbJ2NpckUnLCBbMTA2OTFdXSwgWydjaXJlJywgWzg3OTFdXSwgWydjaXJmbmludCcsIFsxMDc2OF1dLCBbJ2Npcm1pZCcsIFsxMDk5MV1dLCBbJ2NpcnNjaXInLCBbMTA2OTBdXSwgWydDbG9ja3dpc2VDb250b3VySW50ZWdyYWwnLCBbODc1NF1dLCBbJ2NsdWJzJywgWzk4MjddXSwgWydjbHVic3VpdCcsIFs5ODI3XV0sIFsnY29sb24nLCBbNThdXSwgWydDb2xvbicsIFs4NzU5XV0sIFsnQ29sb25lJywgWzEwODY4XV0sIFsnY29sb25lJywgWzg3ODhdXSwgWydjb2xvbmVxJywgWzg3ODhdXSwgWydjb21tYScsIFs0NF1dLCBbJ2NvbW1hdCcsIFs2NF1dLCBbJ2NvbXAnLCBbODcwNV1dLCBbJ2NvbXBmbicsIFs4NzI4XV0sIFsnY29tcGxlbWVudCcsIFs4NzA1XV0sIFsnY29tcGxleGVzJywgWzg0NTBdXSwgWydjb25nJywgWzg3NzNdXSwgWydjb25nZG90JywgWzEwODYxXV0sIFsnQ29uZ3J1ZW50JywgWzg4MDFdXSwgWydjb25pbnQnLCBbODc1MF1dLCBbJ0NvbmludCcsIFs4NzUxXV0sIFsnQ29udG91ckludGVncmFsJywgWzg3NTBdXSwgWydjb3BmJywgWzEyMDE0OF1dLCBbJ0NvcGYnLCBbODQ1MF1dLCBbJ2NvcHJvZCcsIFs4NzIwXV0sIFsnQ29wcm9kdWN0JywgWzg3MjBdXSwgWydjb3B5JywgWzE2OV1dLCBbJ0NPUFknLCBbMTY5XV0sIFsnY29weXNyJywgWzg0NzFdXSwgWydDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsJywgWzg3NTVdXSwgWydjcmFycicsIFs4NjI5XV0sIFsnY3Jvc3MnLCBbMTAwMDddXSwgWydDcm9zcycsIFsxMDc5OV1dLCBbJ0NzY3InLCBbMTE5OTY2XV0sIFsnY3NjcicsIFsxMTk5OTJdXSwgWydjc3ViJywgWzEwOTU5XV0sIFsnY3N1YmUnLCBbMTA5NjFdXSwgWydjc3VwJywgWzEwOTYwXV0sIFsnY3N1cGUnLCBbMTA5NjJdXSwgWydjdGRvdCcsIFs4OTQzXV0sIFsnY3VkYXJybCcsIFsxMDU1Ml1dLCBbJ2N1ZGFycnInLCBbMTA1NDldXSwgWydjdWVwcicsIFs4OTI2XV0sIFsnY3Vlc2MnLCBbODkyN11dLCBbJ2N1bGFycicsIFs4NjMwXV0sIFsnY3VsYXJycCcsIFsxMDU1N11dLCBbJ2N1cGJyY2FwJywgWzEwODI0XV0sIFsnY3VwY2FwJywgWzEwODIyXV0sIFsnQ3VwQ2FwJywgWzg3ODFdXSwgWydjdXAnLCBbODc0Nl1dLCBbJ0N1cCcsIFs4OTE1XV0sIFsnY3VwY3VwJywgWzEwODI2XV0sIFsnY3VwZG90JywgWzg4NDVdXSwgWydjdXBvcicsIFsxMDgyMV1dLCBbJ2N1cHMnLCBbODc0NiwgNjUwMjRdXSwgWydjdXJhcnInLCBbODYzMV1dLCBbJ2N1cmFycm0nLCBbMTA1NTZdXSwgWydjdXJseWVxcHJlYycsIFs4OTI2XV0sIFsnY3VybHllcXN1Y2MnLCBbODkyN11dLCBbJ2N1cmx5dmVlJywgWzg5MTBdXSwgWydjdXJseXdlZGdlJywgWzg5MTFdXSwgWydjdXJyZW4nLCBbMTY0XV0sIFsnY3VydmVhcnJvd2xlZnQnLCBbODYzMF1dLCBbJ2N1cnZlYXJyb3dyaWdodCcsIFs4NjMxXV0sIFsnY3V2ZWUnLCBbODkxMF1dLCBbJ2N1d2VkJywgWzg5MTFdXSwgWydjd2NvbmludCcsIFs4NzU0XV0sIFsnY3dpbnQnLCBbODc1M11dLCBbJ2N5bGN0eScsIFs5MDA1XV0sIFsnZGFnZ2VyJywgWzgyMjRdXSwgWydEYWdnZXInLCBbODIyNV1dLCBbJ2RhbGV0aCcsIFs4NTA0XV0sIFsnZGFycicsIFs4NTk1XV0sIFsnRGFycicsIFs4NjA5XV0sIFsnZEFycicsIFs4NjU5XV0sIFsnZGFzaCcsIFs4MjA4XV0sIFsnRGFzaHYnLCBbMTA5ODBdXSwgWydkYXNodicsIFs4ODY3XV0sIFsnZGJrYXJvdycsIFsxMDUxMV1dLCBbJ2RibGFjJywgWzczM11dLCBbJ0RjYXJvbicsIFsyNzBdXSwgWydkY2Fyb24nLCBbMjcxXV0sIFsnRGN5JywgWzEwNDRdXSwgWydkY3knLCBbMTA3Nl1dLCBbJ2RkYWdnZXInLCBbODIyNV1dLCBbJ2RkYXJyJywgWzg2NTBdXSwgWydERCcsIFs4NTE3XV0sIFsnZGQnLCBbODUxOF1dLCBbJ0REb3RyYWhkJywgWzEwNTEzXV0sIFsnZGRvdHNlcScsIFsxMDg3MV1dLCBbJ2RlZycsIFsxNzZdXSwgWydEZWwnLCBbODcxMV1dLCBbJ0RlbHRhJywgWzkxNl1dLCBbJ2RlbHRhJywgWzk0OF1dLCBbJ2RlbXB0eXYnLCBbMTA2NzNdXSwgWydkZmlzaHQnLCBbMTA2MjNdXSwgWydEZnInLCBbMTIwMDcxXV0sIFsnZGZyJywgWzEyMDA5N11dLCBbJ2RIYXInLCBbMTA1OTddXSwgWydkaGFybCcsIFs4NjQzXV0sIFsnZGhhcnInLCBbODY0Ml1dLCBbJ0RpYWNyaXRpY2FsQWN1dGUnLCBbMTgwXV0sIFsnRGlhY3JpdGljYWxEb3QnLCBbNzI5XV0sIFsnRGlhY3JpdGljYWxEb3VibGVBY3V0ZScsIFs3MzNdXSwgWydEaWFjcml0aWNhbEdyYXZlJywgWzk2XV0sIFsnRGlhY3JpdGljYWxUaWxkZScsIFs3MzJdXSwgWydkaWFtJywgWzg5MDBdXSwgWydkaWFtb25kJywgWzg5MDBdXSwgWydEaWFtb25kJywgWzg5MDBdXSwgWydkaWFtb25kc3VpdCcsIFs5ODMwXV0sIFsnZGlhbXMnLCBbOTgzMF1dLCBbJ2RpZScsIFsxNjhdXSwgWydEaWZmZXJlbnRpYWxEJywgWzg1MThdXSwgWydkaWdhbW1hJywgWzk4OV1dLCBbJ2Rpc2luJywgWzg5NDZdXSwgWydkaXYnLCBbMjQ3XV0sIFsnZGl2aWRlJywgWzI0N11dLCBbJ2RpdmlkZW9udGltZXMnLCBbODkwM11dLCBbJ2Rpdm9ueCcsIFs4OTAzXV0sIFsnREpjeScsIFsxMDI2XV0sIFsnZGpjeScsIFsxMTA2XV0sIFsnZGxjb3JuJywgWzg5OTBdXSwgWydkbGNyb3AnLCBbODk3M11dLCBbJ2RvbGxhcicsIFszNl1dLCBbJ0RvcGYnLCBbMTIwMTIzXV0sIFsnZG9wZicsIFsxMjAxNDldXSwgWydEb3QnLCBbMTY4XV0sIFsnZG90JywgWzcyOV1dLCBbJ0RvdERvdCcsIFs4NDEyXV0sIFsnZG90ZXEnLCBbODc4NF1dLCBbJ2RvdGVxZG90JywgWzg3ODVdXSwgWydEb3RFcXVhbCcsIFs4Nzg0XV0sIFsnZG90bWludXMnLCBbODc2MF1dLCBbJ2RvdHBsdXMnLCBbODcyNF1dLCBbJ2RvdHNxdWFyZScsIFs4ODY1XV0sIFsnZG91YmxlYmFyd2VkZ2UnLCBbODk2Nl1dLCBbJ0RvdWJsZUNvbnRvdXJJbnRlZ3JhbCcsIFs4NzUxXV0sIFsnRG91YmxlRG90JywgWzE2OF1dLCBbJ0RvdWJsZURvd25BcnJvdycsIFs4NjU5XV0sIFsnRG91YmxlTGVmdEFycm93JywgWzg2NTZdXSwgWydEb3VibGVMZWZ0UmlnaHRBcnJvdycsIFs4NjYwXV0sIFsnRG91YmxlTGVmdFRlZScsIFsxMDk4MF1dLCBbJ0RvdWJsZUxvbmdMZWZ0QXJyb3cnLCBbMTAyMzJdXSwgWydEb3VibGVMb25nTGVmdFJpZ2h0QXJyb3cnLCBbMTAyMzRdXSwgWydEb3VibGVMb25nUmlnaHRBcnJvdycsIFsxMDIzM11dLCBbJ0RvdWJsZVJpZ2h0QXJyb3cnLCBbODY1OF1dLCBbJ0RvdWJsZVJpZ2h0VGVlJywgWzg4NzJdXSwgWydEb3VibGVVcEFycm93JywgWzg2NTddXSwgWydEb3VibGVVcERvd25BcnJvdycsIFs4NjYxXV0sIFsnRG91YmxlVmVydGljYWxCYXInLCBbODc0MV1dLCBbJ0Rvd25BcnJvd0JhcicsIFsxMDUxNV1dLCBbJ2Rvd25hcnJvdycsIFs4NTk1XV0sIFsnRG93bkFycm93JywgWzg1OTVdXSwgWydEb3duYXJyb3cnLCBbODY1OV1dLCBbJ0Rvd25BcnJvd1VwQXJyb3cnLCBbODY5M11dLCBbJ0Rvd25CcmV2ZScsIFs3ODVdXSwgWydkb3duZG93bmFycm93cycsIFs4NjUwXV0sIFsnZG93bmhhcnBvb25sZWZ0JywgWzg2NDNdXSwgWydkb3duaGFycG9vbnJpZ2h0JywgWzg2NDJdXSwgWydEb3duTGVmdFJpZ2h0VmVjdG9yJywgWzEwNTc2XV0sIFsnRG93bkxlZnRUZWVWZWN0b3InLCBbMTA1OTBdXSwgWydEb3duTGVmdFZlY3RvckJhcicsIFsxMDU4Ml1dLCBbJ0Rvd25MZWZ0VmVjdG9yJywgWzg2MzddXSwgWydEb3duUmlnaHRUZWVWZWN0b3InLCBbMTA1OTFdXSwgWydEb3duUmlnaHRWZWN0b3JCYXInLCBbMTA1ODNdXSwgWydEb3duUmlnaHRWZWN0b3InLCBbODY0MV1dLCBbJ0Rvd25UZWVBcnJvdycsIFs4NjE1XV0sIFsnRG93blRlZScsIFs4ODY4XV0sIFsnZHJia2Fyb3cnLCBbMTA1MTJdXSwgWydkcmNvcm4nLCBbODk5MV1dLCBbJ2RyY3JvcCcsIFs4OTcyXV0sIFsnRHNjcicsIFsxMTk5NjddXSwgWydkc2NyJywgWzExOTk5M11dLCBbJ0RTY3knLCBbMTAyOV1dLCBbJ2RzY3knLCBbMTEwOV1dLCBbJ2Rzb2wnLCBbMTA3NDJdXSwgWydEc3Ryb2snLCBbMjcyXV0sIFsnZHN0cm9rJywgWzI3M11dLCBbJ2R0ZG90JywgWzg5NDVdXSwgWydkdHJpJywgWzk2NjNdXSwgWydkdHJpZicsIFs5NjYyXV0sIFsnZHVhcnInLCBbODY5M11dLCBbJ2R1aGFyJywgWzEwNjA3XV0sIFsnZHdhbmdsZScsIFsxMDY2Ml1dLCBbJ0RaY3knLCBbMTAzOV1dLCBbJ2R6Y3knLCBbMTExOV1dLCBbJ2R6aWdyYXJyJywgWzEwMjM5XV0sIFsnRWFjdXRlJywgWzIwMV1dLCBbJ2VhY3V0ZScsIFsyMzNdXSwgWydlYXN0ZXInLCBbMTA4NjJdXSwgWydFY2Fyb24nLCBbMjgyXV0sIFsnZWNhcm9uJywgWzI4M11dLCBbJ0VjaXJjJywgWzIwMl1dLCBbJ2VjaXJjJywgWzIzNF1dLCBbJ2VjaXInLCBbODc5MF1dLCBbJ2Vjb2xvbicsIFs4Nzg5XV0sIFsnRWN5JywgWzEwNjldXSwgWydlY3knLCBbMTEwMV1dLCBbJ2VERG90JywgWzEwODcxXV0sIFsnRWRvdCcsIFsyNzhdXSwgWydlZG90JywgWzI3OV1dLCBbJ2VEb3QnLCBbODc4NV1dLCBbJ2VlJywgWzg1MTldXSwgWydlZkRvdCcsIFs4Nzg2XV0sIFsnRWZyJywgWzEyMDA3Ml1dLCBbJ2VmcicsIFsxMjAwOThdXSwgWydlZycsIFsxMDkwNl1dLCBbJ0VncmF2ZScsIFsyMDBdXSwgWydlZ3JhdmUnLCBbMjMyXV0sIFsnZWdzJywgWzEwOTAyXV0sIFsnZWdzZG90JywgWzEwOTA0XV0sIFsnZWwnLCBbMTA5MDVdXSwgWydFbGVtZW50JywgWzg3MTJdXSwgWydlbGludGVycycsIFs5MTkxXV0sIFsnZWxsJywgWzg0NjddXSwgWydlbHMnLCBbMTA5MDFdXSwgWydlbHNkb3QnLCBbMTA5MDNdXSwgWydFbWFjcicsIFsyNzRdXSwgWydlbWFjcicsIFsyNzVdXSwgWydlbXB0eScsIFs4NzA5XV0sIFsnZW1wdHlzZXQnLCBbODcwOV1dLCBbJ0VtcHR5U21hbGxTcXVhcmUnLCBbOTcyM11dLCBbJ2VtcHR5dicsIFs4NzA5XV0sIFsnRW1wdHlWZXJ5U21hbGxTcXVhcmUnLCBbOTY0M11dLCBbJ2Vtc3AxMycsIFs4MTk2XV0sIFsnZW1zcDE0JywgWzgxOTddXSwgWydlbXNwJywgWzgxOTVdXSwgWydFTkcnLCBbMzMwXV0sIFsnZW5nJywgWzMzMV1dLCBbJ2Vuc3AnLCBbODE5NF1dLCBbJ0VvZ29uJywgWzI4MF1dLCBbJ2VvZ29uJywgWzI4MV1dLCBbJ0VvcGYnLCBbMTIwMTI0XV0sIFsnZW9wZicsIFsxMjAxNTBdXSwgWydlcGFyJywgWzg5MTddXSwgWydlcGFyc2wnLCBbMTA3MjNdXSwgWydlcGx1cycsIFsxMDg2NV1dLCBbJ2Vwc2knLCBbOTQ5XV0sIFsnRXBzaWxvbicsIFs5MTddXSwgWydlcHNpbG9uJywgWzk0OV1dLCBbJ2Vwc2l2JywgWzEwMTNdXSwgWydlcWNpcmMnLCBbODc5MF1dLCBbJ2VxY29sb24nLCBbODc4OV1dLCBbJ2Vxc2ltJywgWzg3NzBdXSwgWydlcXNsYW50Z3RyJywgWzEwOTAyXV0sIFsnZXFzbGFudGxlc3MnLCBbMTA5MDFdXSwgWydFcXVhbCcsIFsxMDg2OV1dLCBbJ2VxdWFscycsIFs2MV1dLCBbJ0VxdWFsVGlsZGUnLCBbODc3MF1dLCBbJ2VxdWVzdCcsIFs4Nzk5XV0sIFsnRXF1aWxpYnJpdW0nLCBbODY1Ml1dLCBbJ2VxdWl2JywgWzg4MDFdXSwgWydlcXVpdkREJywgWzEwODcyXV0sIFsnZXF2cGFyc2wnLCBbMTA3MjVdXSwgWydlcmFycicsIFsxMDYwOV1dLCBbJ2VyRG90JywgWzg3ODddXSwgWydlc2NyJywgWzg0OTVdXSwgWydFc2NyJywgWzg0OTZdXSwgWydlc2RvdCcsIFs4Nzg0XV0sIFsnRXNpbScsIFsxMDg2N11dLCBbJ2VzaW0nLCBbODc3MF1dLCBbJ0V0YScsIFs5MTldXSwgWydldGEnLCBbOTUxXV0sIFsnRVRIJywgWzIwOF1dLCBbJ2V0aCcsIFsyNDBdXSwgWydFdW1sJywgWzIwM11dLCBbJ2V1bWwnLCBbMjM1XV0sIFsnZXVybycsIFs4MzY0XV0sIFsnZXhjbCcsIFszM11dLCBbJ2V4aXN0JywgWzg3MDddXSwgWydFeGlzdHMnLCBbODcwN11dLCBbJ2V4cGVjdGF0aW9uJywgWzg0OTZdXSwgWydleHBvbmVudGlhbGUnLCBbODUxOV1dLCBbJ0V4cG9uZW50aWFsRScsIFs4NTE5XV0sIFsnZmFsbGluZ2RvdHNlcScsIFs4Nzg2XV0sIFsnRmN5JywgWzEwNjBdXSwgWydmY3knLCBbMTA5Ml1dLCBbJ2ZlbWFsZScsIFs5NzkyXV0sIFsnZmZpbGlnJywgWzY0MjU5XV0sIFsnZmZsaWcnLCBbNjQyNTZdXSwgWydmZmxsaWcnLCBbNjQyNjBdXSwgWydGZnInLCBbMTIwMDczXV0sIFsnZmZyJywgWzEyMDA5OV1dLCBbJ2ZpbGlnJywgWzY0MjU3XV0sIFsnRmlsbGVkU21hbGxTcXVhcmUnLCBbOTcyNF1dLCBbJ0ZpbGxlZFZlcnlTbWFsbFNxdWFyZScsIFs5NjQyXV0sIFsnZmpsaWcnLCBbMTAyLCAxMDZdXSwgWydmbGF0JywgWzk4MzddXSwgWydmbGxpZycsIFs2NDI1OF1dLCBbJ2ZsdG5zJywgWzk2NDldXSwgWydmbm9mJywgWzQwMl1dLCBbJ0ZvcGYnLCBbMTIwMTI1XV0sIFsnZm9wZicsIFsxMjAxNTFdXSwgWydmb3JhbGwnLCBbODcwNF1dLCBbJ0ZvckFsbCcsIFs4NzA0XV0sIFsnZm9yaycsIFs4OTE2XV0sIFsnZm9ya3YnLCBbMTA5NjldXSwgWydGb3VyaWVydHJmJywgWzg0OTddXSwgWydmcGFydGludCcsIFsxMDc2NV1dLCBbJ2ZyYWMxMicsIFsxODldXSwgWydmcmFjMTMnLCBbODUzMV1dLCBbJ2ZyYWMxNCcsIFsxODhdXSwgWydmcmFjMTUnLCBbODUzM11dLCBbJ2ZyYWMxNicsIFs4NTM3XV0sIFsnZnJhYzE4JywgWzg1MzldXSwgWydmcmFjMjMnLCBbODUzMl1dLCBbJ2ZyYWMyNScsIFs4NTM0XV0sIFsnZnJhYzM0JywgWzE5MF1dLCBbJ2ZyYWMzNScsIFs4NTM1XV0sIFsnZnJhYzM4JywgWzg1NDBdXSwgWydmcmFjNDUnLCBbODUzNl1dLCBbJ2ZyYWM1NicsIFs4NTM4XV0sIFsnZnJhYzU4JywgWzg1NDFdXSwgWydmcmFjNzgnLCBbODU0Ml1dLCBbJ2ZyYXNsJywgWzgyNjBdXSwgWydmcm93bicsIFs4OTk0XV0sIFsnZnNjcicsIFsxMTk5OTVdXSwgWydGc2NyJywgWzg0OTddXSwgWydnYWN1dGUnLCBbNTAxXV0sIFsnR2FtbWEnLCBbOTE1XV0sIFsnZ2FtbWEnLCBbOTQ3XV0sIFsnR2FtbWFkJywgWzk4OF1dLCBbJ2dhbW1hZCcsIFs5ODldXSwgWydnYXAnLCBbMTA4ODZdXSwgWydHYnJldmUnLCBbMjg2XV0sIFsnZ2JyZXZlJywgWzI4N11dLCBbJ0djZWRpbCcsIFsyOTBdXSwgWydHY2lyYycsIFsyODRdXSwgWydnY2lyYycsIFsyODVdXSwgWydHY3knLCBbMTA0M11dLCBbJ2djeScsIFsxMDc1XV0sIFsnR2RvdCcsIFsyODhdXSwgWydnZG90JywgWzI4OV1dLCBbJ2dlJywgWzg4MDVdXSwgWydnRScsIFs4ODA3XV0sIFsnZ0VsJywgWzEwODkyXV0sIFsnZ2VsJywgWzg5MjNdXSwgWydnZXEnLCBbODgwNV1dLCBbJ2dlcXEnLCBbODgwN11dLCBbJ2dlcXNsYW50JywgWzEwODc4XV0sIFsnZ2VzY2MnLCBbMTA5MjFdXSwgWydnZXMnLCBbMTA4NzhdXSwgWydnZXNkb3QnLCBbMTA4ODBdXSwgWydnZXNkb3RvJywgWzEwODgyXV0sIFsnZ2VzZG90b2wnLCBbMTA4ODRdXSwgWydnZXNsJywgWzg5MjMsIDY1MDI0XV0sIFsnZ2VzbGVzJywgWzEwOTAwXV0sIFsnR2ZyJywgWzEyMDA3NF1dLCBbJ2dmcicsIFsxMjAxMDBdXSwgWydnZycsIFs4ODExXV0sIFsnR2cnLCBbODkyMV1dLCBbJ2dnZycsIFs4OTIxXV0sIFsnZ2ltZWwnLCBbODUwM11dLCBbJ0dKY3knLCBbMTAyN11dLCBbJ2dqY3knLCBbMTEwN11dLCBbJ2dsYScsIFsxMDkxN11dLCBbJ2dsJywgWzg4MjNdXSwgWydnbEUnLCBbMTA4OThdXSwgWydnbGonLCBbMTA5MTZdXSwgWydnbmFwJywgWzEwODkwXV0sIFsnZ25hcHByb3gnLCBbMTA4OTBdXSwgWydnbmUnLCBbMTA4ODhdXSwgWydnbkUnLCBbODgwOV1dLCBbJ2duZXEnLCBbMTA4ODhdXSwgWydnbmVxcScsIFs4ODA5XV0sIFsnZ25zaW0nLCBbODkzNV1dLCBbJ0dvcGYnLCBbMTIwMTI2XV0sIFsnZ29wZicsIFsxMjAxNTJdXSwgWydncmF2ZScsIFs5Nl1dLCBbJ0dyZWF0ZXJFcXVhbCcsIFs4ODA1XV0sIFsnR3JlYXRlckVxdWFsTGVzcycsIFs4OTIzXV0sIFsnR3JlYXRlckZ1bGxFcXVhbCcsIFs4ODA3XV0sIFsnR3JlYXRlckdyZWF0ZXInLCBbMTA5MTRdXSwgWydHcmVhdGVyTGVzcycsIFs4ODIzXV0sIFsnR3JlYXRlclNsYW50RXF1YWwnLCBbMTA4NzhdXSwgWydHcmVhdGVyVGlsZGUnLCBbODgxOV1dLCBbJ0dzY3InLCBbMTE5OTcwXV0sIFsnZ3NjcicsIFs4NDU4XV0sIFsnZ3NpbScsIFs4ODE5XV0sIFsnZ3NpbWUnLCBbMTA4OTRdXSwgWydnc2ltbCcsIFsxMDg5Nl1dLCBbJ2d0Y2MnLCBbMTA5MTldXSwgWydndGNpcicsIFsxMDg3NF1dLCBbJ2d0JywgWzYyXV0sIFsnR1QnLCBbNjJdXSwgWydHdCcsIFs4ODExXV0sIFsnZ3Rkb3QnLCBbODkxOV1dLCBbJ2d0bFBhcicsIFsxMDY0NV1dLCBbJ2d0cXVlc3QnLCBbMTA4NzZdXSwgWydndHJhcHByb3gnLCBbMTA4ODZdXSwgWydndHJhcnInLCBbMTA2MTZdXSwgWydndHJkb3QnLCBbODkxOV1dLCBbJ2d0cmVxbGVzcycsIFs4OTIzXV0sIFsnZ3RyZXFxbGVzcycsIFsxMDg5Ml1dLCBbJ2d0cmxlc3MnLCBbODgyM11dLCBbJ2d0cnNpbScsIFs4ODE5XV0sIFsnZ3ZlcnRuZXFxJywgWzg4MDksIDY1MDI0XV0sIFsnZ3ZuRScsIFs4ODA5LCA2NTAyNF1dLCBbJ0hhY2VrJywgWzcxMV1dLCBbJ2hhaXJzcCcsIFs4MjAyXV0sIFsnaGFsZicsIFsxODldXSwgWydoYW1pbHQnLCBbODQ1OV1dLCBbJ0hBUkRjeScsIFsxMDY2XV0sIFsnaGFyZGN5JywgWzEwOThdXSwgWydoYXJyY2lyJywgWzEwNTY4XV0sIFsnaGFycicsIFs4NTk2XV0sIFsnaEFycicsIFs4NjYwXV0sIFsnaGFycncnLCBbODYyMV1dLCBbJ0hhdCcsIFs5NF1dLCBbJ2hiYXInLCBbODQ2M11dLCBbJ0hjaXJjJywgWzI5Ml1dLCBbJ2hjaXJjJywgWzI5M11dLCBbJ2hlYXJ0cycsIFs5ODI5XV0sIFsnaGVhcnRzdWl0JywgWzk4MjldXSwgWydoZWxsaXAnLCBbODIzMF1dLCBbJ2hlcmNvbicsIFs4ODg5XV0sIFsnaGZyJywgWzEyMDEwMV1dLCBbJ0hmcicsIFs4NDYwXV0sIFsnSGlsYmVydFNwYWNlJywgWzg0NTldXSwgWydoa3NlYXJvdycsIFsxMDUzM11dLCBbJ2hrc3dhcm93JywgWzEwNTM0XV0sIFsnaG9hcnInLCBbODcwM11dLCBbJ2hvbXRodCcsIFs4NzYzXV0sIFsnaG9va2xlZnRhcnJvdycsIFs4NjE3XV0sIFsnaG9va3JpZ2h0YXJyb3cnLCBbODYxOF1dLCBbJ2hvcGYnLCBbMTIwMTUzXV0sIFsnSG9wZicsIFs4NDYxXV0sIFsnaG9yYmFyJywgWzgyMTNdXSwgWydIb3Jpem9udGFsTGluZScsIFs5NDcyXV0sIFsnaHNjcicsIFsxMTk5OTddXSwgWydIc2NyJywgWzg0NTldXSwgWydoc2xhc2gnLCBbODQ2M11dLCBbJ0hzdHJvaycsIFsyOTRdXSwgWydoc3Ryb2snLCBbMjk1XV0sIFsnSHVtcERvd25IdW1wJywgWzg3ODJdXSwgWydIdW1wRXF1YWwnLCBbODc4M11dLCBbJ2h5YnVsbCcsIFs4MjU5XV0sIFsnaHlwaGVuJywgWzgyMDhdXSwgWydJYWN1dGUnLCBbMjA1XV0sIFsnaWFjdXRlJywgWzIzN11dLCBbJ2ljJywgWzgyOTFdXSwgWydJY2lyYycsIFsyMDZdXSwgWydpY2lyYycsIFsyMzhdXSwgWydJY3knLCBbMTA0OF1dLCBbJ2ljeScsIFsxMDgwXV0sIFsnSWRvdCcsIFszMDRdXSwgWydJRWN5JywgWzEwNDVdXSwgWydpZWN5JywgWzEwNzddXSwgWydpZXhjbCcsIFsxNjFdXSwgWydpZmYnLCBbODY2MF1dLCBbJ2lmcicsIFsxMjAxMDJdXSwgWydJZnInLCBbODQ2NV1dLCBbJ0lncmF2ZScsIFsyMDRdXSwgWydpZ3JhdmUnLCBbMjM2XV0sIFsnaWknLCBbODUyMF1dLCBbJ2lpaWludCcsIFsxMDc2NF1dLCBbJ2lpaW50JywgWzg3NDldXSwgWydpaW5maW4nLCBbMTA3MTZdXSwgWydpaW90YScsIFs4NDg5XV0sIFsnSUpsaWcnLCBbMzA2XV0sIFsnaWpsaWcnLCBbMzA3XV0sIFsnSW1hY3InLCBbMjk4XV0sIFsnaW1hY3InLCBbMjk5XV0sIFsnaW1hZ2UnLCBbODQ2NV1dLCBbJ0ltYWdpbmFyeUknLCBbODUyMF1dLCBbJ2ltYWdsaW5lJywgWzg0NjRdXSwgWydpbWFncGFydCcsIFs4NDY1XV0sIFsnaW1hdGgnLCBbMzA1XV0sIFsnSW0nLCBbODQ2NV1dLCBbJ2ltb2YnLCBbODg4N11dLCBbJ2ltcGVkJywgWzQzN11dLCBbJ0ltcGxpZXMnLCBbODY1OF1dLCBbJ2luY2FyZScsIFs4NDUzXV0sIFsnaW4nLCBbODcxMl1dLCBbJ2luZmluJywgWzg3MzRdXSwgWydpbmZpbnRpZScsIFsxMDcxN11dLCBbJ2lub2RvdCcsIFszMDVdXSwgWydpbnRjYWwnLCBbODg5MF1dLCBbJ2ludCcsIFs4NzQ3XV0sIFsnSW50JywgWzg3NDhdXSwgWydpbnRlZ2VycycsIFs4NDg0XV0sIFsnSW50ZWdyYWwnLCBbODc0N11dLCBbJ2ludGVyY2FsJywgWzg4OTBdXSwgWydJbnRlcnNlY3Rpb24nLCBbODg5OF1dLCBbJ2ludGxhcmhrJywgWzEwNzc1XV0sIFsnaW50cHJvZCcsIFsxMDgxMl1dLCBbJ0ludmlzaWJsZUNvbW1hJywgWzgyOTFdXSwgWydJbnZpc2libGVUaW1lcycsIFs4MjkwXV0sIFsnSU9jeScsIFsxMDI1XV0sIFsnaW9jeScsIFsxMTA1XV0sIFsnSW9nb24nLCBbMzAyXV0sIFsnaW9nb24nLCBbMzAzXV0sIFsnSW9wZicsIFsxMjAxMjhdXSwgWydpb3BmJywgWzEyMDE1NF1dLCBbJ0lvdGEnLCBbOTIxXV0sIFsnaW90YScsIFs5NTNdXSwgWydpcHJvZCcsIFsxMDgxMl1dLCBbJ2lxdWVzdCcsIFsxOTFdXSwgWydpc2NyJywgWzExOTk5OF1dLCBbJ0lzY3InLCBbODQ2NF1dLCBbJ2lzaW4nLCBbODcxMl1dLCBbJ2lzaW5kb3QnLCBbODk0OV1dLCBbJ2lzaW5FJywgWzg5NTNdXSwgWydpc2lucycsIFs4OTQ4XV0sIFsnaXNpbnN2JywgWzg5NDddXSwgWydpc2ludicsIFs4NzEyXV0sIFsnaXQnLCBbODI5MF1dLCBbJ0l0aWxkZScsIFsyOTZdXSwgWydpdGlsZGUnLCBbMjk3XV0sIFsnSXVrY3knLCBbMTAzMF1dLCBbJ2l1a2N5JywgWzExMTBdXSwgWydJdW1sJywgWzIwN11dLCBbJ2l1bWwnLCBbMjM5XV0sIFsnSmNpcmMnLCBbMzA4XV0sIFsnamNpcmMnLCBbMzA5XV0sIFsnSmN5JywgWzEwNDldXSwgWydqY3knLCBbMTA4MV1dLCBbJ0pmcicsIFsxMjAwNzddXSwgWydqZnInLCBbMTIwMTAzXV0sIFsnam1hdGgnLCBbNTY3XV0sIFsnSm9wZicsIFsxMjAxMjldXSwgWydqb3BmJywgWzEyMDE1NV1dLCBbJ0pzY3InLCBbMTE5OTczXV0sIFsnanNjcicsIFsxMTk5OTldXSwgWydKc2VyY3knLCBbMTAzMl1dLCBbJ2pzZXJjeScsIFsxMTEyXV0sIFsnSnVrY3knLCBbMTAyOF1dLCBbJ2p1a2N5JywgWzExMDhdXSwgWydLYXBwYScsIFs5MjJdXSwgWydrYXBwYScsIFs5NTRdXSwgWydrYXBwYXYnLCBbMTAwOF1dLCBbJ0tjZWRpbCcsIFszMTBdXSwgWydrY2VkaWwnLCBbMzExXV0sIFsnS2N5JywgWzEwNTBdXSwgWydrY3knLCBbMTA4Ml1dLCBbJ0tmcicsIFsxMjAwNzhdXSwgWydrZnInLCBbMTIwMTA0XV0sIFsna2dyZWVuJywgWzMxMl1dLCBbJ0tIY3knLCBbMTA2MV1dLCBbJ2toY3knLCBbMTA5M11dLCBbJ0tKY3knLCBbMTAzNl1dLCBbJ2tqY3knLCBbMTExNl1dLCBbJ0tvcGYnLCBbMTIwMTMwXV0sIFsna29wZicsIFsxMjAxNTZdXSwgWydLc2NyJywgWzExOTk3NF1dLCBbJ2tzY3InLCBbMTIwMDAwXV0sIFsnbEFhcnInLCBbODY2Nl1dLCBbJ0xhY3V0ZScsIFszMTNdXSwgWydsYWN1dGUnLCBbMzE0XV0sIFsnbGFlbXB0eXYnLCBbMTA2NzZdXSwgWydsYWdyYW4nLCBbODQ2Nl1dLCBbJ0xhbWJkYScsIFs5MjNdXSwgWydsYW1iZGEnLCBbOTU1XV0sIFsnbGFuZycsIFsxMDIxNl1dLCBbJ0xhbmcnLCBbMTAyMThdXSwgWydsYW5nZCcsIFsxMDY0MV1dLCBbJ2xhbmdsZScsIFsxMDIxNl1dLCBbJ2xhcCcsIFsxMDg4NV1dLCBbJ0xhcGxhY2V0cmYnLCBbODQ2Nl1dLCBbJ2xhcXVvJywgWzE3MV1dLCBbJ2xhcnJiJywgWzg2NzZdXSwgWydsYXJyYmZzJywgWzEwNTI3XV0sIFsnbGFycicsIFs4NTkyXV0sIFsnTGFycicsIFs4NjA2XV0sIFsnbEFycicsIFs4NjU2XV0sIFsnbGFycmZzJywgWzEwNTI1XV0sIFsnbGFycmhrJywgWzg2MTddXSwgWydsYXJybHAnLCBbODYxOV1dLCBbJ2xhcnJwbCcsIFsxMDU1M11dLCBbJ2xhcnJzaW0nLCBbMTA2MTFdXSwgWydsYXJydGwnLCBbODYxMF1dLCBbJ2xhdGFpbCcsIFsxMDUyMV1dLCBbJ2xBdGFpbCcsIFsxMDUyM11dLCBbJ2xhdCcsIFsxMDkyM11dLCBbJ2xhdGUnLCBbMTA5MjVdXSwgWydsYXRlcycsIFsxMDkyNSwgNjUwMjRdXSwgWydsYmFycicsIFsxMDUwOF1dLCBbJ2xCYXJyJywgWzEwNTEwXV0sIFsnbGJicmsnLCBbMTAwOThdXSwgWydsYnJhY2UnLCBbMTIzXV0sIFsnbGJyYWNrJywgWzkxXV0sIFsnbGJya2UnLCBbMTA2MzVdXSwgWydsYnJrc2xkJywgWzEwNjM5XV0sIFsnbGJya3NsdScsIFsxMDYzN11dLCBbJ0xjYXJvbicsIFszMTddXSwgWydsY2Fyb24nLCBbMzE4XV0sIFsnTGNlZGlsJywgWzMxNV1dLCBbJ2xjZWRpbCcsIFszMTZdXSwgWydsY2VpbCcsIFs4OTY4XV0sIFsnbGN1YicsIFsxMjNdXSwgWydMY3knLCBbMTA1MV1dLCBbJ2xjeScsIFsxMDgzXV0sIFsnbGRjYScsIFsxMDU1MF1dLCBbJ2xkcXVvJywgWzgyMjBdXSwgWydsZHF1b3InLCBbODIyMl1dLCBbJ2xkcmRoYXInLCBbMTA1OTldXSwgWydsZHJ1c2hhcicsIFsxMDU3MV1dLCBbJ2xkc2gnLCBbODYyNl1dLCBbJ2xlJywgWzg4MDRdXSwgWydsRScsIFs4ODA2XV0sIFsnTGVmdEFuZ2xlQnJhY2tldCcsIFsxMDIxNl1dLCBbJ0xlZnRBcnJvd0JhcicsIFs4Njc2XV0sIFsnbGVmdGFycm93JywgWzg1OTJdXSwgWydMZWZ0QXJyb3cnLCBbODU5Ml1dLCBbJ0xlZnRhcnJvdycsIFs4NjU2XV0sIFsnTGVmdEFycm93UmlnaHRBcnJvdycsIFs4NjQ2XV0sIFsnbGVmdGFycm93dGFpbCcsIFs4NjEwXV0sIFsnTGVmdENlaWxpbmcnLCBbODk2OF1dLCBbJ0xlZnREb3VibGVCcmFja2V0JywgWzEwMjE0XV0sIFsnTGVmdERvd25UZWVWZWN0b3InLCBbMTA1OTNdXSwgWydMZWZ0RG93blZlY3RvckJhcicsIFsxMDU4NV1dLCBbJ0xlZnREb3duVmVjdG9yJywgWzg2NDNdXSwgWydMZWZ0Rmxvb3InLCBbODk3MF1dLCBbJ2xlZnRoYXJwb29uZG93bicsIFs4NjM3XV0sIFsnbGVmdGhhcnBvb251cCcsIFs4NjM2XV0sIFsnbGVmdGxlZnRhcnJvd3MnLCBbODY0N11dLCBbJ2xlZnRyaWdodGFycm93JywgWzg1OTZdXSwgWydMZWZ0UmlnaHRBcnJvdycsIFs4NTk2XV0sIFsnTGVmdHJpZ2h0YXJyb3cnLCBbODY2MF1dLCBbJ2xlZnRyaWdodGFycm93cycsIFs4NjQ2XV0sIFsnbGVmdHJpZ2h0aGFycG9vbnMnLCBbODY1MV1dLCBbJ2xlZnRyaWdodHNxdWlnYXJyb3cnLCBbODYyMV1dLCBbJ0xlZnRSaWdodFZlY3RvcicsIFsxMDU3NF1dLCBbJ0xlZnRUZWVBcnJvdycsIFs4NjEyXV0sIFsnTGVmdFRlZScsIFs4ODY3XV0sIFsnTGVmdFRlZVZlY3RvcicsIFsxMDU4Nl1dLCBbJ2xlZnR0aHJlZXRpbWVzJywgWzg5MDddXSwgWydMZWZ0VHJpYW5nbGVCYXInLCBbMTA3MDNdXSwgWydMZWZ0VHJpYW5nbGUnLCBbODg4Ml1dLCBbJ0xlZnRUcmlhbmdsZUVxdWFsJywgWzg4ODRdXSwgWydMZWZ0VXBEb3duVmVjdG9yJywgWzEwNTc3XV0sIFsnTGVmdFVwVGVlVmVjdG9yJywgWzEwNTkyXV0sIFsnTGVmdFVwVmVjdG9yQmFyJywgWzEwNTg0XV0sIFsnTGVmdFVwVmVjdG9yJywgWzg2MzldXSwgWydMZWZ0VmVjdG9yQmFyJywgWzEwNTc4XV0sIFsnTGVmdFZlY3RvcicsIFs4NjM2XV0sIFsnbEVnJywgWzEwODkxXV0sIFsnbGVnJywgWzg5MjJdXSwgWydsZXEnLCBbODgwNF1dLCBbJ2xlcXEnLCBbODgwNl1dLCBbJ2xlcXNsYW50JywgWzEwODc3XV0sIFsnbGVzY2MnLCBbMTA5MjBdXSwgWydsZXMnLCBbMTA4NzddXSwgWydsZXNkb3QnLCBbMTA4NzldXSwgWydsZXNkb3RvJywgWzEwODgxXV0sIFsnbGVzZG90b3InLCBbMTA4ODNdXSwgWydsZXNnJywgWzg5MjIsIDY1MDI0XV0sIFsnbGVzZ2VzJywgWzEwODk5XV0sIFsnbGVzc2FwcHJveCcsIFsxMDg4NV1dLCBbJ2xlc3Nkb3QnLCBbODkxOF1dLCBbJ2xlc3NlcWd0cicsIFs4OTIyXV0sIFsnbGVzc2VxcWd0cicsIFsxMDg5MV1dLCBbJ0xlc3NFcXVhbEdyZWF0ZXInLCBbODkyMl1dLCBbJ0xlc3NGdWxsRXF1YWwnLCBbODgwNl1dLCBbJ0xlc3NHcmVhdGVyJywgWzg4MjJdXSwgWydsZXNzZ3RyJywgWzg4MjJdXSwgWydMZXNzTGVzcycsIFsxMDkxM11dLCBbJ2xlc3NzaW0nLCBbODgxOF1dLCBbJ0xlc3NTbGFudEVxdWFsJywgWzEwODc3XV0sIFsnTGVzc1RpbGRlJywgWzg4MThdXSwgWydsZmlzaHQnLCBbMTA2MjBdXSwgWydsZmxvb3InLCBbODk3MF1dLCBbJ0xmcicsIFsxMjAwNzldXSwgWydsZnInLCBbMTIwMTA1XV0sIFsnbGcnLCBbODgyMl1dLCBbJ2xnRScsIFsxMDg5N11dLCBbJ2xIYXInLCBbMTA1OTRdXSwgWydsaGFyZCcsIFs4NjM3XV0sIFsnbGhhcnUnLCBbODYzNl1dLCBbJ2xoYXJ1bCcsIFsxMDYwMl1dLCBbJ2xoYmxrJywgWzk2MDRdXSwgWydMSmN5JywgWzEwMzNdXSwgWydsamN5JywgWzExMTNdXSwgWydsbGFycicsIFs4NjQ3XV0sIFsnbGwnLCBbODgxMF1dLCBbJ0xsJywgWzg5MjBdXSwgWydsbGNvcm5lcicsIFs4OTkwXV0sIFsnTGxlZnRhcnJvdycsIFs4NjY2XV0sIFsnbGxoYXJkJywgWzEwNjAzXV0sIFsnbGx0cmknLCBbOTcyMl1dLCBbJ0xtaWRvdCcsIFszMTldXSwgWydsbWlkb3QnLCBbMzIwXV0sIFsnbG1vdXN0YWNoZScsIFs5MTM2XV0sIFsnbG1vdXN0JywgWzkxMzZdXSwgWydsbmFwJywgWzEwODg5XV0sIFsnbG5hcHByb3gnLCBbMTA4ODldXSwgWydsbmUnLCBbMTA4ODddXSwgWydsbkUnLCBbODgwOF1dLCBbJ2xuZXEnLCBbMTA4ODddXSwgWydsbmVxcScsIFs4ODA4XV0sIFsnbG5zaW0nLCBbODkzNF1dLCBbJ2xvYW5nJywgWzEwMjIwXV0sIFsnbG9hcnInLCBbODcwMV1dLCBbJ2xvYnJrJywgWzEwMjE0XV0sIFsnbG9uZ2xlZnRhcnJvdycsIFsxMDIyOV1dLCBbJ0xvbmdMZWZ0QXJyb3cnLCBbMTAyMjldXSwgWydMb25nbGVmdGFycm93JywgWzEwMjMyXV0sIFsnbG9uZ2xlZnRyaWdodGFycm93JywgWzEwMjMxXV0sIFsnTG9uZ0xlZnRSaWdodEFycm93JywgWzEwMjMxXV0sIFsnTG9uZ2xlZnRyaWdodGFycm93JywgWzEwMjM0XV0sIFsnbG9uZ21hcHN0bycsIFsxMDIzNl1dLCBbJ2xvbmdyaWdodGFycm93JywgWzEwMjMwXV0sIFsnTG9uZ1JpZ2h0QXJyb3cnLCBbMTAyMzBdXSwgWydMb25ncmlnaHRhcnJvdycsIFsxMDIzM11dLCBbJ2xvb3BhcnJvd2xlZnQnLCBbODYxOV1dLCBbJ2xvb3BhcnJvd3JpZ2h0JywgWzg2MjBdXSwgWydsb3BhcicsIFsxMDYyOV1dLCBbJ0xvcGYnLCBbMTIwMTMxXV0sIFsnbG9wZicsIFsxMjAxNTddXSwgWydsb3BsdXMnLCBbMTA3OTddXSwgWydsb3RpbWVzJywgWzEwODA0XV0sIFsnbG93YXN0JywgWzg3MjddXSwgWydsb3diYXInLCBbOTVdXSwgWydMb3dlckxlZnRBcnJvdycsIFs4NjAxXV0sIFsnTG93ZXJSaWdodEFycm93JywgWzg2MDBdXSwgWydsb3onLCBbOTY3NF1dLCBbJ2xvemVuZ2UnLCBbOTY3NF1dLCBbJ2xvemYnLCBbMTA3MzFdXSwgWydscGFyJywgWzQwXV0sIFsnbHBhcmx0JywgWzEwNjQzXV0sIFsnbHJhcnInLCBbODY0Nl1dLCBbJ2xyY29ybmVyJywgWzg5OTFdXSwgWydscmhhcicsIFs4NjUxXV0sIFsnbHJoYXJkJywgWzEwNjA1XV0sIFsnbHJtJywgWzgyMDZdXSwgWydscnRyaScsIFs4ODk1XV0sIFsnbHNhcXVvJywgWzgyNDldXSwgWydsc2NyJywgWzEyMDAwMV1dLCBbJ0xzY3InLCBbODQ2Nl1dLCBbJ2xzaCcsIFs4NjI0XV0sIFsnTHNoJywgWzg2MjRdXSwgWydsc2ltJywgWzg4MThdXSwgWydsc2ltZScsIFsxMDg5M11dLCBbJ2xzaW1nJywgWzEwODk1XV0sIFsnbHNxYicsIFs5MV1dLCBbJ2xzcXVvJywgWzgyMTZdXSwgWydsc3F1b3InLCBbODIxOF1dLCBbJ0xzdHJvaycsIFszMjFdXSwgWydsc3Ryb2snLCBbMzIyXV0sIFsnbHRjYycsIFsxMDkxOF1dLCBbJ2x0Y2lyJywgWzEwODczXV0sIFsnbHQnLCBbNjBdXSwgWydMVCcsIFs2MF1dLCBbJ0x0JywgWzg4MTBdXSwgWydsdGRvdCcsIFs4OTE4XV0sIFsnbHRocmVlJywgWzg5MDddXSwgWydsdGltZXMnLCBbODkwNV1dLCBbJ2x0bGFycicsIFsxMDYxNF1dLCBbJ2x0cXVlc3QnLCBbMTA4NzVdXSwgWydsdHJpJywgWzk2NjddXSwgWydsdHJpZScsIFs4ODg0XV0sIFsnbHRyaWYnLCBbOTY2Nl1dLCBbJ2x0clBhcicsIFsxMDY0Nl1dLCBbJ2x1cmRzaGFyJywgWzEwNTcwXV0sIFsnbHVydWhhcicsIFsxMDU5OF1dLCBbJ2x2ZXJ0bmVxcScsIFs4ODA4LCA2NTAyNF1dLCBbJ2x2bkUnLCBbODgwOCwgNjUwMjRdXSwgWydtYWNyJywgWzE3NV1dLCBbJ21hbGUnLCBbOTc5NF1dLCBbJ21hbHQnLCBbMTAwMTZdXSwgWydtYWx0ZXNlJywgWzEwMDE2XV0sIFsnTWFwJywgWzEwNTAxXV0sIFsnbWFwJywgWzg2MTRdXSwgWydtYXBzdG8nLCBbODYxNF1dLCBbJ21hcHN0b2Rvd24nLCBbODYxNV1dLCBbJ21hcHN0b2xlZnQnLCBbODYxMl1dLCBbJ21hcHN0b3VwJywgWzg2MTNdXSwgWydtYXJrZXInLCBbOTY0Nl1dLCBbJ21jb21tYScsIFsxMDc5M11dLCBbJ01jeScsIFsxMDUyXV0sIFsnbWN5JywgWzEwODRdXSwgWydtZGFzaCcsIFs4MjEyXV0sIFsnbUREb3QnLCBbODc2Ml1dLCBbJ21lYXN1cmVkYW5nbGUnLCBbODczN11dLCBbJ01lZGl1bVNwYWNlJywgWzgyODddXSwgWydNZWxsaW50cmYnLCBbODQ5OV1dLCBbJ01mcicsIFsxMjAwODBdXSwgWydtZnInLCBbMTIwMTA2XV0sIFsnbWhvJywgWzg0ODddXSwgWydtaWNybycsIFsxODFdXSwgWydtaWRhc3QnLCBbNDJdXSwgWydtaWRjaXInLCBbMTA5OTJdXSwgWydtaWQnLCBbODczOV1dLCBbJ21pZGRvdCcsIFsxODNdXSwgWydtaW51c2InLCBbODg2M11dLCBbJ21pbnVzJywgWzg3MjJdXSwgWydtaW51c2QnLCBbODc2MF1dLCBbJ21pbnVzZHUnLCBbMTA3OTRdXSwgWydNaW51c1BsdXMnLCBbODcyM11dLCBbJ21sY3AnLCBbMTA5NzFdXSwgWydtbGRyJywgWzgyMzBdXSwgWydtbnBsdXMnLCBbODcyM11dLCBbJ21vZGVscycsIFs4ODcxXV0sIFsnTW9wZicsIFsxMjAxMzJdXSwgWydtb3BmJywgWzEyMDE1OF1dLCBbJ21wJywgWzg3MjNdXSwgWydtc2NyJywgWzEyMDAwMl1dLCBbJ01zY3InLCBbODQ5OV1dLCBbJ21zdHBvcycsIFs4NzY2XV0sIFsnTXUnLCBbOTI0XV0sIFsnbXUnLCBbOTU2XV0sIFsnbXVsdGltYXAnLCBbODg4OF1dLCBbJ211bWFwJywgWzg4ODhdXSwgWyduYWJsYScsIFs4NzExXV0sIFsnTmFjdXRlJywgWzMyM11dLCBbJ25hY3V0ZScsIFszMjRdXSwgWyduYW5nJywgWzg3MzYsIDg0MDJdXSwgWyduYXAnLCBbODc3N11dLCBbJ25hcEUnLCBbMTA4NjQsIDgyNF1dLCBbJ25hcGlkJywgWzg3NzksIDgyNF1dLCBbJ25hcG9zJywgWzMyOV1dLCBbJ25hcHByb3gnLCBbODc3N11dLCBbJ25hdHVyYWwnLCBbOTgzOF1dLCBbJ25hdHVyYWxzJywgWzg0NjldXSwgWyduYXR1cicsIFs5ODM4XV0sIFsnbmJzcCcsIFsxNjBdXSwgWyduYnVtcCcsIFs4NzgyLCA4MjRdXSwgWyduYnVtcGUnLCBbODc4MywgODI0XV0sIFsnbmNhcCcsIFsxMDgxOV1dLCBbJ05jYXJvbicsIFszMjddXSwgWyduY2Fyb24nLCBbMzI4XV0sIFsnTmNlZGlsJywgWzMyNV1dLCBbJ25jZWRpbCcsIFszMjZdXSwgWyduY29uZycsIFs4Nzc1XV0sIFsnbmNvbmdkb3QnLCBbMTA4NjEsIDgyNF1dLCBbJ25jdXAnLCBbMTA4MThdXSwgWydOY3knLCBbMTA1M11dLCBbJ25jeScsIFsxMDg1XV0sIFsnbmRhc2gnLCBbODIxMV1dLCBbJ25lYXJoaycsIFsxMDUzMl1dLCBbJ25lYXJyJywgWzg1OTldXSwgWyduZUFycicsIFs4NjYzXV0sIFsnbmVhcnJvdycsIFs4NTk5XV0sIFsnbmUnLCBbODgwMF1dLCBbJ25lZG90JywgWzg3ODQsIDgyNF1dLCBbJ05lZ2F0aXZlTWVkaXVtU3BhY2UnLCBbODIwM11dLCBbJ05lZ2F0aXZlVGhpY2tTcGFjZScsIFs4MjAzXV0sIFsnTmVnYXRpdmVUaGluU3BhY2UnLCBbODIwM11dLCBbJ05lZ2F0aXZlVmVyeVRoaW5TcGFjZScsIFs4MjAzXV0sIFsnbmVxdWl2JywgWzg4MDJdXSwgWyduZXNlYXInLCBbMTA1MzZdXSwgWyduZXNpbScsIFs4NzcwLCA4MjRdXSwgWydOZXN0ZWRHcmVhdGVyR3JlYXRlcicsIFs4ODExXV0sIFsnTmVzdGVkTGVzc0xlc3MnLCBbODgxMF1dLCBbJ25leGlzdCcsIFs4NzA4XV0sIFsnbmV4aXN0cycsIFs4NzA4XV0sIFsnTmZyJywgWzEyMDA4MV1dLCBbJ25mcicsIFsxMjAxMDddXSwgWyduZ0UnLCBbODgwNywgODI0XV0sIFsnbmdlJywgWzg4MTddXSwgWyduZ2VxJywgWzg4MTddXSwgWyduZ2VxcScsIFs4ODA3LCA4MjRdXSwgWyduZ2Vxc2xhbnQnLCBbMTA4NzgsIDgyNF1dLCBbJ25nZXMnLCBbMTA4NzgsIDgyNF1dLCBbJ25HZycsIFs4OTIxLCA4MjRdXSwgWyduZ3NpbScsIFs4ODIxXV0sIFsnbkd0JywgWzg4MTEsIDg0MDJdXSwgWyduZ3QnLCBbODgxNV1dLCBbJ25ndHInLCBbODgxNV1dLCBbJ25HdHYnLCBbODgxMSwgODI0XV0sIFsnbmhhcnInLCBbODYyMl1dLCBbJ25oQXJyJywgWzg2NTRdXSwgWyduaHBhcicsIFsxMDk5NF1dLCBbJ25pJywgWzg3MTVdXSwgWyduaXMnLCBbODk1Nl1dLCBbJ25pc2QnLCBbODk1NF1dLCBbJ25pdicsIFs4NzE1XV0sIFsnTkpjeScsIFsxMDM0XV0sIFsnbmpjeScsIFsxMTE0XV0sIFsnbmxhcnInLCBbODYwMl1dLCBbJ25sQXJyJywgWzg2NTNdXSwgWydubGRyJywgWzgyMjldXSwgWydubEUnLCBbODgwNiwgODI0XV0sIFsnbmxlJywgWzg4MTZdXSwgWydubGVmdGFycm93JywgWzg2MDJdXSwgWyduTGVmdGFycm93JywgWzg2NTNdXSwgWydubGVmdHJpZ2h0YXJyb3cnLCBbODYyMl1dLCBbJ25MZWZ0cmlnaHRhcnJvdycsIFs4NjU0XV0sIFsnbmxlcScsIFs4ODE2XV0sIFsnbmxlcXEnLCBbODgwNiwgODI0XV0sIFsnbmxlcXNsYW50JywgWzEwODc3LCA4MjRdXSwgWydubGVzJywgWzEwODc3LCA4MjRdXSwgWydubGVzcycsIFs4ODE0XV0sIFsnbkxsJywgWzg5MjAsIDgyNF1dLCBbJ25sc2ltJywgWzg4MjBdXSwgWyduTHQnLCBbODgxMCwgODQwMl1dLCBbJ25sdCcsIFs4ODE0XV0sIFsnbmx0cmknLCBbODkzOF1dLCBbJ25sdHJpZScsIFs4OTQwXV0sIFsnbkx0dicsIFs4ODEwLCA4MjRdXSwgWydubWlkJywgWzg3NDBdXSwgWydOb0JyZWFrJywgWzgyODhdXSwgWydOb25CcmVha2luZ1NwYWNlJywgWzE2MF1dLCBbJ25vcGYnLCBbMTIwMTU5XV0sIFsnTm9wZicsIFs4NDY5XV0sIFsnTm90JywgWzEwOTg4XV0sIFsnbm90JywgWzE3Ml1dLCBbJ05vdENvbmdydWVudCcsIFs4ODAyXV0sIFsnTm90Q3VwQ2FwJywgWzg4MTNdXSwgWydOb3REb3VibGVWZXJ0aWNhbEJhcicsIFs4NzQyXV0sIFsnTm90RWxlbWVudCcsIFs4NzEzXV0sIFsnTm90RXF1YWwnLCBbODgwMF1dLCBbJ05vdEVxdWFsVGlsZGUnLCBbODc3MCwgODI0XV0sIFsnTm90RXhpc3RzJywgWzg3MDhdXSwgWydOb3RHcmVhdGVyJywgWzg4MTVdXSwgWydOb3RHcmVhdGVyRXF1YWwnLCBbODgxN11dLCBbJ05vdEdyZWF0ZXJGdWxsRXF1YWwnLCBbODgwNywgODI0XV0sIFsnTm90R3JlYXRlckdyZWF0ZXInLCBbODgxMSwgODI0XV0sIFsnTm90R3JlYXRlckxlc3MnLCBbODgyNV1dLCBbJ05vdEdyZWF0ZXJTbGFudEVxdWFsJywgWzEwODc4LCA4MjRdXSwgWydOb3RHcmVhdGVyVGlsZGUnLCBbODgyMV1dLCBbJ05vdEh1bXBEb3duSHVtcCcsIFs4NzgyLCA4MjRdXSwgWydOb3RIdW1wRXF1YWwnLCBbODc4MywgODI0XV0sIFsnbm90aW4nLCBbODcxM11dLCBbJ25vdGluZG90JywgWzg5NDksIDgyNF1dLCBbJ25vdGluRScsIFs4OTUzLCA4MjRdXSwgWydub3RpbnZhJywgWzg3MTNdXSwgWydub3RpbnZiJywgWzg5NTFdXSwgWydub3RpbnZjJywgWzg5NTBdXSwgWydOb3RMZWZ0VHJpYW5nbGVCYXInLCBbMTA3MDMsIDgyNF1dLCBbJ05vdExlZnRUcmlhbmdsZScsIFs4OTM4XV0sIFsnTm90TGVmdFRyaWFuZ2xlRXF1YWwnLCBbODk0MF1dLCBbJ05vdExlc3MnLCBbODgxNF1dLCBbJ05vdExlc3NFcXVhbCcsIFs4ODE2XV0sIFsnTm90TGVzc0dyZWF0ZXInLCBbODgyNF1dLCBbJ05vdExlc3NMZXNzJywgWzg4MTAsIDgyNF1dLCBbJ05vdExlc3NTbGFudEVxdWFsJywgWzEwODc3LCA4MjRdXSwgWydOb3RMZXNzVGlsZGUnLCBbODgyMF1dLCBbJ05vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyJywgWzEwOTE0LCA4MjRdXSwgWydOb3ROZXN0ZWRMZXNzTGVzcycsIFsxMDkxMywgODI0XV0sIFsnbm90bmknLCBbODcxNl1dLCBbJ25vdG5pdmEnLCBbODcxNl1dLCBbJ25vdG5pdmInLCBbODk1OF1dLCBbJ25vdG5pdmMnLCBbODk1N11dLCBbJ05vdFByZWNlZGVzJywgWzg4MzJdXSwgWydOb3RQcmVjZWRlc0VxdWFsJywgWzEwOTI3LCA4MjRdXSwgWydOb3RQcmVjZWRlc1NsYW50RXF1YWwnLCBbODkyOF1dLCBbJ05vdFJldmVyc2VFbGVtZW50JywgWzg3MTZdXSwgWydOb3RSaWdodFRyaWFuZ2xlQmFyJywgWzEwNzA0LCA4MjRdXSwgWydOb3RSaWdodFRyaWFuZ2xlJywgWzg5MzldXSwgWydOb3RSaWdodFRyaWFuZ2xlRXF1YWwnLCBbODk0MV1dLCBbJ05vdFNxdWFyZVN1YnNldCcsIFs4ODQ3LCA4MjRdXSwgWydOb3RTcXVhcmVTdWJzZXRFcXVhbCcsIFs4OTMwXV0sIFsnTm90U3F1YXJlU3VwZXJzZXQnLCBbODg0OCwgODI0XV0sIFsnTm90U3F1YXJlU3VwZXJzZXRFcXVhbCcsIFs4OTMxXV0sIFsnTm90U3Vic2V0JywgWzg4MzQsIDg0MDJdXSwgWydOb3RTdWJzZXRFcXVhbCcsIFs4ODQwXV0sIFsnTm90U3VjY2VlZHMnLCBbODgzM11dLCBbJ05vdFN1Y2NlZWRzRXF1YWwnLCBbMTA5MjgsIDgyNF1dLCBbJ05vdFN1Y2NlZWRzU2xhbnRFcXVhbCcsIFs4OTI5XV0sIFsnTm90U3VjY2VlZHNUaWxkZScsIFs4ODMxLCA4MjRdXSwgWydOb3RTdXBlcnNldCcsIFs4ODM1LCA4NDAyXV0sIFsnTm90U3VwZXJzZXRFcXVhbCcsIFs4ODQxXV0sIFsnTm90VGlsZGUnLCBbODc2OV1dLCBbJ05vdFRpbGRlRXF1YWwnLCBbODc3Ml1dLCBbJ05vdFRpbGRlRnVsbEVxdWFsJywgWzg3NzVdXSwgWydOb3RUaWxkZVRpbGRlJywgWzg3NzddXSwgWydOb3RWZXJ0aWNhbEJhcicsIFs4NzQwXV0sIFsnbnBhcmFsbGVsJywgWzg3NDJdXSwgWyducGFyJywgWzg3NDJdXSwgWyducGFyc2wnLCBbMTEwMDUsIDg0MjFdXSwgWyducGFydCcsIFs4NzA2LCA4MjRdXSwgWyducG9saW50JywgWzEwNzcyXV0sIFsnbnByJywgWzg4MzJdXSwgWyducHJjdWUnLCBbODkyOF1dLCBbJ25wcmVjJywgWzg4MzJdXSwgWyducHJlY2VxJywgWzEwOTI3LCA4MjRdXSwgWyducHJlJywgWzEwOTI3LCA4MjRdXSwgWyducmFycmMnLCBbMTA1NDcsIDgyNF1dLCBbJ25yYXJyJywgWzg2MDNdXSwgWyduckFycicsIFs4NjU1XV0sIFsnbnJhcnJ3JywgWzg2MDUsIDgyNF1dLCBbJ25yaWdodGFycm93JywgWzg2MDNdXSwgWyduUmlnaHRhcnJvdycsIFs4NjU1XV0sIFsnbnJ0cmknLCBbODkzOV1dLCBbJ25ydHJpZScsIFs4OTQxXV0sIFsnbnNjJywgWzg4MzNdXSwgWyduc2NjdWUnLCBbODkyOV1dLCBbJ25zY2UnLCBbMTA5MjgsIDgyNF1dLCBbJ05zY3InLCBbMTE5OTc3XV0sIFsnbnNjcicsIFsxMjAwMDNdXSwgWyduc2hvcnRtaWQnLCBbODc0MF1dLCBbJ25zaG9ydHBhcmFsbGVsJywgWzg3NDJdXSwgWyduc2ltJywgWzg3NjldXSwgWyduc2ltZScsIFs4NzcyXV0sIFsnbnNpbWVxJywgWzg3NzJdXSwgWyduc21pZCcsIFs4NzQwXV0sIFsnbnNwYXInLCBbODc0Ml1dLCBbJ25zcXN1YmUnLCBbODkzMF1dLCBbJ25zcXN1cGUnLCBbODkzMV1dLCBbJ25zdWInLCBbODgzNl1dLCBbJ25zdWJFJywgWzEwOTQ5LCA4MjRdXSwgWyduc3ViZScsIFs4ODQwXV0sIFsnbnN1YnNldCcsIFs4ODM0LCA4NDAyXV0sIFsnbnN1YnNldGVxJywgWzg4NDBdXSwgWyduc3Vic2V0ZXFxJywgWzEwOTQ5LCA4MjRdXSwgWyduc3VjYycsIFs4ODMzXV0sIFsnbnN1Y2NlcScsIFsxMDkyOCwgODI0XV0sIFsnbnN1cCcsIFs4ODM3XV0sIFsnbnN1cEUnLCBbMTA5NTAsIDgyNF1dLCBbJ25zdXBlJywgWzg4NDFdXSwgWyduc3Vwc2V0JywgWzg4MzUsIDg0MDJdXSwgWyduc3Vwc2V0ZXEnLCBbODg0MV1dLCBbJ25zdXBzZXRlcXEnLCBbMTA5NTAsIDgyNF1dLCBbJ250Z2wnLCBbODgyNV1dLCBbJ050aWxkZScsIFsyMDldXSwgWydudGlsZGUnLCBbMjQxXV0sIFsnbnRsZycsIFs4ODI0XV0sIFsnbnRyaWFuZ2xlbGVmdCcsIFs4OTM4XV0sIFsnbnRyaWFuZ2xlbGVmdGVxJywgWzg5NDBdXSwgWydudHJpYW5nbGVyaWdodCcsIFs4OTM5XV0sIFsnbnRyaWFuZ2xlcmlnaHRlcScsIFs4OTQxXV0sIFsnTnUnLCBbOTI1XV0sIFsnbnUnLCBbOTU3XV0sIFsnbnVtJywgWzM1XV0sIFsnbnVtZXJvJywgWzg0NzBdXSwgWydudW1zcCcsIFs4MTk5XV0sIFsnbnZhcCcsIFs4NzgxLCA4NDAyXV0sIFsnbnZkYXNoJywgWzg4NzZdXSwgWydudkRhc2gnLCBbODg3N11dLCBbJ25WZGFzaCcsIFs4ODc4XV0sIFsnblZEYXNoJywgWzg4NzldXSwgWydudmdlJywgWzg4MDUsIDg0MDJdXSwgWydudmd0JywgWzYyLCA4NDAyXV0sIFsnbnZIYXJyJywgWzEwNTAwXV0sIFsnbnZpbmZpbicsIFsxMDcxOF1dLCBbJ252bEFycicsIFsxMDQ5OF1dLCBbJ252bGUnLCBbODgwNCwgODQwMl1dLCBbJ252bHQnLCBbNjAsIDg0MDJdXSwgWydudmx0cmllJywgWzg4ODQsIDg0MDJdXSwgWydudnJBcnInLCBbMTA0OTldXSwgWydudnJ0cmllJywgWzg4ODUsIDg0MDJdXSwgWydudnNpbScsIFs4NzY0LCA4NDAyXV0sIFsnbndhcmhrJywgWzEwNTMxXV0sIFsnbndhcnInLCBbODU5OF1dLCBbJ253QXJyJywgWzg2NjJdXSwgWydud2Fycm93JywgWzg1OThdXSwgWydud25lYXInLCBbMTA1MzVdXSwgWydPYWN1dGUnLCBbMjExXV0sIFsnb2FjdXRlJywgWzI0M11dLCBbJ29hc3QnLCBbODg1OV1dLCBbJ09jaXJjJywgWzIxMl1dLCBbJ29jaXJjJywgWzI0NF1dLCBbJ29jaXInLCBbODg1OF1dLCBbJ09jeScsIFsxMDU0XV0sIFsnb2N5JywgWzEwODZdXSwgWydvZGFzaCcsIFs4ODYxXV0sIFsnT2RibGFjJywgWzMzNl1dLCBbJ29kYmxhYycsIFszMzddXSwgWydvZGl2JywgWzEwODA4XV0sIFsnb2RvdCcsIFs4ODU3XV0sIFsnb2Rzb2xkJywgWzEwNjg0XV0sIFsnT0VsaWcnLCBbMzM4XV0sIFsnb2VsaWcnLCBbMzM5XV0sIFsnb2ZjaXInLCBbMTA2ODddXSwgWydPZnInLCBbMTIwMDgyXV0sIFsnb2ZyJywgWzEyMDEwOF1dLCBbJ29nb24nLCBbNzMxXV0sIFsnT2dyYXZlJywgWzIxMF1dLCBbJ29ncmF2ZScsIFsyNDJdXSwgWydvZ3QnLCBbMTA2ODldXSwgWydvaGJhcicsIFsxMDY3N11dLCBbJ29obScsIFs5MzddXSwgWydvaW50JywgWzg3NTBdXSwgWydvbGFycicsIFs4NjM0XV0sIFsnb2xjaXInLCBbMTA2ODZdXSwgWydvbGNyb3NzJywgWzEwNjgzXV0sIFsnb2xpbmUnLCBbODI1NF1dLCBbJ29sdCcsIFsxMDY4OF1dLCBbJ09tYWNyJywgWzMzMl1dLCBbJ29tYWNyJywgWzMzM11dLCBbJ09tZWdhJywgWzkzN11dLCBbJ29tZWdhJywgWzk2OV1dLCBbJ09taWNyb24nLCBbOTI3XV0sIFsnb21pY3JvbicsIFs5NTldXSwgWydvbWlkJywgWzEwNjc4XV0sIFsnb21pbnVzJywgWzg4NTRdXSwgWydPb3BmJywgWzEyMDEzNF1dLCBbJ29vcGYnLCBbMTIwMTYwXV0sIFsnb3BhcicsIFsxMDY3OV1dLCBbJ09wZW5DdXJseURvdWJsZVF1b3RlJywgWzgyMjBdXSwgWydPcGVuQ3VybHlRdW90ZScsIFs4MjE2XV0sIFsnb3BlcnAnLCBbMTA2ODFdXSwgWydvcGx1cycsIFs4ODUzXV0sIFsnb3JhcnInLCBbODYzNV1dLCBbJ09yJywgWzEwODM2XV0sIFsnb3InLCBbODc0NF1dLCBbJ29yZCcsIFsxMDg0NV1dLCBbJ29yZGVyJywgWzg1MDBdXSwgWydvcmRlcm9mJywgWzg1MDBdXSwgWydvcmRmJywgWzE3MF1dLCBbJ29yZG0nLCBbMTg2XV0sIFsnb3JpZ29mJywgWzg4ODZdXSwgWydvcm9yJywgWzEwODM4XV0sIFsnb3JzbG9wZScsIFsxMDgzOV1dLCBbJ29ydicsIFsxMDg0M11dLCBbJ29TJywgWzk0MTZdXSwgWydPc2NyJywgWzExOTk3OF1dLCBbJ29zY3InLCBbODUwMF1dLCBbJ09zbGFzaCcsIFsyMTZdXSwgWydvc2xhc2gnLCBbMjQ4XV0sIFsnb3NvbCcsIFs4ODU2XV0sIFsnT3RpbGRlJywgWzIxM11dLCBbJ290aWxkZScsIFsyNDVdXSwgWydvdGltZXNhcycsIFsxMDgwNl1dLCBbJ090aW1lcycsIFsxMDgwN11dLCBbJ290aW1lcycsIFs4ODU1XV0sIFsnT3VtbCcsIFsyMTRdXSwgWydvdW1sJywgWzI0Nl1dLCBbJ292YmFyJywgWzkwMjFdXSwgWydPdmVyQmFyJywgWzgyNTRdXSwgWydPdmVyQnJhY2UnLCBbOTE4Ml1dLCBbJ092ZXJCcmFja2V0JywgWzkxNDBdXSwgWydPdmVyUGFyZW50aGVzaXMnLCBbOTE4MF1dLCBbJ3BhcmEnLCBbMTgyXV0sIFsncGFyYWxsZWwnLCBbODc0MV1dLCBbJ3BhcicsIFs4NzQxXV0sIFsncGFyc2ltJywgWzEwOTk1XV0sIFsncGFyc2wnLCBbMTEwMDVdXSwgWydwYXJ0JywgWzg3MDZdXSwgWydQYXJ0aWFsRCcsIFs4NzA2XV0sIFsnUGN5JywgWzEwNTVdXSwgWydwY3knLCBbMTA4N11dLCBbJ3BlcmNudCcsIFszN11dLCBbJ3BlcmlvZCcsIFs0Nl1dLCBbJ3Blcm1pbCcsIFs4MjQwXV0sIFsncGVycCcsIFs4ODY5XV0sIFsncGVydGVuaycsIFs4MjQxXV0sIFsnUGZyJywgWzEyMDA4M11dLCBbJ3BmcicsIFsxMjAxMDldXSwgWydQaGknLCBbOTM0XV0sIFsncGhpJywgWzk2Nl1dLCBbJ3BoaXYnLCBbOTgxXV0sIFsncGhtbWF0JywgWzg0OTldXSwgWydwaG9uZScsIFs5NzQyXV0sIFsnUGknLCBbOTI4XV0sIFsncGknLCBbOTYwXV0sIFsncGl0Y2hmb3JrJywgWzg5MTZdXSwgWydwaXYnLCBbOTgyXV0sIFsncGxhbmNrJywgWzg0NjNdXSwgWydwbGFuY2toJywgWzg0NjJdXSwgWydwbGFua3YnLCBbODQ2M11dLCBbJ3BsdXNhY2lyJywgWzEwNzg3XV0sIFsncGx1c2InLCBbODg2Ml1dLCBbJ3BsdXNjaXInLCBbMTA3ODZdXSwgWydwbHVzJywgWzQzXV0sIFsncGx1c2RvJywgWzg3MjRdXSwgWydwbHVzZHUnLCBbMTA3ODldXSwgWydwbHVzZScsIFsxMDg2Nl1dLCBbJ1BsdXNNaW51cycsIFsxNzddXSwgWydwbHVzbW4nLCBbMTc3XV0sIFsncGx1c3NpbScsIFsxMDc5MF1dLCBbJ3BsdXN0d28nLCBbMTA3OTFdXSwgWydwbScsIFsxNzddXSwgWydQb2luY2FyZXBsYW5lJywgWzg0NjBdXSwgWydwb2ludGludCcsIFsxMDc3M11dLCBbJ3BvcGYnLCBbMTIwMTYxXV0sIFsnUG9wZicsIFs4NDczXV0sIFsncG91bmQnLCBbMTYzXV0sIFsncHJhcCcsIFsxMDkzNV1dLCBbJ1ByJywgWzEwOTM5XV0sIFsncHInLCBbODgyNl1dLCBbJ3ByY3VlJywgWzg4MjhdXSwgWydwcmVjYXBwcm94JywgWzEwOTM1XV0sIFsncHJlYycsIFs4ODI2XV0sIFsncHJlY2N1cmx5ZXEnLCBbODgyOF1dLCBbJ1ByZWNlZGVzJywgWzg4MjZdXSwgWydQcmVjZWRlc0VxdWFsJywgWzEwOTI3XV0sIFsnUHJlY2VkZXNTbGFudEVxdWFsJywgWzg4MjhdXSwgWydQcmVjZWRlc1RpbGRlJywgWzg4MzBdXSwgWydwcmVjZXEnLCBbMTA5MjddXSwgWydwcmVjbmFwcHJveCcsIFsxMDkzN11dLCBbJ3ByZWNuZXFxJywgWzEwOTMzXV0sIFsncHJlY25zaW0nLCBbODkzNl1dLCBbJ3ByZScsIFsxMDkyN11dLCBbJ3ByRScsIFsxMDkzMV1dLCBbJ3ByZWNzaW0nLCBbODgzMF1dLCBbJ3ByaW1lJywgWzgyNDJdXSwgWydQcmltZScsIFs4MjQzXV0sIFsncHJpbWVzJywgWzg0NzNdXSwgWydwcm5hcCcsIFsxMDkzN11dLCBbJ3BybkUnLCBbMTA5MzNdXSwgWydwcm5zaW0nLCBbODkzNl1dLCBbJ3Byb2QnLCBbODcxOV1dLCBbJ1Byb2R1Y3QnLCBbODcxOV1dLCBbJ3Byb2ZhbGFyJywgWzkwMDZdXSwgWydwcm9mbGluZScsIFs4OTc4XV0sIFsncHJvZnN1cmYnLCBbODk3OV1dLCBbJ3Byb3AnLCBbODczM11dLCBbJ1Byb3BvcnRpb25hbCcsIFs4NzMzXV0sIFsnUHJvcG9ydGlvbicsIFs4NzU5XV0sIFsncHJvcHRvJywgWzg3MzNdXSwgWydwcnNpbScsIFs4ODMwXV0sIFsncHJ1cmVsJywgWzg4ODBdXSwgWydQc2NyJywgWzExOTk3OV1dLCBbJ3BzY3InLCBbMTIwMDA1XV0sIFsnUHNpJywgWzkzNl1dLCBbJ3BzaScsIFs5NjhdXSwgWydwdW5jc3AnLCBbODIwMF1dLCBbJ1FmcicsIFsxMjAwODRdXSwgWydxZnInLCBbMTIwMTEwXV0sIFsncWludCcsIFsxMDc2NF1dLCBbJ3FvcGYnLCBbMTIwMTYyXV0sIFsnUW9wZicsIFs4NDc0XV0sIFsncXByaW1lJywgWzgyNzldXSwgWydRc2NyJywgWzExOTk4MF1dLCBbJ3FzY3InLCBbMTIwMDA2XV0sIFsncXVhdGVybmlvbnMnLCBbODQ2MV1dLCBbJ3F1YXRpbnQnLCBbMTA3NzRdXSwgWydxdWVzdCcsIFs2M11dLCBbJ3F1ZXN0ZXEnLCBbODc5OV1dLCBbJ3F1b3QnLCBbMzRdXSwgWydRVU9UJywgWzM0XV0sIFsnckFhcnInLCBbODY2N11dLCBbJ3JhY2UnLCBbODc2NSwgODE3XV0sIFsnUmFjdXRlJywgWzM0MF1dLCBbJ3JhY3V0ZScsIFszNDFdXSwgWydyYWRpYycsIFs4NzMwXV0sIFsncmFlbXB0eXYnLCBbMTA2NzVdXSwgWydyYW5nJywgWzEwMjE3XV0sIFsnUmFuZycsIFsxMDIxOV1dLCBbJ3JhbmdkJywgWzEwNjQyXV0sIFsncmFuZ2UnLCBbMTA2NjFdXSwgWydyYW5nbGUnLCBbMTAyMTddXSwgWydyYXF1bycsIFsxODddXSwgWydyYXJyYXAnLCBbMTA2MTNdXSwgWydyYXJyYicsIFs4Njc3XV0sIFsncmFycmJmcycsIFsxMDUyOF1dLCBbJ3JhcnJjJywgWzEwNTQ3XV0sIFsncmFycicsIFs4NTk0XV0sIFsnUmFycicsIFs4NjA4XV0sIFsnckFycicsIFs4NjU4XV0sIFsncmFycmZzJywgWzEwNTI2XV0sIFsncmFycmhrJywgWzg2MThdXSwgWydyYXJybHAnLCBbODYyMF1dLCBbJ3JhcnJwbCcsIFsxMDU2NV1dLCBbJ3JhcnJzaW0nLCBbMTA2MTJdXSwgWydSYXJydGwnLCBbMTA1MThdXSwgWydyYXJydGwnLCBbODYxMV1dLCBbJ3JhcnJ3JywgWzg2MDVdXSwgWydyYXRhaWwnLCBbMTA1MjJdXSwgWydyQXRhaWwnLCBbMTA1MjRdXSwgWydyYXRpbycsIFs4NzU4XV0sIFsncmF0aW9uYWxzJywgWzg0NzRdXSwgWydyYmFycicsIFsxMDUwOV1dLCBbJ3JCYXJyJywgWzEwNTExXV0sIFsnUkJhcnInLCBbMTA1MTJdXSwgWydyYmJyaycsIFsxMDA5OV1dLCBbJ3JicmFjZScsIFsxMjVdXSwgWydyYnJhY2snLCBbOTNdXSwgWydyYnJrZScsIFsxMDYzNl1dLCBbJ3JicmtzbGQnLCBbMTA2MzhdXSwgWydyYnJrc2x1JywgWzEwNjQwXV0sIFsnUmNhcm9uJywgWzM0NF1dLCBbJ3JjYXJvbicsIFszNDVdXSwgWydSY2VkaWwnLCBbMzQyXV0sIFsncmNlZGlsJywgWzM0M11dLCBbJ3JjZWlsJywgWzg5NjldXSwgWydyY3ViJywgWzEyNV1dLCBbJ1JjeScsIFsxMDU2XV0sIFsncmN5JywgWzEwODhdXSwgWydyZGNhJywgWzEwNTUxXV0sIFsncmRsZGhhcicsIFsxMDYwMV1dLCBbJ3JkcXVvJywgWzgyMjFdXSwgWydyZHF1b3InLCBbODIyMV1dLCBbJ0Nsb3NlQ3VybHlEb3VibGVRdW90ZScsIFs4MjIxXV0sIFsncmRzaCcsIFs4NjI3XV0sIFsncmVhbCcsIFs4NDc2XV0sIFsncmVhbGluZScsIFs4NDc1XV0sIFsncmVhbHBhcnQnLCBbODQ3Nl1dLCBbJ3JlYWxzJywgWzg0NzddXSwgWydSZScsIFs4NDc2XV0sIFsncmVjdCcsIFs5NjQ1XV0sIFsncmVnJywgWzE3NF1dLCBbJ1JFRycsIFsxNzRdXSwgWydSZXZlcnNlRWxlbWVudCcsIFs4NzE1XV0sIFsnUmV2ZXJzZUVxdWlsaWJyaXVtJywgWzg2NTFdXSwgWydSZXZlcnNlVXBFcXVpbGlicml1bScsIFsxMDYwN11dLCBbJ3JmaXNodCcsIFsxMDYyMV1dLCBbJ3JmbG9vcicsIFs4OTcxXV0sIFsncmZyJywgWzEyMDExMV1dLCBbJ1JmcicsIFs4NDc2XV0sIFsnckhhcicsIFsxMDU5Nl1dLCBbJ3JoYXJkJywgWzg2NDFdXSwgWydyaGFydScsIFs4NjQwXV0sIFsncmhhcnVsJywgWzEwNjA0XV0sIFsnUmhvJywgWzkyOV1dLCBbJ3JobycsIFs5NjFdXSwgWydyaG92JywgWzEwMDldXSwgWydSaWdodEFuZ2xlQnJhY2tldCcsIFsxMDIxN11dLCBbJ1JpZ2h0QXJyb3dCYXInLCBbODY3N11dLCBbJ3JpZ2h0YXJyb3cnLCBbODU5NF1dLCBbJ1JpZ2h0QXJyb3cnLCBbODU5NF1dLCBbJ1JpZ2h0YXJyb3cnLCBbODY1OF1dLCBbJ1JpZ2h0QXJyb3dMZWZ0QXJyb3cnLCBbODY0NF1dLCBbJ3JpZ2h0YXJyb3d0YWlsJywgWzg2MTFdXSwgWydSaWdodENlaWxpbmcnLCBbODk2OV1dLCBbJ1JpZ2h0RG91YmxlQnJhY2tldCcsIFsxMDIxNV1dLCBbJ1JpZ2h0RG93blRlZVZlY3RvcicsIFsxMDU4OV1dLCBbJ1JpZ2h0RG93blZlY3RvckJhcicsIFsxMDU4MV1dLCBbJ1JpZ2h0RG93blZlY3RvcicsIFs4NjQyXV0sIFsnUmlnaHRGbG9vcicsIFs4OTcxXV0sIFsncmlnaHRoYXJwb29uZG93bicsIFs4NjQxXV0sIFsncmlnaHRoYXJwb29udXAnLCBbODY0MF1dLCBbJ3JpZ2h0bGVmdGFycm93cycsIFs4NjQ0XV0sIFsncmlnaHRsZWZ0aGFycG9vbnMnLCBbODY1Ml1dLCBbJ3JpZ2h0cmlnaHRhcnJvd3MnLCBbODY0OV1dLCBbJ3JpZ2h0c3F1aWdhcnJvdycsIFs4NjA1XV0sIFsnUmlnaHRUZWVBcnJvdycsIFs4NjE0XV0sIFsnUmlnaHRUZWUnLCBbODg2Nl1dLCBbJ1JpZ2h0VGVlVmVjdG9yJywgWzEwNTg3XV0sIFsncmlnaHR0aHJlZXRpbWVzJywgWzg5MDhdXSwgWydSaWdodFRyaWFuZ2xlQmFyJywgWzEwNzA0XV0sIFsnUmlnaHRUcmlhbmdsZScsIFs4ODgzXV0sIFsnUmlnaHRUcmlhbmdsZUVxdWFsJywgWzg4ODVdXSwgWydSaWdodFVwRG93blZlY3RvcicsIFsxMDU3NV1dLCBbJ1JpZ2h0VXBUZWVWZWN0b3InLCBbMTA1ODhdXSwgWydSaWdodFVwVmVjdG9yQmFyJywgWzEwNTgwXV0sIFsnUmlnaHRVcFZlY3RvcicsIFs4NjM4XV0sIFsnUmlnaHRWZWN0b3JCYXInLCBbMTA1NzldXSwgWydSaWdodFZlY3RvcicsIFs4NjQwXV0sIFsncmluZycsIFs3MzBdXSwgWydyaXNpbmdkb3RzZXEnLCBbODc4N11dLCBbJ3JsYXJyJywgWzg2NDRdXSwgWydybGhhcicsIFs4NjUyXV0sIFsncmxtJywgWzgyMDddXSwgWydybW91c3RhY2hlJywgWzkxMzddXSwgWydybW91c3QnLCBbOTEzN11dLCBbJ3JubWlkJywgWzEwOTkwXV0sIFsncm9hbmcnLCBbMTAyMjFdXSwgWydyb2FycicsIFs4NzAyXV0sIFsncm9icmsnLCBbMTAyMTVdXSwgWydyb3BhcicsIFsxMDYzMF1dLCBbJ3JvcGYnLCBbMTIwMTYzXV0sIFsnUm9wZicsIFs4NDc3XV0sIFsncm9wbHVzJywgWzEwNzk4XV0sIFsncm90aW1lcycsIFsxMDgwNV1dLCBbJ1JvdW5kSW1wbGllcycsIFsxMDYwOF1dLCBbJ3JwYXInLCBbNDFdXSwgWydycGFyZ3QnLCBbMTA2NDRdXSwgWydycHBvbGludCcsIFsxMDc3MF1dLCBbJ3JyYXJyJywgWzg2NDldXSwgWydScmlnaHRhcnJvdycsIFs4NjY3XV0sIFsncnNhcXVvJywgWzgyNTBdXSwgWydyc2NyJywgWzEyMDAwN11dLCBbJ1JzY3InLCBbODQ3NV1dLCBbJ3JzaCcsIFs4NjI1XV0sIFsnUnNoJywgWzg2MjVdXSwgWydyc3FiJywgWzkzXV0sIFsncnNxdW8nLCBbODIxN11dLCBbJ3JzcXVvcicsIFs4MjE3XV0sIFsnQ2xvc2VDdXJseVF1b3RlJywgWzgyMTddXSwgWydydGhyZWUnLCBbODkwOF1dLCBbJ3J0aW1lcycsIFs4OTA2XV0sIFsncnRyaScsIFs5NjU3XV0sIFsncnRyaWUnLCBbODg4NV1dLCBbJ3J0cmlmJywgWzk2NTZdXSwgWydydHJpbHRyaScsIFsxMDcwMl1dLCBbJ1J1bGVEZWxheWVkJywgWzEwNzQwXV0sIFsncnVsdWhhcicsIFsxMDYwMF1dLCBbJ3J4JywgWzg0NzhdXSwgWydTYWN1dGUnLCBbMzQ2XV0sIFsnc2FjdXRlJywgWzM0N11dLCBbJ3NicXVvJywgWzgyMThdXSwgWydzY2FwJywgWzEwOTM2XV0sIFsnU2Nhcm9uJywgWzM1Ml1dLCBbJ3NjYXJvbicsIFszNTNdXSwgWydTYycsIFsxMDk0MF1dLCBbJ3NjJywgWzg4MjddXSwgWydzY2N1ZScsIFs4ODI5XV0sIFsnc2NlJywgWzEwOTI4XV0sIFsnc2NFJywgWzEwOTMyXV0sIFsnU2NlZGlsJywgWzM1MF1dLCBbJ3NjZWRpbCcsIFszNTFdXSwgWydTY2lyYycsIFszNDhdXSwgWydzY2lyYycsIFszNDldXSwgWydzY25hcCcsIFsxMDkzOF1dLCBbJ3NjbkUnLCBbMTA5MzRdXSwgWydzY25zaW0nLCBbODkzN11dLCBbJ3NjcG9saW50JywgWzEwNzcxXV0sIFsnc2NzaW0nLCBbODgzMV1dLCBbJ1NjeScsIFsxMDU3XV0sIFsnc2N5JywgWzEwODldXSwgWydzZG90YicsIFs4ODY1XV0sIFsnc2RvdCcsIFs4OTAxXV0sIFsnc2RvdGUnLCBbMTA4NTRdXSwgWydzZWFyaGsnLCBbMTA1MzNdXSwgWydzZWFycicsIFs4NjAwXV0sIFsnc2VBcnInLCBbODY2NF1dLCBbJ3NlYXJyb3cnLCBbODYwMF1dLCBbJ3NlY3QnLCBbMTY3XV0sIFsnc2VtaScsIFs1OV1dLCBbJ3Nlc3dhcicsIFsxMDUzN11dLCBbJ3NldG1pbnVzJywgWzg3MjZdXSwgWydzZXRtbicsIFs4NzI2XV0sIFsnc2V4dCcsIFsxMDAzOF1dLCBbJ1NmcicsIFsxMjAwODZdXSwgWydzZnInLCBbMTIwMTEyXV0sIFsnc2Zyb3duJywgWzg5OTRdXSwgWydzaGFycCcsIFs5ODM5XV0sIFsnU0hDSGN5JywgWzEwNjVdXSwgWydzaGNoY3knLCBbMTA5N11dLCBbJ1NIY3knLCBbMTA2NF1dLCBbJ3NoY3knLCBbMTA5Nl1dLCBbJ1Nob3J0RG93bkFycm93JywgWzg1OTVdXSwgWydTaG9ydExlZnRBcnJvdycsIFs4NTkyXV0sIFsnc2hvcnRtaWQnLCBbODczOV1dLCBbJ3Nob3J0cGFyYWxsZWwnLCBbODc0MV1dLCBbJ1Nob3J0UmlnaHRBcnJvdycsIFs4NTk0XV0sIFsnU2hvcnRVcEFycm93JywgWzg1OTNdXSwgWydzaHknLCBbMTczXV0sIFsnU2lnbWEnLCBbOTMxXV0sIFsnc2lnbWEnLCBbOTYzXV0sIFsnc2lnbWFmJywgWzk2Ml1dLCBbJ3NpZ21hdicsIFs5NjJdXSwgWydzaW0nLCBbODc2NF1dLCBbJ3NpbWRvdCcsIFsxMDg1OF1dLCBbJ3NpbWUnLCBbODc3MV1dLCBbJ3NpbWVxJywgWzg3NzFdXSwgWydzaW1nJywgWzEwOTEwXV0sIFsnc2ltZ0UnLCBbMTA5MTJdXSwgWydzaW1sJywgWzEwOTA5XV0sIFsnc2ltbEUnLCBbMTA5MTFdXSwgWydzaW1uZScsIFs4Nzc0XV0sIFsnc2ltcGx1cycsIFsxMDc4OF1dLCBbJ3NpbXJhcnInLCBbMTA2MTBdXSwgWydzbGFycicsIFs4NTkyXV0sIFsnU21hbGxDaXJjbGUnLCBbODcyOF1dLCBbJ3NtYWxsc2V0bWludXMnLCBbODcyNl1dLCBbJ3NtYXNocCcsIFsxMDgwM11dLCBbJ3NtZXBhcnNsJywgWzEwNzI0XV0sIFsnc21pZCcsIFs4NzM5XV0sIFsnc21pbGUnLCBbODk5NV1dLCBbJ3NtdCcsIFsxMDkyMl1dLCBbJ3NtdGUnLCBbMTA5MjRdXSwgWydzbXRlcycsIFsxMDkyNCwgNjUwMjRdXSwgWydTT0ZUY3knLCBbMTA2OF1dLCBbJ3NvZnRjeScsIFsxMTAwXV0sIFsnc29sYmFyJywgWzkwMjNdXSwgWydzb2xiJywgWzEwNjkyXV0sIFsnc29sJywgWzQ3XV0sIFsnU29wZicsIFsxMjAxMzhdXSwgWydzb3BmJywgWzEyMDE2NF1dLCBbJ3NwYWRlcycsIFs5ODI0XV0sIFsnc3BhZGVzdWl0JywgWzk4MjRdXSwgWydzcGFyJywgWzg3NDFdXSwgWydzcWNhcCcsIFs4ODUxXV0sIFsnc3FjYXBzJywgWzg4NTEsIDY1MDI0XV0sIFsnc3FjdXAnLCBbODg1Ml1dLCBbJ3NxY3VwcycsIFs4ODUyLCA2NTAyNF1dLCBbJ1NxcnQnLCBbODczMF1dLCBbJ3Nxc3ViJywgWzg4NDddXSwgWydzcXN1YmUnLCBbODg0OV1dLCBbJ3Nxc3Vic2V0JywgWzg4NDddXSwgWydzcXN1YnNldGVxJywgWzg4NDldXSwgWydzcXN1cCcsIFs4ODQ4XV0sIFsnc3FzdXBlJywgWzg4NTBdXSwgWydzcXN1cHNldCcsIFs4ODQ4XV0sIFsnc3FzdXBzZXRlcScsIFs4ODUwXV0sIFsnc3F1YXJlJywgWzk2MzNdXSwgWydTcXVhcmUnLCBbOTYzM11dLCBbJ1NxdWFyZUludGVyc2VjdGlvbicsIFs4ODUxXV0sIFsnU3F1YXJlU3Vic2V0JywgWzg4NDddXSwgWydTcXVhcmVTdWJzZXRFcXVhbCcsIFs4ODQ5XV0sIFsnU3F1YXJlU3VwZXJzZXQnLCBbODg0OF1dLCBbJ1NxdWFyZVN1cGVyc2V0RXF1YWwnLCBbODg1MF1dLCBbJ1NxdWFyZVVuaW9uJywgWzg4NTJdXSwgWydzcXVhcmYnLCBbOTY0Ml1dLCBbJ3NxdScsIFs5NjMzXV0sIFsnc3F1ZicsIFs5NjQyXV0sIFsnc3JhcnInLCBbODU5NF1dLCBbJ1NzY3InLCBbMTE5OTgyXV0sIFsnc3NjcicsIFsxMjAwMDhdXSwgWydzc2V0bW4nLCBbODcyNl1dLCBbJ3NzbWlsZScsIFs4OTk1XV0sIFsnc3N0YXJmJywgWzg5MDJdXSwgWydTdGFyJywgWzg5MDJdXSwgWydzdGFyJywgWzk3MzRdXSwgWydzdGFyZicsIFs5NzMzXV0sIFsnc3RyYWlnaHRlcHNpbG9uJywgWzEwMTNdXSwgWydzdHJhaWdodHBoaScsIFs5ODFdXSwgWydzdHJucycsIFsxNzVdXSwgWydzdWInLCBbODgzNF1dLCBbJ1N1YicsIFs4OTEyXV0sIFsnc3ViZG90JywgWzEwOTQxXV0sIFsnc3ViRScsIFsxMDk0OV1dLCBbJ3N1YmUnLCBbODgzOF1dLCBbJ3N1YmVkb3QnLCBbMTA5NDddXSwgWydzdWJtdWx0JywgWzEwOTQ1XV0sIFsnc3VibkUnLCBbMTA5NTVdXSwgWydzdWJuZScsIFs4ODQyXV0sIFsnc3VicGx1cycsIFsxMDk0M11dLCBbJ3N1YnJhcnInLCBbMTA2MTddXSwgWydzdWJzZXQnLCBbODgzNF1dLCBbJ1N1YnNldCcsIFs4OTEyXV0sIFsnc3Vic2V0ZXEnLCBbODgzOF1dLCBbJ3N1YnNldGVxcScsIFsxMDk0OV1dLCBbJ1N1YnNldEVxdWFsJywgWzg4MzhdXSwgWydzdWJzZXRuZXEnLCBbODg0Ml1dLCBbJ3N1YnNldG5lcXEnLCBbMTA5NTVdXSwgWydzdWJzaW0nLCBbMTA5NTFdXSwgWydzdWJzdWInLCBbMTA5NjVdXSwgWydzdWJzdXAnLCBbMTA5NjNdXSwgWydzdWNjYXBwcm94JywgWzEwOTM2XV0sIFsnc3VjYycsIFs4ODI3XV0sIFsnc3VjY2N1cmx5ZXEnLCBbODgyOV1dLCBbJ1N1Y2NlZWRzJywgWzg4MjddXSwgWydTdWNjZWVkc0VxdWFsJywgWzEwOTI4XV0sIFsnU3VjY2VlZHNTbGFudEVxdWFsJywgWzg4MjldXSwgWydTdWNjZWVkc1RpbGRlJywgWzg4MzFdXSwgWydzdWNjZXEnLCBbMTA5MjhdXSwgWydzdWNjbmFwcHJveCcsIFsxMDkzOF1dLCBbJ3N1Y2NuZXFxJywgWzEwOTM0XV0sIFsnc3VjY25zaW0nLCBbODkzN11dLCBbJ3N1Y2NzaW0nLCBbODgzMV1dLCBbJ1N1Y2hUaGF0JywgWzg3MTVdXSwgWydzdW0nLCBbODcyMV1dLCBbJ1N1bScsIFs4NzIxXV0sIFsnc3VuZycsIFs5ODM0XV0sIFsnc3VwMScsIFsxODVdXSwgWydzdXAyJywgWzE3OF1dLCBbJ3N1cDMnLCBbMTc5XV0sIFsnc3VwJywgWzg4MzVdXSwgWydTdXAnLCBbODkxM11dLCBbJ3N1cGRvdCcsIFsxMDk0Ml1dLCBbJ3N1cGRzdWInLCBbMTA5NjhdXSwgWydzdXBFJywgWzEwOTUwXV0sIFsnc3VwZScsIFs4ODM5XV0sIFsnc3VwZWRvdCcsIFsxMDk0OF1dLCBbJ1N1cGVyc2V0JywgWzg4MzVdXSwgWydTdXBlcnNldEVxdWFsJywgWzg4MzldXSwgWydzdXBoc29sJywgWzEwMTg1XV0sIFsnc3VwaHN1YicsIFsxMDk2N11dLCBbJ3N1cGxhcnInLCBbMTA2MTldXSwgWydzdXBtdWx0JywgWzEwOTQ2XV0sIFsnc3VwbkUnLCBbMTA5NTZdXSwgWydzdXBuZScsIFs4ODQzXV0sIFsnc3VwcGx1cycsIFsxMDk0NF1dLCBbJ3N1cHNldCcsIFs4ODM1XV0sIFsnU3Vwc2V0JywgWzg5MTNdXSwgWydzdXBzZXRlcScsIFs4ODM5XV0sIFsnc3Vwc2V0ZXFxJywgWzEwOTUwXV0sIFsnc3Vwc2V0bmVxJywgWzg4NDNdXSwgWydzdXBzZXRuZXFxJywgWzEwOTU2XV0sIFsnc3Vwc2ltJywgWzEwOTUyXV0sIFsnc3Vwc3ViJywgWzEwOTY0XV0sIFsnc3Vwc3VwJywgWzEwOTY2XV0sIFsnc3dhcmhrJywgWzEwNTM0XV0sIFsnc3dhcnInLCBbODYwMV1dLCBbJ3N3QXJyJywgWzg2NjVdXSwgWydzd2Fycm93JywgWzg2MDFdXSwgWydzd253YXInLCBbMTA1MzhdXSwgWydzemxpZycsIFsyMjNdXSwgWydUYWInLCBbOV1dLCBbJ3RhcmdldCcsIFs4OTgyXV0sIFsnVGF1JywgWzkzMl1dLCBbJ3RhdScsIFs5NjRdXSwgWyd0YnJrJywgWzkxNDBdXSwgWydUY2Fyb24nLCBbMzU2XV0sIFsndGNhcm9uJywgWzM1N11dLCBbJ1RjZWRpbCcsIFszNTRdXSwgWyd0Y2VkaWwnLCBbMzU1XV0sIFsnVGN5JywgWzEwNThdXSwgWyd0Y3knLCBbMTA5MF1dLCBbJ3Rkb3QnLCBbODQxMV1dLCBbJ3RlbHJlYycsIFs4OTgxXV0sIFsnVGZyJywgWzEyMDA4N11dLCBbJ3RmcicsIFsxMjAxMTNdXSwgWyd0aGVyZTQnLCBbODc1Nl1dLCBbJ3RoZXJlZm9yZScsIFs4NzU2XV0sIFsnVGhlcmVmb3JlJywgWzg3NTZdXSwgWydUaGV0YScsIFs5MjBdXSwgWyd0aGV0YScsIFs5NTJdXSwgWyd0aGV0YXN5bScsIFs5NzddXSwgWyd0aGV0YXYnLCBbOTc3XV0sIFsndGhpY2thcHByb3gnLCBbODc3Nl1dLCBbJ3RoaWNrc2ltJywgWzg3NjRdXSwgWydUaGlja1NwYWNlJywgWzgyODcsIDgyMDJdXSwgWydUaGluU3BhY2UnLCBbODIwMV1dLCBbJ3RoaW5zcCcsIFs4MjAxXV0sIFsndGhrYXAnLCBbODc3Nl1dLCBbJ3Roa3NpbScsIFs4NzY0XV0sIFsnVEhPUk4nLCBbMjIyXV0sIFsndGhvcm4nLCBbMjU0XV0sIFsndGlsZGUnLCBbNzMyXV0sIFsnVGlsZGUnLCBbODc2NF1dLCBbJ1RpbGRlRXF1YWwnLCBbODc3MV1dLCBbJ1RpbGRlRnVsbEVxdWFsJywgWzg3NzNdXSwgWydUaWxkZVRpbGRlJywgWzg3NzZdXSwgWyd0aW1lc2JhcicsIFsxMDgwMV1dLCBbJ3RpbWVzYicsIFs4ODY0XV0sIFsndGltZXMnLCBbMjE1XV0sIFsndGltZXNkJywgWzEwODAwXV0sIFsndGludCcsIFs4NzQ5XV0sIFsndG9lYScsIFsxMDUzNl1dLCBbJ3RvcGJvdCcsIFs5MDE0XV0sIFsndG9wY2lyJywgWzEwOTkzXV0sIFsndG9wJywgWzg4NjhdXSwgWydUb3BmJywgWzEyMDEzOV1dLCBbJ3RvcGYnLCBbMTIwMTY1XV0sIFsndG9wZm9yaycsIFsxMDk3MF1dLCBbJ3Rvc2EnLCBbMTA1MzddXSwgWyd0cHJpbWUnLCBbODI0NF1dLCBbJ3RyYWRlJywgWzg0ODJdXSwgWydUUkFERScsIFs4NDgyXV0sIFsndHJpYW5nbGUnLCBbOTY1M11dLCBbJ3RyaWFuZ2xlZG93bicsIFs5NjYzXV0sIFsndHJpYW5nbGVsZWZ0JywgWzk2NjddXSwgWyd0cmlhbmdsZWxlZnRlcScsIFs4ODg0XV0sIFsndHJpYW5nbGVxJywgWzg3OTZdXSwgWyd0cmlhbmdsZXJpZ2h0JywgWzk2NTddXSwgWyd0cmlhbmdsZXJpZ2h0ZXEnLCBbODg4NV1dLCBbJ3RyaWRvdCcsIFs5NzA4XV0sIFsndHJpZScsIFs4Nzk2XV0sIFsndHJpbWludXMnLCBbMTA4MTBdXSwgWydUcmlwbGVEb3QnLCBbODQxMV1dLCBbJ3RyaXBsdXMnLCBbMTA4MDldXSwgWyd0cmlzYicsIFsxMDcwMV1dLCBbJ3RyaXRpbWUnLCBbMTA4MTFdXSwgWyd0cnBleml1bScsIFs5MTg2XV0sIFsnVHNjcicsIFsxMTk5ODNdXSwgWyd0c2NyJywgWzEyMDAwOV1dLCBbJ1RTY3knLCBbMTA2Ml1dLCBbJ3RzY3knLCBbMTA5NF1dLCBbJ1RTSGN5JywgWzEwMzVdXSwgWyd0c2hjeScsIFsxMTE1XV0sIFsnVHN0cm9rJywgWzM1OF1dLCBbJ3RzdHJvaycsIFszNTldXSwgWyd0d2l4dCcsIFs4ODEyXV0sIFsndHdvaGVhZGxlZnRhcnJvdycsIFs4NjA2XV0sIFsndHdvaGVhZHJpZ2h0YXJyb3cnLCBbODYwOF1dLCBbJ1VhY3V0ZScsIFsyMThdXSwgWyd1YWN1dGUnLCBbMjUwXV0sIFsndWFycicsIFs4NTkzXV0sIFsnVWFycicsIFs4NjA3XV0sIFsndUFycicsIFs4NjU3XV0sIFsnVWFycm9jaXInLCBbMTA1NjldXSwgWydVYnJjeScsIFsxMDM4XV0sIFsndWJyY3knLCBbMTExOF1dLCBbJ1VicmV2ZScsIFszNjRdXSwgWyd1YnJldmUnLCBbMzY1XV0sIFsnVWNpcmMnLCBbMjE5XV0sIFsndWNpcmMnLCBbMjUxXV0sIFsnVWN5JywgWzEwNTldXSwgWyd1Y3knLCBbMTA5MV1dLCBbJ3VkYXJyJywgWzg2NDVdXSwgWydVZGJsYWMnLCBbMzY4XV0sIFsndWRibGFjJywgWzM2OV1dLCBbJ3VkaGFyJywgWzEwNjA2XV0sIFsndWZpc2h0JywgWzEwNjIyXV0sIFsnVWZyJywgWzEyMDA4OF1dLCBbJ3VmcicsIFsxMjAxMTRdXSwgWydVZ3JhdmUnLCBbMjE3XV0sIFsndWdyYXZlJywgWzI0OV1dLCBbJ3VIYXInLCBbMTA1OTVdXSwgWyd1aGFybCcsIFs4NjM5XV0sIFsndWhhcnInLCBbODYzOF1dLCBbJ3VoYmxrJywgWzk2MDBdXSwgWyd1bGNvcm4nLCBbODk4OF1dLCBbJ3VsY29ybmVyJywgWzg5ODhdXSwgWyd1bGNyb3AnLCBbODk3NV1dLCBbJ3VsdHJpJywgWzk3MjBdXSwgWydVbWFjcicsIFszNjJdXSwgWyd1bWFjcicsIFszNjNdXSwgWyd1bWwnLCBbMTY4XV0sIFsnVW5kZXJCYXInLCBbOTVdXSwgWydVbmRlckJyYWNlJywgWzkxODNdXSwgWydVbmRlckJyYWNrZXQnLCBbOTE0MV1dLCBbJ1VuZGVyUGFyZW50aGVzaXMnLCBbOTE4MV1dLCBbJ1VuaW9uJywgWzg4OTldXSwgWydVbmlvblBsdXMnLCBbODg0Nl1dLCBbJ1VvZ29uJywgWzM3MF1dLCBbJ3VvZ29uJywgWzM3MV1dLCBbJ1VvcGYnLCBbMTIwMTQwXV0sIFsndW9wZicsIFsxMjAxNjZdXSwgWydVcEFycm93QmFyJywgWzEwNTE0XV0sIFsndXBhcnJvdycsIFs4NTkzXV0sIFsnVXBBcnJvdycsIFs4NTkzXV0sIFsnVXBhcnJvdycsIFs4NjU3XV0sIFsnVXBBcnJvd0Rvd25BcnJvdycsIFs4NjQ1XV0sIFsndXBkb3duYXJyb3cnLCBbODU5N11dLCBbJ1VwRG93bkFycm93JywgWzg1OTddXSwgWydVcGRvd25hcnJvdycsIFs4NjYxXV0sIFsnVXBFcXVpbGlicml1bScsIFsxMDYwNl1dLCBbJ3VwaGFycG9vbmxlZnQnLCBbODYzOV1dLCBbJ3VwaGFycG9vbnJpZ2h0JywgWzg2MzhdXSwgWyd1cGx1cycsIFs4ODQ2XV0sIFsnVXBwZXJMZWZ0QXJyb3cnLCBbODU5OF1dLCBbJ1VwcGVyUmlnaHRBcnJvdycsIFs4NTk5XV0sIFsndXBzaScsIFs5NjVdXSwgWydVcHNpJywgWzk3OF1dLCBbJ3Vwc2loJywgWzk3OF1dLCBbJ1Vwc2lsb24nLCBbOTMzXV0sIFsndXBzaWxvbicsIFs5NjVdXSwgWydVcFRlZUFycm93JywgWzg2MTNdXSwgWydVcFRlZScsIFs4ODY5XV0sIFsndXB1cGFycm93cycsIFs4NjQ4XV0sIFsndXJjb3JuJywgWzg5ODldXSwgWyd1cmNvcm5lcicsIFs4OTg5XV0sIFsndXJjcm9wJywgWzg5NzRdXSwgWydVcmluZycsIFszNjZdXSwgWyd1cmluZycsIFszNjddXSwgWyd1cnRyaScsIFs5NzIxXV0sIFsnVXNjcicsIFsxMTk5ODRdXSwgWyd1c2NyJywgWzEyMDAxMF1dLCBbJ3V0ZG90JywgWzg5NDRdXSwgWydVdGlsZGUnLCBbMzYwXV0sIFsndXRpbGRlJywgWzM2MV1dLCBbJ3V0cmknLCBbOTY1M11dLCBbJ3V0cmlmJywgWzk2NTJdXSwgWyd1dWFycicsIFs4NjQ4XV0sIFsnVXVtbCcsIFsyMjBdXSwgWyd1dW1sJywgWzI1Ml1dLCBbJ3V3YW5nbGUnLCBbMTA2NjNdXSwgWyd2YW5ncnQnLCBbMTA2NTJdXSwgWyd2YXJlcHNpbG9uJywgWzEwMTNdXSwgWyd2YXJrYXBwYScsIFsxMDA4XV0sIFsndmFybm90aGluZycsIFs4NzA5XV0sIFsndmFycGhpJywgWzk4MV1dLCBbJ3ZhcnBpJywgWzk4Ml1dLCBbJ3ZhcnByb3B0bycsIFs4NzMzXV0sIFsndmFycicsIFs4NTk3XV0sIFsndkFycicsIFs4NjYxXV0sIFsndmFycmhvJywgWzEwMDldXSwgWyd2YXJzaWdtYScsIFs5NjJdXSwgWyd2YXJzdWJzZXRuZXEnLCBbODg0MiwgNjUwMjRdXSwgWyd2YXJzdWJzZXRuZXFxJywgWzEwOTU1LCA2NTAyNF1dLCBbJ3ZhcnN1cHNldG5lcScsIFs4ODQzLCA2NTAyNF1dLCBbJ3ZhcnN1cHNldG5lcXEnLCBbMTA5NTYsIDY1MDI0XV0sIFsndmFydGhldGEnLCBbOTc3XV0sIFsndmFydHJpYW5nbGVsZWZ0JywgWzg4ODJdXSwgWyd2YXJ0cmlhbmdsZXJpZ2h0JywgWzg4ODNdXSwgWyd2QmFyJywgWzEwOTg0XV0sIFsnVmJhcicsIFsxMDk4N11dLCBbJ3ZCYXJ2JywgWzEwOTg1XV0sIFsnVmN5JywgWzEwNDJdXSwgWyd2Y3knLCBbMTA3NF1dLCBbJ3ZkYXNoJywgWzg4NjZdXSwgWyd2RGFzaCcsIFs4ODcyXV0sIFsnVmRhc2gnLCBbODg3M11dLCBbJ1ZEYXNoJywgWzg4NzVdXSwgWydWZGFzaGwnLCBbMTA5ODJdXSwgWyd2ZWViYXInLCBbODg5MV1dLCBbJ3ZlZScsIFs4NzQ0XV0sIFsnVmVlJywgWzg4OTddXSwgWyd2ZWVlcScsIFs4Nzk0XV0sIFsndmVsbGlwJywgWzg5NDJdXSwgWyd2ZXJiYXInLCBbMTI0XV0sIFsnVmVyYmFyJywgWzgyMTRdXSwgWyd2ZXJ0JywgWzEyNF1dLCBbJ1ZlcnQnLCBbODIxNF1dLCBbJ1ZlcnRpY2FsQmFyJywgWzg3MzldXSwgWydWZXJ0aWNhbExpbmUnLCBbMTI0XV0sIFsnVmVydGljYWxTZXBhcmF0b3InLCBbMTAwNzJdXSwgWydWZXJ0aWNhbFRpbGRlJywgWzg3NjhdXSwgWydWZXJ5VGhpblNwYWNlJywgWzgyMDJdXSwgWydWZnInLCBbMTIwMDg5XV0sIFsndmZyJywgWzEyMDExNV1dLCBbJ3ZsdHJpJywgWzg4ODJdXSwgWyd2bnN1YicsIFs4ODM0LCA4NDAyXV0sIFsndm5zdXAnLCBbODgzNSwgODQwMl1dLCBbJ1ZvcGYnLCBbMTIwMTQxXV0sIFsndm9wZicsIFsxMjAxNjddXSwgWyd2cHJvcCcsIFs4NzMzXV0sIFsndnJ0cmknLCBbODg4M11dLCBbJ1ZzY3InLCBbMTE5OTg1XV0sIFsndnNjcicsIFsxMjAwMTFdXSwgWyd2c3VibkUnLCBbMTA5NTUsIDY1MDI0XV0sIFsndnN1Ym5lJywgWzg4NDIsIDY1MDI0XV0sIFsndnN1cG5FJywgWzEwOTU2LCA2NTAyNF1dLCBbJ3ZzdXBuZScsIFs4ODQzLCA2NTAyNF1dLCBbJ1Z2ZGFzaCcsIFs4ODc0XV0sIFsndnppZ3phZycsIFsxMDY1MF1dLCBbJ1djaXJjJywgWzM3Ml1dLCBbJ3djaXJjJywgWzM3M11dLCBbJ3dlZGJhcicsIFsxMDg0N11dLCBbJ3dlZGdlJywgWzg3NDNdXSwgWydXZWRnZScsIFs4ODk2XV0sIFsnd2VkZ2VxJywgWzg3OTNdXSwgWyd3ZWllcnAnLCBbODQ3Ml1dLCBbJ1dmcicsIFsxMjAwOTBdXSwgWyd3ZnInLCBbMTIwMTE2XV0sIFsnV29wZicsIFsxMjAxNDJdXSwgWyd3b3BmJywgWzEyMDE2OF1dLCBbJ3dwJywgWzg0NzJdXSwgWyd3cicsIFs4NzY4XV0sIFsnd3JlYXRoJywgWzg3NjhdXSwgWydXc2NyJywgWzExOTk4Nl1dLCBbJ3dzY3InLCBbMTIwMDEyXV0sIFsneGNhcCcsIFs4ODk4XV0sIFsneGNpcmMnLCBbOTcxMV1dLCBbJ3hjdXAnLCBbODg5OV1dLCBbJ3hkdHJpJywgWzk2NjFdXSwgWydYZnInLCBbMTIwMDkxXV0sIFsneGZyJywgWzEyMDExN11dLCBbJ3hoYXJyJywgWzEwMjMxXV0sIFsneGhBcnInLCBbMTAyMzRdXSwgWydYaScsIFs5MjZdXSwgWyd4aScsIFs5NThdXSwgWyd4bGFycicsIFsxMDIyOV1dLCBbJ3hsQXJyJywgWzEwMjMyXV0sIFsneG1hcCcsIFsxMDIzNl1dLCBbJ3huaXMnLCBbODk1NV1dLCBbJ3hvZG90JywgWzEwNzUyXV0sIFsnWG9wZicsIFsxMjAxNDNdXSwgWyd4b3BmJywgWzEyMDE2OV1dLCBbJ3hvcGx1cycsIFsxMDc1M11dLCBbJ3hvdGltZScsIFsxMDc1NF1dLCBbJ3hyYXJyJywgWzEwMjMwXV0sIFsneHJBcnInLCBbMTAyMzNdXSwgWydYc2NyJywgWzExOTk4N11dLCBbJ3hzY3InLCBbMTIwMDEzXV0sIFsneHNxY3VwJywgWzEwNzU4XV0sIFsneHVwbHVzJywgWzEwNzU2XV0sIFsneHV0cmknLCBbOTY1MV1dLCBbJ3h2ZWUnLCBbODg5N11dLCBbJ3h3ZWRnZScsIFs4ODk2XV0sIFsnWWFjdXRlJywgWzIyMV1dLCBbJ3lhY3V0ZScsIFsyNTNdXSwgWydZQWN5JywgWzEwNzFdXSwgWyd5YWN5JywgWzExMDNdXSwgWydZY2lyYycsIFszNzRdXSwgWyd5Y2lyYycsIFszNzVdXSwgWydZY3knLCBbMTA2N11dLCBbJ3ljeScsIFsxMDk5XV0sIFsneWVuJywgWzE2NV1dLCBbJ1lmcicsIFsxMjAwOTJdXSwgWyd5ZnInLCBbMTIwMTE4XV0sIFsnWUljeScsIFsxMDMxXV0sIFsneWljeScsIFsxMTExXV0sIFsnWW9wZicsIFsxMjAxNDRdXSwgWyd5b3BmJywgWzEyMDE3MF1dLCBbJ1lzY3InLCBbMTE5OTg4XV0sIFsneXNjcicsIFsxMjAwMTRdXSwgWydZVWN5JywgWzEwNzBdXSwgWyd5dWN5JywgWzExMDJdXSwgWyd5dW1sJywgWzI1NV1dLCBbJ1l1bWwnLCBbMzc2XV0sIFsnWmFjdXRlJywgWzM3N11dLCBbJ3phY3V0ZScsIFszNzhdXSwgWydaY2Fyb24nLCBbMzgxXV0sIFsnemNhcm9uJywgWzM4Ml1dLCBbJ1pjeScsIFsxMDQ3XV0sIFsnemN5JywgWzEwNzldXSwgWydaZG90JywgWzM3OV1dLCBbJ3pkb3QnLCBbMzgwXV0sIFsnemVldHJmJywgWzg0ODhdXSwgWydaZXJvV2lkdGhTcGFjZScsIFs4MjAzXV0sIFsnWmV0YScsIFs5MThdXSwgWyd6ZXRhJywgWzk1MF1dLCBbJ3pmcicsIFsxMjAxMTldXSwgWydaZnInLCBbODQ4OF1dLCBbJ1pIY3knLCBbMTA0Nl1dLCBbJ3poY3knLCBbMTA3OF1dLCBbJ3ppZ3JhcnInLCBbODY2OV1dLCBbJ3pvcGYnLCBbMTIwMTcxXV0sIFsnWm9wZicsIFs4NDg0XV0sIFsnWnNjcicsIFsxMTk5ODldXSwgWyd6c2NyJywgWzEyMDAxNV1dLCBbJ3p3aicsIFs4MjA1XV0sIFsnenduaicsIFs4MjA0XV1dO1xuXG52YXIgYWxwaGFJbmRleCA9IHt9O1xudmFyIGNoYXJJbmRleCA9IHt9O1xuXG5jcmVhdGVJbmRleGVzKGFscGhhSW5kZXgsIGNoYXJJbmRleCk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEh0bWw1RW50aXRpZXMoKSB7fVxuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbkh0bWw1RW50aXRpZXMucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmICghc3RyIHx8ICFzdHIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mKCM/W1xcd1xcZF0rKTs/L2csIGZ1bmN0aW9uKHMsIGVudGl0eSkge1xuICAgICAgICB2YXIgY2hyO1xuICAgICAgICBpZiAoZW50aXR5LmNoYXJBdCgwKSA9PT0gXCIjXCIpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gZW50aXR5LmNoYXJBdCgxKSA9PT0gJ3gnID9cbiAgICAgICAgICAgICAgICBwYXJzZUludChlbnRpdHkuc3Vic3RyKDIpLnRvTG93ZXJDYXNlKCksIDE2KSA6XG4gICAgICAgICAgICAgICAgcGFyc2VJbnQoZW50aXR5LnN1YnN0cigxKSk7XG5cbiAgICAgICAgICAgIGlmICghKGlzTmFOKGNvZGUpIHx8IGNvZGUgPCAtMzI3NjggfHwgY29kZSA+IDY1NTM1KSkge1xuICAgICAgICAgICAgICAgIGNociA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaHIgPSBhbHBoYUluZGV4W2VudGl0eV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNociB8fCBzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG4gSHRtbDVFbnRpdGllcy5kZWNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gbmV3IEh0bWw1RW50aXRpZXMoKS5kZWNvZGUoc3RyKTtcbiB9O1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbkh0bWw1RW50aXRpZXMucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmICghc3RyIHx8ICFzdHIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgdmFyIHN0ckxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHN0ckxlbmd0aCkge1xuICAgICAgICB2YXIgY2hhckluZm8gPSBjaGFySW5kZXhbc3RyLmNoYXJDb2RlQXQoaSldO1xuICAgICAgICBpZiAoY2hhckluZm8pIHtcbiAgICAgICAgICAgIHZhciBhbHBoYSA9IGNoYXJJbmZvW3N0ci5jaGFyQ29kZUF0KGkgKyAxKV07XG4gICAgICAgICAgICBpZiAoYWxwaGEpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFscGhhID0gY2hhckluZm9bJyddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFscGhhKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiJlwiICsgYWxwaGEgKyBcIjtcIjtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IHN0ci5jaGFyQXQoaSk7XG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuIEh0bWw1RW50aXRpZXMuZW5jb2RlID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBIdG1sNUVudGl0aWVzKCkuZW5jb2RlKHN0cik7XG4gfTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNUVudGl0aWVzLnByb3RvdHlwZS5lbmNvZGVOb25VVEYgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoIXN0ciB8fCAhc3RyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHZhciBzdHJMZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBzdHJMZW5ndGgpIHtcbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgdmFyIGNoYXJJbmZvID0gY2hhckluZGV4W2NdO1xuICAgICAgICBpZiAoY2hhckluZm8pIHtcbiAgICAgICAgICAgIHZhciBhbHBoYSA9IGNoYXJJbmZvW3N0ci5jaGFyQ29kZUF0KGkgKyAxKV07XG4gICAgICAgICAgICBpZiAoYWxwaGEpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFscGhhID0gY2hhckluZm9bJyddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFscGhhKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiJlwiICsgYWxwaGEgKyBcIjtcIjtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPCAzMiB8fCBjID4gMTI2KSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJyYjJyArIGMgKyAnOyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3RyLmNoYXJBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbiBIdG1sNUVudGl0aWVzLmVuY29kZU5vblVURiA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBuZXcgSHRtbDVFbnRpdGllcygpLmVuY29kZU5vblVURihzdHIpO1xuIH07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuSHRtbDVFbnRpdGllcy5wcm90b3R5cGUuZW5jb2RlTm9uQVNDSUkgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoIXN0ciB8fCAhc3RyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHZhciBzdHJMZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBzdHJMZW5ndGgpIHtcbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPD0gMjU1KSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3RyW2krK107XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gJyYjJyArIGMgKyAnOyc7XG4gICAgICAgIGkrK1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG4gSHRtbDVFbnRpdGllcy5lbmNvZGVOb25BU0NJSSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBuZXcgSHRtbDVFbnRpdGllcygpLmVuY29kZU5vbkFTQ0lJKHN0cik7XG4gfTtcblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gYWxwaGFJbmRleCBQYXNzZWQgYnkgcmVmZXJlbmNlLlxuICogQHBhcmFtIHtPYmplY3R9IGNoYXJJbmRleCBQYXNzZWQgYnkgcmVmZXJlbmNlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVJbmRleGVzKGFscGhhSW5kZXgsIGNoYXJJbmRleCkge1xuICAgIHZhciBpID0gRU5USVRJRVMubGVuZ3RoO1xuICAgIHZhciBfcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIGUgPSBFTlRJVElFU1tpXTtcbiAgICAgICAgdmFyIGFscGhhID0gZVswXTtcbiAgICAgICAgdmFyIGNoYXJzID0gZVsxXTtcbiAgICAgICAgdmFyIGNociA9IGNoYXJzWzBdO1xuICAgICAgICB2YXIgYWRkQ2hhciA9IChjaHIgPCAzMiB8fCBjaHIgPiAxMjYpIHx8IGNociA9PT0gNjIgfHwgY2hyID09PSA2MCB8fCBjaHIgPT09IDM4IHx8IGNociA9PT0gMzQgfHwgY2hyID09PSAzOTtcbiAgICAgICAgdmFyIGNoYXJJbmZvO1xuICAgICAgICBpZiAoYWRkQ2hhcikge1xuICAgICAgICAgICAgY2hhckluZm8gPSBjaGFySW5kZXhbY2hyXSA9IGNoYXJJbmRleFtjaHJdIHx8IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFyc1sxXSkge1xuICAgICAgICAgICAgdmFyIGNocjIgPSBjaGFyc1sxXTtcbiAgICAgICAgICAgIGFscGhhSW5kZXhbYWxwaGFdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjaHIpICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaHIyKTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goYWRkQ2hhciAmJiAoY2hhckluZm9bY2hyMl0gPSBhbHBoYSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxwaGFJbmRleFthbHBoYV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNocik7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGFkZENoYXIgJiYgKGNoYXJJbmZvWycnXSA9IGFscGhhKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbDVFbnRpdGllcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2h0bWwtZW50aXRpZXMvbGliL2h0bWw1LWVudGl0aWVzLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG52YXIgaGV4VGFibGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICAgICAgYXJyYXkucHVzaCgnJScgKyAoKGkgPCAxNiA/ICcwJyA6ICcnKSArIGkudG9TdHJpbmcoMTYpKS50b1VwcGVyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXk7XG59KCkpO1xuXG52YXIgY29tcGFjdFF1ZXVlID0gZnVuY3Rpb24gY29tcGFjdFF1ZXVlKHF1ZXVlKSB7XG4gICAgdmFyIG9iajtcblxuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBxdWV1ZS5wb3AoKTtcbiAgICAgICAgb2JqID0gaXRlbS5vYmpbaXRlbS5wcm9wXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB2YXIgY29tcGFjdGVkID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpbal0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3RlZC5wdXNoKG9ialtqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpdGVtLm9ialtpdGVtLnByb3BdID0gY29tcGFjdGVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydHMuYXJyYXlUb09iamVjdCA9IGZ1bmN0aW9uIGFycmF5VG9PYmplY3Qoc291cmNlLCBvcHRpb25zKSB7XG4gICAgdmFyIG9iaiA9IG9wdGlvbnMgJiYgb3B0aW9ucy5wbGFpbk9iamVjdHMgPyBPYmplY3QuY3JlYXRlKG51bGwpIDoge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2VbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBvYmpbaV0gPSBzb3VyY2VbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKHRhcmdldCwgc291cmNlLCBvcHRpb25zKSB7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xuICAgICAgICAgICAgdGFyZ2V0LnB1c2goc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGxhaW5PYmplY3RzIHx8IG9wdGlvbnMuYWxsb3dQcm90b3R5cGVzIHx8ICFoYXMuY2FsbChPYmplY3QucHJvdG90eXBlLCBzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W3NvdXJjZV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFt0YXJnZXQsIHNvdXJjZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gW3RhcmdldF0uY29uY2F0KHNvdXJjZSk7XG4gICAgfVxuXG4gICAgdmFyIG1lcmdlVGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkgJiYgIUFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICBtZXJnZVRhcmdldCA9IGV4cG9ydHMuYXJyYXlUb09iamVjdCh0YXJnZXQsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkgJiYgQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICAgIHNvdXJjZS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgICAgICBpZiAoaGFzLmNhbGwodGFyZ2V0LCBpKSkge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRbaV0gJiYgdHlwZW9mIHRhcmdldFtpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2ldID0gZXhwb3J0cy5tZXJnZSh0YXJnZXRbaV0sIGl0ZW0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2ldID0gaXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNvdXJjZSkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBzb3VyY2Vba2V5XTtcblxuICAgICAgICBpZiAoaGFzLmNhbGwoYWNjLCBrZXkpKSB7XG4gICAgICAgICAgICBhY2Nba2V5XSA9IGV4cG9ydHMubWVyZ2UoYWNjW2tleV0sIHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjY1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBtZXJnZVRhcmdldCk7XG59O1xuXG5leHBvcnRzLmFzc2lnbiA9IGZ1bmN0aW9uIGFzc2lnblNpbmdsZVNvdXJjZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzb3VyY2UpLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBrZXkpIHtcbiAgICAgICAgYWNjW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB0YXJnZXQpO1xufTtcblxuZXhwb3J0cy5kZWNvZGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG59O1xuXG5leHBvcnRzLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShzdHIpIHtcbiAgICAvLyBUaGlzIGNvZGUgd2FzIG9yaWdpbmFsbHkgd3JpdHRlbiBieSBCcmlhbiBXaGl0ZSAobXNjZGV4KSBmb3IgdGhlIGlvLmpzIGNvcmUgcXVlcnlzdHJpbmcgbGlicmFyeS5cbiAgICAvLyBJdCBoYXMgYmVlbiBhZGFwdGVkIGhlcmUgZm9yIHN0cmljdGVyIGFkaGVyZW5jZSB0byBSRkMgMzk4NlxuICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuXG4gICAgdmFyIHN0cmluZyA9IHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnID8gc3RyIDogU3RyaW5nKHN0cik7XG5cbiAgICB2YXIgb3V0ID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGMgPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBjID09PSAweDJEIC8vIC1cbiAgICAgICAgICAgIHx8IGMgPT09IDB4MkUgLy8gLlxuICAgICAgICAgICAgfHwgYyA9PT0gMHg1RiAvLyBfXG4gICAgICAgICAgICB8fCBjID09PSAweDdFIC8vIH5cbiAgICAgICAgICAgIHx8IChjID49IDB4MzAgJiYgYyA8PSAweDM5KSAvLyAwLTlcbiAgICAgICAgICAgIHx8IChjID49IDB4NDEgJiYgYyA8PSAweDVBKSAvLyBhLXpcbiAgICAgICAgICAgIHx8IChjID49IDB4NjEgJiYgYyA8PSAweDdBKSAvLyBBLVpcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBvdXQgKz0gc3RyaW5nLmNoYXJBdChpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGMgPCAweDgwKSB7XG4gICAgICAgICAgICBvdXQgPSBvdXQgKyBoZXhUYWJsZVtjXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGMgPCAweDgwMCkge1xuICAgICAgICAgICAgb3V0ID0gb3V0ICsgKGhleFRhYmxlWzB4QzAgfCAoYyA+PiA2KV0gKyBoZXhUYWJsZVsweDgwIHwgKGMgJiAweDNGKV0pO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYyA8IDB4RDgwMCB8fCBjID49IDB4RTAwMCkge1xuICAgICAgICAgICAgb3V0ID0gb3V0ICsgKGhleFRhYmxlWzB4RTAgfCAoYyA+PiAxMildICsgaGV4VGFibGVbMHg4MCB8ICgoYyA+PiA2KSAmIDB4M0YpXSArIGhleFRhYmxlWzB4ODAgfCAoYyAmIDB4M0YpXSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGkgKz0gMTtcbiAgICAgICAgYyA9IDB4MTAwMDAgKyAoKChjICYgMHgzRkYpIDw8IDEwKSB8IChzdHJpbmcuY2hhckNvZGVBdChpKSAmIDB4M0ZGKSk7XG4gICAgICAgIG91dCArPSBoZXhUYWJsZVsweEYwIHwgKGMgPj4gMTgpXVxuICAgICAgICAgICAgKyBoZXhUYWJsZVsweDgwIHwgKChjID4+IDEyKSAmIDB4M0YpXVxuICAgICAgICAgICAgKyBoZXhUYWJsZVsweDgwIHwgKChjID4+IDYpICYgMHgzRildXG4gICAgICAgICAgICArIGhleFRhYmxlWzB4ODAgfCAoYyAmIDB4M0YpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuZXhwb3J0cy5jb21wYWN0ID0gZnVuY3Rpb24gY29tcGFjdCh2YWx1ZSkge1xuICAgIHZhciBxdWV1ZSA9IFt7IG9iajogeyBvOiB2YWx1ZSB9LCBwcm9wOiAnbycgfV07XG4gICAgdmFyIHJlZnMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBxdWV1ZVtpXTtcbiAgICAgICAgdmFyIG9iaiA9IGl0ZW0ub2JqW2l0ZW0ucHJvcF07XG5cbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2pdO1xuICAgICAgICAgICAgdmFyIHZhbCA9IG9ialtrZXldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIHZhbCAhPT0gbnVsbCAmJiByZWZzLmluZGV4T2YodmFsKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHsgb2JqOiBvYmosIHByb3A6IGtleSB9KTtcbiAgICAgICAgICAgICAgICByZWZzLnB1c2godmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb21wYWN0UXVldWUocXVldWUpO1xufTtcblxuZXhwb3J0cy5pc1JlZ0V4cCA9IGZ1bmN0aW9uIGlzUmVnRXhwKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59O1xuXG5leHBvcnRzLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIob2JqKSB7XG4gICAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhKG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iaikpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3FzL2xpYi91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVwbGFjZSA9IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZTtcbnZhciBwZXJjZW50VHdlbnRpZXMgPSAvJTIwL2c7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgICdkZWZhdWx0JzogJ1JGQzM5ODYnLFxuICAgIGZvcm1hdHRlcnM6IHtcbiAgICAgICAgUkZDMTczODogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwbGFjZS5jYWxsKHZhbHVlLCBwZXJjZW50VHdlbnRpZXMsICcrJyk7XG4gICAgICAgIH0sXG4gICAgICAgIFJGQzM5ODY6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBSRkMxNzM4OiAnUkZDMTczOCcsXG4gICAgUkZDMzk4NjogJ1JGQzM5ODYnXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvcXMvbGliL2Zvcm1hdHMuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBWdWUgZnJvbSAndnVlJztcblxuLy8gdG9kbzog5a6M5oiQ5YWE5byf57uE5Lu25LmL6Ze055qE6YCa5L+hXG5leHBvcnQgZGVmYXVsdCBuZXcgVnVlKCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdW5pdHMvY29yZS9FdmVudEJ1cy5qcyIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LTMwZWE4Yjc1XFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL1N1Y2Nlc3MudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9TdWNjZXNzLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMzBlYThiNzVcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL1N1Y2Nlc3MudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LTMwZWE4Yjc1XCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy92aWV3cy92dWVfcGFnZXMvU3VjY2Vzcy52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTMwZWE4Yjc1XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMzBlYThiNzVcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy92aWV3cy92dWVfcGFnZXMvU3VjY2Vzcy52dWVcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWVkMGUyYTkyXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0NvdXBvbkdpZnQudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9Db3Vwb25HaWZ0LnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtZWQwZTJhOTJcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0NvdXBvbkdpZnQudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LWVkMGUyYTkyXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy9tb2R1bGVzL0NvdXBvbkdpZnQudnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi1lZDBlMmE5MlwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LWVkMGUyYTkyXCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbW9kdWxlcy9Db3Vwb25HaWZ0LnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtNmVlYWQ5ZDdcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vQ291cG9uT3JkZXIudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9Db3Vwb25PcmRlci52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTZlZWFkOWQ3XFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9Db3Vwb25PcmRlci52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtNmVlYWQ5ZDdcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvQ291cG9uT3JkZXIudnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi02ZWVhZDlkN1wiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LTZlZWFkOWQ3XCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbW9kdWxlcy9Db3Vwb25PcmRlci52dWVcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gKF9fd2VicGFja19yZXF1aXJlX18oNykpKDEzKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBkZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvdnVleC9kaXN0L3Z1ZXguZXNtLmpzIGZyb20gZGxsLXJlZmVyZW5jZSBidW5kbGVfbGlicmFyeVxuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY29uc3QgaG90Q2xpZW50ID0gcmVxdWlyZSggJ3dlYnBhY2staG90LW1pZGRsZXdhcmUvY2xpZW50JyApO1xuXG5ob3RDbGllbnQuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gIGlmICggZXZlbnQuYWN0aW9uID09PSAncmVsb2FkJyApIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gIH1cbn0gKTtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vd2VicGFjay9tb2R1bGVzL2NsaWVudC5qcyIsIi8qZXNsaW50LWVudiBicm93c2VyKi9cbi8qZ2xvYmFsIF9fcmVzb3VyY2VRdWVyeSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyovXG5cbnZhciBvcHRpb25zID0ge1xuICBwYXRoOiBcIi9fX3dlYnBhY2tfaG1yXCIsXG4gIHRpbWVvdXQ6IDIwICogMTAwMCxcbiAgb3ZlcmxheTogdHJ1ZSxcbiAgcmVsb2FkOiBmYWxzZSxcbiAgbG9nOiB0cnVlLFxuICB3YXJuOiB0cnVlLFxuICBuYW1lOiAnJyxcbiAgYXV0b0Nvbm5lY3Q6IHRydWVcbn07XG5pZiAoX19yZXNvdXJjZVF1ZXJ5KSB7XG4gIHZhciBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG4gIHZhciBvdmVycmlkZXMgPSBxdWVyeXN0cmluZy5wYXJzZShfX3Jlc291cmNlUXVlcnkuc2xpY2UoMSkpO1xuICBzZXRPdmVycmlkZXMob3ZlcnJpZGVzKTtcbn1cblxuaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIGRvIG5vdGhpbmdcbn0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5FdmVudFNvdXJjZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgY29uc29sZS53YXJuKFxuICAgIFwid2VicGFjay1ob3QtbWlkZGxld2FyZSdzIGNsaWVudCByZXF1aXJlcyBFdmVudFNvdXJjZSB0byB3b3JrLiBcIiArXG4gICAgXCJZb3Ugc2hvdWxkIGluY2x1ZGUgYSBwb2x5ZmlsbCBpZiB5b3Ugd2FudCB0byBzdXBwb3J0IHRoaXMgYnJvd3NlcjogXCIgK1xuICAgIFwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1NlcnZlci1zZW50X2V2ZW50cyNUb29sc1wiXG4gICk7XG59IGVsc2Uge1xuICBpZiAob3B0aW9ucy5hdXRvQ29ubmVjdCkge1xuICAgIGNvbm5lY3QoKTtcbiAgfVxufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gc2V0T3B0aW9uc0FuZENvbm5lY3Qob3ZlcnJpZGVzKSB7XG4gIHNldE92ZXJyaWRlcyhvdmVycmlkZXMpO1xuICBjb25uZWN0KCk7XG59XG5cbmZ1bmN0aW9uIHNldE92ZXJyaWRlcyhvdmVycmlkZXMpIHtcbiAgaWYgKG92ZXJyaWRlcy5hdXRvQ29ubmVjdCkgb3B0aW9ucy5hdXRvQ29ubmVjdCA9IG92ZXJyaWRlcy5hdXRvQ29ubmVjdCA9PSAndHJ1ZSc7XG4gIGlmIChvdmVycmlkZXMucGF0aCkgb3B0aW9ucy5wYXRoID0gb3ZlcnJpZGVzLnBhdGg7XG4gIGlmIChvdmVycmlkZXMudGltZW91dCkgb3B0aW9ucy50aW1lb3V0ID0gb3ZlcnJpZGVzLnRpbWVvdXQ7XG4gIGlmIChvdmVycmlkZXMub3ZlcmxheSkgb3B0aW9ucy5vdmVybGF5ID0gb3ZlcnJpZGVzLm92ZXJsYXkgIT09ICdmYWxzZSc7XG4gIGlmIChvdmVycmlkZXMucmVsb2FkKSBvcHRpb25zLnJlbG9hZCA9IG92ZXJyaWRlcy5yZWxvYWQgIT09ICdmYWxzZSc7XG4gIGlmIChvdmVycmlkZXMubm9JbmZvICYmIG92ZXJyaWRlcy5ub0luZm8gIT09ICdmYWxzZScpIHtcbiAgICBvcHRpb25zLmxvZyA9IGZhbHNlO1xuICB9XG4gIGlmIChvdmVycmlkZXMubmFtZSkge1xuICAgIG9wdGlvbnMubmFtZSA9IG92ZXJyaWRlcy5uYW1lO1xuICB9XG4gIGlmIChvdmVycmlkZXMucXVpZXQgJiYgb3ZlcnJpZGVzLnF1aWV0ICE9PSAnZmFsc2UnKSB7XG4gICAgb3B0aW9ucy5sb2cgPSBmYWxzZTtcbiAgICBvcHRpb25zLndhcm4gPSBmYWxzZTtcbiAgfVxuXG4gIGlmIChvdmVycmlkZXMuZHluYW1pY1B1YmxpY1BhdGgpIHtcbiAgICBvcHRpb25zLnBhdGggPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIG9wdGlvbnMucGF0aDtcbiAgfVxufVxuXG5mdW5jdGlvbiBFdmVudFNvdXJjZVdyYXBwZXIoKSB7XG4gIHZhciBzb3VyY2U7XG4gIHZhciBsYXN0QWN0aXZpdHkgPSBuZXcgRGF0ZSgpO1xuICB2YXIgbGlzdGVuZXJzID0gW107XG5cbiAgaW5pdCgpO1xuICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBpZiAoKG5ldyBEYXRlKCkgLSBsYXN0QWN0aXZpdHkpID4gb3B0aW9ucy50aW1lb3V0KSB7XG4gICAgICBoYW5kbGVEaXNjb25uZWN0KCk7XG4gICAgfVxuICB9LCBvcHRpb25zLnRpbWVvdXQgLyAyKTtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIHNvdXJjZSA9IG5ldyB3aW5kb3cuRXZlbnRTb3VyY2Uob3B0aW9ucy5wYXRoKTtcbiAgICBzb3VyY2Uub25vcGVuID0gaGFuZGxlT25saW5lO1xuICAgIHNvdXJjZS5vbmVycm9yID0gaGFuZGxlRGlzY29ubmVjdDtcbiAgICBzb3VyY2Uub25tZXNzYWdlID0gaGFuZGxlTWVzc2FnZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU9ubGluZSgpIHtcbiAgICBpZiAob3B0aW9ucy5sb2cpIGNvbnNvbGUubG9nKFwiW0hNUl0gY29ubmVjdGVkXCIpO1xuICAgIGxhc3RBY3Rpdml0eSA9IG5ldyBEYXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGV2ZW50KSB7XG4gICAgbGFzdEFjdGl2aXR5ID0gbmV3IERhdGUoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVEaXNjb25uZWN0KCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgIHNvdXJjZS5jbG9zZSgpO1xuICAgIHNldFRpbWVvdXQoaW5pdCwgb3B0aW9ucy50aW1lb3V0KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYWRkTWVzc2FnZUxpc3RlbmVyOiBmdW5jdGlvbihmbikge1xuICAgICAgbGlzdGVuZXJzLnB1c2goZm4pO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRTb3VyY2VXcmFwcGVyKCkge1xuICBpZiAoIXdpbmRvdy5fX3dobUV2ZW50U291cmNlV3JhcHBlcikge1xuICAgIHdpbmRvdy5fX3dobUV2ZW50U291cmNlV3JhcHBlciA9IHt9O1xuICB9XG4gIGlmICghd2luZG93Ll9fd2htRXZlbnRTb3VyY2VXcmFwcGVyW29wdGlvbnMucGF0aF0pIHtcbiAgICAvLyBjYWNoZSB0aGUgd3JhcHBlciBmb3Igb3RoZXIgZW50cmllcyBsb2FkZWQgb25cbiAgICAvLyB0aGUgc2FtZSBwYWdlIHdpdGggdGhlIHNhbWUgb3B0aW9ucy5wYXRoXG4gICAgd2luZG93Ll9fd2htRXZlbnRTb3VyY2VXcmFwcGVyW29wdGlvbnMucGF0aF0gPSBFdmVudFNvdXJjZVdyYXBwZXIoKTtcbiAgfVxuICByZXR1cm4gd2luZG93Ll9fd2htRXZlbnRTb3VyY2VXcmFwcGVyW29wdGlvbnMucGF0aF07XG59XG5cbmZ1bmN0aW9uIGNvbm5lY3QoKSB7XG4gIGdldEV2ZW50U291cmNlV3JhcHBlcigpLmFkZE1lc3NhZ2VMaXN0ZW5lcihoYW5kbGVNZXNzYWdlKTtcblxuICBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEgPT0gXCJcXHVEODNEXFx1REM5M1wiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBwcm9jZXNzTWVzc2FnZShKU09OLnBhcnNlKGV2ZW50LmRhdGEpKTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKG9wdGlvbnMud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJJbnZhbGlkIEhNUiBtZXNzYWdlOiBcIiArIGV2ZW50LmRhdGEgKyBcIlxcblwiICsgZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyB0aGUgcmVwb3J0ZXIgbmVlZHMgdG8gYmUgYSBzaW5nbGV0b24gb24gdGhlIHBhZ2Vcbi8vIGluIGNhc2UgdGhlIGNsaWVudCBpcyBiZWluZyB1c2VkIGJ5IG11bHRpcGxlIGJ1bmRsZXNcbi8vIHdlIG9ubHkgd2FudCB0byByZXBvcnQgb25jZS5cbi8vIGFsbCB0aGUgZXJyb3JzIHdpbGwgZ28gdG8gYWxsIGNsaWVudHNcbnZhciBzaW5nbGV0b25LZXkgPSAnX193ZWJwYWNrX2hvdF9taWRkbGV3YXJlX3JlcG9ydGVyX18nO1xudmFyIHJlcG9ydGVyO1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIGlmICghd2luZG93W3NpbmdsZXRvbktleV0pIHtcbiAgICB3aW5kb3dbc2luZ2xldG9uS2V5XSA9IGNyZWF0ZVJlcG9ydGVyKCk7XG4gIH1cbiAgcmVwb3J0ZXIgPSB3aW5kb3dbc2luZ2xldG9uS2V5XTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVwb3J0ZXIoKSB7XG4gIHZhciBzdHJpcCA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcblxuICB2YXIgb3ZlcmxheTtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgb3B0aW9ucy5vdmVybGF5KSB7XG4gICAgb3ZlcmxheSA9IHJlcXVpcmUoJy4vY2xpZW50LW92ZXJsYXknKTtcbiAgfVxuXG4gIHZhciBzdHlsZXMgPSB7XG4gICAgZXJyb3JzOiBcImNvbG9yOiAjZmYwMDAwO1wiLFxuICAgIHdhcm5pbmdzOiBcImNvbG9yOiAjOTk5OTMzO1wiXG4gIH07XG4gIHZhciBwcmV2aW91c1Byb2JsZW1zID0gbnVsbDtcbiAgZnVuY3Rpb24gbG9nKHR5cGUsIG9iaikge1xuICAgIHZhciBuZXdQcm9ibGVtcyA9IG9ialt0eXBlXS5tYXAoZnVuY3Rpb24obXNnKSB7IHJldHVybiBzdHJpcChtc2cpOyB9KS5qb2luKCdcXG4nKTtcbiAgICBpZiAocHJldmlvdXNQcm9ibGVtcyA9PSBuZXdQcm9ibGVtcykge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2aW91c1Byb2JsZW1zID0gbmV3UHJvYmxlbXM7XG4gICAgfVxuXG4gICAgdmFyIHN0eWxlID0gc3R5bGVzW3R5cGVdO1xuICAgIHZhciBuYW1lID0gb2JqLm5hbWUgPyBcIidcIiArIG9iai5uYW1lICsgXCInIFwiIDogXCJcIjtcbiAgICB2YXIgdGl0bGUgPSBcIltITVJdIGJ1bmRsZSBcIiArIG5hbWUgKyBcImhhcyBcIiArIG9ialt0eXBlXS5sZW5ndGggKyBcIiBcIiArIHR5cGU7XG4gICAgLy8gTk9URTogY29uc29sZS53YXJuIG9yIGNvbnNvbGUuZXJyb3Igd2lsbCBwcmludCB0aGUgc3RhY2sgdHJhY2VcbiAgICAvLyB3aGljaCBpc24ndCBoZWxwZnVsIGhlcmUsIHNvIHVzaW5nIGNvbnNvbGUubG9nIHRvIGVzY2FwZSBpdC5cbiAgICBpZiAoY29uc29sZS5ncm91cCAmJiBjb25zb2xlLmdyb3VwRW5kKSB7XG4gICAgICBjb25zb2xlLmdyb3VwKFwiJWNcIiArIHRpdGxlLCBzdHlsZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIiVjXCIgKyBuZXdQcm9ibGVtcywgc3R5bGUpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgXCIlY1wiICsgdGl0bGUgKyBcIlxcblxcdCVjXCIgKyBuZXdQcm9ibGVtcy5yZXBsYWNlKC9cXG4vZywgXCJcXG5cXHRcIiksXG4gICAgICAgIHN0eWxlICsgXCJmb250LXdlaWdodDogYm9sZDtcIixcbiAgICAgICAgc3R5bGUgKyBcImZvbnQtd2VpZ2h0OiBub3JtYWw7XCJcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGVhblByb2JsZW1zQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHByZXZpb3VzUHJvYmxlbXMgPSBudWxsO1xuICAgIH0sXG4gICAgcHJvYmxlbXM6IGZ1bmN0aW9uKHR5cGUsIG9iaikge1xuICAgICAgaWYgKG9wdGlvbnMud2Fybikge1xuICAgICAgICBsb2codHlwZSwgb2JqKTtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGF5ICYmIHR5cGUgIT09ICd3YXJuaW5ncycpIG92ZXJsYXkuc2hvd1Byb2JsZW1zKHR5cGUsIG9ialt0eXBlXSk7XG4gICAgfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChvdmVybGF5KSBvdmVybGF5LmNsZWFyKCk7XG4gICAgfSxcbiAgICB1c2VDdXN0b21PdmVybGF5OiBmdW5jdGlvbihjdXN0b21PdmVybGF5KSB7XG4gICAgICBvdmVybGF5ID0gY3VzdG9tT3ZlcmxheTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBwcm9jZXNzVXBkYXRlID0gcmVxdWlyZSgnLi9wcm9jZXNzLXVwZGF0ZScpO1xuXG52YXIgY3VzdG9tSGFuZGxlcjtcbnZhciBzdWJzY3JpYmVBbGxIYW5kbGVyO1xuZnVuY3Rpb24gcHJvY2Vzc01lc3NhZ2Uob2JqKSB7XG4gIHN3aXRjaChvYmouYWN0aW9uKSB7XG4gICAgY2FzZSBcImJ1aWxkaW5nXCI6XG4gICAgICBpZiAob3B0aW9ucy5sb2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJbSE1SXSBidW5kbGUgXCIgKyAob2JqLm5hbWUgPyBcIidcIiArIG9iai5uYW1lICsgXCInIFwiIDogXCJcIikgK1xuICAgICAgICAgIFwicmVidWlsZGluZ1wiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYnVpbHRcIjpcbiAgICAgIGlmIChvcHRpb25zLmxvZykge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcIltITVJdIGJ1bmRsZSBcIiArIChvYmoubmFtZSA/IFwiJ1wiICsgb2JqLm5hbWUgKyBcIicgXCIgOiBcIlwiKSArXG4gICAgICAgICAgXCJyZWJ1aWx0IGluIFwiICsgb2JqLnRpbWUgKyBcIm1zXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgIGNhc2UgXCJzeW5jXCI6XG4gICAgICBpZiAob2JqLm5hbWUgJiYgb3B0aW9ucy5uYW1lICYmIG9iai5uYW1lICE9PSBvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKG9iai5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAocmVwb3J0ZXIpIHJlcG9ydGVyLnByb2JsZW1zKCdlcnJvcnMnLCBvYmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlcG9ydGVyKSB7XG4gICAgICAgICAgaWYgKG9iai53YXJuaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXBvcnRlci5wcm9ibGVtcygnd2FybmluZ3MnLCBvYmopO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBvcnRlci5jbGVhblByb2JsZW1zQ2FjaGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVwb3J0ZXIuc3VjY2VzcygpO1xuICAgICAgICB9XG4gICAgICAgIHByb2Nlc3NVcGRhdGUob2JqLmhhc2gsIG9iai5tb2R1bGVzLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoY3VzdG9tSGFuZGxlcikge1xuICAgICAgICBjdXN0b21IYW5kbGVyKG9iaik7XG4gICAgICB9XG4gIH1cblxuICBpZiAoc3Vic2NyaWJlQWxsSGFuZGxlcikge1xuICAgIHN1YnNjcmliZUFsbEhhbmRsZXIob2JqKTtcbiAgfVxufVxuXG5pZiAobW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIHN1YnNjcmliZUFsbDogZnVuY3Rpb24gc3Vic2NyaWJlQWxsKGhhbmRsZXIpIHtcbiAgICAgIHN1YnNjcmliZUFsbEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIH0sXG4gICAgc3Vic2NyaWJlOiBmdW5jdGlvbiBzdWJzY3JpYmUoaGFuZGxlcikge1xuICAgICAgY3VzdG9tSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfSxcbiAgICB1c2VDdXN0b21PdmVybGF5OiBmdW5jdGlvbiB1c2VDdXN0b21PdmVybGF5KGN1c3RvbU92ZXJsYXkpIHtcbiAgICAgIGlmIChyZXBvcnRlcikgcmVwb3J0ZXIudXNlQ3VzdG9tT3ZlcmxheShjdXN0b21PdmVybGF5KTtcbiAgICB9LFxuICAgIHNldE9wdGlvbnNBbmRDb25uZWN0OiBzZXRPcHRpb25zQW5kQ29ubmVjdFxuICB9O1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spLWhvdC1taWRkbGV3YXJlL2NsaWVudC5qc1xuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAoX193ZWJwYWNrX3JlcXVpcmVfXyg3KSkoMzcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGRlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy93ZWJwYWNrL2J1aWxkaW4vbW9kdWxlLmpzIGZyb20gZGxsLXJlZmVyZW5jZSBidW5kbGVfbGlicmFyeVxuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFuc2lSZWdleCA9IHJlcXVpcmUoJ2Fuc2ktcmVnZXgnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIpIHtcblx0cmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnID8gc3RyLnJlcGxhY2UoYW5zaVJlZ2V4LCAnJykgOiBzdHI7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvc3RyaXAtYW5zaS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiAvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1QUlpjZi1ucXJ5PT48XS9nO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Fuc2ktcmVnZXgvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qZXNsaW50LWVudiBicm93c2VyKi9cblxudmFyIGNsaWVudE92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmNsaWVudE92ZXJsYXkuaWQgPSAnd2VicGFjay1ob3QtbWlkZGxld2FyZS1jbGllbnRPdmVybGF5JztcbnZhciBzdHlsZXMgPSB7XG4gIGJhY2tncm91bmQ6ICdyZ2JhKDAsMCwwLDAuODUpJyxcbiAgY29sb3I6ICcjRThFOEU4JyxcbiAgbGluZUhlaWdodDogJzEuMicsXG4gIHdoaXRlU3BhY2U6ICdwcmUnLFxuICBmb250RmFtaWx5OiAnTWVubG8sIENvbnNvbGFzLCBtb25vc3BhY2UnLFxuICBmb250U2l6ZTogJzEzcHgnLFxuICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgekluZGV4OiA5OTk5LFxuICBwYWRkaW5nOiAnMTBweCcsXG4gIGxlZnQ6IDAsXG4gIHJpZ2h0OiAwLFxuICB0b3A6IDAsXG4gIGJvdHRvbTogMCxcbiAgb3ZlcmZsb3c6ICdhdXRvJyxcbiAgZGlyOiAnbHRyJyxcbiAgdGV4dEFsaWduOiAnbGVmdCdcbn07XG5mb3IgKHZhciBrZXkgaW4gc3R5bGVzKSB7XG4gIGNsaWVudE92ZXJsYXkuc3R5bGVba2V5XSA9IHN0eWxlc1trZXldO1xufVxuXG52YXIgYW5zaUhUTUwgPSByZXF1aXJlKCdhbnNpLWh0bWwnKTtcbnZhciBjb2xvcnMgPSB7XG4gIHJlc2V0OiBbJ3RyYW5zcGFyZW50JywgJ3RyYW5zcGFyZW50J10sXG4gIGJsYWNrOiAnMTgxODE4JyxcbiAgcmVkOiAnRTM2MDQ5JyxcbiAgZ3JlZW46ICdCM0NCNzQnLFxuICB5ZWxsb3c6ICdGRkQwODAnLFxuICBibHVlOiAnN0NBRkMyJyxcbiAgbWFnZW50YTogJzdGQUNDQScsXG4gIGN5YW46ICdDM0MyRUYnLFxuICBsaWdodGdyZXk6ICdFQkU3RTMnLFxuICBkYXJrZ3JleTogJzZENzg5MSdcbn07XG5hbnNpSFRNTC5zZXRDb2xvcnMoY29sb3JzKTtcblxudmFyIEVudGl0aWVzID0gcmVxdWlyZSgnaHRtbC1lbnRpdGllcycpLkFsbEh0bWxFbnRpdGllcztcbnZhciBlbnRpdGllcyA9IG5ldyBFbnRpdGllcygpO1xuXG5leHBvcnRzLnNob3dQcm9ibGVtcyA9XG5mdW5jdGlvbiBzaG93UHJvYmxlbXModHlwZSwgbGluZXMpIHtcbiAgY2xpZW50T3ZlcmxheS5pbm5lckhUTUwgPSAnJztcbiAgbGluZXMuZm9yRWFjaChmdW5jdGlvbihtc2cpIHtcbiAgICBtc2cgPSBhbnNpSFRNTChlbnRpdGllcy5lbmNvZGUobXNnKSk7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMjZweCc7XG4gICAgZGl2LmlubmVySFRNTCA9IHByb2JsZW1UeXBlKHR5cGUpICsgJyBpbiAnICsgbXNnO1xuICAgIGNsaWVudE92ZXJsYXkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgfSk7XG4gIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjbGllbnRPdmVybGF5KTtcbiAgfVxufTtcblxuZXhwb3J0cy5jbGVhciA9XG5mdW5jdGlvbiBjbGVhcigpIHtcbiAgaWYgKGRvY3VtZW50LmJvZHkgJiYgY2xpZW50T3ZlcmxheS5wYXJlbnROb2RlKSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChjbGllbnRPdmVybGF5KTtcbiAgfVxufTtcblxudmFyIHByb2JsZW1Db2xvcnMgPSB7XG4gIGVycm9yczogY29sb3JzLnJlZCxcbiAgd2FybmluZ3M6IGNvbG9ycy55ZWxsb3dcbn07XG5cbmZ1bmN0aW9uIHByb2JsZW1UeXBlICh0eXBlKSB7XG4gIHZhciBjb2xvciA9IHByb2JsZW1Db2xvcnNbdHlwZV0gfHwgY29sb3JzLnJlZDtcbiAgcmV0dXJuIChcbiAgICAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiMnICsgY29sb3IgKyAnOyBjb2xvcjojZmZmOyBwYWRkaW5nOjJweCA0cHg7IGJvcmRlci1yYWRpdXM6IDJweFwiPicgK1xuICAgICAgdHlwZS5zbGljZSgwLCAtMSkudG9VcHBlckNhc2UoKSArXG4gICAgJzwvc3Bhbj4nXG4gICk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjayktaG90LW1pZGRsZXdhcmUvY2xpZW50LW92ZXJsYXkuanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuc2lIVE1MXG5cbi8vIFJlZmVyZW5jZSB0byBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2Fuc2ktcmVnZXhcbnZhciBfcmVnQU5TSSA9IC8oPzooPzpcXHUwMDFiXFxbKXxcXHUwMDliKSg/Oig/OlswLTldezEsM30pPyg/Oig/OjtbMC05XXswLDN9KSopP1tBLU18Zi1tXSl8XFx1MDAxYltBLU1dL1xuXG52YXIgX2RlZkNvbG9ycyA9IHtcbiAgcmVzZXQ6IFsnZmZmJywgJzAwMCddLCAvLyBbRk9SRUdST1VEX0NPTE9SLCBCQUNLR1JPVU5EX0NPTE9SXVxuICBibGFjazogJzAwMCcsXG4gIHJlZDogJ2ZmMDAwMCcsXG4gIGdyZWVuOiAnMjA5ODA1JyxcbiAgeWVsbG93OiAnZThiZjAzJyxcbiAgYmx1ZTogJzAwMDBmZicsXG4gIG1hZ2VudGE6ICdmZjAwZmYnLFxuICBjeWFuOiAnMDBmZmVlJyxcbiAgbGlnaHRncmV5OiAnZjBmMGYwJyxcbiAgZGFya2dyZXk6ICc4ODgnXG59XG52YXIgX3N0eWxlcyA9IHtcbiAgMzA6ICdibGFjaycsXG4gIDMxOiAncmVkJyxcbiAgMzI6ICdncmVlbicsXG4gIDMzOiAneWVsbG93JyxcbiAgMzQ6ICdibHVlJyxcbiAgMzU6ICdtYWdlbnRhJyxcbiAgMzY6ICdjeWFuJyxcbiAgMzc6ICdsaWdodGdyZXknXG59XG52YXIgX29wZW5UYWdzID0ge1xuICAnMSc6ICdmb250LXdlaWdodDpib2xkJywgLy8gYm9sZFxuICAnMic6ICdvcGFjaXR5OjAuNScsIC8vIGRpbVxuICAnMyc6ICc8aT4nLCAvLyBpdGFsaWNcbiAgJzQnOiAnPHU+JywgLy8gdW5kZXJzY29yZVxuICAnOCc6ICdkaXNwbGF5Om5vbmUnLCAvLyBoaWRkZW5cbiAgJzknOiAnPGRlbD4nIC8vIGRlbGV0ZVxufVxudmFyIF9jbG9zZVRhZ3MgPSB7XG4gICcyMyc6ICc8L2k+JywgLy8gcmVzZXQgaXRhbGljXG4gICcyNCc6ICc8L3U+JywgLy8gcmVzZXQgdW5kZXJzY29yZVxuICAnMjknOiAnPC9kZWw+JyAvLyByZXNldCBkZWxldGVcbn1cblxuO1swLCAyMSwgMjIsIDI3LCAyOCwgMzksIDQ5XS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG4gIF9jbG9zZVRhZ3Nbbl0gPSAnPC9zcGFuPidcbn0pXG5cbi8qKlxuICogQ29udmVydHMgdGV4dCB3aXRoIEFOU0kgY29sb3IgY29kZXMgdG8gSFRNTCBtYXJrdXAuXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dFxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGFuc2lIVE1MICh0ZXh0KSB7XG4gIC8vIFJldHVybnMgdGhlIHRleHQgaWYgdGhlIHN0cmluZyBoYXMgbm8gQU5TSSBlc2NhcGUgY29kZS5cbiAgaWYgKCFfcmVnQU5TSS50ZXN0KHRleHQpKSB7XG4gICAgcmV0dXJuIHRleHRcbiAgfVxuXG4gIC8vIENhY2hlIG9wZW5lZCBzZXF1ZW5jZS5cbiAgdmFyIGFuc2lDb2RlcyA9IFtdXG4gIC8vIFJlcGxhY2Ugd2l0aCBtYXJrdXAuXG4gIHZhciByZXQgPSB0ZXh0LnJlcGxhY2UoL1xcMDMzXFxbKFxcZCspKm0vZywgZnVuY3Rpb24gKG1hdGNoLCBzZXEpIHtcbiAgICB2YXIgb3QgPSBfb3BlblRhZ3Nbc2VxXVxuICAgIGlmIChvdCkge1xuICAgICAgLy8gSWYgY3VycmVudCBzZXF1ZW5jZSBoYXMgYmVlbiBvcGVuZWQsIGNsb3NlIGl0LlxuICAgICAgaWYgKCEhfmFuc2lDb2Rlcy5pbmRleE9mKHNlcSkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1leHRyYS1ib29sZWFuLWNhc3RcbiAgICAgICAgYW5zaUNvZGVzLnBvcCgpXG4gICAgICAgIHJldHVybiAnPC9zcGFuPidcbiAgICAgIH1cbiAgICAgIC8vIE9wZW4gdGFnLlxuICAgICAgYW5zaUNvZGVzLnB1c2goc2VxKVxuICAgICAgcmV0dXJuIG90WzBdID09PSAnPCcgPyBvdCA6ICc8c3BhbiBzdHlsZT1cIicgKyBvdCArICc7XCI+J1xuICAgIH1cblxuICAgIHZhciBjdCA9IF9jbG9zZVRhZ3Nbc2VxXVxuICAgIGlmIChjdCkge1xuICAgICAgLy8gUG9wIHNlcXVlbmNlXG4gICAgICBhbnNpQ29kZXMucG9wKClcbiAgICAgIHJldHVybiBjdFxuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfSlcblxuICAvLyBNYWtlIHN1cmUgdGFncyBhcmUgY2xvc2VkLlxuICB2YXIgbCA9IGFuc2lDb2Rlcy5sZW5ndGhcbiAgOyhsID4gMCkgJiYgKHJldCArPSBBcnJheShsICsgMSkuam9pbignPC9zcGFuPicpKVxuXG4gIHJldHVybiByZXRcbn1cblxuLyoqXG4gKiBDdXN0b21pemUgY29sb3JzLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbG9ycyByZWZlcmVuY2UgdG8gX2RlZkNvbG9yc1xuICovXG5hbnNpSFRNTC5zZXRDb2xvcnMgPSBmdW5jdGlvbiAoY29sb3JzKSB7XG4gIGlmICh0eXBlb2YgY29sb3JzICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcignYGNvbG9yc2AgcGFyYW1ldGVyIG11c3QgYmUgYW4gT2JqZWN0LicpXG4gIH1cblxuICB2YXIgX2ZpbmFsQ29sb3JzID0ge31cbiAgZm9yICh2YXIga2V5IGluIF9kZWZDb2xvcnMpIHtcbiAgICB2YXIgaGV4ID0gY29sb3JzLmhhc093blByb3BlcnR5KGtleSkgPyBjb2xvcnNba2V5XSA6IG51bGxcbiAgICBpZiAoIWhleCkge1xuICAgICAgX2ZpbmFsQ29sb3JzW2tleV0gPSBfZGVmQ29sb3JzW2tleV1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmICgncmVzZXQnID09PSBrZXkpIHtcbiAgICAgIGlmICh0eXBlb2YgaGV4ID09PSAnc3RyaW5nJykge1xuICAgICAgICBoZXggPSBbaGV4XVxuICAgICAgfVxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhleCkgfHwgaGV4Lmxlbmd0aCA9PT0gMCB8fCBoZXguc29tZShmdW5jdGlvbiAoaCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGggIT09ICdzdHJpbmcnXG4gICAgICB9KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSB2YWx1ZSBvZiBgJyArIGtleSArICdgIHByb3BlcnR5IG11c3QgYmUgYW4gQXJyYXkgYW5kIGVhY2ggaXRlbSBjb3VsZCBvbmx5IGJlIGEgaGV4IHN0cmluZywgZS5nLjogRkYwMDAwJylcbiAgICAgIH1cbiAgICAgIHZhciBkZWZIZXhDb2xvciA9IF9kZWZDb2xvcnNba2V5XVxuICAgICAgaWYgKCFoZXhbMF0pIHtcbiAgICAgICAgaGV4WzBdID0gZGVmSGV4Q29sb3JbMF1cbiAgICAgIH1cbiAgICAgIGlmIChoZXgubGVuZ3RoID09PSAxIHx8ICFoZXhbMV0pIHtcbiAgICAgICAgaGV4ID0gW2hleFswXV1cbiAgICAgICAgaGV4LnB1c2goZGVmSGV4Q29sb3JbMV0pXG4gICAgICB9XG5cbiAgICAgIGhleCA9IGhleC5zbGljZSgwLCAyKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHZhbHVlIG9mIGAnICsga2V5ICsgJ2AgcHJvcGVydHkgbXVzdCBiZSBhIGhleCBzdHJpbmcsIGUuZy46IEZGMDAwMCcpXG4gICAgfVxuICAgIF9maW5hbENvbG9yc1trZXldID0gaGV4XG4gIH1cbiAgX3NldFRhZ3MoX2ZpbmFsQ29sb3JzKVxufVxuXG4vKipcbiAqIFJlc2V0IGNvbG9ycy5cbiAqL1xuYW5zaUhUTUwucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gIF9zZXRUYWdzKF9kZWZDb2xvcnMpXG59XG5cbi8qKlxuICogRXhwb3NlIHRhZ3MsIGluY2x1ZGluZyBvcGVuIGFuZCBjbG9zZS5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmFuc2lIVE1MLnRhZ3MgPSB7fVxuXG5pZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhbnNpSFRNTC50YWdzLCAnb3BlbicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9vcGVuVGFncyB9XG4gIH0pXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhbnNpSFRNTC50YWdzLCAnY2xvc2UnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfY2xvc2VUYWdzIH1cbiAgfSlcbn0gZWxzZSB7XG4gIGFuc2lIVE1MLnRhZ3Mub3BlbiA9IF9vcGVuVGFnc1xuICBhbnNpSFRNTC50YWdzLmNsb3NlID0gX2Nsb3NlVGFnc1xufVxuXG5mdW5jdGlvbiBfc2V0VGFncyAoY29sb3JzKSB7XG4gIC8vIHJlc2V0IGFsbFxuICBfb3BlblRhZ3NbJzAnXSA9ICdmb250LXdlaWdodDpub3JtYWw7b3BhY2l0eToxO2NvbG9yOiMnICsgY29sb3JzLnJlc2V0WzBdICsgJztiYWNrZ3JvdW5kOiMnICsgY29sb3JzLnJlc2V0WzFdXG4gIC8vIGludmVyc2VcbiAgX29wZW5UYWdzWyc3J10gPSAnY29sb3I6IycgKyBjb2xvcnMucmVzZXRbMV0gKyAnO2JhY2tncm91bmQ6IycgKyBjb2xvcnMucmVzZXRbMF1cbiAgLy8gZGFyayBncmV5XG4gIF9vcGVuVGFnc1snOTAnXSA9ICdjb2xvcjojJyArIGNvbG9ycy5kYXJrZ3JleVxuXG4gIGZvciAodmFyIGNvZGUgaW4gX3N0eWxlcykge1xuICAgIHZhciBjb2xvciA9IF9zdHlsZXNbY29kZV1cbiAgICB2YXIgb3JpQ29sb3IgPSBjb2xvcnNbY29sb3JdIHx8ICcwMDAnXG4gICAgX29wZW5UYWdzW2NvZGVdID0gJ2NvbG9yOiMnICsgb3JpQ29sb3JcbiAgICBjb2RlID0gcGFyc2VJbnQoY29kZSlcbiAgICBfb3BlblRhZ3NbKGNvZGUgKyAxMCkudG9TdHJpbmcoKV0gPSAnYmFja2dyb3VuZDojJyArIG9yaUNvbG9yXG4gIH1cbn1cblxuYW5zaUhUTUwucmVzZXQoKVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvYW5zaS1odG1sL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgWG1sRW50aXRpZXM6IHJlcXVpcmUoJy4vbGliL3htbC1lbnRpdGllcy5qcycpLFxuICBIdG1sNEVudGl0aWVzOiByZXF1aXJlKCcuL2xpYi9odG1sNC1lbnRpdGllcy5qcycpLFxuICBIdG1sNUVudGl0aWVzOiByZXF1aXJlKCcuL2xpYi9odG1sNS1lbnRpdGllcy5qcycpLFxuICBBbGxIdG1sRW50aXRpZXM6IHJlcXVpcmUoJy4vbGliL2h0bWw1LWVudGl0aWVzLmpzJylcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9odG1sLWVudGl0aWVzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgQUxQSEFfSU5ERVggPSB7XG4gICAgJyZsdCc6ICc8JyxcbiAgICAnJmd0JzogJz4nLFxuICAgICcmcXVvdCc6ICdcIicsXG4gICAgJyZhcG9zJzogJ1xcJycsXG4gICAgJyZhbXAnOiAnJicsXG4gICAgJyZsdDsnOiAnPCcsXG4gICAgJyZndDsnOiAnPicsXG4gICAgJyZxdW90Oyc6ICdcIicsXG4gICAgJyZhcG9zOyc6ICdcXCcnLFxuICAgICcmYW1wOyc6ICcmJ1xufTtcblxudmFyIENIQVJfSU5ERVggPSB7XG4gICAgNjA6ICdsdCcsXG4gICAgNjI6ICdndCcsXG4gICAgMzQ6ICdxdW90JyxcbiAgICAzOTogJ2Fwb3MnLFxuICAgIDM4OiAnYW1wJ1xufTtcblxudmFyIENIQVJfU19JTkRFWCA9IHtcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAnXFwnJzogJyZhcG9zOycsXG4gICAgJyYnOiAnJmFtcDsnXG59O1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBYbWxFbnRpdGllcygpIHt9XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuWG1sRW50aXRpZXMucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmICghc3RyIHx8ICFzdHIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC88fD58XCJ8J3wmL2csIGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIENIQVJfU19JTkRFWFtzXTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuIFhtbEVudGl0aWVzLmVuY29kZSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBuZXcgWG1sRW50aXRpZXMoKS5lbmNvZGUoc3RyKTtcbiB9O1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cblhtbEVudGl0aWVzLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoIXN0ciB8fCAhc3RyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJiM/WzAtOWEtekEtWl0rOz8vZywgZnVuY3Rpb24ocykge1xuICAgICAgICBpZiAocy5jaGFyQXQoMSkgPT09ICcjJykge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzLmNoYXJBdCgyKS50b0xvd2VyQ2FzZSgpID09PSAneCcgP1xuICAgICAgICAgICAgICAgIHBhcnNlSW50KHMuc3Vic3RyKDMpLCAxNikgOlxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHMuc3Vic3RyKDIpKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGNvZGUpIHx8IGNvZGUgPCAtMzI3NjggfHwgY29kZSA+IDY1NTM1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFMUEhBX0lOREVYW3NdIHx8IHM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbiBYbWxFbnRpdGllcy5kZWNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gbmV3IFhtbEVudGl0aWVzKCkuZGVjb2RlKHN0cik7XG4gfTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5YbWxFbnRpdGllcy5wcm90b3R5cGUuZW5jb2RlTm9uVVRGID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgaWYgKCFzdHIgfHwgIXN0ci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICB2YXIgc3RyTGVuZ3RoID0gc3RyLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgc3RyTGVuZ3RoKSB7XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHZhciBhbHBoYSA9IENIQVJfSU5ERVhbY107XG4gICAgICAgIGlmIChhbHBoYSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiJlwiICsgYWxwaGEgKyBcIjtcIjtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjIDwgMzIgfHwgYyA+IDEyNikge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICcmIycgKyBjICsgJzsnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ci5jaGFyQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG4gWG1sRW50aXRpZXMuZW5jb2RlTm9uVVRGID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBYbWxFbnRpdGllcygpLmVuY29kZU5vblVURihzdHIpO1xuIH07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuWG1sRW50aXRpZXMucHJvdG90eXBlLmVuY29kZU5vbkFTQ0lJID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgaWYgKCFzdHIgfHwgIXN0ci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICB2YXIgc3RyTGVuZ2h0ID0gc3RyLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgc3RyTGVuZ2h0KSB7XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDw9IDI1NSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0cltpKytdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9ICcmIycgKyBjICsgJzsnO1xuICAgICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbiBYbWxFbnRpdGllcy5lbmNvZGVOb25BU0NJSSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBuZXcgWG1sRW50aXRpZXMoKS5lbmNvZGVOb25BU0NJSShzdHIpO1xuIH07XG5cbm1vZHVsZS5leHBvcnRzID0gWG1sRW50aXRpZXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9odG1sLWVudGl0aWVzL2xpYi94bWwtZW50aXRpZXMuanNcbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBIVE1MX0FMUEhBID0gWydhcG9zJywgJ25ic3AnLCAnaWV4Y2wnLCAnY2VudCcsICdwb3VuZCcsICdjdXJyZW4nLCAneWVuJywgJ2JydmJhcicsICdzZWN0JywgJ3VtbCcsICdjb3B5JywgJ29yZGYnLCAnbGFxdW8nLCAnbm90JywgJ3NoeScsICdyZWcnLCAnbWFjcicsICdkZWcnLCAncGx1c21uJywgJ3N1cDInLCAnc3VwMycsICdhY3V0ZScsICdtaWNybycsICdwYXJhJywgJ21pZGRvdCcsICdjZWRpbCcsICdzdXAxJywgJ29yZG0nLCAncmFxdW8nLCAnZnJhYzE0JywgJ2ZyYWMxMicsICdmcmFjMzQnLCAnaXF1ZXN0JywgJ0FncmF2ZScsICdBYWN1dGUnLCAnQWNpcmMnLCAnQXRpbGRlJywgJ0F1bWwnLCAnQXJpbmcnLCAnQWVsaWcnLCAnQ2NlZGlsJywgJ0VncmF2ZScsICdFYWN1dGUnLCAnRWNpcmMnLCAnRXVtbCcsICdJZ3JhdmUnLCAnSWFjdXRlJywgJ0ljaXJjJywgJ0l1bWwnLCAnRVRIJywgJ050aWxkZScsICdPZ3JhdmUnLCAnT2FjdXRlJywgJ09jaXJjJywgJ090aWxkZScsICdPdW1sJywgJ3RpbWVzJywgJ09zbGFzaCcsICdVZ3JhdmUnLCAnVWFjdXRlJywgJ1VjaXJjJywgJ1V1bWwnLCAnWWFjdXRlJywgJ1RIT1JOJywgJ3N6bGlnJywgJ2FncmF2ZScsICdhYWN1dGUnLCAnYWNpcmMnLCAnYXRpbGRlJywgJ2F1bWwnLCAnYXJpbmcnLCAnYWVsaWcnLCAnY2NlZGlsJywgJ2VncmF2ZScsICdlYWN1dGUnLCAnZWNpcmMnLCAnZXVtbCcsICdpZ3JhdmUnLCAnaWFjdXRlJywgJ2ljaXJjJywgJ2l1bWwnLCAnZXRoJywgJ250aWxkZScsICdvZ3JhdmUnLCAnb2FjdXRlJywgJ29jaXJjJywgJ290aWxkZScsICdvdW1sJywgJ2RpdmlkZScsICdvc2xhc2gnLCAndWdyYXZlJywgJ3VhY3V0ZScsICd1Y2lyYycsICd1dW1sJywgJ3lhY3V0ZScsICd0aG9ybicsICd5dW1sJywgJ3F1b3QnLCAnYW1wJywgJ2x0JywgJ2d0JywgJ09FbGlnJywgJ29lbGlnJywgJ1NjYXJvbicsICdzY2Fyb24nLCAnWXVtbCcsICdjaXJjJywgJ3RpbGRlJywgJ2Vuc3AnLCAnZW1zcCcsICd0aGluc3AnLCAnenduaicsICd6d2onLCAnbHJtJywgJ3JsbScsICduZGFzaCcsICdtZGFzaCcsICdsc3F1bycsICdyc3F1bycsICdzYnF1bycsICdsZHF1bycsICdyZHF1bycsICdiZHF1bycsICdkYWdnZXInLCAnRGFnZ2VyJywgJ3Blcm1pbCcsICdsc2FxdW8nLCAncnNhcXVvJywgJ2V1cm8nLCAnZm5vZicsICdBbHBoYScsICdCZXRhJywgJ0dhbW1hJywgJ0RlbHRhJywgJ0Vwc2lsb24nLCAnWmV0YScsICdFdGEnLCAnVGhldGEnLCAnSW90YScsICdLYXBwYScsICdMYW1iZGEnLCAnTXUnLCAnTnUnLCAnWGknLCAnT21pY3JvbicsICdQaScsICdSaG8nLCAnU2lnbWEnLCAnVGF1JywgJ1Vwc2lsb24nLCAnUGhpJywgJ0NoaScsICdQc2knLCAnT21lZ2EnLCAnYWxwaGEnLCAnYmV0YScsICdnYW1tYScsICdkZWx0YScsICdlcHNpbG9uJywgJ3pldGEnLCAnZXRhJywgJ3RoZXRhJywgJ2lvdGEnLCAna2FwcGEnLCAnbGFtYmRhJywgJ211JywgJ251JywgJ3hpJywgJ29taWNyb24nLCAncGknLCAncmhvJywgJ3NpZ21hZicsICdzaWdtYScsICd0YXUnLCAndXBzaWxvbicsICdwaGknLCAnY2hpJywgJ3BzaScsICdvbWVnYScsICd0aGV0YXN5bScsICd1cHNpaCcsICdwaXYnLCAnYnVsbCcsICdoZWxsaXAnLCAncHJpbWUnLCAnUHJpbWUnLCAnb2xpbmUnLCAnZnJhc2wnLCAnd2VpZXJwJywgJ2ltYWdlJywgJ3JlYWwnLCAndHJhZGUnLCAnYWxlZnN5bScsICdsYXJyJywgJ3VhcnInLCAncmFycicsICdkYXJyJywgJ2hhcnInLCAnY3JhcnInLCAnbEFycicsICd1QXJyJywgJ3JBcnInLCAnZEFycicsICdoQXJyJywgJ2ZvcmFsbCcsICdwYXJ0JywgJ2V4aXN0JywgJ2VtcHR5JywgJ25hYmxhJywgJ2lzaW4nLCAnbm90aW4nLCAnbmknLCAncHJvZCcsICdzdW0nLCAnbWludXMnLCAnbG93YXN0JywgJ3JhZGljJywgJ3Byb3AnLCAnaW5maW4nLCAnYW5nJywgJ2FuZCcsICdvcicsICdjYXAnLCAnY3VwJywgJ2ludCcsICd0aGVyZTQnLCAnc2ltJywgJ2NvbmcnLCAnYXN5bXAnLCAnbmUnLCAnZXF1aXYnLCAnbGUnLCAnZ2UnLCAnc3ViJywgJ3N1cCcsICduc3ViJywgJ3N1YmUnLCAnc3VwZScsICdvcGx1cycsICdvdGltZXMnLCAncGVycCcsICdzZG90JywgJ2xjZWlsJywgJ3JjZWlsJywgJ2xmbG9vcicsICdyZmxvb3InLCAnbGFuZycsICdyYW5nJywgJ2xveicsICdzcGFkZXMnLCAnY2x1YnMnLCAnaGVhcnRzJywgJ2RpYW1zJ107XG52YXIgSFRNTF9DT0RFUyA9IFszOSwgMTYwLCAxNjEsIDE2MiwgMTYzLCAxNjQsIDE2NSwgMTY2LCAxNjcsIDE2OCwgMTY5LCAxNzAsIDE3MSwgMTcyLCAxNzMsIDE3NCwgMTc1LCAxNzYsIDE3NywgMTc4LCAxNzksIDE4MCwgMTgxLCAxODIsIDE4MywgMTg0LCAxODUsIDE4NiwgMTg3LCAxODgsIDE4OSwgMTkwLCAxOTEsIDE5MiwgMTkzLCAxOTQsIDE5NSwgMTk2LCAxOTcsIDE5OCwgMTk5LCAyMDAsIDIwMSwgMjAyLCAyMDMsIDIwNCwgMjA1LCAyMDYsIDIwNywgMjA4LCAyMDksIDIxMCwgMjExLCAyMTIsIDIxMywgMjE0LCAyMTUsIDIxNiwgMjE3LCAyMTgsIDIxOSwgMjIwLCAyMjEsIDIyMiwgMjIzLCAyMjQsIDIyNSwgMjI2LCAyMjcsIDIyOCwgMjI5LCAyMzAsIDIzMSwgMjMyLCAyMzMsIDIzNCwgMjM1LCAyMzYsIDIzNywgMjM4LCAyMzksIDI0MCwgMjQxLCAyNDIsIDI0MywgMjQ0LCAyNDUsIDI0NiwgMjQ3LCAyNDgsIDI0OSwgMjUwLCAyNTEsIDI1MiwgMjUzLCAyNTQsIDI1NSwgMzQsIDM4LCA2MCwgNjIsIDMzOCwgMzM5LCAzNTIsIDM1MywgMzc2LCA3MTAsIDczMiwgODE5NCwgODE5NSwgODIwMSwgODIwNCwgODIwNSwgODIwNiwgODIwNywgODIxMSwgODIxMiwgODIxNiwgODIxNywgODIxOCwgODIyMCwgODIyMSwgODIyMiwgODIyNCwgODIyNSwgODI0MCwgODI0OSwgODI1MCwgODM2NCwgNDAyLCA5MTMsIDkxNCwgOTE1LCA5MTYsIDkxNywgOTE4LCA5MTksIDkyMCwgOTIxLCA5MjIsIDkyMywgOTI0LCA5MjUsIDkyNiwgOTI3LCA5MjgsIDkyOSwgOTMxLCA5MzIsIDkzMywgOTM0LCA5MzUsIDkzNiwgOTM3LCA5NDUsIDk0NiwgOTQ3LCA5NDgsIDk0OSwgOTUwLCA5NTEsIDk1MiwgOTUzLCA5NTQsIDk1NSwgOTU2LCA5NTcsIDk1OCwgOTU5LCA5NjAsIDk2MSwgOTYyLCA5NjMsIDk2NCwgOTY1LCA5NjYsIDk2NywgOTY4LCA5NjksIDk3NywgOTc4LCA5ODIsIDgyMjYsIDgyMzAsIDgyNDIsIDgyNDMsIDgyNTQsIDgyNjAsIDg0NzIsIDg0NjUsIDg0NzYsIDg0ODIsIDg1MDEsIDg1OTIsIDg1OTMsIDg1OTQsIDg1OTUsIDg1OTYsIDg2MjksIDg2NTYsIDg2NTcsIDg2NTgsIDg2NTksIDg2NjAsIDg3MDQsIDg3MDYsIDg3MDcsIDg3MDksIDg3MTEsIDg3MTIsIDg3MTMsIDg3MTUsIDg3MTksIDg3MjEsIDg3MjIsIDg3MjcsIDg3MzAsIDg3MzMsIDg3MzQsIDg3MzYsIDg3NDMsIDg3NDQsIDg3NDUsIDg3NDYsIDg3NDcsIDg3NTYsIDg3NjQsIDg3NzMsIDg3NzYsIDg4MDAsIDg4MDEsIDg4MDQsIDg4MDUsIDg4MzQsIDg4MzUsIDg4MzYsIDg4MzgsIDg4MzksIDg4NTMsIDg4NTUsIDg4NjksIDg5MDEsIDg5NjgsIDg5NjksIDg5NzAsIDg5NzEsIDkwMDEsIDkwMDIsIDk2NzQsIDk4MjQsIDk4MjcsIDk4MjksIDk4MzBdO1xuXG52YXIgYWxwaGFJbmRleCA9IHt9O1xudmFyIG51bUluZGV4ID0ge307XG5cbnZhciBpID0gMDtcbnZhciBsZW5ndGggPSBIVE1MX0FMUEhBLmxlbmd0aDtcbndoaWxlIChpIDwgbGVuZ3RoKSB7XG4gICAgdmFyIGEgPSBIVE1MX0FMUEhBW2ldO1xuICAgIHZhciBjID0gSFRNTF9DT0RFU1tpXTtcbiAgICBhbHBoYUluZGV4W2FdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICBudW1JbmRleFtjXSA9IGE7XG4gICAgaSsrO1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBIdG1sNEVudGl0aWVzKCkge31cblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNEVudGl0aWVzLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoIXN0ciB8fCAhc3RyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJigjP1tcXHdcXGRdKyk7Py9nLCBmdW5jdGlvbihzLCBlbnRpdHkpIHtcbiAgICAgICAgdmFyIGNocjtcbiAgICAgICAgaWYgKGVudGl0eS5jaGFyQXQoMCkgPT09IFwiI1wiKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IGVudGl0eS5jaGFyQXQoMSkudG9Mb3dlckNhc2UoKSA9PT0gJ3gnID9cbiAgICAgICAgICAgICAgICBwYXJzZUludChlbnRpdHkuc3Vic3RyKDIpLCAxNikgOlxuICAgICAgICAgICAgICAgIHBhcnNlSW50KGVudGl0eS5zdWJzdHIoMSkpO1xuXG4gICAgICAgICAgICBpZiAoIShpc05hTihjb2RlKSB8fCBjb2RlIDwgLTMyNzY4IHx8IGNvZGUgPiA2NTUzNSkpIHtcbiAgICAgICAgICAgICAgICBjaHIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hyID0gYWxwaGFJbmRleFtlbnRpdHldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaHIgfHwgcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuSHRtbDRFbnRpdGllcy5kZWNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gbmV3IEh0bWw0RW50aXRpZXMoKS5kZWNvZGUoc3RyKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuSHRtbDRFbnRpdGllcy5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgaWYgKCFzdHIgfHwgIXN0ci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICB2YXIgc3RyTGVuZ3RoID0gc3RyLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgc3RyTGVuZ3RoKSB7XG4gICAgICAgIHZhciBhbHBoYSA9IG51bUluZGV4W3N0ci5jaGFyQ29kZUF0KGkpXTtcbiAgICAgICAgcmVzdWx0ICs9IGFscGhhID8gXCImXCIgKyBhbHBoYSArIFwiO1wiIDogc3RyLmNoYXJBdChpKTtcbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNEVudGl0aWVzLmVuY29kZSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBuZXcgSHRtbDRFbnRpdGllcygpLmVuY29kZShzdHIpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNEVudGl0aWVzLnByb3RvdHlwZS5lbmNvZGVOb25VVEYgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoIXN0ciB8fCAhc3RyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHZhciBzdHJMZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBzdHJMZW5ndGgpIHtcbiAgICAgICAgdmFyIGNjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHZhciBhbHBoYSA9IG51bUluZGV4W2NjXTtcbiAgICAgICAgaWYgKGFscGhhKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gXCImXCIgKyBhbHBoYSArIFwiO1wiO1xuICAgICAgICB9IGVsc2UgaWYgKGNjIDwgMzIgfHwgY2MgPiAxMjYpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiYjXCIgKyBjYyArIFwiO1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ci5jaGFyQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNEVudGl0aWVzLmVuY29kZU5vblVURiA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBuZXcgSHRtbDRFbnRpdGllcygpLmVuY29kZU5vblVURihzdHIpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNEVudGl0aWVzLnByb3RvdHlwZS5lbmNvZGVOb25BU0NJSSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmICghc3RyIHx8ICFzdHIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgdmFyIHN0ckxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHN0ckxlbmd0aCkge1xuICAgICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoYyA8PSAyNTUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBzdHJbaSsrXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSAnJiMnICsgYyArICc7JztcbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5IdG1sNEVudGl0aWVzLmVuY29kZU5vbkFTQ0lJID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBIdG1sNEVudGl0aWVzKCkuZW5jb2RlTm9uQVNDSUkoc3RyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbDRFbnRpdGllcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2h0bWwtZW50aXRpZXMvbGliL2h0bWw0LWVudGl0aWVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEJhc2VkIGhlYXZpbHkgb24gaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svd2VicGFjay9ibG9iL1xuICogIGMwYWZkZjljNmFiYzFkZDcwNzA3YzU5NGU0NzM4MDJhNTY2ZjdiNmUvaG90L29ubHktZGV2LXNlcnZlci5qc1xuICogT3JpZ2luYWwgY29weXJpZ2h0IFRvYmlhcyBLb3BwZXJzIEBzb2tyYSAoTUlUIGxpY2Vuc2UpXG4gKi9cblxuLyogZ2xvYmFsIHdpbmRvdyBfX3dlYnBhY2tfaGFzaF9fICovXG5cbmlmICghbW9kdWxlLmhvdCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJbSE1SXSBIb3QgTW9kdWxlIFJlcGxhY2VtZW50IGlzIGRpc2FibGVkLlwiKTtcbn1cblxudmFyIGhtckRvY3NVcmwgPSBcImh0dHBzOi8vd2VicGFjay5qcy5vcmcvY29uY2VwdHMvaG90LW1vZHVsZS1yZXBsYWNlbWVudC9cIjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBtYXgtbGVuXG5cbnZhciBsYXN0SGFzaDtcbnZhciBmYWlsdXJlU3RhdHVzZXMgPSB7IGFib3J0OiAxLCBmYWlsOiAxIH07XG52YXIgYXBwbHlPcHRpb25zID0geyBcdFx0XHRcdFxuICBpZ25vcmVVbmFjY2VwdGVkOiB0cnVlLFxuICBpZ25vcmVEZWNsaW5lZDogdHJ1ZSxcbiAgaWdub3JlRXJyb3JlZDogdHJ1ZSxcbiAgb25VbmFjY2VwdGVkOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgY29uc29sZS53YXJuKFwiSWdub3JlZCBhbiB1cGRhdGUgdG8gdW5hY2NlcHRlZCBtb2R1bGUgXCIgKyBkYXRhLmNoYWluLmpvaW4oXCIgLT4gXCIpKTtcbiAgfSxcbiAgb25EZWNsaW5lZDogZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUud2FybihcIklnbm9yZWQgYW4gdXBkYXRlIHRvIGRlY2xpbmVkIG1vZHVsZSBcIiArIGRhdGEuY2hhaW4uam9pbihcIiAtPiBcIikpO1xuICB9LFxuICBvbkVycm9yZWQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjb25zb2xlLmVycm9yKGRhdGEuZXJyb3IpO1xuICAgIGNvbnNvbGUud2FybihcIklnbm9yZWQgYW4gZXJyb3Igd2hpbGUgdXBkYXRpbmcgbW9kdWxlIFwiICsgZGF0YS5tb2R1bGVJZCArIFwiIChcIiArIGRhdGEudHlwZSArIFwiKVwiKTtcbiAgfSBcbn1cblxuZnVuY3Rpb24gdXBUb0RhdGUoaGFzaCkge1xuICBpZiAoaGFzaCkgbGFzdEhhc2ggPSBoYXNoO1xuICByZXR1cm4gbGFzdEhhc2ggPT0gX193ZWJwYWNrX2hhc2hfXztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihoYXNoLCBtb2R1bGVNYXAsIG9wdGlvbnMpIHtcbiAgdmFyIHJlbG9hZCA9IG9wdGlvbnMucmVsb2FkO1xuICBpZiAoIXVwVG9EYXRlKGhhc2gpICYmIG1vZHVsZS5ob3Quc3RhdHVzKCkgPT0gXCJpZGxlXCIpIHtcbiAgICBpZiAob3B0aW9ucy5sb2cpIGNvbnNvbGUubG9nKFwiW0hNUl0gQ2hlY2tpbmcgZm9yIHVwZGF0ZXMgb24gdGhlIHNlcnZlci4uLlwiKTtcbiAgICBjaGVjaygpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2soKSB7XG4gICAgdmFyIGNiID0gZnVuY3Rpb24oZXJyLCB1cGRhdGVkTW9kdWxlcykge1xuICAgICAgaWYgKGVycikgcmV0dXJuIGhhbmRsZUVycm9yKGVycik7XG5cbiAgICAgIGlmKCF1cGRhdGVkTW9kdWxlcykge1xuICAgICAgICBpZiAob3B0aW9ucy53YXJuKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiW0hNUl0gQ2Fubm90IGZpbmQgdXBkYXRlIChGdWxsIHJlbG9hZCBuZWVkZWQpXCIpO1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIltITVJdIChQcm9iYWJseSBiZWNhdXNlIG9mIHJlc3RhcnRpbmcgdGhlIHNlcnZlcilcIik7XG4gICAgICAgIH1cbiAgICAgICAgcGVyZm9ybVJlbG9hZCgpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIGFwcGx5Q2FsbGJhY2sgPSBmdW5jdGlvbihhcHBseUVyciwgcmVuZXdlZE1vZHVsZXMpIHtcbiAgICAgICAgaWYgKGFwcGx5RXJyKSByZXR1cm4gaGFuZGxlRXJyb3IoYXBwbHlFcnIpO1xuXG4gICAgICAgIGlmICghdXBUb0RhdGUoKSkgY2hlY2soKTtcblxuICAgICAgICBsb2dVcGRhdGVzKHVwZGF0ZWRNb2R1bGVzLCByZW5ld2VkTW9kdWxlcyk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgYXBwbHlSZXN1bHQgPSBtb2R1bGUuaG90LmFwcGx5KGFwcGx5T3B0aW9ucywgYXBwbHlDYWxsYmFjayk7XG4gICAgICAvLyB3ZWJwYWNrIDIgcHJvbWlzZVxuICAgICAgaWYgKGFwcGx5UmVzdWx0ICYmIGFwcGx5UmVzdWx0LnRoZW4pIHtcbiAgICAgICAgLy8gSG90TW9kdWxlUmVwbGFjZW1lbnQucnVudGltZS5qcyByZWZlcnMgdG8gdGhlIHJlc3VsdCBhcyBgb3V0ZGF0ZWRNb2R1bGVzYFxuICAgICAgICBhcHBseVJlc3VsdC50aGVuKGZ1bmN0aW9uKG91dGRhdGVkTW9kdWxlcykge1xuICAgICAgICAgIGFwcGx5Q2FsbGJhY2sobnVsbCwgb3V0ZGF0ZWRNb2R1bGVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFwcGx5UmVzdWx0LmNhdGNoKGFwcGx5Q2FsbGJhY2spO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciByZXN1bHQgPSBtb2R1bGUuaG90LmNoZWNrKGZhbHNlLCBjYik7XG4gICAgLy8gd2VicGFjayAyIHByb21pc2VcbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC50aGVuKSB7XG4gICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uKHVwZGF0ZWRNb2R1bGVzKSB7XG4gICAgICAgICAgICBjYihudWxsLCB1cGRhdGVkTW9kdWxlcyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXN1bHQuY2F0Y2goY2IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ1VwZGF0ZXModXBkYXRlZE1vZHVsZXMsIHJlbmV3ZWRNb2R1bGVzKSB7XG4gICAgdmFyIHVuYWNjZXB0ZWRNb2R1bGVzID0gdXBkYXRlZE1vZHVsZXMuZmlsdGVyKGZ1bmN0aW9uKG1vZHVsZUlkKSB7XG4gICAgICByZXR1cm4gcmVuZXdlZE1vZHVsZXMgJiYgcmVuZXdlZE1vZHVsZXMuaW5kZXhPZihtb2R1bGVJZCkgPCAwO1xuICAgIH0pO1xuXG4gICAgaWYodW5hY2NlcHRlZE1vZHVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKG9wdGlvbnMud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgXCJbSE1SXSBUaGUgZm9sbG93aW5nIG1vZHVsZXMgY291bGRuJ3QgYmUgaG90IHVwZGF0ZWQ6IFwiICtcbiAgICAgICAgICBcIihGdWxsIHJlbG9hZCBuZWVkZWQpXFxuXCIgK1xuICAgICAgICAgIFwiVGhpcyBpcyB1c3VhbGx5IGJlY2F1c2UgdGhlIG1vZHVsZXMgd2hpY2ggaGF2ZSBjaGFuZ2VkIFwiICtcbiAgICAgICAgICBcIihhbmQgdGhlaXIgcGFyZW50cykgZG8gbm90IGtub3cgaG93IHRvIGhvdCByZWxvYWQgdGhlbXNlbHZlcy4gXCIgK1xuICAgICAgICAgIFwiU2VlIFwiICsgaG1yRG9jc1VybCArIFwiIGZvciBtb3JlIGRldGFpbHMuXCJcbiAgICAgICAgKTtcbiAgICAgICAgdW5hY2NlcHRlZE1vZHVsZXMuZm9yRWFjaChmdW5jdGlvbihtb2R1bGVJZCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIltITVJdICAtIFwiICsgbW9kdWxlTWFwW21vZHVsZUlkXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcGVyZm9ybVJlbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmxvZykge1xuICAgICAgaWYoIXJlbmV3ZWRNb2R1bGVzIHx8IHJlbmV3ZWRNb2R1bGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltITVJdIE5vdGhpbmcgaG90IHVwZGF0ZWQuXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJbSE1SXSBVcGRhdGVkIG1vZHVsZXM6XCIpO1xuICAgICAgICByZW5ld2VkTW9kdWxlcy5mb3JFYWNoKGZ1bmN0aW9uKG1vZHVsZUlkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJbSE1SXSAgLSBcIiArIG1vZHVsZU1hcFttb2R1bGVJZF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVwVG9EYXRlKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJbSE1SXSBBcHAgaXMgdXAgdG8gZGF0ZS5cIik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgaWYgKG1vZHVsZS5ob3Quc3RhdHVzKCkgaW4gZmFpbHVyZVN0YXR1c2VzKSB7XG4gICAgICBpZiAob3B0aW9ucy53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIltITVJdIENhbm5vdCBjaGVjayBmb3IgdXBkYXRlIChGdWxsIHJlbG9hZCBuZWVkZWQpXCIpO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJbSE1SXSBcIiArIGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBwZXJmb3JtUmVsb2FkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChvcHRpb25zLndhcm4pIHtcbiAgICAgIGNvbnNvbGUud2FybihcIltITVJdIFVwZGF0ZSBjaGVjayBmYWlsZWQ6IFwiICsgZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwZXJmb3JtUmVsb2FkKCkge1xuICAgIGlmIChyZWxvYWQpIHtcbiAgICAgIGlmIChvcHRpb25zLndhcm4pIGNvbnNvbGUud2FybihcIltITVJdIFJlbG9hZGluZyBwYWdlXCIpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS1ob3QtbWlkZGxld2FyZS9wcm9jZXNzLXVwZGF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnO1xuaW1wb3J0IHJvdXRlciBmcm9tICcuL3JvdXRlci9yb3V0ZXInO1xuaW1wb3J0IEluZGV4IGZyb20gJy4vSW5kZXgudnVlJztcblxubmV3IFZ1ZSgge1xuICBlbDogJyNtYWluJyxcbiAgcm91dGVyLFxuICBjb21wb25lbnRzOiB7IEluZGV4IH0sXG4gIHJlbmRlcjogY2FsbGJhY2sgPT4gY2FsbGJhY2soIEluZGV4IClcbn0gKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyIsImltcG9ydCBWdWUgZnJvbSAndnVlJztcbmltcG9ydCBSb3V0ZXIgZnJvbSAndnVlLXJvdXRlcic7XG5pbXBvcnQgaVZpZXcgZnJvbSAnaXZpZXcnO1xuaW1wb3J0IEluZGV4IGZyb20gJ3ZwYWdlcy9JbmRleC52dWUnO1xuaW1wb3J0IExvZ2luIGZyb20gJ3ZwYWdlcy9Mb2dpbi52dWUnO1xuaW1wb3J0IExpc3QgZnJvbSAndnBhZ2VzL0xpc3QudnVlJztcbmltcG9ydCBTaG9wcGluZ0NhcnQgZnJvbSAndnBhZ2VzL1Nob3BwaW5nQ2FydC52dWUnO1xuaW1wb3J0IFBheUluTGluZSBmcm9tICd2cGFnZXMvUGF5SW5MaW5lLnZ1ZSc7XG5pbXBvcnQgU3VjY2VzcyBmcm9tICd2cGFnZXMvU3VjY2Vzcy52dWUnO1xuaW1wb3J0IENvbmZpcm1PcmRlciBmcm9tICd2cGFnZXMvQ29uZmlybU9yZGVyLnZ1ZSc7XG5pbXBvcnQgRGV0YWlscyBmcm9tICd2cGFnZXMvRGV0YWlscy52dWUnO1xuaW1wb3J0IEluZm9ybWF0aW9uIGZyb20gJ3ZwYWdlcy9JbmZvcm1hdGlvbi52dWUnO1xuaW1wb3J0IFBlcnNvbmFsIGZyb20gJ3ZwYWdlcy9QZXJzb25hbC52dWUnO1xuXG5WdWUudXNlKCBSb3V0ZXIgKTtcblZ1ZS51c2UoIGlWaWV3ICk7XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBSb3V0ZXIoIHtcbiAgcm91dGVzOiBbXG4gICAge1xuICAgICAgcGF0aDogJy8nLFxuICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgIGNvbXBvbmVudDogSW5kZXhcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdGg6ICcvbG9naW4nLFxuICAgICAgbmFtZTogJ2xvZ2luJyxcbiAgICAgIGNvbXBvbmVudDogTG9naW5cbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdGg6ICcvbGlzdC86aWQnLFxuICAgICAgbmFtZTogJ2xpc3QnLFxuICAgICAgY29tcG9uZW50OiBMaXN0XG4gICAgfSxcbiAgICB7XG4gICAgICBwYXRoOiAnL2RldGFpbC86aWQnLFxuICAgICAgbmFtZTogJ2RldGFpbCcsXG4gICAgICBjb21wb25lbnQ6IERldGFpbHMsXG4gICAgICBtZXRhOiBbJ+mmlumhtScsICfotK3kubDnuqLphZInXVxuICAgIH0sXG4gICAge1xuICAgICAgcGF0aDogJy9jYXJ0JyxcbiAgICAgIG5hbWU6ICdjYXJ0JyxcbiAgICAgIGNvbXBvbmVudDogU2hvcHBpbmdDYXJ0XG4gICAgfSxcbiAgICB7XG4gICAgICBwYXRoOiAnL2NvbmZpcm0nLFxuICAgICAgbmFtZTogJ2NvbmZpcm0nLFxuICAgICAgY29tcG9uZW50OiBDb25maXJtT3JkZXJcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdGg6ICcvcGF5JyxcbiAgICAgIG5hbWU6ICdwYXknLFxuICAgICAgY29tcG9uZW50OiBQYXlJbkxpbmVcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdGg6ICcvc3VjY2Vzcy86dHlwZScsXG4gICAgICBuYW1lOiAnc3VjY2VzcycsXG4gICAgICBjb21wb25lbnQ6IFN1Y2Nlc3MsXG4gICAgICBwcm9wczogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgcGF0aDogJy9pbmZvcm1hdGlvbi86dHlwZScsXG4gICAgICBuYW1lOiAnaW5mb3JtYXRpb24nLFxuICAgICAgY29tcG9uZW50OiBJbmZvcm1hdGlvbixcbiAgICAgIHByb3BzOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBwYXRoOiAnL3BlcnNvbmFsJyxcbiAgICAgIG5hbWU6ICdwZXJzb25hbCcsXG4gICAgICBjb21wb25lbnQ6IFBlcnNvbmFsXG4gICAgfVxuICBdXG59ICk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcm91dGVyL3JvdXRlci5qcyIsIm1vZHVsZS5leHBvcnRzID0gKF9fd2VicGFja19yZXF1aXJlX18oNykpKDE0KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBkZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvdnVlLXJvdXRlci9kaXN0L3Z1ZS1yb3V0ZXIuZXNtLmpzIGZyb20gZGxsLXJlZmVyZW5jZSBidW5kbGVfbGlicmFyeVxuLy8gbW9kdWxlIGlkID0gMzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAoX193ZWJwYWNrX3JlcXVpcmVfXyg3KSkoMzUpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGRlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy9pdmlldy9kaXN0L2l2aWV3LmpzIGZyb20gZGxsLXJlZmVyZW5jZSBidW5kbGVfbGlicmFyeVxuLy8gbW9kdWxlIGlkID0gMzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtN2UyNjQzNDRcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vSW5kZXgudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9JbmRleC52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTdlMjY0MzQ0XFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9JbmRleC52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtN2UyNjQzNDRcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmRleC52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTdlMjY0MzQ0XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtN2UyNjQzNDRcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy92aWV3cy92dWVfcGFnZXMvSW5kZXgudnVlXG4vLyBtb2R1bGUgaWQgPSAzNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XCJvbWl0XCI6MSxcInJlbW92ZVwiOnRydWUsXCJwdWJsaWNQYXRoXCI6XCIuLi9cIn0hLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlciEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyP3tcIm1pbmltaXplXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LTdlMjY0MzQ0XCIsXCJzY29wZWRcIjp0cnVlLFwiaGFzSW5saW5lQ29uZmlnXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3N0eWx1cy1sb2FkZXIhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0luZGV4LnZ1ZVxuLy8gbW9kdWxlIGlkID0gMzVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gIC5wcm9kc1xuICAgIC50b3BcbiAgICAgIExvZ29cbiAgICBDYXJvdXNlbFxuICAgIHJvdXRlci1saW5rLktaSiggdG89XCIvbGlzdC8xMDEwXCIgKVxuICAgICAgaW1nKCBzcmM9XCJ+aW1hZ2VzL3BpYzJfaW5kZXgucG5nXCIgKVxuICAgIHJvdXRlci1saW5rLlhHTEwtU1JMKCB0bz1cIi9saXN0LzEwMjBcIiApXG4gICAgICBpbWcoIHNyYz1cIn5pbWFnZXMvcGljM19pbmRleC5wbmdcIiApXG4gICAgcm91dGVyLWxpbmsuVFRDKCB0bz1cIi9saXN0LzEwMzBcIiApXG4gICAgICBpbWcoIHNyYz1cIn5pbWFnZXMvcGljNF9pbmRleC5wbmdcIiApXG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuaW1wb3J0IExvZ28gZnJvbSAnbW9kdWxlcy9Mb2dvLnZ1ZSc7XG5pbXBvcnQgQ2Fyb3VzZWwgZnJvbSAnbW9kdWxlcy9jYXJvdXNlbC52dWUnO1xuaW1wb3J0IENhcnQgZnJvbSAnQC91bml0cy9jb3JlL0NhcnQnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdpbmRleCcsXG4gIGNvbXBvbmVudHM6IHtcbiAgICBMb2dvLFxuICAgIENhcm91c2VsXG4gIH0sXG4gIG1vdW50ZWQoKSB7XG4gICAgQ2FydC5nZXRDYXJ0TGlzdCgge1xuICAgICAgJHN0b3JlOiB0aGlzLiRzdG9yZVxuICAgIH0gKTtcbiAgfVxufTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgbGFuZz1cInN0eWx1c1wiIHNjb3BlZD5cbiAgLnByb2RzXG4gICAgLnRvcFxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlclxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuXG4gICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBtYXJnaW4tcmlnaHQ6IDI0MHB4XG4gICAgICBtYXJnaW4tbGVmdDogMzEwcHhcbiAgICBhXG4gICAgICBkaXNwbGF5IGJsb2NrXG4gICAgICBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW5cbiAgICAgIGJhY2tncm91bmQtcmVwZWF0IG5vLXJlcGVhdFxuICAgIC5LWkpcbiAgICAuWEdMTC1TUkxcbiAgICAuVFRDXG4gICAgICBpbWdcbiAgICAgICAgd2lkdGggYXV0b1xuICAgICAgICB3aWR0aCAxMDAlXG4gICAgICAgIG9iamVjdC1maXQgY29udGFpblxuICAgIC5YR0xMXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDMwNzAyXG4gICAgICBoZWlnaHQ6IDc2MHB4XG4gICAgLktaSlxuICAgICAgaW1nXG4gICAgICAgIGhlaWdodCA1NDNweFxuICAgIC5YR0xMLVNSTFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzBFMTEzQVxuICAgICAgaW1nXG4gICAgICAgIGhlaWdodDogNTQzcHhcbiAgICAuVFRDXG4gICAgICBpbWdcbiAgICAgICAgaGVpZ2h0OiA1NDNweFxuPC9zdHlsZT5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvdmlld3MvdnVlX3BhZ2VzL0luZGV4LnZ1ZT8zZGM3NTBkYSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtOGQ4NjYzYThcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0xvZ28udnVlXG4vLyBtb2R1bGUgaWQgPSAzN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgICByb3V0ZXItbGluayh0bz1cIi9cIilcbiAgICAgIC5sb2dvIHt7dGl0bGV9fVxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICdsb2dpbicsXG4gICAgcHJvcHM6IFsndGl0bGUnXVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAubG9nb1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCggJ35pbWFnZXMvbG9nby5wbmcnIClcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0XG4gICAgYmFja2dyb3VuZC1zaXplOiBjb250YWluXG4gICAgcGFkZGluZy1sZWZ0OiAyMTVweFxuICAgIG1hcmdpbjogMTlweCAwXG4gICAgaGVpZ2h0OiA0MHB4XG4gICAgbGluZS1oZWlnaHQ6IDQwcHhcbiAgICBmb250LXNpemU6IDI0cHhcbiAgICBjb2xvcjogIzBFMTEzQVxuPC9zdHlsZT5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9Mb2dvLnZ1ZT85M2YyY2Y4NCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJyb3V0ZXItbGlua1wiLCB7IGF0dHJzOiB7IHRvOiBcIi9cIiB9IH0sIFtcbiAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImxvZ29cIiB9LCBbX3ZtLl92KF92bS5fcyhfdm0udGl0bGUpKV0pXG4gIF0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW11cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi04ZDg2NjNhOFwiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LThkODY2M2E4XCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0xvZ28udnVlXG4vLyBtb2R1bGUgaWQgPSAzOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZGlzcG9zZWQgPSBmYWxzZVxuZnVuY3Rpb24gaW5qZWN0U3R5bGUgKHNzckNvbnRleHQpIHtcbiAgaWYgKGRpc3Bvc2VkKSByZXR1cm5cbiAgcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XFxcIm9taXRcXFwiOjEsXFxcInJlbW92ZVxcXCI6dHJ1ZSxcXFwicHVibGljUGF0aFxcXCI6XFxcIi4uL1xcXCJ9IXZ1ZS1zdHlsZS1sb2FkZXIhY3NzLWxvYWRlcj97XFxcIm1pbmltaXplXFxcIjpmYWxzZX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4P3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi0zNjFhNTZjMVxcXCIsXFxcInNjb3BlZFxcXCI6dHJ1ZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjpmYWxzZX0hc3R5bHVzLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9jYXJvdXNlbC52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL2Nhcm91c2VsLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMzYxYTU2YzFcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL2Nhcm91c2VsLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBcImRhdGEtdi0zNjFhNTZjMVwiXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvbW9kdWxlcy9jYXJvdXNlbC52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTM2MWE1NmMxXCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMzYxYTU2YzFcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL2Nhcm91c2VsLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi0zNjFhNTZjMVwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvY2Fyb3VzZWwudnVlXG4vLyBtb2R1bGUgaWQgPSA0MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgQ2Fyb3VzZWwuY2Fyb3VzZWwoIGF1dG9wbGF5IClcbiAgICBDYXJvdXNlbEl0ZW1cbiAgICAgIGltZy5remooIHNyYz1cIn5pbWFnZXMvYmFubmVyMS5qcGdcIiApXG4gICAgQ2Fyb3VzZWxJdGVtXG4gICAgICBpbWcueGdsYSggc3JjPVwifmltYWdlcy9iYW5uZXIyLmpwZ1wiIClcbiAgICBDYXJvdXNlbEl0ZW1cbiAgICAgIGltZy50dGMoIHNyYz1cIn5pbWFnZXMvYmFubmVyMy5qcGdcIiApXG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnY2Fyb3VzZWwnLFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogMFxuICAgIH07XG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gIC5jYXJvdXNlbFxuICAgIC5rempcbiAgICAueGdsYVxuICAgIC50dGNcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmZcbiAgICAgIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlciBjZW50ZXJcbiAgICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXRcbiAgICAgIGJhY2tncm91bmQtc2l6ZTogY29udGFpblxuICAgICAgd2lkdGg6IDEwMCVcbiAgICAgIGhlaWdodDogJHB4MnJlbSggNDAwcHggKTtcbiAgICAueGdsYVxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzBFMTEzQVxuPC9zdHlsZT5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9jYXJvdXNlbC52dWU/MTQ0MGM5NGUiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFxuICAgIFwiQ2Fyb3VzZWxcIixcbiAgICB7IHN0YXRpY0NsYXNzOiBcImNhcm91c2VsXCIsIGF0dHJzOiB7IGF1dG9wbGF5OiBcImF1dG9wbGF5XCIgfSB9LFxuICAgIFtcbiAgICAgIF9jKFwiQ2Fyb3VzZWxJdGVtXCIsIFtcbiAgICAgICAgX2MoXCJpbWdcIiwge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiBcImt6alwiLFxuICAgICAgICAgIGF0dHJzOiB7IHNyYzogcmVxdWlyZShcImltYWdlcy9iYW5uZXIxLmpwZ1wiKSB9XG4gICAgICAgIH0pXG4gICAgICBdKSxcbiAgICAgIF9jKFwiQ2Fyb3VzZWxJdGVtXCIsIFtcbiAgICAgICAgX2MoXCJpbWdcIiwge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInhnbGFcIixcbiAgICAgICAgICBhdHRyczogeyBzcmM6IHJlcXVpcmUoXCJpbWFnZXMvYmFubmVyMi5qcGdcIikgfVxuICAgICAgICB9KVxuICAgICAgXSksXG4gICAgICBfYyhcIkNhcm91c2VsSXRlbVwiLCBbXG4gICAgICAgIF9jKFwiaW1nXCIsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogXCJ0dGNcIixcbiAgICAgICAgICBhdHRyczogeyBzcmM6IHJlcXVpcmUoXCJpbWFnZXMvYmFubmVyMy5qcGdcIikgfVxuICAgICAgICB9KVxuICAgICAgXSlcbiAgICBdLFxuICAgIDFcbiAgKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtdXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtMzYxYTU2YzFcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0zNjFhNTZjMVwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9jYXJvdXNlbC52dWVcbi8vIG1vZHVsZSBpZCA9IDQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltYWdlcy9iYW5uZXIxLmpwZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2Fzc2V0cy9pbWFnZXMvYmFubmVyMS5qcGdcbi8vIG1vZHVsZSBpZCA9IDQ0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltYWdlcy9iYW5uZXIyLmpwZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2Fzc2V0cy9pbWFnZXMvYmFubmVyMi5qcGdcbi8vIG1vZHVsZSBpZCA9IDQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltYWdlcy9iYW5uZXIzLmpwZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2Fzc2V0cy9pbWFnZXMvYmFubmVyMy5qcGdcbi8vIG1vZHVsZSBpZCA9IDQ2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gKF9fd2VicGFja19yZXF1aXJlX18oNykpKDE1KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBkZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMgZnJvbSBkbGwtcmVmZXJlbmNlIGJ1bmRsZV9saWJyYXJ5XG4vLyBtb2R1bGUgaWQgPSA0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnkgPSByZXF1aXJlKCcuL3N0cmluZ2lmeScpO1xudmFyIHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpO1xudmFyIGZvcm1hdHMgPSByZXF1aXJlKCcuL2Zvcm1hdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZm9ybWF0czogZm9ybWF0cyxcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9xcy9saWIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGZvcm1hdHMgPSByZXF1aXJlKCcuL2Zvcm1hdHMnKTtcblxudmFyIGFycmF5UHJlZml4R2VuZXJhdG9ycyA9IHtcbiAgICBicmFja2V0czogZnVuY3Rpb24gYnJhY2tldHMocHJlZml4KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lLW1hdGNoaW5nXG4gICAgICAgIHJldHVybiBwcmVmaXggKyAnW10nO1xuICAgIH0sXG4gICAgaW5kaWNlczogZnVuY3Rpb24gaW5kaWNlcyhwcmVmaXgsIGtleSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZS1tYXRjaGluZ1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgJ1snICsga2V5ICsgJ10nO1xuICAgIH0sXG4gICAgcmVwZWF0OiBmdW5jdGlvbiByZXBlYXQocHJlZml4KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lLW1hdGNoaW5nXG4gICAgICAgIHJldHVybiBwcmVmaXg7XG4gICAgfVxufTtcblxudmFyIHRvSVNPID0gRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmc7XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBkZWxpbWl0ZXI6ICcmJyxcbiAgICBlbmNvZGU6IHRydWUsXG4gICAgZW5jb2RlcjogdXRpbHMuZW5jb2RlLFxuICAgIGVuY29kZVZhbHVlc09ubHk6IGZhbHNlLFxuICAgIHNlcmlhbGl6ZURhdGU6IGZ1bmN0aW9uIHNlcmlhbGl6ZURhdGUoZGF0ZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZS1tYXRjaGluZ1xuICAgICAgICByZXR1cm4gdG9JU08uY2FsbChkYXRlKTtcbiAgICB9LFxuICAgIHNraXBOdWxsczogZmFsc2UsXG4gICAgc3RyaWN0TnVsbEhhbmRsaW5nOiBmYWxzZVxufTtcblxudmFyIHN0cmluZ2lmeSA9IGZ1bmN0aW9uIHN0cmluZ2lmeSggLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWUtbWF0Y2hpbmdcbiAgICBvYmplY3QsXG4gICAgcHJlZml4LFxuICAgIGdlbmVyYXRlQXJyYXlQcmVmaXgsXG4gICAgc3RyaWN0TnVsbEhhbmRsaW5nLFxuICAgIHNraXBOdWxscyxcbiAgICBlbmNvZGVyLFxuICAgIGZpbHRlcixcbiAgICBzb3J0LFxuICAgIGFsbG93RG90cyxcbiAgICBzZXJpYWxpemVEYXRlLFxuICAgIGZvcm1hdHRlcixcbiAgICBlbmNvZGVWYWx1ZXNPbmx5XG4pIHtcbiAgICB2YXIgb2JqID0gb2JqZWN0O1xuICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9iaiA9IGZpbHRlcihwcmVmaXgsIG9iaik7XG4gICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIG9iaiA9IHNlcmlhbGl6ZURhdGUob2JqKTtcbiAgICB9IGVsc2UgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgICAgICBpZiAoc3RyaWN0TnVsbEhhbmRsaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlciAmJiAhZW5jb2RlVmFsdWVzT25seSA/IGVuY29kZXIocHJlZml4LCBkZWZhdWx0cy5lbmNvZGVyKSA6IHByZWZpeDtcbiAgICAgICAgfVxuXG4gICAgICAgIG9iaiA9ICcnO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyB8fCB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicgfHwgdXRpbHMuaXNCdWZmZXIob2JqKSkge1xuICAgICAgICBpZiAoZW5jb2Rlcikge1xuICAgICAgICAgICAgdmFyIGtleVZhbHVlID0gZW5jb2RlVmFsdWVzT25seSA/IHByZWZpeCA6IGVuY29kZXIocHJlZml4LCBkZWZhdWx0cy5lbmNvZGVyKTtcbiAgICAgICAgICAgIHJldHVybiBbZm9ybWF0dGVyKGtleVZhbHVlKSArICc9JyArIGZvcm1hdHRlcihlbmNvZGVyKG9iaiwgZGVmYXVsdHMuZW5jb2RlcikpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW2Zvcm1hdHRlcihwcmVmaXgpICsgJz0nICsgZm9ybWF0dGVyKFN0cmluZyhvYmopKV07XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuXG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfVxuXG4gICAgdmFyIG9iaktleXM7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZmlsdGVyKSkge1xuICAgICAgICBvYmpLZXlzID0gZmlsdGVyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICAgICAgb2JqS2V5cyA9IHNvcnQgPyBrZXlzLnNvcnQoc29ydCkgOiBrZXlzO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqS2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0gb2JqS2V5c1tpXTtcblxuICAgICAgICBpZiAoc2tpcE51bGxzICYmIG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQoc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgIG9ialtrZXldLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQXJyYXlQcmVmaXgocHJlZml4LCBrZXkpLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQXJyYXlQcmVmaXgsXG4gICAgICAgICAgICAgICAgc3RyaWN0TnVsbEhhbmRsaW5nLFxuICAgICAgICAgICAgICAgIHNraXBOdWxscyxcbiAgICAgICAgICAgICAgICBlbmNvZGVyLFxuICAgICAgICAgICAgICAgIGZpbHRlcixcbiAgICAgICAgICAgICAgICBzb3J0LFxuICAgICAgICAgICAgICAgIGFsbG93RG90cyxcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVEYXRlLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlcixcbiAgICAgICAgICAgICAgICBlbmNvZGVWYWx1ZXNPbmx5XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQoc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgIG9ialtrZXldLFxuICAgICAgICAgICAgICAgIHByZWZpeCArIChhbGxvd0RvdHMgPyAnLicgKyBrZXkgOiAnWycgKyBrZXkgKyAnXScpLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQXJyYXlQcmVmaXgsXG4gICAgICAgICAgICAgICAgc3RyaWN0TnVsbEhhbmRsaW5nLFxuICAgICAgICAgICAgICAgIHNraXBOdWxscyxcbiAgICAgICAgICAgICAgICBlbmNvZGVyLFxuICAgICAgICAgICAgICAgIGZpbHRlcixcbiAgICAgICAgICAgICAgICBzb3J0LFxuICAgICAgICAgICAgICAgIGFsbG93RG90cyxcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVEYXRlLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlcixcbiAgICAgICAgICAgICAgICBlbmNvZGVWYWx1ZXNPbmx5XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG9wdHMpIHtcbiAgICB2YXIgb2JqID0gb2JqZWN0O1xuICAgIHZhciBvcHRpb25zID0gb3B0cyA/IHV0aWxzLmFzc2lnbih7fSwgb3B0cykgOiB7fTtcblxuICAgIGlmIChvcHRpb25zLmVuY29kZXIgIT09IG51bGwgJiYgb3B0aW9ucy5lbmNvZGVyICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMuZW5jb2RlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFbmNvZGVyIGhhcyB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBkZWxpbWl0ZXIgPSB0eXBlb2Ygb3B0aW9ucy5kZWxpbWl0ZXIgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdHMuZGVsaW1pdGVyIDogb3B0aW9ucy5kZWxpbWl0ZXI7XG4gICAgdmFyIHN0cmljdE51bGxIYW5kbGluZyA9IHR5cGVvZiBvcHRpb25zLnN0cmljdE51bGxIYW5kbGluZyA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgOiBkZWZhdWx0cy5zdHJpY3ROdWxsSGFuZGxpbmc7XG4gICAgdmFyIHNraXBOdWxscyA9IHR5cGVvZiBvcHRpb25zLnNraXBOdWxscyA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5za2lwTnVsbHMgOiBkZWZhdWx0cy5za2lwTnVsbHM7XG4gICAgdmFyIGVuY29kZSA9IHR5cGVvZiBvcHRpb25zLmVuY29kZSA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5lbmNvZGUgOiBkZWZhdWx0cy5lbmNvZGU7XG4gICAgdmFyIGVuY29kZXIgPSB0eXBlb2Ygb3B0aW9ucy5lbmNvZGVyID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5lbmNvZGVyIDogZGVmYXVsdHMuZW5jb2RlcjtcbiAgICB2YXIgc29ydCA9IHR5cGVvZiBvcHRpb25zLnNvcnQgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnNvcnQgOiBudWxsO1xuICAgIHZhciBhbGxvd0RvdHMgPSB0eXBlb2Ygb3B0aW9ucy5hbGxvd0RvdHMgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiBvcHRpb25zLmFsbG93RG90cztcbiAgICB2YXIgc2VyaWFsaXplRGF0ZSA9IHR5cGVvZiBvcHRpb25zLnNlcmlhbGl6ZURhdGUgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnNlcmlhbGl6ZURhdGUgOiBkZWZhdWx0cy5zZXJpYWxpemVEYXRlO1xuICAgIHZhciBlbmNvZGVWYWx1ZXNPbmx5ID0gdHlwZW9mIG9wdGlvbnMuZW5jb2RlVmFsdWVzT25seSA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5lbmNvZGVWYWx1ZXNPbmx5IDogZGVmYXVsdHMuZW5jb2RlVmFsdWVzT25seTtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMuZm9ybWF0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvcHRpb25zLmZvcm1hdCA9IGZvcm1hdHNbJ2RlZmF1bHQnXTtcbiAgICB9IGVsc2UgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZm9ybWF0cy5mb3JtYXR0ZXJzLCBvcHRpb25zLmZvcm1hdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBmb3JtYXQgb3B0aW9uIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICB2YXIgZm9ybWF0dGVyID0gZm9ybWF0cy5mb3JtYXR0ZXJzW29wdGlvbnMuZm9ybWF0XTtcbiAgICB2YXIgb2JqS2V5cztcbiAgICB2YXIgZmlsdGVyO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmZpbHRlcjtcbiAgICAgICAgb2JqID0gZmlsdGVyKCcnLCBvYmopO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zLmZpbHRlcikpIHtcbiAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5maWx0ZXI7XG4gICAgICAgIG9iaktleXMgPSBmaWx0ZXI7XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBbXTtcblxuICAgIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHZhciBhcnJheUZvcm1hdDtcbiAgICBpZiAob3B0aW9ucy5hcnJheUZvcm1hdCBpbiBhcnJheVByZWZpeEdlbmVyYXRvcnMpIHtcbiAgICAgICAgYXJyYXlGb3JtYXQgPSBvcHRpb25zLmFycmF5Rm9ybWF0O1xuICAgIH0gZWxzZSBpZiAoJ2luZGljZXMnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgYXJyYXlGb3JtYXQgPSBvcHRpb25zLmluZGljZXMgPyAnaW5kaWNlcycgOiAncmVwZWF0JztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhcnJheUZvcm1hdCA9ICdpbmRpY2VzJztcbiAgICB9XG5cbiAgICB2YXIgZ2VuZXJhdGVBcnJheVByZWZpeCA9IGFycmF5UHJlZml4R2VuZXJhdG9yc1thcnJheUZvcm1hdF07XG5cbiAgICBpZiAoIW9iaktleXMpIHtcbiAgICAgICAgb2JqS2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gICAgfVxuXG4gICAgaWYgKHNvcnQpIHtcbiAgICAgICAgb2JqS2V5cy5zb3J0KHNvcnQpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqS2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0gb2JqS2V5c1tpXTtcblxuICAgICAgICBpZiAoc2tpcE51bGxzICYmIG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtleXMgPSBrZXlzLmNvbmNhdChzdHJpbmdpZnkoXG4gICAgICAgICAgICBvYmpba2V5XSxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIGdlbmVyYXRlQXJyYXlQcmVmaXgsXG4gICAgICAgICAgICBzdHJpY3ROdWxsSGFuZGxpbmcsXG4gICAgICAgICAgICBza2lwTnVsbHMsXG4gICAgICAgICAgICBlbmNvZGUgPyBlbmNvZGVyIDogbnVsbCxcbiAgICAgICAgICAgIGZpbHRlcixcbiAgICAgICAgICAgIHNvcnQsXG4gICAgICAgICAgICBhbGxvd0RvdHMsXG4gICAgICAgICAgICBzZXJpYWxpemVEYXRlLFxuICAgICAgICAgICAgZm9ybWF0dGVyLFxuICAgICAgICAgICAgZW5jb2RlVmFsdWVzT25seVxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICB2YXIgam9pbmVkID0ga2V5cy5qb2luKGRlbGltaXRlcik7XG4gICAgdmFyIHByZWZpeCA9IG9wdGlvbnMuYWRkUXVlcnlQcmVmaXggPT09IHRydWUgPyAnPycgOiAnJztcblxuICAgIHJldHVybiBqb2luZWQubGVuZ3RoID4gMCA/IHByZWZpeCArIGpvaW5lZCA6ICcnO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3FzL2xpYi9zdHJpbmdpZnkuanNcbi8vIG1vZHVsZSBpZCA9IDQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxudmFyIGRlZmF1bHRzID0ge1xuICAgIGFsbG93RG90czogZmFsc2UsXG4gICAgYWxsb3dQcm90b3R5cGVzOiBmYWxzZSxcbiAgICBhcnJheUxpbWl0OiAyMCxcbiAgICBkZWNvZGVyOiB1dGlscy5kZWNvZGUsXG4gICAgZGVsaW1pdGVyOiAnJicsXG4gICAgZGVwdGg6IDUsXG4gICAgcGFyYW1ldGVyTGltaXQ6IDEwMDAsXG4gICAgcGxhaW5PYmplY3RzOiBmYWxzZSxcbiAgICBzdHJpY3ROdWxsSGFuZGxpbmc6IGZhbHNlXG59O1xuXG52YXIgcGFyc2VWYWx1ZXMgPSBmdW5jdGlvbiBwYXJzZVF1ZXJ5U3RyaW5nVmFsdWVzKHN0ciwgb3B0aW9ucykge1xuICAgIHZhciBvYmogPSB7fTtcbiAgICB2YXIgY2xlYW5TdHIgPSBvcHRpb25zLmlnbm9yZVF1ZXJ5UHJlZml4ID8gc3RyLnJlcGxhY2UoL15cXD8vLCAnJykgOiBzdHI7XG4gICAgdmFyIGxpbWl0ID0gb3B0aW9ucy5wYXJhbWV0ZXJMaW1pdCA9PT0gSW5maW5pdHkgPyB1bmRlZmluZWQgOiBvcHRpb25zLnBhcmFtZXRlckxpbWl0O1xuICAgIHZhciBwYXJ0cyA9IGNsZWFuU3RyLnNwbGl0KG9wdGlvbnMuZGVsaW1pdGVyLCBsaW1pdCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG5cbiAgICAgICAgdmFyIGJyYWNrZXRFcXVhbHNQb3MgPSBwYXJ0LmluZGV4T2YoJ109Jyk7XG4gICAgICAgIHZhciBwb3MgPSBicmFja2V0RXF1YWxzUG9zID09PSAtMSA/IHBhcnQuaW5kZXhPZignPScpIDogYnJhY2tldEVxdWFsc1BvcyArIDE7XG5cbiAgICAgICAgdmFyIGtleSwgdmFsO1xuICAgICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICAgICAga2V5ID0gb3B0aW9ucy5kZWNvZGVyKHBhcnQsIGRlZmF1bHRzLmRlY29kZXIpO1xuICAgICAgICAgICAgdmFsID0gb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgPyBudWxsIDogJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBvcHRpb25zLmRlY29kZXIocGFydC5zbGljZSgwLCBwb3MpLCBkZWZhdWx0cy5kZWNvZGVyKTtcbiAgICAgICAgICAgIHZhbCA9IG9wdGlvbnMuZGVjb2RlcihwYXJ0LnNsaWNlKHBvcyArIDEpLCBkZWZhdWx0cy5kZWNvZGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IFtdLmNvbmNhdChvYmpba2V5XSkuY29uY2F0KHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG52YXIgcGFyc2VPYmplY3QgPSBmdW5jdGlvbiAoY2hhaW4sIHZhbCwgb3B0aW9ucykge1xuICAgIHZhciBsZWFmID0gdmFsO1xuXG4gICAgZm9yICh2YXIgaSA9IGNoYWluLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBvYmo7XG4gICAgICAgIHZhciByb290ID0gY2hhaW5baV07XG5cbiAgICAgICAgaWYgKHJvb3QgPT09ICdbXScpIHtcbiAgICAgICAgICAgIG9iaiA9IFtdO1xuICAgICAgICAgICAgb2JqID0gb2JqLmNvbmNhdChsZWFmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9iaiA9IG9wdGlvbnMucGxhaW5PYmplY3RzID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHt9O1xuICAgICAgICAgICAgdmFyIGNsZWFuUm9vdCA9IHJvb3QuY2hhckF0KDApID09PSAnWycgJiYgcm9vdC5jaGFyQXQocm9vdC5sZW5ndGggLSAxKSA9PT0gJ10nID8gcm9vdC5zbGljZSgxLCAtMSkgOiByb290O1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gcGFyc2VJbnQoY2xlYW5Sb290LCAxMCk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIWlzTmFOKGluZGV4KVxuICAgICAgICAgICAgICAgICYmIHJvb3QgIT09IGNsZWFuUm9vdFxuICAgICAgICAgICAgICAgICYmIFN0cmluZyhpbmRleCkgPT09IGNsZWFuUm9vdFxuICAgICAgICAgICAgICAgICYmIGluZGV4ID49IDBcbiAgICAgICAgICAgICAgICAmJiAob3B0aW9ucy5wYXJzZUFycmF5cyAmJiBpbmRleCA8PSBvcHRpb25zLmFycmF5TGltaXQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBvYmogPSBbXTtcbiAgICAgICAgICAgICAgICBvYmpbaW5kZXhdID0gbGVhZjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqW2NsZWFuUm9vdF0gPSBsZWFmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGVhZiA9IG9iajtcbiAgICB9XG5cbiAgICByZXR1cm4gbGVhZjtcbn07XG5cbnZhciBwYXJzZUtleXMgPSBmdW5jdGlvbiBwYXJzZVF1ZXJ5U3RyaW5nS2V5cyhnaXZlbktleSwgdmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKCFnaXZlbktleSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVHJhbnNmb3JtIGRvdCBub3RhdGlvbiB0byBicmFja2V0IG5vdGF0aW9uXG4gICAgdmFyIGtleSA9IG9wdGlvbnMuYWxsb3dEb3RzID8gZ2l2ZW5LZXkucmVwbGFjZSgvXFwuKFteLltdKykvZywgJ1skMV0nKSA6IGdpdmVuS2V5O1xuXG4gICAgLy8gVGhlIHJlZ2V4IGNodW5rc1xuXG4gICAgdmFyIGJyYWNrZXRzID0gLyhcXFtbXltcXF1dKl0pLztcbiAgICB2YXIgY2hpbGQgPSAvKFxcW1teW1xcXV0qXSkvZztcblxuICAgIC8vIEdldCB0aGUgcGFyZW50XG5cbiAgICB2YXIgc2VnbWVudCA9IGJyYWNrZXRzLmV4ZWMoa2V5KTtcbiAgICB2YXIgcGFyZW50ID0gc2VnbWVudCA/IGtleS5zbGljZSgwLCBzZWdtZW50LmluZGV4KSA6IGtleTtcblxuICAgIC8vIFN0YXNoIHRoZSBwYXJlbnQgaWYgaXQgZXhpc3RzXG5cbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgLy8gSWYgd2UgYXJlbid0IHVzaW5nIHBsYWluIG9iamVjdHMsIG9wdGlvbmFsbHkgcHJlZml4IGtleXNcbiAgICAgICAgLy8gdGhhdCB3b3VsZCBvdmVyd3JpdGUgb2JqZWN0IHByb3RvdHlwZSBwcm9wZXJ0aWVzXG4gICAgICAgIGlmICghb3B0aW9ucy5wbGFpbk9iamVjdHMgJiYgaGFzLmNhbGwoT2JqZWN0LnByb3RvdHlwZSwgcGFyZW50KSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmFsbG93UHJvdG90eXBlcykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGtleXMucHVzaChwYXJlbnQpO1xuICAgIH1cblxuICAgIC8vIExvb3AgdGhyb3VnaCBjaGlsZHJlbiBhcHBlbmRpbmcgdG8gdGhlIGFycmF5IHVudGlsIHdlIGhpdCBkZXB0aFxuXG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlICgoc2VnbWVudCA9IGNoaWxkLmV4ZWMoa2V5KSkgIT09IG51bGwgJiYgaSA8IG9wdGlvbnMuZGVwdGgpIHtcbiAgICAgICAgaSArPSAxO1xuICAgICAgICBpZiAoIW9wdGlvbnMucGxhaW5PYmplY3RzICYmIGhhcy5jYWxsKE9iamVjdC5wcm90b3R5cGUsIHNlZ21lbnRbMV0uc2xpY2UoMSwgLTEpKSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmFsbG93UHJvdG90eXBlcykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBrZXlzLnB1c2goc2VnbWVudFsxXSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUncyBhIHJlbWFpbmRlciwganVzdCBhZGQgd2hhdGV2ZXIgaXMgbGVmdFxuXG4gICAgaWYgKHNlZ21lbnQpIHtcbiAgICAgICAga2V5cy5wdXNoKCdbJyArIGtleS5zbGljZShzZWdtZW50LmluZGV4KSArICddJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlT2JqZWN0KGtleXMsIHZhbCwgb3B0aW9ucyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIsIG9wdHMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdHMgPyB1dGlscy5hc3NpZ24oe30sIG9wdHMpIDoge307XG5cbiAgICBpZiAob3B0aW9ucy5kZWNvZGVyICE9PSBudWxsICYmIG9wdGlvbnMuZGVjb2RlciAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvcHRpb25zLmRlY29kZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRGVjb2RlciBoYXMgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICBvcHRpb25zLmlnbm9yZVF1ZXJ5UHJlZml4ID0gb3B0aW9ucy5pZ25vcmVRdWVyeVByZWZpeCA9PT0gdHJ1ZTtcbiAgICBvcHRpb25zLmRlbGltaXRlciA9IHR5cGVvZiBvcHRpb25zLmRlbGltaXRlciA9PT0gJ3N0cmluZycgfHwgdXRpbHMuaXNSZWdFeHAob3B0aW9ucy5kZWxpbWl0ZXIpID8gb3B0aW9ucy5kZWxpbWl0ZXIgOiBkZWZhdWx0cy5kZWxpbWl0ZXI7XG4gICAgb3B0aW9ucy5kZXB0aCA9IHR5cGVvZiBvcHRpb25zLmRlcHRoID09PSAnbnVtYmVyJyA/IG9wdGlvbnMuZGVwdGggOiBkZWZhdWx0cy5kZXB0aDtcbiAgICBvcHRpb25zLmFycmF5TGltaXQgPSB0eXBlb2Ygb3B0aW9ucy5hcnJheUxpbWl0ID09PSAnbnVtYmVyJyA/IG9wdGlvbnMuYXJyYXlMaW1pdCA6IGRlZmF1bHRzLmFycmF5TGltaXQ7XG4gICAgb3B0aW9ucy5wYXJzZUFycmF5cyA9IG9wdGlvbnMucGFyc2VBcnJheXMgIT09IGZhbHNlO1xuICAgIG9wdGlvbnMuZGVjb2RlciA9IHR5cGVvZiBvcHRpb25zLmRlY29kZXIgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLmRlY29kZXIgOiBkZWZhdWx0cy5kZWNvZGVyO1xuICAgIG9wdGlvbnMuYWxsb3dEb3RzID0gdHlwZW9mIG9wdGlvbnMuYWxsb3dEb3RzID09PSAnYm9vbGVhbicgPyBvcHRpb25zLmFsbG93RG90cyA6IGRlZmF1bHRzLmFsbG93RG90cztcbiAgICBvcHRpb25zLnBsYWluT2JqZWN0cyA9IHR5cGVvZiBvcHRpb25zLnBsYWluT2JqZWN0cyA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5wbGFpbk9iamVjdHMgOiBkZWZhdWx0cy5wbGFpbk9iamVjdHM7XG4gICAgb3B0aW9ucy5hbGxvd1Byb3RvdHlwZXMgPSB0eXBlb2Ygb3B0aW9ucy5hbGxvd1Byb3RvdHlwZXMgPT09ICdib29sZWFuJyA/IG9wdGlvbnMuYWxsb3dQcm90b3R5cGVzIDogZGVmYXVsdHMuYWxsb3dQcm90b3R5cGVzO1xuICAgIG9wdGlvbnMucGFyYW1ldGVyTGltaXQgPSB0eXBlb2Ygb3B0aW9ucy5wYXJhbWV0ZXJMaW1pdCA9PT0gJ251bWJlcicgPyBvcHRpb25zLnBhcmFtZXRlckxpbWl0IDogZGVmYXVsdHMucGFyYW1ldGVyTGltaXQ7XG4gICAgb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgPSB0eXBlb2Ygb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgPT09ICdib29sZWFuJyA/IG9wdGlvbnMuc3RyaWN0TnVsbEhhbmRsaW5nIDogZGVmYXVsdHMuc3RyaWN0TnVsbEhhbmRsaW5nO1xuXG4gICAgaWYgKHN0ciA9PT0gJycgfHwgc3RyID09PSBudWxsIHx8IHR5cGVvZiBzdHIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLnBsYWluT2JqZWN0cyA/IE9iamVjdC5jcmVhdGUobnVsbCkgOiB7fTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcE9iaiA9IHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnID8gcGFyc2VWYWx1ZXMoc3RyLCBvcHRpb25zKSA6IHN0cjtcbiAgICB2YXIgb2JqID0gb3B0aW9ucy5wbGFpbk9iamVjdHMgPyBPYmplY3QuY3JlYXRlKG51bGwpIDoge307XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgYW5kIHNldHVwIHRoZSBuZXcgb2JqZWN0XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRlbXBPYmopO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIG5ld09iaiA9IHBhcnNlS2V5cyhrZXksIHRlbXBPYmpba2V5XSwgb3B0aW9ucyk7XG4gICAgICAgIG9iaiA9IHV0aWxzLm1lcmdlKG9iaiwgbmV3T2JqLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXRpbHMuY29tcGFjdChvYmopO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3FzL2xpYi9wYXJzZS5qc1xuLy8gbW9kdWxlIGlkID0gNTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcbiAgICBcImRpdlwiLFxuICAgIHsgc3RhdGljQ2xhc3M6IFwicHJvZHNcIiB9LFxuICAgIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidG9wXCIgfSwgW19jKFwiTG9nb1wiKV0sIDEpLFxuICAgICAgX2MoXCJDYXJvdXNlbFwiKSxcbiAgICAgIF9jKFwicm91dGVyLWxpbmtcIiwgeyBzdGF0aWNDbGFzczogXCJLWkpcIiwgYXR0cnM6IHsgdG86IFwiL2xpc3QvMTAxMFwiIH0gfSwgW1xuICAgICAgICBfYyhcImltZ1wiLCB7IGF0dHJzOiB7IHNyYzogcmVxdWlyZShcImltYWdlcy9waWMyX2luZGV4LnBuZ1wiKSB9IH0pXG4gICAgICBdKSxcbiAgICAgIF9jKFxuICAgICAgICBcInJvdXRlci1saW5rXCIsXG4gICAgICAgIHsgc3RhdGljQ2xhc3M6IFwiWEdMTC1TUkxcIiwgYXR0cnM6IHsgdG86IFwiL2xpc3QvMTAyMFwiIH0gfSxcbiAgICAgICAgW19jKFwiaW1nXCIsIHsgYXR0cnM6IHsgc3JjOiByZXF1aXJlKFwiaW1hZ2VzL3BpYzNfaW5kZXgucG5nXCIpIH0gfSldXG4gICAgICApLFxuICAgICAgX2MoXCJyb3V0ZXItbGlua1wiLCB7IHN0YXRpY0NsYXNzOiBcIlRUQ1wiLCBhdHRyczogeyB0bzogXCIvbGlzdC8xMDMwXCIgfSB9LCBbXG4gICAgICAgIF9jKFwiaW1nXCIsIHsgYXR0cnM6IHsgc3JjOiByZXF1aXJlKFwiaW1hZ2VzL3BpYzRfaW5kZXgucG5nXCIpIH0gfSlcbiAgICAgIF0pXG4gICAgXSxcbiAgICAxXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTdlMjY0MzQ0XCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtN2UyNjQzNDRcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9JbmRleC52dWVcbi8vIG1vZHVsZSBpZCA9IDUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltYWdlcy9waWMyX2luZGV4LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2Fzc2V0cy9pbWFnZXMvcGljMl9pbmRleC5wbmdcbi8vIG1vZHVsZSBpZCA9IDUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltYWdlcy9waWMzX2luZGV4LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2Fzc2V0cy9pbWFnZXMvcGljM19pbmRleC5wbmdcbi8vIG1vZHVsZSBpZCA9IDUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltYWdlcy9waWM0X2luZGV4LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2Fzc2V0cy9pbWFnZXMvcGljNF9pbmRleC5wbmdcbi8vIG1vZHVsZSBpZCA9IDU0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LTQ3Y2RlNjViXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0xvZ2luLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vTG9naW4udnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi00N2NkZTY1YlxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vTG9naW4udnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LTQ3Y2RlNjViXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy92aWV3cy92dWVfcGFnZXMvTG9naW4udnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi00N2NkZTY1YlwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LTQ3Y2RlNjViXCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0xvZ2luLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi00N2NkZTY1YlwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9Mb2dpbi52dWVcbi8vIG1vZHVsZSBpZCA9IDU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZSBsYW5nPVwiamFkZVwiPlxuICAjbG9naW5cbiAgICAudG9wXG4gICAgICBMb2dvXG4gICAgICAvLy1TZWFyY2hcbiAgICBtYWluLm1haW5cbiAgICAgIGltZy5pbWcoIDpzcmM9XCJzcmNcIiApXG4gICAgICAubG9naW4tYXJlYVxuICAgICAgICBoMy50aXRsZVxuICAgICAgICAgIHNwYW4g55m75b2VXG4gICAgICAgICAgc3Bhbi5uby1sb2dpblxuICAgICAgICAgICAgfCDmsqHmnInluJDlj7fvvJ9cbiAgICAgICAgICAgIGEoIGhyZWY9XCIjXCIgKSDnq4vljbPms6jlhoxcbiAgICAgICAgLmZvcm1cbiAgICAgICAgICBpbnB1dC5uYW1lKHJlZj0naW5wdXROYW1lJyx0eXBlPVwidGV4dFwiLHYtbW9kZWw6bmFtZT0nbmFtZScpXG4gICAgICAgICAgaW5wdXQucGFzc3dvcmQocmVmPSdpbnB1dFBTJyx0eXBlPVwicGFzc3dvcmRcIixwbGFjZWhvbGRlcj1cIuWhq+WGmeaCqOeahOeZu+W9leWvhueggVwiLHYtbW9kZWw6cGFzc3dvcmQ9J3Bhc3N3b3JkJylcbiAgICAgICAgICAuYXV0by1sb2dpblxuICAgICAgICAgICAgLmF1dG9cbiAgICAgICAgICAgICAgaW5wdXQoIHR5cGU9XCJjaGVja2JveFwiIGlkPVwiYXV0b1wiIClcbiAgICAgICAgICAgICAgbGFiZWwoIGZvcj1cImF1dG9cIiApIOiHquWKqOeZu+W9lVxuICAgICAgICAgICAgYS5mb3JnZXQtcGFzc3dvcmQoIGhyZWY9XCIjXCIgKSDlv5jorrDlr4bnoIE/XG4gICAgICAgICAgYS5sb2dpbi1hY3RpdmUoIEBjbGljaz0nbG9naW4nICkg55m7IOW9lVxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLy8taW1wb3J0IFNlYXJjaCBmcm9tICdtb2R1bGVzL1NlYXJjaC52dWUnO1xuICBpbXBvcnQgTG9nbyBmcm9tICdtb2R1bGVzL0xvZ28udnVlJztcbiAgaW1wb3J0IFVSTFMgZnJvbSAnQC91bml0cy9DT05GSUcvdXJscyc7XG4gIGltcG9ydCBhamF4IGZyb20gJ0AvdW5pdHMvY29yZS9BSkFYJztcbiAgXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAnaW5kZXgnLFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIC8vLVNlYXJjaCxcbiAgICAgIExvZ29cbiAgICB9LFxuICAgIGRhdGEoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzcmM6ICcxMycsXG4gICAgICAgIG5hbWU6JycsXG4gICAgICAgIHBhc3N3b3JkOicnXG4gICAgICB9O1xuICAgIH0sXG4gICAgbWV0aG9kczp7XG4gICAgICAvKmRldGFpbOmhtea3u+WKoOWIsOi0reeJqei9piovXG4gICAgICBsb2dpbihyZXN1bHQpe1xuICAgICAgICBsZXQgdXJsID0gVVJMUy5CYXNlVVJMKycvYXBpL3JpZ2h0L2xvZ2luJztcbiAgICAgICAgaWYodGhpcy5uYW1lPT09Jycpe1xuICAgICAgICAgIGFsZXJ0KCfor7floavlhpnnlKjmiLflkI3miJbmiYvmnLrlj7cnKTtcbiAgICAgICAgICB0aGlzLiRyZWZzLmlucHV0TmFtZS5mb2N1cygpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfWVsc2UgaWYodGhpcy5wYXNzd29yZD09PScnKXtcbiAgICAgICAgICBhbGVydCgn6K+35aGr5YaZ55So5oi35a+G56CBJyk7XG4gICAgICAgICAgdGhpcy4kcmVmcy5pbnB1dFBTLmZvY3VzKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFqYXgucG9zdCgge1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIGFjY291bnRJRDp0aGlzLm5hbWUsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOnRoaXMucGFzc3dvcmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvZ2luOicscmVzKTtcbiAgICAgICAgICAgICAgaWYoIXJlcy5kYXRhKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ+i/lOWbnuW8guW4uDonLHJlcy5jb25maWcudXJsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZihTdHJpbmcocmVzLmRhdGEuY29kZSk9PT0nMCcpe1xuICAgICAgICAgICAgICAgIC8vYWxlcnQocmVzLmRhdGEubXNnKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRyb3V0ZXIucHVzaCgnLycpXG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGFsZXJ0KHJlcy5kYXRhLm1zZyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHJlcy5kYXRhLm1zZylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAjbG9naW5cbiAgICAudG9wXG4gICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW5cbiAgICAgIGJvcmRlci1ib3R0b20gMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgIG1hcmdpbi1yaWdodDogMjQwcHhcbiAgICAgIG1hcmdpbi1sZWZ0OiAzMTBweFxuICAgIC5tYWluXG4gICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICBiYWNrZ3JvdW5kOiAjZjBmM2Y1XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlclxuICAgICAgcGFkZGluZy10b3A6IDExMXB4XG4gICAgICBwYWRkaW5nLWJvdHRvbTogMTY4cHhcbiAgICAgIC5pbWdcbiAgICAgICAgd2lkdGg6IDYzM3B4XG4gICAgICAgIGhlaWdodDogYXV0b1xuICAgICAgLmxvZ2luLWFyZWFcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZlxuICAgICAgICB3aWR0aDogMzgzcHhcbiAgICAgICAgcGFkZGluZzogMjhweCA0MnB4IDQ2cHhcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveFxuICAgICAgICAudGl0bGVcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuXG4gICAgICAgICAgd2lkdGg6IDEwMCVcbiAgICAgICAgICBwYWRkaW5nLWJvdHRvbTogMTBweFxuICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjRThFOUYxXG4gICAgICAgICAgc3BhblxuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrXG4gICAgICAgICAgICBjb2xvcjogIzBFMTEzQVxuICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4XG4gICAgICAgICAgLm5vLWxvZ2luXG4gICAgICAgICAgICBmb250LXdlaWdodDogbm9ybWFsXG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICAgIGNvbG9yOiAjNjc2NzY3XG4gICAgICAuZm9ybVxuICAgICAgICBwYWRkaW5nLXRvcDogMzBweFxuICAgICAgICAubmFtZVxuICAgICAgICAucGFzc3dvcmRcbiAgICAgICAgICBkaXNwbGF5OiBibG9ja1xuICAgICAgICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXRcbiAgICAgICAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMHB4IGNlbnRlclxuICAgICAgICAgIHBhZGRpbmctbGVmdDogNDBweFxuICAgICAgICAgIHdpZHRoOiAyNjBweFxuICAgICAgICAgIGhlaWdodDogNDBweFxuICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNDNUM2RDZcbiAgICAgICAgICBjb2xvcjogIzBFMTEzQVxuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgICAubmFtZVxuICAgICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCggJ35pbWFnZXMvdXNlci5wbmcnIClcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4XG4gICAgICAgIC5wYXNzd29yZFxuICAgICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCggJ35pbWFnZXMvY29kZS5wbmcnIClcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxNXB4XG4gICAgICAgICAgY29sb3I6ICM5OTlcbiAgICAgICAgLmF1dG8tbG9naW5cbiAgICAgICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDI4cHhcbiAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDVweFxuICAgICAgICAgICAgY29sb3I6ICM5QjlCOUJcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgICAgIGFcbiAgICAgICAgICAgIGNvbG9yOiAjNDQ0QjlDXG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgLmxvZ2luLWFjdGl2ZVxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMyRDMxNkNcbiAgICAgICAgICBkaXNwbGF5OiBibG9ja1xuICAgICAgICAgIHdpZHRoOiAzMDBweFxuICAgICAgICAgIGhlaWdodDogNTBweDtcbiAgICAgICAgICBsaW5lLWhlaWdodDogNTBweFxuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDVweFxuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgICAgIGZvbnQtc2l6ZTogMTZweFxuICAgICAgICAgIGNvbG9yOiAjZmZmXG48L3N0eWxlPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvdmlld3MvdnVlX3BhZ2VzL0xvZ2luLnZ1ZT81MzgyZDQ3MSIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBhdHRyczogeyBpZDogXCJsb2dpblwiIH0gfSwgW1xuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidG9wXCIgfSwgW19jKFwiTG9nb1wiKV0sIDEpLFxuICAgIF9jKFwibWFpblwiLCB7IHN0YXRpY0NsYXNzOiBcIm1haW5cIiB9LCBbXG4gICAgICBfYyhcImltZ1wiLCB7IHN0YXRpY0NsYXNzOiBcImltZ1wiLCBhdHRyczogeyBzcmM6IF92bS5zcmMgfSB9KSxcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwibG9naW4tYXJlYVwiIH0sIFtcbiAgICAgICAgX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSksXG4gICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZm9ybVwiIH0sIFtcbiAgICAgICAgICBfYyhcImlucHV0XCIsIHtcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwibW9kZWxcIixcbiAgICAgICAgICAgICAgICByYXdOYW1lOiBcInYtbW9kZWw6bmFtZVwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBfdm0ubmFtZSxcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICBhcmc6IFwibmFtZVwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZWY6IFwiaW5wdXROYW1lXCIsXG4gICAgICAgICAgICBzdGF0aWNDbGFzczogXCJuYW1lXCIsXG4gICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInRleHRcIiB9LFxuICAgICAgICAgICAgZG9tUHJvcHM6IHsgdmFsdWU6IF92bS5uYW1lIH0sXG4gICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICBpbnB1dDogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCRldmVudC50YXJnZXQuY29tcG9zaW5nKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3ZtLm5hbWUgPSAkZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICAgICBfYyhcImlucHV0XCIsIHtcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwibW9kZWxcIixcbiAgICAgICAgICAgICAgICByYXdOYW1lOiBcInYtbW9kZWw6cGFzc3dvcmRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogX3ZtLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IFwicGFzc3dvcmRcIixcbiAgICAgICAgICAgICAgICBhcmc6IFwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVmOiBcImlucHV0UFNcIixcbiAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInBhc3N3b3JkXCIsXG4gICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInBhc3N3b3JkXCIsIHBsYWNlaG9sZGVyOiBcIuWhq+WGmeaCqOeahOeZu+W9leWvhueggVwiIH0sXG4gICAgICAgICAgICBkb21Qcm9wczogeyB2YWx1ZTogX3ZtLnBhc3N3b3JkIH0sXG4gICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICBpbnB1dDogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCRldmVudC50YXJnZXQuY29tcG9zaW5nKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3ZtLnBhc3N3b3JkID0gJGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICAgICAgX3ZtLl9tKDEsIGZhbHNlLCBmYWxzZSksXG4gICAgICAgICAgX2MoXCJhXCIsIHsgc3RhdGljQ2xhc3M6IFwibG9naW4tYWN0aXZlXCIsIG9uOiB7IGNsaWNrOiBfdm0ubG9naW4gfSB9LCBbXG4gICAgICAgICAgICBfdm0uX3YoXCLnmbsg5b2VXCIpXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgXSlcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiaDNcIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi55m75b2VXCIpXSksXG4gICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJuby1sb2dpblwiIH0sIFtcbiAgICAgICAgX3ZtLl92KFwi5rKh5pyJ5biQ5Y+377yfXCIpLFxuICAgICAgICBfYyhcImFcIiwgeyBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0sIFtfdm0uX3YoXCLnq4vljbPms6jlhoxcIildKVxuICAgICAgXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImF1dG8tbG9naW5cIiB9LCBbXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImF1dG9cIiB9LCBbXG4gICAgICAgIF9jKFwiaW5wdXRcIiwgeyBhdHRyczogeyB0eXBlOiBcImNoZWNrYm94XCIsIGlkOiBcImF1dG9cIiB9IH0pLFxuICAgICAgICBfYyhcImxhYmVsXCIsIHsgYXR0cnM6IHsgZm9yOiBcImF1dG9cIiB9IH0sIFtfdm0uX3YoXCLoh6rliqjnmbvlvZVcIildKVxuICAgICAgXSksXG4gICAgICBfYyhcImFcIiwgeyBzdGF0aWNDbGFzczogXCJmb3JnZXQtcGFzc3dvcmRcIiwgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbXG4gICAgICAgIF92bS5fdihcIuW/mOiusOWvhueggT9cIilcbiAgICAgIF0pXG4gICAgXSlcbiAgfVxuXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTQ3Y2RlNjViXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtNDdjZGU2NWJcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9Mb2dpbi52dWVcbi8vIG1vZHVsZSBpZCA9IDU4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWJmZDM3ZmM4XFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0xpc3QudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9MaXN0LnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtYmZkMzdmYzhcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0xpc3QudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LWJmZDM3ZmM4XCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy92aWV3cy92dWVfcGFnZXMvTGlzdC52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LWJmZDM3ZmM4XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtYmZkMzdmYzhcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy92aWV3cy92dWVfcGFnZXMvTGlzdC52dWVcbi8vIG1vZHVsZSBpZCA9IDU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtYmZkMzdmYzhcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvTGlzdC52dWVcbi8vIG1vZHVsZSBpZCA9IDYwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZSBsYW5nPVwiamFkZVwiPlxuICAubGlzdFxuICAgIC50b3BcbiAgICAgIExvZ29cbiAgICBTdWJNZW51KCA6Y29sb3I9XCJjb2xvclwiIClcbiAgICAuYmFubmVyXG4gICAgICBpbWcoIHNyYz1cIn5pbWFnZXMvbGlzdF9iYW5uZXIucG5nXCIgKVxuICAgIExpc3QoIDpsaXN0PVwibGlzdFwiIClcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgU3ViTWVudSBmcm9tICdtb2R1bGVzL1N1Yk1lbnUudnVlJztcbmltcG9ydCBMaXN0IGZyb20gJ21vZHVsZXMvTGlzdC52dWUnO1xuaW1wb3J0IENhcnQgZnJvbSAnQC91bml0cy9jb3JlL0NhcnQnO1xuaW1wb3J0IENPREVTIGZyb20gJ0AvdW5pdHMvQ09ORklHL2NvZGVzJztcbmltcG9ydCBVUkxTIGZyb20gJ0AvdW5pdHMvQ09ORklHL3VybHMnO1xuaW1wb3J0IEJ1cyBmcm9tICdAL3VuaXRzL2NvcmUvRXZlbnRCdXMnO1xuaW1wb3J0IGFqYXggZnJvbSAnQC91bml0cy9jb3JlL0FKQVgnO1xuaW1wb3J0IExvZ28gZnJvbSAnbW9kdWxlcy9Mb2dvLnZ1ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ2xpc3QnLFxuICBjb21wb25lbnRzOiB7XG4gICAgU3ViTWVudSxcbiAgICBMaXN0LFxuICAgIExvZ29cbiAgfSxcbiAgZGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGlzdDogW10sXG4gICAgICBjb2xvcjogJ2RhcmsnXG4gICAgfTtcbiAgfSxcbiAgbW91bnRlZCgpIHtcbiAgICAvLyB0b2RvOiDlrozmiJDlhYTlvJ/nu4Tku7bkuYvpl7TnmoTpgJrkv6FcbiAgICBCdXMuJG9uKCAndXBkYXRhTGlzdCcsIHBhcmFtcyA9PiB7XG4gICAgICB0aGlzLmdldExpc3QoIHBhcmFtcyApO1xuICAgIH0gKTtcbiAgICBDYXJ0LmdldENhcnRMaXN0KCB7XG4gICAgICAkc3RvcmU6IHRoaXMuJHN0b3JlXG4gICAgfSApO1xuICAgIHRoaXMuZ2V0TGlzdCgge1xuICAgICAgdHlwZTogdGhpcy4kcm91dGUucGFyYW1zLmlkXG4gICAgfSApO1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgLy8gdG9kbzog6K+75Y+W56uv5Y+j5YiX6KGo5L+h5oGvXG4gICAgZ2V0TGlzdCggcGFyYW1zICkge1xuICAgICAgYWpheC5nZXQoIHtcbiAgICAgICAgdXJsOiBVUkxTLkxJU1QsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgIGZsYWc6IDEsXG4gICAgICAgICAgICBjb21tb2RpdHlUeXBlSUQ6IHBhcmFtcy50eXBlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgIGxldCBkYXRhID0gcmVzLmRhdGE7XG5cbiAgICAgICAgICBpZiAoIGRhdGEuY29kZSA9PT0gQ09ERVMuU1VDQ0VTUyApIHtcbiAgICAgICAgICAgIGxldCBjb250ZW50ID0gZGF0YS5yZXN1bHQuY29udGVudCB8fCBkYXRhLnJlc3VsdDtcblxuICAgICAgICAgICAgdGhpcy5saXN0ID0gW107XG4gICAgICAgICAgICBjb250ZW50LmZvckVhY2goIGl0ZW0gPT4ge1xuICAgICAgICAgICAgICBpdGVtLnBpYyA9IGl0ZW0ucGljID8gVVJMUy5CYXNlVVJMICsgaXRlbS5waWMgOiAnJztcbiAgICAgICAgICAgICAgdGhpcy5saXN0LnB1c2goIHtcbiAgICAgICAgICAgICAgICBpZDogaXRlbS5jb21tb2RpdHlJRCxcbiAgICAgICAgICAgICAgICBpbWc6IGl0ZW0ucGljLFxuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0uY29tbW9kaXR5TmFtZSxcbiAgICAgICAgICAgICAgICBtb25leTogaXRlbS5wcmljZVxuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybiggcmVzLmRhdGEubXNnICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG59O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAubGlzdFxuICAgIC50b3BcbiAgICAgIGRpc3BsYXk6IGZsZXhcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXJcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlblxuICAgICAgYm9yZGVyLWJvdHRvbSAxcHggc29saWQgI0YwRjNGNVxuICAgICAgbWFyZ2luLXJpZ2h0OiAyNDBweFxuICAgICAgbWFyZ2luLWxlZnQ6IDMxMHB4XG4gICAgLmJhbm5lclxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzA4MGQzM1xuICAgICAgdGV4dC1hbGlnbjogY2VudGVyXG4gICAgICBpbWdcbiAgICAgICAgbWF4LXdpZHRoIDEwMCVcbiAgICAgICAgbWF4LWhlaWdodCAxMDAlXG48L3N0eWxlPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy92aWV3cy92dWVfcGFnZXMvTGlzdC52dWU/NDVhN2U4OWMiLCJ2YXIgZGlzcG9zZWQgPSBmYWxzZVxuZnVuY3Rpb24gaW5qZWN0U3R5bGUgKHNzckNvbnRleHQpIHtcbiAgaWYgKGRpc3Bvc2VkKSByZXR1cm5cbiAgcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XFxcIm9taXRcXFwiOjEsXFxcInJlbW92ZVxcXCI6dHJ1ZSxcXFwicHVibGljUGF0aFxcXCI6XFxcIi4uL1xcXCJ9IXZ1ZS1zdHlsZS1sb2FkZXIhY3NzLWxvYWRlcj97XFxcIm1pbmltaXplXFxcIjpmYWxzZX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4P3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi05NTFlY2E2NFxcXCIsXFxcInNjb3BlZFxcXCI6dHJ1ZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjpmYWxzZX0hc3R5bHVzLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9TdWJNZW51LnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vU3ViTWVudS52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTk1MWVjYTY0XFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9TdWJNZW51LnZ1ZVwiXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBcImRhdGEtdi05NTFlY2E2NFwiXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvbW9kdWxlcy9TdWJNZW51LnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtOTUxZWNhNjRcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi05NTFlY2E2NFwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvU3ViTWVudS52dWVcbi8vIG1vZHVsZSBpZCA9IDYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtOTUxZWNhNjRcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL1N1Yk1lbnUudnVlXG4vLyBtb2R1bGUgaWQgPSA2M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgbWVudS5tZW51KCA6Y2xhc3M9XCJiZ1wiIClcbiAgICB1bFxuICAgICAgbGkoIDpjbGFzcz1cIntjdXJyOiBremp9XCIgKVxuICAgICAgICBhKCBocmVmPVwiI1wiIHR5cGU9XCIxMDEwXCIgQGNsaWNrLnByZXZlbnQ9XCJ1cGRhdGVMaXN0KCAkZXZlbnQgKVwiICkg5Y+j5a2Q56qWXG4gICAgICAgIHNwYW5cbiAgICAgIGxpKCA6Y2xhc3M9XCJ7Y3VycjogeGdsYX1cIiApXG4gICAgICAgIGEoIGhyZWY9XCIjXCIgdHlwZT1cIjEwMjBcIiBAY2xpY2sucHJldmVudD1cInVwZGF0ZUxpc3QoICRldmVudCApXCIgKSDpppnmoLzph4zmi4lcbiAgICAgICAgc3BhblxuICAgICAgbGkoIDpjbGFzcz1cIntjdXJyOiB0dGN9XCIgKVxuICAgICAgICBhKCBocmVmPVwiI1wiIHR5cGU9XCIxMDMwXCIgQGNsaWNrLnByZXZlbnQ9XCJ1cGRhdGVMaXN0KCAkZXZlbnQgKVwiICkg5Zyf54m55LqnXG4gICAgICAgIHNwYW5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCBCdXMgZnJvbSAnQC91bml0cy9jb3JlL0V2ZW50QnVzJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3N1Yk1lbnUnLFxuICAgIHByb3BzOiBbJ2NvbG9yJ10sXG4gICAgZGF0YSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGt6ajogdHJ1ZSxcbiAgICAgICAgeGdsYTogZmFsc2UsXG4gICAgICAgIHR0YzogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcbiAgICBjcmVhdGVkKCl7XG4gICAgICB0aGlzLmNoYW5nZUN1cnJlbnQoe3R5cGU6dGhpcy4kcm91dGUucGFyYW1zLmlkfSk7XG4gICAgfSxcbiAgICBjb21wdXRlZDoge1xuICAgICAgYmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgLy8gdG9kbzog5pu05paw5YiX6KGo5YaF5a65XG4gICAgICB1cGRhdGVMaXN0KCBldnQgKSB7XG4gICAgICAgIGxldCB0eXBlID0gZXZ0LnRhcmdldC5nZXRBdHRyaWJ1dGUoICd0eXBlJyApO1xuXG4gICAgICAgIC8vIHRvZG86IOWujOaIkOWFhOW8n+e7hOS7tuS5i+mXtOeahOmAmuS/oVxuICAgICAgICBCdXMuJGVtaXQoICd1cGRhdGFMaXN0Jywge1xuICAgICAgICAgIHR5cGVcbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIHRvZG86IOS/ruaUueW9k+WJjemAieS4reeKtuaAgVxuICAgICAgICB0aGlzLmNoYW5nZUN1cnJlbnQoIHtcbiAgICAgICAgICB0eXBlXG4gICAgICAgIH0gKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIHRvZG86IOS/ruaUueW9k+WJjemAieS4reeKtuaAgVxuICAgICAgY2hhbmdlQ3VycmVudCggcGFyYW1zICkge1xuICAgICAgICBzd2l0Y2ggKCBwYXJhbXMudHlwZSApIHtcbiAgICAgICAgICBjYXNlICcxMDEwJzpcbiAgICAgICAgICAgIHRoaXMua3pqID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMueGdsYSA9IHRoaXMudHRjID0gIXRoaXMua3pqO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnMTAyMCc6XG4gICAgICAgICAgICB0aGlzLnhnbGEgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5remogPSB0aGlzLnR0YyA9ICF0aGlzLnhnbGE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcxMDMwJzpcbiAgICAgICAgICAgIHRoaXMudHRjID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMua3pqID0gdGhpcy54Z2xhID0gIXRoaXMudHRjO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kcm91dGVyLnJlcGxhY2UoJy9saXN0LycrcGFyYW1zLnR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAuZGFya1xuICAgIGJhY2tncm91bmQ6ICMwRTExM0FcbiAgICBhXG4gICAgICBjb2xvcjogI2ZmZmZmZlxuICAgICAgJjpob3ZlclxuICAgICAgICBiYWNrZ3JvdW5kOiAjMkQzMTZDXG4gICAgLmN1cnJcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZVxuICAgICAgYmFja2dyb3VuZDogIzJEMzE2Q1xuICAgICAgc3BhblxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGVcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZlxuICAgICAgICBib3R0b206IDBcbiAgICAgICAgbGVmdDogNTAlXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMjVweFxuICAgICAgICB3aWR0aDogNTBweFxuICAgICAgICBoZWlnaHQ6IDJweFxuICAud2hpdGVcbiAgICBiYWNrZ3JvdW5kOiAjZjBmM2Y1XG4gICAgYVxuICAgICAgY29sb3I6ICMzMzMzMzNcbiAgICAgICY6aG92ZXJcbiAgICAgICAgY29sb3I6ICMyZDMxNmNcbiAgICAuY3VyclxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlXG4gICAgICBiYWNrZ3JvdW5kOiAjZjBmM2Y1XG4gICAgICBzcGFuXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZVxuICAgICAgICBiYWNrZ3JvdW5kOiAjMkQzMTZDXG4gICAgICAgIGJvdHRvbTogMFxuICAgICAgICBsZWZ0OiA1MCVcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC0yNXB4XG4gICAgICAgIHdpZHRoOiA1MHB4XG4gICAgICAgIGhlaWdodDogMnB4XG4gIC5tZW51XG4gICAgZGlzcGxheSBmbGV4XG4gICAgYWxpZ24taXRlbXMgY2VudGVyXG4gICAganVzdGlmeS1jb250ZW50IGNlbnRlclxuICAgIG1hcmdpbjogMFxuICAgIGhlaWdodDogNDBweFxuICAgIHVsXG4gICAgICBvdmVyZmxvdzogaGlkZGVuXG4gICAgICBsaVxuICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgZmxvYXQgbGVmdFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQgY2VudGVyXG4gICAgICAgIGZvbnQtc2l6ZTogMTZweFxuICAgICAgICBhXG4gICAgICAgICAgcGFkZGluZzogOXB4IDE4cHhcbjwvc3R5bGU+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL21vZHVsZXMvU3ViTWVudS52dWU/NWVjZWQwZDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFwibWVudVwiLCB7IHN0YXRpY0NsYXNzOiBcIm1lbnVcIiwgY2xhc3M6IF92bS5iZyB9LCBbXG4gICAgX2MoXCJ1bFwiLCBbXG4gICAgICBfYyhcImxpXCIsIHsgY2xhc3M6IHsgY3VycjogX3ZtLmt6aiB9IH0sIFtcbiAgICAgICAgX2MoXG4gICAgICAgICAgXCJhXCIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgYXR0cnM6IHsgaHJlZjogXCIjXCIsIHR5cGU6IFwiMTAxMFwiIH0sXG4gICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICBfdm0udXBkYXRlTGlzdCgkZXZlbnQpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFtfdm0uX3YoXCLlj6PlrZDnqpZcIildXG4gICAgICAgICksXG4gICAgICAgIF9jKFwic3BhblwiKVxuICAgICAgXSksXG4gICAgICBfYyhcImxpXCIsIHsgY2xhc3M6IHsgY3VycjogX3ZtLnhnbGEgfSB9LCBbXG4gICAgICAgIF9jKFxuICAgICAgICAgIFwiYVwiLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGF0dHJzOiB7IGhyZWY6IFwiI1wiLCB0eXBlOiBcIjEwMjBcIiB9LFxuICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCRldmVudCkge1xuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgX3ZtLnVwZGF0ZUxpc3QoJGV2ZW50KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBbX3ZtLl92KFwi6aaZ5qC86YeM5ouJXCIpXVxuICAgICAgICApLFxuICAgICAgICBfYyhcInNwYW5cIilcbiAgICAgIF0pLFxuICAgICAgX2MoXCJsaVwiLCB7IGNsYXNzOiB7IGN1cnI6IF92bS50dGMgfSB9LCBbXG4gICAgICAgIF9jKFxuICAgICAgICAgIFwiYVwiLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGF0dHJzOiB7IGhyZWY6IFwiI1wiLCB0eXBlOiBcIjEwMzBcIiB9LFxuICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCRldmVudCkge1xuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgX3ZtLnVwZGF0ZUxpc3QoJGV2ZW50KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBbX3ZtLl92KFwi5Zyf54m55LqnXCIpXVxuICAgICAgICApLFxuICAgICAgICBfYyhcInNwYW5cIilcbiAgICAgIF0pXG4gICAgXSlcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTk1MWVjYTY0XCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtOTUxZWNhNjRcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvU3ViTWVudS52dWVcbi8vIG1vZHVsZSBpZCA9IDY1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWRlY2ZmMGMyXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0xpc3QudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9MaXN0LnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtZGVjZmYwYzJcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0xpc3QudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LWRlY2ZmMGMyXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy9tb2R1bGVzL0xpc3QudnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi1kZWNmZjBjMlwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LWRlY2ZmMGMyXCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbW9kdWxlcy9MaXN0LnZ1ZVxuLy8gbW9kdWxlIGlkID0gNjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi1kZWNmZjBjMlwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvTGlzdC52dWVcbi8vIG1vZHVsZSBpZCA9IDY3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZSBsYW5nPVwiamFkZVwiPlxuICAubGlzdC1pdGVtc1xuICAgIHVsXG4gICAgICBsaSggdi1mb3I9XCJpdGVtIGluIGxpc3RcIiApXG4gICAgICAgIGltZyggOnNyYz1cIml0ZW0uaW1nXCIsQGNsaWNrPSdjbGlja0hhbmRsZXInKVxuICAgICAgICBzcGFuIHt7aXRlbS5uYW1lfX1cbiAgICAgICAgc3Bhbi5tb25leSB7e2l0ZW0ubW9uZXl9fVxuICAgICAgICBzcGFuLmFkZCggOmlkPVwiaXRlbS5pZFwiLCBAY2xpY2s9XCJhZGRUb0NhcnRcIiApIOWKoOWFpei0reeJqei9plxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCBVUkxTIGZyb20gJ0AvdW5pdHMvQ09ORklHL3VybHMnO1xuaW1wb3J0IGFqYXggZnJvbSAnQC91bml0cy9jb3JlL0FKQVgnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdsaXN0JyxcbiAgcHJvcHM6IFsnbGlzdCddLFxuICBtZXRob2RzOiB7XG4gICAgY2xpY2tIYW5kbGVyKCkge1xuICAgICAgdGhpcy4kcm91dGVyLnB1c2goICcvZGV0YWlsLycgKyB0aGlzLiRyb3V0ZS5wYXJhbXMuaWQgKTtcbiAgICB9LFxuICAgIGFkZFRvQ2FydCggZXZ0ICkge1xuICAgICAgbGV0IHRhcmdldCA9IGV2dC50YXJnZXQ7XG5cbiAgICAgIGFqYXgucG9zdCgge1xuICAgICAgICB1cmw6IFVSTFMuQUREVE9DQVJULFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdXNlcklEOiAnNzAzZDA2NWIwYjY4NGFlOWJmNGZhM2JlNjdhNDcyNmMnLFxuICAgICAgICAgIGNvbW1vZGl0eUlEOiB0YXJnZXQuaWQsXG4gICAgICAgICAgbnVtOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgdGhpcy4kc3RvcmUuZGlzcGF0Y2goICdjaGFuZ2VDYXJ0TnVtJywge1xuICAgICAgICAgICAgbnVtOiB0aGlzLiRzdG9yZS5nZXR0ZXJzLmdldENhcnROdW0gKyAxXG4gICAgICAgICAgfSApO1xuICAgICAgICAgIGlmICggIXJlcy5kYXRhICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCAn6L+U5Zue5byC5bi4OicsIHJlcy5jb25maWcudXJsICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggU3RyaW5nKCByZXMuZGF0YS5jb2RlICkgPT09ICcwJyApIHtcbiAgICAgICAgICAgIGFsZXJ0KCByZXMuZGF0YS5tc2cgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCByZXMuZGF0YS5tc2cgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gIC5saXN0LWl0ZW1zXG4gICAgdWxcbiAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zIDFmciAxZnIgMWZyXG4gICAgICBncmlkLWdhcCAxcHhcbiAgICAgIGp1c3RpZnktY29udGVudCBjZW50ZXJcbiAgICAgIG1hcmdpbjogMCAyMzBweCAzMHB4XG4gICAgICBib3JkZXItbGVmdCAxcHggc29saWQgI0YwRjNGNVxuICAgICAgbGlcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZmZmZlxuICAgICAgICBwYWRkaW5nLWJvdHRvbTogNTBweFxuICAgICAgICBib3JkZXItbGVmdCAwXG4gICAgICAgIGJvcmRlci1yaWdodCAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICAgIGZvbnQtc2l6ZTogMTZweFxuICAgICAgICBjb2xvcjogIzMzMzMzM1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgaW1nXG4gICAgICAgICAgd2lkdGggMzIwcHhcbiAgICAgICAgICBjdXJzb3IgcG9pbnRlclxuICAgICAgICBzcGFuXG4gICAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICAubW9uZXlcbiAgICAgICAgICBtYXJnaW4tdG9wOiAxMHB4XG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMThweFxuICAgICAgICAgICY6YmVmb3JlXG4gICAgICAgICAgICBjb250ZW50ICfvv6UnXG4gICAgICAgIC5hZGRcbiAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2tcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXJcbiAgICAgICAgICBjb2xvcjogIzJkMzE2Y1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTZweFxuICAgICAgICAgICY6YmVmb3JlXG4gICAgICAgICAgICBjb250ZW50ICcrJ1xuICAgICAgICAgICAgcGFkZGluZy1yaWdodDogNXB4XG48L3N0eWxlPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9tb2R1bGVzL0xpc3QudnVlPzYyZTBhYzIyIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImxpc3QtaXRlbXNcIiB9LCBbXG4gICAgX2MoXG4gICAgICBcInVsXCIsXG4gICAgICBfdm0uX2woX3ZtLmxpc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIF9jKFwibGlcIiwgW1xuICAgICAgICAgIF9jKFwiaW1nXCIsIHtcbiAgICAgICAgICAgIGF0dHJzOiB7IHNyYzogaXRlbS5pbWcgfSxcbiAgICAgICAgICAgIG9uOiB7IGNsaWNrOiBfdm0uY2xpY2tIYW5kbGVyIH1cbiAgICAgICAgICB9KSxcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihfdm0uX3MoaXRlbS5uYW1lKSldKSxcbiAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJtb25leVwiIH0sIFtfdm0uX3YoX3ZtLl9zKGl0ZW0ubW9uZXkpKV0pLFxuICAgICAgICAgIF9jKFxuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcImFkZFwiLFxuICAgICAgICAgICAgICBhdHRyczogeyBpZDogaXRlbS5pZCB9LFxuICAgICAgICAgICAgICBvbjogeyBjbGljazogX3ZtLmFkZFRvQ2FydCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW192bS5fdihcIuWKoOWFpei0reeJqei9plwiKV1cbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICB9KVxuICAgIClcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LWRlY2ZmMGMyXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtZGVjZmYwYzJcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvTGlzdC52dWVcbi8vIG1vZHVsZSBpZCA9IDY5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXG4gICAgXCJkaXZcIixcbiAgICB7IHN0YXRpY0NsYXNzOiBcImxpc3RcIiB9LFxuICAgIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidG9wXCIgfSwgW19jKFwiTG9nb1wiKV0sIDEpLFxuICAgICAgX2MoXCJTdWJNZW51XCIsIHsgYXR0cnM6IHsgY29sb3I6IF92bS5jb2xvciB9IH0pLFxuICAgICAgX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSksXG4gICAgICBfYyhcIkxpc3RcIiwgeyBhdHRyczogeyBsaXN0OiBfdm0ubGlzdCB9IH0pXG4gICAgXSxcbiAgICAxXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiYmFubmVyXCIgfSwgW1xuICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IHJlcXVpcmUoXCJpbWFnZXMvbGlzdF9iYW5uZXIucG5nXCIpIH0gfSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtYmZkMzdmYzhcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi1iZmQzN2ZjOFwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0xpc3QudnVlXG4vLyBtb2R1bGUgaWQgPSA3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJpbWFnZXMvbGlzdF9iYW5uZXIucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXNzZXRzL2ltYWdlcy9saXN0X2Jhbm5lci5wbmdcbi8vIG1vZHVsZSBpZCA9IDcxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LTEwNTdiZGI0XFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL1Nob3BwaW5nQ2FydC52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL1Nob3BwaW5nQ2FydC52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTEwNTdiZGI0XFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9TaG9wcGluZ0NhcnQudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LTEwNTdiZGI0XCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy92aWV3cy92dWVfcGFnZXMvU2hvcHBpbmdDYXJ0LnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtMTA1N2JkYjRcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi0xMDU3YmRiNFwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9TaG9wcGluZ0NhcnQudnVlXG4vLyBtb2R1bGUgaWQgPSA3MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XCJvbWl0XCI6MSxcInJlbW92ZVwiOnRydWUsXCJwdWJsaWNQYXRoXCI6XCIuLi9cIn0hLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlciEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyP3tcIm1pbmltaXplXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LTEwNTdiZGI0XCIsXCJzY29wZWRcIjp0cnVlLFwiaGFzSW5saW5lQ29uZmlnXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3N0eWx1cy1sb2FkZXIhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1Nob3BwaW5nQ2FydC52dWVcbi8vIG1vZHVsZSBpZCA9IDczXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZSBsYW5nPVwiamFkZVwiPlxuICAuc2hvcHBpbmctY2FydFxuICAgIC50b3BcbiAgICAgIExvZ29cbiAgICAgIFByb2Nlc3MoIDpzdGVwPVwic3RlcFwiLCA6c3RlcHM9XCJzdGVwc1wiIClcbiAgICAuaGVhZGVyXG4gICAgICBzcGFuLm5hbWUg5ZWG5ZOBXG4gICAgICBzcGFuLnByaWNlIOWNleS7t1xuICAgICAgc3Bhbi5udW0g5pWw6YePXG4gICAgICBzcGFuLmNvdW50IOWwj+iuoVxuICAgICAgc3Bhbi5vcGVyYXRlIOaTjeS9nFxuICAgIC5ib2R5XG4gICAgICB0cmFuc2l0aW9uLWdyb3VwKCBuYW1lPVwiaXRlbWxpc3RcIiB0YWc9XCJkaXZcIiApXG4gICAgICAgIC5yb3coIHYtZm9yPVwiKGl0ZW0sIGluZGV4KSBpbiBpdGVtc1wiLCA6a2V5PVwiaXRlbS5jYXJ0TGlzdElEXCIgKVxuICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgIGltZyggOnNyYz1cIml0ZW0uY29tbW9kaXR5LnBpY1wiIClcbiAgICAgICAgICAgIHNwYW4ge3tpdGVtLmNvbW1vZGl0eS5jb21tb2RpdHlOYW1lfX1cbiAgICAgICAgICBzcGFuLnByaWNlXG4gICAgICAgICAgICBlbS5saW5lLXRocm91Z2gg5oyH5a+85Lu3XG4gICAgICAgICAgICAgaSDvv6V7e2l0ZW0uY29tbW9kaXR5LnByaWNlfX1cbiAgICAgICAgICAgIGVtIOS8muWRmOS7tyDvv6V7e3R5cGVvZiBpdGVtLmNvbW1vZGl0eS5jb21tb2RpdHlDaGFubmVsID09PSAnbnVtYmVyJyA/IGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWwgOiAwfX1cbiAgICAgICAgICBzcGFuLm51bVxuICAgICAgICAgICAgZW0ucmVkdWNlKCBAY2xpY2s9XCJyZWR1Y2UoIGluZGV4IClcIiApIC1cbiAgICAgICAgICAgIGlucHV0KCB0eXBlPVwidGV4dFwiLCA6dmFsdWU9XCJpdGVtLm51bVwiIClcbiAgICAgICAgICAgIGVtLmFkZCggQGNsaWNrPVwiYWRkKCBpbmRleCApXCIgKSArXG4gICAgICAgICAgc3Bhbi5jb3VudCB7e2l0ZW0udG90YWxBbW91bnR9fVxuICAgICAgICAgIHNwYW4ub3BlcmF0ZSBcbiAgICAgICAgICAgIGVtKCBAY2xpY2s9XCJkZWwoIGluZGV4LCBpdGVtLmNhcnRMaXN0SUQgKVwiICkg5Yig6ZmkXG4gICAgLmZvb3RlclxuICAgICAgc3Bhbi5hY2NvdW50KCBAY2xpY2s9XCJjb21taXRcIikg56uL5Y2z57uT566XXG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuaW1wb3J0IFByb2Nlc3MgZnJvbSAnbW9kdWxlcy9Qcm9jZXNzLnZ1ZSc7XG5pbXBvcnQgTG9nbyBmcm9tICdtb2R1bGVzL0xvZ28udnVlJztcbmltcG9ydCBDT0RFUyBmcm9tICdAL3VuaXRzL0NPTkZJRy9jb2Rlcyc7XG5pbXBvcnQgVVJMUyBmcm9tICdAL3VuaXRzL0NPTkZJRy91cmxzJztcbmltcG9ydCBhamF4IGZyb20gJ0AvdW5pdHMvY29yZS9BSkFYJztcbmltcG9ydCBDYXJ0IGZyb20gJ0AvdW5pdHMvY29yZS9DYXJ0JztcblxubGV0IHRpbWU7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ2NhcnQnLFxuICBjb21wb25lbnRzOiB7XG4gICAgUHJvY2VzcyxcbiAgICBMb2dvXG4gIH0sXG4gIGRhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0ZXA6IDEsXG4gICAgICBzdGVwczogW1xuICAgICAgICAn5p+l55yL6LSt54mp6L2mJyxcbiAgICAgICAgJ+ehruiupOiuouWNleS/oeaBrycsXG4gICAgICAgICflnKjnur/ku5jmrL4nLFxuICAgICAgICAn5pS26LSnJ1xuICAgICAgXSxcbiAgICAgIGl0ZW1zOiBbXVxuICAgIH07XG4gIH0sXG4gIG1vdW50ZWQoKSB7XG4gICAgQ2FydC5nZXRDYXJ0TGlzdCgge1xuICAgICAgJHN0b3JlOiB0aGlzLiRzdG9yZSxcbiAgICAgIHN1Y2Nlc3M6IGRhdGEgPT4ge1xuICAgICAgICBkYXRhLnJlc3VsdC5mb3JFYWNoKCBpdGVtID0+IHtcbiAgICAgICAgICBpdGVtLmNvbW1vZGl0eS5waWMgPSBpdGVtLmNvbW1vZGl0eS5waWNcbiAgICAgICAgICAgID8gVVJMUy5CYXNlVVJMICsgaXRlbS5jb21tb2RpdHkucGljXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IGRhdGEucmVzdWx0O1xuICAgICAgfVxuICAgIH0gKTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIC8vIHRvZG86IOWinuWKoOaVsOmHj1xuICAgIGFkZCggaW5kZXggKSB7XG4gICAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xuXG4gICAgICBpdGVtLm51bSArPSAxO1xuICAgICAgaXRlbS50b3RhbEFtb3VudCA9IGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWxcbiAgICAgICAgPyBpdGVtLm51bSAqIGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWxcbiAgICAgICAgOiBpdGVtLm51bSAqIGl0ZW0uY29tbW9kaXR5LnByaWNlO1xuICAgICAgdGhpcy5jaGFuZ2VDb21tb2RpdHlOdW0oIHtcbiAgICAgICAgaWQ6IGl0ZW0uY2FydExpc3RJRCxcbiAgICAgICAgbnVtOiBpdGVtLm51bVxuICAgICAgfSApO1xuICAgIH0sXG5cbiAgICAvLyB0b2RvOiDliKDlh4/mlbDph49cbiAgICByZWR1Y2UoIGluZGV4ICkge1xuICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgIGxldCB2YWwgPSBpdGVtLm51bSAtIDE7XG5cbiAgICAgIGl0ZW0ubnVtID0gdmFsID4gMCA/IHZhbCA6IDE7XG4gICAgICBpdGVtLnRvdGFsQW1vdW50ID0gaXRlbS5jb21tb2RpdHkuY29tbW9kaXR5Q2hhbm5lbFxuICAgICAgICA/IGl0ZW0ubnVtICogaXRlbS5jb21tb2RpdHkuY29tbW9kaXR5Q2hhbm5lbFxuICAgICAgICA6IGl0ZW0ubnVtICogaXRlbS5jb21tb2RpdHkucHJpY2U7XG4gICAgICB0aGlzLmNoYW5nZUNvbW1vZGl0eU51bSgge1xuICAgICAgICBpZDogaXRlbS5jYXJ0TGlzdElELFxuICAgICAgICBudW06IGl0ZW0ubnVtXG4gICAgICB9ICk7XG4gICAgfSxcblxuICAgIC8vIHRvZG86IOWIoOmZpOadoeebrlxuICAgIGRlbCggaW5kZXgsIGlkICkge1xuICAgICAgYWpheC5wb3N0KCB7XG4gICAgICAgIHVybDogVVJMUy5kZWxDb21tb2RpdHksXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjYXJ0TGlzdElEOiBpZFxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgIHJlcy5kYXRhLmNvZGUgPT09IENPREVTLlNVQ0NFU1NcbiAgICAgICAgICAgID8gdGhpcy5pdGVtcy5zcGxpY2UoIGluZGV4LCAxIClcbiAgICAgICAgICAgIDogY29uc29sZS5lcnJvciggcmVzLm1zZyApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfSxcblxuICAgIC8vIHRvZG86IOavj+S/ruaUueS4gOasoeaVsOmHj+mDveimgeWQkeWQjuerr+iusOW9leS4gOS4i1xuICAgIGNoYW5nZUNvbW1vZGl0eU51bSggcGFyYW1zICkge1xuICAgICAgbGV0IG1zID0gMTAwMDtcblxuICAgICAgY2xlYXJUaW1lb3V0KCB0aW1lICk7XG4gICAgICB0aW1lID0gc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICBhamF4LnBvc3QoIHtcbiAgICAgICAgICB1cmw6IFVSTFMuY2hhbmdlQ29tbW9kaXR5TnVtLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGNhcnRMaXN0SUQ6IHBhcmFtcy5pZCxcbiAgICAgICAgICAgIG51bTogcGFyYW1zLm51bVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3VjY2VzcyggcmVzICkge1xuICAgICAgICAgICAgcmVzLmRhdGEuY29kZSAhPT0gQ09ERVMuU1VDQ0VTUyAmJiBjb25zb2xlLmVycm9yKCByZXMubXNnICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9LCBtcyApO1xuICAgIH0sXG5cbiAgICAvLyB0b2RvOiDnq4vljbPnu5PnrpdcbiAgICBjb21taXQoKSB7XG4gICAgICBjb25zb2xlLmxvZyggdGhpcy4kc3RvcmUgKTtcbiAgICAgIGFqYXgucG9zdCgge1xuICAgICAgICB1cmw6IFVSTFMuY29tbWl0Q2FydCxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHVzZXJJRDogJzcwM2QwNjViMGI2ODRhZTliZjRmYTNiZTY3YTQ3MjZjJyxcbiAgICAgICAgICBjYXJ0czogdGhpcy4kc3RvcmUuZ2V0dGVycy5nZXRDYXJ0SXRlbXNcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggcmVzICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIC8qXG4gICAgICB0aGlzLiRyb3V0ZXIucHVzaCgge1xuICAgICAgICBwYXRoOiAnL2NvbmZpcm0nXG4gICAgICB9ICk7XG4gICAgICAqL1xuICAgIH1cbiAgfVxufTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgbGFuZz1cInN0eWx1c1wiIHNjb3BlZD5cbiAgLml0ZW1saXN0LWVudGVyLWFjdGl2ZSxcbiAgLml0ZW1saXN0LWxlYXZlLWFjdGl2ZSBcbiAgICB0cmFuc2l0aW9uOiBhbGwgMXM7XG5cbiAgLml0ZW1saXN0LWVudGVyLFxuICAuaXRlbWxpc3QtbGVhdmUtYWN0aXZlIFxuICAgIG9wYWNpdHk6IDA7XG5cbiAgLnNob3BwaW5nLWNhcnRcbiAgICAudG9wXG4gICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW5cbiAgICAgIGJvcmRlci1ib3R0b20gMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgIG1hcmdpbi1yaWdodDogMjQwcHhcbiAgICAgIG1hcmdpbi1sZWZ0OiAzMTBweFxuICAgIC5oZWFkZXJcbiAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zIDM3MHB4IDJmciAyZnIgMWZyIDFmclxuICAgICAgbWFyZ2luLWxlZnQ6IDMxMHB4XG4gICAgICBtYXJnaW4tcmlnaHQ6IDI0MHB4XG4gICAgLmJvZHlcbiAgICAgIHBhZGRpbmctbGVmdDogMzEwcHhcbiAgICAgIHBhZGRpbmctcmlnaHQ6IDI0MHB4XG4gICAgICAucm93XG4gICAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnMgMzcwcHggMmZyIDJmciAxZnIgMWZyXG4gICAgLmhlYWRlclxuICAgICAgYmFja2dyb3VuZDogI0Y0RjVGQlxuICAgICAgaGVpZ2h0OiA0MHB4XG4gICAgICBsaW5lLWhlaWdodDogNDBweFxuICAgICAgbWFyZ2luLXRvcDogMjBweFxuICAgICAgY29sb3I6ICMzMzMzMzNcbiAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyXG4gICAgICBpbnB1dFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDVweFxuICAgIC5ib2R5XG4gICAgICBiYWNrZ3JvdW5kOiAjZmZmZmZmXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgY29sb3I6ICMzMzMzMzNcbiAgICAgIC5yb3dcbiAgICAgICAgYm9yZGVyLWJvdHRvbSAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICBzcGFuXG4gICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgYWxpZ24taXRlbXMgY2VudGVyXG4gICAgICAgICAganVzdGlmeS1jb250ZW50IGNlbnRlclxuICAgICAgICAgICY6Zmlyc3QtY2hpbGRcbiAgICAgICAgICAgIHRleHQtYWxpZ24gbGVmdFxuICAgICAgICAgIGltZ1xuICAgICAgICAgICAgd2lkdGggMTgwcHhcbiAgICAgICAgICBpbnB1dFxuICAgICAgICAgICAgd2lkdGg6IDcwcHhcbiAgICAgICAgICAgIGhlaWdodDogMzZweFxuICAgICAgICAgICAgYm9yZGVyIDFweCBzb2xpZCAjQzVDNkQ2XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzIDJweFxuICAgICAgICAgICAgbWFyZ2luIDAgNXB4XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgLm9wZXJhdGVcbiAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICBjb2xvcjogIzJkMzE2Y1xuICAgICAgICAuY291bnRcbiAgICAgICAgICAmOmJlZm9yZVxuICAgICAgICAgICAgY29udGVudCAn77+lJ1xuICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiAzcHhcbiAgICAgICAgLnByaWNlXG4gICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgZmxleC1kaXJlY3Rpb24gY29sdW1uXG4gICAgICAgIC5saW5lLXRocm91Z2hcbiAgICAgICAgICBpXG4gICAgICAgICAgICB0ZXh0LWRlY29yYXRpb24gbGluZS10aHJvdWdoXG4gICAgICAgIC5udW1cbiAgICAgICAgICAucmVkdWNlXG4gICAgICAgICAgLmFkZFxuICAgICAgICAgICAgZGlzcGxheSBpbmxpbmUtYmxvY2tcbiAgICAgICAgICAgIHdpZHRoIDM0cHhcbiAgICAgICAgICAgIGhlaWdodCAzNHB4XG4gICAgICAgICAgICBsaW5lLWhlaWdodCAzNHB4XG4gICAgICAgICAgICB0ZXh0LWFsaWduIGNlbnRlclxuICAgICAgICAgICAgYm9yZGVyIDFweCBzb2xpZCAjQzVDNkQ2XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzIDJweFxuICAgICAgICAgICAgY3Vyc29yIHBvaW50ZXJcbiAgICAgICAgLmNvdW50XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGRcbiAgICAuZm9vdGVyXG4gICAgICBkaXNwbGF5IGZsZXhcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmRcbiAgICAgIGJhY2tncm91bmQ6ICNGNEY1RkJcbiAgICAgIGhlaWdodDogNTBweFxuICAgICAgbGluZS1oZWlnaHQ6IDUwcHhcbiAgICAgIG1hcmdpbi1sZWZ0OiAzMTBweFxuICAgICAgbWFyZ2luLXJpZ2h0OiAyNDBweFxuICAgICAgbWFyZ2luLXRvcDogMjBweFxuICAgICAgbWFyZ2luLWJvdHRvbTogMjE0cHhcbiAgICAgIGNvbG9yICMzMzNcbiAgICAgIGZvbnQtc2l6ZSAxNHB4XG4gICAgICAuaW5mb1xuICAgICAgICBtYXJnaW4tcmlnaHQgMjJweFxuICAgICAgICB0ZXh0LWFsaWduOiByaWdodFxuICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgIC5mYXJlXG4gICAgICAgIG1hcmdpbi1yaWdodDogMzlweFxuICAgICAgICBjb2xvcjogIzk5OTk5OVxuICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgLmFjY291bnRcbiAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICBiYWNrZ3JvdW5kOiAjMmQzMTZjXG4gICAgICAgIHdpZHRoIDE1MXB4XG4gICAgICAgIGhlaWdodCA1MHB4XG4gICAgICAgIG1hcmdpbi1sZWZ0IDM5cHhcbiAgICAgICAgZm9udC1zaXplOiAxNnB4XG4gICAgICAgIGNvbG9yOiAjZmZmZmZmXG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgICBjdXJzb3IgcG9pbnRlclxuPC9zdHlsZT5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvdmlld3MvdnVlX3BhZ2VzL1Nob3BwaW5nQ2FydC52dWU/MWRmMTMzMGQiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XCJvbWl0XCI6MSxcInJlbW92ZVwiOnRydWUsXCJwdWJsaWNQYXRoXCI6XCIuLi9cIn0hLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlciEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyP3tcIm1pbmltaXplXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LWQxYjQ4ZDA0XCIsXCJzY29wZWRcIjp0cnVlLFwiaGFzSW5saW5lQ29uZmlnXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3N0eWx1cy1sb2FkZXIhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9Qcm9jZXNzLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNzVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gIC5wcm9jZXNzKCA6Y2xhc3M9XCJzdGVwX251bSgpXCIgKVxuICAgIHNwYW4ucHJvY2Vzcy1zdGVwKCB2LWZvcj1cIihpdGVtLCBpbmRleCkgaW4gc3RlcHNcIiApXG4gICAgICAuc3RlcC13cmFwKCA6bmFtZT1cImluZGV4XCIgKVxuICAgICAgICBzcGFuIHt7aW5kZXgrMX19XG4gICAgICAgIGVtLnN0ZXAge3tpdGVtfX1cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAncHJvY2VzcycsXG4gICAgcHJvcHM6IFsnc3RlcCcsICdzdGVwcyddLFxuICAgIGNvbXB1dGVkOiB7XG4gICAgICBzdGVwX251bSgpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICBsZXQgc3RlcDtcblxuICAgICAgICAgIHN3aXRjaCAoIHRoaXMuc3RlcCApIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgc3RlcCA9ICdzdGVwXzEnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgc3RlcCA9ICdzdGVwXzInO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgc3RlcCA9ICdzdGVwXzMnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgc3RlcCA9ICdzdGVwXzQnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICBiZygpXG4gICAgYmFja2dyb3VuZDogI0JERTQ5MlxuICAgIHNwYW5cbiAgICAgIGJhY2tncm91bmQ6ICNCREU0OTJcbiAgICAgIGNvbG9yOiAjZmZmZmZmXG5cbiAgLnByb2Nlc3NcbiAgICBkaXNwbGF5IGZsZXhcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kXG4gICAgYWxpZ24taXRlbXMgY2VudGVyXG4gICAgaGVpZ2h0OiAxNTZweFxuICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgIGZvbnQtc2l6ZTogMTRweFxuICAgIGNvbG9yOiAjNjY2NjY2XG4gICAgLnN0ZXBcbiAgICAgIGRpc3BsYXkgYmxvY2tcbiAgICAgIHBhZGRpbmctdG9wOiAyNXB4XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICBkaXZcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZVxuICAgICAgYmFja2dyb3VuZDogI2YwZjNmNVxuICAgICAgd2lkdGg6IDEzOHB4XG4gICAgICBoZWlnaHQ6IDRweFxuICAgICAgbWFyZ2luLXJpZ2h0OiA1cHhcbiAgICAgIHNwYW5cbiAgICAgICAgYmFja2dyb3VuZDogI2YwZjNmNVxuICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgYWxpZ24taXRlbXMgY2VudGVyXG4gICAgICAgIGp1c3RpZnktY29udGVudCBjZW50ZXJcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlXG4gICAgICAgIGxlZnQ6IDUwJVxuICAgICAgICB0b3A6IDUwJVxuICAgICAgICBtYXJnaW4tdG9wOiAtMTJweFxuICAgICAgICBtYXJnaW4tbGVmdDogLTEycHhcbiAgICAgICAgd2lkdGg6IDI0cHhcbiAgICAgICAgaGVpZ2h0OiAyNHB4XG4gICAgICAgIGJvcmRlci1yYWRpdXMgMjRweFxuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgZm9udC1zaXplOiAxNHB4XG4gICAgICAgIGNvbG9yOiAjNjY2NjY2XG4gIC5zdGVwXzFcbiAgICBbbmFtZT1cIjBcIl1cbiAgICAgIGJnKClcblxuICAuc3RlcF8yXG4gICAgW25hbWU9XCIwXCJdXG4gICAgW25hbWU9XCIxXCJdXG4gICAgICBiZygpXG5cbiAgLnN0ZXBfM1xuICAgIFtuYW1lPVwiMFwiXVxuICAgIFtuYW1lPVwiMVwiXVxuICAgIFtuYW1lPVwiMlwiXVxuICAgICAgYmcoKVxuXG4gIC5zdGVwXzRcbiAgICBbbmFtZT1cIjBcIl1cbiAgICBbbmFtZT1cIjFcIl1cbiAgICBbbmFtZT1cIjJcIl1cbiAgICBbbmFtZT1cIjNcIl1cbiAgICAgIGJnKClcbjwvc3R5bGU+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL21vZHVsZXMvUHJvY2Vzcy52dWU/ZGM1YmFmYmEiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFxuICAgIFwiZGl2XCIsXG4gICAgeyBzdGF0aWNDbGFzczogXCJwcm9jZXNzXCIsIGNsYXNzOiBfdm0uc3RlcF9udW0oKSB9LFxuICAgIF92bS5fbChfdm0uc3RlcHMsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICByZXR1cm4gX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwicHJvY2Vzcy1zdGVwXCIgfSwgW1xuICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInN0ZXAtd3JhcFwiLCBhdHRyczogeyBuYW1lOiBpbmRleCB9IH0sIFtcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihfdm0uX3MoaW5kZXggKyAxKSldKSxcbiAgICAgICAgICBfYyhcImVtXCIsIHsgc3RhdGljQ2xhc3M6IFwic3RlcFwiIH0sIFtfdm0uX3YoX3ZtLl9zKGl0ZW0pKV0pXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIH0pXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LWQxYjQ4ZDA0XCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtZDFiNDhkMDRcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvUHJvY2Vzcy52dWVcbi8vIG1vZHVsZSBpZCA9IDc3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJzaG9wcGluZy1jYXJ0XCIgfSwgW1xuICAgIF9jKFxuICAgICAgXCJkaXZcIixcbiAgICAgIHsgc3RhdGljQ2xhc3M6IFwidG9wXCIgfSxcbiAgICAgIFtcbiAgICAgICAgX2MoXCJMb2dvXCIpLFxuICAgICAgICBfYyhcIlByb2Nlc3NcIiwgeyBhdHRyczogeyBzdGVwOiBfdm0uc3RlcCwgc3RlcHM6IF92bS5zdGVwcyB9IH0pXG4gICAgICBdLFxuICAgICAgMVxuICAgICksXG4gICAgX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSksXG4gICAgX2MoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBzdGF0aWNDbGFzczogXCJib2R5XCIgfSxcbiAgICAgIFtcbiAgICAgICAgX2MoXG4gICAgICAgICAgXCJ0cmFuc2l0aW9uLWdyb3VwXCIsXG4gICAgICAgICAgeyBhdHRyczogeyBuYW1lOiBcIml0ZW1saXN0XCIsIHRhZzogXCJkaXZcIiB9IH0sXG4gICAgICAgICAgX3ZtLl9sKF92bS5pdGVtcywgZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBfYyhcImRpdlwiLCB7IGtleTogaXRlbS5jYXJ0TGlzdElELCBzdGF0aWNDbGFzczogXCJyb3dcIiB9LCBbXG4gICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IGl0ZW0uY29tbW9kaXR5LnBpYyB9IH0pLFxuICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KF92bS5fcyhpdGVtLmNvbW1vZGl0eS5jb21tb2RpdHlOYW1lKSldKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwicHJpY2VcIiB9LCBbXG4gICAgICAgICAgICAgICAgX2MoXCJlbVwiLCB7IHN0YXRpY0NsYXNzOiBcImxpbmUtdGhyb3VnaFwiIH0sIFtcbiAgICAgICAgICAgICAgICAgIF92bS5fdihcIuaMh+WvvOS7t1wiKSxcbiAgICAgICAgICAgICAgICAgIF9jKFwiaVwiLCBbX3ZtLl92KFwi77+lXCIgKyBfdm0uX3MoaXRlbS5jb21tb2RpdHkucHJpY2UpKV0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgX2MoXCJlbVwiLCBbXG4gICAgICAgICAgICAgICAgICBfdm0uX3YoXG4gICAgICAgICAgICAgICAgICAgIFwi5Lya5ZGY5Lu3IO+/pVwiICtcbiAgICAgICAgICAgICAgICAgICAgICBfdm0uX3MoXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaXRlbS5jb21tb2RpdHkuY29tbW9kaXR5Q2hhbm5lbCA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICA/IGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiAwXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJudW1cIiB9LCBbXG4gICAgICAgICAgICAgICAgX2MoXG4gICAgICAgICAgICAgICAgICBcImVtXCIsXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInJlZHVjZVwiLFxuICAgICAgICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbigkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF92bS5yZWR1Y2UoaW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgW192bS5fdihcIi1cIildXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfYyhcImlucHV0XCIsIHtcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiB7IHR5cGU6IFwidGV4dFwiIH0sXG4gICAgICAgICAgICAgICAgICBkb21Qcm9wczogeyB2YWx1ZTogaXRlbS5udW0gfVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF9jKFxuICAgICAgICAgICAgICAgICAgXCJlbVwiLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJhZGRcIixcbiAgICAgICAgICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdm0uYWRkKGluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIFtfdm0uX3YoXCIrXCIpXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImNvdW50XCIgfSwgW1xuICAgICAgICAgICAgICAgIF92bS5fdihfdm0uX3MoaXRlbS50b3RhbEFtb3VudCkpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJvcGVyYXRlXCIgfSwgW1xuICAgICAgICAgICAgICAgIF9jKFxuICAgICAgICAgICAgICAgICAgXCJlbVwiLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbigkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF92bS5kZWwoaW5kZXgsIGl0ZW0uY2FydExpc3RJRClcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBbX3ZtLl92KFwi5Yig6ZmkXCIpXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgXSxcbiAgICAgIDFcbiAgICApLFxuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZm9vdGVyXCIgfSwgW1xuICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiYWNjb3VudFwiLCBvbjogeyBjbGljazogX3ZtLmNvbW1pdCB9IH0sIFtcbiAgICAgICAgX3ZtLl92KFwi56uL5Y2z57uT566XXCIpXG4gICAgICBdKVxuICAgIF0pXG4gIF0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImhlYWRlclwiIH0sIFtcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcIm5hbWVcIiB9LCBbX3ZtLl92KFwi5ZWG5ZOBXCIpXSksXG4gICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJwcmljZVwiIH0sIFtfdm0uX3YoXCLljZXku7dcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcIm51bVwiIH0sIFtfdm0uX3YoXCLmlbDph49cIildKSxcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImNvdW50XCIgfSwgW192bS5fdihcIuWwj+iuoVwiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwib3BlcmF0ZVwiIH0sIFtfdm0uX3YoXCLmk43kvZxcIildKVxuICAgIF0pXG4gIH1cbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi0xMDU3YmRiNFwiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTEwNTdiZGI0XCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvU2hvcHBpbmdDYXJ0LnZ1ZVxuLy8gbW9kdWxlIGlkID0gNzhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMTUwMDc5MWFcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vUGF5SW5MaW5lLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vUGF5SW5MaW5lLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMTUwMDc5MWFcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL1BheUluTGluZS52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtMTUwMDc5MWFcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL3ZpZXdzL3Z1ZV9wYWdlcy9QYXlJbkxpbmUudnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi0xNTAwNzkxYVwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LTE1MDA3OTFhXCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1BheUluTGluZS52dWVcbi8vIG1vZHVsZSBpZCA9IDc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtMTUwMDc5MWFcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvUGF5SW5MaW5lLnZ1ZVxuLy8gbW9kdWxlIGlkID0gODBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gIC5wYXktaW4tbGluZVxuICAgIC50b3BcbiAgICAgIExvZ29cbiAgICAgIFByb2Nlc3MoIDpzdGVwPVwic3RlcFwiLCA6c3RlcHM9XCJzdGVwc1wiIClcbiAgICAucGF5LWluZm9cbiAgICAgIC5pbmZvXG4gICAgICAgIHNwYW4udGl0bGUg6K6i5Y2V5o+Q5Lqk5oiQ5YqfXG4gICAgICAgIHNwYW4ub3JkZXJJRCDorqLljZXlj7fvvJpzZGZhc2ZhZGZhc2Zhc2Zhc2ZcbiAgICAgICAgc3Bhbi50aW1lXG4gICAgICAgICAgfCDor7flnKhcbiAgICAgICAgICBlbSAx5bCP5pe2NTnliIY1OeenklxuICAgICAgICAgIHwg5YaF5a6M5oiQ5pSv5LuYXG4gICAgICAuYWRkclxuICAgICAgICBzcGFuLmNvdW50IOW6lOS7mOmHkemine+8mu+/pTQ4MDAuMDBcbiAgICAgICAgc3Bhbi5uYW1lLWFkZHJcbiAgICAgICAgICBzcGFuLm5hbWUgeHh4eFxuICAgICAgICAgIHNwYW4uYXJyIOWMl+S6rOW4guaYjOW5s+WMuiDlhbTnp5Hopb/ot68xNTnlj7cg5aSn6L+Q5a625ZutIDI2LTYtMTYwMyAgMTMwMDAwMDAwXG4gICAgLnBheS10eXBlXG4gICAgICAudGl0bGUg6K+36YCJ5oup5pSv5LuY5pa55byPXG4gICAgICAudHlwZVxuICAgICAgICB1bFxuICAgICAgICAgIGxpKCA6Y2xhc3M9XCJ7Y3Vycjogd2VpeGlufVwiLCBAY2xpY2s9XCJjaGFuZ2VQYXlUeXBlKCAnd2VpeGluJyApXCIgKVxuICAgICAgICAgICAgYS53ZWl4aW4oIGhyZWY9XCIjXCIgKVxuICAgICAgICAgIGxpKCA6Y2xhc3M9XCJ7Y3VycjogemhpZnViYW99XCIsIEBjbGljaz1cImNoYW5nZVBheVR5cGUoICd6aGlmdWJhbycgKVwiIClcbiAgICAgICAgICAgIGEuemhpZnViYW8oIGhyZWY9XCIjXCIgKVxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0IExvZ28gZnJvbSAnbW9kdWxlcy9Mb2dvLnZ1ZSc7XG4gIGltcG9ydCBQcm9jZXNzIGZyb20gJ21vZHVsZXMvUHJvY2Vzcy52dWUnO1xuICBpbXBvcnQgQ2FydCBmcm9tICdAL3VuaXRzL2NvcmUvQ2FydCc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICdwYXlpbmxpbmUnLFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIExvZ28sXG4gICAgICBQcm9jZXNzXG4gICAgfSxcbiAgICBkYXRhKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RlcDogMyxcbiAgICAgICAgc3RlcHM6IFtcbiAgICAgICAgICAn5p+l55yL6LSt54mp6L2mJyxcbiAgICAgICAgICAn56Gu6K6k6K6i5Y2V5L+h5oGvJyxcbiAgICAgICAgICAn5Zyo57q/5LuY5qy+JyxcbiAgICAgICAgICAn5pS26LSnJ1xuICAgICAgICBdLFxuICAgICAgICB3ZWl4aW46IGZhbHNlLFxuICAgICAgICB6aGlmdWJhbzogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcbiAgICBtb3VudGVkKCkge1xuICAgICAgQ2FydC5nZXRDYXJ0TGlzdCgge1xuICAgICAgICAkc3RvcmU6IHRoaXMuJHN0b3JlXG4gICAgICB9ICk7XG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICAvLyB0b2RvOiDliIfmjaLmlK/ku5jnsbvlnotcbiAgICAgIGNoYW5nZVBheVR5cGUoIHR5cGUgKSB7XG4gICAgICAgIHN3aXRjaCAoIHR5cGUgKSB7XG4gICAgICAgICAgY2FzZSAnd2VpeGluJzpcbiAgICAgICAgICAgIHRoaXMud2VpeGluID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuemhpZnViYW8gPSAhdGhpcy53ZWl4aW47XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd6aGlmdWJhbyc6XG4gICAgICAgICAgICB0aGlzLnpoaWZ1YmFvID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMud2VpeGluID0gIXRoaXMuemhpZnViYW87XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgbGFuZz1cInN0eWx1c1wiIHNjb3BlZD5cbiAgLnBheS1pbi1saW5lXG4gICAgLnRvcFxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlclxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuXG4gICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBtYXJnaW4tcmlnaHQ6IDI0MHB4XG4gICAgICBtYXJnaW4tbGVmdDogMzEwcHhcbiAgICAucGF5LWluZm9cbiAgICAgIGRpc3BsYXkgZmxleFxuICAgICAganVzdGlmeS1jb250ZW50IGNlbnRlclxuICAgICAgYWxpZ24taXRlbXMgY2VudGVyXG4gICAgICBtYXJnaW4tdG9wOiAyMHB4XG4gICAgICAuaW5mb1xuICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgZmxleC1kaXJlY3Rpb24gY29sdW1uXG4gICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQgY2VudGVyXG4gICAgICAgIGJvcmRlciAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICBib3JkZXItcmlnaHQgMFxuICAgICAgICB3aWR0aDogNDQ2cHhcbiAgICAgICAgaGVpZ2h0OiAxODhweFxuICAgICAgICBjb2xvcjogIzMzMzMzM1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgc3BhblxuICAgICAgICAgIGRpc3BsYXkgYmxvY2tcbiAgICAgICAgLnRpdGxlXG4gICAgICAgICAgZm9udC1zaXplOiAyMHB4XG4gICAgICAgIC5vcmRlcklEXG4gICAgICAgICAgZm9udC1zaXplIDE0cHhcbiAgICAgICAgLnRpbWVcbiAgICAgICAgICBtYXJnaW4tdG9wOiAxM3B4XG4gICAgICAgICAgZm9udC1zaXplOiAxNHB4XG4gICAgICAgICAgZW1cbiAgICAgICAgICAgIGNvbG9yOiAjZmI1OTZkXG4gICAgICAuYWRkclxuICAgICAgICBiYWNrZ3JvdW5kOiAjRjRGNUZCXG4gICAgICAgIGJvcmRlciAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICBib3JkZXItbGVmdCAwXG4gICAgICAgIHdpZHRoOiA1NDlweFxuICAgICAgICBoZWlnaHQ6IDE4OHB4XG4gICAgICAgIC5jb3VudFxuICAgICAgICAgIGRpc3BsYXkgYmxvY2tcbiAgICAgICAgICBwYWRkaW5nLXRvcDogNDRweFxuICAgICAgICAgIHBhZGRpbmctbGVmdDogMzFweFxuICAgICAgICAgIHBhZGRpbmctYm90dG9tOiA0MnB4XG4gICAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmZmZcbiAgICAgICAgICBmb250LXNpemU6IDE2cHhcbiAgICAgICAgICBjb2xvcjogIzMzMzMzM1xuICAgICAgICAubmFtZS1hZGRyXG4gICAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICAgIG1hcmdpbi10b3A6IDE1cHhcbiAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICBjb2xvcjogIzk5OTk5OVxuICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgIGRpc3BsYXkgYmxvY2tcbiAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMzFweFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogNXB4XG4gICAgICAgICAgICAmOmxhc3QtY2hpbGRcbiAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMFxuICAgIC5wYXktdHlwZVxuICAgICAgZGlzcGxheSBmbGV4XG4gICAgICBmbGV4LWRpcmVjdGlvbiBjb2x1bW5cbiAgICAgIG1hcmdpbi10b3A6IDMwcHhcbiAgICAgIG1hcmdpbi1sZWZ0OiAyMjFweFxuICAgICAgbWFyZ2luLWJvdHRvbTogMTk4cHhcbiAgICAgIC50aXRsZVxuICAgICAgICBhbGlnbi1zZWxmIGNlbnRlclxuICAgICAgICBtYXJnaW4tbGVmdDogLTExMDBweFxuICAgICAgLnR5cGVcbiAgICAgICAgbWFyZ2luLXRvcDogMjBweFxuICAgICAgICBvdmVyZmxvdzogaGlkZGVuXG4gICAgICAgIGFsaWduLXNlbGYgY2VudGVyXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtNjEwcHhcbiAgICAgICAgdWxcbiAgICAgICAgICBsaVxuICAgICAgICAgICAgZmxvYXQ6IGxlZnRcbiAgICAgICAgICAgIHdpZHRoOiAyODBweFxuICAgICAgICAgICAgaGVpZ2h0OiA4MHB4XG4gICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDQwcHhcbiAgICAgICAgICAgIGJvcmRlciAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICAgICAgJjpsYXN0LWNoaWxkXG4gICAgICAgICAgICAgIG1hcmdpbi1yaWdodDogMFxuICAgICAgICBhXG4gICAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICAgIHdpZHRoOiAyODBweFxuICAgICAgICAgIGhlaWdodDogODBweFxuICAgICAgICAud2VpeGluXG4gICAgICAgICAgYmFja2dyb3VuZDogdXJsKCAnfmltYWdlcy93ZWl4aW4ucG5nJyApIGNlbnRlciBjZW50ZXIgbm8tcmVwZWF0O1xuICAgICAgICAuemhpZnViYW9cbiAgICAgICAgICBiYWNrZ3JvdW5kOiB1cmwoICd+aW1hZ2VzL3poaWZ1YmFvLnBuZycgKSBjZW50ZXIgY2VudGVyIG5vLXJlcGVhdDtcbiAgICAgICAgLmN1cnJcbiAgICAgICAgICBiYWNrZ3JvdW5kOiB1cmwoICd+aW1hZ2VzL3BheV9pY29uLnBuZycgKSByaWdodCB0b3Agbm8tcmVwZWF0XG4gICAgICAgICAgYm9yZGVyIDJweCBzb2xpZCAjMkQzMTZDXG48L3N0eWxlPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy92aWV3cy92dWVfcGFnZXMvUGF5SW5MaW5lLnZ1ZT8wNDYzOTVhOCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJwYXktaW4tbGluZVwiIH0sIFtcbiAgICBfYyhcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IHN0YXRpY0NsYXNzOiBcInRvcFwiIH0sXG4gICAgICBbXG4gICAgICAgIF9jKFwiTG9nb1wiKSxcbiAgICAgICAgX2MoXCJQcm9jZXNzXCIsIHsgYXR0cnM6IHsgc3RlcDogX3ZtLnN0ZXAsIHN0ZXBzOiBfdm0uc3RlcHMgfSB9KVxuICAgICAgXSxcbiAgICAgIDFcbiAgICApLFxuICAgIF92bS5fbSgwLCBmYWxzZSwgZmFsc2UpLFxuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwicGF5LXR5cGVcIiB9LCBbXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInRpdGxlXCIgfSwgW192bS5fdihcIuivt+mAieaLqeaUr+S7mOaWueW8j1wiKV0pLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ0eXBlXCIgfSwgW1xuICAgICAgICBfYyhcInVsXCIsIFtcbiAgICAgICAgICBfYyhcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY2xhc3M6IHsgY3VycjogX3ZtLndlaXhpbiB9LFxuICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbigkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgIF92bS5jaGFuZ2VQYXlUeXBlKFwid2VpeGluXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW19jKFwiYVwiLCB7IHN0YXRpY0NsYXNzOiBcIndlaXhpblwiLCBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0pXVxuICAgICAgICAgICksXG4gICAgICAgICAgX2MoXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNsYXNzOiB7IGN1cnI6IF92bS56aGlmdWJhbyB9LFxuICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbigkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgIF92bS5jaGFuZ2VQYXlUeXBlKFwiemhpZnViYW9cIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbX2MoXCJhXCIsIHsgc3RhdGljQ2xhc3M6IFwiemhpZnViYW9cIiwgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9KV1cbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXG4gIF0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInBheS1pbmZvXCIgfSwgW1xuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJpbmZvXCIgfSwgW1xuICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtfdm0uX3YoXCLorqLljZXmj5DkuqTmiJDlip9cIildKSxcbiAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwib3JkZXJJRFwiIH0sIFtcbiAgICAgICAgICBfdm0uX3YoXCLorqLljZXlj7fvvJpzZGZhc2ZhZGZhc2Zhc2Zhc2ZcIilcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcInRpbWVcIiB9LCBbXG4gICAgICAgICAgX3ZtLl92KFwi6K+35ZyoXCIpLFxuICAgICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihcIjHlsI/ml7Y1OeWIhjU556eSXCIpXSksXG4gICAgICAgICAgX3ZtLl92KFwi5YaF5a6M5oiQ5pSv5LuYXCIpXG4gICAgICAgIF0pXG4gICAgICBdKSxcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiYWRkclwiIH0sIFtcbiAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiY291bnRcIiB9LCBbX3ZtLl92KFwi5bqU5LuY6YeR6aKd77ya77+lNDgwMC4wMFwiKV0pLFxuICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJuYW1lLWFkZHJcIiB9LCBbXG4gICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwibmFtZVwiIH0sIFtfdm0uX3YoXCJ4eHh4XCIpXSksXG4gICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiYXJyXCIgfSwgW1xuICAgICAgICAgICAgX3ZtLl92KFwi5YyX5Lqs5biC5piM5bmz5Yy6IOWFtOenkeilv+i3rzE1OeWPtyDlpKfov5Dlrrblm60gMjYtNi0xNjAzICAxMzAwMDAwMDBcIilcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtMTUwMDc5MWFcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0xNTAwNzkxYVwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1BheUluTGluZS52dWVcbi8vIG1vZHVsZSBpZCA9IDgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtMzBlYThiNzVcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvU3VjY2Vzcy52dWVcbi8vIG1vZHVsZSBpZCA9IDgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZSBsYW5nPVwiamFkZVwiPlxuICAuc3VjZXNzLXBheVxuICAgIC50b3AoIHYtaWY9XCJ0eXBlICE9PSAncGhvbmUnXCIgKVxuICAgICAgTG9nbyggOnRpdGxlPVwidGl0bGVcIiApXG4gICAgICBQcm9jZXNzKCB2LWlmPVwic3RlcHMubGVuZ3RoID4gMFwiLCA6c3RlcD1cInN0ZXBcIiwgOnN0ZXBzPVwic3RlcHNcIiApXG4gICAgLmluZm9cbiAgICAgIGRpdiggdi1pZj1cInR5cGUgPT09ICdwYXknXCIgKVxuICAgICAgICBzcGFuLnRpdGxlIOaUr+S7mOWujOaIkFxuICAgICAgICBzcGFuLmRpcyDor7fmgqjogJDlv4PnrYnlgJnvvIzllYblk4HlsIblsL3lv6vpgIHliLDmgqjnmoTmiYvkuK3igKZcbiAgICAgIGRpdiggdi1pZj1cInR5cGUgPT09ICdwdydcIiApXG4gICAgICAgIHNwYW4udGl0bGUg5L+u5pS55oiQ5YqfXG4gICAgICAgIHNwYW4uZGlzIOaCqOW3suaIkOWKn+S/ruaUueWvhuegge+8jFxuICAgICAgICAgIGEoIGhyZWY9XCIjXCIgKSDnq4vljbPnmbvlvZVcbiAgICAgIGRpdiggdi1pZj1cInR5cGUgPT09ICdyZWdpc3RlcidcIiApXG4gICAgICAgIHNwYW4udGl0bGUg5rOo5YaM5oiQ5YqfXG4gICAgICAgIHNwYW4uZGlzIOaBreWWnOaCqOaIkOWKn+azqOWGjOS5hemahuWVhui0uCxcbiAgICAgICAgICBhKCBocmVmPVwiI1wiICkg56uL5Y2z55m75b2VXG4gICAgICBkaXYoIHYtaWY9XCJ0eXBlID09PSAncGhvbmUnXCIgKVxuICAgICAgICBzcGFuLnRpdGxlIOS/ruaUueaIkOWKn1xuICAgICAgICBzcGFuLmRpcyDmgqjlt7LmiJDlip/kv67mlLnmiYvmnLrlj7dcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCBMb2dvIGZyb20gJ21vZHVsZXMvTG9nby52dWUnO1xuICBpbXBvcnQgUHJvY2VzcyBmcm9tICdtb2R1bGVzL1Byb2Nlc3MudnVlJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3N1Y2Vzc1BheScsXG4gICAgY29tcG9uZW50czoge1xuICAgICAgTG9nbyxcbiAgICAgIFByb2Nlc3NcbiAgICB9LFxuICAgIHByb3BzOiBbJ3R5cGUnXSxcbiAgICBkYXRhKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVzczogZmFsc2UsXG4gICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgc3RlcDogNCxcbiAgICAgICAgc3RlcHM6IFtdXG4gICAgICB9O1xuICAgIH0sXG4gICAgbW91bnRlZCgpIHtcbiAgICAgIHRoaXMudXBMb2FkKCk7XG4gICAgfSxcbiAgICB3YXRjaDoge1xuICAgICAgJHJvdXRlKCkge1xuICAgICAgICB0aGlzLnVwTG9hZCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgdXBMb2FkKCkge1xuICAgICAgICBzd2l0Y2ggKCB0aGlzLnR5cGUgKSB7XG4gICAgICAgICAgY2FzZSAncGF5JzpcbiAgICAgICAgICAgIHRoaXMuc3RlcHMgPSBbXG4gICAgICAgICAgICAgICfmn6XnnIvotK3nianovaYnLFxuICAgICAgICAgICAgICAn56Gu6K6k6K6i5Y2V5L+h5oGvJyxcbiAgICAgICAgICAgICAgJ+WcqOe6v+S7mOasvicsXG4gICAgICAgICAgICAgICfmlLbotKcnXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncHcnOlxuICAgICAgICAgICAgdGhpcy50aXRsZSA9ICfkv67mlLnlr4bnoIEnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmVnaXN0ZXInOlxuICAgICAgICAgICAgdGhpcy50aXRsZSA9ICfmrKLov47ms6jlhozkuYXpmobllYbotLgnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gIC5zdWNlc3MtcGF5XG4gICAgLnRvcFxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlclxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuXG4gICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBtYXJnaW4tcmlnaHQ6IDI0MHB4XG4gICAgICBtYXJnaW4tbGVmdDogMzEwcHhcbiAgICAuaW5mb1xuICAgICAgYmFja2dyb3VuZDogdXJsKCAnfmltYWdlcy9zdWNlc3MucG5nJyApIGNlbnRlciAxMzBweCBuby1yZXBlYXRcbiAgICAgIHBhZGRpbmctdG9wOiAxMzBweFxuICAgICAgcGFkZGluZy1ib3R0b206IDMxM3B4XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgIHNwYW5cbiAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgLnRpdGxlXG4gICAgICAgIG1hcmdpbi10b3A6IDcwcHhcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogM3B4XG4gICAgICAgIGZvbnQtc2l6ZTogMjBweFxuICAgICAgICBjb2xvcjogIzcwYzIxNlxuICAgICAgLmRpc1xuICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgY29sb3I6ICM5OTk5OTlcbjwvc3R5bGU+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9TdWNjZXNzLnZ1ZT9hMzEwOTNiMCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJzdWNlc3MtcGF5XCIgfSwgW1xuICAgIF92bS50eXBlICE9PSBcInBob25lXCJcbiAgICAgID8gX2MoXG4gICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICB7IHN0YXRpY0NsYXNzOiBcInRvcFwiIH0sXG4gICAgICAgICAgW1xuICAgICAgICAgICAgX2MoXCJMb2dvXCIsIHsgYXR0cnM6IHsgdGl0bGU6IF92bS50aXRsZSB9IH0pLFxuICAgICAgICAgICAgX3ZtLnN0ZXBzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgPyBfYyhcIlByb2Nlc3NcIiwgeyBhdHRyczogeyBzdGVwOiBfdm0uc3RlcCwgc3RlcHM6IF92bS5zdGVwcyB9IH0pXG4gICAgICAgICAgICAgIDogX3ZtLl9lKClcbiAgICAgICAgICBdLFxuICAgICAgICAgIDFcbiAgICAgICAgKVxuICAgICAgOiBfdm0uX2UoKSxcbiAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImluZm9cIiB9LCBbXG4gICAgICBfdm0udHlwZSA9PT0gXCJwYXlcIlxuICAgICAgICA/IF9jKFwiZGl2XCIsIFtcbiAgICAgICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcInRpdGxlXCIgfSwgW192bS5fdihcIuaUr+S7mOWujOaIkFwiKV0pLFxuICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiZGlzXCIgfSwgW1xuICAgICAgICAgICAgICBfdm0uX3YoXCLor7fmgqjogJDlv4PnrYnlgJnvvIzllYblk4HlsIblsL3lv6vpgIHliLDmgqjnmoTmiYvkuK3igKZcIilcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgIF92bS50eXBlID09PSBcInB3XCJcbiAgICAgICAgPyBfYyhcImRpdlwiLCBbXG4gICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtfdm0uX3YoXCLkv67mlLnmiJDlip9cIildKSxcbiAgICAgICAgICAgIF92bS5fbSgwLCBmYWxzZSwgZmFsc2UpXG4gICAgICAgICAgXSlcbiAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgIF92bS50eXBlID09PSBcInJlZ2lzdGVyXCJcbiAgICAgICAgPyBfYyhcImRpdlwiLCBbXG4gICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtfdm0uX3YoXCLms6jlhozmiJDlip9cIildKSxcbiAgICAgICAgICAgIF92bS5fbSgxLCBmYWxzZSwgZmFsc2UpXG4gICAgICAgICAgXSlcbiAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgIF92bS50eXBlID09PSBcInBob25lXCJcbiAgICAgICAgPyBfYyhcImRpdlwiLCBbXG4gICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtfdm0uX3YoXCLkv67mlLnmiJDlip9cIildKSxcbiAgICAgICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImRpc1wiIH0sIFtfdm0uX3YoXCLmgqjlt7LmiJDlip/kv67mlLnmiYvmnLrlj7dcIildKVxuICAgICAgICAgIF0pXG4gICAgICAgIDogX3ZtLl9lKClcbiAgICBdKVxuICBdKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiZGlzXCIgfSwgW1xuICAgICAgX3ZtLl92KFwi5oKo5bey5oiQ5Yqf5L+u5pS55a+G56CB77yMXCIpLFxuICAgICAgX2MoXCJhXCIsIHsgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbX3ZtLl92KFwi56uL5Y2z55m75b2VXCIpXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJkaXNcIiB9LCBbXG4gICAgICBfdm0uX3YoXCLmga3llpzmgqjmiJDlip/ms6jlhozkuYXpmobllYbotLgsXCIpLFxuICAgICAgX2MoXCJhXCIsIHsgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbX3ZtLl92KFwi56uL5Y2z55m75b2VXCIpXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtMzBlYThiNzVcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0zMGVhOGI3NVwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvdmlld3MvdnVlX3BhZ2VzL1N1Y2Nlc3MudnVlXG4vLyBtb2R1bGUgaWQgPSA4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZGlzcG9zZWQgPSBmYWxzZVxuZnVuY3Rpb24gaW5qZWN0U3R5bGUgKHNzckNvbnRleHQpIHtcbiAgaWYgKGRpc3Bvc2VkKSByZXR1cm5cbiAgcmVxdWlyZShcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XFxcIm9taXRcXFwiOjEsXFxcInJlbW92ZVxcXCI6dHJ1ZSxcXFwicHVibGljUGF0aFxcXCI6XFxcIi4uL1xcXCJ9IXZ1ZS1zdHlsZS1sb2FkZXIhY3NzLWxvYWRlcj97XFxcIm1pbmltaXplXFxcIjpmYWxzZX0hLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4P3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi0zMjE4NmMyOFxcXCIsXFxcInNjb3BlZFxcXCI6dHJ1ZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjpmYWxzZX0hc3R5bHVzLWxvYWRlciEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9Db25maXJtT3JkZXIudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9Db25maXJtT3JkZXIudnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0zMjE4NmMyOFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vQ29uZmlybU9yZGVyLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBcImRhdGEtdi0zMjE4NmMyOFwiXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvdmlld3MvdnVlX3BhZ2VzL0NvbmZpcm1PcmRlci52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTMyMTg2YzI4XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMzIxODZjMjhcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy92aWV3cy92dWVfcGFnZXMvQ29uZmlybU9yZGVyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi0zMjE4NmMyOFwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9Db25maXJtT3JkZXIudnVlXG4vLyBtb2R1bGUgaWQgPSA4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgLmNvbmZpcm0tb3JkZXJcbiAgICAuY292ZXJcbiAgICAgIE5ld0FkZHJcbiAgICAudG9wXG4gICAgICBMb2dvXG4gICAgICBQcm9jZXNzKCA6c3RlcD1cInN0ZXBcIiwgOnN0ZXBzPVwic3RlcHNcIiApXG4gICAgLm9yZGVyLWFkZHJcbiAgICAgIC50aXRsZVxuICAgICAgICBzcGFuLmljb25cbiAgICAgICAgc3BhbiDnoa7orqTmlLbotKflnLDlnYBcbiAgICAgICAgc3Bhbi5hZGQtYWRkciggQGNsaWNrPVwic2hvd01vcmVBZGRyc1wiICkg5L2/55So5YW25LuW5pS26LSn5Zyw5Z2AXG4gICAgICAuYWRkcnMoIDpjbGFzcz1cInsnYWRkci1tb3JlJzogYWRkck1vcmV9XCIgKVxuICAgICAgICB1bFxuICAgICAgICAgIGxpKCB2LWZvcj1cIihpdGVtLCBpbmRleCkgaW4gYWRkcnNcIiwgQGNsaWNrPVwiY2hhbmdlQWRkckRlZmF1bHQoIGluZGV4IClcIiApXG4gICAgICAgICAgICBzcGFuLm5hbWUge3tpdGVtLmNvbnRhY3RzfX1cbiAgICAgICAgICAgIHNwYW4uYWRkciB7e2l0ZW0ucmVjZWl2aW5nQWRkcn19IHt7aXRlbS5tb2JpbGV9fVxuICAgIC5jb25maXJtXG4gICAgICAudGl0bGVcbiAgICAgICAgc3Bhbi5pY29uXG4gICAgICAgIHNwYW4g56Gu6K6k6K6i5Y2VXG4gICAgICAubGlzdFxuICAgICAgICAudGl0bGVcbiAgICAgICAgICBzcGFuIOWVhuWTgVxuICAgICAgICAgIHNwYW4g5Y2V5Lu3XG4gICAgICAgICAgc3BhbiDmlbDph49cbiAgICAgICAgICBzcGFuIOWwj+iuoVxuICAgICAgICAuaXRlbXMoIHYtZm9yPVwiaXRlbSBpbiBpdGVtc1wiIClcbiAgICAgICAgICAuY29udGVudFxuICAgICAgICAgICAgc3Bhbi5waWNcbiAgICAgICAgICAgICAgaW1nKCA6c3JjPVwiaXRlbS5jb21tb2RpdHkucGljXCIgKVxuICAgICAgICAgICAgICBzcGFuLm5hbWUtZGlzY291bnRcbiAgICAgICAgICAgICAgICBzcGFuLm5hbWUge3tpdGVtLmNvbW1vZGl0eS5jb21tb2RpdHlOYW1lfX1cbiAgICAgICAgICAgIHNwYW4ubW9uZXlcbiAgICAgICAgICAgICAgZW0ubGluZS10aHJvdWdoIOaMh+WvvOS7t++8mlxuICAgICAgICAgICAgICAgIGkg77+le3tpdGVtLmNvbW1vZGl0eS5wcmljZX19XG4gICAgICAgICAgICAgIGVtIOS8muWRmOS7t++8mu+/pXt7dHlwZW9mIGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWwgPT09ICdudW1iZXInID8gaXRlbS5jb21tb2RpdHkuY29tbW9kaXR5Q2hhbm5lbCA6IDB9fVxuICAgICAgICAgICAgc3Bhbi5udW0ge3tpdGVtLm51bX19XG4gICAgICAgICAgICBzcGFuLmNvdW50IHt7aXRlbS50b3RhbEFtb3VudH19XG4gICAgICAgICAgLmNvdXBvblxuICAgICAgICAgICAgc3BhbiDlpJrkubDlpJrpgIHvvIzkubDlha3pgIHkuIBcbiAgICAgICAgICAgIHNwYW4gW+i1oOWTgV0geHh4eHh4XG4gICAgLmNvdXBvbl9tb3JlXG4gICAgICAudGl0bGUg6K6i5Y2V6LWg5ZOBXG4gICAgICAuaXRlbXNcbiAgICAgICAgc3BhblxuICAgICAgICAgIGltZyggc3JjPVwiXCIgKVxuICAgICAgICAgIHNwYW4geHh4eFxuICAgICAgICBzcGFuICoxXG4gICAgLmluZm9cbiAgICAgIHNwYW5cbiAgICAgICAgfCDlhbHmnIlcbiAgICAgICAgZW0ge3tjb3VudH19XG4gICAgICAgIHwg5Lu25ZWG5ZOBXG4gICAgICBzcGFuLmNvdW50IOaAu+iuoTog77+le3ttZW1iZXJDb3VudH19XG4gICAgLnByaWNlXG4gICAgICBzcGFuIOS8mOaDoDog77+le3tkaXNjb3VudH19XG4gICAgICBzcGFuIOWVhuWTgeaAu+S7t++8mu+/pXt7YW1vdW50fX1cbiAgICBzcGFuLnBheSggQGNsaWNrPVwicGF5XCIgKSDljrvmlK/ku5hcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgTmV3QWRkciBmcm9tICdtb2R1bGVzL05ld0FkZHIudnVlJztcbmltcG9ydCBMb2dvIGZyb20gJ21vZHVsZXMvTG9nby52dWUnO1xuaW1wb3J0IFByb2Nlc3MgZnJvbSAnbW9kdWxlcy9Qcm9jZXNzLnZ1ZSc7XG5pbXBvcnQgQ09ERVMgZnJvbSAnQC91bml0cy9DT05GSUcvY29kZXMnO1xuaW1wb3J0IFVSTFMgZnJvbSAnQC91bml0cy9DT05GSUcvdXJscyc7XG5pbXBvcnQgYWpheCBmcm9tICdAL3VuaXRzL2NvcmUvQUpBWCc7XG5pbXBvcnQgQ2FydCBmcm9tICdAL3VuaXRzL2NvcmUvQ2FydCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ2NvbmZpcm1PcmRlcicsXG4gIGNvbXBvbmVudHM6IHtcbiAgICBMb2dvLFxuICAgIE5ld0FkZHIsXG4gICAgUHJvY2Vzc1xuICB9LFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGVwOiAyLFxuICAgICAgc3RlcHM6IFtcbiAgICAgICAgJ+afpeeci+i0reeJqei9picsXG4gICAgICAgICfnoa7orqTorqLljZXkv6Hmga8nLFxuICAgICAgICAn5Zyo57q/5LuY5qy+JyxcbiAgICAgICAgJ+aUtui0pydcbiAgICAgIF0sXG4gICAgICBhZGRyczogW10sXG4gICAgICBpdGVtczogW10sXG4gICAgICBhZGRyTW9yZTogZmFsc2UsXG4gICAgICBjb3VudDogMCwgLy8gPyDpgInmi6nllYblk4HnmoTkuKrmlbBcbiAgICAgIGFtb3VudDogMCwgLy8gPyDllYblk4HmgLvku7dcbiAgICAgIG1lbWJlckNvdW50OiAwLCAvLyA/IOS8muWRmOaAu+S7t1xuICAgICAgZGlzY291bnQ6IDAgLy8gPyDkvJjmg6Dku7cgPSDllYblk4HmgLvku7cgLSDkvJrlkZjmgLvku7dcbiAgICB9O1xuICB9LFxuICBtb3VudGVkKCkge1xuICAgIHRoaXMuZ2V0Q3VzdG9tZXJBZGRyKCk7XG4gICAgQ2FydC5nZXRDYXJ0TGlzdCgge1xuICAgICAgJHN0b3JlOiB0aGlzLiRzdG9yZSxcbiAgICAgIHN1Y2Nlc3M6IGRhdGEgPT4ge1xuICAgICAgICBkYXRhLnJlc3VsdC5mb3JFYWNoKCBpdGVtID0+IHtcbiAgICAgICAgICBpdGVtLmNvbW1vZGl0eS5waWMgPSBpdGVtLmNvbW1vZGl0eS5waWNcbiAgICAgICAgICAgID8gVVJMUy5CYXNlVVJMICsgaXRlbS5jb21tb2RpdHkucGljXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IGRhdGEucmVzdWx0O1xuICAgICAgICB0aGlzLnRvdGFsKCkuY291bnQoKTtcbiAgICAgICAgdGhpcy50b3RhbCgpLm1lbWJlckNvdW50KCk7XG4gICAgICAgIHRoaXMudG90YWwoKS5kaXNjb3VudCgpO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIC8vIHRvZG86IOiuoeeul+acgOWQjumHkeminVxuICAgIHRvdGFsKCkge1xuICAgICAgbGV0IG51bSwgbWVtYmVyQ291bnQ7XG5cbiAgICAgIHRoaXMuY291bnQgPSB0aGlzLml0ZW1zLmxlbmd0aDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLy8gdG9kbzog6K6h566X5oC75Lu3XG4gICAgICAgIGNvdW50OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKCBpdGVtID0+IHtcbiAgICAgICAgICAgIG51bSA9IGl0ZW0uY29tbW9kaXR5LnByaWNlO1xuICAgICAgICAgICAgdGhpcy5hbW91bnQgKz0gbnVtO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB0b2RvOiDorqHnrpfkvJrlkZjku7dcbiAgICAgICAgbWVtYmVyQ291bnQ6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLml0ZW1zLmZvckVhY2goIGl0ZW0gPT4ge1xuICAgICAgICAgICAgbWVtYmVyQ291bnQgPSBpdGVtLmNvbW1vZGl0eS5jb21tb2RpdHlDaGFubmVsIHx8IDA7XG4gICAgICAgICAgICB0aGlzLm1lbWJlckNvdW50ICs9IG1lbWJlckNvdW50O1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB0b2RvOiDorqHnrpfkvJjmg6Dku7dcbiAgICAgICAgZGlzY291bnQ6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRpc2NvdW50ID0gdGhpcy5hbW91bnQgLSB0aGlzLm1lbWJlckNvdW50O1xuICAgICAgICAgIHRoaXMuZGlzY291bnQgPSB0aGlzLmRpc2NvdW50ID09PSB0aGlzLmFtb3VudFxuICAgICAgICAgICAgPyAwXG4gICAgICAgICAgICA6IHRoaXMuZGlzY291bnQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIHRvZG86IOiOt+WPlueUqOaIt+WcsOWdgOS/oeaBr1xuICAgIGdldEN1c3RvbWVyQWRkcigpIHtcbiAgICAgIGFqYXgucG9zdCgge1xuICAgICAgICB1cmw6IFVSTFMuZ2V0Q3VzdG9tZXJSZWNlaXZpbmdBZGRyLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY3VzdG9tZXJJRDogJ2JjZDI2ZWRhMjkzYTQ0ZTk4YjAzZDhkOGE3YTdhMDI4J1xuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgIHRoaXMuYWRkcnMgPSByZXMuZGF0YS5jb2RlID09PSBDT0RFUy5TVUNDRVNTXG4gICAgICAgICAgICA/IHJlcy5kYXRhLnJlc3VsdFxuICAgICAgICAgICAgOiB0aGlzLmFkZHJzO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfSxcblxuICAgIC8vIHRvZG86IOS9v+eUqOWFtuS7luaUtui0p+WcsOWdgFxuICAgIHNob3dNb3JlQWRkcnMoKSB7XG4gICAgICB0aGlzLmFkZHJNb3JlID0gIXRoaXMuYWRkck1vcmU7XG4gICAgfSxcblxuICAgIC8vIHRvZG86IOWIh+aNouaUtui0p+WcsOWdgFxuICAgIGNoYW5nZUFkZHJEZWZhdWx0KCBpbmRleCApIHtcbiAgICAgIGxldCBpdGVtID0gdGhpcy5hZGRycy5zcGxpY2UoIGluZGV4LCAxIClbMF07XG4gICAgICB0aGlzLmFkZHJzLnNwbGljZSggMCwgMCwgaXRlbSApO1xuICAgICAgdGhpcy5hZGRyTW9yZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyB0b2RvOiDljrvmlK/ku5hcbiAgICBwYXkoKSB7XG4gICAgICB0aGlzLiRyb3V0ZXIucHVzaCgge1xuICAgICAgICBwYXRoOiAnL3BheSdcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gIGJvZHlcbiAgICBwb3NpdGlvbjogcmVsYXRpdmVcblxuICAuY29uZmlybS1vcmRlclxuICAgIG92ZXJmbG93OiBoaWRkZW5cbiAgICAudG9wXG4gICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW5cbiAgICAgIGJvcmRlci1ib3R0b20gMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgIG1hcmdpbi1yaWdodDogMjQwcHhcbiAgICAgIG1hcmdpbi1sZWZ0OiAzMTBweFxuICAgIC5vcmRlci1hZGRyXG4gICAgLmNvbmZpcm1cbiAgICAgIHBhZGRpbmctbGVmdDogMzEwcHhcbiAgICAgIC5pY29uXG4gICAgICAgIGJhY2tncm91bmQ6ICMyRDMxNkNcbiAgICAgICAgZGlzcGxheSBpbmxpbmUtYmxvY2tcbiAgICAgICAgd2lkdGg6IDNweFxuICAgICAgICBoZWlnaHQ6IDEycHhcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxMHB4XG4gICAgICAudGl0bGVcbiAgICAgICAgYm9yZGVyLWJvdHRvbSAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICBwYWRkaW5nLXRvcDogMzBweFxuICAgICAgICBwYWRkaW5nLWJvdHRvbTogMTFweFxuICAgICAgICBmb250LXNpemU6IDE2cHhcbiAgICAgICAgY29sb3I6ICMzMzMzMzNcbiAgICAub3JkZXItYWRkclxuICAgICAgcGFkZGluZy1yaWdodDogMjE3cHhcbiAgICAgIC50aXRsZVxuICAgICAgICBwYWRkaW5nLXJpZ2h0IDEwcHhcbiAgICAgIC5hZGQtYWRkclxuICAgICAgICBmbG9hdCByaWdodFxuICAgICAgICBjb2xvcjogIzJkMzE2Y1xuICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgICBjdXJzb3IgcG9pbnRlclxuICAgICAgLmFkZHJzXG4gICAgICAgIGhlaWdodDogNTBweFxuICAgICAgICBsaW5lLWhlaWdodDogNTBweFxuICAgICAgICBtYXJnaW46IDIwcHggMjBweCAxNXB4XG4gICAgICAgIG92ZXJmbG93IGhpZGRlblxuICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgdWxcbiAgICAgICAgICBsaVxuICAgICAgICAgICAgYmFja2dyb3VuZDogI0Y0RjVGQlxuICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAyMHB4XG4gICAgICAgICAgICAmOm5vdCggOmZpcnN0LWNoaWxkIClcbiAgICAgICAgICAgICAgY3Vyc29yIHBvaW50ZXJcbiAgICAgICAgICAgICAgJjpob3ZlclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICNFOEU5RjFcbiAgICAgICAgLm5hbWVcbiAgICAgICAgICBtYXJnaW4tcmlnaHQgMjBweFxuICAgICAgICAgIGNvbG9yOiAjMzMzMzMzXG4gICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGRcbiAgICAgICAgLmFkZHJcbiAgICAgICAgICBjb2xvcjogIzY2NjY2NlxuICAgICAgLmFkZHItbW9yZVxuICAgICAgICBoZWlnaHQgYXV0b1xuICAgICAgLm1vcmVcbiAgICAgICAgYmFja2dyb3VuZDogdXJsKCAnfmltYWdlcy9pY29uX2Rvd24ucG5nJyApIHJpZ2h0IGNlbnRlciBuby1yZXBlYXRcbiAgICAgICAgZGlzcGxheSBpbmxpbmUtYmxvY2tcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDIwcHhcbiAgICAgICAgcGFkZGluZy1yaWdodDogMTNweFxuICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgY29sb3I6ICMyZDMxNmNcbiAgICAuY29uZmlybVxuICAgICAgcGFkZGluZy1yaWdodDogMjE3cHhcbiAgICAgIC5saXN0XG4gICAgICAgIHBhZGRpbmctdG9wOiAyMHB4XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHhcbiAgICAgICAgLnRpdGxlXG4gICAgICAgICAgZGlzcGxheSBncmlkXG4gICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zIDUxN3B4IDFmciAxZnIgMWZyXG4gICAgICAgICAgcGFkZGluZzogMFxuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgICAuaXRlbXNcbiAgICAgICAgICBwYWRkaW5nOiAwXG4gICAgICAgICAgZm9udC1zaXplOiAxNHB4XG4gICAgICAgICAgLmNvbnRlbnRcbiAgICAgICAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zIDUxN3B4IDFmciAxZnIgMWZyXG4gICAgICAgIC50aXRsZVxuICAgICAgICAgIGJhY2tncm91bmQ6ICNGNEY1RkJcbiAgICAgICAgICBoZWlnaHQ6IDQwcHhcbiAgICAgICAgICBsaW5lLWhlaWdodDogNDBweFxuICAgICAgICAgIGNvbG9yOiAjOTk5XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyXG4gICAgICAgIC5pdGVtc1xuICAgICAgICAgIGJvcmRlci1ib3R0b20gMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgICAgICBwYWRkaW5nOiAyMXB4IDBcbiAgICAgICAgICAucGljXG4gICAgICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgICAgaW1nXG4gICAgICAgICAgICAgIHdpZHRoOiAxODBweFxuICAgICAgICAgIC5uYW1lXG4gICAgICAgICAgICBkaXNwbGF5IGJsb2NrXG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA4cHhcbiAgICAgICAgICAubW9uZXlcbiAgICAgICAgICAubnVtXG4gICAgICAgICAgLmNvdW50XG4gICAgICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudCBjZW50ZXJcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4XG4gICAgICAgICAgICBjb2xvcjogIzMzMzMzM1xuICAgICAgICAgIC5jb3VudFxuICAgICAgICAgICAgJjpiZWZvcmVcbiAgICAgICAgICAgICAgY29udGVudCAn77+lJ1xuICAgICAgICAgIC5udW1cbiAgICAgICAgICAgIGNvbG9yOiAjMWIxZDQzXG4gICAgICAgICAgLm1vbmV5XG4gICAgICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uIGNvbHVtblxuICAgICAgICAgICAgLmxpbmUtdGhyb3VnaFxuICAgICAgICAgICAgICBpXG4gICAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uIGxpbmUtdGhyb3VnaFxuICAgICAgICAgIC5jb3Vwb25cbiAgICAgICAgICAgIGRpc3BsYXkgYmxvY2tcbiAgICAgICAgICAgIGJhY2tncm91bmQgI0ZGRjdFRCB1cmwoICd+aW1hZ2VzL2Rpc2NvdW50X2ljb24ucG5nJyApIDExcHggY2VudGVyIG5vLXJlcGVhdFxuICAgICAgICAgICAgaGVpZ2h0IDI3cHhcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0IDI3cHhcbiAgICAgICAgICAgIHBhZGRpbmctbGVmdCAzN3B4XG4gICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICY6Zmlyc3QtY2hpbGRcbiAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQgMTY1cHhcbiAgICAgICAgICAgICAgICBjb2xvciAjMkQzMTZDXG4gICAgICAgICAgICAgICY6bGFzdC1jaGlsZFxuICAgICAgICAgICAgICAgIGNvbG9yICM5OTlcbiAgICAuY291cG9uX21vcmVcbiAgICAgIGJhY2tncm91bmQgI0ZGRjdFRFxuICAgICAgcG9zaXRpb24gcmVsYXRpdmVcbiAgICAgIG1hcmdpbi1sZWZ0IDMxMHB4XG4gICAgICBtYXJnaW4tcmlnaHQgMjE2cHhcbiAgICAgIG1hcmdpbi1ib3R0b20gNDBweFxuICAgICAgcGFkZGluZy10b3AgNDhweFxuICAgICAgcGFkZGluZy1sZWZ0IDIwcHhcbiAgICAgIHBhZGRpbmctYm90dG9tIDIwcHhcbiAgICAgIHBhZGRpbmctcmlnaHQgMTAwcHhcbiAgICAgIC50aXRsZVxuICAgICAgICBwb3NpdGlvbiBhYnNvbHV0ZVxuICAgICAgICBiYWNrZ3JvdW5kIHVybCggJ35pbWFnZXMvaWNvbjEucG5nJyApIG5vLXJlcGVhdFxuICAgICAgICB3aWR0aCA5MnB4XG4gICAgICAgIGhlaWdodCAzMnB4XG4gICAgICAgIGxpbmUtaGVpZ2h0IDMycHhcbiAgICAgICAgdG9wIC00cHhcbiAgICAgICAgbGVmdCAxMHB4XG4gICAgICAgIHRleHQtYWxpZ24gY2VudGVyXG4gICAgICAgIGNvbG9yICNmZmZcbiAgICAgICAgZm9udC1zaXplIDE2cHhcbiAgICAgIC5pdGVtc1xuICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAganVzdGlmeS1jb250ZW50IHNwYWNlLWJldHdlZW5cbiAgICAgICAgYWxpZ24taXRlbXMgY2VudGVyXG4gICAgICAgIGltZ1xuICAgICAgICAgIHdpZHRoIDE4MHB4XG4gICAgICAgICAgaGVpZ2h0IDE4MHB4XG4gICAgICAgICAgYm9yZGVyIDFweCBzb2xpZCByZWRcbiAgICAgICAgICBtYXJnaW4tcmlnaHQgMjBweFxuICAgICAgICBzcGFuXG4gICAgICAgICAgJjpmaXJzdC1jaGlsZFxuICAgICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcblxuICAgIC5pbmZvXG4gICAgICBiYWNrZ3JvdW5kOiAjRjRGNUZCXG4gICAgICBoZWlnaHQ6IDUwcHhcbiAgICAgIGxpbmUtaGVpZ2h0OiA1MHB4XG4gICAgICBtYXJnaW46IDAgMjE0cHggOXB4IDMxMHB4XG4gICAgICBwYWRkaW5nOiAwIDMwcHhcbiAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgY29sb3I6ICMzMzMzMzNcbiAgICAgIGVtXG4gICAgICAgIGNvbG9yOiAjZmI1OTZkXG4gICAgICAuY291bnRcbiAgICAgICAgZmxvYXQgcmlnaHRcbiAgICAucHJpY2VcbiAgICAgIG1hcmdpbjogMCAyMTRweCAwIDMxMHB4XG4gICAgICBwYWRkaW5nLXJpZ2h0OiAyMHB4XG4gICAgICBtYXJnaW4tYm90dG9tOiAyMHB4XG4gICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgIGNvbG9yOiAjOTk5OTk5XG4gICAgICBzcGFuXG4gICAgICAgIGRpc3BsYXkgYmxvY2tcbiAgICAgICAgdGV4dC1hbGlnbjogcmlnaHRcbiAgICAucGF5XG4gICAgICBmbG9hdDogcmlnaHRcbiAgICAgIGJhY2tncm91bmQ6ICMyZDMxNmNcbiAgICAgIHdpZHRoOiAxNTBweFxuICAgICAgaGVpZ2h0OiA1MHB4XG4gICAgICBsaW5lLWhlaWdodDogNTBweFxuICAgICAgbWFyZ2luLXJpZ2h0OiAyMTRweFxuICAgICAgbWFyZ2luLWJvdHRvbTogMTAwcHhcbiAgICAgIGZvbnQtc2l6ZTogMTZweFxuICAgICAgY29sb3I6ICNmZmZmZmZcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgY3Vyc29yIHBvaW50ZXJcbiAgLmNvdmVyXG4gICAgcG9zaXRpb246IGFic29sdXRlXG4gICAgZGlzcGxheSBmbGV4XG4gICAgZGlzcGxheSBub25lXG4gICAganVzdGlmeS1jb250ZW50IGNlbnRlclxuICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgIGJhY2tncm91bmQ6IHJnYmEoIDAgMCAwIDAuNSApXG4gICAgbGVmdDogMFxuICAgIHRvcDogMFxuICAgIHotaW5kZXg6IDIwMFxuICAgIHdpZHRoOiAxMDAlXG4gICAgaGVpZ2h0OiAxMDAlXG48L3N0eWxlPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy92aWV3cy92dWVfcGFnZXMvQ29uZmlybU9yZGVyLnZ1ZT9lYTJiYTk0MCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWU1NWZkODgwXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL05ld0FkZHIudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9OZXdBZGRyLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtZTU1ZmQ4ODBcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL05ld0FkZHIudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LWU1NWZkODgwXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy9tb2R1bGVzL05ld0FkZHIudnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi1lNTVmZDg4MFwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LWU1NWZkODgwXCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbW9kdWxlcy9OZXdBZGRyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gODlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi1lNTVmZDg4MFwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvTmV3QWRkci52dWVcbi8vIG1vZHVsZSBpZCA9IDkwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwibmV3LWFkZHJcIiB9LCBbXG4gICAgICBfYyhcImFcIiwgeyBzdGF0aWNDbGFzczogXCJjbG9zZVwiLCBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0pLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJpbmZvXCIgfSwgW1xuICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInRpdGxlXCIgfSwgW192bS5fdihcIuaWsOWinuaUtui0p+S6uuWcsOWdgFwiKV0pLFxuICAgICAgICBfYyhcImRsXCIsIFtcbiAgICAgICAgICBfYyhcImR0XCIsIFtfdm0uX3YoXCLlp5PlkI1cIildKSxcbiAgICAgICAgICBfYyhcImRkXCIsIFtcbiAgICAgICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJuYW1lXCIsXG4gICAgICAgICAgICAgIGF0dHJzOiB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCLloavlhpnmlLbku7bkurrlp5PlkI1cIiB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIF9jKFwiZHRcIiwgW192bS5fdihcIuaJi+acuuWPt+eggVwiKV0pLFxuICAgICAgICAgIF9jKFwiZGRcIiwgW1xuICAgICAgICAgICAgX2MoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcImlwaG9uZVwiLFxuICAgICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwi5aGr5YaZ5pS25Lu25Lq65omL5py65Y+3XCIgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBfYyhcImR0XCIsIFtfdm0uX3YoXCLmiYDlnKjlnLDln59cIildKSxcbiAgICAgICAgICBfYyhcImRkXCIsIFtcbiAgICAgICAgICAgIF9jKFwic2VsZWN0XCIsIHsgc3RhdGljQ2xhc3M6IFwicmFuZ2VcIiB9LCBbXG4gICAgICAgICAgICAgIF9jKFwib3B0aW9uXCIsIFtfdm0uX3YoXCLljJfkuqxcIildKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBfYyhcImR0XCIsIFtfdm0uX3YoXCLor6bnu4blnLDlnYBcIildKSxcbiAgICAgICAgICBfYyhcImRkXCIsIFtcbiAgICAgICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJhZGRyXCIsXG4gICAgICAgICAgICAgIGF0dHJzOiB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCLor7fovpPlhaXmlLbku7bkurror6bnu4blnLDlnYBcIiB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKSxcbiAgICAgIF9jKFwiYVwiLCB7IHN0YXRpY0NsYXNzOiBcInNhdmVcIiwgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbXG4gICAgICAgIF92bS5fdihcIuS/neWtmOaUtui0p+S6uuS/oeaBr1wiKVxuICAgICAgXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtZTU1ZmQ4ODBcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi1lNTVmZDg4MFwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9OZXdBZGRyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gOTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbmZpcm0tb3JkZXJcIiB9LCBbXG4gICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb3ZlclwiIH0sIFtfYyhcIk5ld0FkZHJcIildLCAxKSxcbiAgICBfYyhcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IHN0YXRpY0NsYXNzOiBcInRvcFwiIH0sXG4gICAgICBbXG4gICAgICAgIF9jKFwiTG9nb1wiKSxcbiAgICAgICAgX2MoXCJQcm9jZXNzXCIsIHsgYXR0cnM6IHsgc3RlcDogX3ZtLnN0ZXAsIHN0ZXBzOiBfdm0uc3RlcHMgfSB9KVxuICAgICAgXSxcbiAgICAgIDFcbiAgICApLFxuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwib3JkZXItYWRkclwiIH0sIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidGl0bGVcIiB9LCBbXG4gICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImljb25cIiB9KSxcbiAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLnoa7orqTmlLbotKflnLDlnYBcIildKSxcbiAgICAgICAgX2MoXG4gICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgeyBzdGF0aWNDbGFzczogXCJhZGQtYWRkclwiLCBvbjogeyBjbGljazogX3ZtLnNob3dNb3JlQWRkcnMgfSB9LFxuICAgICAgICAgIFtfdm0uX3YoXCLkvb/nlKjlhbbku5bmlLbotKflnLDlnYBcIildXG4gICAgICAgIClcbiAgICAgIF0pLFxuICAgICAgX2MoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgc3RhdGljQ2xhc3M6IFwiYWRkcnNcIiwgY2xhc3M6IHsgXCJhZGRyLW1vcmVcIjogX3ZtLmFkZHJNb3JlIH0gfSxcbiAgICAgICAgW1xuICAgICAgICAgIF9jKFxuICAgICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgICAgX3ZtLl9sKF92bS5hZGRycywgZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jKFxuICAgICAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgX3ZtLmNoYW5nZUFkZHJEZWZhdWx0KGluZGV4KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJuYW1lXCIgfSwgW1xuICAgICAgICAgICAgICAgICAgICBfdm0uX3YoX3ZtLl9zKGl0ZW0uY29udGFjdHMpKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJhZGRyXCIgfSwgW1xuICAgICAgICAgICAgICAgICAgICBfdm0uX3YoXG4gICAgICAgICAgICAgICAgICAgICAgX3ZtLl9zKGl0ZW0ucmVjZWl2aW5nQWRkcikgKyBcIiBcIiArIF92bS5fcyhpdGVtLm1vYmlsZSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICBdXG4gICAgICApXG4gICAgXSksXG4gICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb25maXJtXCIgfSwgW1xuICAgICAgX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSksXG4gICAgICBfYyhcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBzdGF0aWNDbGFzczogXCJsaXN0XCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgIF92bS5fbSgxLCBmYWxzZSwgZmFsc2UpLFxuICAgICAgICAgIF92bS5fbChfdm0uaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcIml0ZW1zXCIgfSwgW1xuICAgICAgICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRlbnRcIiB9LCBbXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwicGljXCIgfSwgW1xuICAgICAgICAgICAgICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IGl0ZW0uY29tbW9kaXR5LnBpYyB9IH0pLFxuICAgICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwibmFtZS1kaXNjb3VudFwiIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwibmFtZVwiIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICBfdm0uX3YoX3ZtLl9zKGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eU5hbWUpKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJtb25leVwiIH0sIFtcbiAgICAgICAgICAgICAgICAgIF9jKFwiZW1cIiwgeyBzdGF0aWNDbGFzczogXCJsaW5lLXRocm91Z2hcIiB9LCBbXG4gICAgICAgICAgICAgICAgICAgIF92bS5fdihcIuaMh+WvvOS7t++8mlwiKSxcbiAgICAgICAgICAgICAgICAgICAgX2MoXCJpXCIsIFtfdm0uX3YoXCLvv6VcIiArIF92bS5fcyhpdGVtLmNvbW1vZGl0eS5wcmljZSkpXSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgX2MoXCJlbVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIF92bS5fdihcbiAgICAgICAgICAgICAgICAgICAgICBcIuS8muWRmOS7t++8mu+/pVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIF92bS5fcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWwgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGl0ZW0uY29tbW9kaXR5LmNvbW1vZGl0eUNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJudW1cIiB9LCBbX3ZtLl92KF92bS5fcyhpdGVtLm51bSkpXSksXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiY291bnRcIiB9LCBbXG4gICAgICAgICAgICAgICAgICBfdm0uX3YoX3ZtLl9zKGl0ZW0udG90YWxBbW91bnQpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBfdm0uX20oMiwgdHJ1ZSwgZmFsc2UpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIH0pXG4gICAgICAgIF0sXG4gICAgICAgIDJcbiAgICAgIClcbiAgICBdKSxcbiAgICBfdm0uX20oMywgZmFsc2UsIGZhbHNlKSxcbiAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImluZm9cIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgW1xuICAgICAgICBfdm0uX3YoXCLlhbHmnIlcIiksXG4gICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihfdm0uX3MoX3ZtLmNvdW50KSldKSxcbiAgICAgICAgX3ZtLl92KFwi5Lu25ZWG5ZOBXCIpXG4gICAgICBdKSxcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImNvdW50XCIgfSwgW1xuICAgICAgICBfdm0uX3YoXCLmgLvorqE6IO+/pVwiICsgX3ZtLl9zKF92bS5tZW1iZXJDb3VudCkpXG4gICAgICBdKVxuICAgIF0pLFxuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwicHJpY2VcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuS8mOaDoDog77+lXCIgKyBfdm0uX3MoX3ZtLmRpc2NvdW50KSldKSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5ZWG5ZOB5oC75Lu377ya77+lXCIgKyBfdm0uX3MoX3ZtLmFtb3VudCkpXSlcbiAgICBdKSxcbiAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJwYXlcIiwgb246IHsgY2xpY2s6IF92bS5wYXkgfSB9LCBbXG4gICAgICBfdm0uX3YoXCLljrvmlK/ku5hcIilcbiAgICBdKVxuICBdKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImljb25cIiB9KSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi56Gu6K6k6K6i5Y2VXCIpXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInRpdGxlXCIgfSwgW1xuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLllYblk4FcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5Y2V5Lu3XCIpXSksXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuaVsOmHj1wiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLlsI/orqFcIildKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY291cG9uXCIgfSwgW1xuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLlpJrkubDlpJrpgIHvvIzkubDlha3pgIHkuIBcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwiW+i1oOWTgV0geHh4eHh4XCIpXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvdXBvbl9tb3JlXCIgfSwgW1xuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtfdm0uX3YoXCLorqLljZXotaDlk4FcIildKSxcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiaXRlbXNcIiB9LCBbXG4gICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IFwiXCIgfSB9KSxcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcInh4eHhcIildKVxuICAgICAgICBdKSxcbiAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCIqMVwiKV0pXG4gICAgICBdKVxuICAgIF0pXG4gIH1cbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi0zMjE4NmMyOFwiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTMyMTg2YzI4XCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvQ29uZmlybU9yZGVyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gOTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMDM1ZDA2MzRcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vRGV0YWlscy52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL0RldGFpbHMudnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0wMzVkMDYzNFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vRGV0YWlscy52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtMDM1ZDA2MzRcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL3ZpZXdzL3Z1ZV9wYWdlcy9EZXRhaWxzLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtMDM1ZDA2MzRcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi0wMzVkMDYzNFwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9EZXRhaWxzLnZ1ZVxuLy8gbW9kdWxlIGlkID0gOTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi0wMzVkMDYzNFwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9EZXRhaWxzLnZ1ZVxuLy8gbW9kdWxlIGlkID0gOTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gIC5kZXRhaWxzXG4gICAgLnRvcFxuICAgICAgTG9nb1xuICAgIC5icmVhZC1jcnVtYnModi1odG1sPSdjcnVtYigpJylcbiAgICAuZGV0YWlsXG4gICAgICAucHJvZHVjdC1pbmZvXG4gICAgICAgIGltZyggOnNyYz1cImdldFBpY1wiIClcbiAgICAgICAgLmludHJvZHV0aW9uXG4gICAgICAgICAgLm5hbWUge3tpbmZvRGF0YS5jb21tb2RpdHlOYW1lfX1cbiAgICAgICAgICAuaW5mb1xuICAgICAgICAgICAgc3BhblxuICAgICAgICAgICAgICB8IOWumOaWueaMh+WvvOS7t++8mlxuICAgICAgICAgICAgICBlbSDvv6V7e2luZm9EYXRhLnByaWNlfX1cbiAgICAgICAgICAgIHNwYW4g5ZWG5ZOB57yW5Y+377yae3tpbmZvRGF0YS5jb21tb2RpdHlDb2RlfX1cbiAgICAgICAgICAgIHNwYW4g5ZWG5ZOB5ZOB54mM77yae3tnZXRQcm9kdWN0VHlwZSgpfX1cbiAgICAgICAgICAuY291bnRcbiAgICAgICAgICAgIHNwYW4g6LSt5Lmw5pWw6YePXG4gICAgICAgICAgICBzcGFuLmNvdW50ZXJcbiAgICAgICAgICAgICAgYS5yZWR1Y2UoIEBjbGljaz0nbnVtSGFuZGxlcigtMSknICkgLVxuICAgICAgICAgICAgICBpbnB1dCggdHlwZT1cInRleHRcIiw6dmFsdWU9XCJudW1cIiApXG4gICAgICAgICAgICAgIGEuYWRkKCBAY2xpY2s9J251bUhhbmRsZXIoMSknICkgK1xuICAgICAgICAgIHNwYW4uYnV5KCBAY2xpY2s9J2FkZENvbW1vZGl0eVRvQ2FydCcgKSDliqDlhaXotK3nianovaZcbiAgICBEZXRhaWwoOmluZm9EYXRhPSdpbmZvRGF0YScsQGNsaWNrPSdhZGRDb21tb2RpdHlUb0NhcnQnKVxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCBMb2dvIGZyb20gJ21vZHVsZXMvTG9nby52dWUnO1xuaW1wb3J0IERldGFpbCBmcm9tICdtb2R1bGVzL0RldGFpbHMudnVlJztcbmltcG9ydCBhamF4IGZyb20gJ0AvdW5pdHMvY29yZS9BSkFYJztcbmltcG9ydCBDT0RFUyBmcm9tICdAL3VuaXRzL0NPTkZJRy9jb2Rlcyc7XG5pbXBvcnQgVVJMUyBmcm9tICdAL3VuaXRzL0NPTkZJRy91cmxzJztcbmltcG9ydCBDYXJ0IGZyb20gJ0AvdW5pdHMvY29yZS9DYXJ0JztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnZGV0YWlsJyxcbiAgZGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW5mb0RhdGE6IHt9LFxuICAgICAgbnVtOiAxLFxuICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICBjcnVtYjogKCkgPT4ge1xuICAgICAgICBsZXQgY2EgPSBKU09OLnBhcnNlKCBKU09OLnN0cmluZ2lmeSggdGhpcy4kcm91dGUubWV0YSApICk7XG4gICAgICAgIGxldCBjciA9ICcnO1xuICAgICAgICBpZiAoIGNhICYmIGNhIGluc3RhbmNlb2YgQXJyYXkgKSB7XG4gICAgICAgICAgY2EucHVzaCggdGhpcy5nZXRQcm9kdWN0VHlwZSgpICk7XG4gICAgICAgICAgKCB0aGlzLmluZm9EYXRhLmNvbW1vZGl0eU5hbWUgKSAmJiBjYS5wdXNoKCB0aGlzLmluZm9EYXRhLmNvbW1vZGl0eU5hbWUgKTtcbiAgICAgICAgICBjciA9IGNhLmpvaW4oICcmbmJzcD4mbmJzcCcgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyDpppbpobUgPiDotK3kubDnuqLphZIgPiDpppnmoLzph4zmi4kgPiB7e2luZm9EYXRhLmNvbW1vZGl0eU5hbWV9fVxuICAgICAgICByZXR1cm4gY3IubGVuZ3RoID4gMCA/ICflvZPliY3kvY3nva7vvJonICsgY3I6Jyc7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgY29tcG9uZW50czoge1xuICAgIERldGFpbCxcbiAgICBMb2dvXG4gIH0sXG4gIGNvbXB1dGVkOiB7XG4gICAgZ2V0UGljKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5mb0RhdGEucGljID8gVVJMUy5CYXNlVVJMICsgdGhpcy5pbmZvRGF0YS5waWM6Jyc7XG4gICAgfVxuICB9LFxuICBtb3VudGVkKCkge1xuICAgIHRoaXMuZ2V0UGFnZUluZm9yKCk7XG4gICAgQ2FydC5nZXRDYXJ0TGlzdCgge1xuICAgICAgJHN0b3JlOiB0aGlzLiRzdG9yZVxuICAgIH0gKTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIC8qIOiOt+WPlmRldGFpbOmhtemdouWGheWuuSAqL1xuICAgIGdldFBhZ2VJbmZvcigpIHtcbiAgICAgIGFqYXguZ2V0KCB7XG4gICAgICAgIHVybDogVVJMUy5nZXRDb21tb2RpdHlDaGFubmVsQnlJRCxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgY29tbW9kaXR5SUQ6ICdlOWFlNzkzMzM1ODQ0MjE1YTYwMmI0YzZjMDU0MjU2NydcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgaWYgKCAhcmVzLmRhdGEgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oICfov5Tlm57lvILluLg6JywgcmVzLmNvbmZpZy51cmwgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBTdHJpbmcoIHJlcy5kYXRhLmNvZGUgKSA9PT0gJzAnICkge1xuICAgICAgICAgICAgdGhpcy5pbmZvRGF0YSA9IHJlcy5kYXRhLnJlc3VsdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCByZXMuZGF0YS5tc2cgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9LFxuICAgIGdldFByb2R1Y3RUeXBlKCkge1xuICAgICAgbGV0IHR5cGUgPSB0aGlzLiRyb3V0ZS5wYXJhbXMuaWQ7XG4gICAgICBsZXQgbmFtZSA9ICfpppnmoLzph4zmi4knO1xuICAgICAgc3dpdGNoICggdHlwZSApIHtcbiAgICAgICAgY2FzZSAnMTAxMCc6XG4gICAgICAgICAgbmFtZSA9ICflj6PlrZDnqpYnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcxMDIwJzpcbiAgICAgICAgICBuYW1lID0gJ+mmmeagvOmHjOaLiSc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzEwMzAnOlxuICAgICAgICAgIG5hbWUgPSAn5Zyf54m55LqnJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH0sXG4gICAgbnVtSGFuZGxlciggdmFsICkge1xuICAgICAgaWYgKCB2YWwgPiAwICkge1xuICAgICAgICB0aGlzLm51bSsrO1xuICAgICAgfSBlbHNlIGlmICggdmFsIDwgMCApIHtcbiAgICAgICAgdGhpcy5udW0tLTtcbiAgICAgIH1cbiAgICAgIHRoaXMubnVtID0gTWF0aC5tYXgoIDAsIHRoaXMubnVtICk7XG4gICAgfSxcbiAgICAvKiBkZXRhaWzpobXmt7vliqDliLDotK3nianovaYgKi9cbiAgICBhZGRDb21tb2RpdHlUb0NhcnQoKSB7XG4gICAgICBhamF4LnBvc3QoIHtcbiAgICAgICAgdXJsOiBVUkxTLmFkZENvbW1vZGl0eVRvQ2FydCxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHVzZXJJRDogJzcwM2QwNjViMGI2ODRhZTliZjRmYTNiZTY3YTQ3MjZjJyxcbiAgICAgICAgICBjb21tb2RpdHlJRDogJ2U5YWU3OTMzMzU4NDQyMTVhNjAyYjRjNmMwNTQyNTY3JyxcbiAgICAgICAgICBudW06IHRoaXMubnVtXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgaWYgKCAhcmVzLmRhdGEgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oICfov5Tlm57lvILluLg6JywgcmVzLmNvbmZpZy51cmwgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIHJlcy5kYXRhLmNvZGUgPT09IENPREVTLlNVQ0NFU1MgKSB7XG4gICAgICAgICAgICBhbGVydCggcmVzLmRhdGEubXNnICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybiggcmVzLmRhdGEubXNnICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG59O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAuZGV0YWlsc1xuICAgIC50b3BcbiAgICAgIGRpc3BsYXk6IGZsZXhcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXJcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlblxuICAgICAgYm9yZGVyLWJvdHRvbSAxcHggc29saWQgI0YwRjNGNVxuICAgICAgbWFyZ2luLXJpZ2h0OiAyNDBweFxuICAgICAgbWFyZ2luLWxlZnQ6IDMxMHB4XG4gICAgLmJyZWFkLWNydW1ic1xuICAgICAgZmxvYXQ6IHJpZ2h0XG4gICAgICBtYXJnaW4tcmlnaHQ6IDMxMHB4XG4gICAgICBtYXJnaW4tdG9wOiAzMHB4XG4gICAgICBtYXJnaW4tYm90dG9tOiAyMHB4XG4gICAgICBmb250LXNpemU6IDEycHhcbiAgICAgIGNvbG9yOiAjOTk5OTk5XG4gICAgLmRldGFpbFxuICAgICAgY2xlYXI6IGJvdGhcbiAgICAgIGJvcmRlci10b3AgMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgIG1hcmdpbjogMCAzMTBweFxuICAgICAgcGFkZGluZy10b3A6IDQ0cHhcbiAgICAgIC5wcm9kdWN0LWluZm9cbiAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgIHdpZHRoOiAxMDAlXG4gICAgICAgIHBhZGRpbmctYm90dG9tIDEyNHB4XG4gICAgICAgIG1hcmdpbi1ib3R0b20gMjBweFxuICAgICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICAgIGltZ1xuICAgICAgICAgIHdpZHRoIDUwMHB4XG4gICAgICAgICAgbWFyZ2luLXJpZ2h0OiAxMDNweFxuICAgICAgICAuaW50cm9kdXRpb25cbiAgICAgICAgICB3aWR0aDogMTAwJVxuICAgICAgICAgIGFsaWduLXNlbGYgZmxleC1lbmRcbiAgICAgICAgICAubmFtZVxuICAgICAgICAgICAgbWFyZ2luLXRvcDogNjhweFxuICAgICAgICAgICAgZm9udC1zaXplOiAyNnB4XG4gICAgICAgICAgICBjb2xvcjogIzY2NjY2NlxuICAgICAgICAgIC5pbmZvXG4gICAgICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudCBjZW50ZXJcbiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uIGNvbHVtblxuICAgICAgICAgICAgYmFja2dyb3VuZDogI2YwZjNmNVxuICAgICAgICAgICAgcGFkZGluZzogMTZweCAwIDE2cHggMTZweFxuICAgICAgICAgICAgbWFyZ2luLXRvcDogNTFweFxuICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4XG4gICAgICAgICAgICBjb2xvcjogIzMzMzMzM1xuICAgICAgICAgICAgJjpsYXN0LWNoaWxkXG4gICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDBcbiAgICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4XG4gICAgICAgICAgICBlbVxuICAgICAgICAgICAgICBmb250LXNpemU6IDIwcHhcbiAgICAgICAgICAuY291bnRcbiAgICAgICAgICAgIG1hcmdpbi10b3A6IDI2cHhcbiAgICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICAgICAgY29sb3I6ICMzMzMzMzNcbiAgICAgICAgICAgIC5jb3VudGVyXG4gICAgICAgICAgICAgIGRpc3BsYXkgZmxleFxuICAgICAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgICAgICAgbWFyZ2luLXRvcDogMTBweFxuICAgICAgICAgICAgICBpbnB1dFxuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDBweFxuICAgICAgICAgICAgICAgIGhlaWdodDogNDBweFxuICAgICAgICAgICAgICAgIGJvcmRlciAxcHggc29saWQgI0M1QzZENlxuICAgICAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMTBweFxuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweFxuICAgICAgICAgICAgICAgIGNvbG9yOiAjMmQzMTZjXG4gICAgICAgICAgICAgIC5yZWR1Y2VcbiAgICAgICAgICAgICAgLmFkZFxuICAgICAgICAgICAgICAgIGRpc3BsYXkgaW5saW5lLWJsb2NrXG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwcHhcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDQwcHhcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMzZweFxuICAgICAgICAgICAgICAgIGJvcmRlciAxcHggc29saWQgI0M1QzZENlxuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMzBweFxuICAgICAgICAgICAgICAgIGNvbG9yOiAjMmQzMTZjXG4gICAgICAgICAgICAgIC5yZWR1Y2VcbiAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDEwcHhcbiAgICAgICAgICAgICAgLmFkZFxuICAgICAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxMHB4XG4gICAgICAgICAgLmJ1eVxuICAgICAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICAgICAgYmFja2dyb3VuZDogIzJkMzE2Y1xuICAgICAgICAgICAgd2lkdGg6IDIxN3B4XG4gICAgICAgICAgICBoZWlnaHQ6IDQ4cHhcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiA0OHB4XG4gICAgICAgICAgICBtYXJnaW4tdG9wOiA1MHB4XG4gICAgICAgICAgICBmb250LXNpemU6IDE2cHhcbiAgICAgICAgICAgIGNvbG9yOiAjZmZmZmZmXG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgICAgICY6YmVmb3JlXG4gICAgICAgICAgICAgIGNvbnRlbnQgJysnXG4gICAgICAgICAgICAgIG1hcmdpbi1yaWdodDogMTBweFxuICAgICAgICAgIC5yZWR1Y2VcbiAgICAgICAgICAuYWRkXG4gICAgICAgICAgLmJ1eVxuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyXG48L3N0eWxlPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy92aWV3cy92dWVfcGFnZXMvRGV0YWlscy52dWU/MjY1M2M0MmUiLCJ2YXIgZGlzcG9zZWQgPSBmYWxzZVxuZnVuY3Rpb24gaW5qZWN0U3R5bGUgKHNzckNvbnRleHQpIHtcbiAgaWYgKGRpc3Bvc2VkKSByZXR1cm5cbiAgcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XFxcIm9taXRcXFwiOjEsXFxcInJlbW92ZVxcXCI6dHJ1ZSxcXFwicHVibGljUGF0aFxcXCI6XFxcIi4uL1xcXCJ9IXZ1ZS1zdHlsZS1sb2FkZXIhY3NzLWxvYWRlcj97XFxcIm1pbmltaXplXFxcIjpmYWxzZX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4P3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi0xMWVkNmJkMVxcXCIsXFxcInNjb3BlZFxcXCI6dHJ1ZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjpmYWxzZX0hc3R5bHVzLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9EZXRhaWxzLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vRGV0YWlscy52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTExZWQ2YmQxXFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9EZXRhaWxzLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBcImRhdGEtdi0xMWVkNmJkMVwiXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvbW9kdWxlcy9EZXRhaWxzLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtMTFlZDZiZDFcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi0xMWVkNmJkMVwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvRGV0YWlscy52dWVcbi8vIG1vZHVsZSBpZCA9IDk3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtMTFlZDZiZDFcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0RldGFpbHMudnVlXG4vLyBtb2R1bGUgaWQgPSA5OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgLmRldGFpbC1pbmZvXG4gICAgLnByb2R1Y3QtZGV0YWlsXG4gICAgICAuY29tbW9kaXR5SW1nc1xuICAgICAgICAucHJvZHVjdC1pdGVtKHYtZm9yPSdpdGVtIGluIGluZm9EYXRhLmNvbW1vZGl0eUltZ3MnLDpzdHlsZT0ne29yZGVyOml0ZW0uc2VxdWVuY2VOdW1iZXJ9JylcbiAgICAgICAgICBpbWcoOnNyYz0nZ2V0UHJvZHVjdFBpYyhpdGVtLmltZ1VybCknKVxuICAgICAgLmJyYW5kSW1nc1xuICAgICAgICAucHJvZHVjdC1pdGVtKHYtZm9yPSdpdGVtIGluIGluZm9EYXRhLmJyYW5kSW1ncycsOnN0eWxlPSd7b3JkZXI6aXRlbS5zZXF1ZW5jZU51bWJlcn0nKVxuICAgICAgICAgIGltZyg6c3JjPSdnZXRQcm9kdWN0UGljKGl0ZW0uaW1nVXJsKScpXG4gICAgICAuY29tcGFueUltZ3NcbiAgICAgICAgLnByb2R1Y3QtaXRlbSh2LWZvcj0naXRlbSBpbiBpbmZvRGF0YS5jb21wYW55SW1ncycsOnN0eWxlPSd7b3JkZXI6aXRlbS5zZXF1ZW5jZU51bWJlcn0nKVxuICAgICAgICAgIGltZyg6c3JjPSdnZXRQcm9kdWN0UGljKGl0ZW0uaW1nVXJsKScpXG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICBpbXBvcnQgVVJMUyBmcm9tICdAL3VuaXRzL0NPTkZJRy91cmxzJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgcHJvcHM6IHtcbiAgICAgIGluZm9EYXRhOiB7XG4gICAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGRlZmF1bHQ6IHt9XG4gICAgICB9XG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBnZXRQcm9kdWN0UGljKCB1cmwgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluZm9EYXRhLnBpYyA/IFVSTFMuQmFzZVVSTCArIHVybDonJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gIC5kZXRhaWwtaW5mb1xuICAgIG92ZXJmbG93OiBoaWRkZW5cbiAgICAucHJvZHVjdC1kZXRhaWxcbiAgICAgIC5jb21tb2RpdHlJbWdzXG4gICAgICAuYnJhbmRJbWdzXG4gICAgICAuY29tcGFueUltZ3NcbiAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uIGNvbHVtblxuICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgLnByb2R1Y3QtaXRlbVxuICAgICAgICAgIGRpc3BsYXk6IGZsZXhcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlclxuPC9zdHlsZT5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9EZXRhaWxzLnZ1ZT80MTE4MjkyMiIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJkZXRhaWwtaW5mb1wiIH0sIFtcbiAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInByb2R1Y3QtZGV0YWlsXCIgfSwgW1xuICAgICAgX2MoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgc3RhdGljQ2xhc3M6IFwiY29tbW9kaXR5SW1nc1wiIH0sXG4gICAgICAgIF92bS5fbChfdm0uaW5mb0RhdGEuY29tbW9kaXR5SW1ncywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBfYyhcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInByb2R1Y3QtaXRlbVwiLFxuICAgICAgICAgICAgICBzdHlsZTogeyBvcmRlcjogaXRlbS5zZXF1ZW5jZU51bWJlciB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW19jKFwiaW1nXCIsIHsgYXR0cnM6IHsgc3JjOiBfdm0uZ2V0UHJvZHVjdFBpYyhpdGVtLmltZ1VybCkgfSB9KV1cbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgX2MoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgc3RhdGljQ2xhc3M6IFwiYnJhbmRJbWdzXCIgfSxcbiAgICAgICAgX3ZtLl9sKF92bS5pbmZvRGF0YS5icmFuZEltZ3MsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gX2MoXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJwcm9kdWN0LWl0ZW1cIixcbiAgICAgICAgICAgICAgc3R5bGU6IHsgb3JkZXI6IGl0ZW0uc2VxdWVuY2VOdW1iZXIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFtfYyhcImltZ1wiLCB7IGF0dHJzOiB7IHNyYzogX3ZtLmdldFByb2R1Y3RQaWMoaXRlbS5pbWdVcmwpIH0gfSldXG4gICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIF9jKFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IHN0YXRpY0NsYXNzOiBcImNvbXBhbnlJbWdzXCIgfSxcbiAgICAgICAgX3ZtLl9sKF92bS5pbmZvRGF0YS5jb21wYW55SW1ncywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBfYyhcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInByb2R1Y3QtaXRlbVwiLFxuICAgICAgICAgICAgICBzdHlsZTogeyBvcmRlcjogaXRlbS5zZXF1ZW5jZU51bWJlciB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW19jKFwiaW1nXCIsIHsgYXR0cnM6IHsgc3JjOiBfdm0uZ2V0UHJvZHVjdFBpYyhpdGVtLmltZ1VybCkgfSB9KV1cbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgXSlcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTExZWQ2YmQxXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtMTFlZDZiZDFcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvRGV0YWlscy52dWVcbi8vIG1vZHVsZSBpZCA9IDEwMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFxuICAgIFwiZGl2XCIsXG4gICAgeyBzdGF0aWNDbGFzczogXCJkZXRhaWxzXCIgfSxcbiAgICBbXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInRvcFwiIH0sIFtfYyhcIkxvZ29cIildLCAxKSxcbiAgICAgIF9jKFwiZGl2XCIsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6IFwiYnJlYWQtY3J1bWJzXCIsXG4gICAgICAgIGRvbVByb3BzOiB7IGlubmVySFRNTDogX3ZtLl9zKF92bS5jcnVtYigpKSB9XG4gICAgICB9KSxcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZGV0YWlsXCIgfSwgW1xuICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInByb2R1Y3QtaW5mb1wiIH0sIFtcbiAgICAgICAgICBfYyhcImltZ1wiLCB7IGF0dHJzOiB7IHNyYzogX3ZtLmdldFBpYyB9IH0pLFxuICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiaW50cm9kdXRpb25cIiB9LCBbXG4gICAgICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcIm5hbWVcIiB9LCBbXG4gICAgICAgICAgICAgIF92bS5fdihfdm0uX3MoX3ZtLmluZm9EYXRhLmNvbW1vZGl0eU5hbWUpKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImluZm9cIiB9LCBbXG4gICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgICAgICAgX3ZtLl92KFwi5a6Y5pa55oyH5a+85Lu377yaXCIpLFxuICAgICAgICAgICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihcIu+/pVwiICsgX3ZtLl9zKF92bS5pbmZvRGF0YS5wcmljZSkpXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgICAgICAgX3ZtLl92KFwi5ZWG5ZOB57yW5Y+377yaXCIgKyBfdm0uX3MoX3ZtLmluZm9EYXRhLmNvbW1vZGl0eUNvZGUpKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLllYblk4Hlk4HniYzvvJpcIiArIF92bS5fcyhfdm0uZ2V0UHJvZHVjdFR5cGUoKSkpXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb3VudFwiIH0sIFtcbiAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLotK3kubDmlbDph49cIildKSxcbiAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwiY291bnRlclwiIH0sIFtcbiAgICAgICAgICAgICAgICBfYyhcbiAgICAgICAgICAgICAgICAgIFwiYVwiLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJyZWR1Y2VcIixcbiAgICAgICAgICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdm0ubnVtSGFuZGxlcigtMSlcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBbX3ZtLl92KFwiLVwiKV1cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgICAgICAgICAgYXR0cnM6IHsgdHlwZTogXCJ0ZXh0XCIgfSxcbiAgICAgICAgICAgICAgICAgIGRvbVByb3BzOiB7IHZhbHVlOiBfdm0ubnVtIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBfYyhcbiAgICAgICAgICAgICAgICAgIFwiYVwiLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJhZGRcIixcbiAgICAgICAgICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdm0ubnVtSGFuZGxlcigxKVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIFtfdm0uX3YoXCIrXCIpXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgX2MoXG4gICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICB7IHN0YXRpY0NsYXNzOiBcImJ1eVwiLCBvbjogeyBjbGljazogX3ZtLmFkZENvbW1vZGl0eVRvQ2FydCB9IH0sXG4gICAgICAgICAgICAgIFtfdm0uX3YoXCLliqDlhaXotK3nianovaZcIildXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pLFxuICAgICAgX2MoXCJEZXRhaWxcIiwge1xuICAgICAgICBhdHRyczogeyBpbmZvRGF0YTogX3ZtLmluZm9EYXRhIH0sXG4gICAgICAgIG9uOiB7IGNsaWNrOiBfdm0uYWRkQ29tbW9kaXR5VG9DYXJ0IH1cbiAgICAgIH0pXG4gICAgXSxcbiAgICAxXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTAzNWQwNjM0XCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtMDM1ZDA2MzRcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9EZXRhaWxzLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LTJlYjM3MWM0XFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0luZm9ybWF0aW9uLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vSW5mb3JtYXRpb24udnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0yZWIzNzFjNFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vSW5mb3JtYXRpb24udnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LTJlYjM3MWM0XCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy92aWV3cy92dWVfcGFnZXMvSW5mb3JtYXRpb24udnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi0yZWIzNzFjNFwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LTJlYjM3MWM0XCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmlld3MvdnVlX3BhZ2VzL0luZm9ybWF0aW9uLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtMmViMzcxYzRcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvSW5mb3JtYXRpb24udnVlXG4vLyBtb2R1bGUgaWQgPSAxMDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gICNpbmZvbWF0aW9uXG4gICAgLnRvcFxuICAgICAgTG9nbyggOnRpdGxlPVwidGl0bGVcIiApXG4gICAgICAubG9naW4oIHYtaWY9XCJ0eXBlID09PSAncmVnaXN0ZXInXCIgKVxuICAgICAgICB8IOW3suacieW4kOWPt++8n1xuICAgICAgICBhKCBocmVmPVwiI1wiICkg56uL5Y2z55m75b2VXG4gICAgbWFpbi5tYWluXG4gICAgICBQcm9jZXNzKCA6c3RlcD1cInN0ZXBcIiwgOnN0ZXBzPVwic3RlcHNcIiApXG4gICAgICAuZm9ybVxuICAgICAgICB1bFxuICAgICAgICAgIGxpXG4gICAgICAgICAgICBzcGFuIOaJi+acuuWPt+eggVxuICAgICAgICAgICAgaW5wdXQucGhvbmUoIHR5cGU9XCJudW1iZXJcIiApXG4gICAgICAgICAgbGlcbiAgICAgICAgICAgIHNwYW4g6aqM6K+B56CBXG4gICAgICAgICAgICBpbnB1dC5jb2RlKCB0eXBlPVwidGV4dFwiIClcbiAgICAgICAgICAgIGEuZ2V0Q29kZSggaHJlZj1cIiNcIiApIOiOt+WPlumqjOivgeeggVxuICAgICAgICAgIGxpXG4gICAgICAgICAgICBzcGFuKCB2LWlmPVwidHlwZSA9PT0gJ3JlZ2lzdGVyJ1wiKSDorr7nva7lr4bnoIFcbiAgICAgICAgICAgIHNwYW4oIHYtZWxzZSApIOiuvue9ruaWsOWvhueggVxuICAgICAgICAgICAgaW5wdXQubmV3UFcoIHR5cGU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwi6K+36K6+572u5oKo55qE5a+G56CBXCIgKVxuICAgICAgICAgIGxpXG4gICAgICAgICAgICBzcGFuKCB2LWlmPVwidHlwZSA9PT0gJ3JlZ2lzdGVyJ1wiKSDnoa7orqTlr4bnoIFcbiAgICAgICAgICAgIHNwYW4oIHYtZWxzZSApIOehruiupOaWsOWvhueggVxuICAgICAgICAgICAgaW5wdXQuY29uZm9ybSggdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCLor7fnoa7orqTmgqjnmoTlr4bnoIFcIiApXG4gICAgICAgIGEub2soIGhyZWY9XCIjXCIsIHYtaWY9XCJ0eXBlID09PSAncmVnaXN0ZXInXCIgKSDms6jlhoxcbiAgICAgICAgYS5vayggaHJlZj1cIiNcIiwgdi1lbHNlKSDnoa7orqTkv67mlLlcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgTG9nbyBmcm9tICdtb2R1bGVzL0xvZ28udnVlJztcbmltcG9ydCBQcm9jZXNzIGZyb20gJ21vZHVsZXMvUHJvY2Vzcy52dWUnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdpbmZvbWF0aW9uJyxcbiAgY29tcG9uZW50czoge1xuICAgIExvZ28sXG4gICAgUHJvY2Vzc1xuICB9LFxuICBwcm9wczogWyd0eXBlJ10sXG4gIGRhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIHN0ZXA6IDEsXG4gICAgICBzdGVwczogW11cbiAgICB9O1xuICB9LFxuICBtb3VudGVkKCkge1xuICAgIHRoaXMudXBMb2FkKCk7XG4gIH0sXG4gIHdhdGNoOiB7XG4gICAgJHJvdXRlKCkge1xuICAgICAgdGhpcy51cExvYWQoKTtcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICB1cExvYWQoKSB7XG4gICAgICBzd2l0Y2ggKCB0aGlzLnR5cGUgKSB7XG4gICAgICAgIGNhc2UgJ3B3JzpcbiAgICAgICAgICB0aGlzLnRpdGxlID0gJ+S/ruaUueWvhueggSc7XG4gICAgICAgICAgdGhpcy5zdHBlcyA9IFtcbiAgICAgICAgICAgICfloavlhpnkv6Hmga8nLFxuICAgICAgICAgICAgJ+S/ruaUueaIkOWKnydcbiAgICAgICAgICBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWdpc3Rlcic6XG4gICAgICAgICAgdGhpcy50aXRsZSA9ICfmrKLov47ms6jlhozkuYXpmobllYbotLgnO1xuICAgICAgICAgIHRoaXMuc3RlcHMgPSBbXG4gICAgICAgICAgICAn5aGr5YaZ5L+h5oGvJyxcbiAgICAgICAgICAgICfms6jlhozmiJDlip8nXG4gICAgICAgICAgXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gICNpbmZvbWF0aW9uXG4gICAgLnRvcFxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlclxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuXG4gICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBtYXJnaW4tcmlnaHQ6IDI0MHB4XG4gICAgICBtYXJnaW4tbGVmdDogMzEwcHhcbiAgICAubWFpblxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtblxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlclxuICAgICAgbWFyZ2luLWJvdHRvbTogMTU4cHhcbiAgICAgIC5mb3JtXG4gICAgICAgIHBhZGRpbmctdG9wOiAzMHB4XG4gICAgICAgIGxpXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMjBweFxuICAgICAgICAgICY6bGFzdC1jaGlsZFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMFxuICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9ja1xuICAgICAgICAgICAgd2lkdGg6IDgwcHhcbiAgICAgICAgICAgIG1hcmdpbi1yaWdodDogMjBweFxuICAgICAgICAgICAgdGV4dC1hbGlnbjogcmlnaHRcbiAgICAgICAgICAgIGNvbG9yOiAjNjY2XG4gICAgICAgICAgaW5wdXRcbiAgICAgICAgICAgIHdpZHRoOiAzNzBweFxuICAgICAgICAgICAgaGVpZ2h0OiA0MHB4XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogNDBweFxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0M1QzZENlxuICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAxNXB4XG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICAgIGNvbG9yOiAjMzMzXG4gICAgICAgICAgLm5ld1BXXG4gICAgICAgICAgLmNvbmZvcm1cbiAgICAgICAgICAgIGNvbG9yOiAjOTk5XG4gICAgICAgICAgLmNvZGVcbiAgICAgICAgICAgIHdpZHRoOiAyNTBweFxuICAgICAgICAgIC5nZXRDb2RlXG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2tcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICNFOEU5RjFcbiAgICAgICAgICAgIHdpZHRoOiAxMjBweFxuICAgICAgICAgICAgaGVpZ2h0OiA0MHB4XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogNDBweFxuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IGJvdHRvbVxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0M1QzZENlxuICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IG5vbmVcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgICAgICAgY29sb3I6ICM0NDRCOUNcbiAgICAgICAgLm9rXG4gICAgICAgICAgZGlzcGxheTogYmxvY2tcbiAgICAgICAgICBiYWNrZ3JvdW5kOiAjMkQzMTZDXG4gICAgICAgICAgd2lkdGg6IDM4N3B4XG4gICAgICAgICAgaGVpZ2h0OiA1MHB4XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDUwcHhcbiAgICAgICAgICBtYXJnaW4tdG9wOiA0MHB4XG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDEwMHB4XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyXG4gICAgICAgICAgZm9udC1zaXplOiAxNnB4XG4gICAgICAgICAgY29sb3I6ICNmZmZcbjwvc3R5bGU+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy92aWV3cy92dWVfcGFnZXMvSW5mb3JtYXRpb24udnVlPzQzNGFkOGUyIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcImRpdlwiLCB7IGF0dHJzOiB7IGlkOiBcImluZm9tYXRpb25cIiB9IH0sIFtcbiAgICBfYyhcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IHN0YXRpY0NsYXNzOiBcInRvcFwiIH0sXG4gICAgICBbXG4gICAgICAgIF9jKFwiTG9nb1wiLCB7IGF0dHJzOiB7IHRpdGxlOiBfdm0udGl0bGUgfSB9KSxcbiAgICAgICAgX3ZtLnR5cGUgPT09IFwicmVnaXN0ZXJcIlxuICAgICAgICAgID8gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJsb2dpblwiIH0sIFtcbiAgICAgICAgICAgICAgX3ZtLl92KFwi5bey5pyJ5biQ5Y+377yfXCIpLFxuICAgICAgICAgICAgICBfYyhcImFcIiwgeyBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0sIFtfdm0uX3YoXCLnq4vljbPnmbvlvZVcIildKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICA6IF92bS5fZSgpXG4gICAgICBdLFxuICAgICAgMVxuICAgICksXG4gICAgX2MoXG4gICAgICBcIm1haW5cIixcbiAgICAgIHsgc3RhdGljQ2xhc3M6IFwibWFpblwiIH0sXG4gICAgICBbXG4gICAgICAgIF9jKFwiUHJvY2Vzc1wiLCB7IGF0dHJzOiB7IHN0ZXA6IF92bS5zdGVwLCBzdGVwczogX3ZtLnN0ZXBzIH0gfSksXG4gICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZm9ybVwiIH0sIFtcbiAgICAgICAgICBfYyhcInVsXCIsIFtcbiAgICAgICAgICAgIF92bS5fbSgwLCBmYWxzZSwgZmFsc2UpLFxuICAgICAgICAgICAgX3ZtLl9tKDEsIGZhbHNlLCBmYWxzZSksXG4gICAgICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICAgICAgX3ZtLnR5cGUgPT09IFwicmVnaXN0ZXJcIlxuICAgICAgICAgICAgICAgID8gX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLorr7nva7lr4bnoIFcIildKVxuICAgICAgICAgICAgICAgIDogX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLorr7nva7mlrDlr4bnoIFcIildKSxcbiAgICAgICAgICAgICAgX2MoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwibmV3UFdcIixcbiAgICAgICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInBhc3N3b3JkXCIsIHBsYWNlaG9sZGVyOiBcIuivt+iuvue9ruaCqOeahOWvhueggVwiIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgX2MoXCJsaVwiLCBbXG4gICAgICAgICAgICAgIF92bS50eXBlID09PSBcInJlZ2lzdGVyXCJcbiAgICAgICAgICAgICAgICA/IF9jKFwic3BhblwiLCBbX3ZtLl92KFwi56Gu6K6k5a+G56CBXCIpXSlcbiAgICAgICAgICAgICAgICA6IF9jKFwic3BhblwiLCBbX3ZtLl92KFwi56Gu6K6k5paw5a+G56CBXCIpXSksXG4gICAgICAgICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcImNvbmZvcm1cIixcbiAgICAgICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInBhc3N3b3JkXCIsIHBsYWNlaG9sZGVyOiBcIuivt+ehruiupOaCqOeahOWvhueggVwiIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgX3ZtLnR5cGUgPT09IFwicmVnaXN0ZXJcIlxuICAgICAgICAgICAgPyBfYyhcImFcIiwgeyBzdGF0aWNDbGFzczogXCJva1wiLCBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0sIFtcbiAgICAgICAgICAgICAgICBfdm0uX3YoXCLms6jlhoxcIilcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIDogX2MoXCJhXCIsIHsgc3RhdGljQ2xhc3M6IFwib2tcIiwgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbXG4gICAgICAgICAgICAgICAgX3ZtLl92KFwi56Gu6K6k5L+u5pS5XCIpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdLFxuICAgICAgMVxuICAgIClcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwibGlcIiwgW1xuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLmiYvmnLrlj7fnoIFcIildKSxcbiAgICAgIF9jKFwiaW5wdXRcIiwgeyBzdGF0aWNDbGFzczogXCJwaG9uZVwiLCBhdHRyczogeyB0eXBlOiBcIm51bWJlclwiIH0gfSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImxpXCIsIFtcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi6aqM6K+B56CBXCIpXSksXG4gICAgICBfYyhcImlucHV0XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29kZVwiLCBhdHRyczogeyB0eXBlOiBcInRleHRcIiB9IH0pLFxuICAgICAgX2MoXCJhXCIsIHsgc3RhdGljQ2xhc3M6IFwiZ2V0Q29kZVwiLCBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0sIFtcbiAgICAgICAgX3ZtLl92KFwi6I635Y+W6aqM6K+B56CBXCIpXG4gICAgICBdKVxuICAgIF0pXG4gIH1cbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi0yZWIzNzFjNFwiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTJlYjM3MWM0XCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvSW5mb3JtYXRpb24udnVlXG4vLyBtb2R1bGUgaWQgPSAxMDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMDY3OWIxYmVcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vUGVyc29uYWwudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xuaW1wb3J0IF9fdnVlX3NjcmlwdF9fIGZyb20gXCIhIWJhYmVsLWxvYWRlciEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCZidXN0Q2FjaGUhLi9QZXJzb25hbC52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTA2NzliMWJlXFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9QZXJzb25hbC52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtMDY3OWIxYmVcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL3ZpZXdzL3Z1ZV9wYWdlcy9QZXJzb25hbC52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTA2NzliMWJlXCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMDY3OWIxYmVcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy92aWV3cy92dWVfcGFnZXMvUGVyc29uYWwudnVlXG4vLyBtb2R1bGUgaWQgPSAxMDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi0wNjc5YjFiZVwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL3ZpZXdzL3Z1ZV9wYWdlcy9QZXJzb25hbC52dWVcbi8vIG1vZHVsZSBpZCA9IDEwN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgI3BlcnNvbmFsXG4gICAgLnRvcFxuICAgICAgTG9nb1xuICAgIG1haW4ubWFpblxuICAgICAgLnVzZXItaW1hZ2VcbiAgICAgICAgaW1nKCA6c3JjPVwic3JjXCIgKVxuICAgICAgICAubmFtZSDmrKLov47mgqjvvIx7e25hbWV9fVxuICAgICAgICBzcGFuLm15LW9yZGVyIOaIkeeahOiuouWNlVxuICAgICAgICBzcGFuLnNldHRpbmcg5Liq5Lq66K6+572uXG4gICAgICAudXNlci1pbmZvXG4gICAgICAgIDwhLS0gUGVyc29uYWxTZXR0aW5nIC0tPlxuICAgICAgICA8IS0tIE15T3JkZXJMaXN0IC0tPlxuICAgICAgICBNeU9yZGVyRGV0YWlsXG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuaW1wb3J0IExvZ28gZnJvbSAnbW9kdWxlcy9Mb2dvLnZ1ZSc7XG5pbXBvcnQgUGVyc29uYWxTZXR0aW5nIGZyb20gJ21vZHVsZXMvUGVyc29uYWxTZXR0aW5nLnZ1ZSc7XG5pbXBvcnQgTXlPcmRlckxpc3QgZnJvbSAnbW9kdWxlcy9NeU9yZGVyc0xpc3QudnVlJztcbmltcG9ydCBNeU9yZGVyRGV0YWlsIGZyb20gJ21vZHVsZXMvTXlPcmRlckRldGFpbC52dWUnO1xuaW1wb3J0IENhcnQgZnJvbSAnQC91bml0cy9jb3JlL0NhcnQnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdwZXJzb25hbCcsXG4gIGNvbXBvbmVudHM6IHtcbiAgICBMb2dvLFxuICAgIFBlcnNvbmFsU2V0dGluZyxcbiAgICBNeU9yZGVyTGlzdCxcbiAgICBNeU9yZGVyRGV0YWlsXG4gIH0sXG4gIGRhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogJycsXG4gICAgICBuYW1lOiAneHh4eCdcbiAgICB9O1xuICB9LFxuICBtb3VudGVkKCkge1xuICAgIENhcnQuZ2V0Q2FydExpc3QoIHtcbiAgICAgICRzdG9yZTogdGhpcy4kc3RvcmVcbiAgICB9ICk7XG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gICNwZXJzb25hbFxuICAgIG1hcmdpbi1ib3R0b206IDE1NnB4XG4gICAgLnRvcFxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlclxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuXG4gICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBtYXJnaW4tcmlnaHQ6IDI0MHB4XG4gICAgICBtYXJnaW4tbGVmdDogMzEwcHhcbiAgICAubWFpblxuICAgICAgZGlzcGxheTogZmxleFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0XG4gICAgICBtYXJnaW4tdG9wOiAyMHB4XG4gICAgICBwYWRkaW5nLWxlZnQgMjMzcHhcbiAgICAgIC51c2VyLWltYWdlXG4gICAgICAgIG1hcmdpbi1sZWZ0OiA4MHB4XG4gICAgICAgIGltZ1xuICAgICAgICAgIHdpZHRoOiAxNDBweFxuICAgICAgICAgIGhlaWdodDogMTQwcHhcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZWRcbiAgICAgICAgLm5hbWVcbiAgICAgICAgICBtYXJnaW4tdG9wOiAxMHB4XG4gICAgICAgICAgcGFkZGluZy1ib3R0b206IDIwcHhcbiAgICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0VCRUJFQlxuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgICAgIGNvbG9yOiAjMzMzXG4gICAgICAgIGFcbiAgICAgICAgICBkaXNwbGF5OiBibG9ja1xuICAgICAgICAubXktb3JkZXJcbiAgICAgICAgLnNldHRpbmdcbiAgICAgICAgICBkaXNwbGF5IGJsb2NrXG4gICAgICAgICAgaGVpZ2h0OiA0OHB4XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDQ4cHhcbiAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDIwcHhcbiAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgICBmb250LXNpemU6IDE2cHhcbiAgICAgICAgICBjdXJzb3IgcG9pbnRlclxuICAgICAgICAubXktb3JkZXJcbiAgICAgICAgICBiYWNrZ3JvdW5kOiB1cmwoICd+aW1hZ2VzL215c2hvcHBpbmcucG5nJyApIDI2cHggY2VudGVyIG5vLXJlcGVhdFxuICAgICAgICAgIGNvbG9yOiAjMzMzXG4gICAgICAgIC5zZXR0aW5nXG4gICAgICAgICAgYmFja2dyb3VuZDogIzBFMTEzQSB1cmwoICd+aW1hZ2VzL3NldHRpbmcucG5nJyApIDI2cHggY2VudGVyIG5vLXJlcGVhdFxuICAgICAgICAgIGNvbG9yOiAjZmZmXG4gICAgICAudXNlci1pbmZvXG4gICAgICAgIG1hcmdpbi1sZWZ0OiA0MHB4XG4gICAgICAgIHdpZHRoIDEwMCVcbjwvc3R5bGU+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy92aWV3cy92dWVfcGFnZXMvUGVyc29uYWwudnVlPzFmOGNhZDRjIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMzIzZmY5MDJcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vUGVyc29uYWxTZXR0aW5nLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vUGVyc29uYWxTZXR0aW5nLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMzIzZmY5MDJcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL1BlcnNvbmFsU2V0dGluZy52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtMzIzZmY5MDJcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvUGVyc29uYWxTZXR0aW5nLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtMzIzZmY5MDJcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi0zMjNmZjkwMlwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvUGVyc29uYWxTZXR0aW5nLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtMzIzZmY5MDJcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL1BlcnNvbmFsU2V0dGluZy52dWVcbi8vIG1vZHVsZSBpZCA9IDExMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgLnBlcnNvbmFsLXNldHRpbmdcbiAgICBoZWFkZXIuaGVhZGVyXG4gICAgICBoMyDkuKrkurrorr7nva5cbiAgICAgIC5jaGFuZ2UtaW5mb1xuICAgICAgICBhLmJhc2UtaW5mbyhcbiAgICAgICAgICA6Y2xhc3M9XCJ7Y3VycjogaXNCYXNlSW5mb31cIixcbiAgICAgICAgICBocmVmPVwiI1wiLCBcbiAgICAgICAgICB0eXBlPVwiYmFzZUluZm9cIiwgXG4gICAgICAgICAgQGNsaWNrLnByZXZlbnQ9XCJjaGFuZ2UoICRldmVudCApXCIgXG4gICAgICAgICAgKSDkuKrkurrln7rmnKzkv6Hmga9cbiAgICAgICAgYS5hZGRyKCBcbiAgICAgICAgICA6Y2xhc3M9XCJ7Y3VycjogaXNCYXNlQWRkcn1cIixcbiAgICAgICAgICBocmVmPVwiI1wiLCBcbiAgICAgICAgICB0eXBlPVwiYmFzZUFkZHJcIiwgXG4gICAgICAgICAgQGNsaWNrLnByZXZlbnQ9XCJjaGFuZ2UoICRldmVudCApXCIgXG4gICAgICAgICAgKSDmlLbotKflnLDlnYBcbiAgICAgICAgYS5tb2RpZnkoIFxuICAgICAgICAgIDpjbGFzcz1cIntjdXJyOiBpc0Jhc2VNb2RpZnlQV31cIixcbiAgICAgICAgICBocmVmPVwiI1wiLCBcbiAgICAgICAgICB0eXBlPVwiYmFzZU1vZGlmeVBXXCIsIFxuICAgICAgICAgIEBjbGljay5wcmV2ZW50PVwiY2hhbmdlKCAkZXZlbnQgKVwiIFxuICAgICAgICAgICkg5L+u5pS55a+G56CBXG4gICAgICAgIGEucGhvbmUoIFxuICAgICAgICAgIDpjbGFzcz1cIntjdXJyOiBpc0Jhc2VNb2RpZnlQaG9uZX1cIixcbiAgICAgICAgICBocmVmPVwiI1wiLCBcbiAgICAgICAgICB0eXBlPVwiYmFzZU1vZGlmeVBob25lXCIsIFxuICAgICAgICAgIEBjbGljay5wcmV2ZW50PVwiY2hhbmdlKCAkZXZlbnQgKVwiIFxuICAgICAgICAgICkg5pu05o2i5omL5py6XG4gICAgc2VjdGlvblxuICAgICAgQmFzZUluZm8oIHYtc2hvdz1cImlzQmFzZUluZm9cIiApXG4gICAgICBCYXNlTW9kaWZ5UFcoIHYtc2hvdz1cImlzQmFzZU1vZGlmeVBXXCIgKVxuICAgICAgQmFzZU1vZGlmeVBob25lKCB2LXNob3c9XCJpc0Jhc2VNb2RpZnlQaG9uZVwiIClcbiAgICAgIEJhc2VBZGRyKCB2LXNob3c9XCJpc0Jhc2VBZGRyXCIgKVxuICAgICAgU3VjY2Vzcyggdi1zaG93PVwiaXNTdWNjZXNzXCIsIDp0eXBlPVwidHlwZVwiIClcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCBCYXNlSW5mbyBmcm9tICdtb2R1bGVzL0Jhc2VJbmZvLnZ1ZSc7XG4gIGltcG9ydCBCYXNlTW9kaWZ5UFcgZnJvbSAnbW9kdWxlcy9CYXNlTW9kaWZ5UFcudnVlJztcbiAgaW1wb3J0IEJhc2VNb2RpZnlQaG9uZSBmcm9tICdtb2R1bGVzL0Jhc2VNb2RpZnlQaG9uZS52dWUnO1xuICBpbXBvcnQgQmFzZUFkZHIgZnJvbSAnbW9kdWxlcy9CYXNlQWRkci52dWUnO1xuICBpbXBvcnQgU3VjY2VzcyBmcm9tICd2cGFnZXMvU3VjY2Vzcy52dWUnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAncGVyc29uYWxTZXR0aW5nJyxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICBCYXNlSW5mbyxcbiAgICAgIEJhc2VNb2RpZnlQVyxcbiAgICAgIEJhc2VNb2RpZnlQaG9uZSxcbiAgICAgIEJhc2VBZGRyLFxuICAgICAgU3VjY2Vzc1xuICAgIH0sXG4gICAgZGF0YSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwaG9uZScsXG4gICAgICAgIGlzQmFzZUluZm86IHRydWUsXG4gICAgICAgIGlzQmFzZU1vZGlmeVBXOiBmYWxzZSxcbiAgICAgICAgaXNCYXNlTW9kaWZ5UGhvbmU6IGZhbHNlLFxuICAgICAgICBpc0Jhc2VBZGRyOiBmYWxzZSxcbiAgICAgICAgaXNTdWNjZXNzOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgY2hhbmdlKCBldnQgKSB7XG4gICAgICAgIGxldCB0eXBlID0gZXZ0LnRhcmdldC5nZXRBdHRyaWJ1dGUoICd0eXBlJyApO1xuXG4gICAgICAgIHN3aXRjaCAoIHR5cGUgKSB7XG4gICAgICAgICAgY2FzZSAnYmFzZUluZm8nOlxuICAgICAgICAgICAgdGhpcy5pc0Jhc2VJbmZvID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNCYXNlTW9kaWZ5UFcgPSB0aGlzLmlzQmFzZUFkZHIgPSB0aGlzLmlzQmFzZU1vZGlmeVBob25lID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdiYXNlQWRkcic6XG4gICAgICAgICAgICB0aGlzLmlzQmFzZUFkZHIgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc0Jhc2VNb2RpZnlQVyA9IHRoaXMuaXNCYXNlSW5mbyA9IHRoaXMuaXNCYXNlTW9kaWZ5UGhvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Jhc2VNb2RpZnlQVyc6XG4gICAgICAgICAgICB0aGlzLmlzQmFzZU1vZGlmeVBXID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNCYXNlQWRkciA9IHRoaXMuaXNCYXNlSW5mbyA9IHRoaXMuaXNCYXNlTW9kaWZ5UGhvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Jhc2VNb2RpZnlQaG9uZSc6XG4gICAgICAgICAgICB0aGlzLmlzQmFzZU1vZGlmeVBob25lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNCYXNlQWRkciA9IHRoaXMuaXNCYXNlSW5mbyA9IHRoaXMuaXNCYXNlTW9kaWZ5UFcgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAucGVyc29uYWwtc2V0dGluZ1xuICAgIC5oZWFkZXJcbiAgICAgIGRpc3BsYXk6IGZsZXhcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXJcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBwYWRkaW5nLWJvdHRvbTogMTRweFxuICAgICAgbWFyZ2luLXJpZ2h0IDIzNnB4XG4gICAgICBoM1xuICAgICAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkICMyRDMxNkNcbiAgICAgICAgcGFkZGluZy1sZWZ0OiA2cHhcbiAgICAgICAgaGVpZ2h0OiBmaXQtY29udGVudFxuICAgICAgICBjb2xvcjogIzMzM1xuICAgICAgICBmb250LXNpemU6IDE2cHhcbiAgICAgIC5jaGFuZ2UtaW5mb1xuICAgICAgICBhXG4gICAgICAgICAgYmFja2dyb3VuZDogI0YwRjNGNVxuICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9ja1xuICAgICAgICAgIHdpZHRoOiA5MHB4XG4gICAgICAgICAgaGVpZ2h0OiAyOHB4XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDI4cHhcbiAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDJweFxuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlclxuICAgICAgICAgIGZvbnQtc2l6ZTogMTJweFxuICAgICAgICAgIGNvbG9yOiAjMzMzXG4gICAgICAgIC5jdXJyXG4gICAgICAgICAgYmFja2dyb3VuZDogIzJEMzE2Q1xuICAgICAgICAgIGNvbG9yOiAjZmZmXG4gICAgc2VjdGlvblxuICAgICAgcGFkZGluZy1yaWdodCAyMzZweFxuPC9zdHlsZT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL21vZHVsZXMvUGVyc29uYWxTZXR0aW5nLnZ1ZT8zM2VjOGM5NCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWZmMDUzZGMwXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0Jhc2VJbmZvLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vQmFzZUluZm8udnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi1mZjA1M2RjMFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vQmFzZUluZm8udnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LWZmMDUzZGMwXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy9tb2R1bGVzL0Jhc2VJbmZvLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtZmYwNTNkYzBcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi1mZjA1M2RjMFwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvQmFzZUluZm8udnVlXG4vLyBtb2R1bGUgaWQgPSAxMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi1mZjA1M2RjMFwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvQmFzZUluZm8udnVlXG4vLyBtb2R1bGUgaWQgPSAxMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gICNiYXNlLWluZm9cbiAgICBoMyDln7rmnKzkv6Hmga9cbiAgICAuaW5mb1xuICAgICAgdWxcbiAgICAgICAgbGlcbiAgICAgICAgICBzcGFuIOeUqOaIt+WQjVxuICAgICAgICAgIHNwYW4ubmFtZSAxMjMxMzIxMzFcbiAgICAgICAgbGlcbiAgICAgICAgICBzcGFuIOaYtSDnp7BcbiAgICAgICAgICBpbnB1dC5uaWNrLW5hbWUoIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCLorr7nva7mgqjnmoTmmLXnp7BcIiApXG4gICAgICAgIGxpXG4gICAgICAgICAgc3BhbiDmgKcg5YirXG4gICAgICAgICAgc3BhblxuICAgICAgICAgICAgaW5wdXQoIHR5cGU9XCJyYWRpb1wiIGlkPVwic2VjcmV0XCIgKVxuICAgICAgICAgICAgbGFiZWwoIGZvcj1cInNlY3JldFwiICkg5L+d5a+GXG4gICAgICAgICAgc3BhblxuICAgICAgICAgICAgaW5wdXQoIHR5cGU9XCJyYWRpb1wiIGlkPVwibWFsZVwiIClcbiAgICAgICAgICAgIGxhYmVsKCBmb3I9XCJtYWxlXCIgKSDnlLdcbiAgICAgICAgICBzcGFuXG4gICAgICAgICAgICBpbnB1dCggdHlwZT1cInJhZGlvXCIgaWQ9XCJmZW1hbGVcIiApXG4gICAgICAgICAgICBsYWJlbCggZm9yPVwiZmVtYWxlXCIgKSDlpbNcbiAgICBoMyDlpLTlg4/orr7nva5cbiAgICAuaW1hZ2VcbiAgICAgIGFzaWRlLnVwLWltYWdlXG4gICAgICAgIGltZyggOnNyYz1cInNyY1wiIClcbiAgICAgICAgLmZpbGVcbiAgICAgICAgICBzcGFuLnR4dCDkuIrkvKDlpLTlg49cbiAgICAgICAgICBpbnB1dCggdHlwZT1cImZpbGVcIiApXG4gICAgICAgICAgc3BhbiDku4XmlK/mjIFQTkcsIEpQRywgR0lGLCDkuJTmlofku7blsI/kuo4yTVxuICAgICAgYXNpZGUucGF0dGVuLWltYWdlXG4gICAgICAgIHNwYW4g5oKo5LiK5Lyg55qE5Zu+5YOP5bCG5Lya6Ieq5Yqo55Sf5oiQM+S4quWwuuWvuO+8jOivt+azqOaEj+Wkp+S4reWwj+WwuuWvuOaYr+WQpua4heaZsFxuICAgICAgICBpbWcuYmlnKCA6c3JjPVwic3JjQlwiIClcbiAgICAgICAgZW0g5aSn5bC65a+4IDE0MCAqIDE0MFxuICAgICAgICBpbWcubWVkaXVtKCA6c3JjPVwic3JjTVwiIClcbiAgICAgICAgZW0g5Lit5bC65a+4IDYwICogNjBcbiAgICAgICAgaW1nLnNhbWxsKCA6c3JjPVwic3JjU1wiIClcbiAgICAgICAgZW0g5bCP5bC65a+4IDMyICogMzJcbiAgICBhLnNhdmUoIGhyZWY9XCIjXCIgKSDkv53lrZhcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAnYmFzZUluZm8nLFxuICAgIGRhdGEoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzcmM6ICdpbWFnZXMvcGhvdG8uZGVmLnBuZycsXG4gICAgICAgIHNyY0I6ICdpbWFnZXMvcGhvdG8uZGVmLnBuZycsXG4gICAgICAgIHNyY006ICdpbWFnZXMvcGhvdG8uZGVmLnBuZycsXG4gICAgICAgIHNyY1M6ICdpbWFnZXMvcGhvdG8uZGVmLnBuZydcbiAgICAgIH07XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCIgc2NvcGVkPlxuICAjYmFzZS1pbmZvXG4gICAgbWFyZ2luLXRvcDogMjBweFxuICAgIGgzXG4gICAgICBtYXJnaW4tYm90dG9tOiAyMHB4XG4gICAgICBmb250LXdlaWdodDogbm9ybWFsXG4gICAgICBmb250LXNpemU6IDE2cHhcbiAgICAgIGNvbG9yOiAjMzMzXG4gICAgLmluZm9cbiAgICAgIG1hcmdpbi1ib3R0b206IDMwcHhcbiAgICAgIHBhZGRpbmctbGVmdDogMjBweFxuICAgICAgdWxcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlblxuICAgICAgICBsaVxuICAgICAgICAgIG1hcmdpbi10b3A6IDE4cHhcbiAgICAgICAgICB3b3JkLXNwYWNpbmc6IDEwcHhcbiAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICBjb2xvcjogIzMzM1xuICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9ja1xuICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiAyMHB4XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiByaWdodFxuICAgICAgICAgICAgY29sb3I6ICM2NjZcbiAgICAgICAgICAubmFtZVxuICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICBjb2xvcjogIzMzM1xuICAgICAgICAgIC5uaWNrLW5hbWVcbiAgICAgICAgICAgIHdpZHRoOiA0MDBweFxuICAgICAgICAgICAgaGVpZ2h0OiA0MHB4XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogNDBweFxuICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAxNXB4XG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjQzVDNkQ2XG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICAgIGNvbG9yOiAjOTk5XG4gICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxMnB4XG4gICAgLmltYWdlXG4gICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICBtYXJnaW4tdG9wOiAyMHB4XG4gICAgICBwYWRkaW5nLWxlZnQ6IDIwcHhcbiAgICAgIC51cC1pbWFnZVxuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmVcbiAgICAgICAgaW1nXG4gICAgICAgICAgd2lkdGg6IDM3NXB4XG4gICAgICAgIC5maWxlXG4gICAgICAgICAgZGlzcGxheTogZmxleFxuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW5cbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyXG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlXG4gICAgICAgICAgdG9wOiA1MCVcbiAgICAgICAgICBsZWZ0OiA1MCVcbiAgICAgICAgICB3aWR0aDogMjE3cHhcbiAgICAgICAgICBtYXJnaW4tbGVmdDogLTEwOHB4XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyXG4gICAgICAgICAgaW5wdXRbdHlwZT1cImZpbGVcIl1cbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZVxuICAgICAgICAgICAgd2lkdGg6IDEyMnB4XG4gICAgICAgICAgICBoZWlnaHQ6IDMzcHhcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICBzcGFuXG4gICAgICAgICAgICBkaXNwbGF5OiBibG9ja1xuICAgICAgICAgICAgY29sb3I6ICM2NjY2NjZcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweFxuICAgICAgICAgIC50eHRcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICNmZmZcbiAgICAgICAgICAgIHdpZHRoOiAxMjBweFxuICAgICAgICAgICAgaGVpZ2h0OiAzMnB4XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMzJweFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTJweFxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyXG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHhcbiAgICAgICAgICAgIGNvbG9yOiAjNDQ0QjlDXG4gICAgLnBhdHRlbi1pbWFnZVxuICAgICAgbWFyZ2luLWxlZnQ6IDMwcHhcbiAgICAgIHNwYW5cbiAgICAgICAgZGlzcGxheTogYmxvY2tcbiAgICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcFxuICAgICAgICBjb2xvcjogIzY2NlxuICAgICAgICBmb250LXNpemU6IDEycHhcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMjFweFxuICAgICAgaW1nXG4gICAgICBlbVxuICAgICAgICBkaXNwbGF5OiBibG9ja1xuICAgICAgaW1nXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEwcHhcbiAgICAgIGVtXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEwcHhcbiAgICAgICAgY29sb3I6ICM2NjZcbiAgICAgICAgZm9udC1zaXplOiAxMnB4XG4gICAgICAuYmlnXG4gICAgICAgIHdpZHRoOiAxNDBweFxuICAgICAgICBoZWlnaHQ6IDE0MHB4XG4gICAgICAubWVkaXVtXG4gICAgICAgIHdpZHRoOiA2MHB4XG4gICAgICAgIGhlaWdodDogNjBweFxuICAgICAgLnNhbWxsXG4gICAgICAgIHdpZHRoOiAzMnB4XG4gICAgICAgIGhlaWdodDogMzJweFxuICAgIC5zYXZlXG4gICAgICBkaXNwbGF5OiBibG9ja1xuICAgICAgYmFja2dyb3VuZDogIzJEMzE2Q1xuICAgICAgd2lkdGg6IDEzMHB4XG4gICAgICBoZWlnaHQ6IDQwcHhcbiAgICAgIGxpbmUtaGVpZ2h0OiA0MHB4XG4gICAgICBtYXJnaW4tdG9wOiAzMHB4XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgIGZvbnQtc2l6ZTogMTRweFxuICAgICAgY29sb3I6ICNmZmZcbjwvc3R5bGU+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9tb2R1bGVzL0Jhc2VJbmZvLnZ1ZT9kMmExMGYwNCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBhdHRyczogeyBpZDogXCJiYXNlLWluZm9cIiB9IH0sIFtcbiAgICBfYyhcImgzXCIsIFtfdm0uX3YoXCLln7rmnKzkv6Hmga9cIildKSxcbiAgICBfdm0uX20oMCwgZmFsc2UsIGZhbHNlKSxcbiAgICBfYyhcImgzXCIsIFtfdm0uX3YoXCLlpLTlg4/orr7nva5cIildKSxcbiAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImltYWdlXCIgfSwgW1xuICAgICAgX2MoXCJhc2lkZVwiLCB7IHN0YXRpY0NsYXNzOiBcInVwLWltYWdlXCIgfSwgW1xuICAgICAgICBfYyhcImltZ1wiLCB7IGF0dHJzOiB7IHNyYzogX3ZtLnNyYyB9IH0pLFxuICAgICAgICBfdm0uX20oMSwgZmFsc2UsIGZhbHNlKVxuICAgICAgXSksXG4gICAgICBfYyhcImFzaWRlXCIsIHsgc3RhdGljQ2xhc3M6IFwicGF0dGVuLWltYWdlXCIgfSwgW1xuICAgICAgICBfYyhcInNwYW5cIiwgW1xuICAgICAgICAgIF92bS5fdihcIuaCqOS4iuS8oOeahOWbvuWDj+WwhuS8muiHquWKqOeUn+aIkDPkuKrlsLrlr7jvvIzor7fms6jmhI/lpKfkuK3lsI/lsLrlr7jmmK/lkKbmuIXmmbBcIilcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwiaW1nXCIsIHsgc3RhdGljQ2xhc3M6IFwiYmlnXCIsIGF0dHJzOiB7IHNyYzogX3ZtLnNyY0IgfSB9KSxcbiAgICAgICAgX2MoXCJlbVwiLCBbX3ZtLl92KFwi5aSn5bC65a+4IDE0MCAqIDE0MFwiKV0pLFxuICAgICAgICBfYyhcImltZ1wiLCB7IHN0YXRpY0NsYXNzOiBcIm1lZGl1bVwiLCBhdHRyczogeyBzcmM6IF92bS5zcmNNIH0gfSksXG4gICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihcIuS4reWwuuWvuCA2MCAqIDYwXCIpXSksXG4gICAgICAgIF9jKFwiaW1nXCIsIHsgc3RhdGljQ2xhc3M6IFwic2FtbGxcIiwgYXR0cnM6IHsgc3JjOiBfdm0uc3JjUyB9IH0pLFxuICAgICAgICBfYyhcImVtXCIsIFtfdm0uX3YoXCLlsI/lsLrlr7ggMzIgKiAzMlwiKV0pXG4gICAgICBdKVxuICAgIF0pLFxuICAgIF9jKFwiYVwiLCB7IHN0YXRpY0NsYXNzOiBcInNhdmVcIiwgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbX3ZtLl92KFwi5L+d5a2YXCIpXSlcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiaW5mb1wiIH0sIFtcbiAgICAgIF9jKFwidWxcIiwgW1xuICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIueUqOaIt+WQjVwiKV0pLFxuICAgICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcIm5hbWVcIiB9LCBbX3ZtLl92KFwiMTIzMTMyMTMxXCIpXSlcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pi1IOensFwiKV0pLFxuICAgICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwibmljay1uYW1lXCIsXG4gICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwi6K6+572u5oKo55qE5pi156ewXCIgfVxuICAgICAgICAgIH0pXG4gICAgICAgIF0pLFxuICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuaApyDliKtcIildKSxcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW1xuICAgICAgICAgICAgX2MoXCJpbnB1dFwiLCB7IGF0dHJzOiB7IHR5cGU6IFwicmFkaW9cIiwgaWQ6IFwic2VjcmV0XCIgfSB9KSxcbiAgICAgICAgICAgIF9jKFwibGFiZWxcIiwgeyBhdHRyczogeyBmb3I6IFwic2VjcmV0XCIgfSB9LCBbX3ZtLl92KFwi5L+d5a+GXCIpXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW1xuICAgICAgICAgICAgX2MoXCJpbnB1dFwiLCB7IGF0dHJzOiB7IHR5cGU6IFwicmFkaW9cIiwgaWQ6IFwibWFsZVwiIH0gfSksXG4gICAgICAgICAgICBfYyhcImxhYmVsXCIsIHsgYXR0cnM6IHsgZm9yOiBcIm1hbGVcIiB9IH0sIFtfdm0uX3YoXCLnlLdcIildKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgICBfYyhcImlucHV0XCIsIHsgYXR0cnM6IHsgdHlwZTogXCJyYWRpb1wiLCBpZDogXCJmZW1hbGVcIiB9IH0pLFxuICAgICAgICAgICAgX2MoXCJsYWJlbFwiLCB7IGF0dHJzOiB7IGZvcjogXCJmZW1hbGVcIiB9IH0sIFtfdm0uX3YoXCLlpbNcIildKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZmlsZVwiIH0sIFtcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcInR4dFwiIH0sIFtfdm0uX3YoXCLkuIrkvKDlpLTlg49cIildKSxcbiAgICAgIF9jKFwiaW5wdXRcIiwgeyBhdHRyczogeyB0eXBlOiBcImZpbGVcIiB9IH0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLku4XmlK/mjIFQTkcsIEpQRywgR0lGLCDkuJTmlofku7blsI/kuo4yTVwiKV0pXG4gICAgXSlcbiAgfVxuXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LWZmMDUzZGMwXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtZmYwNTNkYzBcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvQmFzZUluZm8udnVlXG4vLyBtb2R1bGUgaWQgPSAxMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtODc2ZjhiOWFcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vQmFzZU1vZGlmeVBXLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vQmFzZU1vZGlmeVBXLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtODc2ZjhiOWFcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0Jhc2VNb2RpZnlQVy52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtODc2ZjhiOWFcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvQmFzZU1vZGlmeVBXLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtODc2ZjhiOWFcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi04NzZmOGI5YVwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvQmFzZU1vZGlmeVBXLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtODc2ZjhiOWFcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0Jhc2VNb2RpZnlQVy52dWVcbi8vIG1vZHVsZSBpZCA9IDExN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF92bS5fbSgwLCBmYWxzZSwgZmFsc2UpXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IGF0dHJzOiB7IGlkOiBcIm1vZGlmeS1wd1wiIH0gfSwgW1xuICAgICAgX2MoXCJ1bFwiLCBbXG4gICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pen5a+G56CBXCIpXSksXG4gICAgICAgICAgX2MoXCJpbnB1dFwiLCB7IGF0dHJzOiB7IHR5cGU6IFwicGFzc3dvcmRcIiB9IH0pLFxuICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZm9yZ2V0XCIgfSwgW1xuICAgICAgICAgICAgX2MoXCJhXCIsIHsgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbX3ZtLl92KFwi5b+Y6K6w5a+G56CBP1wiKV0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5paw5a+G56CBXCIpXSksXG4gICAgICAgICAgX2MoXCJpbnB1dFwiLCB7IGF0dHJzOiB7IHR5cGU6IFwicGFzc3dvcmRcIiB9IH0pXG4gICAgICAgIF0pLFxuICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuehruiupOaWsOWvhueggVwiKV0pLFxuICAgICAgICAgIF9jKFwiaW5wdXRcIiwgeyBhdHRyczogeyB0eXBlOiBcInBhc3N3b3JkXCIgfSB9KVxuICAgICAgICBdKVxuICAgICAgXSksXG4gICAgICBfYyhcImFcIiwgeyBzdGF0aWNDbGFzczogXCJzYXZlXCIsIGF0dHJzOiB7IGhyZWY6IFwiI1wiIH0gfSwgW192bS5fdihcIuS/neWtmFwiKV0pXG4gICAgXSlcbiAgfVxuXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTg3NmY4YjlhXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtODc2ZjhiOWFcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvQmFzZU1vZGlmeVBXLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LTQyMTM3MTVjXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0Jhc2VNb2RpZnlQaG9uZS52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL0Jhc2VNb2RpZnlQaG9uZS52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTQyMTM3MTVjXFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9CYXNlTW9kaWZ5UGhvbmUudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LTQyMTM3MTVjXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy9tb2R1bGVzL0Jhc2VNb2RpZnlQaG9uZS52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTQyMTM3MTVjXCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtNDIxMzcxNWNcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL0Jhc2VNb2RpZnlQaG9uZS52dWVcbi8vIG1vZHVsZSBpZCA9IDEyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XCJvbWl0XCI6MSxcInJlbW92ZVwiOnRydWUsXCJwdWJsaWNQYXRoXCI6XCIuLi9cIn0hLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlciEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyP3tcIm1pbmltaXplXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LTQyMTM3MTVjXCIsXCJzY29wZWRcIjp0cnVlLFwiaGFzSW5saW5lQ29uZmlnXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3N0eWx1cy1sb2FkZXIhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9CYXNlTW9kaWZ5UGhvbmUudnVlXG4vLyBtb2R1bGUgaWQgPSAxMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfdm0uX20oMCwgZmFsc2UsIGZhbHNlKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBhdHRyczogeyBpZDogXCJtb2RpZnktcGhvbmVcIiB9IH0sIFtcbiAgICAgIF9jKFwidWxcIiwgW1xuICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuWOn+aJi+acuuWPt1wiKV0pLFxuICAgICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihcIjEyMzI0MzQyM1wiKV0pXG4gICAgICAgIF0pLFxuICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuaWsOaJi+acuuWPt1wiKV0pLFxuICAgICAgICAgIF9jKFwiaW5wdXRcIiwgeyBzdGF0aWNDbGFzczogXCJwaG9uZVwiLCBhdHRyczogeyB0eXBlOiBcIm51bWJlclwiIH0gfSlcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi6aqM6K+B56CBXCIpXSksXG4gICAgICAgICAgX2MoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgICBzdGF0aWNDbGFzczogXCJjb2RlXCIsXG4gICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwi6K+36L6T5YWl6aqM6K+B56CBXCIgfVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIF9jKFwiYVwiLCB7IHN0YXRpY0NsYXNzOiBcImdldENvZGVcIiwgYXR0cnM6IHsgaHJlZjogXCIjXCIgfSB9LCBbXG4gICAgICAgICAgICBfdm0uX3YoXCLojrflj5bpqozor4HnoIFcIilcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSksXG4gICAgICBfYyhcImFcIiwgeyBzdGF0aWNDbGFzczogXCJva1wiLCBhdHRyczogeyBocmVmOiBcIiNcIiB9IH0sIFtfdm0uX3YoXCLlrozmiJBcIildKVxuICAgIF0pXG4gIH1cbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi00MjEzNzE1Y1wiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTQyMTM3MTVjXCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0Jhc2VNb2RpZnlQaG9uZS52dWVcbi8vIG1vZHVsZSBpZCA9IDEyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZGlzcG9zZWQgPSBmYWxzZVxuZnVuY3Rpb24gaW5qZWN0U3R5bGUgKHNzckNvbnRleHQpIHtcbiAgaWYgKGRpc3Bvc2VkKSByZXR1cm5cbiAgcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XFxcIm9taXRcXFwiOjEsXFxcInJlbW92ZVxcXCI6dHJ1ZSxcXFwicHVibGljUGF0aFxcXCI6XFxcIi4uL1xcXCJ9IXZ1ZS1zdHlsZS1sb2FkZXIhY3NzLWxvYWRlcj97XFxcIm1pbmltaXplXFxcIjpmYWxzZX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4P3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi0yZDM2M2VlM1xcXCIsXFxcInNjb3BlZFxcXCI6dHJ1ZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjpmYWxzZX0hc3R5bHVzLWxvYWRlciEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9CYXNlQWRkci52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL0Jhc2VBZGRyLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMmQzNjNlZTNcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0Jhc2VBZGRyLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBcImRhdGEtdi0yZDM2M2VlM1wiXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvbW9kdWxlcy9CYXNlQWRkci52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTJkMzYzZWUzXCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMmQzNjNlZTNcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL0Jhc2VBZGRyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtMmQzNjNlZTNcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0Jhc2VBZGRyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZSBsYW5nPVwiamFkZVwiPlxuICAjYWRkclxuICAgIHVsXG4gICAgICBsaSggdi1mb3I9XCIoaXRlbSwgaW5kZXgpIGluIGl0ZW1zXCIgKVxuICAgICAgICAubmFtZS1hZGRyLXBob25lXG4gICAgICAgICAgc3Bhbi5uYW1lIHh4eHhcbiAgICAgICAgICBzcGFuLmFkZHIgeHh4eFxuICAgICAgICAgIHNwYW4ucGhvbmUgMTIzNDU2Nzg5MDFcbiAgICAgICAgLm9wcGVyXG4gICAgICAgICAgaW5wdXQoIHR5cGU9XCJyYWRpb1wiIGlkPVwiaW5kZXhcIiApXG4gICAgICAgICAgbGFiZWwoIGZvcj1cImluZGV4XCIgKSDpu5jorqTlnLDlnYBcbiAgICBhLmFkZC1hZGRyKCBocmVmPVwiI1wiICkgKyDmlrDlop7mlLbotKflnLDlnYBcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAnYWRkcicsXG4gICAgZGF0YSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGl0ZW1zOiA1XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgbGFuZz1cInN0eWx1c1wiIHNjb3BlZD5cbiAgI2FkZHJcbiAgICBwYWRkaW5nLXRvcCAzMHB4XG4gICAgdWxcbiAgICAgIG92ZXJmbG93IGhpZGRlblxuICAgICAgbGlcbiAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgIGp1c3RpZnktY29udGVudCBzcGFjZS1iZXR3ZWVuXG4gICAgICAgIHBhZGRpbmctbGVmdCAyMHB4XG4gICAgICAgIHBhZGRpbmctcmlnaHQgNTBweFxuICAgICAgICBoZWlnaHQgNTBweFxuICAgICAgICBsaW5lLWhlaWdodCA1MHB4XG4gICAgICAgIGZvbnQtc2l6ZSAxNHB4XG4gICAgICAgICY6bnRoLWNoaWxkKG9kZClcbiAgICAgICAgICBiYWNrZ3JvdW5kICNGNEY1RkJcbiAgICAgICAgLm5hbWUtYWRkci1waG9uZVxuICAgICAgICAgIGRpc3BsYXkgZmxleFxuICAgICAgICAgIGp1c3RpZnktY29udGVudCBjZW50ZXJcbiAgICAgICAgICBzcGFuXG4gICAgICAgICAgICBkaXNwbGF5IGlubGluZS1ibG9ja1xuICAgICAgICAgICAgbWFyZ2luLXJpZ2h0IDIwcHhcbiAgICAgICAgICAgIGNvbG9yICM2NjZcbiAgICAgICAgICAubmFtZVxuICAgICAgICAgICAgY29sb3IgIzMzM1xuICAgICAgICAgIC5hZGRyXG4gICAgICAgICAgICB3aWR0aCAyMDBweFxuICAgICAgICAgICAgd2hpdGUtc3BhY2Ugbm93cmFwXG4gICAgICAgICAgICB0ZXh0LW92ZXJmbG93IGVsbGlwc2lzXG4gICAgICAgICAgICBvdmVyZmxvdyBoaWRkZW5cbiAgICAgICAgLm9wcGVyXG4gICAgICAgICAgY29sb3IgIzJEMzE2Q1xuICAgICAgICAgIGZvbnQtc2l6ZSAxNHB4XG4gICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0IDdweFxuICAgIC5hZGQtYWRkclxuICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgYmFja2dyb3VuZCAjMkQzMTZDXG4gICAgICB3aWR0aCAxMzBweFxuICAgICAgaGVpZ2h0IDQwcHhcbiAgICAgIGxpbmUtaGVpZ2h0IDQwcHhcbiAgICAgIG1hcmdpbi10b3AgNDBweFxuICAgICAgdGV4dC1hbGlnbiBjZW50ZXJcbiAgICAgIGNvbG9yICNmZmZcbiAgICAgIGZvbnQtc2l6ZSAxNHB4XG48L3N0eWxlPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9CYXNlQWRkci52dWU/ZTNmMmRlMGEiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgYXR0cnM6IHsgaWQ6IFwiYWRkclwiIH0gfSwgW1xuICAgIF9jKFxuICAgICAgXCJ1bFwiLFxuICAgICAgX3ZtLl9sKF92bS5pdGVtcywgZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIF9jKFwibGlcIiwgW192bS5fbSgwLCB0cnVlLCBmYWxzZSksIF92bS5fbSgxLCB0cnVlLCBmYWxzZSldKVxuICAgICAgfSlcbiAgICApLFxuICAgIF9jKFwiYVwiLCB7IHN0YXRpY0NsYXNzOiBcImFkZC1hZGRyXCIsIGF0dHJzOiB7IGhyZWY6IFwiI1wiIH0gfSwgW1xuICAgICAgX3ZtLl92KFwiKyDmlrDlop7mlLbotKflnLDlnYBcIilcbiAgICBdKVxuICBdKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJuYW1lLWFkZHItcGhvbmVcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJuYW1lXCIgfSwgW192bS5fdihcInh4eHhcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcImFkZHJcIiB9LCBbX3ZtLl92KFwieHh4eFwiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwicGhvbmVcIiB9LCBbX3ZtLl92KFwiMTIzNDU2Nzg5MDFcIildKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwib3BwZXJcIiB9LCBbXG4gICAgICBfYyhcImlucHV0XCIsIHsgYXR0cnM6IHsgdHlwZTogXCJyYWRpb1wiLCBpZDogXCJpbmRleFwiIH0gfSksXG4gICAgICBfYyhcImxhYmVsXCIsIHsgYXR0cnM6IHsgZm9yOiBcImluZGV4XCIgfSB9LCBbX3ZtLl92KFwi6buY6K6k5Zyw5Z2AXCIpXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtMmQzNjNlZTNcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0yZDM2M2VlM1wiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9CYXNlQWRkci52dWVcbi8vIG1vZHVsZSBpZCA9IDEyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwicGVyc29uYWwtc2V0dGluZ1wiIH0sIFtcbiAgICBfYyhcImhlYWRlclwiLCB7IHN0YXRpY0NsYXNzOiBcImhlYWRlclwiIH0sIFtcbiAgICAgIF9jKFwiaDNcIiwgW192bS5fdihcIuS4quS6uuiuvue9rlwiKV0pLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjaGFuZ2UtaW5mb1wiIH0sIFtcbiAgICAgICAgX2MoXG4gICAgICAgICAgXCJhXCIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwiYmFzZS1pbmZvXCIsXG4gICAgICAgICAgICBjbGFzczogeyBjdXJyOiBfdm0uaXNCYXNlSW5mbyB9LFxuICAgICAgICAgICAgYXR0cnM6IHsgaHJlZjogXCIjXCIsIHR5cGU6IFwiYmFzZUluZm9cIiB9LFxuICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCRldmVudCkge1xuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgX3ZtLmNoYW5nZSgkZXZlbnQpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFtfdm0uX3YoXCLkuKrkurrln7rmnKzkv6Hmga9cIildXG4gICAgICAgICksXG4gICAgICAgIF9jKFxuICAgICAgICAgIFwiYVwiLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcImFkZHJcIixcbiAgICAgICAgICAgIGNsYXNzOiB7IGN1cnI6IF92bS5pc0Jhc2VBZGRyIH0sXG4gICAgICAgICAgICBhdHRyczogeyBocmVmOiBcIiNcIiwgdHlwZTogXCJiYXNlQWRkclwiIH0sXG4gICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICBfdm0uY2hhbmdlKCRldmVudClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgW192bS5fdihcIuaUtui0p+WcsOWdgFwiKV1cbiAgICAgICAgKSxcbiAgICAgICAgX2MoXG4gICAgICAgICAgXCJhXCIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwibW9kaWZ5XCIsXG4gICAgICAgICAgICBjbGFzczogeyBjdXJyOiBfdm0uaXNCYXNlTW9kaWZ5UFcgfSxcbiAgICAgICAgICAgIGF0dHJzOiB7IGhyZWY6IFwiI1wiLCB0eXBlOiBcImJhc2VNb2RpZnlQV1wiIH0sXG4gICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICBfdm0uY2hhbmdlKCRldmVudClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgW192bS5fdihcIuS/ruaUueWvhueggVwiKV1cbiAgICAgICAgKSxcbiAgICAgICAgX2MoXG4gICAgICAgICAgXCJhXCIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwicGhvbmVcIixcbiAgICAgICAgICAgIGNsYXNzOiB7IGN1cnI6IF92bS5pc0Jhc2VNb2RpZnlQaG9uZSB9LFxuICAgICAgICAgICAgYXR0cnM6IHsgaHJlZjogXCIjXCIsIHR5cGU6IFwiYmFzZU1vZGlmeVBob25lXCIgfSxcbiAgICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbigkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgIF92bS5jaGFuZ2UoJGV2ZW50KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBbX3ZtLl92KFwi5pu05o2i5omL5py6XCIpXVxuICAgICAgICApXG4gICAgICBdKVxuICAgIF0pLFxuICAgIF9jKFxuICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICBbXG4gICAgICAgIF9jKFwiQmFzZUluZm9cIiwge1xuICAgICAgICAgIGRpcmVjdGl2ZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogXCJzaG93XCIsXG4gICAgICAgICAgICAgIHJhd05hbWU6IFwidi1zaG93XCIsXG4gICAgICAgICAgICAgIHZhbHVlOiBfdm0uaXNCYXNlSW5mbyxcbiAgICAgICAgICAgICAgZXhwcmVzc2lvbjogXCJpc0Jhc2VJbmZvXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pLFxuICAgICAgICBfYyhcIkJhc2VNb2RpZnlQV1wiLCB7XG4gICAgICAgICAgZGlyZWN0aXZlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiBcInNob3dcIixcbiAgICAgICAgICAgICAgcmF3TmFtZTogXCJ2LXNob3dcIixcbiAgICAgICAgICAgICAgdmFsdWU6IF92bS5pc0Jhc2VNb2RpZnlQVyxcbiAgICAgICAgICAgICAgZXhwcmVzc2lvbjogXCJpc0Jhc2VNb2RpZnlQV1wiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9KSxcbiAgICAgICAgX2MoXCJCYXNlTW9kaWZ5UGhvbmVcIiwge1xuICAgICAgICAgIGRpcmVjdGl2ZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogXCJzaG93XCIsXG4gICAgICAgICAgICAgIHJhd05hbWU6IFwidi1zaG93XCIsXG4gICAgICAgICAgICAgIHZhbHVlOiBfdm0uaXNCYXNlTW9kaWZ5UGhvbmUsXG4gICAgICAgICAgICAgIGV4cHJlc3Npb246IFwiaXNCYXNlTW9kaWZ5UGhvbmVcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSksXG4gICAgICAgIF9jKFwiQmFzZUFkZHJcIiwge1xuICAgICAgICAgIGRpcmVjdGl2ZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogXCJzaG93XCIsXG4gICAgICAgICAgICAgIHJhd05hbWU6IFwidi1zaG93XCIsXG4gICAgICAgICAgICAgIHZhbHVlOiBfdm0uaXNCYXNlQWRkcixcbiAgICAgICAgICAgICAgZXhwcmVzc2lvbjogXCJpc0Jhc2VBZGRyXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pLFxuICAgICAgICBfYyhcIlN1Y2Nlc3NcIiwge1xuICAgICAgICAgIGRpcmVjdGl2ZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogXCJzaG93XCIsXG4gICAgICAgICAgICAgIHJhd05hbWU6IFwidi1zaG93XCIsXG4gICAgICAgICAgICAgIHZhbHVlOiBfdm0uaXNTdWNjZXNzLFxuICAgICAgICAgICAgICBleHByZXNzaW9uOiBcImlzU3VjY2Vzc1wiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBhdHRyczogeyB0eXBlOiBfdm0udHlwZSB9XG4gICAgICAgIH0pXG4gICAgICBdLFxuICAgICAgMVxuICAgIClcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTMyM2ZmOTAyXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtMzIzZmY5MDJcIixcImhhc1Njb3BlZFwiOnRydWUsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvci5qcz9lbmdpbmU9amFkZSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvUGVyc29uYWxTZXR0aW5nLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcXFwib21pdFxcXCI6MSxcXFwicmVtb3ZlXFxcIjp0cnVlLFxcXCJwdWJsaWNQYXRoXFxcIjpcXFwiLi4vXFxcIn0hdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3tcXFwibWluaW1pemVcXFwiOmZhbHNlfSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWM3NDVjNTIwXFxcIixcXFwic2NvcGVkXFxcIjp0cnVlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL015T3JkZXJzTGlzdC52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL015T3JkZXJzTGlzdC52dWVcIlxuLyogdGVtcGxhdGUgKi9cbmltcG9ydCBfX3Z1ZV90ZW1wbGF0ZV9fIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LWM3NDVjNTIwXFxcIixcXFwiaGFzU2NvcGVkXFxcIjp0cnVlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3I/ZW5naW5lPWphZGUhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9NeU9yZGVyc0xpc3QudnVlXCJcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IFwiZGF0YS12LWM3NDVjNTIwXCJcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInNyYy9tb2R1bGVzL015T3JkZXJzTGlzdC52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LWM3NDVjNTIwXCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtYzc0NWM1MjBcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL015T3JkZXJzTGlzdC52dWVcbi8vIG1vZHVsZSBpZCA9IDEyOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2V4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbi9kaXN0L2xvYWRlci5qcz97XCJvbWl0XCI6MSxcInJlbW92ZVwiOnRydWUsXCJwdWJsaWNQYXRoXCI6XCIuLi9cIn0hLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlciEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyP3tcIm1pbmltaXplXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LWM3NDVjNTIwXCIsXCJzY29wZWRcIjp0cnVlLFwiaGFzSW5saW5lQ29uZmlnXCI6ZmFsc2V9IS4vbm9kZV9tb2R1bGVzL3N0eWx1cy1sb2FkZXIhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9NeU9yZGVyc0xpc3QudnVlXG4vLyBtb2R1bGUgaWQgPSAxMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gICNteS1vcmRlclxuICAgIGgzLnRpdGxlIFxuICAgICAgc3BhbiDmiJHnmoTorqLljZVcbiAgICBtYWluLm1haW5cbiAgICAgIG5hdi5uYXZcbiAgICAgICAgc3BhbiDllYblk4FcbiAgICAgICAgc3BhbiDmlbDph49cbiAgICAgICAgc3BhbiDlkIjorqFcbiAgICAgICAgc3BhbiDnirbmgIFcbiAgICAgICAgc3BhbiDmk43kvZxcbiAgICAgIHNlY3Rpb24oIHYtZm9yPVwiaXRlbSBpbiBzZWN0aW9uXCIpXG4gICAgICAgIC50aXRsZSAyMDE3LTExLTI3IOiuouWNlee8luWPt++8mjEyMzQ1Njc4OTBcbiAgICAgICAgbWFpblxuICAgICAgICAgIC5pdGVtXG4gICAgICAgICAgICAuaXRlbS1jb250XG4gICAgICAgICAgICAgIHVsXG4gICAgICAgICAgICAgICAgbGkoIHYtZm9yPVwiaXRlbSBpbiBpdGVtc1wiIClcbiAgICAgICAgICAgICAgICAgIC5wcm9kXG4gICAgICAgICAgICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgICAgICAgICAgICBpbWcoIDpzcmM9XCJzcmNcIiApXG4gICAgICAgICAgICAgICAgICAgICAgc3Bhbi5uYW1lIHh4eHhcbiAgICAgICAgICAgICAgICAgICAgc3BhbiAxMFxuICAgICAgICAgICAgICAgICAgICBzcGFuIO+/pTE5OTlcbiAgICAgICAgICAgICAgICAgIENvdXBvbk9yZGVyXG4gICAgICAgICAgICAgIGFzaWRlLm9wZWFyXG4gICAgICAgICAgICAgICAgc3BhbiDlvoXmlK/ku5gg5pSv5LuY5a6M5oiQXG4gICAgICAgICAgICAgICAgc3BhblxuICAgICAgICAgICAgICAgICAgZW0g56uL5Y2z5pSv5LuYXG4gICAgICAgICAgICAgICAgICBlbSDmn6XnnIvor6bmg4VcbiAgICAgICAgICAgIGFzaWRlLmdpZnRcbiAgICAgICAgICAgICAgQ291cG9uR2lmdCBcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgQ291cG9uR2lmdCBmcm9tICcuL0NvdXBvbkdpZnQudnVlJztcbmltcG9ydCBDb3Vwb25PcmRlciBmcm9tICcuL0NvdXBvbk9yZGVyLnZ1ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ215T3JkZXInLFxuICBjb21wb25lbnRzOiB7XG4gICAgQ291cG9uR2lmdCxcbiAgICBDb3Vwb25PcmRlclxuICB9LFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzcmM6ICcnLFxuICAgICAgaXRlbXM6IDMsXG4gICAgICBzZWN0aW9uOiAyXG4gICAgfTtcbiAgfVxufTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgbGFuZz1cInN0eWx1c1wiIHNjb3BlZD5cbiAgI215LW9yZGVyXG4gICAgbWFyZ2luLXJpZ2h0IDI0MHB4XG4gICAgLnRpdGxlXG4gICAgICBwYWRkaW5nLWJvdHRvbSAxMHB4XG4gICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICBmb250LXNpemUgMTZweFxuICAgICAgY29sb3IgIzMzM1xuICAgICAgc3BhblxuICAgICAgICBkaXNwbGF5IGlubGluZS1ibG9ja1xuICAgICAgICBwYWRkaW5nLWxlZnQgNnB4XG4gICAgICAgIGxpbmUtaGVpZ2h0IDE2cHhcbiAgICAgICAgYm9yZGVyLWxlZnQgNHB4IHNvbGlkICMyRDMxNkNcbiAgICAubWFpblxuICAgICAgbWFyZ2luLXRvcCAzMHB4XG4gICAgICAubmF2XG4gICAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnMgMmZyIDFmciAxZnIgMWZyIDFmclxuICAgICAgICB0ZXh0LWFsaWduIGNlbnRlclxuICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgICBjb2xvciAjOTk5XG4gICAgICBzZWN0aW9uXG4gICAgICAgIG1hcmdpbi10b3AgMjBweFxuICAgICAgICBib3JkZXItbGVmdCAxcHggc29saWQgI0YwRjNGNSBcbiAgICAgICAgYm9yZGVyLXJpZ2h0IDFweCBzb2xpZCAjRjBGM0Y1IFxuICAgICAgICAudGl0bGVcbiAgICAgICAgICBiYWNrZ3JvdW5kICNGNEY1RkJcbiAgICAgICAgICBoZWlnaHQgNDBweFxuICAgICAgICAgIGxpbmUtaGVpZ2h0IDQwcHhcbiAgICAgICAgICBib3JkZXIgMFxuICAgICAgICAgIHBhZGRpbmctbGVmdCAyMHB4XG4gICAgICAgICAgcGFkZGluZy1ib3R0b20gMFxuICAgICAgICAgIGZvbnQtc2l6ZSAxNHB4XG4gICAgICAgICAgY29sb3IgIzMzM1xuICAgICAgICBtYWluXG4gICAgICAgICAgLml0ZW1cbiAgICAgICAgICAgIC5pdGVtLWNvbnRcbiAgICAgICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgICAgIGJvcmRlci1ib3R0b20gMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgICAgICAgICAgdWxcbiAgICAgICAgICAgICAgICBmbGV4LWJhc2lzIDY3JVxuICAgICAgICAgICAgICAgIGxpXG4gICAgICAgICAgICAgICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICAgICAgICAgICAgICBwYWRkaW5nLXRvcCAyMHB4XG4gICAgICAgICAgICAgICAgICAmOmxhc3QtY2hpbGRcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLWJvdHRvbSAwXG4gICAgICAgICAgICAgICAgICAucHJvZFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5IGdyaWRcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zIDJmciAxZnIgMWZyIFxuICAgICAgICAgICAgICAgICAgICB0ZXh0LWFsaWduIGNlbnRlclxuICAgICAgICAgICAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbSAyMHB4XG4gICAgICAgICAgICAgICAgICAgIGltZ1xuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIDE4MHB4XG4gICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDE4MHB4XG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyIDFweCBzb2xpZCByZWRcbiAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQgMjBweFxuICAgICAgICAgICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgJjpmaXJzdC1jaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgICAgICAgLm9wZWFyXG4gICAgICAgICAgICAgICAgZGlzcGxheSBncmlkXG4gICAgICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1yb3dzIDFmclxuICAgICAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1ucyAxZnIgMWZyXG4gICAgICAgICAgICAgICAgZmxleC1iYXNpcyAzMyVcbiAgICAgICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5IGZsZXhcbiAgICAgICAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uIGNvbHVtblxuICAgICAgICAgICAgICAgICAgYm9yZGVyLWxlZnQgMXB4IHNvbGlkICNGMEYzRjVcbiAgICAgICAgICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgICAgICAgICAganVzdGlmeS1jb250ZW50IGNlbnRlclxuICAgICAgICAgICAgICAgICAgZm9udC1zaXplIDE0cHhcbiAgICAgICAgICAgICAgICAgIGNvbG9yICM5OTlcbiAgICAgICAgICAgICAgICAgIGVtXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoIDczcHhcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDI0cHhcbiAgICAgICAgICAgICAgICAgICAgbGluZS1oZWlnaHQgMjRweFxuICAgICAgICAgICAgICAgICAgICBib3JkZXIgMXB4IHNvbGlkICNDNUM2RDZcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1cyAzcHhcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbSAxMHB4XG4gICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ24gY2VudGVyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciBwb2ludGVyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yICM0NDRCOUNcbiAgICAgICAgICAgIC5naWZ0XG4gICAgICAgICAgICAgIHBhZGRpbmcgMjBweFxuICAgICAgICAgICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG48L3N0eWxlPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9NeU9yZGVyc0xpc3QudnVlPzkxODZjYzI4IiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi1lZDBlMmE5MlwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvQ291cG9uR2lmdC52dWVcbi8vIG1vZHVsZSBpZCA9IDEzMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgI2NvdXBvbi1naWZ0XG4gICAgLmNvbnRcbiAgICAgIC5naWZ0LXRpdGxlIFxuICAgICAgICBzcGFuIOiuouWNlei1oOWTgVxuICAgICAgdWxcbiAgICAgICAgbGlcbiAgICAgICAgICBzcGFuXG4gICAgICAgICAgICBpbWcoIHNyYz1cIlwiIClcbiAgICAgICAgICAgIHNwYW4geHh4eHhcbiAgICAgICAgICBzcGFuIHgxXG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnQ291cG9uR2lmdCdcbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gICNjb3Vwb24tZ2lmdFxuICAgIC5jb250XG4gICAgICBiYWNrZ3JvdW5kICNGRkY3RUQgXG4gICAgICAuZ2lmdC10aXRsZVxuICAgICAgICBwb3NpdGlvbiByZWxhdGl2ZVxuICAgICAgICBiYWNrZ3JvdW5kICNGRkY3RUQgXG4gICAgICAgIGhlaWdodCAyN3B4XG4gICAgICAgIGNvbG9yICNmZmZcbiAgICAgICAgZm9udC1zaXplIDE2cHhcbiAgICAgICAgc3BhblxuICAgICAgICAgIHBvc2l0aW9uIGFic29sdXRlXG4gICAgICAgICAgYmFja2dyb3VuZC1pbWFnZSB1cmwoICd+aW1hZ2VzL2ljb24xLnBuZycgKSBcbiAgICAgICAgICBiYWNrZ3JvdW5kLXJlcGVhdCBuby1yZXBlYXRcbiAgICAgICAgICBib3JkZXIgMFxuICAgICAgICAgIGxlZnQgMTBweFxuICAgICAgICAgIHRvcCAtNXB4XG4gICAgICAgICAgd2lkdGggOTJweFxuICAgICAgICAgIGhlaWdodCAzMnB4XG4gICAgICAgICAgbGluZS1oZWlnaHQgMzJweFxuICAgICAgICAgIHRleHQtYWxpZ24gY2VudGVyXG4gICAgICB1bFxuICAgICAgICBsaVxuICAgICAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1ucyAxMGZyIDFmclxuICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgIHBhZGRpbmcgMjBweFxuICAgICAgICAgIGZvbnQtc2l6ZSAxNnB4XG4gICAgICAgICAgY29sb3IgIzMzM1xuICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgICY6Zmlyc3QtY2hpbGRcbiAgICAgICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgIGltZ1xuICAgICAgICAgICAgd2lkdGggMTgwcHhcbiAgICAgICAgICAgIGhlaWdodCAxODBweFxuICAgICAgICAgICAgYm9yZGVyIDFweCBzb2xpZCByZWRcbiAgICAgICAgICAgIG1hcmdpbi1yaWdodCAyMHB4XG48L3N0eWxlPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9Db3Vwb25HaWZ0LnZ1ZT81MThiNDRmYyIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgYXR0cnM6IHsgaWQ6IFwiY291cG9uLWdpZnRcIiB9IH0sIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udFwiIH0sIFtcbiAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJnaWZ0LXRpdGxlXCIgfSwgW1xuICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi6K6i5Y2V6LWg5ZOBXCIpXSlcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwidWxcIiwgW1xuICAgICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtcbiAgICAgICAgICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IFwiXCIgfSB9KSxcbiAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJ4eHh4eFwiKV0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwieDFcIildKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXG4gIH1cbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi1lZDBlMmE5MlwiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LWVkMGUyYTkyXCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0NvdXBvbkdpZnQudnVlXG4vLyBtb2R1bGUgaWQgPSAxMzRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi02ZWVhZDlkN1wiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvQ291cG9uT3JkZXIudnVlXG4vLyBtb2R1bGUgaWQgPSAxMzVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlIGxhbmc9XCJqYWRlXCI+XG4gICNjb3Vwb24gXG4gICAgc3BhbiDlpJrkubDlpJrpgIHvvIzkubDlha3pgIHkuIBcbiAgICBzcGFuIFvotaDlk4FdIHh4eHh4eHhcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdDb3Vwb25PcmRlcidcbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gICNjb3Vwb25cbiAgICBiYWNrZ3JvdW5kICNGRkY3RUQgdXJsKCAnfmltYWdlcy9kaXNjb3VudF9pY29uLnBuZycgKSAxMHB4IGNlbnRlciBuby1yZXBlYXRcbiAgICBoZWlnaHQgMjdweFxuICAgIGxpbmUtaGVpZ2h0IDI3cHhcbiAgICBtYXJnaW4gMTBweCAxOXB4IDIwcHhcbiAgICBwYWRkaW5nLWxlZnQgMzdweFxuICAgIGZvbnQtc2l6ZSAxNHB4XG4gICAgY29sb3IgIzJEMzE2Q1xuICAgIHNwYW5cbiAgICAgICY6bGFzdC1jaGlsZFxuICAgICAgICBtYXJnaW4tbGVmdCA4OHB4XG4gICAgICAgIGNvbG9yICM5OTlcbjwvc3R5bGU+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9tb2R1bGVzL0NvdXBvbk9yZGVyLnZ1ZT83ZDRlZTU4NSIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX3ZtLl9tKDAsIGZhbHNlLCBmYWxzZSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgYXR0cnM6IHsgaWQ6IFwiY291cG9uXCIgfSB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuWkmuS5sOWkmumAge+8jOS5sOWFremAgeS4gFwiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJb6LWg5ZOBXSB4eHh4eHh4XCIpXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtNmVlYWQ5ZDdcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi02ZWVhZDlkN1wiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9Db3Vwb25PcmRlci52dWVcbi8vIG1vZHVsZSBpZCA9IDEzN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgYXR0cnM6IHsgaWQ6IFwibXktb3JkZXJcIiB9IH0sIFtcbiAgICBfdm0uX20oMCwgZmFsc2UsIGZhbHNlKSxcbiAgICBfYyhcbiAgICAgIFwibWFpblwiLFxuICAgICAgeyBzdGF0aWNDbGFzczogXCJtYWluXCIgfSxcbiAgICAgIFtcbiAgICAgICAgX3ZtLl9tKDEsIGZhbHNlLCBmYWxzZSksXG4gICAgICAgIF92bS5fbChfdm0uc2VjdGlvbiwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBfYyhcInNlY3Rpb25cIiwgW1xuICAgICAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtcbiAgICAgICAgICAgICAgX3ZtLl92KFwiMjAxNy0xMS0yNyDorqLljZXnvJblj7fvvJoxMjM0NTY3ODkwXCIpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF9jKFwibWFpblwiLCBbXG4gICAgICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiaXRlbVwiIH0sIFtcbiAgICAgICAgICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcIml0ZW0tY29udFwiIH0sIFtcbiAgICAgICAgICAgICAgICAgIF9jKFxuICAgICAgICAgICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICAgICAgICAgIF92bS5fbChfdm0uaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2MoXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwicHJvZFwiIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IF92bS5zcmMgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcIm5hbWVcIiB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF92bS5fdihcInh4eHhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCIxMFwiKV0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi77+lMTk5OVwiKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBfYyhcIkNvdXBvbk9yZGVyXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICBfdm0uX20oMiwgdHJ1ZSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgX2MoXCJhc2lkZVwiLCB7IHN0YXRpY0NsYXNzOiBcImdpZnRcIiB9LCBbX2MoXCJDb3Vwb25HaWZ0XCIpXSwgMSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgfSlcbiAgICAgIF0sXG4gICAgICAyXG4gICAgKVxuICBdKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJoM1wiLCB7IHN0YXRpY0NsYXNzOiBcInRpdGxlXCIgfSwgW1xuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLmiJHnmoTorqLljZVcIildKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwibmF2XCIsIHsgc3RhdGljQ2xhc3M6IFwibmF2XCIgfSwgW1xuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLllYblk4FcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pWw6YePXCIpXSksXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuWQiOiuoVwiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLnirbmgIFcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pON5L2cXCIpXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImFzaWRlXCIsIHsgc3RhdGljQ2xhc3M6IFwib3BlYXJcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuW+heaUr+S7mCDmlK/ku5jlrozmiJBcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihcIueri+WNs+aUr+S7mFwiKV0pLFxuICAgICAgICBfYyhcImVtXCIsIFtfdm0uX3YoXCLmn6XnnIvor6bmg4VcIildKVxuICAgICAgXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtYzc0NWM1MjBcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi1jNzQ1YzUyMFwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9NeU9yZGVyc0xpc3QudnVlXG4vLyBtb2R1bGUgaWQgPSAxMzhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtM2Y3YTEzYzJcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vTXlPcmRlckRldGFpbC52dWVcIilcbn1cbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG5pbXBvcnQgX192dWVfc2NyaXB0X18gZnJvbSBcIiEhYmFiZWwtbG9hZGVyIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wJmJ1c3RDYWNoZSEuL015T3JkZXJEZXRhaWwudnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0zZjdhMTNjMlxcXCIsXFxcImhhc1Njb3BlZFxcXCI6dHJ1ZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yP2VuZ2luZT1qYWRlIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAmYnVzdENhY2hlIS4vTXlPcmRlckRldGFpbC52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtM2Y3YTEzYzJcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvTXlPcmRlckRldGFpbC52dWVcIlxuaWYgKENvbXBvbmVudC5lc01vZHVsZSAmJiBPYmplY3Qua2V5cyhDb21wb25lbnQuZXNNb2R1bGUpLnNvbWUoZnVuY3Rpb24gKGtleSkgeyAgcmV0dXJuIGtleSAhPT0gXCJkZWZhdWx0XCIgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wifSkpIHsgIGNvbnNvbGUuZXJyb3IoXCJuYW1lZCBleHBvcnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluICoudnVlIGZpbGVzLlwiKX1cblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTNmN2ExM2MyXCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtM2Y3YTEzYzJcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4nICsgJyAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tb2R1bGVzL015T3JkZXJEZXRhaWwudnVlXG4vLyBtb2R1bGUgaWQgPSAxMzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi0zZjdhMTNjMlwiLFwic2NvcGVkXCI6dHJ1ZSxcImhhc0lubGluZUNvbmZpZ1wiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy9zdHlsdXMtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vc3JjL21vZHVsZXMvTXlPcmRlckRldGFpbC52dWVcbi8vIG1vZHVsZSBpZCA9IDE0MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgI215LW9yZGVyLWRldGFpbFxuICAgIGgzLnRpdGxlIFxuICAgICAgc3BhbiDorqLljZXor6bmg4VcbiAgICBzZWN0aW9uLm9yZGVyLWluZm9cbiAgICAgIC50aXRsZSDorqLljZXkv6Hmga9cbiAgICAgIC5pbmZvXG4gICAgICAgIC5zdGF0dXNcbiAgICAgICAgICBzcGFuLm9yZGVyLW51bSDorqLljZXlj7cgREZEODk3OTg3OTA3XG4gICAgICAgICAgc3Bhbi5zdFxuICAgICAgICAgICAgfCDorqLljZXnirbmgIHvvJpcbiAgICAgICAgICAgIGVtIOW+heaUr+S7mFxuICAgICAgICBhZGRyZXNzLmFkZHJcbiAgICAgICAgICAuYWRkci1pbmZvXG4gICAgICAgICAgICAudGl0bGUg5pS26LSn5L+h5oGvXG4gICAgICAgICAgICB1bFxuICAgICAgICAgICAgICBsaVxuICAgICAgICAgICAgICAgIHNwYW4g5pS26LSn5Lq6XG4gICAgICAgICAgICAgICAgc3BhbiB4eHh4XG4gICAgICAgICAgICAgIGxpXG4gICAgICAgICAgICAgICAgc3BhbiDmlLbotKflnLDlnYBcbiAgICAgICAgICAgICAgICBzcGFuIHNkZmFmYWZhc2Zhc1xuICAgICAgICAgICAgICBsaVxuICAgICAgICAgICAgICAgIHNwYW4g6IGU57O755S16K+dXG4gICAgICAgICAgICAgICAgc3BhbiAxMjMxMzEyM1xuICAgICAgICAgIC5wYXktaW5mb1xuICAgICAgICAgICAgLnRpdGxlIOaUr+S7mOS/oeaBr1xuICAgICAgICAgICAgdWxcbiAgICAgICAgICAgICAgbGlcbiAgICAgICAgICAgICAgICBzcGFuIOaUr+S7mOaWueW8j1xuICAgICAgICAgICAgICAgIHNwYW4g5b6u5L+h5pSv5LuYXG4gICAgICAgICAgICAgIGxpXG4gICAgICAgICAgICAgICAgc3BhbiDmlK/ku5jph5Hpop1cbiAgICAgICAgICAgICAgICBzcGFuIDQ3OOWFg1xuICAgICAgICAgICAgICBsaVxuICAgICAgICAgICAgICAgIHNwYW4g5LuY5qy+5pe26Ze0XG4gICAgICAgICAgICAgICAgc3BhbiAyMDE3LTExLTEwXG4gICAgc2VjdGlvbi5vcmRlci1jb250XG4gICAgICAudGl0bGUg6K6i5Y2V5YaF5a65XG4gICAgICBtYWluLmNvbnRcbiAgICAgICAgbmF2Lm5hdlxuICAgICAgICAgIHNwYW4g5ZWG5ZOBXG4gICAgICAgICAgc3BhbiDljZXku7dcbiAgICAgICAgICBzcGFuIOaVsOmHj1xuICAgICAgICAgIHNwYW4g5bCP6K6hXG4gICAgICAgIHNlY3Rpb25cbiAgICAgICAgICB1bFxuICAgICAgICAgICAgbGlcbiAgICAgICAgICAgICAgLml0ZW1cbiAgICAgICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICAgICBpbWcoIHNyYz1cIlwiIClcbiAgICAgICAgICAgICAgICAgIHNwYW4ubmFtZSBhc2RmYXNcbiAgICAgICAgICAgICAgICBzcGFuLnByaWNlXG4gICAgICAgICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICAgICAgIHwg5oyH5a+85Lu377yaXG4gICAgICAgICAgICAgICAgICAgIGVtIO+/pTk4MFxuICAgICAgICAgICAgICAgICAgc3BhbiDkvJrlkZjku7fvvJrvv6U5ODdcbiAgICAgICAgICAgICAgICBzcGFuIDEwXG4gICAgICAgICAgICAgICAgc3BhbiDvv6U4MDhcbiAgICAgICAgICAgICAgQ291cG9uT3JkZXJcbiAgICAgICAgQ291cG9uR2lmdFxuICAgICAgICBzZWN0aW9uLmFtb3VudFxuICAgICAgICAgIC5tb3VudFxuICAgICAgICAgICAgc3BhbiBcbiAgICAgICAgICAgICAgfCDlhbHorqFcbiAgICAgICAgICAgICAgZW0gM1xuICAgICAgICAgICAgICB8IOS7tuWVhuWTgVxuICAgICAgICAgICAgc3BhbiDmgLvorqHvvJrvv6U3ODg5XG4gICAgICAgICAgLmRpc2NvdW50XG4gICAgICAgICAgICBzcGFuIOS8mOaDoO+8mu+/pTc4OFxuICAgICAgICAgICAgc3BhbiDov5DotLnvvJrvv6U4OVxuICAgICAgICAgICAgc3BhbiDllYblk4HmgLvku7fvvJrvv6U4OTlcbiAgICAgICAgICAucGF5IOWOu+aUr+S7mFxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCBDb3Vwb25HaWZ0IGZyb20gJy4vQ291cG9uR2lmdC52dWUnO1xuaW1wb3J0IENvdXBvbk9yZGVyIGZyb20gJy4vQ291cG9uT3JkZXIudnVlJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnTXlPcmRlckRldGFpbCcsXG4gIGNvbXBvbmVudHM6IHtcbiAgICBDb3Vwb25HaWZ0LFxuICAgIENvdXBvbk9yZGVyXG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gICNteS1vcmRlci1kZXRhaWxcbiAgICBtYXJnaW4tcmlnaHQgMjQwcHhcbiAgICAudGl0bGVcbiAgICAgICAgcGFkZGluZy1ib3R0b20gMTBweFxuICAgICAgICBib3JkZXItYm90dG9tIDFweCBzb2xpZCAjRjBGM0Y1XG4gICAgICAgIGZvbnQtc2l6ZSAxNnB4XG4gICAgICAgIGNvbG9yICMzMzNcbiAgICAgICAgc3BhblxuICAgICAgICAgIGRpc3BsYXkgaW5saW5lLWJsb2NrXG4gICAgICAgICAgcGFkZGluZy1sZWZ0IDZweFxuICAgICAgICAgIGxpbmUtaGVpZ2h0IDE2cHhcbiAgICAgICAgICBib3JkZXItbGVmdCA0cHggc29saWQgIzJEMzE2Q1xuICAgIC5vcmRlci1pbmZvXG4gICAgICBtYXJnaW4tdG9wIDE4cHhcbiAgICAgIG1hcmdpbi1ib3R0b20gMjBweFxuICAgICAgLnRpdGxlXG4gICAgICAgIGJvcmRlciAwXG4gICAgICAgIG1hcmdpbi1ib3R0b20gMjBweFxuICAgICAgICBwYWRkaW5nLWJvdHRvbSAwXG4gICAgICAgIGZvbnQtd2VpZ2h0IGJvbGRcbiAgICAgIC5pbmZvXG4gICAgICAgIGJhY2tncm91bmQgI0Y0RjVGQlxuICAgICAgICBwYWRkaW5nIDAgMjBweFxuICAgICAgICAuc3RhdHVzXG4gICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAganVzdGlmeS1jb250ZW50IHNwYWNlLWJldHdlZW5cbiAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgICBoZWlnaHQgNDBweFxuICAgICAgICAgIGJvcmRlci1ib3R0b20gMXB4IHNvbGlkICNmZmZcbiAgICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgICAgIGVtXG4gICAgICAgICAgICBjb2xvciAjNDQ0QjlDXG4gICAgICAgIC5hZGRyXG4gICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgLmFkZHItaW5mb1xuICAgICAgICAgIC5wYXktaW5mb1xuICAgICAgICAgICAgcGFkZGluZyAyMHB4IDBcbiAgICAgICAgICAgIGZsZXgtYmFzaXMgNTAlXG4gICAgICAgICAgICAudGl0bGVcbiAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbSAxMHB4XG4gICAgICAgICAgICB1bFxuICAgICAgICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgICAgICAgICBjb2xvciAjNjY2XG4gICAgICAgICAgICAgIGxpXG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbSAxMHB4XG4gICAgICAgICAgLmFkZHItaW5mb1xuICAgICAgICAgICAgbGlcbiAgICAgICAgICAgICAgc3BhblxuICAgICAgICAgICAgICAgIGRpc3BsYXkgaW5saW5lLWJsb2NrXG4gICAgICAgICAgICAgICAgJjpmaXJzdC1jaGlsZFxuICAgICAgICAgICAgICAgICAgd2lkdGggNzdweFxuICAgICAgICAgIC5wYXktaW5mb1xuICAgICAgICAgICAgYm9yZGVyLWxlZnQgMXB4IHNvbGlkICNmZmZcbiAgICAgICAgICAgIHBhZGRpbmctbGVmdCAyMHB4XG4gICAgICAgICAgICBsaVxuICAgICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICAgY29sb3IgIzMzM1xuICAgICAgICAgICAgICAgIG1hcmdpbi1yaWdodCAxNXB4XG4gICAgICAgICAgICAgICAgJjpmaXJzdC1jaGlsZFxuICAgICAgICAgICAgICAgICAgY29sb3IgIzY2NlxuICAgIC5vcmRlci1jb250XG4gICAgICAudGl0bGVcbiAgICAgICAgYm9yZGVyIDBcbiAgICAgICAgcGFkZGluZy1ib3R0b20gMjBweFxuICAgICAgICBmb250LXdlaWdodCBib2xkXG4gICAgICAuY29udFxuICAgICAgICAubmF2XG4gICAgICAgICAgZGlzcGxheSBncmlkXG4gICAgICAgICAgYmFja2dyb3VuZCAjRjRGNUZCXG4gICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zIDJmciAxZnIgMWZyIDFmclxuICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgIGp1c3RpZnktaXRlbXMgY2VudGVyXG4gICAgICAgICAgaGVpZ2h0IDQwcHhcbiAgICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgICAgIGNvbG9yICM5OTlcbiAgICAgICAgc2VjdGlvblxuICAgICAgICAgIG1hcmdpbiAyMHB4IDBcbiAgICAgICAgICB1bFxuICAgICAgICAgICAgbGlcbiAgICAgICAgICAgICAgYm9yZGVyLWJvdHRvbSAxcHggc29saWQgI0YwRjNGNVxuICAgICAgICAgICAgICAuaXRlbVxuICAgICAgICAgICAgICAgIGRpc3BsYXkgZ3JpZFxuICAgICAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1ucyAyZnIgMWZyIDFmciAxZnJcbiAgICAgICAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgICAgICAgICBqdXN0aWZ5LWl0ZW1zIGNlbnRlclxuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZSAxNHB4XG4gICAgICAgICAgICAgICAgY29sb3IgIzMzM1xuICAgICAgICAgICAgICAgIGltZ1xuICAgICAgICAgICAgICAgICAgd2lkdGggMTgwcHhcbiAgICAgICAgICAgICAgICAgIGhlaWdodCAxODBweFxuICAgICAgICAgICAgICAgICAgbWFyZ2luLXJpZ2h0IDEwcHhcbiAgICAgICAgICAgICAgICBzcGFuXG4gICAgICAgICAgICAgICAgICAmOmZpcnN0LWNoaWxkXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkgZmxleFxuICAgICAgICAgICAgICAgICAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICAgICAgICAgICAgICAucHJpY2VcbiAgICAgICAgICAgICAgICAgIHNwYW5cbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSBibG9ja1xuICAgICAgICAgICAgICAgICAgICAmOmZpcnN0LWNoaWxkXG4gICAgICAgICAgICAgICAgICAgICAgZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbiBsaW5lLXRocm91Z2hcbiAgICAgICAgLmFtb3VudFxuICAgICAgICAgIG92ZXJmbG93IGhpZGRlblxuICAgICAgICAgIC5tb3VudFxuICAgICAgICAgICAgZGlzcGxheSBmbGV4XG4gICAgICAgICAgICBiYWNrZ3JvdW5kICNGNEY1RkJcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zIGNlbnRlclxuICAgICAgICAgICAganVzdGlmeS1jb250ZW50IHNwYWNlLWJldHdlZW5cbiAgICAgICAgICAgIGhlaWdodCA1MHB4XG4gICAgICAgICAgICBtYXJnaW4tdG9wIDMwcHhcbiAgICAgICAgICAgIHBhZGRpbmcgMCAzMHB4XG4gICAgICAgICAgICBmb250LXNpemUgMTRweFxuICAgICAgICAgICAgY29sb3IgIzMzM1xuICAgICAgICAgICAgZW1cbiAgICAgICAgICAgICAgY29sb3IgcmVkXG4gICAgICAgICAgLmRpc2NvdW50XG4gICAgICAgICAgICBtYXJnaW4tdG9wIDEwcHhcbiAgICAgICAgICAgIHBhZGRpbmctcmlnaHQgMzBweFxuICAgICAgICAgICAgc3BhblxuICAgICAgICAgICAgICBkaXNwbGF5IGJsb2NrXG4gICAgICAgICAgICAgIHRleHQtYWxpZ24gcmlnaHRcbiAgICAgICAgICAgICAgZm9udC1zaXplIDE0cHhcbiAgICAgICAgICAgICAgY29sb3IgIzk5OVxuICAgICAgICAgIC5wYXlcbiAgICAgICAgICAgIGZsb2F0IHJpZ2h0XG4gICAgICAgICAgICBtYXJnaW4tdG9wIDIwcHhcbiAgICAgICAgICAgIGJhY2tncm91bmQgIzJEMzE2Q1xuICAgICAgICAgICAgd2lkdGggMTU4cHhcbiAgICAgICAgICAgIGhlaWdodCA1MHB4XG4gICAgICAgICAgICBsaW5lLWhlaWdodCA1MHB4XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzIDNweFxuICAgICAgICAgICAgdGV4dC1hbGlnbiBjZW50ZXJcbiAgICAgICAgICAgIGZvbnQtc2l6ZSAxNnB4XG4gICAgICAgICAgICBjb2xvciAjZmZmXG48L3N0eWxlPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvbW9kdWxlcy9NeU9yZGVyRGV0YWlsLnZ1ZT80Y2EyNThhNSIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBhdHRyczogeyBpZDogXCJteS1vcmRlci1kZXRhaWxcIiB9IH0sIFtcbiAgICBfdm0uX20oMCwgZmFsc2UsIGZhbHNlKSxcbiAgICBfdm0uX20oMSwgZmFsc2UsIGZhbHNlKSxcbiAgICBfYyhcInNlY3Rpb25cIiwgeyBzdGF0aWNDbGFzczogXCJvcmRlci1jb250XCIgfSwgW1xuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ0aXRsZVwiIH0sIFtfdm0uX3YoXCLorqLljZXlhoXlrrlcIildKSxcbiAgICAgIF9jKFxuICAgICAgICBcIm1haW5cIixcbiAgICAgICAgeyBzdGF0aWNDbGFzczogXCJjb250XCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgIF92bS5fbSgyLCBmYWxzZSwgZmFsc2UpLFxuICAgICAgICAgIF9jKFwic2VjdGlvblwiLCBbXG4gICAgICAgICAgICBfYyhcInVsXCIsIFtcbiAgICAgICAgICAgICAgX2MoXCJsaVwiLCBbX3ZtLl9tKDMsIGZhbHNlLCBmYWxzZSksIF9jKFwiQ291cG9uT3JkZXJcIildLCAxKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBfYyhcIkNvdXBvbkdpZnRcIiksXG4gICAgICAgICAgX3ZtLl9tKDQsIGZhbHNlLCBmYWxzZSlcbiAgICAgICAgXSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgIF0pXG4gIF0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImgzXCIsIHsgc3RhdGljQ2xhc3M6IFwidGl0bGVcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuiuouWNleivpuaDhVwiKV0pXG4gICAgXSlcbiAgfSxcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJzZWN0aW9uXCIsIHsgc3RhdGljQ2xhc3M6IFwib3JkZXItaW5mb1wiIH0sIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidGl0bGVcIiB9LCBbX3ZtLl92KFwi6K6i5Y2V5L+h5oGvXCIpXSksXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImluZm9cIiB9LCBbXG4gICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwic3RhdHVzXCIgfSwgW1xuICAgICAgICAgIF9jKFwic3BhblwiLCB7IHN0YXRpY0NsYXNzOiBcIm9yZGVyLW51bVwiIH0sIFtcbiAgICAgICAgICAgIF92bS5fdihcIuiuouWNleWPtyBERkQ4OTc5ODc5MDdcIilcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJzdFwiIH0sIFtcbiAgICAgICAgICAgIF92bS5fdihcIuiuouWNleeKtuaAge+8mlwiKSxcbiAgICAgICAgICAgIF9jKFwiZW1cIiwgW192bS5fdihcIuW+heaUr+S7mFwiKV0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICAgIF9jKFwiYWRkcmVzc1wiLCB7IHN0YXRpY0NsYXNzOiBcImFkZHJcIiB9LCBbXG4gICAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJhZGRyLWluZm9cIiB9LCBbXG4gICAgICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInRpdGxlXCIgfSwgW192bS5fdihcIuaUtui0p+S/oeaBr1wiKV0pLFxuICAgICAgICAgICAgX2MoXCJ1bFwiLCBbXG4gICAgICAgICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pS26LSn5Lq6XCIpXSksXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJ4eHh4XCIpXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pS26LSn5Zyw5Z2AXCIpXSksXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJzZGZhZmFmYXNmYXNcIildKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgX2MoXCJsaVwiLCBbXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLogZTns7vnlLXor51cIildKSxcbiAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIjEyMzEzMTIzXCIpXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJwYXktaW5mb1wiIH0sIFtcbiAgICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidGl0bGVcIiB9LCBbX3ZtLl92KFwi5pSv5LuY5L+h5oGvXCIpXSksXG4gICAgICAgICAgICBfYyhcInVsXCIsIFtcbiAgICAgICAgICAgICAgX2MoXCJsaVwiLCBbXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLmlK/ku5jmlrnlvI9cIildKSxcbiAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuW+ruS/oeaUr+S7mFwiKV0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBfYyhcImxpXCIsIFtcbiAgICAgICAgICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuaUr+S7mOmHkeminVwiKV0pLFxuICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwiNDc45YWDXCIpXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIF9jKFwibGlcIiwgW1xuICAgICAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5LuY5qy+5pe26Ze0XCIpXSksXG4gICAgICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCIyMDE3LTExLTEwXCIpXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgXSlcbiAgfSxcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJuYXZcIiwgeyBzdGF0aWNDbGFzczogXCJuYXZcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuWVhuWTgVwiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLljZXku7dcIildKSxcbiAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5pWw6YePXCIpXSksXG4gICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuWwj+iuoVwiKV0pXG4gICAgXSlcbiAgfSxcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJpdGVtXCIgfSwgW1xuICAgICAgX2MoXCJzcGFuXCIsIFtcbiAgICAgICAgX2MoXCJpbWdcIiwgeyBhdHRyczogeyBzcmM6IFwiXCIgfSB9KSxcbiAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwibmFtZVwiIH0sIFtfdm0uX3YoXCJhc2RmYXNcIildKVxuICAgICAgXSksXG4gICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJwcmljZVwiIH0sIFtcbiAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLmjIflr7zku7fvvJpcIiksIF9jKFwiZW1cIiwgW192bS5fdihcIu+/pTk4MFwiKV0pXSksXG4gICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5Lya5ZGY5Lu377ya77+lOTg3XCIpXSlcbiAgICAgIF0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCIxMFwiKV0pLFxuICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCLvv6U4MDhcIildKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwic2VjdGlvblwiLCB7IHN0YXRpY0NsYXNzOiBcImFtb3VudFwiIH0sIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwibW91bnRcIiB9LCBbXG4gICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgX3ZtLl92KFwiIFxcbuWFseiuoVwiKSxcbiAgICAgICAgICBfYyhcImVtXCIsIFtfdm0uX3YoXCIzXCIpXSksXG4gICAgICAgICAgX3ZtLl92KFwi5Lu25ZWG5ZOBXCIpXG4gICAgICAgIF0pLFxuICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuaAu+iuoe+8mu+/pTc4ODlcIildKVxuICAgICAgXSksXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImRpc2NvdW50XCIgfSwgW1xuICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIuS8mOaDoO+8mu+/pTc4OFwiKV0pLFxuICAgICAgICBfYyhcInNwYW5cIiwgW192bS5fdihcIui/kOi0ue+8mu+/pTg5XCIpXSksXG4gICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi5ZWG5ZOB5oC75Lu377ya77+lODk5XCIpXSlcbiAgICAgIF0pLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJwYXlcIiB9LCBbX3ZtLl92KFwi5Y675pSv5LuYXCIpXSlcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtM2Y3YTEzYzJcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0zZjdhMTNjMlwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9NeU9yZGVyRGV0YWlsLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTQyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBhdHRyczogeyBpZDogXCJwZXJzb25hbFwiIH0gfSwgW1xuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwidG9wXCIgfSwgW19jKFwiTG9nb1wiKV0sIDEpLFxuICAgIF9jKFwibWFpblwiLCB7IHN0YXRpY0NsYXNzOiBcIm1haW5cIiB9LCBbXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInVzZXItaW1hZ2VcIiB9LCBbXG4gICAgICAgIF9jKFwiaW1nXCIsIHsgYXR0cnM6IHsgc3JjOiBfdm0uc3JjIH0gfSksXG4gICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwibmFtZVwiIH0sIFtcbiAgICAgICAgICBfdm0uX3YoXCLmrKLov47mgqjvvIxcIiArIF92bS5fcyhfdm0ubmFtZSkpXG4gICAgICAgIF0pLFxuICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJteS1vcmRlclwiIH0sIFtfdm0uX3YoXCLmiJHnmoTorqLljZVcIildKSxcbiAgICAgICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwic2V0dGluZ1wiIH0sIFtfdm0uX3YoXCLkuKrkurrorr7nva5cIildKVxuICAgICAgXSksXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcInVzZXItaW5mb1wiIH0sIFtfYyhcIk15T3JkZXJEZXRhaWxcIildLCAxKVxuICAgIF0pXG4gIF0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW11cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi0wNjc5YjFiZVwiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTA2NzliMWJlXCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy92aWV3cy92dWVfcGFnZXMvUGVyc29uYWwudnVlXG4vLyBtb2R1bGUgaWQgPSAxNDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtYmU1MjY4YWVcXFwiLFxcXCJzY29wZWRcXFwiOmZhbHNlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOmZhbHNlfSFzdHlsdXMtbG9hZGVyIS4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL0luZGV4LnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vSW5kZXgudnVlXCJcbi8qIHRlbXBsYXRlICovXG5pbXBvcnQgX192dWVfdGVtcGxhdGVfXyBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi1iZTUyNjhhZVxcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0luZGV4LnZ1ZVwiXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBudWxsXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvSW5kZXgudnVlXCJcbmlmIChDb21wb25lbnQuZXNNb2R1bGUgJiYgT2JqZWN0LmtleXMoQ29tcG9uZW50LmVzTW9kdWxlKS5zb21lKGZ1bmN0aW9uIChrZXkpIHsgIHJldHVybiBrZXkgIT09IFwiZGVmYXVsdFwiICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIn0pKSB7ICBjb25zb2xlLmVycm9yKFwibmFtZWQgZXhwb3J0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiAqLnZ1ZSBmaWxlcy5cIil9XG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi1iZTUyNjhhZVwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LWJlNTI2OGFlXCIsIENvbXBvbmVudC5vcHRpb25zKVxuJyArICcgIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvSW5kZXgudnVlXG4vLyBtb2R1bGUgaWQgPSAxNDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1wib21pdFwiOjEsXCJyZW1vdmVcIjp0cnVlLFwicHVibGljUGF0aFwiOlwiLi4vXCJ9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj97XCJtaW5pbWl6ZVwiOmZhbHNlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi1iZTUyNjhhZVwiLFwic2NvcGVkXCI6ZmFsc2UsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9JbmRleC52dWVcbi8vIG1vZHVsZSBpZCA9IDE0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgI2luZGV4XG4gICAgVG9wSGVhZGVyXG4gICAgcm91dGVyLXZpZXdcbiAgICBCb3R0b21Gb290ZXJcbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgc3RvcmUgZnJvbSAndngvaW5kZXgnO1xuaW1wb3J0IFRvcEhlYWRlciBmcm9tICdtb2R1bGVzL0hlYWRlci52dWUnO1xuaW1wb3J0IEJvdHRvbUZvb3RlciBmcm9tICdtb2R1bGVzL0Zvb3Rlci52dWUnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdpbmRleCcsXG4gIHN0b3JlLFxuICBjb21wb25lbnRzOiB7XG4gICAgVG9wSGVhZGVyLFxuICAgIEJvdHRvbUZvb3RlclxuICB9XG59O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic3R5bHVzXCI+XG4gICNpbmRleFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZVxuICAgIG1pbi13aWR0aCAxNDAwcHhcbjwvc3R5bGU+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL0luZGV4LnZ1ZT8xZjk3YTA2NyIsImltcG9ydCBWdWUgZnJvbSAndnVlJztcbmltcG9ydCBWdWV4IGZyb20gJ3Z1ZXgnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IG11dGF0aW9ucyBmcm9tICcuL211dGF0aW9ucyc7XG5pbXBvcnQgZ2V0dGVycyBmcm9tICcuL2dldHRlcnMnO1xuaW1wb3J0IGFjdGlvbnMgZnJvbSAnLi9hY3Rpb25zJztcblxuVnVlLnVzZSggVnVleCApO1xuXG5leHBvcnQgZGVmYXVsdCBuZXcgVnVleC5TdG9yZSgge1xuICBzdGF0ZSxcbiAgbXV0YXRpb25zLFxuICBnZXR0ZXJzLFxuICBhY3Rpb25zXG59ICk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdnVleC9pbmRleC5qcyIsImV4cG9ydCBkZWZhdWx0IHtcbiAgdXNlcjogbnVsbCwgLy8gdG9kb++8mueUqOaIt+eZu+W9leS/oeaBr1xuICBpc0xvZ2luOiBmYWxzZSwgLy8gdG9kbzog55So5oi35piv5ZCm55m75b2VXG4gIGNhcnRJdGVtczogW10sIC8vIHRvZG86IOi0reeJqei9puWIl+ihqOWGheWuuVxuICBjYXJ0TnVtOiAwLFxuICBvcmRlckluZm86IFtdXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3Z1ZXgvc3RhdGUuanMiLCJleHBvcnQgZGVmYXVsdCB7XG4gIGNoYW5nZUNhcnROdW0oIHN0YXRlLCBvcHRpb25zICkge1xuICAgIHN0YXRlLmNhcnROdW0gPSBvcHRpb25zLm51bTtcbiAgfSxcblxuICBjaGFuZ2VDYXJ0SXRlbXMoIHN0YXRlLCBvcHRpb25zICkge1xuICAgIHN0YXRlLmNhcnRJdGVtcyA9IG9wdGlvbnMuc2xpY2UoKTtcbiAgfSxcblxuICBjaGFuZ2VPcmRlckluZm8oIHN0YXRlLCBvcHRpb25zICkge1xuICAgIHN0YXRlLm9yZGVySW5mbyA9IG9wdGlvbnMuc2xpY2UoKTtcbiAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92dWV4L211dGF0aW9ucy5qcyIsImV4cG9ydCBkZWZhdWx0IHtcbiAgZ2V0Q2FydE51bSggc3RhdGUgKSB7XG4gICAgcmV0dXJuIHN0YXRlLmNhcnROdW07XG4gIH0sXG5cbiAgZ2V0Q2FydEl0ZW1zKCBzdGF0ZSApIHtcbiAgICByZXR1cm4gc3RhdGUuY2FydEl0ZW1zO1xuICB9LFxuXG4gIGdldE9yZGVySW5mbyggc3RhdGUgKSB7XG4gICAgcmV0dXJuIHN0YXRlLm9yZGVySW5mbztcbiAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92dWV4L2dldHRlcnMuanMiLCJleHBvcnQgZGVmYXVsdCB7XG4gIGNoYW5nZUNhcnROdW0oIHsgY29tbWl0IH0sIG9wdGlvbnMgKSB7XG4gICAgY29tbWl0KCAnY2hhbmdlQ2FydE51bScsIG9wdGlvbnMgKTtcbiAgfSxcblxuICBjaGFuZ2VDYXJ0SXRlbXMoIHsgY29tbWl0IH0sIG9wdGlvbnMgKSB7XG4gICAgY29tbWl0KCAnY2hhbmdlQ2FydEl0ZW1zJywgb3B0aW9ucyApO1xuICB9LFxuXG4gIGNoYW5nZU9yZGVySW5mbyggeyBjb21taXQgfSwgb3B0aW9ucyApIHtcbiAgICBjb21taXQoICdjaGFuZ2VPcmRlckluZm8nLCBvcHRpb25zICk7XG4gIH1cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdnVleC9hY3Rpb25zLmpzIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtNjljNjczY2VcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vSGVhZGVyLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vSGVhZGVyLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtNjljNjczY2VcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0hlYWRlci52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtNjljNjczY2VcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvSGVhZGVyLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtNjljNjczY2VcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi02OWM2NzNjZVwiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvSGVhZGVyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtNjljNjczY2VcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0hlYWRlci52dWVcbi8vIG1vZHVsZSBpZCA9IDE1M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGUgbGFuZz1cImphZGVcIj5cbiAgaGVhZGVyLmhlYWRlclxuICAgIHNwYW4udGl0bGUg5LmF6ZqG5ZWG6LS45qyi6L+O5oKoXG4gICAgdWwuaW5mb1xuICAgICAgbGlcbiAgICAgICAgc3BhbiDlvKDkuL3kuL1cbiAgICAgIGxpXG4gICAgICAgIHJvdXRlci1saW5rLm15LW9yZGVyKCB0bz1cIi9wZXJzb25hbFwiIClcbiAgICAgICAgICBzcGFuIOaIkeeahOiuouWNlVxuICAgICAgbGlcbiAgICAgICAgcm91dGVyLWxpbmsoIDp0bz1cIntwYXRoOiAnL2NhcnQnfVwiIClcbiAgICAgICAgICBzcGFuIOi0reeJqei9plxuICAgICAgICBlbSB7e2NhcnROdW19fVxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCB7IG1hcFN0YXRlIH0gZnJvbSAndnVleCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ0hlYWQnLFxuICBjb21wdXRlZDoge1xuICAgIC4uLm1hcFN0YXRlKCB7XG4gICAgICBjYXJ0TnVtOiBzdGF0ZSA9PiBzdGF0ZS5jYXJ0TnVtXG4gICAgfSApXG4gIH1cbn07XG48L3NjcmlwdD5cblxuPHN0eWxlIGxhbmc9XCJzdHlsdXNcIiBzY29wZWQ+XG4gIC5oZWFkZXJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmVcbiAgICBkaXNwbGF5IGZsZXhcbiAgICBhbGlnbi1pdGVtcyBjZW50ZXJcbiAgICBqdXN0aWZ5LWNvbnRlbnQgc3BhY2UtYmV0d2VlblxuICAgIGJhY2tncm91bmQ6ICMwMDBcbiAgICBoZWlnaHQ6IDQwcHhcbiAgICBwYWRkaW5nLWxlZnQgMzEwcHhcbiAgICBwYWRkaW5nLXJpZ2h0IDIwNHB4XG4gICAgZm9udC1zaXplOiAxNHB4XG4gICAgLnRpdGxlXG4gICAgICBjb2xvcjogI2ZmZmZmZlxuICAgIC5pbmZvXG4gICAgICBkaXNwbGF5OiBmbGV4XG4gICAgICBjb2xvcjogI2ZmZmZmZlxuICAgICAgbGlcbiAgICAgICAgcGFkZGluZzogMCAzOXB4XG4gICAgICAgIGJvcmRlci1yaWdodCAxcHggc29saWQgIzgwODA4MFxuICAgICAgICAmOmZpcnN0LWNoaWxkXG4gICAgICAgICAgYmFja2dyb3VuZDogdXJsKCAnfmltYWdlcy9kb3duLnBuZycgKSBuby1yZXBlYXQgODVweCBjZW50ZXJcbiAgICAgICAgJjpsYXN0LWNoaWxkXG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlXG4gICAgICAgICAgYm9yZGVyLXJpZ2h0IDBcbiAgICAgICAgICBlbVxuICAgICAgICAgICAgYmFja2dyb3VuZDogI2ZmMmE0NFxuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlXG4gICAgICAgICAgICB0b3A6IC01cHhcbiAgICAgICAgICAgIHJpZ2h0OiAzMHB4XG4gICAgICAgICAgICB3aWR0aDogMTdweFxuICAgICAgICAgICAgaGVpZ2h0OiAxN3B4XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMTdweFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1cyAxMHB4XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXJcbiAgICAgICAgICAgIGNvbG9yOiAjZmZmZmZmXG4gICAgICAgICAgICBmb250LXNpemUgMTJweFxuICAgICAgICBzcGFuXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyXG4gICAgICAgICAgY29sb3I6ICNmZmZmZmZcbjwvc3R5bGU+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL21vZHVsZXMvSGVhZGVyLnZ1ZT8zZDRhNWNhZSIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJoZWFkZXJcIiwgeyBzdGF0aWNDbGFzczogXCJoZWFkZXJcIiB9LCBbXG4gICAgX2MoXCJzcGFuXCIsIHsgc3RhdGljQ2xhc3M6IFwidGl0bGVcIiB9LCBbX3ZtLl92KFwi5LmF6ZqG5ZWG6LS45qyi6L+O5oKoXCIpXSksXG4gICAgX2MoXCJ1bFwiLCB7IHN0YXRpY0NsYXNzOiBcImluZm9cIiB9LCBbXG4gICAgICBfdm0uX20oMCwgZmFsc2UsIGZhbHNlKSxcbiAgICAgIF9jKFxuICAgICAgICBcImxpXCIsXG4gICAgICAgIFtcbiAgICAgICAgICBfYyhcbiAgICAgICAgICAgIFwicm91dGVyLWxpbmtcIixcbiAgICAgICAgICAgIHsgc3RhdGljQ2xhc3M6IFwibXktb3JkZXJcIiwgYXR0cnM6IHsgdG86IFwiL3BlcnNvbmFsXCIgfSB9LFxuICAgICAgICAgICAgW19jKFwic3BhblwiLCBbX3ZtLl92KFwi5oiR55qE6K6i5Y2VXCIpXSldXG4gICAgICAgICAgKVxuICAgICAgICBdLFxuICAgICAgICAxXG4gICAgICApLFxuICAgICAgX2MoXG4gICAgICAgIFwibGlcIixcbiAgICAgICAgW1xuICAgICAgICAgIF9jKFwicm91dGVyLWxpbmtcIiwgeyBhdHRyczogeyB0bzogeyBwYXRoOiBcIi9jYXJ0XCIgfSB9IH0sIFtcbiAgICAgICAgICAgIF9jKFwic3BhblwiLCBbX3ZtLl92KFwi6LSt54mp6L2mXCIpXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBfYyhcImVtXCIsIFtfdm0uX3YoX3ZtLl9zKF92bS5jYXJ0TnVtKSldKVxuICAgICAgICBdLFxuICAgICAgICAxXG4gICAgICApXG4gICAgXSlcbiAgXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwibGlcIiwgW19jKFwic3BhblwiLCBbX3ZtLl92KFwi5byg5Li95Li9XCIpXSldKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbnZhciBlc0V4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5leHBvcnQgZGVmYXVsdCBlc0V4cG9ydHNcbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtNjljNjczY2VcIiwgZXNFeHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi02OWM2NzNjZVwiLFwiaGFzU2NvcGVkXCI6dHJ1ZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvcHJlcHJvY2Vzc29yLmpzP2VuZ2luZT1qYWRlIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCZidXN0Q2FjaGUhLi9zcmMvbW9kdWxlcy9IZWFkZXIudnVlXG4vLyBtb2R1bGUgaWQgPSAxNTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbmZ1bmN0aW9uIGluamVjdFN0eWxlIChzc3JDb250ZXh0KSB7XG4gIGlmIChkaXNwb3NlZCkgcmV0dXJuXG4gIHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9leHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW4vZGlzdC9sb2FkZXIuanM/e1xcXCJvbWl0XFxcIjoxLFxcXCJyZW1vdmVcXFwiOnRydWUsXFxcInB1YmxpY1BhdGhcXFwiOlxcXCIuLi9cXFwifSF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/e1xcXCJtaW5pbWl6ZVxcXCI6ZmFsc2V9IS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtNDg5NDBmZGNcXFwiLFxcXCJzY29wZWRcXFwiOnRydWUsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6ZmFsc2V9IXN0eWx1cy1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c3R5bGVzJmluZGV4PTAmYnVzdENhY2hlIS4vRm9vdGVyLnZ1ZVwiKVxufVxudmFyIG5vcm1hbGl6ZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyXCIpXG4vKiBzY3JpcHQgKi9cbmltcG9ydCBfX3Z1ZV9zY3JpcHRfXyBmcm9tIFwiISFiYWJlbC1sb2FkZXIhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9c2NyaXB0JmluZGV4PTAmYnVzdENhY2hlIS4vRm9vdGVyLnZ1ZVwiXG4vKiB0ZW1wbGF0ZSAqL1xuaW1wb3J0IF9fdnVlX3RlbXBsYXRlX18gZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtNDg5NDBmZGNcXFwiLFxcXCJoYXNTY29wZWRcXFwiOnRydWUsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL3ByZXByb2Nlc3Nvcj9lbmdpbmU9amFkZSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL0Zvb3Rlci52dWVcIlxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IGluamVjdFN0eWxlXG4vKiBzY29wZUlkICovXG52YXIgX192dWVfc2NvcGVJZF9fID0gXCJkYXRhLXYtNDg5NDBmZGNcIlxuLyogbW9kdWxlSWRlbnRpZmllciAoc2VydmVyIG9ubHkpICovXG52YXIgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfXyA9IG51bGxcbnZhciBDb21wb25lbnQgPSBub3JtYWxpemVDb21wb25lbnQoXG4gIF9fdnVlX3NjcmlwdF9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9fLFxuICBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18sXG4gIF9fdnVlX3N0eWxlc19fLFxuICBfX3Z1ZV9zY29wZUlkX18sXG4gIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX19cbilcbkNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwic3JjL21vZHVsZXMvRm9vdGVyLnZ1ZVwiXG5pZiAoQ29tcG9uZW50LmVzTW9kdWxlICYmIE9iamVjdC5rZXlzKENvbXBvbmVudC5lc01vZHVsZSkuc29tZShmdW5jdGlvbiAoa2V5KSB7ICByZXR1cm4ga2V5ICE9PSBcImRlZmF1bHRcIiAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCJ9KSkgeyAgY29uc29sZS5lcnJvcihcIm5hbWVkIGV4cG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gKi52dWUgZmlsZXMuXCIpfVxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtNDg5NDBmZGNcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi00ODk0MGZkY1wiLCBDb21wb25lbnQub3B0aW9ucylcbicgKyAnICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21vZHVsZXMvRm9vdGVyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gMTU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luL2Rpc3QvbG9hZGVyLmpzP3tcIm9taXRcIjoxLFwicmVtb3ZlXCI6dHJ1ZSxcInB1YmxpY1BhdGhcIjpcIi4uL1wifSEuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/e1wibWluaW1pemVcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtNDg5NDBmZGNcIixcInNjb3BlZFwiOnRydWUsXCJoYXNJbmxpbmVDb25maWdcIjpmYWxzZX0hLi9ub2RlX21vZHVsZXMvc3R5bHVzLWxvYWRlciEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0Zvb3Rlci52dWVcbi8vIG1vZHVsZSBpZCA9IDE1N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF92bS5fbSgwLCBmYWxzZSwgZmFsc2UpXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImZvb3RlclwiLCB7IHN0YXRpY0NsYXNzOiBcImZvb3RlclwiIH0sIFtcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY3BcIiB9LCBbXG4gICAgICAgIF9jKFwic3BhblwiLCBbXG4gICAgICAgICAgX3ZtLl92KFxuICAgICAgICAgICAgXCLnmpblhaznvZHlronlpIcgMTEwMDAwMDIwMDAwODggfCDnmpZJQ1Dor4EwNzAzNTnlj7cg5LmF6ZqG5ZWG6LS4QDIwMTcg54mI5p2D5omA5pyJXCJcbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXG4gIH1cbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxudmFyIGVzRXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmV4cG9ydCBkZWZhdWx0IGVzRXhwb3J0c1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi00ODk0MGZkY1wiLCBlc0V4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTQ4OTQwZmRjXCIsXCJoYXNTY29wZWRcIjp0cnVlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9tb2R1bGVzL0Zvb3Rlci52dWVcbi8vIG1vZHVsZSBpZCA9IDE1OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFxuICAgIFwiZGl2XCIsXG4gICAgeyBhdHRyczogeyBpZDogXCJpbmRleFwiIH0gfSxcbiAgICBbX2MoXCJUb3BIZWFkZXJcIiksIF9jKFwicm91dGVyLXZpZXdcIiksIF9jKFwiQm90dG9tRm9vdGVyXCIpXSxcbiAgICAxXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG52YXIgZXNFeHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuZXhwb3J0IGRlZmF1bHQgZXNFeHBvcnRzXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LWJlNTI2OGFlXCIsIGVzRXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtYmU1MjY4YWVcIixcImhhc1Njb3BlZFwiOmZhbHNlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9wcmVwcm9jZXNzb3IuanM/ZW5naW5lPWphZGUhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wJmJ1c3RDYWNoZSEuL3NyYy9JbmRleC52dWVcbi8vIG1vZHVsZSBpZCA9IDE2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9