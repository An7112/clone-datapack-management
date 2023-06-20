import React, { useRef } from 'react';
import { Dropdown, Menu } from 'antd';
import { PlusOutlined, LinkOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { ComposeHeader, ComposePanel, S8Button } from '@gotecq/s8-component';

import { DatapackPanelProps } from '../model';
import { DatapackEntity } from '@/entity';
import { UploadFilePanel } from './resource-upload';
import { UILFileUploadAlt, URIIcon } from '@/asset';
import { AddMultipleLinkModal, AddMultipleURIModal, UploadFileModal } from '@/component';
import './style.scss';

export const UploadResourcePanel = ({ datapackId, setSubPanel }: DatapackPanelProps) => {
    const addLinkModalRef = useRef<any>();
    const addURIModalRef = useRef<any>();
    const uploadFileModalRef = useRef<any>();


    const onBack = () => {
        DatapackEntity.refreshItem({ _id: datapackId });
        setSubPanel('main', datapackId);
    };

    return (
        <ComposePanel className='upload-resource-panel'>
            <ComposeHeader type='tertiary'>
                <ComposeHeader.HeaderItem>
                    <S8Button onClick={onBack} className='btn-back' icon={<ArrowLeftOutlined />}>Back</S8Button>
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderTitle title='Upload Resource' />
            </ComposeHeader>
            <ComposePanel.Body>
                <Dropdown
                    trigger={['click']}
                    overlay={<Menu>
                        <Menu.Item key="file"
                            icon={<UILFileUploadAlt />}
                            onClick={() => {
                                uploadFileModalRef.current?.open();
                            }}
                        >File Upload
                        </Menu.Item>
                        <Menu.Item key="link"
                            icon={<LinkOutlined />}
                            onClick={() => {
                                addLinkModalRef.current?.open();
                            }}
                        >Add Links</Menu.Item>
                        <Menu.Item key="uri"
                            icon={<URIIcon />}
                            onClick={() => {
                                addURIModalRef.current?.open();
                            }}
                        >Add URI</Menu.Item>
                    </Menu>}
                    overlayClassName='add-resource-overlay'
                >
                    <S8Button
                        onClick={() => { }}
                        icon={<PlusOutlined />}
                        children='New Resource'
                        type='primary'
                        className='btn-add-resource'
                    />
                </Dropdown>
                <ComposePanel.SectionBody>
                    <UploadFilePanel
                        key={datapackId}
                        datapackId={datapackId}
                    />
                </ComposePanel.SectionBody>
                <AddMultipleLinkModal
                    datapackId={datapackId}
                    ref={addLinkModalRef}
                />
                <AddMultipleURIModal
                    datapackId={datapackId}
                    ref={addURIModalRef}
                />
                <UploadFileModal
                    datapackId={datapackId}
                    ref={uploadFileModalRef}
                />
            </ComposePanel.Body>

        </ComposePanel>
    );
};


