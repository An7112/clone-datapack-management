import React, { useState } from 'react';
import { Upload } from 'antd';
import { FileAddOutlined, FolderOpenFilled } from '@ant-design/icons';
import { createUploader, errorReporter } from '@gotecq/access';
import { Loading, S8Button } from '@gotecq/s8-component';

import { CommandAPI } from '@/access';
import { UploadingDocumentEntity } from './document-uploading-view';
import './style.scss';
import { errorNotification } from '@/util';

type DocumentUploadForm = {
    datapackId: string;
    onSubmitSuccess?: () => void;
    onDismiss?: () => void;
};

const uploader = createUploader();

export const UploadFilePanel = ({
    datapackId,
    onSubmitSuccess,
    onDismiss,
}: DocumentUploadForm) => {
    const [loading, setLoading] = useState(false);
    const [listUploaded, setListUploaded] = useState<string[]>([]);
    const deleteFileUploaded = (uploadingId) => {
        setLoading(true);
        setListUploaded(prev => prev.filter(item => item !== uploadingId));
        setLoading(false);
    };

    return (
        <div>
            <Upload.Dragger
                name='file'
                multiple
                action={''}
                customRequest={option => {
                    const { id: uploadingId, addCallback, upload } = uploader.uploadFile({
                        file: option.file as any,
                        getPayload: file => ({
                            file: file,
                            display: file.name,
                            kind: 'FILE',
                        }),
                        url: CommandAPI.datapack.resource.add(datapackId),
                    });

                    const file = option.file as any;
                    upload();
                    addCallback({
                        onUploadFailed(error) {
                            if (file.size > 20000000) {
                                errorReporter({}, {
                                    message: 'This file is too large to be uploaded. The maximum supported file size is 20MB.',
                                    description: '',
                                });
                            } else {
                                errorNotification(error, 'Upload File Failed');
                            }
                        },
                    });
                    setListUploaded(prev => [...prev, uploadingId]);
                }}
                withCredentials
                showUploadList={false}
            >
                <p className="ant-upload-hint">
                    <FolderOpenFilled /> Drop your files here
                </p>
                <p className="ant-upload-hint">or</p>
                <p>
                    <S8Button
                        className='btn-upload'
                        icon={<FileAddOutlined />}>
                        Upload files
                    </S8Button>
                </p>
            </Upload.Dragger>
            <div className='list-uploaded-files'>
                {listUploaded.map((id) =>
                    <UploadingDocumentEntity
                        datapackId={datapackId}
                        uploadingId={id}
                        key={id}
                        uploader={uploader}
                        onDelete={deleteFileUploaded}
                    />,
                )}
                {loading && <Loading.FullView />}
            </div>
        </div>
    );
};