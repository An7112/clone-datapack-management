import { Module } from '@gotecq/core';
import { 
    HomePage, 
    ScheduleManagerLayout, 
    ActiveHistoryList,
    // ScheduleDetail
} from './page';
import { ActivityFilter } from '../common-page';

function setup(module: Module) {
    module.panel('filter-active-history', ActivityFilter);
    module.panel('list-active-history', ActiveHistoryList);
    // module.panel('schedule-board', ScheduleDetail);

    module.route({
        path: '/active-history-manager',
        title: 'Active History Management',
        exact: true,
        secure: true,
        component: HomePage,
    });
    module.route({
        path: '/active-history-manager/',
        title: 'Active History Management',
        exact: false,
        secure: true,
        component: ScheduleManagerLayout,
    });
}

export { setup };
