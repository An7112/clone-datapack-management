import { S8Modal } from '@gotecq/s8-component';
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Row, Col, Dropdown, Button, Menu } from 'antd';
import {
    BaseForm,
    SubmitField,
    ErrorsField,
    MultipleSelectWithGuidanceField,
    SelectField,
} from '@gotecq/form';
import { ComposeHeader, S8Button } from '@gotecq/s8-component';
import { AccessUser, DatapackVisibleText } from '@/models';
import { schema } from './schema';
import { EntityUser } from '@gotecq/component.entity';
import { humanFormat } from '@gotecq/format';
import './style.scss';
import { IconNonPublic, IconPublic, IconRestrictedPublic } from '@/asset';
import { CheckOutlined, CaretDownOutlined } from '@ant-design/icons';
import { DatapackStatus, DatapackVisible } from '@gotecq/model';
import { errorNotification } from '@/util';
import { CommandAPI, QueryAPI, REFRESH_ACCESS_USER, Requestor } from '@/access';
import { actionSuccessReporter, useRequest } from '@gotecq/access';
import { DatapackEntity } from '@/entity';

type EditAccessUserProps = {
    onSubmitSuccess: () => void
    onRefresh?: () => void,
    datapackId: string,
    visibility: DatapackVisible,
}

const subGeneralAccess = {
    'PUBLIC': 'All users can view and edit this data pack',
    'NONPUBLIC': 'Only users with access can view and edit the data pack',
    'RESTRICTEDPUBLIC': 'Only users with access can edit the data pack',
};

