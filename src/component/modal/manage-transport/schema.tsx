import React, { useRef, useState } from 'react';
import { PaginatedSpecialMeta, PaginationSchema } from '@gotecq/paginated';
import { TransportModel, TransportUserModel } from '@/models';
import { ActionButton, EmptyValue, Loading } from '@gotecq/s8-component';
import { EditTransport } from './edit-transport';
import { EntityUserCompact } from '@gotecq/component.entity';
import { useRequest } from '@gotecq/access';
import { QueryAPI } from '@/access';
import { useSelector } from 'react-redux';
import { User } from '@gotecq/model';

const ActionMenu = ({ data, handleUpdateTransportSuccess }: { data: TransportModel, handleUpdateTransportSuccess: () => void }) => {
    const editTransportRef = useRef<any>();
    const [refresh, setRefresh] = useState(0);
    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );

    return (
        <>
            <ActionButton.Edit
                onClick={() => editTransportRef.current?.open()}
                className="transport-edit-button"
                theme="major"
                disabled={data._creator !== userInfo._id}
            />
            <EditTransport
                key={refresh}
                transportId={data._id}
                ref={editTransportRef}
                onEditSuccess={() => {
                    handleUpdateTransportSuccess();
                    setRefresh(prev => prev + 1);
                }}
            />
        </>
    );
};

const ListAccessedUser = ({ row }) => {
    const [{ data, isLoading }] = useRequest<TransportUserModel[]>(QueryAPI.transport.listAccessedUsers(row._id));

    if (isLoading) {
        return <><Loading.Icon /></>;
    }

    if (!data || data.length === 0) {
        return <EmptyValue />;
    }
    return <div className='list-accessed-users'>
        {data.map(item => <EntityUserCompact showTooltip tooltipPlacement='top' showIcon id={item.user_id} block key={item._id} />)}
    </div>;
};

export const transportSchema = ({
    handleSuccessUpdateTransport,
    refresh,
}): PaginationSchema<TransportModel> =>
    [
        {
            ...PaginatedSpecialMeta.INDEX,
            grid: '40px',
            header: ['ID'],
        },
        {
            key: ['name'],
            header: ['Transport Name'],
            sortable: [true],
            content: [({ data }) => <div className='cell-transport-name truncate'>
                <div className='truncate'>{data.name}</div>
                <EntityUserCompact showTooltip truncate id={data._creator} />
            </div>],
            grid: '1fr',
        },
        {
            key: ['type'],
            header: ['Type'],
            sortable: [true],
            grid: '100px',
        },
        {
            key: ['accessed_user'],
            header: ['User'],
            sortable: [false],
            content: [({ data }) => <ListAccessedUser key={refresh} row={data} />],
            grid: '2fr',
        },
        {
            key: ['action'],
            sortable: [false],
            grid: '80px',
            align: 'center',
            content: [({ data }) => <ActionMenu key={data._updated} data={data} handleUpdateTransportSuccess={handleSuccessUpdateTransport} />],
        },
    ];