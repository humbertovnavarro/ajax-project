/* eslint-disable no-undef */
/* exported Deck */
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
    for (const key in this.cards) {
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
      const $image = document.createElement('img');
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
    let string = this.name + '|';
    for (const key in this.cards) {
      string += key + '|' + this.cards[key].count + '|';
    }
    return string.replace(' ', '%20');
  }

  renderDeckBoxMobile() {
    const $deckBox = document.createElement('button');
    $deckBox.setAttribute('data-id', this.id);
    $deckBox.className = 'deck';
    const $row = document.createElement('div');
    $row.className = 'row';
    const $col1 = document.createElement('div');
    $deckBox.appendChild($col1);
    $col1.className = 'column-half-mobile';
    const $col1row = document.createElement('div');
    $col1.appendChild($col1row);
    $col1row.className = 'row item-center';

    const $artCrop = document.createElement('div');
    $artCrop.className = 'art-crop';
    const $image = document.createElement('img');
    $image.src = this.image;
    $artCrop.appendChild($image);

    const $title = document.createElement('h2');
    $title.textContent = this.name;

    $col1row.appendChild($artCrop);
    $col1row.appendChild($title);

    const $col2 = document.createElement('div');
    $deckBox.appendChild($col2);
    $col2.className = 'column-half-mobile';
    const $col2row = document.createElement('row');
    $col2.appendChild($col2row);
    $col2row.className = 'row vertical-center flex-end';

    const $trashCan = document.createElement('button');
    $trashCan.className = 'material-icons delete-icon';
    $trashCan.setAttribute('data-control', 'delete');
    $trashCan.textContent = 'delete_icon';
    $col2row.appendChild($trashCan);

    $deckBox.addEventListener('click', function (event) {
      if (event.target.dataset.control === 'delete') {
        $deletingDeckBox = this;
        switchView('delete');
      }
      for (let i = 0; i < $deckContainerDesktop.children.length; i++) {
        $deckContainerDesktop.children[i].id = '';
      }
      this.id = 'active';
      const id = Number.parseInt(this.dataset.id);
      Deck.setActiveDeck(id);
      switchView('cards');
    });
    return $deckBox;
  }

  renderDeckBox() {
    const $deckBox = document.createElement('div');
    $deckBox.setAttribute('data-id', this.id);
    $deckBox.className = 'deck';
    const $artCrop = document.createElement('div');
    $artCrop.className = 'art-crop';
    const $image = document.createElement('img');
    $image.src = this.image;
    $artCrop.appendChild($image);
    $deckBox.appendChild($artCrop);
    const $title = document.createElement('h2');
    $deckBox.appendChild($title);
    $title.textContent = this.name;
    const $trashCan = document.createElement('button');
    $trashCan.className = 'material-icons delete-icon';
    $trashCan.setAttribute('data-control', 'delete');
    $trashCan.textContent = 'delete_icon';
    $deckBox.appendChild($trashCan);
    $deckBox.addEventListener('click', function (event) {
      if (event.target.dataset.control === 'delete') {
        $deletingDeckBox = this;
        switchView('delete');
      }
      for (let i = 0; i < $deckContainerDesktop.children.length; i++) {
        $deckContainerDesktop.children[i].id = '';
      }
      this.id = 'active';
      const id = Number.parseInt(this.dataset.id);
      Deck.setActiveDeck(id);
      if (window.innerWidth > 900) {
        this.scrollIntoView({ alignToTop: true, behavior: 'smooth', block: 'center' });
      }
    });
    this.$deckBox = $deckBox;
  }

  static getQR() {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='
    + window.location.hostname
    + '/?'
    + this.getActiveDeck().serialize();
  }

  static loadFromString(string) {
    if (string === undefined || string === null) {
      return;
    }
    const temp = string.replace('%20', ' ');
    const cardData = temp.split('|');
    cardData.pop();
    const deck = new Deck();
    deck.name = cardData[0];
    for (let i = 1; i < cardData.length - 1; i += 2) {
      const count = Number.parseInt(cardData[i + 1]);
      for (let j = 0; j < count; j++) {
        deck.addCard(cardData[i]);
      }
    }
    return deck;
  }

  static getActiveDeck() {
    return data.decks[data.deckIndex];
  }

  static import() {
    const deck = Deck.loadFromString(window.location.search.substring(1));
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
    for (let i = 0; i < data.decks.length; i++) {
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
    for (let i = 0; i < data.decks.length; i++) {
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
    let deck = null;
    $stackContainer.innerHTML = '';
    $itemContainer.innerHTML = '';
    if (data.decks.length === 1) {
      $deckContainerDesktop.innerHTML = '';
      deck = data.decks[0];
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
      deck = Deck.getActiveDeck();
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
