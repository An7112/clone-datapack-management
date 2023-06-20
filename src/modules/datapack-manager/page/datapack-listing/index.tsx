import React, { useState, useCallback, useRef, useEffect } from 'react';

import { actionSuccessReporter, errorReporter } from '@gotecq/access';
import { LayoutPanelComponent } from '@gotecq/layout';
import { ComposeHeader, S8Modal, Loading, S8Button } from '@gotecq/s8-component';
import { paginatedPropsBridge, PaginatedTable, PaginationRow } from '@gotecq/paginated';
import { DatapackItemView } from './view';
import { DatapackEntity } from '@/entity';
import { CommandAPI, DataProfile, QueryAPI, RealTimeAccess, REFRESH_AFTER_RETRIEVE, REFRESH_FROM_MANAGEMENT_JOB, Requestor } from '@/access';
import { datapackSchema } from './schema';
import { Button } from 'antd';
import { errorNotification, formatSingularPlural, handleResponse } from '@/util';
import { Datapack } from '@gotecq/model';
import { PlusOutlined } from '@ant-design/icons';
import './datapack-list.scss';
import { AddDatapackModal, BatchResultModal, DefaultDataBatchResult } from '@gotecq/component.complex-component';

export type DatapackList = LayoutPanelComponent;
export const DatapackList = ({ layoutService }: DatapackList) => {
    const {
        listId = '',
        listIdType,
        txt: paramTxt,
        filter: paramFilter,
    } = layoutService.getParam();
    const { subPanel = '' } = layoutService.getParam('secondary');

    const titleBatchResultRef = useRef<string>('');
    const batchResultRef = useRef<any>(null);
    const listRef = useRef<any>();
    const addDatapackModalRef = useRef<any>();
    const currentSelected = useRef<Datapack | null>(null);

    const [refresh, setRefresh] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [listResults, setListResults] = useState<DefaultDataBatchResult[]>([]);

    const activeDatapackId = listIdType === 'datapack' ? listId : '';

    const subscribeRealtime = useCallback(() => {
        RealTimeAccess.subscribe(REFRESH_AFTER_RETRIEVE, () => listRef.current?.refresh());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        subscribeRealtime();
    }, [subscribeRealtime]);

    useEffect(() => {
        listRef.current?.urlDispatcher({ type: 'SetQueryState', payload: { txt: paramTxt } });
    }, [paramTxt]);

    useEffect(() => {
        listRef.current?.urlDispatcher({ type: 'SetQueryState', payload: { filter: paramFilter } });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(paramFilter)]);

    const onActivateItem = (data: Datapack) => {
        if (data) {
            currentSelected.current = data;
            layoutService
                .setSecondary('datapack-board')
                .addParam('primary', {
                    'listId': data?._id ?? '',
                    'listIdType': 'datapack',
                })
                .removeParam('secondary', ['subPanel', 'subPanelId', 'subPanelIdType'])
                .addParam('secondary', { 'subPanel': subPanel })
                .go();
        }
    };

    const handleFetchDataFinish = (data: Datapack[]) => {
        DatapackEntity.updateCollection(data);

        const { listId = '' } = layoutService.getParam();

        if (!listId && data.length > 0) {
            listRef.current?.selectDispatcher({
                type: 'SetActive', payload: {
                    id: data[0]._id,
                    data: data[0],
                },
            });
        }

        // query paginated with page = 1 when delete all item in page # 1
        if (data.length === 0) {
            listRef.current?.urlDispatcher({
                type: 'SetQueryState', payload: {
                    page: 1,
                },
            });
        }
    };

    const handleFetchError = useCallback(err => {
        if (!err) return;
        errorReporter(err);
    }, []);

    const onItemDeleteSuccess = async (listIdItem: DefaultDataBatchResult[]) => {
        if (listIdItem.find(item => item._id === listId)?.result === 'Success') {
            layoutService.removeParam('primary', ['listId']).go();
        }
        listRef.current?.refresh();
    };

    const handleEmptyReset = () => {
        listRef.current?.urlDispatcher({
            type: 'ResetQuery',
        });
        layoutService.removeParam('primary', ['filter', 'currentFilter', 'txt', 'current_page']).go();
    };

    const Item = useCallback((props: PaginationRow<Datapack>) => {
        return <DatapackItemView {...props} />;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = (listItem: Datapack[]) => {
        S8Modal.confirm({
            title: 'Delete Datapack',
            content: `Are you sure you want to delete ${listItem?.length > 1 ? listItem.length + ' datapacks' : 'this datapack'}?`,
            onOk: async () => {
                try {
                    setLoading(true);

                    const allReponses = await Promise.allSettled(
                        listItem.map(async (item) => {
                            return Requestor.request.POST(CommandAPI.datapack.delete(item._id));
                        }),
                    );

                    const allResults = handleResponse(allReponses, listItem, 'title');
                    setListResults(allResults as any);

                    titleBatchResultRef.current = 'Batch Result > Delete Datapack';
                    batchResultRef.current.open();

                    onItemDeleteSuccess(allResults);
                    // actionSuccessReporter({ target: 'Datapack', action: 'Delete' });
                } catch (error: any) {
                    errorNotification(error, 'Delete Datapack Failed');
                } finally {
                    listRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} });
                    setLoading(false);
                }
            },
        });
    };

    const handleStatus = async (listItem: Datapack[], lock: boolean) => {
        S8Modal.confirm({
            title: lock ? 'Lock Datapack' : 'Unlock Datapack',
            content: `Are you sure you want to ${lock ? 'lock' : 'unlock '} ${listItem?.length > 1 ? listItem.length + ' datapacks' : 'this datapack'}?`,
            onOk: async () => {
                try {
                    setLoading(true);

                    let allReponses;
                    allReponses = lock
                        ? await Promise.allSettled(
                            listItem.map(async (item) => {
                                return Requestor.request.POST(CommandAPI.datapack.lock(item._id));
                            }),
                        )
                        : await Promise.allSettled(
                            listItem.map(async (item) => {
                                return Requestor.request.POST(CommandAPI.datapack.unlock(item._id));
                            }),
                        );

                    const allResults = handleResponse(allReponses, listItem, 'title');
                    setListResults(allResults as any);

                    titleBatchResultRef.current = `Batch Result > ${lock ? 'Lock' : 'Unlock'} Datapack`;
                    batchResultRef.current.open();

                    // actionSuccessReporter(({
                    //     message: `${lock ? 'Lock' : 'Unlock'} Datapack Successfully!`,
                    // }));
                    listRef.current?.refresh();
                } catch (error) {
                    errorNotification(error, `${lock ? 'Lock' : 'Unlock'} Datapack Failed`);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    return (
        <>
            {loading && <Loading.FullView />}
            <AddDatapackModal
                key={refresh}
                onSubmitSuccess={() => listRef.current?.refresh()}
                ref={addDatapackModalRef}
                onRefresh={() => setRefresh(prev => prev + 1)}
            />
            <BatchResultModal
                title={titleBatchResultRef.current}
                titleColumnName='Datapack Name'
                defaultValue={listResults}
                ref={batchResultRef}
                noPadding
                onOK={() => listRef.current?.refresh()}
                onCloseModal={() => listRef.current?.refresh()}
                isTooltipName
            />
            <PaginatedTable<Datapack>
                ref={listRef}
                title="Datapack"
                className="datapack-list"
                baseDataURL={QueryAPI.datapack.all()}
                schema={datapackSchema}
                activeFirstItemOnSearch
                onQuerySuccess={handleFetchDataFinish}
                onQueryFailure={handleFetchError}
                onTxtChange={value => {
                    layoutService.addParam({
                        txt: value,
                    }).go();
                }}
                Header={(props) => {
                    return <ComposeHeader className="paginated-header" type="primary" wrap>
                        <ComposeHeader.HeaderItem>
                            <ComposeHeader.HeaderTitle
                                {...paginatedPropsBridge.title(props)}
                                title={formatSingularPlural(props)}
                                onClick={() => {
                                    REFRESH_FROM_MANAGEMENT_JOB();
                                }}
                            />
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem right>
                            <S8Button size="small" onClick={() => addDatapackModalRef.current.open()} >
                                <PlusOutlined /> Add Datapack
                            </S8Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem fullWidth>
                            <ComposeHeader.ControlledHeaderSearchInput {...paginatedPropsBridge.search(props)} />
                        </ComposeHeader.HeaderItem>
                    </ComposeHeader>;
                }}
                hideOnePageFooter={9}
                defaultPageSize={10}
                defaultTxt={paramTxt}
                defaultActiveId={activeDatapackId}
                defaultPage={1}
                defaultBatchMode
                BatchAction={(props) => {
                    return <>
                        <ComposeHeader.HeaderItem right>
                            <Button type='primary' size='small' onClick={() => handleStatus(Object.values(props?.selectState?.batchSelected), false)}>Unlock</Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem>
                            <Button type='primary' size='small' onClick={() => handleStatus(Object.values(props?.selectState?.batchSelected), true)}>Lock</Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem>
                            <Button type='primary' size='small' onClick={() => handleDelete(Object.values(props?.selectState?.batchSelected))}>Delete</Button>
                        </ComposeHeader.HeaderItem>
                    </>;
                }}
                onEmptyReset={handleEmptyReset}
                Row={Item}
                keyExtractor={(item) => item._id}
                onActive={onActivateItem}
                activeFirstItemOnMount
            />
        </>
    );
};
