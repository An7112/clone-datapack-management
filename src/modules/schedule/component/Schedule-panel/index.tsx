import React, { useRef, useContext } from 'react';
import { addressFormat, dateFormat, FormatDate, FormatGender, FormatText } from '@gotecq/format';
import { ComposePanel, EmptyValue, Loading, S8InfoGrid, S8InfoList } from '@gotecq/s8-component';
import { filterEntry, handleFrequencyToTimeZone, handleFrequencyToUTC } from '@gotecq/utils';
import { DatapackEntity, ScheduleEntity } from '@/entity';
import { defaultSchedule, TransportModel, TransportUserModel } from '@/models';
import { EntityUserCompact } from '@gotecq/component.entity';
import { useRequest } from '@gotecq/access';
import { QueryAPI } from '@/access';
import { Popover, Tooltip } from 'antd';
import { InfoCircleOutlined, SelectOutlined } from '@ant-design/icons';
import './style.scss';
import { RetrievalHistoryList } from './retrieval-history';
import { ActionEditVerbose, EditScheduleRetrieval } from '@/component';
import { Datapack, User } from '@gotecq/model';
import { PermissionBoardContext } from '@/context';
import { useSelector } from 'react-redux';
import { getTimeZone } from '@/util';

const ListAccessedUser = ({ id }) => {
    const [{ data, isLoading }] = useRequest<TransportUserModel[]>(QueryAPI.transport.listAccessedUsers(id));

    if (isLoading) {
        return <><Loading.Icon /></>;
    }

    if (!data || data.length === 0) {
        return <EmptyValue />;
    }
    return <div className='list-accessed-users'>
        {data.map(item => <EntityUserCompact showIcon id={item.user_id} block key={item._id} />)}
    </div>;
};

const handleTooltipTitle = (date: string | undefined | null) => {
    if (!date) return;
    return `Local time: ${date} ${getTimeZone()}`;
};

