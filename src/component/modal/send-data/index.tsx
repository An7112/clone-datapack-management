import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { AutoField, BaseForm, ErrorsField, NestField, SelectWithGuidanceField, SubmitField } from '@gotecq/form';
import { ActionButton, ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { SyncIcon } from '@/asset';
import { ResourceModel } from '@/models';
import { AddTransport } from '../manage-transport';
import { CommandAPI, QueryAPI, searchTransport, fetchTransport, REFRESH_DATAPACK_AFTER_RETRIEVE } from '@/access';
import { mergeClass } from '@gotecq/utils';
import { ResourceList } from './resource-list';
import { InfoBanner } from '@/component/atom';
import { fetchLocationForSendData, searchLocationForSendData } from '@/access/getter';
import { User } from '@gotecq/model';
import { useSelector } from 'react-redux';
import './style.scss';

const schema = {
    type: 'object',
    title: 'Send Data',
    required: ['transport_id', 'location', 'resources'],
    properties: {
        resources: {
            type: 'array',
            label: '',
            items: {
                type: 'string',
            },
            errorMessage: 'Please input recipient!',
            minItems: 1,
        },
        transport_id: {
            type: 'string',
            title: '',
            placeholder: 'Select the transport',
        },
        location: {
            type: 'string',
            title: 'To Location',
            widget: 'SelectWithGuidanceField',
        },
        options: {
            type: 'object',
            title: 'Options',
            properties: {
                overwrite: {
                    type: 'boolean',
                    checkbox: true,
                    title: '',
                },
            },
        },
    },
};

type SendDatapackProps = {
    datapackId: string,
    datapackName?: string
}

export const SendDatapack = forwardRef(({
    datapackId, datapackName,
}: SendDatapackProps, ref) => {
    const resourceListRef = useRef<any>();
    const addTransportRef = useRef<any>();

    const [transportId, setTransportId] = useState(undefined);
    const [visible, setVisible] = useState(false);
    const [resourceType, setResourceType] = useState<'FILE' | 'FILE_LINK' | 'FILE_URI'>();
    const [filter, setFilter] = useState<Array<Record<string, any>>>([]);
    const [selectedItem, setSelectedItem] = useState<string[]>();
    const [location, setLocation] = useState<string>(`/${datapackName}`);
    const locationOption = `/${datapackName}`;
    const [refreshTransport, setRefreshTransport] = useState(0);
    const [overwrite, setOverwrite] = useState(false);

    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const [{ data }] = useRequest<ResourceModel[]>(QueryAPI.datapack.resource.allFull(datapackId));
    const [{ data: locations, isLoading }, refreshLocation] = useRequest<string[]>();

    useEffect(() => {
        setSelectedItem(data?.map(item => item._id));
    }, [data]);

    useEffect(() => {
        if (transportId) {
            refreshLocation(QueryAPI.transport.location(transportId), {
                timeout: 5 * 60 * 1000,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transportId]);

    const handleSubmitSuccess = () => {
        actionSuccessReporter({
            message: 'Your sending request is being processed, please wait a moment!',
            description: 'You will receive notification soon',
        });
        onCloseModal();
        REFRESH_DATAPACK_AFTER_RETRIEVE();
    };

    const onCloseModal = () => {
        setVisible(false);
        setTransportId(undefined);
        setSelectedItem(data?.map(item => item._id));
        setLocation(`/${datapackName}`);
        setResourceType(undefined);
        setFilter([]);
    };

    return (
        <S8Modal
            title='Send Data'
            visible={visible}
            destroyOnClose
            onCancel={onCloseModal}
            className='send-data-modal'
            width={600}
            nopadding
        >
            <BaseForm
                className='send-data-form'
                schema={schema}
                modelTransform={(mode, model) => {
                    return model;
                }}
                model={{ location: `/${datapackName}` }}
                // key={updatedCount}
                onChangeModel={(model) => {
                    setOverwrite(model?.options?.overwrite);
                    return {
                        ...model,
                        resource: model?.resource?.length === 0 ? undefined : model?.resource,
                        transport_id: transportId ? transportId : undefined,
                        location: location ? location : undefined,
                    };
                }}
                command={CommandAPI.datapack.sendData(datapackId)}
                handleSubmitSuccess={handleSubmitSuccess}
            >
                <ResourceList
                    name='resources'
                    resourceListRef={resourceListRef}
                    datapackId={datapackId}
                    filter={filter}
                    setFilter={setFilter}
                    setResourceType={setResourceType}
                    resourceType={resourceType}
                    setSelectedItem={setSelectedItem}
                    selectedItem={selectedItem}
                />
                <div className='ant-form-item-label select-transport-title'>
                    <label className='select-data-label'>
                        Transport by
                        <span className="ant-form-item-required-asterisk">*</span>
                    </label>
                    <S8Button className='btn-add-transport' type='link'
                        onClick={() => addTransportRef.current?.open()}>
                        Create new transport
                    </S8Button>
                    <AddTransport ref={addTransportRef} onAddSuccess={() => setRefreshTransport(prev => prev + 1)} />
                </div>
                <SelectWithGuidanceField name="transport_id"
                    key={`${refreshTransport}`}
                    searchProfile={(value) => searchTransport(value, userInfo._id)}
                    requireProfile={fetchTransport}
                    optionChildren={({ data }) => data.name}
                    value={transportId}
                    onChangeValue={(value) => {
                        setTransportId(value);
                    }}
                    className='select-transport'
                />
                <div className='ant-form-item-label select-transport-title select-location' onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}>
                    <label className='select-data-label'>
                        To Location
                        <span className="ant-form-item-required-asterisk">*</span>
                    </label>
                    <ActionButton
                        onClick={() => {
                            if (transportId) {
                                refreshLocation(QueryAPI.transport.location(transportId, true), {
                                    timeout: 5 * 60 * 1000,
                                });
                            }
                        }}
                        disabled={!transportId}
                        icon={<SyncIcon />}
                        theme='major'
                        size='md'
                        className={mergeClass('refresh-location-btn', isLoading ? 'spin-icon' : '')}
                    />
                </div>
                <SelectWithGuidanceField
                    className='select-transport'
                    name="location"
                    key={transportId}
                    loading={isLoading}
                    searchProfile={(value) => searchLocationForSendData(transportId ?? '', value, locationOption)}
                    requireProfile={() => fetchLocationForSendData(transportId ?? '', locationOption)}
                    onChangeValue={(value) => setLocation(value)}
                    value={location}
                    optionLabelProp="displayvalue"
                />
                <div className='ant-form-item-label select-transport-title'>
                    <label className='select-data-label'>
                        Options
                    </label>
                </div>
                <NestField name='options' fields={['overwrite']} >
                    <AutoField name='overwrite' children={<>Overwrite</>} />
                </NestField>
                {overwrite && <InfoBanner content={'Selected resources might already exist in the end location. Uncheck the checkbox if you don\'t want to overwrite those resources.'} />}
                <ErrorsField />
                <ComposeHeader className="footer" type="tertiary">
                    <ComposeHeader.HeaderItem>
                        <S8Button onClick={onCloseModal}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        <SubmitField disabled={!selectedItem || selectedItem?.length === 0} />
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </BaseForm>
        </S8Modal>
    );
});