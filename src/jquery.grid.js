/**
 * jquery grid
 *
 * jquery网格插件，用于将拉取的数据生成网格元素
 * =>
 *  1. 获取配置信息初始化
 *  2. 由初始化条件
 *  3. 第一次从网络加载，以后优先从缓存读取(如果启用缓存)
 *  4. 如果无数据则从网络加载
 *  5. 渲染
 *
 * Created by yanjixiong <yjk99@qq.com> on 2016/5/24 0024.
 */

(function ($) {
  $.fn.grid = function ( options ) {
    var _this = this;

    /*
     * 默认设置
     * @type {{}}
     * @private
     */
    var _defaults = {
      currentPage: 1,   //当前页
      pageSize: 16,     //分页大小
      totalPage: 1,     //总页数
      totalCount: 0,    //总数
      dataUrl: '',      //数据请求地址
      dataMethod: 'GET',   //数据请求方式 GET、POST
      useCache: false, //启用缓存
      renderItem: undefined  //渲染子项的函数
    };

    /*
     * 是否已经初始化
     */
    var _hasInit = false;

    /*
     * 数据缓存
     * @type {{}}
     * @private
     */
    var _cache = {
      data: [], //存放已缓存的数据对象
      pages: []  //存放已缓存的数据页码
    };

    /**
     * 初始化
     * @param {Object} options 选项
     */
    function init( options ) {
      _defaults = $.extend( _defaults, options );

      //初始化，加载数据
      loadData( _defaults.currentPage, function( data ) {
        render( data );
      });
    }

    /**
     * 切换页
     * @param {Number} page 页码
     */
    function changePage( page ) {

      //加载对应页面数据
      loadData( page, function( data ) {
        render( data );
      });
    }

    /**
     * 加载数据
     * @param page 页码
     * @param callback 回调函数
     */
    function loadData( page, callback ) {
      //加载到的数据
      var data;

      //启用了缓存且缓存中有数据，从缓存加载
      if ( _defaults.useCache && _hasInit ) {
        data = loadDataFromCache( page );
        if (data) _defaults.currentPage = page;
        return callback( data );
      }

      //从网络加载数据
      loadDataFromNetwork( page, callback );
    }

    /**
     * 从网络加载
     * @param page 页码
     * @param successCallback 成功回调
     */
    function loadDataFromNetwork( page, successCallback ) {
      if ( !_defaults.dataUrl ) throw new Error('dataUrl is required.');

      var offset = ( page - 1 ) * _defaults.pageSize;

      $.ajax({
        url: _defaults.dataUrl,
        type: _defaults.dataMethod,
        data: { iDisplayStart: offset, iDisplayLength: _defaults.pageSize },
        success: successCallback
      })
    }

    /**
     * 从缓存加载
     * @param page 页码
     */
    function loadDataFromCache( page ) {
      //缓存中的下标
      var cacheIndex = _cache.pages.indexOf( page );

      if ( cacheIndex !== -1) {
        return _cache.data[cacheIndex];
      }
      return false;
    }

    /**
     * 渲染
     * @param dataList 数据
     */
    function render( dataList ) {
      console.log(dataList);
      if ( !_defaults.renderItem || typeof _defaults.renderItem !== 'function' ) {
        console.log('error');
        throw new Error(' `renderItem` function is required. ');
      }

      var renderHtml = dataList.map(function ( dataItem ) {
        return _defaults.renderItem( dataItem );
      }).join('');

      $(_this).html(renderHtml);
    }

    init( options );
  };

})(jQuery);

