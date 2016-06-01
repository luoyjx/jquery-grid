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
  $.fn.grid = function Grid( options ) {
    var _this = this;

    /*
     * 默认设置
     * @type {{}}
     * @private
     */
    var _defaults = {
      currentPage: 1,   //当前页
      pageSize: 8,     //分页大小
      totalCount: 0,    //总数
      dataUrl: '',      //数据请求地址
      dataMethod: 'GET',   //数据请求方式 GET、POST
      renderItem: undefined  //渲染子项的函数
    };

    /**
     * 初始化
     * @param {Object} options 选项
     */
    function init( options ) {
      _defaults = $.extend( _defaults, options );

      //初始化，加载数据
      loadData( _defaults.currentPage, function( result ) {
        //只取页面大小数据
        var data = Array.prototype.slice.call( result.data, 0, _defaults.pageSize );
        //更新数据
        _defaults.totalCount = result.total;
        render( data );
      });
    }

    /**
     * 切换页
     * @param {Number} page 页码
     */
    function changePage( page ) {

      //加载对应页面数据
      loadData( page, function( result ) {
        //只取页面大小数据
        var data = Array.prototype.slice.call( result.data, 0, _defaults.pageSize );
        //更新数据
        _defaults.totalCount = result.total;
        _defaults.currentPage = page;
        render( data );
      });
    }

    /**
     * 加载数据
     * @param page 页码
     * @param callback 回调函数
     */
    function loadData( page, callback ) {
      //缓存预留

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
     * 计算总页数
     */
    function getTotalPage() {
      return _defaults.totalCount % _defaults.pageSize == 0
          ? parseInt( _defaults.totalCount / _defaults.pageSize, 10 )
          : parseInt( _defaults.totalCount / _defaults.pageSize, 10 ) + 1;
    }

    /**
     * 渲染
     * @param dataList 数据
     */
    function render( dataList ) {
      if ( !_defaults.renderItem || typeof _defaults.renderItem !== 'function' ) {
        throw new Error(' `renderItem` function is required. ');
      }

      var renderHtml = dataList.map(function ( dataItem ) {
        return _defaults.renderItem( dataItem );
      }).join('');

      var totalPage = getTotalPage();

      renderHtml += renderPager( _defaults.currentPage, totalPage );

      $(_this).html(renderHtml);

      addHandler();
    }

    /**
     * 渲染分页
     */
    function renderPager( currentPage, totalPage ) {
      var renderHtml = '<div class="pager" >';
      var prevPageHtml = '<a href="javascript:;" class="pager-prev {disable}" data-p="{p}">上一页</a>';
      var nextPageHtml = '<a href="javascript:;" class="pager-next {disable}" data-p="{p}">下一页</a>';
      var itemPageHtml = '<a href="javascript:;" class="pager-item {active}" data-p="{p}">{pageNo}</a>';
      var dotPageHtml = '<a href="javascript:;" class="pager-dot">...</a>';
      var renderEndHtml = '</div>';

      var pageStart = currentPage - 3 > 0 ? currentPage - 3 : 1;
      var pageEnd = pageStart + 6 >= totalPage ? totalPage : pageStart + 6;

      //第一页时禁用上一页按钮
      if (currentPage == 1) {
        renderHtml += prevPageHtml
            .replace('{disable}', 'pager-disable')
            .replace('{p}', '1');
      } else {
        renderHtml += prevPageHtml
            .replace('{disable}', '')
            .replace('{p}', ( currentPage <= 1 ? 1 : currentPage - 1 ) + '' );
      }

      //第一页必渲染
      if (pageStart > 1) {
        renderHtml += itemPageHtml
            .replace('{pageNo}', '1')
            .replace('{disable}', ( currentPage == 1 ? 'pager-disable' : '' ))
            .replace('{p}', '1');
        renderHtml += dotPageHtml;
      }

      for( var i = pageStart; i <= pageEnd; i++) {
        renderHtml += itemPageHtml
            .replace('{active}', ( i == currentPage ? 'active' : '' ))
            .replace('{pageNo}', i + '')
            .replace('{p}', i + '');
      }

      if ( pageEnd < totalPage ) {
        renderHtml += dotPageHtml;
        renderHtml += itemPageHtml
            .replace('{pageNo}', totalPage)
            .replace('{disable}', ( currentPage == totalPage ? 'pager-disable' : '' ))
            .replace('{p}', totalPage + '');
      }

      //最后一页时禁用下一页按钮
      if (currentPage == totalPage) {
        renderHtml += nextPageHtml
            .replace('{disable}', 'pager-disable')
            .replace('{p}', totalPage + '');
      } else {
        renderHtml += nextPageHtml
            .replace('{disable}', '')
            .replace('{p}', ( currentPage >= totalPage ? totalPage : currentPage + 1 ) + '' );
      }

      return renderHtml + renderEndHtml;
    }

    /**
     * 添加事件处理
     */
    function addHandler() {
      var totalPage = getTotalPage();

      //上一页 下一页 翻页事件
      if ( _defaults.currentPage && _defaults.currentPage < totalPage ) {
        $('.pager-next').click(function changePageHandler() {
          var $this = $(this);
          var targetPage = $this.data('p');
          if ( !targetPage ) return;
          targetPage = parseInt( targetPage, 10 );
          changePage( targetPage );
        });
        $('.pager-prev').click(function changePageHandler() {
          var $this = $(this);
          var targetPage = $this.data('p');
          if ( !targetPage ) return;
          targetPage = parseInt( targetPage, 10 );
          changePage( targetPage );
        });
      } else if ( _defaults.currentPage == 1 ) {
        $('.pager-next').click(function changePageHandler() {
          var $this = $(this);
          var targetPage = $this.data('p');
          if ( !targetPage ) return;
          targetPage = parseInt( targetPage, 10 );
          changePage( targetPage );
        });
      } else if ( _defaults.currentPage == totalPage ) {
        $('.pager-prev').click(function changePageHandler() {
          var $this = $(this);
          var targetPage = $this.data('p');
          if ( !targetPage ) return;
          targetPage = parseInt( targetPage, 10 );
          changePage( targetPage );
        });
      }

      //页码 翻页
      $('.pager-item').click(function () {
        var $this = $(this);
        var targetPage = $this.data('p');
        if ( !targetPage ) return;
        targetPage = parseInt( targetPage, 10 );
        changePage( targetPage );
      });
    }

    init( options );

    return {
      changePage: changePage
    };
  };

})(jQuery);

