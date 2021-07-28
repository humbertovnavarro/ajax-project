/* eslint-disable no-undef */
var searching = false;
var $searchBox = document.querySelector('#search-box');
var $searchBoxFake = document.querySelector('.input-fake');
var $searchModal = document.querySelector('.search-modal');
var $search = document.querySelector('.carousel');
var queries = [];
var $cell;
var delayedClear;
var options = {
  imagesLoaded: true,
  percentPosition: false,
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

$searchBox.addEventListener('focus', function (event) {
  $searchBox.value = '';
});

$searchBox.addEventListener('keyup', function (event) {
  if (event.key !== 'Enter') {
    return;
  }
  search();
});

$searchBoxFake.addEventListener('focus', function (event) {
  $searchBoxFake.blur();
  $searchBox.focus();
  $searchBox.value = $searchBoxFake.value;
  toggleSearch(true);
});

$searchModal.addEventListener('mousedown', function (event) {
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
  for (i = 0; i < num; i++) {
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
  $searchBox.value = '';
  if (toggle) {
    searching = true;
    $searchModal.classList.remove('hidden');
  } else if (!toggle) {
    searching = false;
    $searchBox.value = '';
    $searchModal.classList.add('hidden');
  }
}

function generateCard(card) {
  queries.push(card);
  var $img = document.createElement('img');
  $img.className = 'MajaxCard';
  $img.src = card.image_uris.large;
  return $img;
}
function search() {
  /*
  Flickity Bug turned into feature
  Flickity is not meant to be cleared instantly, it is supposed to be called using event handlers
*/
  delayedClear = setInterval(function () {
    if (flickity.cells.length <= 0) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://api.scryfall.com/cards/search?order=name?unique=cards&q=' + $searchBox.value);
      xhr.responseType = 'json';
      xhr.onload = function () {
        clearInterval(delayedClear);
        if (xhr.response.data === undefined) {
          return;
        }
        for (var i = Math.min(xhr.response.data.length - 1, 19); i >= 0; i--) {
          var cell = generateCard(this.response.data[i]);
          cell.setAttribute('data-index', i);
          flickity.prepend(cell);
        }
        cardStack();
        $searchBox.value = '';
      };
      xhr.send();
      clearInterval(delayedClear);
    }
    if (delayedClear) { flickity.remove(flickity.selectedElement); }
  }, 5);
}
