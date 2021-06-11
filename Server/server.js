"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const models_1 = require("./models");
// get port from shell or set default (8000)
const port = Number(1234);
const MAX_PICTURES = 4;
console.log("Server starting");
// list of tables
let tableList = [];
// list of connected sockets
const clientSockets = [];
// create WebSocket server
const server = new WebSocket.Server({ port: port });
server.on("connection", (socket) => {
    console.log("Connected");
    // add socket to connection list
    const connection = new models_1.Connection(socket);
    clientSockets.push(connection);
    //
    let table;
    socket.on("message", (message) => {
        //console.log(message);
        const clientMessage = JSON.parse(message);
        switch (clientMessage.key) {
            case models_1.MESSAGE_KEY.NEW_TABLE:
                if (!clientMessage.data?.tableName) {
                    sendError(connection);
                    break;
                }
                table = tableList.find(table => table.name === clientMessage.data.tableName);
                if (table) { // table already exist --> must be player2
                    if (table && !table.player2) {
                        const player2 = new models_1.Player(models_1.PLAYER_TYPE.P2, connection.id);
                        table.player2 = player2;
                        message = new models_1.Message();
                        message.key = models_1.MESSAGE_KEY.PLAYER_ADDED;
                        message.data = {
                            tableName: table.name,
                            player: models_1.PLAYER_TYPE.P2
                        };
                        sendMessage(message, connection);
                        sendStartFotoUpload(table.player1.connectionId, table.player2.connectionId);
                    }
                    else {
                        sendError(connection);
                        break;
                    }
                }
                else {
                    //create new table
                    console.log("TABLE INITIALISIERT");
                    table = new models_1.Table(clientMessage.data.tableName);
                    let player = new models_1.Player(models_1.PLAYER_TYPE.P1, connection.id);
                    table.player1 = player;
                    tableList.push(table);
                    console.log(table.name);
                    message = new models_1.Message();
                    message.key = models_1.MESSAGE_KEY.PLAYER_ADDED;
                    message.data = {
                        tableName: table.name,
                        player: models_1.PLAYER_TYPE.P1
                    };
                    sendMessage(message, connection);
                }
                break;
            case models_1.MESSAGE_KEY.ADD_PICTURE:
                // add Pictures to table
                //console.log(clientMessage.data.picture);
                if (clientMessage.data?.picture) {
                    let cardToAdd = new models_1.Card(clientMessage.data.picture);
                    table.cards.push(cardToAdd);
                    let cardToAdd2 = new models_1.Card(clientMessage.data.picture);
                    table.cards.push(cardToAdd2);
                    if (table.cards.length >= MAX_PICTURES) {
                        startGame(table);
                    }
                }
                else {
                    sendError(connection);
                    break;
                }
                break;
            case models_1.MESSAGE_KEY.PLAY:
                if (validTurn(table, connection.id)) {
                    let connection1 = getConnectionById(table.player1.connectionId);
                    let connection2 = getConnectionById(table.player2.connectionId);
                    if (connection1 && connection2) {
                        if (!table.openCard1) { //first card
                            const selectedCard = table.cards.find(photo => photo.id === clientMessage.data.cardId);
                            if (selectedCard) {
                                table.openCard1 = selectedCard.id;
                                sendOpenCard(table.openCard1, connection1, connection2);
                            }
                            else {
                                sendError(connection);
                                break;
                            }
                        }
                        else if (!table.openCard2) { // second card
                            const selectedCard = table.cards.find(photo => photo.id === clientMessage.data.cardId);
                            if (selectedCard) {
                                table.openCard2 = selectedCard.id;
                                sendOpenCard(table.openCard2, connection1, connection2);
                            }
                            else {
                                sendError(connection);
                                break;
                            }
                            //evaluate the two open cards
                            table.evaluatePlayMove();
                            setTimeout(() => {
                                if (table.gameEnded) { //check whether game ended
                                    sendUpdate(table, connection1, connection2);
                                    sendGameOver(table, connection1, connection2);
                                    closeTable(table, connection1, connection2);
                                }
                                else { // send update
                                    sendUpdate(table, connection1, connection2);
                                }
                            }, 1300);
                        }
                    }
                    else {
                        sendError(connection);
                    }
                }
                break;
            default:
                break;
        }
    });
    socket.on("close", () => {
        //TODO delete from table???
        // clientSockets.pop(socket);
    });
});
function sendError(connection) {
    //TODO
    console.log("Error occurred");
}
function sendOpenCard(cardId, connection1, connection2) {
    console.log("sendOpenCard");
    let message = new models_1.Message();
    message.key = models_1.MESSAGE_KEY.OPEN;
    message.data = {
        cardId: cardId
    };
    //inform clients to open the right card
    sendMessage(message, connection1);
    sendMessage(message, connection2);
}
function sendGameOver(table, connection1, connection2) {
    //TODO;
    console.log("Game over");
    let gameOverMessageP1 = new models_1.Message();
    gameOverMessageP1.key = models_1.MESSAGE_KEY.GAME_OVER;
    let gameOverMessageP2 = new models_1.Message();
    gameOverMessageP2.key = models_1.MESSAGE_KEY.GAME_OVER;
    if (table.player1.score > table.player2.score) {
        //P1 won
        gameOverMessageP1.data = {
            result: models_1.GAME_OVER.WIN
        };
        gameOverMessageP2.data = {
            result: models_1.GAME_OVER.LOSS
        };
    }
    else if (table.player1.score < table.player2.score) {
        //P2 won
        gameOverMessageP1.data = {
            result: models_1.GAME_OVER.LOSS
        };
        gameOverMessageP2.data = {
            result: models_1.GAME_OVER.WIN
        };
    }
    else if (table.player1.score === table.player2.score) {
        //draw
        gameOverMessageP1.data = {
            result: models_1.GAME_OVER.DRAW
        };
        gameOverMessageP2.data = {
            result: models_1.GAME_OVER.DRAW
        };
    }
    sendMessage(gameOverMessageP1, connection1);
    sendMessage(gameOverMessageP2, connection2);
}
function sendUpdate(table, connection1, connection2) {
    console.log("sendUpdate", table.player1, table.player2);
    let updateMessagePlayer1 = new models_1.Message();
    updateMessagePlayer1.key = models_1.MESSAGE_KEY.UPDATE;
    updateMessagePlayer1.data = {
        cardStates: table.cardStates,
        count: {
            p1: table.player1.score,
            p2: table.player2.score
        },
        turn: table.player1.turn
    };
    let updateMessagePlayer2 = new models_1.Message();
    updateMessagePlayer2.key = models_1.MESSAGE_KEY.UPDATE;
    updateMessagePlayer2.data = {
        cardStates: table.cardStates,
        count: {
            p1: table.player1.score,
            p2: table.player2.score
        },
        turn: table.player2.turn
    };
    sendMessage(updateMessagePlayer1, connection1);
    sendMessage(updateMessagePlayer2, connection2);
}
function closeTable(table, connection1, connection2) {
    connection1.socket.close();
    connection2.socket.close();
    tableList.splice(tableList.findIndex(t => t.name === table.name), 1);
}
function validTurn(table, connectionId) {
    let player;
    if (table.player1.connectionId === connectionId) {
        player = table.player1;
    }
    else if (table.player2.connectionId === connectionId) {
        player = table.player2;
    }
    else {
        return false;
    }
    return player.turn;
}
function startGame(table) {
    table.mixCards();
    table.generateStates();
    table.player1.turn = true;
    table.player2.turn = false;
    let connection1 = getConnectionById(table.player1.connectionId);
    let connection2 = getConnectionById(table.player2.connectionId);
    let startMessage = new models_1.Message();
    startMessage.key = models_1.MESSAGE_KEY.START_GAME;
    startMessage.data = {
        cards: table.cards
    };
    if (connection1 && connection2) {
        sendMessage(startMessage, connection1);
        sendMessage(startMessage, connection2);
        sendUpdate(table, connection1, connection2);
    }
}
function sendMessage(message, connection) {
    console.log("Send", message.key);
    const messageString = JSON.stringify(message);
    connection.socket.send(messageString);
}
function sendStartFotoUpload(connection1, connection2) {
    console.log("sendStartFotoUpload");
    let message = new models_1.Message();
    message.key = models_1.MESSAGE_KEY.START_FOTO_UPLOAD;
    const player1Connection = getConnectionById(connection1);
    const player2Connection = getConnectionById(connection2);
    if (player1Connection) {
        sendMessage(message, player1Connection);
    }
    if (player2Connection) {
        sendMessage(message, player2Connection);
    }
}
function getConnectionById(id) {
    const index = clientSockets.findIndex(connection => connection.id === id);
    if (index >= 0) {
        return clientSockets[index];
    }
    else {
        return null;
    }
}
//# sourceMappingURL=server.js.map