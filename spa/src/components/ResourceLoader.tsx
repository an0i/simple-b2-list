import type { JSXElement, Resource } from "solid-js";
import { Match, Switch } from "solid-js";

export function ResourceLoader<T>(props: { resource: Resource<T>; whenLoading: () => JSXElement; whenError: (error: any) => JSXElement; whenSuccess: (data: T) => JSXElement }) {
  return (
    <Switch>
      <Match when={props.resource.loading}>{props.whenLoading()}</Match>
      <Match when={props.resource.error}>{props.whenError(props.resource.error)}</Match>
      <Match when={props.resource()}>{props.whenSuccess(props.resource()!)}</Match>
    </Switch>
  );
}
