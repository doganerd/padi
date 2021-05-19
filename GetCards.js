"use strict";
var display;
(function (display) {
    // const socket: WebSocket = new WebSocket("ws://localhost:8000/");
    const socket = new WebSocket(""); // wss://kreko-photo-collector.herokuapp.com/
    // Image Container Element abrufen
    const imageContainer = document.getElementById("image-container");
    // init array für Images
    const images = [];
    const numImages = 64;
    let counter = 0;
    // set socket binary type to blob
    socket.binaryType = "blob";
    // listen für connection open
    socket.addEventListener("open", () => {
        socket.send("display");
    });
    // listen für Nachricht vom Server
    socket.addEventListener("message", (event) => {
        if (event.data === "clear") {
            // Alle Bilder löschen
            imageContainer.innerHTML = "";
            images.length = 0;
            counter = 0;
        }
        else {
            // neue Bilder erhalten
            const url = URL.createObjectURL(event.data);
            let image = images[counter];
            // Neue Image Elemente generieren wenn nötig
            if (image === undefined) {
                image = document.createElement("img");
                image.style.width = "12%"; // 8 images per row (12% + 0.25% + 0.25% = 12.5%)
                image.style.margin = "0.25%";
                imageContainer.appendChild(image);
                images[counter] = image;
            }
            // set image
            image.setAttribute("src", url);
            // weiter zum nächsten Image index
            counter = (counter + 1) % numImages;
        }
    });
})(display || (display = {}));
//# sourceMappingURL=GetCards.js.map