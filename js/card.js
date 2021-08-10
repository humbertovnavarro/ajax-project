/* exported Card */
class Card {
  static getSymbol(string) {
    for (let i = 0; i < data.symbols.length; i++) {
      if (data.symbols[i].symbol === string) {
        return data.symbols[i].svg_uri;
      }
    }
  }

  constructor(id) {
    this.count = 1;
    const $cardListItem = document.createElement('div');
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
    const $buttonBox = document.createElement('div');
    const $up = document.createElement('button');
    const $down = document.createElement('button');
    const $upIcon = document.createElement('span');
    const $downIcon = document.createElement('span');
    $downIcon.setAttribute('data-control', 'down');
    $upIcon.setAttribute('data-control', 'up');
    $downIcon.className = 'material-icons';
    $upIcon.className = 'material-icons';
    $upIcon.textContent = 'expand_less';
    $downIcon.textContent = 'expand_more';
    $up.appendChild($upIcon);
    $down.appendChild($downIcon);
    $buttonBox.appendChild($up);
    const $span = document.createElement('span');
    $span.textContent = 'x1';
    this.counter = $span;
    $buttonBox.appendChild($span);
    $buttonBox.appendChild($down);
    $cardListItem.appendChild($buttonBox);
    const $artCrop = document.createElement('div');
    $artCrop.className = 'art-crop';
    const $image = document.createElement('img');
    $image.src = 'images/loaderblack.svg';
    $artCrop.appendChild($image);
    $cardListItem.appendChild($artCrop);
    const $name = document.createElement('p');
    $cardListItem.appendChild($name);
    const $manaContainer = document.createElement('div');
    $manaContainer.className = 'mana-container';
    $cardListItem.appendChild($manaContainer);
    this.element = $cardListItem;
    this.name = $name;
    this.image = $image;
    this.manaContainer = $manaContainer;
    this.fullCard = 'images/loaderblack.svg';
    const $cardStackItem = document.createElement('div');
    $cardStackItem.setAttribute('data-id', id);
    $cardStackItem.className = 'majax-stack';
    const $stackImage = document.createElement('img');
    $stackImage.src = 'images/loaderblack.svg';
    $cardStackItem.appendChild($stackImage);
    this.desktopElement = $cardStackItem;

    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', 'https://api.scryfall.com/cards/' + id);
    this.xhr.responseType = 'json';
    this.xhr.onload = () => {
      this.onload();
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
    const manaSymbols = [];
    if (this.xhr.response.mana_cost !== undefined) {
      const manaString = this.xhr.response.mana_cost;
      for (let i = 0; i < manaString.length; i++) {
        if (manaString[i] === '{') {
          manaSymbols.push(manaString.substring(i, manaString.indexOf('}', i) + 1));
        }
      }
      for (i = 0; i < manaSymbols.length; i++) {
        const $image = document.createElement('img');
        $image.className = 'mana-symbol';
        const source = Card.getSymbol(manaSymbols[i]);
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
          const deck = Deck.getActiveDeck();
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
