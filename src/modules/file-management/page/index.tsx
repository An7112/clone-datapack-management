import React from 'react';
import { Redirect } from 'react-router';
import { BrowsingLayout } from '@gotecq/layout';
import { useParams } from 'react-router-dom';
import './style.scss';
import { FileOverviewNavbar } from './navbar';

export class FileManagerLayout extends BrowsingLayout {
    module = 'file-manager'
    panelParam = {
        primary: {
            'fileId': { default: true },
        },
        secondary: {},
        extension: {},
    }

    render() {
        return <div className='overview-layout'>
            <FileOverviewNavbar
                layoutService={this.layoutManager.createLayoutService('primary', this.panelParam)}
            />
            <div className='browsing-layout balanced-browsing-layout file-preview-layout'>
                {this.extensionPanel()}
                {this.primaryPanel()}
                {this.secondaryPanel()}
            </div>
        </div>;
    }
}

export function HomePage() {
    const { rootId } = useParams() as any;
    const normalizedDatasetId = rootId ?? '';
    return (
        <Redirect
            to={`/file-manager${normalizedDatasetId}/file-list/file-preview`}
        />
    );
}

export { PreviewFile } from './file-preview';
export { FileList } from './file-list';