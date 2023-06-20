import React, { useRef } from 'react';
import { Dropdown, Menu } from 'antd';
import { NavBar, NotificationWidget } from '@gotecq/core';
import { ExtractProps } from '@gotecq/utils';
import { RealTimeAccess } from '@/access';
import { drawerMenu } from '@/constant';
import { ManageIcon, TransportIcon, UILHistory } from '@/asset';
import { ManageTransport } from '../modal';
import { useHistory } from 'react-router-dom';
import { NavBarModal } from '../nav-bar-modal';
import { SettingOutlined } from '@ant-design/icons';
import './style.scss';

export const DatapackNavBar = (props: ExtractProps<typeof NavBar>) => {
    const manageTransportRef = useRef<any>();
    const lastModuleRef = useRef<any>('datapack-manager');
    const history = useHistory();

    const pathName = window.location.pathname;
    const moduleName = pathName.split('/')?.[3];

    if (moduleName === 'datapack-public') {
        return <NavBar>
            <NavBar.BranchName />
        </NavBar>;
    } else if (moduleName === 'active-history-manager') {
        return <NavBarModal
            onBack={() => history.push(`/${lastModuleRef.current}/`)}
            title='Global activity history'
        />;
    } else if (moduleName?.includes('file-manager')) {
        return <></>;
    }

    return <NavBar {...props} className='datapack-navbar'>
        <NavBar.BranchNameWithDrawer menu={drawerMenu}
            indicator={<NavBar.NavItem right clickable={false}>
                <NavBar.MQTTStatus realtimeAccess={RealTimeAccess} />
            </NavBar.NavItem>}
        />
        <NavBar.HomeButton />
        <NavBar.AppModuleList menuList={drawerMenu} />
        <NavBar.NavItem right clickable={false}>
            <Dropdown trigger={['click']} className='icon-manage' placement='bottomRight' overlay={<Menu className='global-manage-menu'>
                <Menu.Item onClick={() => manageTransportRef.current?.open()}>
                    <TransportIcon />
                    <span>Manage Transport</span>
                </Menu.Item>
                <Menu.Item onClick={() => {
                    lastModuleRef.current = moduleName;
                    history.push('/active-history-manager/');
                }}>
                    <UILHistory />
                    <span>View Activity History</span>
                </Menu.Item>
            </Menu>}>
                <div className={'utility-widget-container'}
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className='widget-container-button'>
                        <SettingOutlined />
                    </div>
                </div>
            </Dropdown>
            <ManageTransport ref={manageTransportRef} />
        </NavBar.NavItem>
        <NavBar.NavItem right>
            <NotificationWidget realTimeAccess={RealTimeAccess} />
        </NavBar.NavItem>
        <NavBar.NavItem right>
            <NavBar.UserDropDown />
        </NavBar.NavItem>
    </NavBar>;
};