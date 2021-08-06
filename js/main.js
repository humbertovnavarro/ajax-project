/* eslint-disable no-undef */
var $qrButton = document.querySelector('.qr-button');
var $qrModal = document.querySelector('.qr-modal');
var $qrImage = document.querySelector('.qr-image');
var view = null;
var $cardList = document.querySelector('.card-list');
var $searchIcon = document.querySelector('.search-icon');
var $deletingDeckBox;
var $deleteModal = document.querySelector('.delete-modal-container');
var $tabButton = document.querySelector('#tab-view');
var tabViewOpen = false;
var $deckContainerDesktop = document.querySelector('.deck-container');
var $deckListDesktop = document.querySelector('.deck-list-desktop');
var $tabView = document.querySelector('.tab-view');
var $searchBoxes = document.querySelectorAll('.search-box');
var $searchModal = document.querySelector('.search-modal');
var $search = document.querySelector('.carousel');
var $deckBigText = document.querySelector('.deck-big-text');
// eslint-disable-next-line no-unused-vars
var $deckImageBox = document.querySelector('.deck-image-box');
// eslint-disable-next-line no-unused-vars
var $itemContainer = document.querySelector('.card-view');
var $deckView = document.querySelector('.deck-view');
// eslint-disable-next-line no-unused-vars
var $stackContainer = document.querySelector('.majax-stack-container');
var $infoModal = document.querySelector('.info-modal');
var $loadModal = document.querySelector('.load-modal');
var flickity;
var options = {
  imagesLoaded: true,
  percentPosition: true,
  wrapAround: true,
  freeScroll: false,
  pageDots: false
};
$qrButton.addEventListener('click', function (event) {
  switchView('qr');
});

$qrModal.addEventListener('click', function (event) {
  $qrModal.classList.add('hidden');
});

$deleteModal.addEventListener('click', function (event) {
  if (event.target.dataset.control === 'delete') {
    $deleteModal.parentElement.classList.add('hidden');
    $deletingDeckBox.remove();
    Deck.deleteActive();
    switchView('decks');
  }
  if (event.target.dataset.control === 'cancel') {
    $deleteModal.parentElement.classList.add('hidden');
    switchView('decks');
  }
});

$deckListDesktop.addEventListener('click', function (event) {
  var index;
  var i;
  var $deckBox;
  if (event.target.dataset.control === 'right') {
    index = data.deckIndex;
    if (data.deckIndex + 1 > data.decks.length - 1) {
      index = 0;
    } else {
      index++;
    }
    $deckBox = data.decks[index].$deckBox;
    for (i = 0; i < $deckContainerDesktop.children.length; i++) {
      $deckContainerDesktop.children[i].id = '';
    }
    $deckBox.id = 'active';
    Deck.setActiveDeck(Number.parseInt($deckBox.dataset.id));
    $deckBox.scrollIntoView({ alignToTop: true, behavior: 'smooth', block: 'center' });
  }
  if (event.target.dataset.control === 'left') {
    index = data.deckIndex;
    if (index - 1 < 0) {
      index = data.decks.length - 1;
    } else {
      index--;
    }
    $deckBox = data.decks[index].$deckBox;
    for (i = 0; i < $deckContainerDesktop.children.length; i++) {
      $deckContainerDesktop.children[i].id = '';
    }
    $deckBox.id = 'active';
    Deck.setActiveDeck(Number.parseInt($deckBox.dataset.id));
    $deckBox.scrollIntoView({ alignToTop: true, behavior: 'smooth', block: 'center' });
  }
});

window.addEventListener('click', function (event) {
  if (!tabViewOpen || event.target.matches('.tab-view')) {
    return;
  }
  if (event.target.parentElement.dataset.link === 'decks') {
    switchView('decks');
  }
  if (event.target.parentElement.dataset.link === 'cards') {
    switchView('cards');
  }
  if (event.target.parentElement.dataset.link === 'add-deck') {
    var deck = new Deck('New Deck');
    deck.id = data.nextDeckID;
    data.nextDeckID++;
    data.deckIDS.push(deck.id);
    data.decks.push(deck);
    deck.render();
    deck.renderDeckBox();
    $deckContainerDesktop.appendChild(deck.$deckBox);
    switchView('decks');
  }
  $tabView.classList.remove('slide');
  tabViewOpen = false;
});

