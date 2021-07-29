/* exported data */
/* exported Deck */
/* exported MajaxCard */
var data = {
  decks: [],
  nextDeckID: 0,
  deckID: 0,
  deckIndex: 0,
  mobileView: 'decks'
};
class Deck {
  constructor(deckName) {
    this.id = data.nextDeckID;
    this.name = deckName;
    this.cards = {};
    data.decks.push(this);
    data.nextDeckID++;
  }

  static setActiveDeck(id) {
    for (var i = 0; i < data.decks.length; i++) {
      if (data.decks[i].id === id) {
        data.deckIndex = i;
        return;
      }
    }
  }

  addCard(id) {
    if (this.cards[id] === undefined) {
      this.cards[id] = 1;
      return;
    }
    this.cards[id]++;
  }
}

data.decks.push(new Deck('Default'));

window.addEventListener('load', function () {
  if (localStorage.getItem('decks')) {
    data.decks = JSON.parse(localStorage.getItem('decks'));
  }
});
