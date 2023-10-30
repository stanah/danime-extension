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

const setButton = async (workId: string | null, element: Element) => {
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
    const existingButton = element.querySelector("div > button");
    if (existingButton) {
      existingButton.remove();
    }
    element.appendChild(div);
    return div;
  }
  return null;
};

const setButtonToItemModule = async (element: Element) => {
  const workId = element.getAttribute("data-workid");
  setButton(workId, element);
};

const setButtonToPslider = (element: Element) => {
  // hrefからworkIdを取得する
  const href = element.firstElementChild?.getAttribute("href");
  const workId = href?.split("workId=")[1] || null;
  setButton(workId, element);
};

const replaceMyListButton = async (element: Element) => {
  const workId = element.getAttribute("data-workid");

  // elementの親要素を取得する
  const parent = element.parentElement;
  if (parent) {
    const btn = await setButton(workId, parent);
    if (btn == null) return;
    btn.style.margin = "0";
    btn.style.height = "44px";
    element.remove();
  }
};

window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelectorAll("div.itemModule").forEach((d) => setButtonToItemModule(d));
    document.querySelectorAll("div.p-slider__item").forEach((d) => setButtonToPslider(d));
    document.querySelectorAll("div.btnAddMyList").forEach((d) => replaceMyListButton(d));
  }, 1000);
});
