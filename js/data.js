/* eslint-disable no-unreachable-loop */
/* exported data */
/* exported Deck */
/* exported Card */
var data = {
  symbols: null,
  decks: [],
  nextDeckID: 0,
  deckID: 0,
  deckIndex: 0,
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
    this.id = id;
    this.count = 1;
    var $cardListItem = document.createElement('div');
    $cardListItem.addEventListener('click', function (event) {
      if (event.target.getAttribute('data-control') === 'up') {
        Deck.getActiveDeck().addCard(this.getAttribute('data-id'));
      }
      if (event.target.getAttribute('data-control') === 'down') {
        Deck.getActiveDeck().removeCard(this.getAttribute('data-id'));
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

    var $cardStackItem = document.createElement('div');
    $cardStackItem.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.25)';
    });
    $cardStackItem.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
    });
    $cardStackItem.setAttribute('data-id', id);
    $cardStackItem.className = 'majax-stack';
    var $stackImage = document.createElement('img');
    $stackImage.src = 'images/loader.gif';
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

  render(itemContainer, stackContainer) {
    itemContainer.appendChild(this.element);
    if (stackContainer) {
      stackContainer.appendChild(this.desktopElement);
    }
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
        $image.src = Card.getSymbol(manaSymbols[i]);
        this.manaContainer.appendChild($image);
      }
    }
    for (i = 0; i < this.desktopElement.children.length; i++) {
      this.desktopElement.children[i].src = this.fullCard;
    }
    this.desktopElement.addEventListener('dblclick', function (event) {
      if (event.target.getAttribute('data-control')) {
        return;
      }
      $infoModal.classList.remove('hidden');
      $infoModal.children[0].src = Deck.getActiveDeck().cards[this.getAttribute('data-id')].fullCard;
    });
    this.element.addEventListener('dblclick', function () {
      $infoModal.classList.remove('hidden');
      $infoModal.children[0].src = Deck.getActiveDeck().cards[this.getAttribute('data-id')].fullCard;
    });
  }
}

class Deck {
  constructor(deckName) {
    this.id = data.nextDeckID;
    this.name = deckName;
    this.cards = {};
    data.decks.push(this);
    data.deckIndex = data.decks.length - 1;
    data.nextDeckID++;
  }

  addCard(id) {
    if (this.cards[id] !== undefined) {
      this.cards[id].count++;
      var $image = document.createElement('img');
      $image.src = this.cards[id].fullCard;
      $image.style.transform = 'translateY(' + (this.cards[id].count - 1) * 10 + 'px)';
      this.cards[id].desktopElement.appendChild($image);
      this.cards[id].desktopElement.style.height = 256 + (this.cards[id].count - 1) * 10 + 'px';
      this.cards[id].counter.textContent = 'x' + this.cards[id].count;
    } else {
      this.cards[id] = new Card(id);
    }
    return this.cards[id];
  }

  removeCard(id) {
    this.cards[id].desktopElement.children[this.cards[id].count - 1].remove();
    this.cards[id].count--;
    this.cards[id].desktopElement.style.height = 256 + (this.cards[id].count - 1) * 10 + 'px';
    this.cards[id].counter.textContent = 'x' + this.cards[id].count;
    if (this.cards[id].count <= 0) {
      this.cards[id].desktopElement.remove();
      this.cards[id].element.remove();
    }
  }

  static getActiveDeck() {

    return data.decks[data.deckIndex];
  }

  static setActiveDeck(id) {
    for (var i = 0; i < data.decks.length; i++) {
      if (data.decks[i].id === id) {
        data.deckIndex = i;
      }
      return this.getActiveDeck();
    }
  }
}

window.addEventListener('load', function () {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.scryfall.com/symbology');
  xhr.responseType = 'json';
  xhr.send();
  xhr.addEventListener('load', function () {
    data.symbols = xhr.response.data;
  });
});
