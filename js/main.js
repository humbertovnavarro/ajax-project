/* eslint-disable no-undef */
var searching = false;
var $searchBoxes = document.querySelectorAll('.search-box');
var $searchModal = document.querySelector('.search-modal');
var $search = document.querySelector('.carousel');
var flickity;
var queries = [];
var options = {
  imagesLoaded: true,
  percentPosition: true,
  wrapAround: true,
  freeScroll: false,
  pageDots: false
};

function getCurrentSearchBox() {
  if (window.innerWidth > 900) {
    return $searchBoxes[1];
  } else {
    return $searchBoxes[0];
  }
}

function resetFlickity() {
  if (flickity !== undefined) {
    flickity.destroy();
  }
  $search.innerHTML = '';
  flickity = new Flickity($search, options);
  flickity.on('staticClick', function (event) {
    flickity.select(event.target.getAttribute('data-index'));
  });
}

window.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    toggleSearch(false);
  }
  if (event.key.length === 1) {
    if (!searching) {
      toggleSearch(true);
    }
    getCurrentSearchBox().focus();
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

$searchBoxes[0].addEventListener('focus', function (event) {
  this.value = '';
});

$searchBoxes[0].addEventListener('blur', function (event) {
  this.value = 'Search';
});

$searchBoxes[0].addEventListener('keyup', function (event) {
  if (event.key !== 'Enter') {
    return;
  }
  search();
});

$searchBoxes[1].addEventListener('focus', function (event) {
  this.value = '';
});

$searchBoxes[1].addEventListener('blur', function (event) {
  this.value = 'Search';
});

$searchBoxes[1].addEventListener('keyup', function (event) {
  if (event.key !== 'Enter') {
    return;
  }
  search();
});

$searchModal.addEventListener('mousedown', function (event) {
  if (event.target.matches('.search-modal')) {
    toggleSearch(false);
  }
});

function toggleSearch(toggle) {
  getCurrentSearchBox().value = '';
  if (toggle) {
    searching = true;
    $searchModal.classList.remove('hidden');
  } else if (!toggle) {
    searching = false;
    getCurrentSearchBox().value = '';
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
  resetFlickity();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.scryfall.com/cards/search?order=name?unique=cards&q=' + getCurrentSearchBox().value);
  xhr.responseType = 'json';
  xhr.onload = function () {
    if (xhr.status !== 200) {
      return;
    }
    if (xhr.response.data.length <= 0) {
      return;
    }
    for (var i = Math.min(xhr.response.data.length - 1, 30); i >= 0; i--) {
      var cell = generateCard(this.response.data[i]);
      cell.setAttribute('data-index', i);
      flickity.prepend(cell);
    }
    getCurrentSearchBox().value = '';
  };
  xhr.send();
}
