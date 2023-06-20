import React, { useState } from 'react';
import { notification } from 'antd';
import { AttachmentUploadingShellEdge, AttachmentViewShellEdge } from '@gotecq/component.resource-extension';
import { createUploader, errorReporter } from '@gotecq/access';
import { CommandAPI, DataProfile } from '@/access';
import { errorNotification } from '@/util';

const uploader = createUploader();
type Uploader = typeof uploader;

type DocumentUploader = {
    datapackId: string;
    uploadingId: string;
    uploader: Uploader;
    onDelete: (id: string) => void;
};


export function UploadingDocumentEntity({
    uploadingId,
    uploader,
    onDelete,
    datapackId,
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
                message: 'Delete Uploaded File Sucessfully!',
            });
        } catch (e) {
            errorNotification(e, 'Delete Uploaded File Failed');
        } finally {
            setLoading(false);
        }
    };

    const cancelHandler = () => {
        cancelUpload();
        onDelete(uploadingId);
    };

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
        />;
    }

    return <AttachmentUploadingShellEdge
        contentType={file?.type}
        exception={error}
        name={file?.name}
        progress={progress}
        onReupload={reUpload}
        onCancelUpload={cancelHandler}
    />;

};
