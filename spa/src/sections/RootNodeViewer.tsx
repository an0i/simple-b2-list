import type {
  SblFileNodeAssert,
  SblFolderNodeAssert,
  SblNode,
} from "@simple-b2-list/types";
import type { Component } from "solid-js";
import { For, Match, Switch, createMemo, createResource } from "solid-js";
import {
  IconDescription,
  IconDownload,
  IconError,
  IconFolder,
  IconHourglassEmpty,
  IconNotListedLocation,
} from "./../components/icons";
import { calcCurrentFileNode, calcCurrentFolderNode } from "../utils";

const fetchRootNode = async (rootNodeUrl: string) => {
  if (import.meta.env.DEV)
    await new Promise((_res, _rej) =>
      setTimeout(() => _res(null), (1 + (Math.random() - 0.5) / 2) * 1000)
    );

  return (await (await fetch(rootNodeUrl)).json()) as SblFolderNodeAssert;
};

export default function RootNodeViewer(props: {
  path: string;
  rootNodeUrl: string;
}) {
  const [rootNode] = createResource(props.rootNodeUrl, fetchRootNode);
  return (
    <div class="bg-white mx-4 mb-4 rounded-xl shadow overflow-hidden">
      <Switch>
        <Match when={rootNode.loading}>
          <LoadingAlert />
        </Match>
        <Match when={rootNode.error}>
          <ErrorAlert error={rootNode.error} />
        </Match>
        <Match when={rootNode()}>
          <Moder data={rootNode()!} path={props.path} />
        </Match>
      </Switch>
    </div>
  );
}

const Moder: Component<{
  path: string;
  data: Awaited<ReturnType<typeof fetchRootNode>>;
}> = (props) => {
  const folderMode = () => props.path.endsWith("/") || props.path === "";

  return (
    <Switch>
      <Match when={folderMode() === true}>
        <FolderNodeFinder path={props.path} rootNode={props.data} />
      </Match>
      <Match when={true}>
        <FileNodeFinder path={props.path} rootNode={props.data} />
      </Match>
    </Switch>
  );
};

const FolderNodeFinder: Component<{
  rootNode: SblFolderNodeAssert;
  path: string;
}> = (props) => {
  const currentFolderNode = createMemo(() =>
    calcCurrentFolderNode(props.rootNode, props.path)
  );

  return (
    <Switch>
      <Match when={currentFolderNode() === undefined}>
        <NotFoundFolderAlert />
      </Match>
      <Match when={true}>
        <FolderNodeViewer folderNode={currentFolderNode()!} path={props.path} />
      </Match>
    </Switch>
  );
};

const FolderNodeViewer: Component<{
  folderNode: SblFolderNodeAssert;
  path: string;
}> = (props) => {
  return (
    <div class="divide-y">
      <For each={props.folderNode.children}>
        {(node) => (
          <Switch>
            <Match when={"children" in node}>
              <a
                class="flex pr-4 items-center hover:bg-slate-100"
                href={`/#${props.path}${node.name}/`}
              >
                <IconFolder class="shrink-0 text-yellow-500 size-9 m-3" />
                <span class="break-all">{node.name}</span>
              </a>
            </Match>
            <Match when={true}>
              <a
                class="flex pr-4 items-center hover:bg-slate-100"
                href={`/#${props.path}${node.name}`}
              >
                <IconDescription class="shrink-0 text-blue-300 size-9 m-3" />
                <span class="break-all">{node.name}</span>
              </a>
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
};

const FileNodeFinder: Component<{ rootNode: SblNode; path: string }> = (
  props
) => {
  const currentFileNode = createMemo(() =>
    calcCurrentFileNode(props.rootNode, props.path)
  );

  return (
    <Switch>
      <Match when={currentFileNode() === undefined}>
        <NotFoundFileAlert />
      </Match>
      <Match when={true}>
        <FileNodeViewer fileNode={currentFileNode()!} path={props.path} />
      </Match>
    </Switch>
  );
};
const FileNodeViewer: Component<{
  fileNode: SblFileNodeAssert;
  path: string;
}> = (props) => {
  return (
    <div>
      <pre class="p-4 text-red-600 rounded-lg overflow-x-auto">
        {JSON.stringify(props.fileNode, null, 2)}
      </pre>
      <hr />
      <div class="flex justify-end gap-3 p-3">
        <a href={`/api/fileNode/${props.path}`} class="btn">
          <IconDownload class="shrink-0" />
          <span>下载</span>
        </a>
      </div>
    </div>
  );
};

const LoadingAlert = () => {
  return (
    <div class="flex items-center text-slate-500">
      <IconHourglassEmpty class="shrink-0 size-9 m-3 animate-spin" />
      <span>加载中</span>
    </div>
  );
};
const ErrorAlert: Component<{ error: any }> = (props) => {
  return (
    <div class="flex items-center text-red-500">
      <IconError class="shrink-0 size-9 m-3" />
      <span class="font-mono">{props.error.toString()}</span>
    </div>
  );
};
const NotFoundFolderAlert = () => {
  return (
    <div class="flex items-center text-slate-500">
      <IconNotListedLocation class="shrink-0 size-9 m-3" />
      <span>找不到指定文件夹</span>
    </div>
  );
};
const NotFoundFileAlert = () => {
  return (
    <div class="flex items-center text-slate-500">
      <IconNotListedLocation class="shrink-0 size-9 m-3" />
      <span>找不到指定文件</span>
    </div>
  );
};
