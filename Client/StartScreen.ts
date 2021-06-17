interface ResourceManager {
  getCheck(): Promise<void>;
}

class StartScreen {
  private screenDiv: HTMLDivElement = null;
  private textDiv: HTMLDivElement = null;
  private managers: ResourceManager[] = [];

  constructor(id: string) {
    this.screenDiv = <HTMLDivElement>document.getElementById(id);
    this.textDiv = <HTMLDivElement>this.screenDiv.querySelector("p");
  }

  setText(text: string): void {
    this.textDiv.classList.remove("error");
    this.textDiv.innerHTML = text;
  }

  setError(text: string): void {
    this.textDiv.classList.add("error");
    this.textDiv.innerHTML = text;
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.screenDiv.style.display = "block";

      this.setText("touch screen to start");

      this.screenDiv.addEventListener("click", () => {
        this.setText("checking for resources...");

        const promises: Promise<void>[] = [];

        for (let manager of this.managers) {
          const promise: Promise<void> = manager.getCheck();
          promises.push(promise);
        }

        Promise.all(promises)
          .then(() => {
            this.close();
            resolve();
          })
          .catch((error) => {
            this.setError(error);
            //reject(error); // dead end :-)
          });
      });
    });
  }

  addResourceManager(manager: ResourceManager): void {
    this.managers.push(manager);
  }

  close(): void {
    this.screenDiv.style.display = "none";
  }
}
