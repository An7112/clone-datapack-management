import React, { useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Popover } from 'antd';
import { DownloadOutlined, CalendarOutlined, SelectOutlined, UserAddOutlined } from '@ant-design/icons';
import {
    EmptyValue,
    ActionDropdown,
    Loading,
    ComposeHeader, ComposePanel, CoreLabel, S8InfoGrid,
} from '@gotecq/s8-component';
import { actionSuccessReporter, errorReporter, useRequest } from '@gotecq/access';
import { FormatDatePeriod, formatter } from '@gotecq/format';
import { filterEntry, handleFrequencyToTimeZone, mergeClass } from '@gotecq/utils';
import {
    SendDatapack,
    EditDatapack,
    RetrieveDatapack,
    ActionEditVerbose,
    ActionLockVerbose,
    ActionUnlockVerbose,
    DatapackStatusLabel,
    ManageTransport,
    CreateScheduleRetrieval,
    ScheduleStatusLabel,
    DatapackVisibleLabel,
    EditAccessUser,
} from '@/component';
import { DatapackPanelProps } from '../model';
import { DatapackEntity } from '@/entity';
import { ResourceList } from './resource-list';
import { AppNavigator, CommandAPI, DataProfile, QueryAPI, RealTimeAccess, REFRESH_ACCESS_USER_TEXT } from '@/access';
import { FileList3Icon, UILHistory, UILFileImport, UILFileExport, IconPublic, IconRestrictedPublic, IconNonPublic, AccessUserIcon, OwnerAccessIcon, EditAccessIcon, ViewAccessIcon } from '@/asset';
import { getDefaultDatapack, User } from '@gotecq/model';
import { Tooltip, Avatar } from 'antd';
import { AccessUser, MailBatchItemModel, Schedule } from '@/models';
import { errorNotification } from '@/util';
import './panel.scss';
import './datapack-information.scss';
import { useSelector } from 'react-redux';
import { tooltipVisibility, Visibility } from '@/const';
import { PermissionBoardContext } from '@/context';
import { EntityFooterV2 } from '@gotecq/component.resource-extension';
import { FileRequestModal } from '@gotecq/component.complex-component';
import { APP_URL } from '@/config';
import { EntityUser } from '@gotecq/component.entity';
import { BackgroundJobComponent } from '@gotecq/component.complex-component';


