import { defineComponent } from "vue"
import { LocationQuery, RouteParams } from "vue-router";

export type Component<T extends any = any> =
  | ReturnType<typeof defineComponent>
  | (() => Promise<typeof import('*.vue')>)
  | (() => Promise<T>);

export type Menu = {
  url: string;
  title: string;
  icon?: string;
  children?: Menu[]
}

export interface RouteMeta {
  title: string;
  hidden?: boolean;
  affix?: boolean
}

export interface Recordable {
  error: string
}


export interface AppRouterRaw {
  path: string,
  name: string;
  meta: RouteMeta;
  component?: Component | string;
  components?: Component;
  children?: AppRouterRaw[];
  props?: Recordable;
  icon?: string,
  fullPath?: string;
  beforeEnter?: () => string | boolean
}

export interface Tag {
  path: string,
  name: string;
  title: string;
  meta: RouteMeta;
  fullPath: string;
  query?: LocationQuery
  params?: RouteParams
}


