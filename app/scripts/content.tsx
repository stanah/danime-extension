import ReactDOM from "react-dom/client";

import App from "./App";
import { addToWatchList } from "./App/storageClient";

const div = document.createElement("div");
div.style.position = "absolute";
div.style.top = "0";
div.style.left = "0";
div.style.zIndex = "9999";
document.body.append(div);

const root = ReactDOM.createRoot(div);

root.render(<App />);

// wait for page load
window.addEventListener("load", () => {
  document.body.querySelectorAll("div.itemModule").forEach((d) => {
    const workId = d.getAttribute("data-workid");
    if (workId && Number(workId) > 0) {
      const button = document.createElement("button");
      button.textContent = "ウォッチリストに追加";
      button.style.zIndex = "9999";
      button.onclick = () => {
        addToWatchList(Number(workId));
      };
      d.appendChild(button);
    }
  });
});
