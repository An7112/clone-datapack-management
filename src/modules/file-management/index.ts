import { Module } from '@gotecq/core';
import { 
    HomePage, FileManagerLayout, 
    FileList,
    PreviewFile,
} from './page';

function setup(module: Module) {
    module.panel('file-list', FileList);
    module.panel('file-preview', PreviewFile);

    module.route({
        path: '/file-manager:rootId',
        title: 'File Management',
        exact: true,
        secure: true,
        hideNavBar: true,
        component: HomePage,
    });
    module.route({
        path: '/file-manager:rootId?/',
        title: 'File Management',
        exact: false,
        secure: true,
        hideNavBar: true,
        component: FileManagerLayout,
    });
}

export { setup };
