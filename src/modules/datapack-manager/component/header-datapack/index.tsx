import React, { useRef, useState } from 'react';
import { paginatedPropsBridge, PaginatedSectionProps } from '@gotecq/paginated';
import { ComposeHeader, S8Button } from '@gotecq/s8-component';
import { ILayoutService } from '@gotecq/layout';
import { PlusOutlined } from '@ant-design/icons';
// import { AddDatapackModal } from '@/component';
import { REFRESH_DATAPACK_AFTER_RETRIEVE } from '@/access';
import { AddDatapackModal } from '@gotecq/component.complex-component';
import { formatSingularPlural } from '@/util';

type DatpackListHeaderProps = {
    layoutService: ILayoutService;
} & PaginatedSectionProps<any, any>;

export function HeaderDatapackList(props: DatpackListHeaderProps) {
    const { layoutService } = props;
    const { txt = '' } = layoutService.getParam('primary');
    const addDatapackModalRef = useRef<any>();
    const [refresh, setRefresh] = useState<number>(0);

    const handleSearch = (value) => {
        if (value === '' && txt !== value) {
            paginatedPropsBridge.search(props).onSearch(value);

            layoutService.removeParam('primary', ['txt']).go();

            return;
        }

        if (value.trim() === '') return;

        paginatedPropsBridge.search(props).onSearch(value);

        layoutService
            .removeParam('primary', ['current_page'])
            .addParam('primary', { txt: value })
            .go();
    };
    return (
        <>
            <AddDatapackModal
                onSubmitSuccess={() => REFRESH_DATAPACK_AFTER_RETRIEVE()}
                ref={addDatapackModalRef}
                onRefresh={() => setRefresh(prev => prev + 1)}
            />
            <ComposeHeader wrap>
                <ComposeHeader.HeaderItem span>
                    <ComposeHeader.HeaderTitle
                        {...paginatedPropsBridge.title(props)}
                        title={formatSingularPlural(props)}
                    />
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderItem right>
                    <S8Button size="small" onClick={() => addDatapackModalRef.current?.open()} >
                        <PlusOutlined /> Add Datapack
                    </S8Button>
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderItem fullWidth>
                    <ComposeHeader.ControlledHeaderSearchInput
                        style={{ width: '100%' }}
                        // className="batch-list-header__search"
                        {...paginatedPropsBridge.search(props)}
                        defaultValue={txt}
                        onSearch={handleSearch}
                    />
                </ComposeHeader.HeaderItem>
            </ComposeHeader>
        </>
    );
}
