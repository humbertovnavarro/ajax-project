/* eslint-disable no-undef */
var searching = false;
var $searchBox = document.querySelector('#search-box');
var $searchBoxFake = document.querySelector('.input-fake');
var $searchModal = document.querySelector('.search-modal');
var $search = document.querySelector('.carousel');
var $cell;
var options = {
  imagesLoaded: true,
  percentPosition: false,
  draggable: false,
  wrapAround: true,
  freeScroll: false,
  pageDots: false
};

flickity = new Flickity($search, options);
flickity.on('select', function (cell) {
  cardStack();
});

window.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    toggleSearch(false);
  }
  if (event.key.length === 1 && !searching) {
    toggleSearch(true);
    $searchBox.focus();
  }
});

$searchModal.addEventListener('wheel', function (event) {
  if (event.deltaY > 0) {
    flickity.previous();
  }
  if (event.deltaY < 0) {
    flickity.next();
  }
});
$searchBoxFake.addEventListener('input', function (event) {
  $searchBox.value = $searchBoxFake.value;
});

$searchBoxFake.addEventListener('focus', function (event) {
  $searchBoxFake.blur();
  $searchBox.focus();
  $searchBox.value = $searchBoxFake.value;
  toggleSearch(true);
});

$searchModal.addEventListener('click', function (event) {
  if (event.target.matches('.search-modal')) {
    toggleSearch(false);
    $searchBox.className = 'top';
  }
});

flickity.on('change', function (cell) {
  cardStack();
});

flickity.on('staticClick', function (event) {
  flickity.select(event.target.getAttribute('data-index'));
});

function cardStack() {
  for (var i = 0; i < flickity.cells.length; i++) {
    flickity.cells[i].element.style.zIndex = -1;
    flickity.cells[i].element.style.transform = 'none';
  }
  var scale = 2;
  var num = flickity.cells.length / 2 - 3;
  var currentIndex = flickity.selectedIndex;
  for (var i = 0; i < num; i++) {
    scale -= 0.1;
    currentIndex++;
    if (currentIndex > flickity.cells.length - 1) {
      currentIndex = 0;
    }
    $cell = flickity.cells[currentIndex].element;
    $cell.style.transform = 'scale(' + scale + ')';
    $cell.style.zIndex = num - i;
  }
  scale = 2;
  currentIndex = flickity.selectedIndex;
  for (i = 0; i < num; i++) {
    scale -= 0.1;
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = flickity.cells.length - 1;
    }
    $cell = flickity.cells[currentIndex].element;
    $cell.style.transform = 'scale(' + scale + ')';
    $cell.style.zIndex = num - i;
  }
}

function toggleSearch(toggle) {
  if (toggle) {
    flickity = new Flickity($search, options);
    searching = true;
    $searchModal.classList.remove('hidden');
  } else if (!toggle) {
    searching = false;
    $searchBox.value = '';
    $searchModal.classList.add('hidden');
  }
}
