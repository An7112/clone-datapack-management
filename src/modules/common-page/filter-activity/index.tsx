import React from 'react';
import { CollapsiblePanel, LayoutPanelComponent } from '@gotecq/layout';
import { FilterPanel } from '@gotecq/filter';
import { UserInfo } from '@gotecq/access';
import { API_URL, PLATFORM_API_URL } from '@/config';
import { useUserInfo } from '@gotecq/access';
// import './style.scss';

export const ActivityFilter = ({ layoutService }: LayoutPanelComponent) => {
    const {
        txt,
        filter = [],
        currentFilter,
    } = layoutService.getParam('primary');
    const userInfo: UserInfo = useUserInfo();

    function onFilterValueChange(payload: any, payloadTree: any) {
        layoutService.addParam('primary', {
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
                    'tecq-platform': PLATFORM_API_URL,
                }}
                variableMap={{
                    'domain': () => 'gotecq.data-foundation',
                }}
                title="Filter"
                value={filter}
                forceShowClear={typeof txt === 'string' && txt.length > 0}
                onFilterValueChange={onFilterValueChange}
                onSavedFilterChange={onSavedFilterChange}
                onClear={onClear}
                namespace="datapack-foundation"
                loggedId={userInfo?._id}
                context='activity-filter'
                currentSavedItemID={currentFilter}
                defaultFields={[
                    '_created:range',
                    'msglabel:in',
                    'context_user_id:in',
                ]}
                metaPath="gotecq.base/activity-resource/gotecq.data-foundation/datapack/~meta"
            />
        </CollapsiblePanel>
    );
};