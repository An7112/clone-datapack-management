import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ComposeHeader, S8Button } from '@gotecq/s8-component';
import './style.scss';

type NavBarModalProps = {
    onBack: () => void
    title: React.ReactNode
}

export const NavBarModal = ({
    onBack, title,
}: NavBarModalProps) => {
    return <ComposeHeader
        className="resource-listing-navbar"
        type='secondary'
    >
        <ComposeHeader.HeaderItem className='btn-back'>
            <S8Button onClick={onBack}>
                <ArrowLeftOutlined /> Back
            </S8Button>
        </ComposeHeader.HeaderItem>
        <ComposeHeader.HeaderItem span>
            <ComposeHeader.HeaderTitle
                title={title}
            />
        </ComposeHeader.HeaderItem>
    </ComposeHeader >;
};