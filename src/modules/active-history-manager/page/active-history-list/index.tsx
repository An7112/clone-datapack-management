import React, { useRef, useEffect } from 'react';
import {
    DatapackTimeline,
} from '@gotecq/component.resource-extension';
import { ComposePanel } from '@gotecq/s8-component';
import { LayoutPanelComponent } from '@gotecq/layout';
import { ItemMapping } from '@/const';



export function ActiveHistoryList({ layoutService }: LayoutPanelComponent) {
    const datapackTLRef = useRef<any>(null);
    const {
        // txt: paramTxt,
        filter: paramFilter = [],
    } = layoutService.getParam();
    useEffect(() => {
        if (!paramFilter || paramFilter.length === 0) {
            datapackTLRef?.current?.setFilterQuery({});
        } else {
            const newParamFilter = [...paramFilter];
            const data = newParamFilter.reduce((previous, current) => {
                return {
                    ...previous,
                    [Object.keys(current)[0]]: Object.values(current)[0],
                };
            }, {} as Record<string, any>);
            datapackTLRef?.current?.setFilterQuery(data);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(paramFilter)]);

    return (
        <ComposePanel className='activity-global-panel'>
            <DatapackTimeline
                ref={datapackTLRef}
                baseUrl='gotecq.base/activity-resource/gotecq.data-foundation/datapack'
                resourceId={''}
                itemMapping={ItemMapping}
            />
        </ComposePanel>
    );
}
