namespace client {
    // const socket: WebSocket = new WebSocket("ws://localhost:8000/");
    const socket: WebSocket = new WebSocket("wss://kreko-photo-collector.herokuapp.com/");
  
    const imageWidth: number = 400;
    const imageHeight: number = 600;
    const video: HTMLVideoElement = <HTMLVideoElement>document.getElementById("video");
    const image: HTMLImageElement = <HTMLImageElement>document.getElementById("image");
    const frameDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("frame");
    const buttonDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("button");
    const countDownDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("countdown");
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    let videoWidth: number = null;
    let videoHeight: number = null;
    let videoCutX: number = null;
    let videoCutY: number = null;
  
    // adapt canvas and image size to normalized image size 
    canvas.width = image.width = imageWidth;
    canvas.height = image.height = imageHeight;
  
    // create user media manager and assign video element
    const userMediaManager: UserMediaManager = new UserMediaManager({ video: true, audio: false });
    userMediaManager.videoElement = video;
  
    // create start screen and register user media manager
    const startScreen: StartScreen = new StartScreen("start-screen");
    startScreen.addResourceManager(userMediaManager);
  
    // start (creates audio context )
    startScreen.start().then(() => {
      video.play().then(() => {
        adaptElements();
        window.addEventListener("resize", adaptElements);
        buttonDiv.addEventListener("click", takeSnapshot);
      });
    });
  
    let countDown: number = 10;
  
    // take a snapshot by copying video into image via (hidden) canvas
    function takeSnapshot(): void {
      const context: CanvasRenderingContext2D = canvas.getContext("2d");
  
      // copy video image into canvas
      context.drawImage(video, videoCutX, videoCutY, videoWidth - 2 * videoCutX, videoHeight - 2 * videoCutY, 0, 0, imageWidth, imageHeight);
  
      // generate data URL for local image display
      const srcDataUrl: string = canvas.toDataURL("image/png");
      image.setAttribute("src", srcDataUrl);
  
      // convert canvas image to jpeg blob
      canvas.toBlob((blob) => socket.send(blob), "image/jpeg");
  
      // hide video and show image
      video.classList.add("hide");
      buttonDiv.classList.add("hide");
      image.classList.remove("hide");
  
      // make image flash when taking photo
      image.style.filter = "brightness(2)";
      setTimeout(() => image.style.filter = "none", 120);
  
      // start count down blocking interaction
      countDown = 10;
      doCountDown();
    }
  
    // generate count down with recursive calls to setTimeout
    function doCountDown(): void {
      if (countDown > 0) {
        countDownDiv.innerHTML = countDown.toString();
        setTimeout(doCountDown, 1000);
      } else {
        countDownDiv.innerHTML = "";
        resetVideo();
      }
  
      countDown--;
    }
  
    // return to live video display
    function resetVideo(): void {
      // hide image and show video
      image.classList.add("hide");
      video.classList.remove("hide");
      buttonDiv.classList.remove("hide");
    }
  
    // adapt video element to current screen size
    function adaptElements(): void {
      const rect: DOMRect = document.body.getBoundingClientRect();
      const screenWidth: number = rect.width;
      const screenHeight: number = rect.height;
  
      // set size and position of image and frame on screen
      const scaleImageWidthToScreen: number = screenWidth / imageWidth;
      const scaleImageHeightToScreen: number = screenHeight / imageHeight;
      const scaleImageToScreen: number = Math.min(scaleImageWidthToScreen, scaleImageHeightToScreen);
      const imageScreenWidth: number = Math.floor(imageWidth * scaleImageToScreen + 0.5);
      const imageScreenHeight: number = Math.floor(imageHeight * scaleImageToScreen + 0.5);
      const imageScreenOffsetX: number = Math.max(0, Math.floor(0.5 * (screenWidth - imageScreenWidth) + 0.5));
      const imageScreenOffsetY: number = Math.max(0, Math.floor(0.5 * (screenHeight - imageScreenHeight) + 0.5));
  
      image.width = imageScreenWidth;
      image.height = imageScreenHeight;
      image.style.left = `${imageScreenOffsetX}px`;
      image.style.bottom = `${imageScreenOffsetY}px`;
  
      frameDiv.style.width = `${imageScreenWidth}px`;
      frameDiv.style.height = `${imageScreenHeight}px`;
      frameDiv.style.left = `${imageScreenOffsetX}px`;
      frameDiv.style.bottom = `${imageScreenOffsetY}px`;
  
      // update video size
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
  
      // set size and position of video on screen
      const scaleVideoWidthToScreen: number = imageScreenWidth / videoWidth;
      const scaleVideoHeightToScreen: number = imageScreenHeight / videoHeight;
      const scaleVideoToScreen: number = Math.max(scaleVideoWidthToScreen, scaleVideoHeightToScreen);
      const videoScreenWidth: number = Math.floor(videoWidth * scaleVideoToScreen + 0.5);
      const videoScreenHeight: number = Math.floor(videoHeight * scaleVideoToScreen + 0.5);
      const videoScreenOffsetX: number = Math.floor(0.5 * (screenWidth - videoScreenWidth) + 0.5);
      const videoScreenOffsetY: number = Math.floor(0.5 * (screenHeight - videoScreenHeight) + 0.5);
  
      video.style.width = `${videoScreenWidth}px`;
      video.style.height = `${videoScreenHeight}px`;
      video.style.left = `${videoScreenOffsetX}px`;
      video.style.bottom = `${videoScreenOffsetY}px`;
  
      // set video cutting to image size
      const scaleImageWidthToVideo: number = videoWidth / imageWidth;
      const scaleImageHeightToVideo: number = videoHeight / imageHeight;
      const scaleVideoToImage: number = Math.min(scaleImageWidthToVideo, scaleImageHeightToVideo);
      const imageVideoWidth: number = Math.floor(imageWidth * scaleVideoToImage + 0.5);
      const imageVideoHeight: number = Math.floor(imageHeight * scaleVideoToImage + 0.5);
  
      videoCutX = Math.max(0, Math.floor(0.5 * (videoWidth - imageVideoWidth) + 0.5));
      videoCutY = Math.max(0, Math.floor(0.5 * (videoHeight - imageVideoHeight) + 0.5));
    }
  
    // listen to connection open
    // socket.addEventListener("open", (event) => {
    // });
  
    // listen to message from server
    // socket.addEventListener("message", (event) => {
    // });
  }
  