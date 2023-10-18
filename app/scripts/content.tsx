import ReactDOM from "react-dom/client";
import { EventEmitter } from "events";

import App from "./App";
import { getWatchList, getSelectedWatchListName } from "./App/storageClient";

const eventEmitter = new EventEmitter();

const div = document.createElement("div");
div.style.position = "absolute";
div.style.top = "0";
div.style.left = "0";
div.style.zIndex = "1100";
document.body.append(div);

const root = ReactDOM.createRoot(div);

root.render(<App eventEmitter={eventEmitter} />);

window.addEventListener("load", () => {
  document.querySelectorAll("div.itemModule").forEach((d) => {
    const workId = d.getAttribute("data-workid");
    if (workId && Number(workId) > 0) {
      const buttonElement = document.createElement("button");
      buttonElement.textContent = "ウォッチリストに追加";
      buttonElement.style.zIndex = "9999";
      buttonElement.onclick = async () => {
        const selectedWatchList = await getSelectedWatchListName();
        const watchList = await getWatchList(selectedWatchList);
        await watchList.add(Number(workId));
        eventEmitter.emit("watchListUpdated");
      };

      const div = document.createElement("div");
      div.appendChild(buttonElement);

      // すでに追加されたボタンを削除する
      const existingButton = d.querySelector("div > button");
      if (existingButton) {
        existingButton.remove();
      }
      d.appendChild(div);
    }
  });
});
