import { PaginatedRef, PaginatedTable, PaginationRow, PaginationSchema } from '@gotecq/paginated';
import { ComposePanel } from '@gotecq/s8-component';
import { QueryAPI } from '@/access';
import { RetrievalHistory } from '@/models';
import React, { useRef, useCallback } from 'react';
import { CustomRetrievalHistoryRow } from './item';
import './style.scss';
const RetrievalHistorySchema: PaginationSchema<RetrievalHistory> = [
    {
        key: ['id'],
        header: ['ID'],
        sortable: [true],
        grid: '1fr',
    },
    {
        key: ['resources_total'],
        header: ['Datapack Resources'],
        sortable: [true],
        align: 'left',
        grid: '2fr',
    },
    {
        key: ['start_time'],
        header: ['Retrieved Date'],
        sortable: [true],
        align: 'left',
        grid: '2fr',
    },
    {
        key: ['status'],
        header: ['Status'],
        sortable: [true],
        grid: '2fr',
    },
    {
        key: ['detail'],
        header: ['Action'],
        sortable: [false],
        grid: '1fr',
    },
];
export function RetrievalHistoryList({ schedule_entry_id }) {
    const paginatedRef = useRef<PaginatedRef<RetrievalHistory>>(null);

    const Item = useCallback((props: PaginationRow<RetrievalHistory>) => {
        return <CustomRetrievalHistoryRow {...props} />;
    }, []);

    return (
        <>
            <ComposePanel.SectionHeader
                containerProps={{
                    className: 'title-datapack-retrieval-history',
                }}
                title='Datapack Retrieval History'
            />
            <PaginatedTable<RetrievalHistory>
                title="Retrieval History"
                ref={paginatedRef}
                className="retrieval-history-list"
                baseDataURL={QueryAPI.schedule.task.all(schedule_entry_id)}
                Header={() => null}
                schema={RetrievalHistorySchema}
                hideOnePageFooter={9}
                defaultPageSize={5}
                defaultPage={1}
                Row={Item}
                keyExtractor={(item) => item._id}
            />
        </>
    );
}