export function SchedulePanel({ scheduleId, redirectToDatapack }) {
    const [loading, scheduleDataEntity] = ScheduleEntity.useLocalEntity({ _id: scheduleId });
    const [, datapackDataEntity] = DatapackEntity.useEntity({ _id: scheduleDataEntity?.metadata.datapack_id ?? '' });

    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );
    const { disableWithExpirationData,
        disableWithLock,
        disableWithVisibilityRestrictedPublic,
        disableWithAccessUserViewer,
        disableWithAccessUserEditor } = useContext(PermissionBoardContext);
    const editCheduleRef = useRef<any>();

    const gridData = filterEntry(scheduleDataEntity || defaultSchedule, [
        '_created',
        '_creator',
        '_deleted',
        '_etag',
        '_id',
        '_updated',
        '_updater',
        'action',
        'application_name',
        'description',
        'enable',
        'frequency_time',
        'last_job',
        'metadata',
        'next_job',
        'scheduled_by',
    ]);

    const [{ data: transport }] = useRequest<TransportModel>(
        scheduleDataEntity?.metadata.transport_id &&
        QueryAPI.transport.single(scheduleDataEntity.metadata.transport_id),
    );

    const [{ data: inforUser }] = useRequest<User>(
        scheduleDataEntity?._creator &&
        QueryAPI.user.single(scheduleDataEntity._creator),
    );

    const [{ data: datapack }] = useRequest<Datapack>(
        scheduleDataEntity?.metadata.datapack_id &&
        QueryAPI.datapack.single(scheduleDataEntity.metadata.datapack_id),
    );

    const InforTransport = () => {
        return <div className='truncate'>
            {transport?.name}&nbsp;
            <Popover
                placement='right'
                content={
                    <S8InfoList.AlignLeft
                        containerProps={{
                            className: 'transport-information',
                        }}
                        data={transport ?? {}}
                        order={['name', 'type', 'accessuser']}
                        schema={{
                            name: {
                                label: <b>Transport Name</b>,
                                value: ({ data }) => <div>{data}</div>,
                            },
                            type: {
                                label: <b>Type</b>,
                                value: ({ data }) => <div>{data}</div>,
                            },
                            accessuser: {
                                label: <b>Accessed users</b>,
                                value: ({ data }) => <ListAccessedUser id={transport?._id} />,
                            },
                        }}
                    />
                }>
                <InfoCircleOutlined />
            </Popover>
        </div>;
    };

    const InforUser = () => {
        return <Popover
            placement='top'
            content={
                <S8InfoList.AlignLeft
                    containerProps={{
                        className: 'user-information',
                    }}
                    data={inforUser ?? {}}
                    order={['_creator', 'gender', 'telecom__phone', 'address']}
                    schema={{
                        _creator: {
                            label: <b>Creator Name</b>,
                            value: ({ data }) => <EntityUserCompact id={inforUser?._id} />,
                        },
                        gender: {
                            label: <b>Gender</b>,
                            value: ({ data }) => <FormatGender value={data} type="normal" />,
                        },
                        telecom__phone: {
                            label: <b>Phone Number</b>,
                            value: ({ data }) => <FormatText format="phone" value={data} />,
                        },
                        address: {
                            label: <b>Address</b>,
                            value: ({ data }) => <span className='truncate'>{addressFormat.mapAddress(inforUser)}</span>,
                        },
                    }}
                />
            }>
            <InfoCircleOutlined />
        </Popover>;
    };

    return (
        <div className='schedule-panel'>
            {loading && <Loading.FullView />}
            <EditScheduleRetrieval
                schedule_entry_id={scheduleId}
                ref={editCheduleRef}
            />
            <ComposePanel.Section>
                <ComposePanel.SectionBody>
                    <ComposePanel.SectionHeader
                        className='title-scheduling-information'
                        title='Scheduling Information'
                        children={((scheduleDataEntity?.enable && !disableWithExpirationData() && !disableWithLock() && !disableWithVisibilityRestrictedPublic()
                            && !disableWithAccessUserViewer() &&
                            (userInfo._id === datapackDataEntity?._creator || userInfo._id === scheduleDataEntity._creator))
                            || disableWithAccessUserEditor()
                        ) &&
                            <ActionEditVerbose
                                onClick={() => editCheduleRef.current?.open()}
                                children='Edit'
                            />
                        }
                    />
                    <S8InfoGrid
                        containerProps={{
                            className: 'schedule-general-information schedule-information-grid',
                        }}
                        data={gridData}
                        order={['frequency_time', 'next_job', 'last_job']}
                        schema={{
                            frequency_time: {
                                label: <b className='truncate'>Frequency</b>,
                                value: ({ data }) => <Tooltip placement='right'
                                    title={handleTooltipTitle(handleFrequencyToTimeZone(data, true))}>
                                    <span>{`${handleFrequencyToUTC(data, true)} (UTC)` ?? <EmptyValue />}</span>
                                </Tooltip>,
                            },
                            next_job: {
                                label: <b className='truncate'>Next Retrieval</b>,
                                value: ({ data }) => {
                                    const nextRunUTC = dateFormat.datetime(data, undefined, { hour12: false, factorTimezone: false });
                                    const nextRunTZ = dateFormat.datetime(data, undefined, { hour12: false });
                                    return <Tooltip placement='right' title={handleTooltipTitle(nextRunTZ)}>{
                                        data
                                            ? <span>{`${nextRunUTC} (UTC)`}</span>
                                            : <EmptyValue />
                                    }</Tooltip>;
                                },
                            },
                            last_job: {
                                label: <b className='truncate'>Last Retrieval</b>,
                                value: ({ data }) => {
                                    const lastRunUTC = dateFormat.datetime(data, undefined, { hour12: false, factorTimezone: false });
                                    const lastRunTZ = dateFormat.datetime(data, undefined, { hour12: false });
                                    return <Tooltip placement='right' title={handleTooltipTitle(lastRunTZ)}>{
                                        data
                                            ? <span>{`${lastRunUTC} (UTC)`}</span>
                                            : <EmptyValue />
                                    }</Tooltip>;
                                },
                            },
                        }}
                    />
                    <ComposePanel.SectionHeader
                        containerProps={{
                            className: 'title-datapack-retrieval-information',
                        }}
                        title='Datapack Retrieval Information'
                    />
                    <S8InfoGrid
                        containerProps={{
                            className: 'schedule-general-information datapack-retrieval-information-grid',
                        }}
                        data={gridData}
                        order={['application_name', 'metadata', 'next_job', '_creator', 'scheduled_by', '_created']}
                        schema={{
                            application_name: {
                                label: <b className='truncate'>Datapack Name</b>,
                                value: ({ data }) => <div onClick={() => {
                                    if (redirectToDatapack) {
                                        redirectToDatapack(scheduleDataEntity?.datapack_id);
                                    }
                                }} className='datapack-name'>
                                    <span>{datapack?.title}</span>
                                    <SelectOutlined />
                                </div>,
                            },
                            next_job: {
                                label: <b className='truncate'>Transport</b>,
                                value: ({ data }) => <InforTransport />,
                            },
                            metadata: {
                                label: <b className='truncate'>Retrieval Source</b>,
                                value: ({ data }) => <div>{data.location}</div>,
                            },
                            _creator: {
                                label: <b className='truncate'>Scheduling Creator</b>,
                                value: ({ data }) => <div ><EntityUserCompact id={data} /></div>,
                            },
                            scheduled_by: {
                                label: <b className='truncate'>Creator Contact</b>,
                                value: ({
                                    data,
                                }) => <FormatText value={inforUser?.telecom__email} truncate action={['mail', 'copy']} />,
                            },
                            _created: {
                                label: <b className='truncate'>Created Date</b>,
                                value: ({
                                    data,
                                }) => <FormatDate type="calendar" truncate value={data} />,
                            },
                        }}
                    />
                </ComposePanel.SectionBody>
                <RetrievalHistoryList schedule_entry_id={scheduleId} />
            </ComposePanel.Section>
        </div>
    );
}
