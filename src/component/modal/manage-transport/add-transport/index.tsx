import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { AutoField, BaseForm, ErrorsField, ListField, MultipleSelectWithGuidanceField, SubmitField } from '@gotecq/form';
import { ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { actionSuccessReporter, UserInfo, useUserInfo } from '@gotecq/access';
import { CommandAPI, DataProfile } from '@/access';
import { schema } from './schema';
import './style.scss';
import { CloseCircleFilled } from '@ant-design/icons';
import { PropertyManager } from '@gotecq/component.complex-component';

type AddTransportProps = {
    onAddSuccess?: () => void
    onRefresh?: () => void
}

const TransportParams = {
    S3: [
        { key: 'access_key', value: undefined },
        { key: 'bucket_default', value: undefined },
        { key: 'region', value: undefined },
        { key: 'secret_key', value: undefined },
        { key: 'endpoint', value: undefined },
    ],
    SFTP: [
        { key: 'host', value: undefined },
        { key: 'user', value: undefined },
        { key: 'passwd', value: undefined },
        { key: 'port', value: undefined },
    ],
};

export const AddTransport = forwardRef(({ onAddSuccess, onRefresh = () => { } }: AddTransportProps, ref) => {
    const userInfo: UserInfo = useUserInfo();
    const formRef = useRef<any>();
    const [visible, setVisible] = useState(false);
    const [formModel, setModel] = useState<Record<string, any>>({
        params: [
            { key: 'host', value: undefined },
            { key: 'user', value: undefined },
            { key: 'passwd', value: undefined },
            { key: 'port', value: undefined },
        ],
        type: 'SFTP',
        accessed_user: [userInfo?._id],
    });

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const onSubmit = async (model) => {
        console.log('🚀 ~ file: index.tsx:53 ~ onSubmit ~ model', model);
        try {
            const users = model['accessed_user'];
            const data = { ...model };
            delete data['accessed_user'];
            const resq = await DataProfile.Post(CommandAPI.transport.add(), {
                data: data,
            });
            const transportId = resq?.data?._resp?.[0]?.data._id;
            await DataProfile.Post(CommandAPI.transport.addUser(transportId), {
                data: {
                    users: users,
                },
            });
            actionSuccessReporter({
                target: 'Transport',
                action: 'Create',
            });
            onAddSuccess?.();
            onCloseModal();
        } catch (e: any) {
            throw e;
            // errorReporter(e, {
            //     message: e?.data?.message ?? 'Add transport failed!'
            // });
        }
    };

    const onCloseModal = () => {
        setVisible(false);
        setModel({
            params: [
                { key: 'host', value: undefined },
                { key: 'user', value: undefined },
                { key: 'passwd', value: undefined },
                { key: 'port', value: undefined },
            ],
            type: 'SFTP',
            accessed_user: [userInfo?._id],
        });
        onRefresh();
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
                    key: item.key,
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
            title='Create New Transport'
            nopadding
            width={600}
            className='add-transport-modal'
            onCancel={onCloseModal}
        >
            <BaseForm
                className='transport-form'
                formRef={formRef}
                schema={schema}
                handleSubmit={onSubmit}
                handleSubmitFail={(resp) => {
                    // errorReporter(resp, {
                    //     message: resp?.data?.message ?? 'Add transport failed!'
                    // });
                }}
                model={formModel}
                modelTransform={modelTransform}
                onChangeModel={(model) => {
                    if (JSON.stringify(model) !== JSON.stringify(formModel)) {
                        setModel(prev => {
                            return {
                                ...model,
                                params: model.type !== prev.type ? TransportParams[model.type] : model.params,
                            };
                        });
                    }
                }}
            >
                <AutoField name='name' />
                <AutoField name='type' />
                <MultipleSelectWithGuidanceField
                    name='accessed_user'
                    value={[userInfo?._id] as any}
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
                        <S8Button onClick={onCloseModal}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        <SubmitField />
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </BaseForm>
            {/* <PropertyManager.Edit
                // ref={propertyRef}
                // defaultValue={group.attributeList.reduce((prev, curr) => {
                //     return {
                //         ...prev,
                //         [curr.attributeValue]: curr.content,
                //     };
                // }, {})}
                domainName='gotecq.health-plan'
                groupName={'extra-benefits'}
                onSubmit={async () => { }}
            /> */}
        </S8Modal>
    );
});
