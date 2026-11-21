import type { JSX as ReactJSX } from 'react';

declare global {
  namespace JSX {
    type Element = ReactJSX.Element;

    type ElementClass = ReactJSX.ElementClass;

    type ElementType = ReactJSX.ElementType;

    type IntrinsicElements = ReactJSX.IntrinsicElements;
  }
}
