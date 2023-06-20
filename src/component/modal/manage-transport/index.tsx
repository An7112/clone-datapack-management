import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { PaginatedTable, paginatedPropsBridge } from '@gotecq/paginated';
import { ComposeHeader, Loading, S8Button, S8Modal } from '@gotecq/s8-component';

import { CommandAPI, QueryAPI, Requestor } from '@/access';
import { AddTransport } from './add-transport';
import { Button } from 'antd';
import { actionSuccessReporter, errorReporter } from '@gotecq/access';
import { transportSchema } from './schema';
import { formatSingularPlural } from '@/util';
import { TransportModel } from '@/models';
import { BatchResultModal, DefaultDataBatchResult } from '@gotecq/component.complex-component';
import './style.scss';

const handleResponse = (allReponses: any, listItem: any) => {
    const allResults = allReponses.map((item: any) => {
        if (item.status === 'fulfilled') {
            const itemIdSuccess = item?.value?._resp?.[0]?.data?._id ?? item?.value?._resp?.[0]?.data?._id;
            return ({
                result: 'Success',
                _id: itemIdSuccess,
                name: listItem.find(item => item._id === itemIdSuccess)?.name,
                reason: '',
            });
        }
        else {
            const urlSplit = (item?.reason?.config?.url).split('/');
            const itemIdError = urlSplit?.[urlSplit?.length - 1];
            return ({
                reason: item?.reason?.response?.data?.message ?? item?.reason?.message,
                result: 'Failed',
                _id: itemIdError,
                name: listItem.find(item => item._id === itemIdError)?.name,
            });
        };
    });

    return allResults;
};

export const ManageTransport = forwardRef((props, ref) => {
    const batchResultRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [listResults, setListResults] = useState<DefaultDataBatchResult[]>([]);
    const [refresh, setRefresh] = useState(0);

    const listRef = useRef<any>();
    const addTransportRef = useRef<any>();

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const closeModal = () => {
        listRef.current?.selectDispatcher({
            type: 'DeselectAll',
            payload: {},
        });
        setVisible(false);
    };

    const handleDelete = async (listItem: TransportModel[]) => {
        S8Modal.confirm({
            title: 'Delete Transport',
            content: `Are you sure you want to delete ${listItem?.length > 1 ? listItem.length + ' transports' : 'this transport'}?`,
            onOk: async () => {
                try {
                    setLoading(true);

                    const allReponses = await Promise.allSettled(
                        listItem.map(async (item) => {
                            return Requestor.request.POST(CommandAPI.transport.delete(item._id));
                        }),
                    );

                    const allResults = handleResponse(allReponses, listItem);
                    setListResults(allResults as any);
                    batchResultRef.current.open();

                    // actionSuccessReporter({ target: 'Transport', action: 'Delete' });
                    listRef.current.refresh();
                    listRef.current?.selectDispatcher({ type: 'DeselectAll', payload: {} });
                } catch (error: any) {
                    errorReporter(error, {
                        message: 'Delete Transport Failed',
                        description: error?.message?.data ?? error?.response?.data?.message,
                    });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleSuccessUpdateTransport = () => {
        listRef.current?.refresh();
        setRefresh(prev => prev + 1);
    };

    const handleFetchDataFinish = (data: TransportModel[]) => { };

    return (
        <>
            <S8Modal
                className='manage-transport-modal'
                visible={visible}
                width={936}
                closeIcon
                onCancel={closeModal}
                nopadding
            >
                {loading && <Loading.FullView />}
                <BatchResultModal
                    title='Batch Result > Delete Transport'
                    titleColumnName='Transport Name'
                    defaultValue={listResults}
                    ref={batchResultRef}
                    noPadding
                    onOK={() => listRef.current?.refresh()}
                    onCloseModal={() => listRef.current?.refresh()}
                    isTooltipName
                />
                <PaginatedTable<TransportModel>
                    ref={listRef}
                    title='Transport'
                    className="manage-transport-table"
                    baseDataURL={QueryAPI.transport.all()}
                    onQuerySuccess={handleFetchDataFinish}
                    schema={transportSchema({ handleSuccessUpdateTransport, refresh })}
                    Header={(props) => {
                        return <ComposeHeader wrap>
                            <ComposeHeader.HeaderItem span>
                                <ComposeHeader.HeaderTitle
                                    {...paginatedPropsBridge.title(props)}
                                    title={formatSingularPlural(props)}
                                />
                            </ComposeHeader.HeaderItem>
                            <ComposeHeader.HeaderItem >
                                <ComposeHeader.ControlledHeaderSearchInput {...paginatedPropsBridge.search(props)} />
                            </ComposeHeader.HeaderItem>
                            <ComposeHeader.HeaderItem>
                                <S8Button onClick={() => addTransportRef.current?.open()}>
                                    <PlusOutlined /> Create New Transport
                                </S8Button>
                            </ComposeHeader.HeaderItem>
                        </ComposeHeader>;
                    }}
                    BatchAction={(props) => {
                        return <ComposeHeader.HeaderItem right>
                            <Button size='small'
                                onClick={() => {
                                    handleDelete(Object.values(props?.selectState?.batchSelected));
                                }}
                                type='primary'
                            >
                                Delete
                            </Button>
                        </ComposeHeader.HeaderItem>;
                    }}
                    defaultBatchMode
                    defaultPageSize={99999}
                    Footer={() => <></>}
                    keyExtractor={(item) => item._id}
                // onActive={() => { }}
                />
                <ComposeHeader type='tertiary'>
                    <ComposeHeader.HeaderItem right>
                        <S8Button onClick={closeModal}>Close</S8Button>
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </S8Modal>
            <AddTransport key={refresh}
                ref={addTransportRef}
                onAddSuccess={() => listRef.current?.refresh()}
                onRefresh={() => setRefresh(prev => prev + 1)}
            />
        </>
    );
});

export { AddTransport } from './add-transport';