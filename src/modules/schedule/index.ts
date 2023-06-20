import { Module } from '@gotecq/core';
import { 
    HomePage, ScheduleManagerLayout, 
    ScheduleList,
    ScheduleDetail,
} from './page';
import { ScheduleFilter } from '../common-page';

function setup(module: Module) {
    module.panel('filter-list', ScheduleFilter);
    module.panel('schedule-list', ScheduleList);
    module.panel('schedule-board', ScheduleDetail);

    module.route({
        path: '/schedule-manager',
        title: 'Schedule Management',
        exact: true,
        secure: true,
        component: HomePage,
    });
    module.route({
        path: '/schedule-manager/:schedule',
        title: 'Schedule Management',
        exact: false,
        secure: true,
        component: ScheduleManagerLayout,
    });
}

export { setup };
