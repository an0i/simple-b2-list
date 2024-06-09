import { For, Match, Switch, createMemo } from "solid-js";
import type { Component } from "solid-js";

function path2Segments(path: string) {
  const temp = path.split("/");
  return temp[temp.length - 1] === "" ? temp.slice(0, -1) : temp;
}

const Breadcrumbs: Component<{ path: string }> = (props) => {
  const segments = createMemo(() => path2Segments(props.path));

  return (
    <div class="mx-2 p-2 flex gap-1 items-center text-slate-500 flex-wrap *:text-ellipsis *:overflow-hidden *:max-w-[95%]">
      <Switch>
        <Match when={segments().length === 0}>
          <span class="px-2 py-1 text-black">根目录</span>
        </Match>
        <Match when={segments().length >= 1}>
          <a href="/#" class="px-2 py-1 bg-white hover:bg-slate-100 rounded-full shadow">
            根目录
          </a>
          <For each={segments().slice(0, -1)}>
            {(segment, index) => (
              <>
                <span class="select-none cursor-default">/</span>
                <a
                  href={`/#${segments()
                    .slice(0, index() + 1)
                    .join("/")}/`}
                  class="px-2 py-1 bg-white hover:bg-slate-100 rounded-full shadow"
                >
                  {segment}
                </a>
              </>
            )}
          </For>
          <span class="select-none cursor-default">/</span>
          <span class="px-2 py-1 text-black">{segments()[segments().length - 1]}</span>
        </Match>
      </Switch>
    </div>
  );
};

export default Breadcrumbs;
