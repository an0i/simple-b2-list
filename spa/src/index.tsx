/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";

// path signal
import { createSignal } from "solid-js";
const [path, setPath] = createSignal(decodeURIComponent(location.hash.slice(1)));
window.addEventListener("hashchange", () => setPath(decodeURIComponent(location.hash.slice(1))));
export { path };

// breadcrumbs
import Breadcrumbs from "./components/Breadcrumbs";
const breadcrumbs = document.getElementById("breadcrumbs");
render(() => <Breadcrumbs path={path()} />, breadcrumbs!);
// items
import Viewer from "./components/Viewer";
const viewer = document.getElementById("viewer");
render(() => <Viewer path={path()} rootNodeUrl="/api/rootNode" />, viewer!);
