import React from 'react';
import { CollapsiblePanel, LayoutPanelComponent } from '@gotecq/layout';
import { FilterPanel } from '@gotecq/filter';
import { UserInfo } from '@gotecq/access';
import { API_URL, PLATFORM_API_URL } from '@/config';
import { useUserInfo } from '@gotecq/access';
import './style.scss';

export const DatapackFilter = ({ layoutService }: LayoutPanelComponent) => {
    const {
        txt,
        filter = [],
        currentFilter,
    } = layoutService.getParam('primary');
    const userInfo: UserInfo = useUserInfo();

    function onFilterValueChange(payload: any, payloadTree: any) {
        layoutService.addParam('primary', {
            // @TODO: need to remove this
            // filter: payloadTree.map(item => {
            //     if (item['_created:range']) {
            //         return {
            //             '_created:range': item['_created:range'].map((item, index) => {
            //                 return `${item} ${index === 0 ? '00:00:00' : '23:59:59'}`;
            //             })
            //         };
            //     }
            //     return item;
            // }),
            filter: payloadTree,
        }).go();
    };

    function onSavedFilterChange(savedId: string) {
        layoutService.addParam('primary', {
            currentFilter: savedId,
        }).go();
    };

    function onClear() {
        layoutService
            .removeParam('primary', ['currentFilter', 'filter', 'txt'])
            .go();
    };

    return (
        <CollapsiblePanel
            panel='extension'
            active={filter?.[0]}
        >
            <FilterPanel
                urlMap={{
                    'data-foundation-api': API_URL,
                    'tecq-platform-api': PLATFORM_API_URL,
                }}
                title="Filter"
                // @TODO: need to remove this
                // value={filter.map(item => {
                //     if (item['_created:range']) {
                //         return {
                //             '_created:range': item['_created:range'].map((item) => {
                //                 return item?.split(' ')?.[0];
                //             })
                //         };
                //     }
                //     return item;
                // })}
                value={filter}
                forceShowClear={typeof txt === 'string' && txt.length > 0}
                onFilterValueChange={onFilterValueChange}
                onSavedFilterChange={onSavedFilterChange}
                onClear={onClear}
                namespace="datapack-foundation"
                loggedId={userInfo?._id}
                context='datapack-filter'
                currentSavedItemID={currentFilter}
                defaultFields={[
                    '_created:range',
                    'visible:in',
                    'tag_filter:ov',
                    'author__name:in',
                    'status:in',
                ]}
                metaPath="gotecq.data-foundation/datapack/~meta"
            />
        </CollapsiblePanel>
    );
};