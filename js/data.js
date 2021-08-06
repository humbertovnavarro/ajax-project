/* eslint-disable no-undef */
/* exported data */
/* exported Deck */
/* exported Card */
var data = {
  symbols: null,
  deckIDS: [],
  decks: [],
  deckIndex: 0,
  activeDeck: 1,
  nextDeckID: 1,
  mobileView: 'decks'
};

class Card {
  static getSymbol(string) {
    for (var i = 0; i < data.symbols.length; i++) {
      if (data.symbols[i].symbol === string) {
        return data.symbols[i].svg_uri;
      }
    }
  }

  constructor(id) {
    this.count = 1;
    var $cardListItem = document.createElement('div');
    $cardListItem.addEventListener('click', function (event) {
      if (event.target.getAttribute('data-control') === 'up') {
        Deck.getActiveDeck().addCard(this.dataset.id);
      }
      if (event.target.getAttribute('data-control') === 'down') {
        Deck.getActiveDeck().removeCard(this.dataset.id);
      }
    });
    $cardListItem.className = 'majax-item';
    $cardListItem.setAttribute('data-id', id);
    var $buttonBox = document.createElement('div');
    var $up = document.createElement('button');
    var $down = document.createElement('button');
    var $upIcon = document.createElement('span');
    var $downIcon = document.createElement('span');
    $downIcon.setAttribute('data-control', 'down');
    $upIcon.setAttribute('data-control', 'up');
    $downIcon.className = 'material-icons';
    $upIcon.className = 'material-icons';
    $upIcon.textContent = 'expand_less';
    $downIcon.textContent = 'expand_more';
    $up.appendChild($upIcon);
    $down.appendChild($downIcon);
    $buttonBox.appendChild($up);
    var $span = document.createElement('span');
    $span.textContent = 'x1';
    this.counter = $span;
    $buttonBox.appendChild($span);
    $buttonBox.appendChild($down);
    $cardListItem.appendChild($buttonBox);
    var $artCrop = document.createElement('div');
    $artCrop.className = 'art-crop';
    var $image = document.createElement('img');
    $image.src = 'images/loaderblack.svg';
    $artCrop.appendChild($image);
    $cardListItem.appendChild($artCrop);
    var $name = document.createElement('p');
    $cardListItem.appendChild($name);
    var $manaContainer = document.createElement('div');
    $manaContainer.className = 'mana-container';
    $cardListItem.appendChild($manaContainer);
    this.element = $cardListItem;
    this.name = $name;
    this.image = $image;
    this.manaContainer = $manaContainer;
    this.fullCard = 'images/loaderblack.svg';
    var $cardStackItem = document.createElement('div');
    $cardStackItem.setAttribute('data-id', id);
    $cardStackItem.className = 'majax-stack';
    var $stackImage = document.createElement('img');
    $stackImage.src = 'images/loaderblack.svg';
    $cardStackItem.appendChild($stackImage);
    this.desktopElement = $cardStackItem;

    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', 'https://api.scryfall.com/cards/' + id);
    this.xhr.responseType = 'json';
    this.xhr.callback = this;
    this.xhr.onload = function () {
      this.callback.onload();
    };
    this.xhr.send();
  }

  render() {
    $itemContainer.appendChild(this.element);
    $stackContainer.appendChild(this.desktopElement);
  }

