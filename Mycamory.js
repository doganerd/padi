"use strict";
//Aufbau immer so bitte! : DOM, eventListener, alle Variablen benennen, alle Funtionen
var Aufg3Memory;
(function (Aufg3Memory) {
    document.addEventListener("DOMContentLoaded", main);
    // Variablen deklarieren ***************************
    let cardContent = ["Tetris", "Pong", "Mario", "Zelda", "Minecraft", "Sims", "Portal", "SimCity", "Sonic", "Assassins Creed"];
    let cardArray = []; //Divs für Karten, leeres Array, in das die letztendlich für das Spiel benötigten Karten als divs hineingespeichert werden
    // let openArray: string[] = [];     //leeres Array um später den karteninhalt vergleichen zu können
    let openCards = 0; //später hochzählen, wie viele karten offen sind um nicht mehr als 2 karten offen zu haben
    let numPairs;
    let numPlayers;
    let name = "Spieler ";
    let score = 0;
    let playerInfo;
    let cardField;
    // Hauptfunktion *******************************
    function main() {
        numPairs = parseInt(prompt("Bitte Anzahl Kartenpaare eingeben (5 bis 10)", "7"), 10);
        if (numPairs < 5 || numPairs > 10) {
            numPairs = 8;
        } //Pop-up abfrage kartenpaare
        numPlayers = parseInt(prompt("Bitte Anzahl der Spieler eingeben (1 bis 4)", "2"), 10);
        numPlayers > 4 ? numPlayers = 4 : numPlayers = numPlayers; //Pop-up spielerzahl
        playerInfo = document.getElementById("player-info"); // DOM abhängige Varaiblen deklarieren
        cardField = document.getElementById("card-div");
        // Spielkarten erzeugen
        for (let i = 0; i < numPairs; i++) {
            createCard(cardContent[i]);
            // cardContent an der Stelle i - wird als übergabeparameter mitgegeben
            createCard(cardContent[i]);
            // cardContent an der Stelle i - wird als übergabeparameter mitgegeben
        }
        //Spielerinfo erzeugen
        for (let i = 0; i < numPlayers; i++) {
            createPlayer(score, name + [i + 1]);
        }
        // Karten mischen
        randomMix(cardArray);
        // Karten dem Spielbrett hinzufügen
        for (let i = 0; i < cardArray.length; i++) {
            cardField.appendChild(cardArray[i]);
            // dem Spielbrett hinzufügen
        }
        cardField.addEventListener("click", clickHandler);
    }
    // Funktionen ***************************************************
    function createPlayer(_score, _name) {
        //div für anzeige pro spieler
        let player = document.createElement("div");
        //div für spieler
        let scoreField = document.createElement("div");
        //div für Punktzahl
        let n = _score.toString(); //.toString wandelt number in string um
        player.innerText = _name;
        scoreField.innerText = n; //score ist die number n als string
        playerInfo.appendChild(player); //spieler in die playerinfo anhängen
        playerInfo.appendChild(scoreField); //score in die playerinfo anhängen
    }
    function createCard(_textDerAufDieKarteSoll) {
        let card = document.createElement("div");
        // div erzeugen
        card.innerHTML = `<span>${_textDerAufDieKarteSoll}</span>`; //Funktion wird auf die Karte gegeben
        // Text aus dem Array soll auf eine Karte
        card.setAttribute("class", "card hidden");
        // Attribut hinzufügen: class = Welches Attribut (hier eine Klasse); card = zugehöriger Wert (Hidden, taken, open)
        cardArray.push(card);
        // cardArray = Array vom Anfang; Speicher für alle erzeugten Karten; pusht die Karte hoch
    }
    function randomMix(_array) {
        // _array = das Array, das durchmischt werden soll
        for (let i = _array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [_array[i], _array[j]] = [_array[j], _array[i]];
        }
        return _array;
        // Ausgabe = das Array ist jetzt durchmischt
    }
    // Spielbarkeit *************************************************
    function clickHandler(_event) {
        console.log("ClickHandler aktiviert");
        let cardClass = _event.target; //auf das HTML element zugreifen, dass das event auslöst
        if (cardClass.classList.contains("card")) { //.classList gibt die Klasse zurück
            // console.log("ClickHandler - Klasse enthaelt card = true");
            if (cardClass.classList.contains("hidden")) {
                openCards++;
                //wenn Klasse hidden ist, mache das:   
                // console.log("ClickHandler - Klasse Hidden=true => Karte aufgedeckt"); 
                cardClass.classList.remove("hidden"); //remove klasse hidden
                cardClass.classList.add("visible"); //karte visible
                // console.log(cardClass.classList);
            }
        }
        if (openCards == 2) {
            console.log("2 Karten sind offen und werden verglichen");
            setTimeout(compareCards, 1300);
            it;
            itr;
        }
        if (openCards > 2) {
            console.log("2 Karten sind schon offen, keine weitere öffnen");
            cardClass.classList.remove("visible");
            cardClass.classList.add("hidden");
        }
    }
    function compareCards() {
        let openArray = filterCardsByClass("visible");
        if (openArray[0].children[0].innerHTML == openArray[1].children[0].innerHTML) { //Vergleichen von Element 0 und 1 im openArray
            console.log("Die Karten sind gleich");
            for (let p = 0; p < openArray.length; p++) { //als Schleife damit beide Karten als taken deklariert werden
                openArray[p].classList.remove("visible"); //karten als Taken deklarieren
                openArray[p].classList.add("taken");
            }
        }
        else {
            console.log("Karten sind nicht identisch");
            for (let p = 0; p < openArray.length; p++) { //als Schleife damit beide Karten wieder verdeckt werden
                openArray[p].classList.remove("visible"); //karten Verdecken
                openArray[p].classList.add("hidden");
            }
        }
        let cardsTaken = filterCardsByClass("hidden");
        if (cardsTaken.length == 0) {
            console.log("Spiel gewonnen"); //Pop up mit "Win" wenn alle karten Taken sind
            alert("Glueckwunsch! Du hast gewonnen.");
        }
        openArray = []; // Array leeren
        openCards = 0; //zähler auf 0 setzen
    }
    function filterCardsByClass(_visibleFilter) {
        return cardArray.filter(card => card.classList.contains(_visibleFilter));
    }
})(Aufg3Memory || (Aufg3Memory = {})); //Namespace zu
//# sourceMappingURL=Mycamory.js.map