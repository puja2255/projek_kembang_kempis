/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/edit-profile`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/inputan`; params?: Router.UnknownInputParams; } | { pathname: `/laporan`; params?: Router.UnknownInputParams; } | { pathname: `/profil`; params?: Router.UnknownInputParams; } | { pathname: `/../config`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/edit-profile`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/inputan`; params?: Router.UnknownOutputParams; } | { pathname: `/laporan`; params?: Router.UnknownOutputParams; } | { pathname: `/profil`; params?: Router.UnknownOutputParams; } | { pathname: `/../config`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/edit-profile${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/inputan${`?${string}` | `#${string}` | ''}` | `/laporan${`?${string}` | `#${string}` | ''}` | `/profil${`?${string}` | `#${string}` | ''}` | `/../config${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/edit-profile`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/inputan`; params?: Router.UnknownInputParams; } | { pathname: `/laporan`; params?: Router.UnknownInputParams; } | { pathname: `/profil`; params?: Router.UnknownInputParams; } | { pathname: `/../config`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
