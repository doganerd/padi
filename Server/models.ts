import { randomUUID } from "crypto";
import * as WebSocket from "ws";

export class Table {
    constructor(name: string) {
        this.name = name;
        this.cards = [];
        this.gameEnded = false;
        this.cardStates = [];
    }
    name: string;
    cards: Card[];
    cardStates: CardState[];
    player1: Player;
    player2: Player;
    openCard1: string;
    openCard2: string;
    gameEnded: boolean;


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

            } else {
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


    getCurrentPlayer(): Player | null {
        if (this.player1?.turn) {
            return this.player1;
        }

        if (this.player2?.turn) {
            return this.player2;
        }

        return null;
    }


    removeCard(id: string) {
        let cardState = this.cardStates.find(state => state.id === id);
        if (cardState) {
            cardState.state = false;
        }
    }

    getOtherPlayer(): Player | null {
        if (!this.player1?.turn) {
            return this.player1;
        }

        if (!this.player2?.turn) {
            return this.player2;
        }

        return null;
    }

    checkEnd(): boolean {
        return !this.cardStates.find(state => state.state);
    }

}

//Message
export class Message {
    constructor() {
    }
    key: MESSAGE_KEY;
    data: any;
}


export class CardState {
    constructor(id: string) {
        this.id = id;
        this.state = true;
    }
    id: string;
    //true- still in game; false- gone
    state: boolean;

}







export enum MESSAGE_KEY {
    NEW_TABLE = "NEW_TABLE",
    PLAYER_ADDED = "PLAYER_ADDED",
    ADD_PICTURE = "ADD_PICTURE",
    START_FOTO_UPLOAD = 'START_FOTO_UPLOAD',
    START_GAME = 'START_GAME',
    PICTURES_RECEIVED = "PICTURES_RECEIVED",
    PLAY = "PLAY",
    FOUND_PAIR = "FOUND_PAIR",
    FAILED = "FAILED",
    OPEN = "OPEN",
    UPDATE = "UPDATE",
    GAME_OVER = "GAME_OVER"
}

export enum GAME_OVER {
    WIN = "WIN",
    LOSS = "LOSS",
    DRAW = "DRAW"

}

export class Connection {
    constructor(socket: WebSocket) {
        this.id = randomUUID();
        this.socket = socket;
    }

    id: string;
    socket: WebSocket;
}


export class Player {

    constructor(type: PLAYER_TYPE, connectionId: string) {
        this.type = type;
        this.score = 0;
        this.connectionId = connectionId;
    }

    connectionId: string;
    id: string;
    type: PLAYER_TYPE;
    turn: boolean;
    score: number;
}

export enum PLAYER_TYPE {
    P1 = "P1",
    P2 = "P2"
}

export class Card {
    constructor(photo: string) {
        this.id = randomUUID();
        this.photo = photo;
    }
    id: string;
    photo: string;

}
