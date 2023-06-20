import React, { useState, useEffect } from 'react';
import { Upload } from 'antd';
import { FileAddOutlined, FolderOpenFilled } from '@ant-design/icons';
import { AttachmentViewShellEdge } from '@gotecq/component.resource-extension';
import { actionSuccessReporter, createUploader, errorReporter } from '@gotecq/access';
import { ActionButton, ComposeHeader, Loading, S8Button, S8Modal } from '@gotecq/s8-component';

import { CommandAPI } from '@/access';
import { ResourceModel } from '@/models';
import { MDIFileReplaceIcon } from '@/asset';
import './style.scss';

type ReplaceFileModalProps = {
    disable?: boolean
    fileData: ResourceModel,
    onReplaceSuccess: () => void,
    datapackId: string,
}

// const ReplaceFormSchema = {
//     title: 'Replace File',
//     type: 'object',
//     required: [],
//     properties: {
//         _iid: {
//             type: 'string',
//         },
//         file: {
//             title: '',
//         },
//     },
// };

const uploader = createUploader();

export function ReplaceFileModal({ fileData, onReplaceSuccess, datapackId, disable = false }: ReplaceFileModalProps) {
    const [fileUploaded, setFileUploaded] = useState<any>();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tooltipReplace, setTooltipReplace] = useState('Replace');

    const onSubmit = async () => {
        const { uploadPromise } = uploader.uploadFile({
            file: fileUploaded,
            getPayload: file => ({
                file: file,
                _iid: fileData._iid,
            }),
            url: CommandAPI.datapack.resource.replace(datapackId),
        }).upload();
        setLoading(true);
        const resp = await uploadPromise;
        if (resp.error) {
            errorReporter(resp.error, {
                message: resp.error?.response?.data?.message ?? 'Replace File Failed',
            });
        } else {
            onReplaceSuccess();
            actionSuccessReporter({
                message: 'Replace File Successfully!',
            });
            setVisible(false);
        }
        setLoading(false);
    };

    const onCancel = () => {
        setVisible(false);
        setFileUploaded(undefined);
    };

    // tam thoi
    useEffect(() => {
        if (visible === false) {
            setTooltipReplace('Replace');
        }
    }, [visible]);

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <ActionButton icon={<MDIFileReplaceIcon />}
                disabled={disable}
                className='custom-action-btn'
                tooltip={tooltipReplace}
                theme="info"
                onClick={() => {
                    setTooltipReplace('');
                    setVisible(true);
                }}
            />
            <S8Modal
                title='Replace File'
                visible={visible}
                width={600}
                onCancel={onCancel}
                className='replace-file-modal'
            >
                {loading && <Loading.FullView />}
                <p className='description'>Replace the content of&nbsp;
                    <span className='file-display'>{fileData.display}</span>
                    &nbsp;with content of
                </p>
                <Upload.Dragger
                    name='file'
                    accept={fileData.content_type}
                    multiple
                    action={''}
                    maxCount={1}
                    beforeUpload={(file) => {
                        setFileUploaded(file);
                        return false;
                    }}
                    withCredentials
                    itemRender={(originNode, file, fileList, actions) => {
                        return (
                            <AttachmentViewShellEdge
                                data={{
                                    _id: fileData._id,
                                    content_type: fileData.content_type,
                                    filename: file.name,
                                    length: file.size,
                                }}
                                key={file.name}
                                onDelete={actions.remove}
                                downloadable={false}
                            />
                        );
                    }}
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
                <ComposeHeader type="tertiary" footer>
                    <ComposeHeader.HeaderItem>
                        <S8Button onClick={onCancel}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        <S8Button type='primary' onClick={onSubmit} disabled={!fileUploaded}>Submit</S8Button>
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </S8Modal>
        </div>
    );
}