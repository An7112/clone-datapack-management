declare module '*.svg' {
    import * as React from 'react';
  
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  
    const src: string;
    export default ReactComponent;
}

declare module '*.scss' {
    const content: {[className: string]: string};
    export = content;
}

declare module '*.less' {
    const content: {[className: string]: string};
    export = content;
}

declare module '*.css' {
    const content: {[className: string]: string};
    export = content;
}
