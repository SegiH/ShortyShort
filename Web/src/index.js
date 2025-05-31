import React, { createRoot } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DataProvider } from "./data-context";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <DataProvider>
        <App />
    </DataProvider>
);  