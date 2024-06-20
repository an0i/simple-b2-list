import type { Component, Resource } from "solid-js";
import { Match, Switch } from "solid-js";

export function ResourceLoader<T>(props: { resource: Resource<T>; loadingComponent: Component; errorComponent: Component<{ error: any }>; successComponent: Component<{ data: T }> }) {
  return (
    <Switch>
      <Match when={props.resource.loading}>
        <props.loadingComponent />
      </Match>
      <Match when={props.resource.error}>
        <props.errorComponent error={props.resource.error} />
      </Match>
      <Match when={props.resource()}>
        <props.successComponent data={props.resource()!} />
      </Match>
    </Switch>
  );
}
