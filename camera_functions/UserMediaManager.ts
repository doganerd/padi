
class UserMediaManager implements ResourceManager {
    public stream: MediaStream;
    public videoElement: HTMLVideoElement = null;
    private constraints: MediaStreamConstraints;
  
    constructor(constraints: MediaStreamConstraints) {
      this.constraints = constraints;
    }
  
    getCheck(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
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
  
        } else {
          reject("audio/video input not available");
        }
      });
    }
  }
  