export const EditAccessUser = forwardRef(({
    onSubmitSuccess,
    onRefresh = () => { },
    datapackId,
    visibility,
}: EditAccessUserProps, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isChange, setIsChange] = useState(false);
    const [selectedUser, setSelectedUser] = useState(false);
    const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
    const [generalAccess, setGeneralAccess] = useState<DatapackVisible>(visibility);
    const [{ data: accessUserList = [], isLoading: loadingAccessUser }, refreshAccessUser] = useRequest<AccessUser[]>(
        datapackId &&
        QueryAPI.datapack.accessUser.all(datapackId),
    );

    useImperativeHandle(ref, () => ({
        open: () => setVisible(true),
    }));

    const handleRefreshAccessUser = () => {
        refreshAccessUser();
    };

    const handleSubmitSuccess = () => {
        onSubmitSuccess();
        setVisible(false);
    };

    const onClose = () => {
        setVisible(false);
        isChange && onRefresh();
        isChange && REFRESH_ACCESS_USER();
    };

    const handleHasChange = () => {
        setIsChange(true);
    };

    const onChangeModel = (model) => {
        if (model?.accessUser?.length > 0) {
            setSelectedUser(true);
        } else {
            setSelectedUser(false);
        }
    };

    const handleUpdateVisibility = (value: DatapackVisible) => {
        (async () => {
            try {
                setLoading(true);
                await Requestor.request.POST(CommandAPI.datapack.update(datapackId), {
                    data: {
                        visible: value,
                    },
                });
                setGeneralAccess(value);
                actionSuccessReporter({ target: 'Visibility', action: 'Update' });
                handleHasChange();
            } catch (error) {
                errorNotification(error);
            } finally {
                setLoading(false);
            }
        })();
    };

    const renderListGeneralAccess = () => {
        return <Menu className='menu-sub-template'>
            {Object.keys(DatapackVisibleText).map((item: any) => {
                return <Menu.Item key={item}
                    onClick={() => {
                        handleUpdateVisibility(item);
                    }}
                >
                    {item === generalAccess && <CheckOutlined style={{ color: 'var(--main-success)' }} />} {DatapackVisibleText?.[item]}
                </Menu.Item>;
            })}
        </Menu>;
    };

    const renderIcon = () => {
        if (generalAccess === 'NONPUBLIC') {
            return <IconNonPublic />;
        } else if (generalAccess === 'PUBLIC') {
            return <IconPublic className='icon-public' />;
        } else if (generalAccess === 'RESTRICTEDPUBLIC') {
            return <IconRestrictedPublic />;
        }
    };

    const handleSubmit = async (model) => {
        try {
            setLoading(true);
            const listUser = model?.accessUser.map(item => {
                return {
                    member_id: item,
                    role: model.role,
                };
            });

            await Requestor.request.POST(CommandAPI.datapack.accessUser.add(datapackId), {
                data: {
                    relation: listUser,
                },
            });
            REFRESH_ACCESS_USER();
            actionSuccessReporter({ target: 'Access User', action: 'Create' });
            handleSubmitSuccess();
        } catch (error) {
            errorNotification(error);
        } finally {
            setLoading(false);
        }

    };

    const onChangeRole = () => {
        // if (!isChange) setIsChange(true);
    };

    const handleLoading = (value: boolean) => {
        setLoading(value);
    };

    return (
        <S8Modal
            visible={visible}
            onCancel={onClose}
            title="Grant Datapack Access"
            className='access-user-modal'
            nopadding
            destroyOnClose
            width={480}
        >
            <BaseForm
                className="access-user-form"
                schema={schema}
                handleSubmit={handleSubmit}
                handleSubmitFail={() => { }}
                handleSubmitSuccess={() => { }}
                onChangeModel={onChangeModel}
                isLoading={loading}
                modelTransform={(mode, model) => {
                    return {
                        ...model,
                        role,
                    };
                }}
            >
                <div className='select-role-access-user'>
                    <MultipleSelectWithGuidanceField
                        name='accessUser'
                        className='select-user truncate'
                    // disabled={userInfo._id !== datapackEntity?._creator}
                    />
                    {selectedUser && <SelectField name='role' className='select-role' defaultValue={role}
                        onChangeValue={(value) => setRole(value)} />}
                </div>
                {!selectedUser && <>
                    <AccessUserListComponent
                        accessUserList={accessUserList}
                        onChangeRole={onChangeRole}
                        datapackId={datapackId}
                        handleLoading={handleLoading}
                        handleRefreshAccessUser={handleRefreshAccessUser}
                        handleHasChange={handleHasChange}
                    />
                    <ComposeHeader.HeaderTitle
                        title={'General access'}
                        className='header-title'
                    />
                    <div className='general-access'>
                        {renderIcon()}
                        <div className='select-general-access-container'>
                            <Dropdown
                                trigger={['click']}
                                overlay={renderListGeneralAccess} placement="bottomLeft"
                            >
                                <Button size='small' type='text'>
                                    {DatapackVisibleText?.[generalAccess]}
                                    <CaretDownOutlined />
                                </Button>
                            </Dropdown>
                            <div className='sub-general-access'>{subGeneralAccess?.[generalAccess]}</div>
                        </div>
                    </div>
                </>}
                <ErrorsField />
                <ComposeHeader className="footer" type="tertiary">
                    <ComposeHeader.HeaderItem>
                        <S8Button onClick={onClose}>Cancel</S8Button>
                    </ComposeHeader.HeaderItem>
                    <ComposeHeader.HeaderItem right>
                        {selectedUser
                            ? <SubmitField value='Add' />
                            : <S8Button onClick={onClose} type='primary'>Done</S8Button>}
                    </ComposeHeader.HeaderItem>
                </ComposeHeader>
            </BaseForm>
        </S8Modal>
    );
});

