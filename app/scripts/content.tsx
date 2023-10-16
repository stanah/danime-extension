import ReactDOM from "react-dom/client";

import App from "./App";

const div = document.createElement("div");
document.body.insertBefore(div, document.body.firstChild);

const root = ReactDOM.createRoot(div);
root.render(<App />);
