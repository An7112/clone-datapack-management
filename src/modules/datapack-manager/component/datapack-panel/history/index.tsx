import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
    DatapackTimeline,
} from '@gotecq/component.resource-extension';
import { ComposeHeader, ComposePanel, S8Button } from '@gotecq/s8-component';
import { DatapackPanelProps } from '../model';
import './style.scss';
import { ItemMapping } from '@/const';

export function HistoryPanel({ datapackId, setSubPanel }: DatapackPanelProps) {
    return (
        <ComposePanel className='history-panel'>
            <ComposeHeader type='tertiary'>
                <ComposeHeader.HeaderItem>
                    <S8Button onClick={() => setSubPanel('main', datapackId)} className='btn-back' icon={<ArrowLeftOutlined />}>Back</S8Button>
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderTitle title='Datapack History' />
            </ComposeHeader>
            <ComposePanel.Body>
                <DatapackTimeline
                    resourceId={datapackId}
                    itemMapping={ItemMapping}
                />
            </ComposePanel.Body>
        </ComposePanel>
    );
}

