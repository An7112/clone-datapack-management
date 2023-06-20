import React, { memo, useContext } from 'react';
import { Tooltip } from 'antd';
import { LinkOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DefaultPaginatedRowContainer, PaginationRow } from '@gotecq/paginated';
import { FormatFileSize, formatter } from '@gotecq/format';
import { EmptyValue } from '@gotecq/s8-component';

import { URIIcon } from '@/asset';
import { ResourceModel } from '@/models';
import {
    EditResourceURI,
    EditResourceLink,
    ReplaceFileModal,
    EditResourceFile,
    ResourceStatusLabel,
} from '@/component';
import { mergeClass } from '@gotecq/utils';
import { useHistory } from 'react-router-dom';
import { PermissionBoardContext } from '@/context';

export const ResourceItemView = memo(({
    data,
    datapackId,
    handleOpenModalPreview,
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
}: PaginationRow<ResourceModel> & {
    datapackId: string,
    handleOpenModalPreview: (resource_id: string) => void
}) => {
    const { kind, status, _updated, description, display, path, length } = data;
    const history = useHistory();
    const { disableWithVisibilityRestrictedPublic,
        disableWithLock,
        disableWithExpirationData,
        disableWithAccessUserViewer,
        disableWithAccessUserEditor,
    } = useContext(PermissionBoardContext);

    if (!kind) return null;

    const Icon = {
        FILE: <FileTextOutlined />,
        FILE_LINK: <LinkOutlined />,
        FILE_URI: <URIIcon />,
    };

    console.log(data);

    const ResourceActionList = () => {

        return <>
            {kind === 'FILE_LINK' && <EditResourceLink
                disable={(disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithExpirationData() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                datapackId={datapackId}
                resourceId={data._id}
                onSubmitSucess={paginatedRef.refresh}
            />}
            {kind === 'FILE_URI' && <EditResourceURI
                disable={(disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithExpirationData() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                datapackId={datapackId}
                resourceId={data._id}
                onSubmitSucess={paginatedRef.refresh}
            />}
            {kind === 'FILE' && <>
                <ReplaceFileModal
                    disable={(disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithExpirationData() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                    datapackId={datapackId}
                    fileData={data}
                    onReplaceSuccess={paginatedRef.refresh}
                />
                <EditResourceFile
                    disable={(disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithExpirationData() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                    datapackId={datapackId}
                    resourceId={data._id}
                    onSubmitSucess={paginatedRef.refresh}
                />
            </>}
        </>;
    };


    return <DefaultPaginatedRowContainer
        className={mergeClass(className, 'content__row resource-item')}
        onClick={() => {
            if (kind === 'FILE') {
                history.push(`/file-manager:${datapackId}/file-list:${data._id}/file-preview`);
            } else {
                window.open(data.content, '_blank');
            }
        }}
    >
        {cells.slice(0, 1)}
        <div className='item-information'>
            <div className='content'>
                <div className='content__cell wrap-resource-name truncate'>
                    <div className='resource-name truncate ellipsis'>
                        {Icon[kind]} &nbsp;&nbsp;
                        <Tooltip title={display} placement='topLeft'>
                            {/* <EmptyValueWrap> */}
                            <span className='resource-name truncate'>{display}</span>
                            {/* </EmptyValueWrap> */}
                        </Tooltip>
                        {description
                            && <Tooltip title={description} placement='top' className='info-circle'>
                                &nbsp;&nbsp;<InfoCircleOutlined />
                            </Tooltip>
                        }
                    </div>
                    <div className="description truncate">
                        {path ? <Tooltip title={`${path}`} placement='bottomLeft'>
                            {`${path}`}
                        </Tooltip> : <span className="empty-description truncate">
                            <EmptyValue />
                        </span>}
                    </div>
                </div>
                <div className='content__cell truncate col-2'>
                    {data.submitter_name
                        ? data.submitter_email
                            ? <>
                                <Tooltip placement='topLeft' title={() => <div onClick={(e) => e.stopPropagation()}>
                                    <span>{data.submitter_email}</span>
                                </div>} overlayClassName='author-tooltip'>
                                    <span className='author item-view'>{`${data.submitter_name}`}</span>
                                </Tooltip>
                            </>
                            : <div>
                                <span className='author item-view'>{data.submitter_name}</span>
                            </div>
                        : <i className='label-system'><b>System</b></i>}
                    <span className='author item-view'>{formatter.date.calendar(_updated)}</span>
                </div>
                <div className='content__cell truncate'>
                    <FormatFileSize value={length} />
                </div>
                <div className="content__cell">
                    <ResourceStatusLabel type={status.toLowerCase() === 'orphaned' ? 'pending' : status.toLowerCase() as any} />
                </div>
                <div className="content__cell action">
                    <ResourceActionList />
                </div>
            </div>
        </div>

    </DefaultPaginatedRowContainer>;
});