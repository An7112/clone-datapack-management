import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { Select, Button } from 'antd';
import Immutable from 'immutable';
import { CaretDownOutlined, PlusOutlined, FileAddOutlined } from '@ant-design/icons';

import { ComposeHeader, NonDataPanel, S8Button, S8Modal } from '@gotecq/s8-component';
import { PaginatedDefaultHeader, PaginatedTable, PaginationRow, paginatedPropsBridge, PaginatedRef } from '@gotecq/paginated';

import { CommandAPI, DataProfile, QueryAPI, Requestor } from '@/access';
import { ResourceModel } from '@/models';
import { RealTimeAccess } from '@/access';
import { ResourceItemView } from './resource-item-view';

import { DatapackEntity } from '@/entity';
import { resourceSchema } from './schema';
import { actionSuccessReporter } from '@gotecq/access';
import { errorNotification, formatSingularPlural, handleResponse } from '@/util';
import './resource-list.scss';
import { PermissionBoardContext } from '@/context';
import { BatchResultModal, DefaultDataBatchResult } from '@gotecq/component.complex-component';

export type ResourceListProps = {
    datapackId: string,
    redirectPanel: () => void
}

type ResourceType = 'FILE' | 'LINK' | 'URI';
type ResourceStatus = 'MISSING' | 'MATCHED' | 'INVALID' | 'UNMATCHED';

