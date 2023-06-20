import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload } from 'antd';
import { FileAddOutlined, FolderOpenFilled } from '@ant-design/icons';
import { ComposeHeader, Loading, S8Button, S8Modal } from '@gotecq/s8-component';
import { actionSuccessReporter, createUploader, errorReporter } from '@gotecq/access';
import { CommandAPI, DataProfile } from '@/access';
import { FileUploader, FileUpdatePayload } from './file-uploader';
import './style.scss';

type DocumentUploadForm = {
    datapackId: string;
    onSubmitSuccess?: () => void;
    onDismiss?: () => void;
    mode?: 'upload' | 'replace'
};

const uploader = createUploader();

export const UploadFileModal = forwardRef(({
    datapackId,
    onSubmitSuccess,
    onDismiss,
    mode = 'upload',
}: DocumentUploadForm, ref) => {
    const [visible, setVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [listUploaded, setListUploaded] = useState<Record<string, FileUpdatePayload>>({});
    const { getUploadingList } = uploader.useUploadingList();

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const uploadingList = getUploadingList();

    const submittedList = uploadingList?.map((item) => {
        const { response } = item.getLatestFeedback();
        return { _iid: response?.data?._resp?.[0]?.data?._iid, cancelUpload: item.cancelUpload, status: item.getStatus() };
    });
    const deleteFileUploaded = (uploadingId) => {
        setLoading(true);
        setListUploaded((prev) => {
            let newData = { ...prev };
            delete newData[uploadingId];
            return newData;
        });
        setLoading(false);
    };
    const saveHandler = async () => {
        try {
            setLoading(true);
            //send request
            await Promise.all(Object.entries(listUploaded)
                .filter(([id, value]) => value._iid)
                .map(([id, value]) => {
                    return DataProfile.Post(CommandAPI.datapack.resource.update(datapackId), {
                        data: value,
                    });
                }),
            );
            actionSuccessReporter({
                message: 'Save successfully!',
            });
            setVisible(false);
            setListUploaded({});
            onSubmitSuccess?.();
        } catch (e: any) {
            errorReporter(e, {
                message: e?.data?.message ?? 'Submit failed',
            });
        } finally {
            setLoading(false);
        }

    };

    const fileInfoChange = (id: string, iid: string, key: keyof FileUpdatePayload, value: string) => {
        let newInfo = { ...listUploaded[id] };
        if (!newInfo['_iid']) {
            newInfo['_iid'] = iid;
        }
        newInfo[key] = value;
        setListUploaded(prev => {
            return {
                ...prev,
                [id]: newInfo,
            };
        });
    };

    const dismissHandler = async (e) => {
        e.stopPropagation();
        try {
            setLoading(true);
            if (Object.entries(listUploaded).length !== 0) {
                submittedList?.forEach(item => {
                    item.cancelUpload();
                });
                if (datapackId && submittedList && submittedList.length !== 0) {
                    await Promise.all(submittedList
                        .filter((item) => item?.status === 'finished')
                        .map((item) => {
                            return DataProfile.Post(CommandAPI.datapack.resource.delete(datapackId), {
                                data: {
                                    _iid: item?._iid,
                                },
                            });
                        }),
                    );
                    actionSuccessReporter({ message: 'Delete all files sucessfully!', target: 'Files', action: 'Delete' });
                }
                setListUploaded({});
            }
            setVisible(false);
            onDismiss?.();
        } catch (e) {
            errorReporter(e);
        } finally {
            setLoading(false);
        }
    };


    return (
        <S8Modal
            width={600}
            className='upload-resource-file-modal'
            visible={visible}
            title='Upload File'
            onCancel={dismissHandler}
        >
            <Upload.Dragger
                name='file'
                multiple
                action={''}
                customRequest={option => {
                    const { id: uploadingId } = uploader.uploadFile({
                        file: option.file as any,
                        getPayload: file => ({
                            file: file,
                            display: file.name,
                            kind: 'FILE',
                        }),
                        url: CommandAPI.datapack.resource.add(datapackId),
                    }).upload();
                    if (mode === 'upload') {
                        setListUploaded(prev => {
                            let newData = { ...prev };
                            newData[uploadingId] = {};
                            return newData;
                        });
                    } else {
                        setListUploaded({
                            [uploadingId]: {},
                        });
                    }
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
                {Object.keys(listUploaded).map((id) =>
                    <FileUploader
                        datapackId={datapackId}
                        data={id}
                        key={id}
                        uploader={uploader}
                        onDelete={deleteFileUploaded}
                        onChange={fileInfoChange}
                    />,
                )}
                {loading && <Loading.FullView />}
            </div>
            <ComposeHeader footer type="tertiary">
                <ComposeHeader.HeaderItem>
                    <S8Button onClick={dismissHandler}>Cancel</S8Button>
                </ComposeHeader.HeaderItem>
                <ComposeHeader.HeaderItem right>
                    <S8Button type='primary' onClick={saveHandler}>Done</S8Button>
                </ComposeHeader.HeaderItem>
            </ComposeHeader>
        </S8Modal>
    );
});