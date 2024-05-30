import { type Component, Match, Switch, createResource, createMemo, For } from "solid-js";

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

// function path2IsFolderPath(path: string) {
//   return path.endsWith("/") || path === "";
// }

function path2Segments(path: string) {
  const temp = path.split("/");
  return temp[temp.length - 1] === "" ? temp.slice(0, -1) : temp;
}

const fetchRootNode = async (rootNodeUrl: string) => {
  import.meta.env.DEV && (await new Promise((_res, _rej) => setTimeout(() => _res(null), (Math.random() / 3 + 0.1) * 10000)));

  return (await (await fetch(rootNodeUrl)).json()) as FolderNode;
};

const Viewer: Component<{ rootNodeUrl: string; path: string }> = (props) => {
  const [rootNode] = createResource(() => props.rootNodeUrl, fetchRootNode);

  return (
    <div class="bg-white mx-4 mb-4 rounded-xl shadow overflow-hidden">
      <Switch>
        <Match when={rootNode.loading}>
          <div class="fade-in flex items-center">
            <span class="material-icons text-slate-500 text-[36px] m-3 animate-spin">hourglass_empty</span>
            <span class="text-slate-500">加载中</span>
          </div>
        </Match>
        <Match when={rootNode.error}>
          <div class="fade-in flex items-center">
            <span class="material-icons text-red-500 text-[36px] m-3">error</span>
            <span class="text-red-500 font-mono">{rootNode.error.toString()}</span>
          </div>
        </Match>
        <Match when={rootNode()}>
          <div class="fade-in">
            <Moder rootNode={rootNode()!} path={props.path} />
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
          <span class="material-icons text-[36px] m-3">not_listed_location</span>
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
                    <span class="material-icons text-yellow-500 text-[36px] m-3">folder</span>
                    <span class="break-all pr-2">{node.name}</span>
                  </a>
                </Match>
                <Match when={true}>
                  <a class="flex items-center hover:bg-slate-100" href={`/#${props.path}${node.name}`}>
                    <span class="material-icons text-blue-300 text-[36px] m-3">description</span>
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
        <div class="fade-in flex items-center">
          <span class="material-icons text-slate-300 text-[36px] m-3">question_mark</span>
          <span>找不到指定文件</span>
        </div>
      </Match>
      <Match when={true}>
        <div>
          <pre class="p-5 text-red-600 rounded-lg overflow-x-auto">{JSON.stringify(currentFileNode()!, null, 2)}</pre>
          <hr />
          <a href={`/api/fileNode/${props.path}`} class="py-1 pl-3 pr-4 text-sky-800 bg-blue-100 hover:bg-blue-200 active:hover:bg-blue-300 rounded-full float-right m-3 inline-block">
            <span class="material-icons align-middle">download</span>
            <span>下载</span>
          </a>
        </div>
      </Match>
    </Switch>
  );
};

export default Viewer;