$tabButton.addEventListener('click', function () {
  setTimeout(function () { tabViewOpen = true; });
  $tabView.classList.add('slide');
});

$infoModal.addEventListener('click', function () {
  this.classList.add('hidden');
});

$searchModal.addEventListener('wheel', function (event) {
  if (event.deltaY > 0) {
    flickity.previous();
  }
  if (event.deltaY < 0) {
    flickity.next();
  }
});

for (var i = 0; i < $searchBoxes.length; i++) {
  $searchBoxes[i].addEventListener('keyup', function (event) {
    if (event.key !== 'Enter') {
      toggleSearch(false);
      return;
    }
    search();
  });
}

$searchModal.addEventListener('mousedown', function (event) {
  if (event.target.matches('.search-modal')) {
    toggleSearch(false);
  }
});

$deckBigText.addEventListener('blur', function () {
  var $h1 = Deck.getActiveDeck().$deckBox.children[1];
  $h1.textContent = $deckBigText.value;
  Deck.getActiveDeck().name = $deckBigText.value;
  for (var i = 0; i < $deckContainerDesktop.children.length; i++) {
    if ($deckContainerDesktop.children[i].dataset.id === Deck.getActiveDeck().id) {
      $deckContainerDesktop.children[i].innerHTML = Deck.getActiveDeck().name;
    }
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
    $loadModal.classList.add('hidden');
    $searchModal.classList.add('hidden');
    return;
  }
  $loadModal.classList.remove('hidden');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.scryfall.com/cards/search?order=cmc&q=' + query);
  getCurrentSearchBox().value = '';
  xhr.responseType = 'json';
  xhr.onload = function () {
    if (xhr.response.data === undefined || xhr.response.data.length === 0 || xhr.response.data === null) {
      $loadModal.classList.add('hidden');
      $searchModal.classList.add('hidden');
      return;
    }
    results = xhr.response;
    for (var i = Math.min(xhr.response.data.length - 1, 175); i >= 0; i--) {
      if (xhr.response.data[i].image_uris !== undefined) {
        var cell = generateCard(this.response.data[i]);
        cell.setAttribute('data-index', i);
        flickity.prepend(cell);
      }
    }
    $loadModal.classList.add('hidden');
  };
  xhr.send();
}

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
      Deck.getActiveDeck().addCard(event.target.getAttribute('data-id'));
      window.navigator.vibrate([25, 50, 25]);
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

window.onresize = function () {
  if (window.innerWidth < 900) {
    if (view === 'decks') {
      switchView('decks');
    }
    return;
  }
  $deckBigText.classList.remove('hidden');
  $searchIcon.classList.remove('hidden');
  $deckBigText.classList.remove('hidden');
  $deckImageBox.classList.remove('hidden');
  $cardList.style.height = null;
};

function switchView(string) {
  view = string;
  $searchBoxes[0].classList.remove('hidden');
  $searchIcon.classList.remove('hidden');
  $deckBigText.classList.remove('hidden');
  $deckImageBox.classList.remove('hidden');
  $cardList.style.height = 'unset';
  if (string === 'decks') {
    if (window.innerWidth > 900) {
      return;
    }
    $itemContainer.classList.add('hidden');
    $deckView.classList.remove('hidden');
    $deckView.innerHTML = '';
    for (var i = 0; i < data.decks.length; i++) {
      $deckView.appendChild(data.decks[i].renderDeckBoxMobile());
    }
    $deckBigText.classList.add('hidden');
    $deckImageBox.classList.add('hidden');
    $searchBoxes[0].classList.add('hidden');
    $searchIcon.classList.add('hidden');
    $cardList.style.height = '92vh';
    return;
  }
  if (string === 'cards') {
    if (window.innerWidth > 900) {
      return;
    }
    $itemContainer.classList.remove('hidden');
    $deckView.classList.add('hidden');
    return;
  }
  if (string === 'delete') {
    $deleteModal.parentElement.classList.remove('hidden');
  }
  if (string === 'qr') {
    var url = 'https://api.qrserver.com/v1/create-qr-code/?data=https://humbertovnavarro.github.io/ajax-project/?';
    url += Deck.getActiveDeck().serialize();
    $qrImage.src = url;
    $qrModal.classList.remove('hidden');
  }
}
