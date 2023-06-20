import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { S8Modal } from '@gotecq/s8-component';
import { DatapackEditForm } from './edit-datapack-form';
import { DatapackEntity } from '@/entity';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { QueryAPI, REFRESH_ACCESS_USER } from '@/access';
import { AccessUser } from '@/models';

type EditDatapackProps = {
    datapackId: string,
    onhandleSuccess: () => void
}

export const EditDatapack = forwardRef(({ datapackId, onhandleSuccess }: EditDatapackProps, ref) => {
    const [visible, setVisible] = useState(false);
    const [{ data: accessUserList = [], isLoading: loadingAccessUser }, refreshAccessUser] = useRequest<AccessUser[]>(
        datapackId &&
        QueryAPI.datapack.accessUser.all(datapackId),
    );

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    return (
        <S8Modal
            key={`refresh-${datapackId}`}
            visible={visible}
            onCancel={() => setVisible(false)}
            // maskClosable={false}
            title='Edit Datapack Information'
            nopadding
            width={600}
        >
            {accessUserList.length > 0 && <DatapackEditForm
                accessUserList={accessUserList}
                key={datapackId}
                handleSubmitSuccess={() => {
                    REFRESH_ACCESS_USER();
                    refreshAccessUser();
                    DatapackEntity.refreshItem({ _id: datapackId });
                    setVisible(false);
                    onhandleSuccess();
                }}
                datapackId={datapackId}
                onCancel={() => setVisible(false)}
            />}
        </S8Modal>
    );
});