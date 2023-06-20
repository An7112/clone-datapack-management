import React, { useCallback } from 'react';
import { mergeClass } from '@gotecq/utils';
import { ErrorBoundary } from '@gotecq/access';
import { NonSelectPanel } from '@gotecq/s8-component';
import { LayoutPanelComponent } from '@gotecq/layout';

import { searchParam } from '@/util';
import { ErrorResponseMap } from '@/models';
import { DatapackPanel, DatapackPanelProps } from '../../component';
import './style.scss';
import { DatapackEntity } from '@/entity';

const DatapackBoardPanel = ({
    layoutService,
    datapackId,
    subPanelData,
    setSubPanel,
    setFilter,
}: DatapackPanelProps) => {
    const {
        subPanelType = '',
    } = subPanelData ?? { subPanelType: '' };
    const Panel = DatapackPanel[subPanelType ?? 'main'] ?? DatapackPanel['main'];
    const [loading, datapackDataEntity] = DatapackEntity.useEntity({ _id: datapackId });

    if (!datapackDataEntity?._id) {
        return <NonSelectPanel title="Datapack not found." />;
    }

    return <Panel
        layoutService={layoutService}
        datapackId={datapackId}
        subPanelData={subPanelData}
        setSubPanel={setSubPanel}
        setFilter={setFilter}
    />;
};

export const DatapackBoard = ({ layoutService }: LayoutPanelComponent) => {
    const { listId = '', listIdType = '' } = layoutService.getParam('primary');
    const {
        subPanel = searchParam('subPanel', layoutService),
        subPanelId = searchParam('subPanelId', layoutService),
        subPanelIdType = searchParam('subPanelIdType', layoutService),
    } = layoutService.getParam();
    const datapackId = listIdType === 'datapack' ? listId : '';

    const setSubPanel = useCallback((subPanelKey?: string, id?: string, idType?: string) => {
        layoutService
            .removeParam('secondary', ['subPanel', 'subPanelId', 'subPanelIdType'])
            .addParam(
                {
                    ...(subPanelKey ? { 'subPanel': subPanelKey } : {}),
                    ...(id ? { 'subPanelId': id } : {}),
                    ...(idType ? { 'subPanelIdType': idType } : {}),
                })
            .go();
    }, [layoutService]);

    const setFilter = (value: any) => {
        layoutService.addParam('primary', { filter: value.toJS() }).go();
    };

    return <div className={mergeClass('datapack-board', subPanel)}>
        <div className="datapack-board-panel">
            <ErrorBoundary
                codeExtractor={e => e.code}
                errorPropsMap={ErrorResponseMap}
            >
                {datapackId === ''
                    ? <NonSelectPanel title="No Datapack is selected" />
                    : <DatapackBoardPanel
                        key={datapackId}
                        layoutService={layoutService}
                        datapackId={datapackId}
                        setSubPanel={setSubPanel}
                        subPanelData={{
                            subPanelId,
                            subPanelIdType,
                            subPanelType: subPanel,
                        }}
                        setFilter={setFilter}
                    />
                }
            </ErrorBoundary>
        </div>
    </div>;
};
