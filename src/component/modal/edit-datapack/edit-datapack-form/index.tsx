import React from 'react';
import { Col, Row } from 'antd';
import { ExtractProps } from '@gotecq/utils';
import { ComposeHeader, S8Button } from '@gotecq/s8-component';
import { AsyncSelectField, AutoField, BaseForm, DateField, ErrorsField, LongTextField, SubmitField } from '@gotecq/form';
import { CommandAPI, QueryAPI } from '@/access';
import { schema } from './schema';

import './style.scss';
import { AccessUser } from '@/models';
import { actionSuccessReporter } from '@gotecq/access';

export type DatapackEditFormProps = {
    datapackId: string;
    accessUserList: AccessUser[];
    onCancel?: () => void,
} & Pick<ExtractProps<typeof BaseForm>, 'handleSubmitResponse' | 'handleSubmitFail' | 'handleSubmitSuccess'>;

export const DatapackEditForm: React.FC<DatapackEditFormProps> = ({
    datapackId,
    accessUserList,
    onCancel = () => { },
    handleSubmitSuccess = () => { },
    ...rest
}) => {
    const formRef = React.useRef<any>();

    // const handleSubmit = async (model: any) => {
    //     console.log('🚀 ~ file: index.tsx:40 ~ handleSubmit ~ model', model);
    //     try {
    //         const resp = await Requestor.request.POST(CommandAPI.datapack.update(datapackId), {
    //             data: model,
    //         });
    //         const editor = model?.editor ?? [];
    //         const viewer = model?.viewer ?? [];

    //         const payloadEditor = editor?.map((item: string) => {
    //             return {
    //                 member_id: item,
    //                 role: 'EDITOR',
    //             };
    //         }) ?? [];
    //         // remove id member đã có role cao hơn là editor
    //         const payloadViewer = viewer?.filter((item: string) => !editor.includes(item))?.map((item: string) => {
    //             return {
    //                 member_id: item,
    //                 role: 'VIEWER',
    //             };
    //         }) ?? [];

    //         const listViewerToRemove = accessUserList?.filter(item => item.role === 'VIEWER')
    //             ?.map(user => user.member_id)?.filter(userId => !viewer.includes(userId));
    //         const listEditorToRemove = accessUserList?.filter(item => item.role === 'EDITOR')
    //             ?.map(user => user.member_id)?.filter(userId => !editor.includes(userId));


    //         (payloadEditor.length > 0 || payloadViewer.length > 0) && await Requestor.request.POST(CommandAPI.datapack.accessUser.add(datapackId), {
    //             data: {
    //                 relation: [...payloadEditor, ...payloadViewer],
    //             },
    //         });

    //         (listViewerToRemove.length > 0 || listEditorToRemove.length > 0) && await Requestor.request.POST(CommandAPI.datapack.accessUser.delete(datapackId), {
    //             data: {
    //                 members: [...listViewerToRemove, ...listEditorToRemove],
    //             },
    //         });

    //         actionSuccessReporter({ target: 'Datapack', action: 'Update' });
    //         handleSubmitSuccess(resp);
    //         onCancel?.();
    //     } catch (error: any) {
    //         errorReporter(error, {
    //             message: 'Update datapack failed',
    //             description: error?.data?.message ?? error.response?.data?.message,
    //         });
    //     }
    // };

    return (
        <BaseForm
            formRef={formRef}
            query={QueryAPI.datapack.single(datapackId)}
            command={CommandAPI.datapack.update(datapackId)}
            schema={schema}
            handleSubmitSuccess={(resp) => {
                actionSuccessReporter({ target: 'Datapack', action: 'Update' });
                handleSubmitSuccess(resp);
                onCancel?.();
            }}
            handleSubmitFail={() => { }}
            className='edit-datapack-form'
            {...rest}
        >
            <AutoField name="title" />
            <LongTextField name="description" rows={3} />
            <AsyncSelectField
                mode='multiple'
                name="tags"
                schemaQuery={{
                    key: 'name',
                    label: ['name'],
                    value: 'name',
                }}
            />
            <Row gutter={10}>
                <Col md={12}>
                    <AutoField name="author__name" />
                </Col>
                <Col md={12}>
                    <AutoField name="author__email" />
                </Col>
            </Row>
            <Row gutter={10}>
                <Col md={12}>
                    <DateField name='period__start' nameDisabledDependentField='period__end' typeDisabledByPoint='future' />
                </Col>
                <Col md={12}>
                    <DateField name='period__end' nameDisabledDependentField='period__start' typeDisabledByPoint='past' />
                </Col>
            </Row>
            <ErrorsField />

            <ComposeHeader className="footer" type="tertiary">
                <ComposeHeader.HeaderItem>
                    <S8Button onClick={onCancel}>Cancel</S8Button>
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderItem right>
                    <SubmitField value={'Save'} />
                </ComposeHeader.HeaderItem>
            </ComposeHeader>
        </BaseForm>
    );
};
