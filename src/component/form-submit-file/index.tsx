import React, { useState, useMemo } from 'react';
import { Upload } from 'antd';
import { FileAddOutlined, FolderOpenFilled } from '@ant-design/icons';
import { S8Button } from '@gotecq/s8-component';
import { createUploader, errorReporter, RcFile } from '@gotecq/access';
import { AttachmentViewShellEdge } from '@gotecq/component.resource-extension';
import { AddSubmitterInfoForm } from './add-submitter-info-form';
import { CommandAPI, Requestor } from '@/access';
import { FileUploader } from './document-uploader';
import './style.scss';

type SubmitFileRequestForm = {
    fileRequestId: string
};

type SubmitFileResponse = {
    url: string,
    fields: {
        key: string,
        AWSAccessKeyId: string,
        policy: string,
        signature: string
    }
}

type FileUploadPayload = {
    file: RcFile,
    uploadingId: string,
    status: string
}

const uploader = createUploader();

export function SubmitFileRequestForm({
    fileRequestId,
}: SubmitFileRequestForm) {

    const [uploaded, setUploaded] = useState(false);
    const [submitterInfo, setSubmitterInfo] = useState<Record<string, any>>();

    const [listUploaded, setListUploaded] = useState<Record<string, FileUploadPayload>>({});
    const [selectedFiles, setSelectedFiles] = useState<Record<string, RcFile>>({});

    const disableUploadMoreBtn = useMemo(() => {
        let result = false;
        Object.entries(listUploaded).forEach(([key, value]) => {
            if (value.status !== 'finished' && value.status !== 'failed') {
                result = true;
            }
        });
        return result;
    }, [listUploaded]);

    const deleteFileUploaded = (id) => {
        setListUploaded((prev) => {
            let newDt = { ...prev };
            delete newDt[id];
            return newDt;
        });
    };

    const onUploadFinished = (id: string, status: string) => {
        setListUploaded(prev => {
            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    status: status,
                },
            };
        });
    };

    const onSubmitFile = async (submitterInfo) => {
        setUploaded(true);
        setSubmitterInfo(submitterInfo);
        Promise.allSettled(Object.values(selectedFiles).map(file => submitSingleFile(file, submitterInfo)));
    };

    const submitSingleFile = async (file: RcFile, submitterInformation = submitterInfo) => {
        try {
            const fileName = file.name;
            setListUploaded(prev => {
                return {
                    ...prev,
                    [file.uid]: {
                        file: file,
                        uploadingId: '',
                        status: 'requestLink',
                    },
                };
            });
            const res = await Requestor.request({
                method: 'POST',
                url: CommandAPI.fileRequest.submitFile(fileRequestId),
                data: {
                    ...submitterInformation,
                    filename: fileName,
                },
                timeout: 5 * 60 * 1000,
            });
            const resData = res?.data?._resp?.[0]?.data as SubmitFileResponse;
            const { id: uploadingId } = uploader.uploadFile({
                file: file as any,
                getPayload: file => ({
                    ...resData?.fields,
                    'x-amz-meta-uploaded-by': 'presigned-url',
                    file: file,
                }),
                url: resData?.url,
            }).upload();
            setListUploaded(prev => {
                return {
                    ...prev,
                    [file.uid]: {
                        ...prev[file.uid],
                        status: 'uploading',
                        uploadingId: uploadingId,
                    },
                };
            });
        } catch (e: any) {
            errorReporter(e, {
                message: `Submit file "${file.name}" failed`,
                description: e?.data?.message ?? e.response?.data?.message,
            });
            setListUploaded(prev => {
                return {
                    ...prev,
                    [file.uid]: {
                        ...prev[file.uid],
                        status: 'failed',
                    },
                };
            });
        }
    };

    const onUploadMore = () => {
        setUploaded(false);
        setListUploaded({});
        setSelectedFiles({});
    };

    return (
        <>
            {!uploaded ? <>
                <div className='upload-file-form'>
                    <i>Please upload files here</i>
                    <Upload.Dragger
                        name='file'
                        multiple
                        beforeUpload={(file) => {
                            setSelectedFiles(prev => {
                                return {
                                    ...prev,
                                    [file.uid]: file,
                                };
                            });
                            return false;
                        }}
                        withCredentials
                        onRemove={(file) => {
                            setSelectedFiles(prev => {
                                const newData = { ...prev };
                                delete newData[file.uid];
                                return newData;
                            });
                        }}
                        itemRender={(originNode, file, fileList, actions) => {
                            return (
                                <AttachmentViewShellEdge
                                    data={{
                                        _id: file.name,
                                        content_type: file.type,
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
                                Add files
                            </S8Button>
                        </p>
                    </Upload.Dragger>
                </div>
                {Object.keys(selectedFiles).length !== 0 &&
                    <AddSubmitterInfoForm submitterInfo={submitterInfo} handleSubmitInfo={onSubmitFile} />
                } </>
                : <div className='upload-file-form-result'>
                    <h3>Batch Result</h3>
                    <div className='list-uploaded-files'>
                        {Object.entries(listUploaded).map(([id, fileData]) =>
                            <FileUploader
                                data={fileData.file}
                                uploadingId={fileData.uploadingId}
                                loading={fileData.status === 'requestLink'}
                                key={id}
                                uploader={uploader}
                                onUploadFinish={onUploadFinished}
                                onDelete={deleteFileUploaded}
                                isError={fileData.status === 'failed'}
                                onRetry={submitSingleFile}
                            />,
                        )}
                    </div>
                    <div className='btn-upload-more'>
                        <S8Button type='primary'
                            onClick={onUploadMore}
                            icon={<FileAddOutlined />}
                            disabled={disableUploadMoreBtn}
                        >Add more files</S8Button>
                    </div>
                </div>
            }
        </>
    );
}

