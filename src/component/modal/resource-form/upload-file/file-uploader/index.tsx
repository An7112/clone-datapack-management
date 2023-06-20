import React, { memo, useState, useRef } from 'react';
import { notification } from 'antd';
import { AttachmentUploadingShellEdge, AttachmentViewShellEdge } from '@gotecq/component.resource-extension';
import { createUploader, errorReporter } from '@gotecq/access';
import { BaseForm, ErrorsField, TextField } from '@gotecq/form';
import { CommandAPI, DataProfile } from '@/access';
import schema from './schema.json';

import './style.scss';
import { ActionEdit } from '@gotecq/s8-component';

export type FileUpdatePayload = {
    _iid?: string,
    display?: string,
    description?: string,
};

const uploader = createUploader();
type Uploader = typeof uploader;

type DocumentUploader = {
    datapackId: string;
    data: string;
    uploader: Uploader;
    onDelete: (id: string) => void;
    onChange: (id: string, iid: string, key: keyof FileUpdatePayload, value: string) => void;
    toggleEdit?: boolean
};


export function FileUploader({
    data: uploadingId,
    uploader,
    onDelete,
    onChange,
    datapackId,
    toggleEdit = false,
}: DocumentUploader) {
    const {
        progress,
        error,
        response,
        reUpload,
        cancelUpload,
        file,
    } = uploader.useUploadingFile(uploadingId);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const deleteHandler = async () => {
        try {
            setLoading(true);
            if (response?._iid && datapackId) {
                await DataProfile.Post(CommandAPI.datapack.resource.delete(datapackId), {
                    data: {
                        _iid: response?._iid,
                    },
                });
            }

            onDelete(uploadingId);
            notification.success({
                message: 'Delete file Request sucessfully!',
            });
        } catch (e) {
            errorReporter(e);
        } finally {
            setLoading(false);
        }
    };

    const changeHandler = (key: keyof FileUpdatePayload, value: string) => {
        if (response?._iid) {
            onChange(uploadingId, response?._iid, key, value);
        }
    };

    const cancelHandler = () => {
        cancelUpload();
        onDelete(uploadingId);
    };

    if (toggleEdit && !editMode) {
        return (
            <AttachmentUploadingShellEdge
                contentType={file?.type}
                exception={error}
                name={file?.name}
                progress={progress}
                onReupload={reUpload}
                onCancelUpload={cancelHandler}
                tool={<ActionEdit onClick={() => setEditMode(true)} />}
            />
        );
    }

    if (response?._id) {
        return <AttachmentViewShellEdge
            data={{
                _id: response._id,
                content_type: file?.type ?? '',
                length: file?.size,
                filename: file?.name,
            } as any}
            isLoading={loading}
            onDelete={deleteHandler}
            downloadable={false}
            deletable={true}
            tool={<UpdateDocumentInfoForm onChangeInfo={changeHandler} defaultDisplay={file?.name} />}
        />;
    }

    return <AttachmentUploadingShellEdge
        contentType={file?.type}
        exception={error}
        name={file?.name}
        progress={progress}
        onReupload={reUpload}
        onCancelUpload={cancelHandler}
        tool={<UpdateDocumentInfoForm onChangeInfo={changeHandler} key={file?.name} disabled defaultDisplay={file?.name} />}
    />;

};

type UpdateDocumentInfoForm = {
    disabled?: boolean;
    onChangeInfo: (type: keyof FileUpdatePayload, value: string) => void;
    defaultDisplay?: string
};
const UpdateDocumentInfoForm = memo(({
    disabled = false,
    onChangeInfo,
    defaultDisplay,
}: UpdateDocumentInfoForm) => {
    const formRef = useRef<any>();
    return (
        <BaseForm schema={schema}
            className="update-document-info-form"
            disabled={disabled}
            formRef={formRef}
        >
            <TextField
                name='display'
                size="small"
                defaultValue={defaultDisplay}
                onChange={(value) => {
                    onChangeInfo('display', value);
                }}
            />
            <TextField
                name='description'
                size="small"
                onChange={(value) => onChangeInfo('description', value)}
            />
            <ErrorsField />
        </BaseForm>
    );
});

