/* eslint-disable no-undef */
const mobile = mobileCheck();
const $qrButton = document.querySelector('.qr-button');
const $qrModal = document.querySelector('.qr-modal');
const $qrImage = document.querySelector('.qr-image');
const $noResultsModal = document.querySelector('.no-results-modal');
const view = null;
const $cardList = document.querySelector('.card-list');
const $searchIcon = document.querySelector('.search-icon');
let $deletingDeckBox;
const $deleteModal = document.querySelector('.delete-modal-container');
const $tabButton = document.querySelector('#tab-view');
let tabViewOpen = false;
const $deckContainerDesktop = document.querySelector('.deck-container');
const $deckListDesktop = document.querySelector('.deck-list-desktop');
const $tabView = document.querySelector('.tab-view');
const $searchBoxes = document.querySelectorAll('.search-box');
const $searchModal = document.querySelector('.search-modal');
const $search = document.querySelector('.carousel');
const $deckBigText = document.querySelector('.deck-big-text');
const $deckImageBox = document.querySelector('.deck-image-box');
const $itemContainer = document.querySelector('.card-view');
const $deckView = document.querySelector('.deck-view');
// eslint-disable-next-line no-unused-vars
const $stackContainer = document.querySelector('.majax-stack-container');
const $infoModal = document.querySelector('.info-modal');
const $loadModal = document.querySelector('.load-modal');
let flickity;
const options = {
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
  let index;
  let i;
  let $deckBox;
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
    const deck = new Deck('New Deck');
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

for (let i = 0; i < $searchBoxes.length; i++) {
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
  const $h1 = Deck.getActiveDeck().$deckBox.children[1];
  $h1.textContent = $deckBigText.value;
  Deck.getActiveDeck().name = $deckBigText.value;
  for (let i = 0; i < $deckContainerDesktop.children.length; i++) {
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
  const $img = document.createElement('img');
  $img.className = 'majax-card';
  $img.src = 'images/loader.svg';
  setTimeout(() => { $img.src = card.image_uris.small; }, 0);
  setTimeout(() => { $img.src = card.image_uris.normal; }, 0);
  setTimeout(() => { $img.src = card.image_uris.large; }, 0);
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
  const $searchBox = getCurrentSearchBox();
  const query = $searchBox.value;
  if (!query) {
    $loadModal.classList.add('hidden');
    $searchModal.classList.add('hidden');
    return;
  }
  $loadModal.classList.remove('hidden');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.scryfall.com/cards/search?order=cmc&q=' + query);
  getCurrentSearchBox().value = '';
  xhr.responseType = 'json';
  xhr.onload = function () {
    if (xhr.response.data === undefined || xhr.response.data.length === 0 || xhr.response.data === null) {
      $loadModal.classList.add('hidden');
      $searchModal.classList.add('hidden');
      switchView('noresults');
      getCurrentSearchBox().focus();
      return;
    }
    results = xhr.response;
    let maxResults = 175;
    if (mobile) {
      maxResults = 50;
    }
    for (let i = Math.min(xhr.response.data.length - 1, maxResults); i >= 0; i--) {
      if (xhr.response.data[i].image_uris !== undefined) {
        const cell = generateCard(this.response.data[i]);
        cell.setAttribute('data-index', i);
        flickity.prepend(cell);
      }
    }
    flickity.positionCells();
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
  let zoomed = 'scale(2) translateY(-20px)';
  if (window.innerWidth < 900) {
    zoomed = 'scale(1.25) translateY(-20px)';
  }
  const normal = 'scale(1) translateY(0px)';
  for (let i = 0; i < flickity.cells.length; i++) {
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
  if (string === 'noresults') {
    $noResultsModal.classList.remove('hidden');
    setTimeout(function () {
      $noResultsModal.classList.add('hidden');
    }, 1000);
    return;
  }
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
    for (let i = 0; i < data.decks.length; i++) {
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
    let url = 'https://api.qrserver.com/v1/create-qr-code/?data=https://humbertovnavarro.github.io/majax/?';
    url += Deck.getActiveDeck().serialize();
    $qrImage.src = url;
    $qrModal.classList.remove('hidden');
  }
}
