import React, { useEffect } from 'react';
import { AttachmentUploadingShellEdge, AttachmentViewShellEdge } from '@gotecq/component.resource-extension';
import { createUploader, RcFile } from '@gotecq/access';


import './style.scss';

// type FileUpdatePayload = {
//     _iid?: string,
//     author?: string,
//     type?: string,
//     date?: string,
// };

const uploader = createUploader();
type Uploader = typeof uploader;

type FileUploader = {
    data: RcFile;
    uploadingId: string
    uploader: Uploader;
    onDelete: (id: string) => void;
    onUploadFinish: (id: string, status: string) => void
    loading?: boolean
    isError?: boolean
    onRetry: (file: RcFile) => void
};


export function FileUploader({
    data,
    uploadingId,
    uploader,
    onDelete,
    onUploadFinish,
    loading,
    isError,
    onRetry,
}: FileUploader) {
    const {
        progress,
        error,
        cancelUpload,
        status,
    } = uploader.useUploadingFile(uploadingId);

    useEffect(() => {
        if (status === 'finished' || status === 'failed') {
            onUploadFinish(data.uid, status);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const cancelHandler = () => {
        cancelUpload();
        onDelete(data.uid);
    };

    const onReupload = () => {
        onRetry(data);
    };

    if (status === 'finished') {
        return <AttachmentViewShellEdge
            data={{
                _id: uploadingId,
                content_type: data?.type ?? '',
                length: data?.size,
                filename: data?.name,
            } as any}
            isLoading={loading}
            downloadable={false}
            deletable={false}
        />;
    }

    return <AttachmentUploadingShellEdge
        contentType={data?.type}
        exception={error ?? (isError && new Error())}
        name={data?.name}
        progress={progress}
        onReupload={onReupload}
        onCancelUpload={cancelHandler}
    />;

};
