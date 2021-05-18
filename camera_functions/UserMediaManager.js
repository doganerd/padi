"use strict";
class UserMediaManager {
    constructor(constraints) {
        this.videoElement = null;
        this.constraints = constraints;
    }
    getCheck() {
        return new Promise((resolve, reject) => {
            if (navigator.mediaDevices) {
                navigator.mediaDevices
                    .getUserMedia(this.constraints)
                    .then((stream) => {
                    this.stream = stream;
                    if (this.videoElement !== null) {
                        this.videoElement.srcObject = stream;
                    }
                    resolve();
                })
                    .catch((err) => {
                    reject("audio/video input: " + err.message.toLowerCase());
                });
            }
            else {
                reject("audio/video input not available");
            }
        });
    }
}
//# sourceMappingURL=UserMediaManager.js.map