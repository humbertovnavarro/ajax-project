/* eslint-disable no-undef */
/* exported data */
let data = {
  symbols: null,
  deckIDS: [0],
  decks: [],
  deckIndex: 0,
  activeDeck: 1,
  nextDeckID: 1,
  mobileView: 'decks'
};
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.scryfall.com/symbology');
xhr.responseType = 'json';
xhr.onload = function () {
  data.symbols = this.response.data;
  LoadDecks();
  Deck.getActiveDeck().$deckBox.id = 'active';
};
xhr.send();

function LoadDecks() {
  let deck = null;
  const idsJSON = this.localStorage.getItem('deckids');
  const ids = JSON.parse(idsJSON);
  data.activeDeck = JSON.parse(this.localStorage.getItem('activedeck'));
  data.nextDeckID = JSON.parse(this.localStorage.getItem('nextdeckid'));
  if (ids !== null && ids !== undefined) {
    for (let i = 0; i < ids.length; i++) {
      const deckJSON = this.localStorage.getItem(ids[i]);
      const deckString = JSON.parse(deckJSON);
      deck = Deck.loadFromString(deckString);
      deck.id = ids[i];
      data.decks.push(deck);
    }
    if (Array.isArray(ids) && ids.length > 0) {
      data.deckIDS = ids;
    }
  }
  if (data.decks.length === 0) {
    deck = new Deck('New Deck');
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
    const importedDeck = Deck.import();
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
  for (let i = 0; i < data.decks.length; i++) {
    this.localStorage.setItem(data.decks[i].id + '_image', JSON.stringify(data.decks[i].image));
    this.localStorage.setItem(data.decks[i].id, JSON.stringify(data.decks[i].serialize()));
  }
});
