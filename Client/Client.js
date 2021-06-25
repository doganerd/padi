"use strict";
//Aufbau immer so bitte! : DOM, eventListener, alle Variablen benennen, alle Funtionen
var camory;
(function (camory) {
    let MESSAGE_KEY;
    (function (MESSAGE_KEY) {
        MESSAGE_KEY["UPDATE"] = "UPDATE";
        MESSAGE_KEY["START_FOTO_UPLOAD"] = "START_FOTO_UPLOAD";
        MESSAGE_KEY["OPEN"] = "OPEN";
        MESSAGE_KEY["FAILED"] = "FAILED";
        MESSAGE_KEY["FOUND_PAIR"] = "FOUND_PAIR";
        MESSAGE_KEY["START_GAME"] = "START_GAME";
        MESSAGE_KEY["OPEN_TABLES"] = "OPEN_TABLES";
        MESSAGE_KEY["NEW_TABLE"] = "NEW_TABLE";
        MESSAGE_KEY["JOIN_TABLE"] = "JOIN_TABLE";
        MESSAGE_KEY["ADD_PICTURE"] = "ADD_PICTURE";
        MESSAGE_KEY["TABLE_CREATED"] = "TABLE_CREATED";
        MESSAGE_KEY["PLAY"] = "PLAY";
        MESSAGE_KEY["PLAYER_ADDED"] = "PLAYER_ADDED";
        MESSAGE_KEY["GAME_OVER"] = "GAME_OVER";
    })(MESSAGE_KEY || (MESSAGE_KEY = {}));
    let PLAYER_TYPE;
    (function (PLAYER_TYPE) {
        PLAYER_TYPE["P1"] = "P1";
        PLAYER_TYPE["P2"] = "P2";
    })(PLAYER_TYPE || (PLAYER_TYPE = {}));
    let GAME_OVER;
    (function (GAME_OVER) {
        GAME_OVER["WIN"] = "WIN";
        GAME_OVER["LOSS"] = "LOSS";
        GAME_OVER["DRAW"] = "DRAW";
    })(GAME_OVER = camory.GAME_OVER || (camory.GAME_OVER = {}));
    document.addEventListener("DOMContentLoaded", main);
    let socket; //= new WebSocket("wss://kreko-simple-chat.herokuapp.com/");
    let tableName;
    let player;
    let cards;
    let cardArray = []; //Divs für Karten, leeres Array, in das die letztendlich für das Spiel benötigten Karten als divs hineingespeichert werden
    let openCards = [];
    let turn = false;
    let countPlayer1 = 0;
    let countPlayer2 = 0;
    let startNewGameButton;
    let joinGameButton;
    let tableNameInput;
    let takePictureButton;
    let screenDiv;
    let textDiv;
    let managers = [];
    const imageWidth = 400;
    const imageHeight = 600;
    let image;
    let video;
    let buttonDiv;
    let countDownDiv;
    let canvas;
    let videoWidth = null;
    let videoHeight = null;
    let videoCutX = null;
    let videoCutY = null;
    // create user media manager and assign video element
    let userMediaManager;
    // create start screen and register user media manager
    let startScreen;
    let picturesLeft = 3;
    function main() {
        // socket = new WebSocket("ws://192.168.0.198:8000/");
        socket = new WebSocket("wss://camory.herokuapp.com");
        console.log("Connected to Server");
        socket.addEventListener("message", (event) => checkServerMessage(event));
        createStartElements();
        // adapt canvas and image size to normalized image size
    }
    function createStartElements() {
        startNewGameButton = document.getElementById("startNewGameButton");
        tableNameInput = document.getElementById('tableNameInput');
        startNewGameButton.addEventListener("click", startNewGame);
        tableNameInput.addEventListener('input', onTableNameEnter);
        wait(false);
    }
    function removeCard(id) {
        document.getElementById(id)?.classList.remove('visible');
        document.getElementById(id)?.classList.add('taken');
    }
    function openCard(card2Id) {
        let opencard = document.getElementById(card2Id);
        opencard?.classList.remove('hidden');
        opencard?.classList.add('visible');
        openCards.push(opencard);
    }
    function setTurn(turn) {
        turn = turn;
        if (turn) {
            document.getElementById('turn').innerHTML = "Du bist dran";
        }
        else {
            document.getElementById('turn').innerHTML = "Gegner ist dran";
        }
    }
    function updateCountInView(p1, p2) {
        document.getElementById('player1Count').innerHTML = p1;
        document.getElementById('player2Count').innerHTML = p2;
    }
    function updateGame(state) {
        setTurn(state.turn);
        for (let cardState of state.cardStates) {
            document.getElementById((cardState.id))?.classList.remove('visible');
            document.getElementById((cardState.id))?.classList.add('hidden');
            if (!cardState.state) {
                document.getElementById(cardState.id)?.classList.add('taken');
            }
        }
        updateCountInView(state.count.p1, state.count.p2);
    }
    function checkServerMessage(event) {
        const message = JSON.parse(event.data);
        switch (message.key) {
            case MESSAGE_KEY.PLAYER_ADDED:
                wait(false);
                tableName = message.data?.tableName;
                if (message.data?.player === PLAYER_TYPE.P1) {
                    document.getElementById('playerName').innerHTML = "Du bist Spieler 1";
                }
                if (message.data?.player === PLAYER_TYPE.P2) {
                    document.getElementById('playerName').innerHTML = "Du bist Spieler 2";
                }
                document.getElementById('tableName').innerHTML = "Spieltisch: " + tableName;
                document.getElementById('start-area').remove();
                wait(true);
                break;
            case MESSAGE_KEY.START_FOTO_UPLOAD:
                wait(false);
                activateTakePicture();
                break;
            case MESSAGE_KEY.START_GAME:
                console.log("Start game");
                console.log(message);
                document.getElementById('take-picture-area')?.remove();
                document.getElementById('start-screen')?.remove();
                cards = message.data.cards;
                createField();
                break;
            case MESSAGE_KEY.UPDATE:
                console.log("Update");
                console.log(message);
                if (message.data) {
                    const gameState = message.data;
                    updateGame(gameState);
                }
                break;
            case MESSAGE_KEY.FOUND_PAIR:
                console.log("Found pair");
                openCard(message.data.card2Id);
                removeCard(message.data.card1Id);
                removeCard(message.data.card2Id);
                setTurn(message.data.turn);
                break;
            case MESSAGE_KEY.OPEN:
                console.log("open");
                openCard(message.data.cardId);
                break;
            case MESSAGE_KEY.FAILED:
                for (let card of openCards) {
                    card.classList.remove('visible');
                    card.classList.remove('taken');
                    card.classList.add('hidden');
                }
                setTurn(message.data.turn);
                break;
            case MESSAGE_KEY.GAME_OVER:
                if (message?.data?.result) {
                    showGameOver(message.data.result);
                }
                break;
            default:
                break;
        }
    }
    function showGameOver(result) {
        let element = document.createElement("h1");
        element.classList.add('result-message');
        switch (result) {
            case GAME_OVER.DRAW:
                element.innerHTML = "Unentschieden";
                break;
            case GAME_OVER.WIN:
                element.innerHTML = "Gewonnen";
                break;
            case GAME_OVER.LOSS:
                element.innerHTML = "Verloren";
                break;
            default:
                break;
        }
        document.getElementById('result')?.appendChild(element);
    }
    function sendOpenCard(id) {
        sendToServer(JSON.stringify({ key: MESSAGE_KEY.PLAY, data: { cardId: id } }));
    }
    function clickHandler(_event) {
        console.log("ClickHandler aktiviert");
        let card = _event.target; //auf das HTML element zugreifen, dass das event auslöst
        sendOpenCard(card.id);
        // let cardClass: HTMLElement = <HTMLElement>_event.target;    //auf das HTML element zugreifen, dass das event auslöst
        // console.log(cardClass);
        // if (cardClass.classList.contains("card")) {          //.classList gibt die Klasse zurück
        //
        //     // console.log("ClickHandler - Klasse enthaelt card = true");
        //     if (cardClass.classList.contains("hidden")) {
        //         openCards++;
        //         //wenn Klasse hidden ist, mache das:
        //         // console.log("ClickHandler - Klasse Hidden=true => Karte aufgedeckt");
        //         cardClass.classList.remove("hidden"); //remove klasse hidden
        //         cardClass.classList.add("visible");     //karte visible
        //         // console.log(cardClass.classList);
        //         console.log(cardClass.id);
        //         sendOpenCard(cardClass.id);
        //
        //     }
        //
        // }
        // if (openCards == 2) {
        //     console.log("2 Karten sind offen und werden verglichen");
        //     // setTimeout(compareCards, 1300);
        // }
        //
        // if (openCards > 2) {
        //     console.log("2 Karten sind schon offen, keine weitere öffnen");
        //     cardClass.classList.remove("visible");
        //     cardClass.classList.add("hidden");
        // }
    }
    function createField() {
        // Karten dem Spielbrett hinzufügen
        for (let card of cards) {
            createCard(card);
        }
        let cardField = document.getElementById('card-div');
        if (cardField) {
            for (let i = 0; i < cardArray.length; i++) {
                cardField.appendChild(cardArray[i]);
                // dem Spielbrett hinzufügen
            }
            cardField.addEventListener("click", clickHandler);
        }
    }
    function startNewGame() {
        if (tableNameInput.value) {
            let clientMessage = { key: MESSAGE_KEY.NEW_TABLE, data: { tableName: tableNameInput.value } };
            sendToServer(JSON.stringify(clientMessage));
        }
    }
    function onTableNameEnter() {
        console.log("on table enter");
        if (tableNameInput.value) {
            startNewGameButton.disabled = false;
        }
        else {
            startNewGameButton.disabled = true;
        }
    }
    let countDown = 10;
    function takePicture() {
        const context = canvas.getContext("2d");
        // copy video image into canvas
        context.drawImage(video, videoCutX, videoCutY, videoWidth - 2 * videoCutX, videoHeight - 2 * videoCutY, 0, 0, imageWidth, imageHeight);
        // generate data URL for local image display
        const srcDataUrl = canvas.toDataURL("image/png");
        image.setAttribute("src", srcDataUrl);
        // convert canvas image to jpeg blob
        //canvas.toBlob((blob) => socket.send(blob), "image/jpeg");
        // hide video and show image
        video.classList.add("hide");
        buttonDiv.classList.add("hide");
        image.classList.remove("hide");
        // make image flash when taking photo
        image.style.filter = "brightness(2)";
        setTimeout(() => image.style.filter = "none", 120);
        // start count down blocking interaction
        countDown = 3;
        doCountDown();
        let clientMessage = { key: MESSAGE_KEY.ADD_PICTURE, data: { picture: srcDataUrl } };
        sendToServer(JSON.stringify(clientMessage));
    }
    // generate count down with recursive calls to setTimeout
    function doCountDown() {
        console.log(countDown);
        if (countDown > 0) {
            countDownDiv.innerHTML = countDown.toString();
            setTimeout(doCountDown, 1000);
        }
        else {
            countDownDiv.innerHTML = "";
            resetVideo();
        }
        countDown--;
    }
    // return to live video display
    function resetVideo() {
        // hide image and show video
        image.classList.add("hide");
        video.classList.remove("hide");
        buttonDiv.classList.remove("hide");
    }
    function activateTakePicture() {
        console.log("here");
        image = document.getElementById("image");
        video = document.getElementById("video");
        buttonDiv = document.getElementById("cameraButton");
        buttonDiv.classList.remove("hide");
        countDownDiv = document.getElementById("countdown");
        canvas = document.createElement("canvas");
        canvas.width = image.width = imageWidth;
        canvas.height = image.height = imageHeight;
        // create user media manager and assign video element
        const userMediaManager = new MediaManager({ video: true, audio: false });
        userMediaManager.videoElement = video;
        //create start screen and register user media manager
        startScreen = new StartScreen("start-screen");
        startScreen.addResourceManager(userMediaManager);
        //start (creates audio context )
        startScreen.start().then(() => {
            video.play().then(() => {
                adaptElements();
                window.addEventListener("resize", adaptElements);
                //document.getElementById('takePictureButton')?.addEventListener("click", takePicture);
                buttonDiv.addEventListener("click", takePicture);
            });
        });
    }
    function createCard(card) {
        let cardElement = document.createElement("div");
        cardElement.id = card.id;
        let imageElement = document.createElement("img");
        imageElement.src = card.photo;
        // div erzeugen
        cardElement.appendChild(imageElement);
        //card.innerHTML = `<span>${_textDerAufDieKarteSoll}</span>`; //Funktion wird auf die Karte gegeben
        // Text aus dem Array soll auf eine Karte
        cardElement.setAttribute("class", "card hidden");
        // Attribut hinzufügen: class = Welches Attribut (hier eine Klasse); card = zugehöriger Wert (Hidden, taken, open)
        cardArray.push(cardElement);
        // cardArray = Array vom Anfang; Speicher für alle erzeugten Karten; pusht die Karte hoch
    }
    function sendToServer(message) {
        socket.send(message);
    }
    function wait(wait) {
        if (wait) {
            document.getElementById('wait').classList.remove('none');
        }
        else {
            document.getElementById('wait').classList.add('none');
        }
    }
    // adapt video element to current screen size
    function adaptElements() {
        const rect = document.body.getBoundingClientRect();
        const screenWidth = rect.width;
        const screenHeight = rect.height;
        // set size and position of image and frame on screen
        const scaleImageWidthToScreen = screenWidth / imageWidth;
        const scaleImageHeightToScreen = screenHeight / imageHeight;
        const scaleImageToScreen = Math.min(scaleImageWidthToScreen, scaleImageHeightToScreen);
        const imageScreenWidth = Math.floor(imageWidth * scaleImageToScreen + 0.5);
        const imageScreenHeight = Math.floor(imageHeight * scaleImageToScreen + 0.5);
        const imageScreenOffsetX = Math.max(0, Math.floor(0.5 * (screenWidth - imageScreenWidth) + 0.5));
        const imageScreenOffsetY = Math.max(0, Math.floor(0.5 * (screenHeight - imageScreenHeight) + 0.5));
        image.width = imageScreenWidth;
        image.height = imageScreenHeight;
        image.style.left = `${imageScreenOffsetX}px`;
        image.style.bottom = `${imageScreenOffsetY}px`;
        // update video size
        videoWidth = video.videoWidth;
        videoHeight = video.videoHeight;
        // set size and position of video on screen
        const scaleVideoWidthToScreen = imageScreenWidth / videoWidth;
        const scaleVideoHeightToScreen = imageScreenHeight / videoHeight;
        const scaleVideoToScreen = Math.max(scaleVideoWidthToScreen, scaleVideoHeightToScreen);
        const videoScreenWidth = Math.floor(videoWidth * scaleVideoToScreen + 0.5);
        const videoScreenHeight = Math.floor(videoHeight * scaleVideoToScreen + 0.5);
        const videoScreenOffsetX = Math.floor(0.5 * (screenWidth - videoScreenWidth) + 0.5);
        const videoScreenOffsetY = Math.floor(0.5 * (screenHeight - videoScreenHeight) + 0.5);
        video.style.width = `${videoScreenWidth}px`;
        video.style.height = `${videoScreenHeight}px`;
        video.style.left = `${videoScreenOffsetX}px`;
        video.style.bottom = `${videoScreenOffsetY}px`;
        // set video cutting to image size
        const scaleImageWidthToVideo = videoWidth / imageWidth;
        const scaleImageHeightToVideo = videoHeight / imageHeight;
        const scaleVideoToImage = Math.min(scaleImageWidthToVideo, scaleImageHeightToVideo);
        const imageVideoWidth = Math.floor(imageWidth * scaleVideoToImage + 0.5);
        const imageVideoHeight = Math.floor(imageHeight * scaleVideoToImage + 0.5);
        videoCutX = Math.max(0, Math.floor(0.5 * (videoWidth - imageVideoWidth) + 0.5));
        videoCutY = Math.max(0, Math.floor(0.5 * (videoHeight - imageVideoHeight) + 0.5));
    }
})(camory || (camory = {})); //Namespace zu
//# sourceMappingURL=Client.js.map