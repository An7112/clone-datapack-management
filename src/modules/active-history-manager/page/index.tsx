import React from 'react';
import { Redirect } from 'react-router';
import { BrowsingLayout } from '@gotecq/layout';
import './style.scss';

export class ScheduleManagerLayout extends BrowsingLayout {
    module = 'active-history-manager'
    panelParam = {
        primary: {
        },
        secondary: {
        },
        extension: {
        },
    }
    render() {
        return  <div className='browsing-layout balanced-browsing-layout active-history-layout'>
            {this.extensionPanel()}
            {this.primaryPanel()}
            {this.secondaryPanel()}
        </div>;
    }
}

export function HomePage() {
    return (
        <Redirect
            to='/active-history-manager/list-active-history/active-history/filter-active-history'
        />
    );
}

export { ActiveHistoryList } from './active-history-list';