import ReactDOM from "react-dom/client";

import { getAnimeData } from "./App/danimeClient";
import App from "./App";

getAnimeData("26440").then((anime) => {
  console.log(anime);
  const div = document.createElement("div");
  document.body.insertBefore(div, document.body.firstChild);

  // document.body.appendChild(div);
  const root = ReactDOM.createRoot(div);
  root.render(<App />);
});
