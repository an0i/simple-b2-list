import type {
  SblFileNodeAssert,
  SblFolderNodeAssert,
  SblNode,
} from '@simple-b2-list/types';
import type { Component, JSXElement } from 'solid-js';
import { For, Match, Switch, createMemo, createResource } from 'solid-js';
import {
  IconDescription,
  IconDownload,
  IconError,
  IconFolder,
  IconHourglassEmpty,
  IconNotListedLocation,
} from './../components/icons';
import { calcCurrentFileNode, calcCurrentFolderNode } from '../utils';

const fetchRootNode = async (rootNodeUrl: string) => {
  if (import.meta.env.DEV)
    await new Promise((_res, _rej) =>
      setTimeout(() => _res(null), (1 + (Math.random() - 0.5) / 2) * 1000),
    );

  return (await (await fetch(rootNodeUrl)).json()) as SblFolderNodeAssert;
};

export default function RootNodeViewer(props: {
  path: string;
  rootNodeUrl: string;
}) {
  const [rootNode] = createResource(props.rootNodeUrl, fetchRootNode);
  return (
    <div class="mb-4">
      <Switch>
        <Match when={rootNode.loading}>
          <LoadingView />
        </Match>
        <Match when={rootNode.error}>
          <ErrorView error={rootNode.error} />
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
  const folderMode = () => props.path.endsWith('/') || props.path === '';

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
    calcCurrentFolderNode(props.rootNode, props.path),
  );

  return (
    <Switch>
      <Match when={currentFolderNode() === undefined}>
        <NotFoundFolderView />
      </Match>
      <Match when={true}>
        <FolderNodeView folderNode={currentFolderNode()!} path={props.path} />
      </Match>
    </Switch>
  );
};

const FileNodeFinder: Component<{ rootNode: SblNode; path: string }> = (
  props,
) => {
  const currentFileNode = createMemo(() =>
    calcCurrentFileNode(props.rootNode, props.path),
  );

  return (
    <Switch>
      <Match when={currentFileNode() === undefined}>
        <NotFoundFileView />
      </Match>
      <Match when={true}>
        <FileNodeView fileNode={currentFileNode()!} path={props.path} />
      </Match>
    </Switch>
  );
};

const FolderNodeView: Component<{
  folderNode: SblFolderNodeAssert;
  path: string;
}> = (props) => {
  return (
    <Paper>
      <div class="divide-y">
        <For each={props.folderNode.children}>
          {(node) => (
            <Switch>
              <Match when={'children' in node}>
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
    </Paper>
  );
};

const FileNodeView: Component<{
  fileNode: SblFileNodeAssert;
  path: string;
}> = (props) => {
  return (
    <Paper>
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
    </Paper>
  );
};

const LoadingView = () => {
  return (
    <Paper>
      <div class="flex items-center text-slate-500">
        <IconHourglassEmpty class="shrink-0 size-9 m-3 animate-spin" />
        <span>加载中</span>
      </div>
    </Paper>
  );
};

const ErrorView: Component<{ error: any }> = (props) => {
  return (
    <Paper>
      <div class="flex items-center text-red-500">
        <IconError class="shrink-0 size-9 m-3" />
        <span class="font-mono">{props.error.toString()}</span>
      </div>
    </Paper>
  );
};

const NotFoundFolderView = () => {
  return (
    <Paper>
      <div class="flex items-center text-slate-500">
        <IconNotListedLocation class="shrink-0 size-9 m-3" />
        <span>找不到指定文件夹</span>
      </div>
    </Paper>
  );
};

const NotFoundFileView = () => {
  return (
    <Paper>
      <div class="flex items-center text-slate-500">
        <IconNotListedLocation class="shrink-0 size-9 m-3" />
        <span>找不到指定文件</span>
      </div>
    </Paper>
  );
};

const Paper: Component<{ children: JSXElement }> = (props) => {
  return (
    <div class="bg-white mx-4 rounded-xl shadow overflow-hidden">
      {props.children}
    </div>
  );
};
