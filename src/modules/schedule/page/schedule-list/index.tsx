import React, { useRef, useCallback, useState, useEffect } from 'react';
import { paginatedPropsBridge, PaginatedRef, PaginatedTable, PaginationRow } from '@gotecq/paginated';
import { CommandAPI, QueryAPI, RealTimeAccess, REFRESH_AFTER_ADD_SCHEDULE, Requestor } from '@/access';
import { Schedule } from '@/models';
import { CustomScheduleRow } from './item';
import { scheduleSchema } from './schema';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { LayoutPanelComponent } from '@gotecq/layout';
import { DatapackEntity, ScheduleEntity } from '@/entity';
import { actionSuccessReporter } from '@gotecq/access';
import { ComposeHeader, Loading, S8Button, S8Modal } from '@gotecq/s8-component';
import { errorNotification } from '@/util';
import './style.scss';
import { CreateScheduleRetrieval } from '@/component';
import { BatchResultModal, DefaultDataBatchResult } from '@gotecq/component.complex-component';


export const handleResponse = (allReponses: any, listItem: any, titleName: string) => {
    console.log('🚀 ~ file: index.tsx:20 ~ handleResponse ~ listItem', listItem);
    let listItemIdError = [] as string[];
    const allResults = allReponses.map((item: any) => {
        if (item.status === 'fulfilled') {
            const itemIdSuccess = item?.value?._resp?.[0]?.data?._id ?? item?.value?._resp?.[0]?.data?._id;
            return ({
                result: 'Success',
                _id: itemIdSuccess,
                name: listItem.find(item => item['_id'] === itemIdSuccess)?.[titleName],
                reason: '',
            });
        }
        else {
            const itemIdError = JSON.parse(item?.reason?.config?.data)['scheduler_id'];
            return ({
                reason: item?.reason?.response?.data?.message ?? item?.reason?.message,
                result: 'Failed',
                _id: itemIdError,
                name: listItem.find(item => item['_id'] === itemIdError)?.[titleName],
            });
        };
    });

    return allResults;
};

