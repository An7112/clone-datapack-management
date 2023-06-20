
import React from 'react';
import {
    FolderOutlined,
    CalendarOutlined,
} from '@ant-design/icons';

export const drawerMenu = [
    {
        key: 'datapack-manager',
        title: 'Datapack',
        link: '/datapack-manager',
        icon: () => <FolderOutlined />,
    },
    {
        key: 'schedule-manager',
        title: 'Retrieval Scheduling',
        link: '/schedule-manager',
        icon: () => <CalendarOutlined />,

    },
];