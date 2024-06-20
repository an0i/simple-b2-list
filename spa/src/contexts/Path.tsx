import type { Accessor, Component, JSXElement } from "solid-js";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

function getCurrentPath() {
  return decodeURIComponent(window.location.hash.slice(1));
}

const PathContext = createContext<Accessor<string>>(getCurrentPath);

export const PathProvider: Component<{ children: JSXElement }> = (props) => {
  const [path, setPath] = createSignal(getCurrentPath());

  function updatePath() {
    setPath(getCurrentPath());
  }

  onMount(() => window.addEventListener("hashchange", updatePath));
  onCleanup(() => window.removeEventListener("hashchange", updatePath));

  return <PathContext.Provider value={path}>{props.children}</PathContext.Provider>;
};

export function usePath() {
  return useContext(PathContext);
}