const EntityMailBatch = ({ mailBatchId }: { mailBatchId: string }) => {
    const [{ data: datapack }] = useRequest<MailBatchItemModel>(mailBatchId ? QueryAPI.mailBatch.single(mailBatchId) : '');
    return datapack
        ? <div className='truncate' style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <Tooltip title={datapack.name}>
                <span className='truncate'>{datapack?.name}</span>
            </Tooltip>
            <a className='redirect-link'
                href={AppNavigator.mailBatch(mailBatchId)}
                target='_blank' rel="noreferrer"
                onClick={e => e.stopPropagation()}
            >
                <SelectOutlined />
            </a>
        </div>
        : <EmptyValue />;
};
export const DetailedDatapackPanel = ({ datapackId, setSubPanel, layoutService }: DatapackPanelProps) => {
    const editDatapackRef = useRef<any>();
    const editAccessUserRef = useRef<any>();
    const sendDataRef = useRef<any>();
    const retreiveDatapackRef = useRef<any>();
    const createScheduleRef = useRef<any>();
    const fileRequestRef = useRef<any>();
    const manageTransportRef = useRef<any>();

    const history = useHistory();

    const [changeLockLoading, setChangeLockLoading] = useState(false);
    const [refreshTag, setRefreshTag] = useState(0);
    // const [syncLoading, setSyncLoading] = useState(false);
    const [loading, datapackDataEntity] = DatapackEntity.useEntity({ _id: datapackId });
    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );

    const [{ data: scheduling, isLoading: loadingScheduling }, refreshScheduling] = useRequest<Schedule[]>(
        datapackDataEntity?._id &&
        QueryAPI.schedule.filter.idDatapack(datapackDataEntity._id),
    );

    const [{ data: accessUserList = [], isLoading: loadingAccessUser }, refreshAccessUser] = useRequest<AccessUser[]>(
        datapackId &&
        QueryAPI.datapack.accessUser.all(datapackId),
    );

    useEffect(() => {
        if (refreshScheduling) {
            refreshScheduling();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datapackDataEntity?.total_scheduler]);

    useEffect(() => {
        const unSubFromRereshAccessUser = RealTimeAccess.subscribe(REFRESH_ACCESS_USER_TEXT, () => {
            refreshAccessUser(QueryAPI.datapack.accessUser.all(datapackId));
        });

        return () => {
            unSubFromRereshAccessUser();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gridData = filterEntry(datapackDataEntity || getDefaultDatapack, [
        'title',
        'description',
        'tags',
        '_updated',
        'sync_status',
        '_created',
        'status',
        'visible',
        'identifier',
        'author__email',
        'author__name',
        'period__start',
        'period__end',
        'total_file_request',
        'total_scheduler',
        'action_status',
    ]);

    const onLock = async () => {
        try {
            setChangeLockLoading(true);
            await DataProfile.Post(CommandAPI.datapack.unlock(datapackId));
            DatapackEntity.refreshItem({ _id: datapackId });
            actionSuccessReporter({
                message: 'Unlock Datapack Successfully!',
            });
        } catch (error) {
            errorNotification(error, 'Unlock Datapack Failed');
        } finally {
            setChangeLockLoading(false);
        }
    };
    const onUnlock = async () => {
        try {
            setChangeLockLoading(true);
            await DataProfile.Post(CommandAPI.datapack.lock(datapackId));
            DatapackEntity.refreshItem({ _id: datapackId });
            actionSuccessReporter({
                message: 'Lock Datapack Successfully!',
            });
        } catch (error) {
            errorNotification(error, 'Lock Datapack Failed');
        } finally {
            setChangeLockLoading(false);
        }
    };

    const onRetrieveDataSuccess = (datapackId: string) => {
        history.push(`/datapack-manager/datapack-list/datapack-board/filter-list?q={"listId":"${datapackId}","listIdType":"datapack"}`);
    };

    const redirectToUploadPanel = () => {
        setSubPanel('upload_resource', datapackId, 'datapack');
    };

    const onApplyTag = async (selectedList, allList) => {
        try {
            const resp = await DataProfile.Post(CommandAPI.datapack.update(datapackId), {
                data: {
                    ...datapackDataEntity,
                    tags: selectedList?.map(item => item?.code),
                },
            });
            DatapackEntity.refreshItem({ _id: datapackId });
            actionSuccessReporter({
                action: 'Update',
                target: 'Tags',
            });
            setRefreshTag(prev => prev + 1);
            return resp;
        }
        catch (error: any) {
            errorNotification(error, 'Update Tags Failed');
        }
    };

    const redirectToScheduler = (schedulerId: string) => {
        layoutService
            ?.setLayout('schedule-manager')
            .setPrimary('schedule-list')
            .setSecondary('schedule-board')
            .setExtension('filter-list')
            .addParam('primary', { 'schedule_entry_id': schedulerId })
            .go();
    };

    const redirectToSchedulerWithFilter = (datapackName: string) => {
        layoutService
            ?.setLayout('schedule-manager')
            .setPrimary('schedule-list')
            .setSecondary('schedule-board')
            .setExtension('filter-list')
            .addParam('primary', {
                filter: [{
                    'datapack_name:in': [datapackName],
                }],
            })
            .go();
    };

    const SchedulingList = ({ totalScheduling }: { totalScheduling: number }) => {
        return scheduling && scheduling?.length > 0
            ? <Popover
                placement='right'
                content={() => {
                    return <div className='scheduling-popover-container'>
                        {scheduling.slice(0, 5).map((schedule, index) => {
                            return <div className='scheduling-item' onClick={() => redirectToScheduler(schedule._id)} key={schedule._id}>
                                <div className='scheduling-name'>{handleFrequencyToTimeZone(schedule.frequency_time, true)}</div>
                                <div className='scheduling-status'>
                                    <ScheduleStatusLabel className='label-status' type={schedule?.enable ? 'active' : 'inactive'} />
                                </div>
                            </div>;
                        })}
                        {scheduling.length > 5 && <div className='scheduling-item btn-view-all'
                            onClick={() => redirectToSchedulerWithFilter(scheduling[0].datapack_name)}
                        >
                            View all
                        </div>}
                    </div>;
                }}>
                <div className='total-scheduling-value'>
                    <span>{totalScheduling}</span>
                    <SelectOutlined />
                </div>
            </Popover>
            : <>0</>;
    };

    const renderIcon = (visible: 'PUBLIC' | 'RESTRICTEDPUBLIC' | 'NONPUBLIC') => {
        if (visible === 'PUBLIC') {
            return <IconPublic className='panel-title-icon' />;
        } else if (visible === 'RESTRICTEDPUBLIC') {
            return <IconRestrictedPublic className='panel-title-icon' />;
        } else if (visible === 'NONPUBLIC') {
            return <IconNonPublic className='panel-title-icon' />;
        } else {
            return <FileList3Icon className='panel-title-icon' />;
        }
    };

    const disableWithVisibilityRestrictedPublic = () => {
        return (datapackDataEntity?.visible === 'RESTRICTEDPUBLIC' && userInfo._id !== datapackDataEntity?._creator);
    };

    const disableWithExpirationData = () => {
        return datapackDataEntity?.system_tag?.includes('expired') ?? false;
    };

    const disableWithLock = () => {
        return (datapackDataEntity?.lock ?? undefined);
    };

    const disableWithAccessUserViewer = () => {
        return (datapackDataEntity?.visible === 'NONPUBLIC' || datapackDataEntity?.visible === 'RESTRICTEDPUBLIC')
            && accessUserList.filter(item => item.role === 'VIEWER').map(item => item.member_id).includes(userInfo._id);
    };

    const disableWithAccessUserEditor = () => {
        return (datapackDataEntity?.visible === 'NONPUBLIC' || datapackDataEntity?.visible === 'RESTRICTEDPUBLIC')
            && accessUserList.filter(item => item.role === 'EDITOR').map(item => item.member_id).includes(userInfo._id) ? true : false;
    };

    return (
        <PermissionBoardContext.Provider value={{
            disableWithExpirationData,
            disableWithLock,
            disableWithVisibilityRestrictedPublic,
            disableWithAccessUserViewer,
            disableWithAccessUserEditor,
        }}>
            <ComposePanel
                header={() => <ComposeHeader wrap type="secondary" className='datapack-detail-header'>
                    <ComposeHeader.HeaderTitle
                        title={datapackDataEntity?.title ?? 'INFORMATION'}
                        className='header-title'
                        icon={renderIcon(datapackDataEntity?.visible ?? 'PUBLIC' as any)}
                    />
                    <SendDatapack
                        datapackId={datapackId}
                        ref={sendDataRef}
                        datapackName={datapackDataEntity?.title}
                    />
                    <RetrieveDatapack
                        datapackId={datapackId}
                        ref={retreiveDatapackRef}
                        onSubmitSuccess={onRetrieveDataSuccess}
                    />
                    <CreateScheduleRetrieval
                        datapackId={datapackId}
                        ref={createScheduleRef}
                    />
                    <ManageTransport ref={manageTransportRef} />
                    <FileRequestModal ref={fileRequestRef}
                        urlMap={{
                            queryListPath: { url: QueryAPI.datapack.path(datapackId) },
                            queryListFileRequest: {
                                url: QueryAPI.fileRequest.all(datapackId),
                            },
                            commandDeleteFileRequest: { url: CommandAPI.fileRequest.delete(datapackId) },
                            commandEnableFileRequest: { url: CommandAPI.fileRequest.enable(datapackId) },
                            commandDisableFileRequest: { url: CommandAPI.fileRequest.disable(datapackId) },
                            commandCreateFileRequest: { url: CommandAPI.fileRequest.create(datapackId) },
                            commandUpdateFileRequest: { url: CommandAPI.fileRequest.update(datapackId) },
                            commandShareFileRequest: { url: CommandAPI.fileRequest.share(datapackId) },
                        }}
                        disableBtnCreate={(disableWithExpirationData() || disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                        disableBtnEdit={(disableWithExpirationData() || disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                        disableBtnShare={(disableWithExpirationData() || disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()}
                        disableDateField
                        creatorResourceId={datapackDataEntity?._creator ?? ''}
                        handleUrlShareFileQuest={(id: string) => {
                            return `${APP_URL()}tecq/dtp/datapack-public/file-request:${id}`;
                        }}
                    />
                    <EditAccessUser key={datapackId}
                        ref={editAccessUserRef}
                        onSubmitSuccess={() => {
                            setRefreshTag(prev => prev + 1);
                        }}
                        onRefresh={() => {
                            DatapackEntity.refreshItem({ _id: datapackId });
                        }}
                        datapackId={datapackId}
                        visibility={datapackDataEntity?.visible ?? 'unknown'}
                    />
                    <ComposeHeader.HeaderItem className='header-action-list'>
                        {/* <ComposeHeader.HeaderItem>
                            {((datapackDataEntity && !disableWithVisibilityRestrictedPublic() && userInfo._id === datapackDataEntity._creator) ||
                                disableWithAccessUserEditor()) && !disableWithExpirationData()
                                && <>
                                    {(datapackDataEntity?.lock
                                        ? <ActionLockVerbose
                                            onClick={onLock}
                                            isLoading={changeLockLoading}
                                            textTooltip='Unlock'
                                            size='md'
                                            className={mergeClass('locked-icon')}
                                        />
                                        : <ActionUnlockVerbose
                                            size='md'
                                            textTooltip='Lock'
                                            onClick={onUnlock}
                                            isLoading={changeLockLoading}
                                            className={mergeClass('unlocked-icon')}
                                        />)}
                                </>}
                        </ComposeHeader.HeaderItem> */}
                        <ComposeHeader.HeaderItem>
                            <BackgroundJobComponent
                                query={QueryAPI.backgroundJob.all('gotecq.data-foundation', 'datapack', datapackId)}
                                transformTableSchema={(schema) => {
                                    schema[6].content = [({ data }) => {
                                        return <EntityMailBatch mailBatchId={data.job_attribute?.['batch_id']} />;
                                    }];
                                    return schema;
                                }}
                            />
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem className='datapack-menu'>
                            {!disableWithExpirationData() &&
                                <ActionDropdown
                                    placement='bottomRight'
                                    actionList={[
                                        {
                                            key: 'file-request',
                                            containerProps: {
                                                onClick: () => {
                                                    fileRequestRef.current?.open();
                                                },
                                            },
                                            children: <div className='datapack-action-item' >
                                                <FileList3Icon className='file-request-icon' />
                                                <span>File Request</span>
                                            </div>,
                                        },
                                        {
                                            key: 'import',
                                            containerProps: {
                                                disabled: (disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor(),
                                                onClick: () => {
                                                    if (datapackDataEntity?.lock) {
                                                        errorReporter(null, {
                                                            message: 'Datapack is locked',
                                                            description: 'Please unlock datapack before doing this action',
                                                        });
                                                    } else {
                                                        retreiveDatapackRef.current?.open();
                                                    }
                                                },
                                            },
                                            children: <div className={`datapack-action-item ${((datapackDataEntity?.lock || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()) ? 'disabled' : ''}`}>
                                                <UILFileImport />
                                                <span>Retrieve Data</span>
                                            </div>,
                                        },
                                        {
                                            key: 'send',
                                            containerProps: {
                                                disabled: (disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor(),
                                                onClick: () => sendDataRef.current?.open(),
                                            },
                                            children: <div className={`datapack-action-item ${((disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()) ? 'disabled' : ''}`}>
                                                <UILFileExport />
                                                <span>Send Data</span>
                                            </div>,
                                        },
                                        {
                                            key: 'Schedule',
                                            containerProps: {
                                                disabled: (disableWithLock() || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor(),
                                                onClick: () => {
                                                    if (datapackDataEntity?.lock) {
                                                        errorReporter(null, {
                                                            message: 'Datapack is locked',
                                                            description: 'Please unlock datapack before doing this action',
                                                        });
                                                    } else {
                                                        createScheduleRef.current?.open();
                                                    }
                                                },
                                            },
                                            children: <div className={`datapack-action-item ${((datapackDataEntity?.lock || disableWithVisibilityRestrictedPublic() || disableWithAccessUserViewer()) && !disableWithAccessUserEditor()) ? 'disabled' : ''}`}>
                                                <CalendarOutlined />
                                                <span>Schedule Retrieval</span>
                                            </div>,
                                        },
                                        {
                                            key: 'download',
                                            children: <a className='datapack-action-item'
                                                href={QueryAPI.datapack.download(datapackId)}
                                                target="_blank" rel="noreferrer"
                                            >
                                                <DownloadOutlined />
                                                <span>Download Resource</span>
                                            </a>,
                                        },
                                        {
                                            key: 'history',
                                            containerProps: {
                                                onClick: () => setSubPanel('history', datapackId, 'datapack'),
                                            },
                                            children: <div className='datapack-action-item'>
                                                <UILHistory />
                                                <span>History</span>
                                            </div>,
                                        },
                                    ]}
                                >Menu</ActionDropdown>}
                        </ComposeHeader.HeaderItem>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem fluid fullWidth className='section-tag'>
                        <EntityFooterV2
                            tagSectionProps={{
                                namespace: 'gotecq.data-foundation',
                                prefix: <b>Tags</b>,
                                tagInfoList: [
                                    {
                                        type: 'FLAG',
                                        selectedTagList: datapackDataEntity?.system_tag ?? [],
                                        maxDisplay: 4,
                                    },
                                    {
                                        type: 'TAG',
                                        selectedTagList: datapackDataEntity?.tags ?? [],
                                        onApply: onApplyTag,
                                        maxDisplay: 4,
                                    },
                                ],
                            }}
                        />
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>}
                fullHeight
                className="datapack-detail-panel"
            >
                {loading && <Loading.FullView />}
                <ComposePanel.Body>
                    <ComposePanel.Section>

                        <ComposePanel.SectionBody>
                            <EditDatapack key={refreshTag}
                                datapackId={datapackId}
                                ref={editDatapackRef}
                                onhandleSuccess={() => DatapackEntity.refreshItem({ _id: datapackId })}
                            />
                            <ComposePanel.SectionHeader
                                className='title-general-information no-margin-top'
                                title='General Information'
                                children={((!disableWithLock() && !disableWithVisibilityRestrictedPublic() && !disableWithExpirationData() && !disableWithAccessUserViewer()) || disableWithAccessUserEditor()) &&
                                    <ActionEditVerbose
                                        onClick={() => editDatapackRef.current?.open()}
                                        children='Edit'
                                    />
                                }
                            />
                            <S8InfoGrid
                                containerProps={{
                                    className: 'datapack-general-information grid-layout',
                                }}
                                data={gridData}
                                order={['description']}
                                maxColumn={1}
                            />
                            <S8InfoGrid
                                containerProps={{
                                    className: 'datapack-general-information grid-layout general-custom-layout',
                                }}
                                data={gridData}
                                order={['status', 'access']}
                                maxColumn={3}
                                schema={{
                                    status: {
                                        label: <b>Visibility</b>,
                                        value: ({ data }) => <Tooltip title={tooltipVisibility(gridData.visible, userInfo._id === datapackDataEntity?._creator)}>
                                            <DatapackVisibleLabel type={Visibility[gridData.visible]} />
                                        </Tooltip>,
                                    },
                                    access: {
                                        containerProps: { className: 'column-access-user' },
                                        label: <b>Users with Access <AccessUserIcon /></b>,
                                        value: ({ data }) => <>
                                            {loadingAccessUser
                                                ? <EntityUser loading />
                                                : <div className='access-user-list'>
                                                    {accessUserList.filter(item => item.role === 'OWNER').map(user => {
                                                        return <EntityUser showTooltip
                                                            id={user.member_id}
                                                            avatarOverlay={<div className='type-access-icon-wrapper'><OwnerAccessIcon /></div>}
                                                        />;
                                                    })}
                                                    {accessUserList?.length > 1
                                                        && accessUserList.filter(item => item.role === 'EDITOR').map(user => {
                                                            return <EntityUser showTooltip
                                                                id={user.member_id}
                                                                avatarOverlay={<div className='type-access-icon-wrapper'><EditAccessIcon /></div>}
                                                            />;
                                                        })
                                                    }
                                                    {accessUserList?.length > 1
                                                        && accessUserList.filter(item => item.role === 'VIEWER').map(user => {
                                                            return <EntityUser showTooltip
                                                                id={user.member_id}
                                                                avatarOverlay={<div className='type-access-icon-wrapper'><ViewAccessIcon /></div>}
                                                            />;
                                                        })
                                                    }
                                                    {userInfo._id === datapackDataEntity?._creator && <Tooltip title='Update user with access'>
                                                        <span onClick={() => editAccessUserRef.current?.open()}>
                                                            <Avatar className="add-access-user-btn"
                                                                size="large"
                                                                icon={<UserAddOutlined />}
                                                            />
                                                        </span>
                                                    </Tooltip>}
                                                </div>
                                            }
                                        </>,
                                    },
                                }}
                            />
                            <ComposePanel.SectionHeader
                                className='title-general-information'
                                title='Detailed Information'
                            />
                            <S8InfoGrid
                                containerProps={{
                                    className: 'datapack-general-information grid-layout',
                                }}
                                data={gridData}
                                order={['identifier', 'status', 'effective_period', 'total_scheduler', 'author__name', 'author__email', 'total_file_request', '_created', '_updated']}
                                schema={{
                                    identifier: {
                                        label: <b>UID</b>,
                                    },
                                    _updated: {
                                        label: <b>Last Modified Date</b>,
                                        value: ({
                                            data,
                                        }) => formatter.date.numericCalendar(data),
                                    },
                                    _created: {
                                        label: <b>Created Date</b>,
                                        value: ({
                                            data,
                                        }) => formatter.date.numericCalendar(data),
                                    },
                                    effective_period: {
                                        label: <b>Effective Period</b>,
                                        value: ({ obj }) => (obj.period__start || obj.period__end)
                                            ? <FormatDatePeriod
                                                from={obj.period__start}
                                                to={obj.period__end}
                                                type='numericCalendar'
                                                label={{ from: '', to: '–' }}
                                                oneLine />
                                            : <EmptyValue />,
                                    },
                                    total_scheduler: {
                                        label: <b>Scheduled Retrieval</b>,
                                        value: ({ data }) => <>
                                            {loadingScheduling
                                                ? <Loading.Icon />
                                                : <SchedulingList totalScheduling={Number(data)} />
                                            }
                                        </>,
                                    },
                                    status: {
                                        label: <b>Status</b>,
                                        value: ({ data }) => <DatapackStatusLabel type={
                                            (gridData?.sync_status?.toUpperCase() === 'SYNCING'
                                                ? gridData?.sync_status.toUpperCase()
                                                : gridData?.status
                                            ) as any}
                                        />,
                                    },
                                    author__name: {
                                        label: <b>Contact Name</b>,
                                    },
                                    author__email: {
                                        label: <b>Contact Email</b>,
                                    },
                                    total_file_request: {
                                        label: <b>File Request</b>,
                                        value: ({ data }) => <>{data}</>,
                                    },
                                }}
                            />
                        </ComposePanel.SectionBody>
                        <ResourceList
                            datapackId={datapackId}
                            redirectPanel={redirectToUploadPanel}
                        />
                    </ComposePanel.Section>
                </ComposePanel.Body>
            </ComposePanel >
        </PermissionBoardContext.Provider >
    );
};