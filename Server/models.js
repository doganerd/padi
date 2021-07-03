"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.PLAYER_TYPE = exports.Player = exports.Connection = exports.GAME_OVER = exports.MESSAGE_KEY = exports.CardState = exports.Message = exports.Table = void 0;
const crypto_1 = require("crypto");
class Table {
    constructor(name) {
        this.gameStarte = false;
        this.name = name;
        this.cards = [];
        this.gameEnded = false;
        this.cardStates = [];
    }
    mixCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this.cards;
    }
    generateStates() {
        for (let card of this.cards) {
            this.cardStates.push(new CardState(card.id));
        }
    }
    evaluatePlayMove() {
        let card1 = this.cards.find(card => card.id === this.openCard1);
        let card2 = this.cards.find(card => card.id === this.openCard2);
        if (card1 && card2) {
            if (card1.photo === card2.photo) {
                let currentPlayer = this.getCurrentPlayer();
                if (currentPlayer) {
                    currentPlayer.score++;
                }
                this.removeCard(card1.id);
                this.removeCard(card2.id);
                if (this.checkEnd()) {
                    this.gameEnded = true;
                }
            }
            else {
                let currentPlayer = this.getCurrentPlayer();
                let otherPlayer = this.getOtherPlayer();
                if (currentPlayer) {
                    currentPlayer.turn = false;
                }
                if (otherPlayer) {
                    otherPlayer.turn = true;
                }
            }
            this.openCard1 = '';
            this.openCard2 = '';
        }
    }
    getCurrentPlayer() {
        if (this.player1?.turn) {
            return this.player1;
        }
        if (this.player2?.turn) {
            return this.player2;
        }
        return null;
    }
    removeCard(id) {
        let cardState = this.cardStates.find(state => state.id === id);
        if (cardState) {
            cardState.state = false;
        }
    }
    getOtherPlayer() {
        if (!this.player1?.turn) {
            return this.player1;
        }
        if (!this.player2?.turn) {
            return this.player2;
        }
        return null;
    }
    checkEnd() {
        return !this.cardStates.find(state => state.state);
    }
}
exports.Table = Table;
//Message
class Message {
    constructor() {
    }
}
exports.Message = Message;
class CardState {
    constructor(id) {
        this.id = id;
        this.state = true;
    }
}
exports.CardState = CardState;
var MESSAGE_KEY;
(function (MESSAGE_KEY) {
    MESSAGE_KEY["NEW_TABLE"] = "NEW_TABLE";
    MESSAGE_KEY["PLAYER_ADDED"] = "PLAYER_ADDED";
    MESSAGE_KEY["ADD_PICTURE"] = "ADD_PICTURE";
    MESSAGE_KEY["START_FOTO_UPLOAD"] = "START_FOTO_UPLOAD";
    MESSAGE_KEY["START_GAME"] = "START_GAME";
    MESSAGE_KEY["PICTURES_RECEIVED"] = "PICTURES_RECEIVED";
    MESSAGE_KEY["PLAY"] = "PLAY";
    MESSAGE_KEY["FOUND_PAIR"] = "FOUND_PAIR";
    MESSAGE_KEY["FAILED"] = "FAILED";
    MESSAGE_KEY["OPEN"] = "OPEN";
    MESSAGE_KEY["UPDATE"] = "UPDATE";
    MESSAGE_KEY["GAME_OVER"] = "GAME_OVER";
})(MESSAGE_KEY = exports.MESSAGE_KEY || (exports.MESSAGE_KEY = {}));
var GAME_OVER;
(function (GAME_OVER) {
    GAME_OVER["WIN"] = "WIN";
    GAME_OVER["LOSS"] = "LOSS";
    GAME_OVER["DRAW"] = "DRAW";
})(GAME_OVER = exports.GAME_OVER || (exports.GAME_OVER = {}));
class Connection {
    constructor(socket) {
        this.id = crypto_1.randomUUID();
        this.socket = socket;
    }
}
exports.Connection = Connection;
class Player {
    constructor(type, connectionId) {
        this.type = type;
        this.score = 0;
        this.connectionId = connectionId;
    }
}
exports.Player = Player;
var PLAYER_TYPE;
(function (PLAYER_TYPE) {
    PLAYER_TYPE["P1"] = "P1";
    PLAYER_TYPE["P2"] = "P2";
})(PLAYER_TYPE = exports.PLAYER_TYPE || (exports.PLAYER_TYPE = {}));
class Card {
    constructor(photo) {
        this.id = crypto_1.randomUUID();
        this.photo = photo;
    }
}
exports.Card = Card;
//# sourceMappingURL=models.js.map