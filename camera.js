"use strict";
var client;
(function (client) {
    // const socket: WebSocket = new WebSocket("ws://localhost:8000/");
    const socket = new WebSocket("wss://kreko-photo-collector.herokuapp.com/");
    const imageWidth = 400;
    const imageHeight = 600;
    const video = document.getElementById("video");
    const image = document.getElementById("image");
    const frameDiv = document.getElementById("frame");
    const buttonDiv = document.getElementById("button");
    const countDownDiv = document.getElementById("countdown");
    const canvas = document.createElement("canvas");
    let videoWidth = null;
    let videoHeight = null;
    let videoCutX = null;
    let videoCutY = null;
    // adapt canvas and image size to normalized image size 
    canvas.width = image.width = imageWidth;
    canvas.height = image.height = imageHeight;
    // create user media manager and assign video element
    const userMediaManager = new UserMediaManager({ video: true, audio: false });
    userMediaManager.videoElement = video;
    // create start screen and register user media manager
    const startScreen = new StartScreen("start-screen");
    startScreen.addResourceManager(userMediaManager);
    // start (creates audio context )
    startScreen.start().then(() => {
        video.play().then(() => {
            adaptElements();
            window.addEventListener("resize", adaptElements);
            buttonDiv.addEventListener("click", takeSnapshot);
        });
    });
    let countDown = 10;
    // take a snapshot by copying video into image via (hidden) canvas
    function takeSnapshot() {
        const context = canvas.getContext("2d");
        // copy video image into canvas
        context.drawImage(video, videoCutX, videoCutY, videoWidth - 2 * videoCutX, videoHeight - 2 * videoCutY, 0, 0, imageWidth, imageHeight);
        // generate data URL for local image display
        const srcDataUrl = canvas.toDataURL("image/png");
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
    function doCountDown() {
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
        frameDiv.style.width = `${imageScreenWidth}px`;
        frameDiv.style.height = `${imageScreenHeight}px`;
        frameDiv.style.left = `${imageScreenOffsetX}px`;
        frameDiv.style.bottom = `${imageScreenOffsetY}px`;
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
    // listen to connection open
    // socket.addEventListener("open", (event) => {
    // });
    // listen to message from server
    // socket.addEventListener("message", (event) => {
    // });
})(client || (client = {}));
//# sourceMappingURL=camera.js.map