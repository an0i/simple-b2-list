import { type Component, Match, Switch, createResource, createMemo, For } from "solid-js";
import { usePath } from "../contexts/Path";
import FolderIcon from "../icons/material-symbols-outlined/FolderIcon";
import DescriptionIcon from "../icons/material-symbols-outlined/DescriptionIcon";
import HourglassEmptyIcon from "../icons/material-symbols-outlined/HourglassEmptyIcon";
import ErrorIcon from "../icons/material-symbols-outlined/ErrorIcon";
import NotListedLocationIcon from "../icons/material-symbols-outlined/NotListedLocationIcon";
import DownloadIcon from "../icons/material-symbols-outlined/DownloadIcon";

type Node =
  | {
      name: string;
      upstamp: number;
      len: number;
    }
  | {
      name: string;
      children: Node[];
    };

type FolderNode = Extract<Node, { children: Node[] }>;
type FileNode = Exclude<Node, { children: Node[] }>;

function path2Segments(path: string) {
  const temp = path.split("/");
  return temp[temp.length - 1] === "" ? temp.slice(0, -1) : temp;
}

const fetchRootNode = async (rootNodeUrl: string) => {
  import.meta.env.DEV && (await new Promise((_res, _rej) => setTimeout(() => _res(null), (Math.random() / 3 + 0.1) * 8000)));

  return (await (await fetch(rootNodeUrl)).json()) as FolderNode;
};

const Viewer: Component<{ rootNodeUrl: string }> = (props) => {
  const path = usePath();
  const [rootNode] = createResource(() => props.rootNodeUrl, fetchRootNode);

  return (
    <div class="bg-white mx-4 mb-4 rounded-xl shadow overflow-hidden">
      <Switch>
        <Match when={rootNode.loading}>
          <div class="fade-in flex items-center text-slate-500">
            <HourglassEmptyIcon class="shrink-0 size-9 m-3 animate-spin" />
            <span>加载中</span>
          </div>
        </Match>
        <Match when={rootNode.error}>
          <div class="fade-in flex items-center text-red-500">
            <ErrorIcon class="shrink-0 size-9 m-3" />
            <span class="font-mono">{rootNode.error.toString()}</span>
          </div>
        </Match>
        <Match when={rootNode()}>
          <div class="fade-in">
            <Moder rootNode={rootNode()!} path={path()} />
          </div>
        </Match>
      </Switch>
    </div>
  );
};

const Moder: Component<{ rootNode: Node; path: string }> = (props) => {
  const folderMode = () => props.path.endsWith("/") || props.path === "";

  return (
    <Switch>
      <Match when={folderMode() === true}>
        <FolderFinder rootNode={props.rootNode as FolderNode} path={props.path} />
      </Match>
      <Match when={true}>
        <FileFinder rootNode={props.rootNode} path={props.path} />
      </Match>
    </Switch>
  );
};

const FolderFinder: Component<{ rootNode: FolderNode; path: string }> = (props) => {
  const currentFolderNode = createMemo(() => {
    const segments = path2Segments(props.path);
    let currentNode = props.rootNode;
    for (const segment of segments) {
      if (!("children" in currentNode)) return undefined;
      const result = currentNode.children.find((child) => "children" in child && child.name === segment) as FolderNode | undefined;
      if (result === undefined) return undefined;
      currentNode = result;
    }
    currentNode.children = currentNode.children.filter((child) => child.name !== ".bzEmpty");
    currentNode.children.sort((a, b) => {
      if (!("children" in a) && !("children" in b)) return a.name.localeCompare(b.name);
      if ("children" in a && "children" in b) return a.name.localeCompare(b.name);
      if ("children" in a) return -1;
      return 1;
    });
    return currentNode;
  });

  return (
    <Switch>
      <Match when={currentFolderNode() === undefined}>
        <div class="fade-in flex items-center text-slate-500">
          <NotListedLocationIcon class="shrink-0 size-9 m-3" />
          <span>找不到指定文件夹</span>
        </div>
      </Match>
      <Match when={true}>
        <div class="divide-y">
          <For each={currentFolderNode()!.children}>
            {(node) => (
              <Switch>
                <Match when={"children" in node}>
                  <a class="flex items-center hover:bg-slate-100" href={`/#${props.path}${node.name}/`}>
                    <FolderIcon class="shrink-0 text-yellow-500 size-9 m-3" />
                    <span class="break-all pr-2">{node.name}</span>
                  </a>
                </Match>
                <Match when={true}>
                  <a class="flex items-center hover:bg-slate-100" href={`/#${props.path}${node.name}`}>
                    <DescriptionIcon class="shrink-0 text-blue-300 size-9 m-3" />
                    <span class="break-all pr-2">{node.name}</span>
                  </a>
                </Match>
              </Switch>
            )}
          </For>
        </div>
      </Match>
    </Switch>
  );
};

const FileFinder: Component<{ rootNode: Node; path: string }> = (props) => {
  const currentFileNode = createMemo(() => {
    const segments = path2Segments(props.path);
    let currentNode = props.rootNode;
    for (const segment of segments.slice(0, segments.length - 1)) {
      if (!("children" in currentNode)) return undefined;
      const result = currentNode.children.find((child) => "children" in child && child.name === segment);
      if (result === undefined) return undefined;
      currentNode = result;
    }

    if (!("children" in currentNode)) return undefined;
    const result = currentNode.children.find((child) => !("children" in child) && child.name === segments[segments.length - 1]);
    if (result === undefined) return undefined;
    currentNode = result;

    return currentNode as FileNode;
  });

  return (
    <Switch>
      <Match when={currentFileNode() === undefined}>
        <div class="fade-in flex items-center text-slate-500">
          <NotListedLocationIcon class="shrink-0 size-9 m-3" />
          <span>找不到指定文件</span>
        </div>
      </Match>
      <Match when={true}>
        <div>
          <pre class="p-5 text-red-600 rounded-lg overflow-x-auto">{JSON.stringify(currentFileNode()!, null, 2)}</pre>
          <hr />
          <a href={`/api/fileNode/${props.path}`} class="py-1 pl-3 pr-4 text-sky-800 bg-blue-100 hover:bg-blue-200 active:hover:bg-blue-300 rounded-full float-right m-3 flex items-center">
            <DownloadIcon class="shrink-0 align-middle" />
            <span>下载</span>
          </a>
        </div>
      </Match>
    </Switch>
  );
};

export default Viewer;
