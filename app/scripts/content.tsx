import ReactDOM from "react-dom/client";
import { EventEmitter } from "events";

import App from "./App";
import { addToWatchList, existsInWatchList } from "./App/storageClient";

const eventEmitter = new EventEmitter();

const div = document.createElement("div");
div.style.position = "absolute";
div.style.top = "0";
div.style.left = "0";
div.style.zIndex = "1100";
document.body.append(div);

const root = ReactDOM.createRoot(div);

root.render(<App eventEmitter={eventEmitter} />);

const setButton = async (d: Element) => {
  const workId = d.getAttribute("data-workid");
  if (workId && Number(workId) > 0) {
    const buttonElement = document.createElement("button");
    buttonElement.style.zIndex = "9999";

    // ウォッチリストに既に追加されているかどうかを判定する
    if (await existsInWatchList(Number(workId))) {
      buttonElement.textContent = "📌";
      buttonElement.disabled = true;
    } else {
      buttonElement.textContent = "ウォッチリストに追加";
      buttonElement.style.cursor = "pointer";
      buttonElement.onclick = async () => {
        try {
          await addToWatchList(Number(workId));
          eventEmitter.emit("watchListUpdated", { error: false, notify: true, message: "ウォッチリストに追加しました" });
        } catch (e) {
          eventEmitter.emit("watchListUpdated", { error: true, notify: true, message: "既に登録されています" });
        }
        buttonElement.textContent = "📌";
        buttonElement.disabled = true;
        buttonElement.style.cursor = "default";
      };
    }

    const div = document.createElement("div");
    div.appendChild(buttonElement);

    // すでに追加されたボタンを削除する
    const existingButton = d.querySelector("div > button");
    if (existingButton) {
      existingButton.remove();
    }
    d.appendChild(div);
  }
};

window.addEventListener("load", () => {
  document.querySelectorAll("div.itemModule").forEach((d) => setButton(d));
});
