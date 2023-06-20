import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { AutoFields, BaseForm, ErrorsField, ListField, MultipleSelectWithGuidanceField, SubmitField } from '@gotecq/form';
import { CommandAPI, DataProfile, QueryAPI } from '@/access';
import { TransportModel, TransportUserModel } from '@/models';
import { schema } from './schema';
import { humanFormat } from '@gotecq/format';
import { CloseCircleFilled } from '@ant-design/icons';

type EditTransportProps = {
    onEditSuccess?: () => void,
    transportId: string
}

export const EditTransport = forwardRef(({
    onEditSuccess, transportId,
}: EditTransportProps, ref) => {
    const [visible, setVisible] = useState(false);

    const [{ data: transportInfo }] = useRequest<TransportModel>(QueryAPI.transport.single(transportId));
    const [{ data: listUsers }] = useRequest<TransportUserModel[]>(QueryAPI.transport.listAccessedUsers(transportId));

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const onSubmit = async (model) => {
        try {
            const users = model['accessed_user'] as string[];
            const data = { ...model };
            delete data['accessed_user'];

            await DataProfile.Post(CommandAPI.transport.update(transportId), {
                data: data,
            });

            const listUsersToAdd = users?.filter(item => !listUsers?.map(user => user.user_id)?.includes(item));
            const listUsersToRemove = listUsers?.map(user => user.user_id).filter(userId => !users.includes(userId));
            await DataProfile.Post(CommandAPI.transport.addUser(transportId), {
                data: {
                    users: listUsersToAdd,
                },
            });
            await DataProfile.Post(CommandAPI.transport.removeUser(transportId), {
                data: {
                    users: listUsersToRemove,
                },
            });
            onEditSuccess?.();
            actionSuccessReporter({
                target: 'Transport',
                action: 'Update',
            });
            setVisible(false);
        } catch (e) {
            throw e;
            // errorReporter(e);
        }
    };

    const modelTransform = (mode, model) => {
        if (mode === 'validate' || mode === 'submit') {
            const transformOtherParams = model.additional_params
                ?.filter(item => item.key || item.value)
                .map(item => {
                    return {
                        key: item.key ?? undefined,
                        value: item.value ?? undefined,
                        required: false,
                    };
                });
            const transformParams = model.params?.map(item => {
                return {
                    key: item.key ?? undefined,
                    value: item.value ?? undefined,
                    required: true,
                };
            });
            return {
                ...model,
                name: model.name ?? undefined,
                params: mode === 'submit' ? transformParams.concat(transformOtherParams) : transformParams,
                additional_params: transformOtherParams,
            };
        }
        return model;
    };

    return (
        <S8Modal
            visible={visible}
            destroyOnClose
            title='Edit Transport'
            nopadding
            width={600}
            className='add-transport-modal'
            onCancel={() => setVisible(false)}
        >
            <BaseForm
                className='transport-form'
                schema={schema}
                handleSubmit={onSubmit}
                handleSubmitFail={(resp) => {
                    // errorReporter(resp, {
                    //     message: resp?.data?.message ?? 'Add transport failed!'
                    // });
                }}
                model={{
                    ...transportInfo,
                    params: transportInfo?.params?.filter(item => item.required !== false),
                    additional_params: transportInfo?.params?.filter(item => item.required === false)
                        ?? [{ key: undefined, value: undefined }],
                    accessed_user: listUsers?.map(item => item.user_id),
                }}
                modelTransform={modelTransform}
            >
                <AutoFields fields={['name', 'type']} />
                <MultipleSelectWithGuidanceField
                    name='accessed_user'
                    initialValue={listUsers?.map(item => item.user_id)}
                />
                <div className='ant-form-item-label default-params-title'>
                    <label className='default-params-label'>
                        Default Parameters
                        <span className="ant-form-item-required-asterisk">*</span>
                        <Tooltip title="Please double check to make sure all values are correct before submitting">
                            <InfoCircleOutlined />
                        </Tooltip>
                    </label>
                </div>
                <div className='table-parameter'>
                    <div className='header-key-value'>
                        <span className='key'>Key</span>
                        <span className='value'>Value</span>
                    </div>
                    <ListField name="params" className='parameters' />
                    <ListField name="additional_params" className='parameters others' initialCount={1}
                        itemProps={{ listDelFieldProps: { icon: <CloseCircleFilled /> } }} />
                </div>
                <ErrorsField />
                <ComposeHeader className="footer" type="tertiary">
                    <ComposeHeader.HeaderItem>
                        <S8Button onClick={() => setVisible(false)}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        <SubmitField />
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </BaseForm>
        </S8Modal>
    );
});