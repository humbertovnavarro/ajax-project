/* eslint-disable no-undef */
var $searchBoxes = document.querySelectorAll('.search-box');
var $searchModal = document.querySelector('.search-modal');
var $search = document.querySelector('.carousel');
var flickity;
var lastSearch;
var queries = [];
var options = {
  imagesLoaded: true,
  percentPosition: true,
  wrapAround: true,
  freeScroll: false,
  pageDots: false
};

data.decks.push(new Deck('Debugging Deck'));

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
    if (event.target.matches('.is-selected')) {
      data.decks[data.deckIndex].addCard(event.target.getAttribute('data-id'));
      toggleSearch(false);
      return;
    }
    flickity.select(event.target.getAttribute('data-index'));
  });
  flickity.on('select', onSelect);
}

function onSelect(event) {
  var zoomed = 'scale(2) translateY(-20px)';
  if (window.innerWidth < 900) {
    zoomed = 'scale(1.25) translateY(-20px)';
  }
  var normal = 'scale(1) translateY(0px)';
  for (var i = 0; i < flickity.cells.length; i++) {
    flickity.cells[i].element.style.transform = normal;
    flickity.cells[i].element.style.zIndex = ('1');
  }
  flickity.selectedElement.style.zIndex = '2';
  if (flickity.selectedElement.getAttribute('layout') === 'split') {
    flickity.selectedElement.style.transform = zoomed + ' rotate(90deg)';
    return;
  }
  flickity.selectedElement.style.transform = zoomed;
}

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
    toggleSearch(false);
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
    toggleSearch(false);
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
  if (toggle) {
    $searchModal.classList.remove('hidden');
  } else if (!toggle) {
    $searchModal.classList.add('hidden');
  }
}

function generateCard(card) {
  queries.push(card);
  var $img = document.createElement('img');
  $img.className = 'MajaxCard';
  $img.src = card.image_uris.large;
  $img.setAttribute('data-id', card.id);
  if (card.layout === 'split') {
    $img.style.transform = 'rotate(90deg)';
    $img.setAttribute('layout', 'split');
  }
  return $img;
}

function search() {
  toggleSearch(true);
  resetFlickity();
  var $searchBox = getCurrentSearchBox();
  var query = $searchBox.value;
  if (!query) {
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.scryfall.com/cards/search?order=cmc&q=' + query);
  getCurrentSearchBox().value = '';
  xhr.responseType = 'json';
  xhr.onload = function () {
    if (!xhr.response.data) {
      return;
    }
    lastSearch = xhr.response;
    for (var i = Math.min(xhr.response.data.length - 1, 175); i >= 0; i--) {
      var cell = generateCard(this.response.data[i]);
      cell.setAttribute('data-index', i);
      flickity.prepend(cell);
    }
  };
  xhr.send();
}

function searchMore() {
  xhr.open('GET', lastSearch.nextPage);
  getCurrentSearchBox().value = '';
  xhr.responseType = 'json';
  xhr.onload = function () {
    if (!xhr.response.data) {
      return;
    }
    for (var i = Math.min(xhr.response.data.length - 1, 175); i >= 0; i--) {
      var cell = generateCard(this.response.data[i]);
      cell.setAttribute('data-index', i);
      flickity.prepend(cell);
    }
  };
  xhr.send();
}
