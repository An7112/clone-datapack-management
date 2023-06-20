import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@gotecq/pdf-viewer';
import { ComposeHeader, Loading, NonDataPanel } from '@gotecq/s8-component';
import { DownloadOutlined, ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons';
import { QueryAPI } from '@/access';
import { ErrorBoundary, useRequest } from '@gotecq/access';
import { LayoutPanelComponent } from '@gotecq/layout';
import { Tooltip, Button } from 'antd';
import styled from 'styled-components';
import './style.scss';
import { AttachmentFilePreview } from '@gotecq/component.resource-extension';

export function PreviewFile({ layoutService }: LayoutPanelComponent) {
    const [urlResource, setUrlResource] = useState<string>('');
    // const [scale, setScale] = useState<number>(1);
    // const displayScale = Math.round(scale * 100).toString() + '%';

    const datapackId = layoutService.getRootId() ?? '';
    const { fileId = '' } = layoutService.getParam('primary');

    useEffect(() => {
        setUrlResource(QueryAPI.datapack.resource.preview.file(datapackId, fileId));
    }, [datapackId, fileId]);

    const [{
        isLoading: loading,
        data: documentPreview,
        error,
    }] = useRequest<any>(
        (typeof fileId === 'string' && typeof datapackId === 'string' && fileId !== '' && datapackId !== '')
            ? QueryAPI.datapack.resource.preview.meida(datapackId, fileId) : undefined);

    // const zoomIn = () => {
    //     if (scale >= 5) return;
    //     const nextScale = Math.round((scale + 0.1) * 10) / 10;
    //     setScale(nextScale);
    // };

    // const zoomOut = () => {
    //     if (scale <= 0.1) return;
    //     const nextScale = Math.round((scale - 0.1) * 10) / 10;
    //     setScale(nextScale);
    // };

    const renderPreview = () => {
        // if (loading) return <Loading />;
        if (error) return <ErrorBoundary error={error} />;
        if (documentPreview?.content_type === 'application/pdf') {
            return <PDFViewer
                id="overview-document-preview"
                source={urlResource}
            />;
        } else if (documentPreview?.content_type === 'text/plain') {
            return <AttachmentFilePreview
                resourceName='datapack'
                baseUrl={urlResource.replace('file', 'media')}
                getCustomFileApi={urlResource}
                resourceId='random'
                fileId='random'
            />;
        } else if (documentPreview?.content_type.includes('image')) {
            return <>
                <ComposeHeader
                    className='document-preview-dark-header'
                    title={documentPreview?.filename}
                >
                    {/* <Tooltip title='Zoom out' placement='bottom'>
                        <Button type='text' size="small"
                            onClick={zoomOut}
                            value='zoomOut'><ZoomOutOutlined /></Button>
                    </Tooltip>
                    <Tooltip title='Scale' placement='bottom'>
                        <Button type='text' size="small" className='scale-value' >{displayScale}</Button>
                    </Tooltip>
                    <Tooltip title='Zoom in' placement='bottom'>
                        <Button type='text' size="small"
                            onClick={zoomIn}
                            value='zoomIn'><ZoomInOutlined /></Button>
                    </Tooltip> */}
                    <ComposeHeader.HeaderItem right>
                        {/* <Tooltip title='Download' placement='bottom'> */}
                        <a href={`${urlResource}/download`} target="_blank" rel="noopener noreferrer" className='download-file'>
                            <DownloadOutlined />
                        </a>
                        {/* </Tooltip> */}
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
                <div className='img-preview'>
                    <img
                        src={urlResource}
                        alt={documentPreview?.filename}
                        width='100%'
                    />
                </div>
            </>;
        } else {
            return <>
                <ComposeHeader
                    className='document-preview-dark-header'
                    title={documentPreview?.filename}
                >
                    <ComposeHeader.HeaderItem right>
                        <a href={`${urlResource}/download`} target="_blank" rel="noopener noreferrer" className='download-file'>
                            <DownloadOutlined />
                        </a>
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
                <NonDataPanel title={'Sorry. '} description={<>File type is not supported for preview yet. <br /> Please download to view the document!</>} />
            </>;
        }
    };

    return (
        <div className='preview-resource-container'>
            {renderPreview()}
        </div>
    );
}


// const StyleImageContainer = styled.img<{ $sacle?: number }>`
//     transform: scale(${props => props.$sacle});
//     /* transform-origin: top left; */
//     height: 200%;
//     width: 200%;

// `;