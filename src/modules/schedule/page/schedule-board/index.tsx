import React, { useState } from 'react';
import { LayoutPanelComponent } from '@gotecq/layout';
import { ComposeHeader, ComposePanel, NonDataPanel } from '@gotecq/s8-component';
import { IconGird } from '@/asset';
import { DatapackEntity, ScheduleEntity } from '@/entity';
import { SchedulePanel } from '../../component';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { CommandAPI, QueryAPI, Requestor } from '@/access';
import { typeFrequency } from '@gotecq/utils';
import './style.scss';
import { useSelector } from 'react-redux';
import { errorNotification } from '@/util';
import { User } from '@gotecq/model';
import { PermissionBoardContext } from '@/context';
import { AccessUser } from '@/models';

export function ScheduleDetail({ layoutService }: LayoutPanelComponent) {
    const { schedule_entry_id } = layoutService.getParam('primary');
    const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

    const [, scheduleDataEntity] = ScheduleEntity.useLocalEntity({ _id: schedule_entry_id });
    const [, datapackDataEntity] = DatapackEntity.useEntity({ _id: scheduleDataEntity?.metadata.datapack_id ?? '' });

    const [{ data: accessUserList = [], isLoading: loadingAccessUser }, refreshAccessUser] = useRequest<AccessUser[]>(
        scheduleDataEntity?.metadata.datapack_id &&
        QueryAPI.datapack.accessUser.all(scheduleDataEntity?.metadata.datapack_id),
    );

    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );

    const handleUpdateStatus = async (enable: boolean) => {
        try {
            setLoadingStatus(true);
            const updateSchedule = await Requestor.request.POST(CommandAPI.schedule.update(scheduleDataEntity?.datapack_id ?? ''), {
                data: {
                    'enable': enable,
                    scheduler_id: schedule_entry_id,
                },
            });

            if (updateSchedule._status === 'OK') {
                actionSuccessReporter(({
                    message: `${enable ? 'Activate' : 'Deactivate'} Scheduling Successfully!`,
                }));

                ScheduleEntity.refreshItem({ _id: schedule_entry_id });
            }
        } catch (error) {
            errorNotification(error, `${enable ? 'Activate' : 'Deactivate'} Scheduling Failed`);
        } finally {
            setLoadingStatus(false);
        }
    };

    const redirectToDatapack = (datapackId: string) => {
        layoutService
            .setLayout('datapack-manager')
            .setPrimary('datapack-list')
            .setSecondary('datapack-board')
            .setExtension('filter-list')
            .addParam('primary', { 'listId': datapackId, 'listIdType': 'datapack' })
            .go();
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
            && accessUserList.filter(item => item.role === 'EDITOR').map(item => item.member_id).includes(userInfo._id);
    };

    return (
        <div className='schedule-board'>
            <ComposePanel header={() =>
                <ComposeHeader type='secondary'>
                    <ComposeHeader.HeaderTitle
                        className='header-template-detail'
                        icon={<IconGird />}
                        title={scheduleDataEntity?.datapack_name
                            ? `${scheduleDataEntity?.datapack_name} > ${typeFrequency(scheduleDataEntity?.frequency_time ?? {} as any)}`
                            : 'Information'
                        }
                    />
                    {scheduleDataEntity &&
                        <ComposeHeader.HeaderItem right>
                            <Tooltip title={scheduleDataEntity?.enable ? 'Deactivate' : 'Activate'}>
                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    checked={scheduleDataEntity?.enable ? true : false}
                                    loading={loadingStatus}
                                    disabled={(disableWithLock() || disableWithExpirationData() || disableWithVisibilityRestrictedPublic()
                                        || disableWithAccessUserViewer()
                                        || (datapackDataEntity?._creator !== userInfo._id && scheduleDataEntity?._creator !== userInfo._id)) && !disableWithAccessUserEditor()
                                    }
                                    onChange={(value) => handleUpdateStatus(value)}
                                />
                            </Tooltip>
                        </ComposeHeader.HeaderItem>}
                </ComposeHeader>
            }>
                <ComposePanel.Body>
                    <ComposePanel.Section>
                        {schedule_entry_id
                            ? <PermissionBoardContext.Provider value={{
                                disableWithVisibilityRestrictedPublic,
                                disableWithExpirationData,
                                disableWithLock,
                                disableWithAccessUserViewer,
                                disableWithAccessUserEditor,
                            }}>
                                <SchedulePanel
                                    scheduleId={schedule_entry_id}
                                    redirectToDatapack={redirectToDatapack}
                                />
                            </PermissionBoardContext.Provider>
                            : <NonDataPanel title="No entry selected" />
                        }
                    </ComposePanel.Section>
                </ComposePanel.Body>
            </ComposePanel>
        </div>
    );
}
