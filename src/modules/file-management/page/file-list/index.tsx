import React, { useCallback, useRef, useEffect } from 'react';
import { PaginatedTable, PaginatedRef, PaginationRow } from '@gotecq/paginated';
import { ResourceModel } from '@/models';
import { ComposeHeader } from '@gotecq/s8-component';
import { CustomFileRow } from './item-row';
import { QueryAPI } from '@/access';
import { LayoutPanelComponent } from '@gotecq/layout';
import './style.scss';
import { formatSingularPlural } from '@/util';

export const FileList = ({ layoutService }: LayoutPanelComponent) => {
    const tableRef = useRef<PaginatedRef<ResourceModel>>(null);

    const datapackId = layoutService.getRootId() ?? '';
    const { fileId = '' } = layoutService.getParam('primary');

    useEffect(() => {
        tableRef.current?.selectDispatcher({
            type: 'SetActive',
            payload: {
                id: fileId,
                data: tableRef.current.paginatedState.dataList.find(item => item._id === fileId) as any,
            },
        });

    }, [fileId]);

    const onQuerySuccess = (data: ResourceModel[]) => {
        if (!fileId && data?.length > 0 && data) {
            layoutService
                .addParam('primary', {
                    'fileId': data?.[0]._id,
                })
                .go();
            tableRef.current?.selectDispatcher({
                type: 'SetActive',
                payload: {
                    id: data[0]._id,
                    data: data[0],
                },
            });
        }
    };

    const Item = useCallback((props: PaginationRow<ResourceModel>) => {
        return <CustomFileRow {...props} />;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleActive = (data: ResourceModel) => {
        if (data) {
            layoutService
                .addParam('primary', {
                    'fileId': data._id,
                })
                .go();
        }
    };

    return (
        <>
            {/* <ComposeHeader type='tertiary' className='title-list'>
                <ComposeHeader.HeaderTitle title='Documents' />
            </ComposeHeader> */}
            <PaginatedTable<ResourceModel>
                ref={tableRef}
                className='file-table-list'
                title='Document'
                baseDataURL={QueryAPI.datapack.resource.kind_file(datapackId)}
                Header={(props) => {
                    return <ComposeHeader className="paginated-header" type="tertiary" wrap>
                        <ComposeHeader.HeaderItem>
                            <ComposeHeader.HeaderTitle
                                title={formatSingularPlural(props)}
                            />
                        </ComposeHeader.HeaderItem>
                    </ComposeHeader>;
                }}
                HeaderRow={() => <></>}
                schema={[
                    {
                        key: ['display'],
                        header: ['Resource'],
                        sortable: [true],
                        grid: '1.5fr',
                    },
                    {
                        key: ['sent_time'],
                        grid: '150px',
                    },
                ]}
                hideOnePageFooter={10000}
                defaultPageSize={10000}
                Row={Item}
                defaultPage={1}
                keyExtractor={(item) => item._id}
                defaultActiveId={fileId}
                onActive={handleActive}
                onQuerySuccess={onQuerySuccess}
            />
        </>
    );
};
