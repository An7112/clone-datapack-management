import React, { useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import { ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import { ExtractProps } from '@gotecq/utils';
import { actionSuccessReporter } from '@gotecq/access';
import { AutoField, BaseForm, ErrorsField, HiddenField } from '@gotecq/form';
import { ComposeHeader, Loading, S8Button, S8Modal } from '@gotecq/s8-component';

import { CommandAPI } from '@/access';
import AddLinkFormSchema from './schema.json';
import { SuccessCircleIcon, WarningCircleIcon } from '@/asset';
import './style.scss';

export type AddURIFormProps = {
    datapackId: string;
    onCancel?: () => void,
    onChangeTrackingSubmit: (isSubmitted: boolean) => void
    formRef: any,
    deletable?: boolean
    onDelete: () => void
} & Pick<ExtractProps<typeof BaseForm>, 'handleSubmitResponse' | 'handleSubmitFail' | 'handleSubmitSuccess' | 'query'>;

export const ResourceAddURIForm: React.FC<AddURIFormProps> = ({
    datapackId,
    onCancel = () => { },
    formRef,
    onDelete,
    deletable = true,
    onChangeTrackingSubmit,
    ...rest
}) => {
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error'>();

    if (submitStatus === 'success') {
        return <div className='submit-success'>
            <SuccessCircleIcon />
            Add URI successfully!
        </div>;
    }
    if (submitStatus === 'error') {
        return <div className='submit-error'>
            <WarningCircleIcon />
            Submit Error!
            <span className='reload' onClick={() => {
                setSubmitStatus(undefined);
                onChangeTrackingSubmit(false);
            }}>
                <ReloadOutlined />
                Retry
            </span>
        </div>;
    }
    return (
        <BaseForm
            command={CommandAPI.datapack.resource.add(datapackId)}
            schema={AddLinkFormSchema}
            {...rest}
            className='add-uri-form'
            formRef={formRef}
            handleSubmitSuccess={() => {
                actionSuccessReporter({ target: 'URI', action: 'Add' });
                setSubmitStatus('success');
                onChangeTrackingSubmit(true);
            }}
            handleSubmitFail={(e) => {
                // errorReporter(e, { message: e?.data?.message ?? 'Add URI failed!'});
                setSubmitStatus('error');
                onChangeTrackingSubmit(true);
            }}
            useLoadingOverlay={false}
        >
            <HiddenField name='kind' value='FILE_URI' />
            <Row gutter={10}>
                <Col md={12}>
                    <AutoField name="display" />
                </Col>
                <Col md={12}>
                    <AutoField name="content" />
                </Col>
            </Row>
            <Row gutter={10}>
                <Col md={24}>
                    <AutoField name="description" />
                </Col>
            </Row>
            {deletable && <CloseOutlined className='btn-remove' title='Delete' onClick={onDelete} />}
            <ErrorsField />
        </BaseForm>
    );
};

type AddURIModal = {
    datapackId: string
    onSubmitSuccess?: () => void
}

export const AddMultipleURIModal = forwardRef(({ datapackId, onSubmitSuccess }: AddURIModal, ref) => {
    const [linkCount, setCount] = useState<number[]>([1]);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trackingSubmit, setTrackingSubmit] = useState<Record<number, boolean>>({});

    const submittable = useMemo(() => {
        return Object.values(trackingSubmit).filter(item => item).length < linkCount.length;
    }, [trackingSubmit, linkCount]);

    const listForm = useRef<any>([]);

    useEffect(() => {
        listForm.current[1] = React.createRef();
    }, []);

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const onCloseModal = () => {
        setVisible(false);
        setCount([1]);
        setTrackingSubmit({});
        listForm.current?.forEach(formRef => formRef?.current?.reset());
        onSubmitSuccess?.();
    };

    const addMoreForm = () => {
        const newIndex = linkCount[linkCount.length - 1] + 1;
        setCount(prev => [...prev, newIndex]);
        listForm.current[newIndex] = React.createRef();
    };

    const onDeleteLink = (index: number) => {
        setCount(prev => prev.filter((item) => item !== index));
        listForm.current[index] = null;
    };

    const onSubmit = async () => {
        setLoading(true);
        await Promise.allSettled(listForm.current.map(async (formRef) => formRef.current?.submit()));
        setLoading(false);
    };

    return (
        <S8Modal
            visible={visible}
            onCancel={onCloseModal}
            destroyOnClose
            className='add-multiple-uri-modal'
            title='Add URI'
            width={600}
        >
            {loading && <Loading.FullView />}
            {linkCount.map(index => (
                <ResourceAddURIForm
                    onChangeTrackingSubmit={(isSubmitted) => setTrackingSubmit(prev => {
                        return {
                            ...prev,
                            [index]: isSubmitted,
                        };
                    })}
                    onDelete={() => onDeleteLink(index)}
                    deletable={index !== linkCount[0]}
                    datapackId={datapackId}
                    formRef={listForm.current[index]}
                    key={`${datapackId}-${index}`}
                />
            ))}
            <S8Button
                type='dashed' className='btn-add-more-button'
                onClick={addMoreForm}
            >
                Add more URI
            </S8Button>
            <ComposeHeader footer type="tertiary">
                <ComposeHeader.HeaderItem>
                    <S8Button onClick={onCloseModal}>Cancel</S8Button>
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderItem right>
                    <S8Button type='primary' onClick={submittable ? onSubmit : onCloseModal}>
                        {submittable ? 'Submit' : 'Done'}
                    </S8Button>
                </ComposeHeader.HeaderItem>
            </ComposeHeader>
        </S8Modal>
    );
}); 