/* eslint-disable no-undef */
var $search = document.querySelector('.carousel');
var options = {
  imagesLoaded: true,
  percentPosition: false,
  wrapAround: true,
  lazyLoad: true,
  freeScroll: false,
  pageDots: false,
  adaptiveHeight: true
};
flickity = new Flickity($search, options);

flickity.on('select', function (cell) {
});
