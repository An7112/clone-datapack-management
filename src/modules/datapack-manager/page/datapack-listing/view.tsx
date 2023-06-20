import React, { memo, useEffect } from 'react';
import { Datapack, User } from '@gotecq/model';
import { FormatDate, formatter } from '@gotecq/format';
import { DatapackStatusLabel, TableCellContainer } from '@/component';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { EmptyValue } from '@gotecq/s8-component';
import { DefaultPaginatedRowContainer, PaginationRow } from '@gotecq/paginated';
import { mergeClass } from '@gotecq/utils';
import { DatapackEntity } from '@/entity';
import { useSelector } from 'react-redux';

export const DatapackItemView = memo(({
    data,
    isActive,
    grid,
    onSelect,
    onActive,
    schema,
    cells,
    className,
    paginatedRef,
    isSelected,
    ...rest
}: PaginationRow<Datapack>) => {
    const [, entityData] = DatapackEntity.useEntity({ _id: data?._id });
    // const userInfo: User = useSelector(
    //     (state: any) => state.auth.userInfo,
    // );

    // useEffect(() => {
    //     data._creator !== userInfo._id && paginatedRef?.selectDispatcher({
    //         type: 'SetUnselectable', payload: {
    //             id: [data._id],
    //             removeCurrentlySelect: true,
    //         },
    //     });
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return <DefaultPaginatedRowContainer
        className={mergeClass(className, 'datapack-item')}
        onClick={() => onActive?.(data)}
        $grid={grid}
    >
        {cells.slice(0, 1)}
        <TableCellContainer className='table-cell'>
            <div className='datapack-name'>
                <Tooltip title={<div>{data?.title ?? <EmptyValue />}</div>} >
                    <b className='truncate'>
                        {entityData?.title}
                    </b>
                </Tooltip>
                {entityData?.description && <Tooltip title={entityData.description}>
                    <InfoCircleOutlined />
                </Tooltip>}
            </div>
        </TableCellContainer>
        <TableCellContainer className='table-cell truncate'>
            <div className='author'>
                {entityData?.author__name
                    ? <Tooltip title={<div>{entityData?.author__name ?? <EmptyValue />}</div>} >
                        <span className='truncate'>{entityData?.author__name}</span>
                    </Tooltip>
                    : <EmptyValue />}
            </div>
        </TableCellContainer>
        <TableCellContainer className='table-cell truncate'>
            <span className='truncate'>
                {formatter.date.calendar(entityData?._created)}
            </span>
        </TableCellContainer>
        <TableCellContainer className='table-cell truncate'>
            <span className='truncate'>
                <FormatDate value={entityData?._updated} type='calendar' />
            </span>
        </TableCellContainer>
        <TableCellContainer className='table-cell'>
            <DatapackStatusLabel className='label-status' type={(entityData?.sync_status?.toUpperCase() === 'SYNCING' ? entityData?.sync_status.toUpperCase() : entityData?.status) as any} />
        </TableCellContainer>
    </DefaultPaginatedRowContainer>;
});