export const ResourceList: React.FC<ResourceListProps> = ({
    datapackId, redirectPanel,
}) => {
    const batchResultRef = useRef<any>(null);
    const resourceListRef = useRef<PaginatedRef<ResourceModel>>(null);
    const modalPreviewRef = useRef<any>();
    const { disableWithVisibilityRestrictedPublic,
        disableWithLock,
        disableWithExpirationData,
        disableWithAccessUserViewer,
        disableWithAccessUserEditor,
    } = useContext(PermissionBoardContext);

    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<any>([]);
    const [resourceType, setResourceType] = useState<ResourceType>();
    const [resourceStatus, setResourceStatus] = useState<ResourceStatus>();
    const [listResults, setListResults] = useState<DefaultDataBatchResult[]>([]);

    const [, datapackDataEntity] = DatapackEntity.useEntity({ _id: datapackId });

    useEffect(() => {
        resourceListRef.current?.selectDispatcher({
            type: 'DeselectAll',
            payload: {},
        });
        setResourceType(undefined);
        setResourceStatus(undefined);
        setFilter([]);
    }, [datapackId]);

    useEffect(() => {
        const unsubscribe = RealTimeAccess.subscribe('REFRESH_RESOURCE_TABLE', () => {
            resourceListRef.current?.refresh();
        });
        return () => unsubscribe();
    }, [resourceListRef]);

    const onChangeDropdownType = (value: string) => {
        setFilter(currFilter => {
            const filteredOldKey = currFilter.map(item => {
                if (!item.kind) return item;
                return {};
            });
            return [...filteredOldKey, { kind: value }];
        });

        setResourceType(value as any);
    };
    const onChangeDropdownStatus = (value: string) => {
        setFilter(currFilter => {
            const filteredOldKey = currFilter.map(item => {
                if (!item.status) return item;
                return {};
            });
            return [...filteredOldKey, { status: value }];
        });
        setResourceStatus(value as any);
    };

    const filterString = JSON.stringify(filter);
    useEffect(() => {
        if (filterString !== resourceListRef?.current?.paginatedState?.filter) {
            resourceListRef.current?.urlDispatcher({ type: 'SetQueryState', payload: { filter } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterString]);

    const onFetchFinish = (data) => {
        if (data?.length === 0 && filter?.length === 0) {
            if (page > 1) {
                setPage(1);
            }
        }
    };

    const ResourceListHeader = (props) => {
        return <PaginatedDefaultHeader type="transparent" className="resource-custom-header" {...props}>
            {({ renderSearchBox, renderTitle, total }) => {
                return (
                    <>
                        <ComposeHeader.HeaderTitle
                            {...paginatedPropsBridge.title(props)}
                            title={formatSingularPlural(props)}
                            className="title-wrap"
                        />
                        {props.paginatedState.paginationData.totalItem > 0
                            && ((!disableWithVisibilityRestrictedPublic() && !disableWithLock() && !disableWithExpirationData() && !disableWithAccessUserViewer()) || disableWithAccessUserEditor())
                            && <ComposeHeader.HeaderItem right>
                                <S8Button
                                    className='btn-add-resource-header'
                                    type='ghost' icon={<PlusOutlined />}
                                    onClick={redirectPanel}
                                >
                                    Add Resource
                                </S8Button>
                            </ComposeHeader.HeaderItem>}
                        <ComposeHeader.HeaderItem>
                            <Select
                                className='resource-list--dropdown'
                                allowClear
                                onChange={onChangeDropdownType}
                                suffixIcon={<CaretDownOutlined />}
                                value={resourceType}
                                placeholder="Type"
                            >
                                <Select.Option key="FILE" value="FILE">
                                    File
                                </Select.Option>
                                <Select.Option key="FILE_LINK" value="FILE_LINK">
                                    Link
                                </Select.Option>
                                <Select.Option key="FILE_URI" value="FILE_URI">
                                    URI
                                </Select.Option>
                            </Select>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem>
                            <Select
                                className='resource-list--dropdown select-status'
                                allowClear
                                suffixIcon={<CaretDownOutlined />}
                                onChange={onChangeDropdownStatus}
                                value={resourceStatus}
                                placeholder="Status"
                            >
                                <Select.Option key="MISSING" value="MISSING">
                                    Missing
                                </Select.Option>
                                <Select.Option key="MATCHED" value="MATCHED">
                                    Matched
                                </Select.Option>
                                <Select.Option key="CONFLICT" value="CONFLICT">
                                    Conflict
                                </Select.Option>
                                <Select.Option key="ORPHANED" value="ORPHANED">
                                    Pending
                                </Select.Option>
                            </Select>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem className="search-box">
                            <ComposeHeader.ControlledHeaderSearchInput
                                {...paginatedPropsBridge.search(props)}
                            />
                        </ComposeHeader.HeaderItem>
                    </>
                );
            }}
        </PaginatedDefaultHeader>;
    };

    const EmptyComp = () => <div className='empty-resource-comp'>
        <NonDataPanel
            title='There are no pending resources here yet.'
            children={<>
                {((!disableWithVisibilityRestrictedPublic() && !disableWithLock() && !disableWithExpirationData() && !disableWithAccessUserViewer()) || disableWithAccessUserEditor()) && <>
                    <p>Click the button below to start adding new resources</p>
                    {/* UI btn có vấn đề khi switch giữa no data vs có data nên phải sài btn*/}
                    <button onClick={redirectPanel}
                        className='table-btn-upload'
                    ><PlusOutlined /> Upload New Resource</button>
                    {/* <S8Button
                        onClick={redirectPanel}
                        className='table-btn-upload'
                        icon={<PlusOutlined />} type='primary'>
                        Upload New Resource
                    </S8Button> */}
                </>}
            </>}
        />
    </div>;

    const Item = useCallback((props: PaginationRow<ResourceModel>) => {
        return <ResourceItemView {...props} datapackId={datapackId} handleOpenModalPreview={handleOpenModalPreview} />;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datapackId]);

    const handleOpenModalPreview = (resource_id: string) => {
        modalPreviewRef.current.open(resource_id);
    };

    const handleDelete = (listItem: ResourceModel[]) => {
        S8Modal.confirm({
            title: 'Delete Resource',
            content: `Are you sure you want to delete ${listItem?.length > 1 ? listItem.length + ' resources' : 'this resource'}?`,
            onOk: async () => {
                try {
                    const allReponses = await Promise.allSettled(
                        listItem.map(async (item) => {
                            return Requestor.request.POST(CommandAPI.datapack.resource.delete(datapackId), {
                                data: {
                                    _iid: item._iid,
                                },
                            });
                        }),
                    );

                    const allResults = allReponses.map((item: any) => {
                        if (item.status === 'fulfilled') {
                            const itemIdSuccess = item?.value?.data?._resp?.[0]?.data?._id ?? item?.value?._resp?.[0]?.data?._id;
                            return ({
                                result: 'Success',
                                _id: itemIdSuccess,
                                name: listItem.find(item => item._id === itemIdSuccess)?.display,
                                reason: '',
                            });
                        }
                        else {
                            const itemIdError = JSON.parse(item?.reason?.config?.data)['_iid'];
                            return ({
                                reason: item?.reason?.response?.data?.message ?? item?.reason?.message,
                                result: 'Failed',
                                _id: itemIdError,
                                name: listItem.find(item => item._iid === itemIdError)?.display,
                            });
                        };
                    });

                    setListResults(allResults as any);
                    batchResultRef.current.open();

                    // actionSuccessReporter({
                    //     action: 'Delete',
                    //     target: 'Resource',
                    // });
                    resourceListRef.current?.refresh();
                    DatapackEntity.refreshItem({ _id: datapackId });
                } catch (e: any) {
                    errorNotification(e, 'Delete Resource Failed');
                } finally {
                    resourceListRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} });
                }
            },
        });
    };



    const handleDownload = async (selected: Record<string, ResourceModel>) => {
        const listSelected = Object.values(selected);
        const listIdItem = Object.keys(selected);

        if (listSelected.find(item => item.kind !== 'FILE') && listSelected.find(item => item.kind === 'FILE')) {
            S8Modal.confirm({
                title: 'Can’t download links and URIs',
                content: <>Only file resources can be downloaded. <br />
                    Do you want to uncheck selected links/URIs and download files only?</>,
                onOk: async () => {
                    try {
                        const newListIdItem = listSelected.filter(item => item.kind === 'FILE').map(item => item._id);

                        window.open(`${QueryAPI.datapack.resource.download(datapackId)}?resource_ids=${JSON.stringify(newListIdItem)}`);
                    } catch (e: any) {
                        errorNotification(e, 'Download Resource Failed');
                    } finally {
                        resourceListRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} });
                    }
                },
            });
        } else if (listSelected.find(item => item.kind !== 'FILE')) {
            S8Modal.confirm({
                title: 'Can’t download links and URIs',
                content: <>Only file resources can be downloaded. <br />
                    Please reselect resources to proceed.</>,
                onOk: () => resourceListRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} }),
            });
        } else {
            try {
                window.open(`${QueryAPI.datapack.resource.download(datapackId)}?resource_ids=${JSON.stringify(listIdItem)}`);
            } catch (e: any) {
                errorNotification(e, 'Download Resource Failed');
            } finally {
                resourceListRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} });
            }
        }
    };

    return (
        <>
            <BatchResultModal
                title='Batch Result > Delete Resource'
                titleColumnName='Resource Name'
                defaultValue={listResults}
                ref={batchResultRef}
                noPadding
                onOK={() => resourceListRef.current?.refresh()}
                onCloseModal={() => resourceListRef.current?.refresh()}
                isTooltipName
            />
            <PaginatedTable<ResourceModel>
                // key={datapackId}
                ref={resourceListRef}
                title="Resource"
                className="resource-list"
                baseDataURL={QueryAPI.datapack.resource.all(datapackId)}
                defaultFilter={Immutable.fromJS([
                    ...filter,
                ]) as any}
                schema={resourceSchema}
                NonData={() => <EmptyComp key={datapackId} />}
                onQuerySuccess={onFetchFinish}
                Header={ResourceListHeader}
                hideOnePageFooter={9}
                defaultPageSize={15}
                defaultPage={1}
                defaultBatchMode
                onActive={() => { }}
                BatchAction={(props) => {
                    return <>
                        <ComposeHeader.HeaderItem right>
                            <Button type='primary' size='small'
                                onClick={() => {
                                    handleDownload(props?.selectState?.batchSelected);
                                }}
                            > Download </Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem>
                            <Button type='primary' size='small'
                                // disabled={(datapackDataEntity?.lock ?? undefined) || disableWithVisibilityRestrictedPublic()}
                                onClick={() => {
                                    handleDelete(Object.values(props?.selectState?.batchSelected));
                                }}
                            > Delete </Button>
                        </ComposeHeader.HeaderItem>
                    </>;
                }}
                Row={Item}
                keyExtractor={(item) => item._id}
            />
        </>
    );
};

export { ResourceItemView } from './resource-item-view';
