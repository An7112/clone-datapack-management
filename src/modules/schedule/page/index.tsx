import React from 'react';
import { Redirect } from 'react-router';
import { BrowsingLayout } from '@gotecq/layout';
import './style.scss';
export class ScheduleManagerLayout extends BrowsingLayout {
    module = 'schedule-manager'
    panelParam = {
        primary: {
            schedule_entry_id: { default: true },
        },
        secondary: {
            // 'fileRequestId': { default: true }
        },
        extension: {
        },
    }
    render() {
        return <div className='browsing-layout balanced-browsing-layout schedule-manager-layout'>
            {this.extensionPanel()}
            {this.primaryPanel()}
            {this.secondaryPanel()}
        </div>;
    }
}

export function HomePage() {
    return (
        <Redirect
            to='/schedule-manager/schedule-list/schedule-board/filter-list'
        />
    );
}

export { ScheduleList } from './schedule-list';
export { ScheduleDetail } from './schedule-board';