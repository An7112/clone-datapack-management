import { Module } from '@gotecq/core';
import { 
    HomePage, DatapackManagerLayout, 
    DatapackList, RedirectToDatapack, RedirectToDatapackDetail,
    DatapackBoard, DatapackPublicLayout,
    SubmitFileRequest,
} from './page';
import { DatapackFilter } from '../common-page';

function setup(module: Module) {
    module.panel('datapack-board', DatapackBoard);
    module.panel('filter-list', DatapackFilter);
    module.panel('datapack-list', DatapackList);
    module.panel('file-request', SubmitFileRequest);

    module.route({
        path: '/datapack-manager',
        title: 'Datapack Management',
        exact: true,
        secure: true,
        component: HomePage,
    });
    module.route({
        path: '/datapack/:datapack',
        title: 'Datapack Management',
        exact: true,
        secure: true,
        component: RedirectToDatapack,
    });
    module.route({
        path: '/datapack-detail-redirect',
        title: 'Datapack Management',
        exact: true,
        secure: true,
        component: RedirectToDatapackDetail,
    });
    module.route({
        path: '/datapack-manager/',
        title: 'Datapack Management',
        exact: false,
        secure: true,
        component: DatapackManagerLayout,
    });
    module.route({
        path: '/datapack-public/',
        title: 'Datapack Management',
        exact: false,
        secure: false,
        component: DatapackPublicLayout,
    });
}

export { setup };
