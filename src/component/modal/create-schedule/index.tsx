import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { BaseForm, ErrorsField, SelectField, SelectWithGuidanceField, SubmitField } from '@gotecq/form';
import { ActionButton, ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { CommandAPI, fetchTransport, QueryAPI, REFRESH_DATAPACK_AFTER_RETRIEVE, REFRESH_SCHEDULE_AFTER_ADD, Requestor, searchTransport } from '@/access';
import { TransportModel } from '@/models';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { FrequencyField } from '@/component/field';
import { SyncIcon } from '@/asset';
import { handleFrequencyToTimeZone, mergeClass } from '@gotecq/utils';
import { Datapack, User } from '@gotecq/model';
import { fetchLocation, searchLocation } from '@/access/getter';
import { useSelector } from 'react-redux';
import './style.scss';
import { DEFAULT_DATA_PACK_SCHEMA } from '@gotecq/component.complex-component';
import { getTimeZone } from '@/util';

type RetrieveDatapackProps = {
    datapackId: string,
    onRefresh?: () => void,
}

export const renderLocalTime = (time) => {
    const tz = handleFrequencyToTimeZone(time, true);
    return `Scheduling will run ${tz} ${getTimeZone()}`;
};

const RetrieveFormSchema = {
    type: 'object',
    title: 'Create Schedule Retrieve',
    required: ['transport_id', 'location', 'datapack_id', 'frequency'],
    properties: {
        transport_id: {
            type: 'string',
            label: 'Transport',
            widget: 'SelectWithGuidanceField',
            optionLabelProp: 'displayvalue',
            optionChildren: ({ data }: { data: TransportModel }) => data.name,
            className: 'no-spacing-top',
        },
        location: {
            type: 'string',
            title: '',
            widget: 'SelectWithGuidanceField',
            placeholder: 'Select location',
        },
        datapack_id: {
            ...DEFAULT_DATA_PACK_SCHEMA,
            title: 'To Datapack',
        },
        frequency: {
            type: 'object',
            title: 'Frequency (UTC Time)',
        },
    },
};
export const CreateScheduleRetrieval = forwardRef(({
    datapackId, onRefresh = () => { },
}: RetrieveDatapackProps, ref) => {
    const formRef = useRef<any>();
    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );
    const [transportId, setTransportId] = useState(undefined);
    const [visible, setVisible] = useState(false);
    const [datapack, setDatapackId] = useState<string>(datapackId);
    const [location, setLocation] = useState<string>();
    const [frequencyTime, setFrequencyTime] = useState<any>();
    console.log('🚀 ~ file: index.tsx:68 ~ frequencyTime', frequencyTime);

    const [{ data: listLocation = [], isLoading }, refreshListLocation] = useRequest<string[]>();


    useEffect(() => {
        if (transportId) {
            refreshListLocation(QueryAPI.transport.location(transportId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transportId]);

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const closeModal = () => {
        setVisible(false);
        setDatapackId(datapackId);
        setTransportId(undefined);
        setLocation(undefined);
        onRefresh();
    };


    const handleSubmit = async (model) => {
        const dataModel = {
            frequency_time: model.frequency,
            location: model.location,
            transport_id: model.transport_id,
        };
        await Requestor.request.POST(CommandAPI.schedule.add(model.datapack_id), {
            data: dataModel,
        });

        actionSuccessReporter({
            message: 'Create Retrieval Scheduling Successfully!',
        });
        closeModal();
        REFRESH_DATAPACK_AFTER_RETRIEVE();
        REFRESH_SCHEDULE_AFTER_ADD();

    };
    const handleSubmitFail = (e) => { };

    const handleModelTransform = (mode, model) => {
        if (!location) {
            model = {
                ...model,
                location: undefined,
            };
        } else {
            model = {
                ...model,
                location: location,
            };
        }

        return model;
    };

    return (
        <S8Modal
            title='Create Retrieval Scheduling'
            visible={visible}
            onCancel={closeModal}
            nopadding
            className='shedule-retrieve-modal'
            destroyOnClose
            maskClosable={false}
            width={600}
        >
            <BaseForm
                schema={RetrieveFormSchema}
                handleSubmit={handleSubmit}
                handleSubmitFail={handleSubmitFail}
                modelTransform={handleModelTransform}
                formRef={formRef}
                className='create-schedule-form'
                onChangeModel={(model) => {
                    setFrequencyTime(model['frequency']);
                }}
            >
                <SelectWithGuidanceField name="transport_id"
                    value={transportId}
                    searchProfile={(value) => searchTransport(value, userInfo._id)}
                    requireProfile={fetchTransport}
                    onChangeValue={value => {
                        setTransportId(value);
                        setLocation(() => undefined);
                    }}
                />
                <div className='ant-form-item-label select-datapack-title select-title-location' onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}>
                    <label className='select-data-label'>
                        Retrieval Source
                        <span className="ant-form-item-required-asterisk">*</span>
                    </label>
                    <ActionButton
                        onClick={() => {
                            if (transportId) {
                                refreshListLocation(QueryAPI.transport.location(transportId, true), {
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
                    className='select-location'
                    name="location"
                    key={transportId}
                    loading={isLoading}
                    disabled={!transportId && listLocation.length === 0}
                    searchProfile={(value) => searchLocation(transportId ?? '', value)}
                    requireProfile={() => fetchLocation(transportId ?? '')}
                    onChangeValue={(value) => setLocation(value)}
                    value={location}
                    optionLabelProp="displayvalue"
                />
                <SelectWithGuidanceField
                    name="datapack_id"
                    value={datapackId}
                    disabled={datapackId !== ''}
                />
                <FrequencyField name='frequency' />
                {frequencyTime && <div className='local-time'>{renderLocalTime(frequencyTime)}</div>}
                <ErrorsField />
                <ComposeHeader className="footer" type="tertiary">
                    <ComposeHeader.HeaderItem>
                        <S8Button onClick={closeModal}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        <SubmitField />
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </BaseForm>
        </S8Modal>
    );
});