  onload() {
    this.fullCard = this.xhr.response.image_uris.large;
    this.name.textContent = this.xhr.response.name;
    this.image.src = this.xhr.response.image_uris.art_crop;
    var manaSymbols = [];
    if (this.xhr.response.mana_cost !== undefined) {
      var manaString = this.xhr.response.mana_cost;
      for (var i = 0; i < manaString.length; i++) {
        if (manaString[i] === '{') {
          manaSymbols.push(manaString.substring(i, manaString.indexOf('}', i) + 1));
        }
      }
      for (i = 0; i < manaSymbols.length; i++) {
        var $image = document.createElement('img');
        $image.className = 'mana-symbol';
        var source = Card.getSymbol(manaSymbols[i]);
        $image.src = source;
        this.manaContainer.appendChild($image);
      }
    }
    this.symbols = manaSymbols;
    for (i = 0; i < this.desktopElement.children.length; i++) {
      this.desktopElement.children[i].src = this.fullCard;
    }

    this.desktopElement.addEventListener('click', function (event) {
      if (event.target.className === 'material-icons') {
        return;
      }
      $infoModal.classList.remove('hidden');
      $infoModal.children[0].src = Deck.getActiveDeck().cards[this.dataset.id].fullCard;
    });
    this.desktopElement.addEventListener('contextmenu', function (event) {
      event.preventDefault();
      Deck.getActiveDeck().removeCard(this.dataset.id);
    });

    this.element.addEventListener('click', function (event) {
      if (event.target.className === 'material-icons') {
        return;
      }
      $infoModal.classList.remove('hidden');
      $infoModal.children[0].src = Deck.getActiveDeck().cards[this.dataset.id].fullCard;
    });
    if (this.xhr.response != null) {
      if (this.xhr.response.image_uris != null) {
        if (this.xhr.response.image_uris.art_crop != null) {
          var deck = Deck.getActiveDeck();
          if (deck.image === 'images/loader.svg') {
            deck.image = this.xhr.response.image_uris.art_crop;
            deck.$deckBox.children[0].children[0].src = deck.image;
            $deckImageBox.style.backgroundImage = 'url(' + Deck.getActiveDeck().image + ')';
          }
        }
      }
    }
  }
}

class Deck {
  constructor(name = null) {
    this.name = name;
    this.image = 'images/loader.svg';
    this.cards = {};
  }

  render() {
    $itemContainer.innerHTML = '';
    $stackContainer.innerHTML = '';
    $deckBigText.value = '';
    for (var key in this.cards) {
      this.cards[key].render();
    }
    if (this.name !== null) {
      $deckBigText.value = this.name;
    }
    $deckImageBox.style.backgroundImage = 'url(' + this.image + ')';
  }

  getCard(id) {
    return this.cards[id];
  }

  addCard(id) {
    if (this.cards[id] !== undefined) {
      this.cards[id].count++;
      var $image = document.createElement('img');
      $image.src = this.cards[id].fullCard;
      $image.style.transform = 'translateX(' + (this.cards[id].count - 1) * 10 + 'px)';
      this.cards[id].desktopElement.appendChild($image);
      this.cards[id].desktopElement.style.width = 182 + (this.cards[id].count - 1) * 10 + 'px';
      this.cards[id].counter.textContent = 'x' + this.cards[id].count;
    } else {
      this.cards[id] = new Card(id);
      if (this === Deck.getActiveDeck()) {
        this.cards[id].render();
      }
    }
    return this.cards[id];
  }

  removeCard(id) {
    this.cards[id].desktopElement.children[this.cards[id].count - 1].remove();
    this.cards[id].count--;
    this.cards[id].desktopElement.style.width = 182 + (this.cards[id].count - 1) * 10 + 'px';
    this.cards[id].counter.textContent = 'x' + this.cards[id].count;
    if (this.cards[id].count <= 0) {
      this.cards[id].desktopElement.remove();
      this.cards[id].element.remove();
      delete this.cards[id];
    }
  }

  serialize() {
    var string = this.name + '|';
    for (var key in this.cards) {
      string += key + '|' + this.cards[key].count + '|';
    }
    return string.replace(' ', '%20');
  }

