import type { SblFolderNodeAssert, SblNode } from "@simple-b2-list/types";
import type { Component } from "solid-js";
import { For, Match, Switch, createMemo, createResource } from "solid-js";
import { ResourceLoader } from "../components/ResourceLoader";
import { usePath } from "../contexts/Path";
import { DescriptionIcon, DownloadIcon, ErrorIcon, FolderIcon, HourglassEmptyIcon, NotListedLocationIcon } from "../icons/material-symbols-outlined";
import { calcCurrentFileNode, calcCurrentFolderNode } from "../utils";

const fetchRootNode = async (rootNodeUrl: string) => {
  if (import.meta.env.DEV) await new Promise((_res, _rej) => setTimeout(() => _res(null), (1 + (Math.random() - 0.5) / 2) * 1000));

  return (await (await fetch(rootNodeUrl)).json()) as SblFolderNodeAssert;
};

export default function RootNodeViewer(props: { rootNodeUrl: string }) {
  const [rootNode] = createResource(props.rootNodeUrl, fetchRootNode);
  return (
    <div class="bg-white mx-4 mb-4 rounded-xl shadow overflow-hidden">
      <ResourceLoader resource={rootNode} errorComponent={ErrorAlert} loadingComponent={LoadingAlert} successComponent={Moder} />
    </div>
  );
}

const Moder: Component<{ data: Awaited<ReturnType<typeof fetchRootNode>> }> = (props) => {
  const path = usePath();

  const folderMode = () => path().endsWith("/") || path() === "";

  return (
    <div class="fade-in">
      <Switch>
        <Match when={folderMode() === true}>
          <FolderFinder path={path()} rootNode={props.data} />
        </Match>
        <Match when={true}>
          <FileFinder path={path()} rootNode={props.data} />
        </Match>
      </Switch>
    </div>
  );
};

const FolderFinder: Component<{ rootNode: SblFolderNodeAssert; path: string }> = (props) => {
  const currentFolderNode = createMemo(() => calcCurrentFolderNode(props.rootNode, props.path));

  return (
    <Switch>
      <Match when={currentFolderNode() === undefined}>
        <NotFoundFolderAlert />
      </Match>
      <Match when={true}>
        <div class="divide-y">
          <For each={currentFolderNode()!.children}>
            {(node) => (
              <Switch>
                <Match when={"children" in node}>
                  <a class="flex pr-4 items-center hover:bg-slate-100" href={`/#${props.path}${node.name}/`}>
                    <FolderIcon class="shrink-0 text-yellow-500 size-9 m-3" />
                    <span class="break-all">{node.name}</span>
                  </a>
                </Match>
                <Match when={true}>
                  <a class="flex pr-4 items-center hover:bg-slate-100" href={`/#${props.path}${node.name}`}>
                    <DescriptionIcon class="shrink-0 text-blue-300 size-9 m-3" />
                    <span class="break-all">{node.name}</span>
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

const FileFinder: Component<{ rootNode: SblNode; path: string }> = (props) => {
  const currentFileNode = createMemo(() => calcCurrentFileNode(props.rootNode, props.path));

  return (
    <Switch>
      <Match when={currentFileNode() === undefined}>
        <NotFoundFileAlert />
      </Match>
      <Match when={true}>
        <div>
          <pre class="p-5 text-red-600 rounded-lg overflow-x-auto">{JSON.stringify(currentFileNode()!, null, 2)}</pre>
          <hr />
          <div class="flex justify-end gap-3 p-3">
            <a href={`/api/fileNode/${props.path}`} class="py-1 pl-3 pr-4 text-sky-800 bg-blue-100 hover:bg-blue-200 active:hover:bg-blue-300 rounded-full flex items-center">
              <DownloadIcon class="shrink-0 align-middle" />
              <span>下载</span>
            </a>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

const LoadingAlert = () => {
  return (
    <div class="fade-in flex items-center text-slate-500">
      <HourglassEmptyIcon class="shrink-0 size-9 m-3 animate-spin" />
      <span>加载中</span>
    </div>
  );
};
const ErrorAlert: Component<{ error: any }> = (props) => {
  return (
    <div class="fade-in flex items-center text-red-500">
      <ErrorIcon class="shrink-0 size-9 m-3" />
      <span class="font-mono">{props.error.toString()}</span>
    </div>
  );
};
const NotFoundFolderAlert = () => {
  return (
    <div class="fade-in flex items-center text-slate-500">
      <NotListedLocationIcon class="shrink-0 size-9 m-3" />
      <span>找不到指定文件夹</span>
    </div>
  );
};
const NotFoundFileAlert = () => {
  return (
    <div class="fade-in flex items-center text-slate-500">
      <NotListedLocationIcon class="shrink-0 size-9 m-3" />
      <span>找不到指定文件</span>
    </div>
  );
};
