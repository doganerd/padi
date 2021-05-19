namespace display {
  // const socket: WebSocket = new WebSocket("ws://localhost:8000/");
  const socket: WebSocket = new WebSocket(""); // wss://kreko-photo-collector.herokuapp.com/

  // Image Container Element abrufen
  const imageContainer: HTMLImageElement = <HTMLImageElement>document.getElementById("image-container");

  // init array für Images
  const images: HTMLImageElement[] = [];
  const numImages: number = 64;
  let counter: number = 0;

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
    } else {
      // neue Bilder erhalten
      const url: string = URL.createObjectURL(event.data);
      let image: HTMLImageElement = images[counter];

      // Neue Image Elemente generieren wenn nötig
      if (image === undefined) {
        image = <HTMLImageElement>document.createElement("img");
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
}
