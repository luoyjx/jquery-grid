/**
 * jquery grid
 * Created by yanjixiong <yjk99@qq.com> on 2016/5/24 0024.
 */

(function ($) {
  $.fn.createPortfolio = function (options) {
    var defaults = {
      captionType: 'popup',
      imagesPerPage: options.portfolioItems.length,
      imagesPerRow: 4,
      imageHeight: 1000,
      imageWidth: 1000,
      paginationPosition: 'scroll',
      fitImagestoContainers: false,
      enablePopupInfo: true
    };

    var containerClass;
    var imageContainerWidth;
    var imageContainerHeight;
    var settings = $.extend({}, defaults, options);
    var totalNumImages = settings.portfolioItems.length;
    var numPages = Math.floor(totalNumImages / settings.imagesPerPage);
    if ((totalNumImages % settings.imagesPerPage) !== 0)
      numPages++;
    var currentPage = 0;



  };

})(jQuery);

