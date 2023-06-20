import React from 'react';
import { ILayoutService } from '@gotecq/layout';
import { CommandAPI, QueryAPI } from '@/access';
import { SubmitFileRequestComponent } from '@gotecq/component.complex-component';
import './style.scss';

export const SubmitFileRequest = ({ layoutService }: { layoutService: ILayoutService }) => {
    const { fileRequestId = '' } = layoutService.getParam('primary');

    return (<SubmitFileRequestComponent
        urlMap={{
            queryFileRequest: { url: QueryAPI.fileRequest.singlePublic(fileRequestId) },
            commandSubmitFileRequest: { url: CommandAPI.fileRequest.submitFile(fileRequestId) },
        }}
    />);
};