  renderDeckBoxMobile() {
    var $deckBox = document.createElement('div');
    $deckBox.setAttribute('data-id', this.id);
    $deckBox.className = 'deck';
    var $artCrop = document.createElement('div');
    $artCrop.className = 'art-crop';
    var $image = document.createElement('img');
    $image.src = this.image;
    $artCrop.appendChild($image);
    $deckBox.appendChild($artCrop);
    var $title = document.createElement('h2');
    $deckBox.appendChild($title);
    $title.textContent = this.name;
    var $trashCan = document.createElement('span');
    $trashCan.className = 'material-icons delete-icon';
    $trashCan.setAttribute('data-control', 'delete');
    $trashCan.textContent = 'delete_icon';
    $deckBox.appendChild($trashCan);
    $deckBox.addEventListener('click', function (event) {
      if (event.target.dataset.control === 'delete') {
        $deletingDeckBox = this;
        switchView('delete');
      }
      for (var i = 0; i < $deckContainerDesktop.children.length; i++) {
        $deckContainerDesktop.children[i].id = '';
      }
      this.id = 'active';
      var id = Number.parseInt(this.dataset.id);
      Deck.setActiveDeck(id);
      switchView('cards');
    });
    return $deckBox;
  }

  renderDeckBox() {
    var $deckBox = document.createElement('div');
    $deckBox.setAttribute('data-id', this.id);
    $deckBox.className = 'deck';
    var $artCrop = document.createElement('div');
    $artCrop.className = 'art-crop';
    var $image = document.createElement('img');
    $image.src = this.image;
    $artCrop.appendChild($image);
    $deckBox.appendChild($artCrop);
    var $title = document.createElement('h2');
    $deckBox.appendChild($title);
    $title.textContent = this.name;
    var $trashCan = document.createElement('span');
    $trashCan.className = 'material-icons delete-icon';
    $trashCan.setAttribute('data-control', 'delete');
    $trashCan.textContent = 'delete_icon';
    $deckBox.appendChild($trashCan);
    $deckBox.addEventListener('click', function (event) {
      if (event.target.dataset.control === 'delete') {
        $deletingDeckBox = this;
        switchView('delete');
      }
      for (var i = 0; i < $deckContainerDesktop.children.length; i++) {
        $deckContainerDesktop.children[i].id = '';
      }
      this.id = 'active';
      var id = Number.parseInt(this.dataset.id);
      Deck.setActiveDeck(id);
      if (window.innerWidth > 900) {
        this.scrollIntoView({ alignToTop: true, behavior: 'smooth', block: 'center' });
      }
    });
    this.$deckBox = $deckBox;
  }

  static getQR() {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + window.location.hostname + '/?' + this.getActiveDeck().serialize();
  }

  static loadFromString(string) {
    if (string === undefined || string === null) {
      return;
    }
    var temp = string.replace('%20', ' ');
    var cardData = temp.split('|');
    cardData.pop();
    var deck = new Deck();
    deck.name = cardData[0];
    for (var i = 1; i < cardData.length - 1; i += 2) {
      var count = Number.parseInt(cardData[i + 1]);
      for (var j = 0; j < count; j++) {
        deck.addCard(cardData[i]);
      }
    }
    return deck;
  }

  static getActiveDeck() {
    return data.decks[data.deckIndex];
  }

  static import() {
    var deck = Deck.loadFromString(window.location.search.substring(1));
    return deck;
  }

  static stashDeck(deck) {
    deck.id = data.nextDeckID;
    data.decks.push(deck);
    data.deckIDS.push(deck.id);
    data.deckIndex++;
    data.activeDeck = deck.id;
  }

  static setActiveDeck(id) {
    for (var i = 0; i < data.decks.length; i++) {
      if (data.decks[i].id === id) {
        data.deckIndex = i;
        data.activeDeck = id;
        data.decks[i].render();
        return;
      }
    }
  }

  static delete(id) {
    if (data.deckIndex === 0) {
      return;
    }
    for (var i = 0; i < data.decks.length; i++) {
      if (data.decks[i].id === id) {
        data.decks.splice(i, 1);
        data.deckIDS.splice(data.deck.indexOf(id), 1);
        data.deckIndex--;
        data.activeDeck = data.decks[deckIndex].id;
        data.activeDeck = data.getActiveDeck();
        return;
      }
    }
  }

