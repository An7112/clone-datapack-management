import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { BaseForm, ErrorsField, SelectField, SelectWithGuidanceField, SubmitField } from '@gotecq/form';
import { ActionButton, ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { CommandAPI, DataProfile, fetchTransport, QueryAPI, REFRESH_DATAPACK_AFTER_RETRIEVE, searchTransport } from '@/access';
import { TransportModel } from '@/models';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { AddDatapackModal, DEFAULT_DATA_PACK_SCHEMA } from '@gotecq/component.complex-component';
import { SyncIcon } from '@/asset';
import { mergeClass } from '@gotecq/utils';
import { Datapack, User } from '@gotecq/model';
import { errorNotification } from '@/util';
import './style.scss';
import { fetchLocation, searchLocation } from '@/access/getter';
import { useSelector } from 'react-redux';

type RetrieveDatapackProps = {
    datapackId: string,
    onSubmitSuccess: (datapackId: string) => void
}

const RetrieveFormSchema = {
    type: 'object',
    title: 'Retrieve Datapack',
    required: ['transport_id', 'location', 'datapack_id'],
    properties: {
        transport_id: {
            type: 'string',
            label: 'By Transport',
            widget: 'SelectWithGuidanceField',
            optionLabelProp: 'displayvalue',
            optionChildren: ({ data }: { data: TransportModel }) => data.name,
            className: 'no-spacing-top',
        },
        location: {
            type: 'string',
            title: 'Select Location',
            widget: 'SelectWithGuidanceField',
        },
        datapack_id: {
            ...DEFAULT_DATA_PACK_SCHEMA,
            title: '',
        },
    },
};
export const RetrieveDatapack = forwardRef(({
    datapackId, onSubmitSuccess,
}: RetrieveDatapackProps, ref) => {
    const addDatapackModalRef = useRef<any>();
    const formRef = useRef<any>();
    const [transportId, setTransportId] = useState(undefined);

    const [visible, setVisible] = useState(false);
    const [datapack, setDatapackId] = useState<string>(datapackId);
    const [location, setLocation] = useState<string>();

    const userInfo: User = useSelector(
        (state: any) => state.auth.userInfo,
    );

    const [{ data: listDatapack }, refetchListDatapack] = useRequest<Datapack[]>(QueryAPI.datapack.allFull());
    const [{ data: listLocation = [], isLoading }, refreshListLocation] = useRequest<string[]>();

    useEffect(() => {
        if (transportId) {
            refreshListLocation(QueryAPI.transport.location(transportId), {
                timeout: 5 * 60 * 1000,
            });
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
    };

    const handleSubmit = async (model) => {
        try {
            await DataProfile.Post(CommandAPI.datapack.retrieveData(datapack), {
                data: model,
            });
            actionSuccessReporter({
                message: 'Your retrieving request is being processed, please wait a moment!',
                description: 'You will receive notification soon',
            });
            closeModal();
            REFRESH_DATAPACK_AFTER_RETRIEVE();
            onSubmitSuccess(datapack);
        } catch (error) {
            errorNotification(error);
        }
    };

    const onAddDatapackSuccess = (resp) => {
        const newDatapackId = resp?.data?._resp?.[0]?.data?._id;
        if (newDatapackId) {
            setDatapackId(newDatapackId);
        }
        refetchListDatapack();
    };

    return (
        <S8Modal
            title='Retrieve Datapack'
            visible={visible}
            onCancel={closeModal}
            nopadding
            className='retrieve-data-modal'
            destroyOnClose
            width={600}
        >
            <BaseForm
                schema={RetrieveFormSchema}
                handleSubmit={handleSubmit}
                handleSubmitFail={() => { }}
                modelTransform={(mode, model) => {
                    return {
                        ...model,
                        datapack_id: datapack ? datapack : undefined,
                        location: location ? location : undefined,
                    };
                }}
                formRef={formRef}
            >
                <SelectWithGuidanceField name="transport_id"
                    value={transportId}
                    searchProfile={(value) => searchTransport(value, userInfo._id)}
                    requireProfile={fetchTransport}
                    onChangeValue={value => {
                        setTransportId(value);
                        setLocation(undefined);
                    }}
                />
                <div className='ant-form-item-label select-datapack-title select-location' onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}>
                    <label className='select-data-label'>
                        From Location
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
                    className='select-datapack'
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
                <div className='ant-form-item-label select-datapack-title'>
                    <label className='select-data-label'>
                        To Datapack
                        <span className="ant-form-item-required-asterisk">*</span>
                    </label>
                    <S8Button className='btn-add-datapack' type='link'
                        onClick={() => addDatapackModalRef.current?.open()}>
                        Create new datapack
                    </S8Button>
                </div>
                <SelectWithGuidanceField
                    className='select-datapack'
                    key={JSON.stringify(listDatapack?.map(item => item._id))}
                    name="datapack_id"
                    value={datapack}
                    onChangeValue={(value) => {
                        setDatapackId(value);
                    }}
                />
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
            <AddDatapackModal
                onSubmitSuccess={onAddDatapackSuccess}
                ref={addDatapackModalRef}
            />
        </S8Modal>
    );
});