export function ScheduleList({ layoutService }: LayoutPanelComponent) {
    const titleBatchResultRef = useRef<string>('');
    const batchResultRef = useRef<any>(null);
    const paginatedRef = useRef<PaginatedRef<Schedule>>(null);
    const addSchedulingRef = useRef<any>(null);
    const paramsQ = layoutService.getParam('primary');
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [listResults, setListResults] = useState<DefaultDataBatchResult[]>([]);

    const {
        schedule_entry_id = '',
        txt: paramTxt = '',
        filter: paramFilter,
    } = layoutService.getParam();

    // query list datapack để scheduling có data để check
    useEffect(() => {
        (async () => {
            const data = await Requestor.request.GET(QueryAPI.datapack.all());
            DatapackEntity.updateCollection(data);
        })();
    }, []);

    useEffect(() => {
        paginatedRef.current?.urlDispatcher({ type: 'SetQueryState', payload: { txt: paramTxt } });
    }, [paramTxt]);

    useEffect(() => {
        paginatedRef.current?.urlDispatcher({ type: 'SetQueryState', payload: { filter: paramFilter } });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(paramFilter)]);

    useEffect(() => {
        const unSubFromRereshList = RealTimeAccess.subscribe(REFRESH_AFTER_ADD_SCHEDULE, () => {
            paginatedRef.current?.refresh();

        });

        return () => {
            unSubFromRereshList();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleQuerySuccess = (data) => {
        ScheduleEntity.updateCollection(data);

        const { schedule_entry_id = '' } = layoutService.getParam();

        if (!schedule_entry_id && data.length > 0) {
            paginatedRef.current?.selectDispatcher({
                type: 'SetActive', payload: {
                    id: data[0]._id,
                    data: data[0],
                },
            });
        }

        // query paginated with page = 1 when delete all item in page # 1
        if (data.length === 0) {
            paginatedRef.current?.urlDispatcher({
                type: 'SetQueryState', payload: {
                    page: 1,
                },
            });
        }
    };

    const handleActive = (data) => {
        layoutService
            .addParam('primary', {
                'schedule_entry_id': data._id,
            })
            .go();
    };

    const Item = useCallback((props: PaginationRow<Schedule>) => {
        return <CustomScheduleRow {...props} handleDeleteSuccess={handleDeleteSuccess} />;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDeleteSuccess = (scheduleId: string) => {
        const { schedule_entry_id = '' } = layoutService.getParam();

        if (scheduleId === schedule_entry_id) {
            layoutService
                .removeParam('primary', ['schedule_entry_id'])
                .go();
        }
        paginatedRef.current?.refresh();
    };

    const handleEmptyReset = () => {
        paginatedRef.current?.urlDispatcher({
            type: 'ResetQuery',
        });
        layoutService.removeParam('primary', ['filter', 'currentFilter', 'txt', 'current_page']).go();
    };

    const handleDelete = (listItem: Schedule[]) => {
        S8Modal.confirm({
            title: 'Delete Scheduling',
            content: `Are you sure you want to delete ${listItem?.length > 1 ? listItem.length + ' schedulings' : 'this scheduling'}?`,
            onOk: async () => {
                try {
                    setLoading(true);

                    const allReponses = await Promise.allSettled(
                        listItem.map(async (item) => {
                            return Requestor.request.POST(CommandAPI.schedule.delete(item.datapack_id), {
                                data: {
                                    scheduler_id: item._id,
                                },
                            });
                        }),
                    );

                    const allResults = handleResponse(allReponses, listItem, 'datapack_name');
                    setListResults(allResults as any);

                    titleBatchResultRef.current = 'Batch Result > Delete Retrieval Scheduling';
                    batchResultRef.current.open();

                    // actionSuccessReporter({ target: 'Scheduling', action: 'Delete' });
                    onItemDeleteSuccess(allResults);
                } catch (error: any) {
                    errorNotification(error, 'Delete Scheduling Failed');
                } finally {
                    paginatedRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} });
                    setLoading(false);
                }
            },
        });
    };

    const onItemDeleteSuccess = async (listIdItem: DefaultDataBatchResult[]) => {
        if (listIdItem.find(item => item._id === schedule_entry_id)?.result === 'Success') {
            layoutService.removeParam('primary', ['listId']).go();
        }
        paginatedRef.current?.refresh();
    };

    const handleStatus = async (listItem: Schedule[], enable: boolean) => {
        S8Modal.confirm({
            title: enable ? 'Activate Scheduling' : 'Deactivate Scheduling',
            content: `Are you sure you want to  ${enable ? 'activate' : 'deactivate '} ${listItem?.length > 1 ? listItem.length + ' schedulings' : 'this scheduling'}?`,
            onOk: async () => {
                try {
                    setLoading(true);

                    const allReponses = await Promise.allSettled(
                        listItem.map(async (item) => {
                            return Requestor.request.POST(CommandAPI.schedule.update(item.datapack_id), {
                                data: {
                                    'enable': enable,
                                    scheduler_id: item._id,
                                },
                            });
                        }),
                    );

                    const allResults = handleResponse(allReponses, listItem, 'datapack_name');
                    setListResults(allResults as any);

                    titleBatchResultRef.current = `Batch Result > ${enable ? 'Active' : 'Deactivate'} Retrieval Scheduling`;
                    batchResultRef.current.open();

                    // actionSuccessReporter(({
                    //     message: `${enable ? 'Activate' : 'Deactivate'} Scheduling Successfully!`,
                    // }));
                    paginatedRef.current?.refresh();
                } catch (error) {
                    errorNotification(error, `${enable ? 'Activate' : 'Deactivate'} Scheduling Failed`);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    return (
        <>
            {loading && <Loading.FullView />}
            <CreateScheduleRetrieval
                datapackId={''}
                ref={addSchedulingRef}
                onRefresh={() => setRefresh(prev => prev + 1)}
            />
            <BatchResultModal
                title={titleBatchResultRef.current}
                titleColumnName='Scheduling Name'
                defaultValue={listResults}
                ref={batchResultRef}
                noPadding
                onOK={() => paginatedRef.current?.refresh()}
                onCloseModal={() => paginatedRef.current?.refresh()}
                isTooltipName
            />
            <PaginatedTable<Schedule>
                title="Schedule Retrieval"
                ref={paginatedRef}
                className="schedule-list"
                baseDataURL={QueryAPI.schedule.all()}
                onQuerySuccess={handleQuerySuccess}
                // onQueryFailure={handleQueryFailure}
                activeFirstItemOnSearch
                Header={(props) => {
                    return <ComposeHeader className="paginated-header" type="primary" wrap>
                        <ComposeHeader.HeaderItem>
                            <ComposeHeader.HeaderTitle
                                {...paginatedPropsBridge.title(props)}
                                title={`${props.paginatedState.paginationData.totalItem} ${props.paginatedState.paginationData.totalItem > 1 ? 'Schedulings' : 'Scheduling'}`}
                            />
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem right>
                            <S8Button size="small" onClick={() => addSchedulingRef.current?.open()} >
                                <PlusOutlined /> Add Scheduling
                            </S8Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem fullWidth>
                            <ComposeHeader.ControlledHeaderSearchInput {...paginatedPropsBridge.search(props)} />
                        </ComposeHeader.HeaderItem>
                    </ComposeHeader>;
                }}
                onTxtChange={value => {
                    layoutService.addParam({
                        txt: value,
                    }).go();
                }}
                schema={scheduleSchema}
                hideOnePageFooter={9}
                defaultPageSize={15}
                defaultTxt={paramsQ?.txt}
                defaultActiveId={paramsQ?.schedule_entry_id}
                defaultPage={1}
                defaultBatchMode
                BatchAction={(props) => {
                    return <>
                        <ComposeHeader.HeaderItem right>
                            <Button type='primary' size='small'
                                onClick={() => handleStatus(Object.values(props?.selectState?.batchSelected), false)}
                            >
                                Deactivate
                            </Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem>
                            <Button type='primary' size='small'
                                onClick={() => handleStatus(Object.values(props?.selectState?.batchSelected), true)}
                            >
                                Activate
                            </Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem>
                            <Button type='primary' size='small'
                                onClick={() => handleDelete(Object.values(props?.selectState?.batchSelected))}
                            >
                                Delete
                            </Button>
                        </ComposeHeader.HeaderItem>
                    </>;
                }}
                onEmptyReset={handleEmptyReset}
                Row={Item}
                keyExtractor={(item) => item._id}
                onActive={handleActive}
                activeFirstItemOnMount
            />
        </>
    );
}
