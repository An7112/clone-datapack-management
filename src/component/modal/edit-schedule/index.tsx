import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { AutoField, BaseForm, ErrorsField, SelectField, SubmitField } from '@gotecq/form';
import { ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { CommandAPI, QueryAPI, REFRESH_SCHEDULE_AFTER_EDIT, Requestor } from '@/access';
import { TransportModel } from '@/models';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { ScheduleEntity } from '@/entity';
import { FrequencyField } from '@/component/field';
import { Datapack } from '@gotecq/model';
import './style.scss';
import { renderLocalTime } from '../create-schedule';

type RetrieveDatapackProps = {
    schedule_entry_id: string
}

const RetrieveFormSchema = {
    type: 'object',
    title: 'Edit Schedule Retrieve',
    required: ['transport_id', 'location', 'datapack_id', 'frequency_time'],
    properties: {
        transport_id: {
            type: 'string',
            title: 'Transport',
        },
        location: {
            type: 'string',
            title: 'Retrieval Source',
        },
        datapack_id: {
            type: 'string',
            title: 'To Datapack',
        },
        frequency_time: {
            type: 'object',
            title: 'Frequency (UTC Time)',
        },
    },
};
export const EditScheduleRetrieval = forwardRef(({
    schedule_entry_id,
}: RetrieveDatapackProps, ref) => {
    const [modelForm, setModelForm] = useState<any>({});
    const [visible, setVisible] = useState(false);
    const [, scheduleDataEntity] = ScheduleEntity.useLocalEntity({ _id: schedule_entry_id });
    const [frequencyTime, setFrequencyTime] = useState<any>();

    const [{ data: listDatapack }] = useRequest<Datapack[]>(QueryAPI.datapack.available());
    const [{ data: listTransport }] = useRequest<TransportModel[]>(QueryAPI.transport.all());

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    useEffect(() => {
        setModelForm({
            ...scheduleDataEntity?.metadata,
            frequency_time: scheduleDataEntity?.['frequency_time'],
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const closeModal = () => {
        setVisible(false);
        // REFRESH_DATAPACK_AFTER_RETRIEVE();
    };

    const handleSubmit = async (model) => {
        await Requestor.request.POST(CommandAPI.schedule.update(scheduleDataEntity?.datapack_id ?? ''), {
            data: {
                frequency_time: model.frequency_time,
                scheduler_id: schedule_entry_id,
            },
        });

        actionSuccessReporter({
            message: 'Edit Retrieval Scheduling Successfully!',
            // description: 'You will receive notification soon'
        });

        closeModal();
        REFRESH_SCHEDULE_AFTER_EDIT();

    };
    const handleSubmitFail = (e) => { };

    const handleModelTransform = (mode, model) => {
        return model;
    };

    return (
        <S8Modal
            title='Edit Retrieval Scheduling'
            visible={visible}
            onCancel={closeModal}
            nopadding
            className='edit-shedule-retrieve-modal'
            destroyOnClose
            maskClosable={false}
            width={600}
        >
            <BaseForm
                schema={RetrieveFormSchema}
                handleSubmit={handleSubmit}
                handleSubmitFail={handleSubmitFail}
                modelTransform={handleModelTransform}
                model={modelForm}
                className='create-schedule-form'
                onChangeModel={(model) => {
                    setFrequencyTime(model['frequency_time']);
                }}
            >
                <SelectField
                    name="transport_id"
                    options={listTransport?.map(item => {
                        return {
                            value: item._id,
                            label: item.name,
                        };
                    })}
                    className='no-spacing-top'
                    disabled={true}
                />
                <AutoField name="location"
                    disabled={true}
                    className='select-datapack'
                />
                <SelectField
                    name="datapack_id"
                    options={listDatapack?.map(item => {
                        return {
                            value: item._id,
                            label: item.title,
                        };
                    })}
                    disabled={true}
                    className='select-datapack'
                    virtual
                />
                <FrequencyField name='frequency_time' />
                {frequencyTime && <div className='local-time'>{renderLocalTime(frequencyTime)}</div>}
                <ErrorsField />
                <ComposeHeader className="footer" type="tertiary">
                    <ComposeHeader.HeaderItem>
                        <S8Button onClick={closeModal}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        <SubmitField value={'Save'} />
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </BaseForm>
        </S8Modal>
    );
});