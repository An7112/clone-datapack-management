import React, { memo, useState, useEffect, useContext } from 'react';
import { dateFormat } from '@gotecq/format';
import { DefaultPaginatedRowContainer, PaginationRow } from '@gotecq/paginated';
import { ActionButton, EmptyValue } from '@gotecq/s8-component';
import { mergeClass } from '@gotecq/utils';
import { ReloadOutlined } from '@ant-design/icons';
import { RetrievalHistoryStatusLabel } from '@/component';
import { RetrievalHistory } from '@/models';
import { CommandAPI, Requestor } from '@/access';
import { errorNotification } from '@/util';
import { actionSuccessReporter } from '@gotecq/access';
import { PermissionBoardContext } from '@/context';

export const CustomRetrievalHistoryRow = memo(({
    data,
    isActive,
    grid,
    onSelect,
    onActive,
    schema,
    id,
    cells,
    className,
    paginatedRef,
    ...rest
}: PaginationRow<RetrievalHistory>) => {
    const [running, setRunning] = useState<boolean>(false);
    const { disableWithExpirationData,
        disableWithLock,
        disableWithVisibilityRestrictedPublic,
        disableWithAccessUserViewer,
        disableWithAccessUserEditor,
    } = useContext(PermissionBoardContext);
    useEffect(() => {
        if (data.status === 'RUNNING') {
            setRunning(false);
        }
    }, [data]);

    const keyList = paginatedRef.paginatedState.dataKeyList;
    const stt = (keyList.indexOf(id) + 1)
        + (paginatedRef.paginatedState.paginationData.page * paginatedRef.paginatedState.paginationData.pageSize)
        - paginatedRef.paginatedState.paginationData.pageSize;


    const handleRetryRetrieve = () => {
        try {
            setRunning(true);

            Requestor.request.POST(CommandAPI.schedule.retry(data._id));
            actionSuccessReporter({
                message: 'Failed data retrieval will be retried, please wait a moment!',
                description: 'You will receive notification soon',
            });
            paginatedRef?.refresh();
        } catch (error) {
            errorNotification(error);
        }
    };

    return (
        <DefaultPaginatedRowContainer
            className={mergeClass(className, 'retrieval-history-item')}
            $grid={grid}
        // onClick={() => onActive?.(data)} 
        >
            <div className='retrieval-history-cell'>{
                stt < 10 ? `0${stt}` : stt
            }</div>
            <div className='retrieval-history-cell'>
                {data?.metadata?.resources_total ? data?.metadata?.resources_total : <EmptyValue />}
            </div>
            <div className='retrieval-history-cell'>
                {dateFormat.numericDatetime(data.start_time, undefined, { hour12: false })}
            </div>
            <div className='retrieval-history-cell status'>
                <RetrievalHistoryStatusLabel type={running ? 'RUNNING' : data.status as any} />
            </div>
            <div className='retrieval-history-cell icon'>
                <ActionButton className='icon-retry'
                    disabled={data.status !== 'FAILED' || running || ((disableWithExpirationData() || disableWithVisibilityRestrictedPublic() || disableWithLock() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor())}
                    onClick={handleRetryRetrieve}
                    children={<ReloadOutlined />}
                    tooltip='Retry'
                />
            </div>
        </DefaultPaginatedRowContainer>
    );
});
