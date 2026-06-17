import "@emotion/react";
import type { Theme as MyTheme } from './Theme';


declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends MyTheme {}
}
