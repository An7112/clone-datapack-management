import React from 'react';
import { Redirect } from 'react-router';
import { BrowsingLayout } from '@gotecq/layout';
import { useParams, useLocation } from 'react-router-dom';
import './page.scss';

export class DatapackManagerLayout extends BrowsingLayout {
    module = 'datapack-manager'
    panelParam = {
        primary: {
            'listId': { default: true },
        },
        extension: {
        },
        secondary: {
            'fileRequestId': { default: true },
        },
    }
    render() {
        return <div className='browsing-layout balanced-browsing-layout datapack-manager-layout'>
            {this.extensionPanel()}
            {this.primaryPanel()}
            {this.secondaryPanel()}
        </div>;
    }
}

export class DatapackPublicLayout extends BrowsingLayout {
    module = 'datapack-manager'
    panelParam = {
        primary: {
            'fileRequestId': { default: true },
        },
        extension: {
        },
        secondary: {
        },
    }
    render() {
        return <div className='browsing-layout balanced-browsing-layout datapack-public-layout'>
            {this.extensionPanel()}
            {this.primaryPanel()}
            {this.secondaryPanel()}
        </div>;
    }
}

export function HomePage() {
    return (
        <Redirect
            to='/datapack-manager/datapack-list/datapack-board/filter-list'
        />
    );
}
export function RedirectToDatapack() {
    const { datapack } = useParams<any>();
    const normalizedDatapack: string = datapack ?? '';
    return (
        <Redirect
            to={`/datapack-manager/datapack-list/datapack-board/filter-list?q={"listId":"${normalizedDatapack}","listIdType":"datapack"}`}
        />
    );
}

export function RedirectToDatapackDetail() {
    const { search } = useLocation();
    const searchParam = (new URLSearchParams(search)).get('param');
    const { datapack_id }: Record<string, string> = searchParam
        ? JSON.parse(searchParam)
        : {};

    if (datapack_id) {
        return <Redirect
            to={`/datapack-manager/datapack-list/datapack-board/filter-list?q={"listId":"${datapack_id}","listIdType":"datapack"}`}
        />;
    }
    return (
        <Redirect
            to={'/404'}
        />
    );
}

export { DatapackList } from './datapack-listing';
export { DatapackBoard } from './datapack-board';
export { SubmitFileRequest } from './submit-file-request';