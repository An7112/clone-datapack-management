import React, { memo } from 'react';
import { DefaultPaginatedRowContainer, PaginationRow } from '@gotecq/paginated';
import { mergeClass } from '@gotecq/utils';
import { FormatDate, FormatFileSize, formatter, FormatText } from '@gotecq/format';
import { EmptyValue, getContentTypeIcon } from '@gotecq/s8-component';
import { ResourceModel } from '@/models';
import { EntityUserCompact } from '@gotecq/component.entity';
import { Tooltip } from 'antd';


export const CustomFileRow = memo(({
    data,
    isActive,
    grid,
    onSelect,
    onActive,
    schema,
    cells,
    className,
    isSelected,
    paginatedRef,
    ...rest
}: PaginationRow<ResourceModel>) => {
    console.log(data);

    return <DefaultPaginatedRowContainer
        className={mergeClass(className, 'file-item')}
        $grid={grid}
        onClick={() => onActive?.(data)}
    >
        <div className='content-type-icon'>{getContentTypeIcon(data.content_type)}</div>
        <div className='file-information truncate'>
            <div className='file-name truncate'>
                <Tooltip placement='topLeft' title={data.display}>
                    <span className='display-content truncate'>{data?.display}&nbsp;</span>
                </Tooltip>
                <FormatFileSize value={data?.length} />
            </div>
            <div className='bottom-information'>
                <div className='content-item-row'>
                    <Tooltip placement='bottomLeft' title={data.path}>
                        <span>{data.path}</span>
                    </Tooltip>
                </div>
                <div className='sent-time truncate'>
                    {data.submitter_name
                        ? <span>{data.submitter_name} / {formatter.date.calendar(data._created)}</span>
                        : <span>System / {formatter.date.calendar(data._created)}</span>
                    }
                </div>
            </div>
        </div>
    </DefaultPaginatedRowContainer>;
});

