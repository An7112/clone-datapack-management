import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import {
    DatapackColorScheme,
    DatapackVisibleColorScheme,
    DatapackVisibleText,
    ResourceStatus,
    ResourceColorScheme,
    ScheduleStatus,
    ScheduleColorScheme,
    RetrievalHistoryStatus,
    RetrievalHistoryColorScheme,
    BackgroundJobStatusColorScheme,
    BackgroundJobStatus,
} from '@/models';
import { ExtractProps } from '@gotecq/utils';
import { DefaultColorSchema } from '@gotecq/theme';
import { ActionIndicator, FormatText, FormatTitle } from '@gotecq/format';
import { CoreLabel, createLabel, ActionButton, S8InfoList, NonDataPanel, Loading } from '@gotecq/s8-component';
import { BXLockAlt, BXUnlockAlt, ZMDIRefreshIcon } from '@/asset';
import './atom.scss';
import styled from 'styled-components';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { DatapackStatus, DatapackVisible } from '@gotecq/model';

// NEW
export const ResourceStatusLabel = createLabel<ResourceStatus>(
    ResourceColorScheme, { fallbackType: 'unknown', fill: 'outlined' },
);
export const ScheduleStatusLabel = createLabel<ScheduleStatus>(
    ScheduleColorScheme, { fallbackType: 'unknown', display: (value) => value.toLocaleLowerCase(), fill: 'outlined' },
);
export const RetrievalHistoryStatusLabel = createLabel<RetrievalHistoryStatus>(
    RetrievalHistoryColorScheme,
    {
        fallbackType: 'unknown', display: (value) => {
            if (value === 'SUCCESS') {
                return 'Successful';
            } else {
                return value.toLocaleLowerCase();
            }
        }, fill: 'outlined',
    },
);
export const DatapackStatusLabel = createLabel<DatapackStatus>(
    DatapackColorScheme, { fallbackType: 'unknown', display: (value) => value.toLocaleLowerCase(), fill: 'outlined' },
);

export const DatapackVisibleLabel = createLabel<DatapackVisible>(
    DatapackVisibleColorScheme,
    {
        fallbackType: 'unknown', display: (key: string) => {
            return <>{DatapackVisibleText[key]}</>;
        },
    },
);

export const BackgroundJobStatusLabel = createLabel<BackgroundJobStatus>(
    BackgroundJobStatusColorScheme, { fallbackType: 'unknown', display: (value) => value.toLocaleLowerCase(), fill: 'outlined' },
);

export const FileRequestStatus = createLabel<'active' | 'inactive' | 'unknown'>(
    {
        'active': DefaultColorSchema.major,
        'inactive': DefaultColorSchema.grey,
        'unknown': DefaultColorSchema.grey,
    }, { fallback: 'unknown', fill: 'outlined' },
);

export const LabelLoading = <CoreLabel><LoadingOutlined /></CoreLabel>;

export const ActionRefresh = (props: ActionButton & { isLoading?: boolean }) => {
    const { isLoading } = props;
    return <ActionButton
        icon={isLoading ? <Loading.Icon /> : <ZMDIRefreshIcon />}
        theme="primary"
        name="refresh"
        tooltip="Refresh"
        {...props}
    />;
};

export const ActionLockVerbose = (props: ActionButton & { isLoading?: boolean, textTooltip?: string }) => {
    const { isLoading, textTooltip } = props;
    return <ActionButton
        icon={isLoading ? <Loading.Icon /> : <BXLockAlt />}
        theme="major"
        name="lock"
        tooltip={textTooltip}
        {...props}
    />;
};

export const ActionUnlockVerbose = (props: ActionButton & { isLoading?: boolean, textTooltip?: string }) => {
    const { isLoading, textTooltip } = props;
    return <ActionButton
        icon={isLoading ? <Loading.Icon /> : <BXUnlockAlt />}
        theme="major"
        name="unlock"
        tooltip={textTooltip}
        {...props}
    />;
};

export const ActionEditVerbose = (props: ActionButton) => {
    return <ActionButton.Edit
        theme="major"
        name="edit-panel"
        tooltip="Edit"
        size="sm"
        {...props}
    />;
};

export const ActionDeleteVerbose = (props: ExtractProps<(typeof ActionButton['Delete'])>) => {
    return <ActionButton.Delete
        name="edit-panel"
        tooltip="Delete"
        {...props}
    />;
};

export type DataWithTooltip<Data extends Record<string, any>> = {
    data: Data,
    children?: string,
    contentField?: keyof Data,
    overlayField: Record<string, keyof Data>,
    name?: string,
}
export const DataWithTooltip = <Data extends Record<string, any>>({
    data,
    overlayField,
    contentField,
    name = 'generic',
}: DataWithTooltip<Data>) => {
    const overlayData: Record<string, any> = {};
    Object.entries(overlayField).forEach(([key, value]) => {
        overlayData[key] = data[value];
    });

    return <FormatText
        casing="capitalize"
        value={contentField === undefined ? '' : data[contentField]}
        suffix={<ActionIndicator.Detail
            tooltip={<S8InfoList.AlignLeft data={overlayData} />}
            tooltipProps={{
                overlayClassName: `data-tooltip-${name}`,
            }}
        />}
    />;
};

export type TitleWithTooltip<Data extends Record<string, any>> = {
    label: React.ReactNode,
    data: Data,
    children?: string,
    contentField?: keyof Data,
    overlayField: Record<string, keyof Data>,
}
export const TitleWithTooltip = <Data extends Record<string, any>>({
    label,
    data,
    overlayField,
    contentField,
}: TitleWithTooltip<Data>) => {
    const overlayData: Record<string, any> = {};
    Object.entries(overlayField).forEach(([key, value]) => {
        overlayData[key] = data[value];
    });

    return <FormatTitle
        label={label}
        value={contentField === undefined ? '' : data[contentField]}
        suffix={<ActionIndicator.Detail
            tooltip={<S8InfoList.AlignLeft data={overlayData} />}
        />}
    />;
};

export const CaptializeText = ({ data }: { data: string }) => <FormatText casing="capitalize" value={data} />;
export const SimpleTitle = ({ data }: { data: any }) => `${data}`;

export const NonDataOverlay = () => {
    return <div className="non-data-overlay">
        <NonDataPanel />
    </div>;
};


const InfoBannerContainner = styled.div`
    border-radius: var(--br);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: #FFF8EA;
    margin-bottom: var(--spacing-md);
    margin-top: var(--spacing-md);
    .message {
        display: grid;
        grid-template-columns: auto 1fr;
        margin-bottom: var(--spacing-xs);
        column-gap: var(--spacing-sm);
        & > .anticon {
            padding-top: var(--spacing-xs);
        }
        .anticon-exclamation-circle {
            color: var(--main-warning);
            margin-left: var(--spacing-xs);
        }
    }
`;
type TInfoBanner = {
    content: string;
}

export const InfoBanner = ({ content }: TInfoBanner) => {
    return (
        <InfoBannerContainner className='info-banner-wrap'>
            <div className="message">
                <ExclamationCircleFilled />
                <div>
                    <div>{content}</div>
                </div>
            </div>
        </InfoBannerContainner>
    );
};

export const TableCellContainer = styled.div<{ $align?: 'left' | 'center' | 'right' }>`
    display: flex;
    flex-direction: column;
    align-self: center;
    padding: var(--spacing-sm);
    width: 100%;
    text-align: ${props => {
        switch (props.$align) {
            case 'center': return 'center;';
            case 'right': return 'right;';
            default: return 'left;';
        }
    }};
`;