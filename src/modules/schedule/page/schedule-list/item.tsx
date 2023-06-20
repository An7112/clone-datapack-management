import { DefaultPaginatedRowContainer, PaginationRow } from '@gotecq/paginated';
import { mergeClass, typeFrequency } from '@gotecq/utils';
import { Schedule } from '@/models';
import { EntityUserCompact } from '@gotecq/component.entity';
import { FormatDate } from '@gotecq/format';
import { ScheduleStatusLabel, TableCellContainer } from '@/component';
import { Tooltip } from 'antd';

import React, { memo, useEffect } from 'react';
import { DatapackEntity, ScheduleEntity } from '@/entity';
import { User } from '@gotecq/model';
import { useSelector } from 'react-redux';

export const CustomScheduleRow = memo(({
    data,
    isActive,
    grid,
    onSelect,
    onActive,
    handleDeleteSuccess,
    schema,
    cells,
    className,
    isSelected,
    paginatedRef,
    ...rest
}: PaginationRow<Schedule> & {
    handleDeleteSuccess: any
}) => {
    const [, entityData] = ScheduleEntity.useLocalEntity({ _id: data?._id });

    return <DefaultPaginatedRowContainer
        className={mergeClass(className, 'schedule-item')}
        onClick={() => onActive?.(data)}
        $grid={grid}
    >
        {cells.slice(0, 1)}
        <TableCellContainer>
            <div className='scheduling-name'>
                <Tooltip title={data.datapack_name}>
                    <b className='truncate'>
                        {`${data.datapack_name} > ${typeFrequency(data?.frequency_time ?? {} as any)}`}
                    </b>
                </Tooltip>
            </div>
        </TableCellContainer>
        <TableCellContainer>
            <EntityUserCompact id={data._creator} truncate showTooltip tooltipPlacement='topLeft' />
        </TableCellContainer>
        <TableCellContainer>
            <FormatDate type="calendar" value={data.last_job} />
        </TableCellContainer>
        <TableCellContainer>
            <FormatDate type="calendar" value={data.next_job} />
        </TableCellContainer>
        <TableCellContainer>
            <ScheduleStatusLabel className='label-status' type={entityData?.enable ? 'active' : 'inactive'} />
        </TableCellContainer>
    </DefaultPaginatedRowContainer>;
});