  static deleteActive() {
    $stackContainer.innerHTML = '';
    $itemContainer.innerHTML = '';
    if (data.decks.length === 1) {
      $deckContainerDesktop.innerHTML = '';
      var deck = data.decks[0];
      localStorage.removeItem(deck.id);
      localStorage.removeItem(deck.id + '_image');
      deck.name = 'New Deck';
      deck.cards = {};
      deck.id = 0;
      data.image = 'images/loader.svg';
      deck.render();
      deck.renderDeckBox();
      $deckContainerDesktop.appendChild(deck.$deckBox);
      deck.$deckBox.id = 'active';
    } else {
      var deck = Deck.getActiveDeck();
      deck.$deckBox.remove();
      localStorage.removeItem(deck.id);
      localStorage.removeItem(deck.id + '_image');
      data.deckIDS.splice(data.deckIDS.indexOf(deck.id), 1);
      data.decks.splice(data.decks.indexOf(deck), 1);
      Deck.setActiveDeck(data.deckIDS[0]);
      Deck.getActiveDeck().render();
      Deck.getActiveDeck().$deckBox.id = 'active';
    }
    switchView('decks');
  }
}
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.scryfall.com/symbology');
xhr.responseType = 'json';
xhr.onload = function () {
  data.symbols = this.response.data;
  LoadDecks();
  Deck.getActiveDeck().$deckBox.id = 'active';
};
xhr.send();

function LoadDecks() {
  var idsJSON = this.localStorage.getItem('deckids');
  var ids = JSON.parse(idsJSON);
  data.activeDeck = JSON.parse(this.localStorage.getItem('activedeck'));
  data.nextDeckID = JSON.parse(this.localStorage.getItem('nextdeckid'));
  if (ids !== null && ids !== undefined) {
    for (var i = 0; i < ids.length; i++) {
      var deckJSON = this.localStorage.getItem(ids[i]);
      var deckString = JSON.parse(deckJSON);
      var deck = Deck.loadFromString(deckString);
      deck.id = ids[i];
      data.decks.push(deck);
    }
    data.deckIDS = ids;
  }
  if (data.decks.length === 0) {
    var deck = new Deck('New Deck');
    data.deckIDS = [0];
    data.decks = [];
    data.deckIndex = 0;
    data.activeDeck = 0;
    data.nextDeckID = 1;
    data.mobileView = 'decks';
    deck.id = 0;
    data.decks.push(deck);
  }
  Deck.setActiveDeck(data.activeDeck);
  xhr.addEventListener('load', function () {
    data.symbols = xhr.response.data;
  });
  for (i = 0; i < data.decks.length; i++) {
    data.decks[i].renderDeckBox();
    $deckContainerDesktop.appendChild(data.decks[i].$deckBox);
  }
  if (window.location.search.indexOf('|') !== -1) {
    var importedDeck = Deck.import();
    importedDeck.id = data.nextDeckID;
    data.deckIDS.push(data.nextDeckID);
    data.decks.push(importedDeck);
    data.nextDeckID++;
    importedDeck.render();
    importedDeck.render();
    data.activeDeck = importedDeck.id;
  }
}

window.addEventListener('beforeunload', function () {
  this.localStorage.setItem('activedeck', data.activeDeck);
  this.localStorage.setItem('nextdeckid', data.nextDeckID);
  this.localStorage.setItem('deckids', JSON.stringify(data.deckIDS));
  for (var i = 0; i < data.decks.length; i++) {
    this.localStorage.setItem(data.decks[i].id + '_image', JSON.stringify(data.decks[i].image));
    this.localStorage.setItem(data.decks[i].id, JSON.stringify(data.decks[i].serialize()));
  }
});