const AccessUserListComponent = ({
    accessUserList,
    onChangeRole,
    datapackId,
    handleLoading,
    handleRefreshAccessUser,
    handleHasChange,
}: {
    accessUserList: AccessUser[],
    onChangeRole: () => void,
    datapackId: string,
    handleLoading: (value: boolean) => void,
    handleRefreshAccessUser: () => void,
    handleHasChange: () => void,
}) => {

    return <div className='access-user-view-container'>
        <ComposeHeader.HeaderTitle
            title={'Users with access'}
            className='header-title'
        />
        <div className='access-user-list'>
            {accessUserList.filter(item => item.role === 'OWNER').map(item => {
                return <div className='access-user-row'>
                    <EntityUser id={item.member_id} fields={{
                        primarySlot: (data) => humanFormat.name(data),
                        secondarySlot: (data) => data?.telecom__email,
                    }} />
                    <div className='access-user-role'>Owner</div>
                </div>;
            })}
            {accessUserList.filter(item => item.role === 'EDITOR').map(item => {
                return <AccessUserRowComponent
                    key={item._id}
                    accessUser={item}
                    onChangeRole={onChangeRole}
                    datapackId={datapackId}
                    handleLoading={handleLoading}
                    handleRefreshAccessUser={handleRefreshAccessUser}
                    handleHasChange={handleHasChange}
                />;
            })}
            {accessUserList.filter(item => item.role === 'VIEWER').map(item => {
                return <AccessUserRowComponent
                    key={item._id}
                    accessUser={item}
                    onChangeRole={onChangeRole}
                    datapackId={datapackId}
                    handleLoading={handleLoading}
                    handleRefreshAccessUser={handleRefreshAccessUser}
                    handleHasChange={handleHasChange}
                />;
            })}
        </div>
    </div>;
};

const ROLE = {
    'EDITOR': 'Editor',
    'VIEWER': 'Viewer',
};

const AccessUserRowComponent = ({
    accessUser,
    onChangeRole,
    datapackId,
    handleLoading,
    handleRefreshAccessUser,
    handleHasChange,
}: {
    accessUser: AccessUser,
    onChangeRole: () => void,
    datapackId: string
    handleLoading: (value: boolean) => void
    handleRefreshAccessUser: () => void
    handleHasChange: () => void
}) => {
    const [role, setRole] = useState(accessUser.role);

    const handleUpdateRole = async (value: string) => {
        try {
            handleLoading(true);
            await Requestor.request.POST(CommandAPI.datapack.accessUser.add(datapackId), {
                data: {
                    relation: [{
                        member_id: accessUser.member_id,
                        role: value,
                    }],
                },
            });

            actionSuccessReporter({ target: 'Access User', action: 'Update' });
            setRole(value);
            handleHasChange();
            onChangeRole();
        } catch (error) {
            errorNotification(error);
        } finally {
            handleLoading(false);
        }
    };

    const handleDeleteAccessUser = async () => {
        try {
            handleLoading(true);
            await Requestor.request.POST(CommandAPI.datapack.accessUser.delete(datapackId), {
                data: {
                    members: [accessUser.member_id],
                },
            });

            actionSuccessReporter({ target: 'Access User', action: 'Delete' });
            handleRefreshAccessUser();
            handleHasChange();
            onChangeRole();
        } catch (error) {
            errorNotification(error);
        } finally {
            handleLoading(false);
        }
    };

    const renderListRole = () => {
        return <Menu className='menu-sub-template'>
            {Object.keys(ROLE).map(item => {
                return <Menu.Item key={item}
                    onClick={() => handleUpdateRole(item)}
                >
                    {item === role && <CheckOutlined style={{ color: 'var(--main-success)' }} />} {ROLE?.[item]}
                </Menu.Item>;
            })}
            <Menu.Item key={'DElETE'}
                onClick={handleDeleteAccessUser}
            >
                Delete
            </Menu.Item>
        </Menu>;
    };

    return <div className='access-user-row'>
        <EntityUser id={accessUser.member_id} fields={{
            primarySlot: (data) => humanFormat.name(data),
            secondarySlot: (data) => data?.telecom__email,
        }} />
        <Dropdown
            trigger={['click']}
            overlay={renderListRole} placement="bottomRight"
        >
            <Button size='small' type='text'>
                {ROLE?.[role]}
                <CaretDownOutlined />
            </Button>
        </Dropdown>
    </div>;
};