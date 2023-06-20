import React, { useEffect, useState } from 'react';
import {
    ArrowLeftOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import { ComposeHeader, S8Button } from '@gotecq/s8-component';
import './style.scss';
import { APP_URL } from '@/config';
import { Copiable } from '@gotecq/format';
import { LayoutPanelComponent } from '@gotecq/layout';
import { useRequest } from '@gotecq/access';
import { QueryAPI, Requestor } from '@/access';
import { Datapack } from '@gotecq/model';
import { ResourceModel } from '@/models';

const getEncounterDirectLink = (datapackId: string, fileId: string) => {
    return `${APP_URL()}tecq/dtp/file-manager:${datapackId}/file-list:${fileId}/file-preview`;
};

export const FileOverviewNavbar = ({ layoutService }: LayoutPanelComponent) => {
    const datapackId = layoutService.getRootId() ?? '';
    const { fileId = '' } = layoutService.getParam('primary');

    const [nextId, setNextId] = useState('');
    const [previousId, setPreviousId] = useState('');
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);

    const [{ data: datapack }] = useRequest<Datapack>(QueryAPI.datapack.single(datapackId));

    const handleBackToDatapack = () => {
        layoutService
            .setLayout('datapack-manager')
            .setPrimary('datapack-list')
            .setSecondary('datapack-board')
            .setExtension('filter-list')
            .setRootId('')
            .addParam('primary', { 'listId': datapackId, 'listIdType': 'datapack' })
            .go();
    };

    const handleNextPrevResource = (resourceId: string) => {
        layoutService
            .addParam('primary', { 'fileId': resourceId })
            .go();
    };

    useEffect(() => {
        if (fileId) {
            (async () => {
                setLoadingNext(true);
                const resource = await Requestor.request.GET(QueryAPI.datapack.resource.single(datapackId, fileId));
                let [resNextResource] = await Requestor.request.GET(QueryAPI.datapack.resource.nextFile(datapackId, resource?._created));

                setNextId(resNextResource?._id ?? '');
                setLoadingNext(false);
            })();
            (async () => {
                setLoadingPrev(true);
                const resource = await Requestor.request.GET(QueryAPI.datapack.resource.single(datapackId, fileId));
                let [resPrevResource] = await Requestor.request.GET(QueryAPI.datapack.resource.previousFile(datapackId, resource?._created));

                setPreviousId(resPrevResource?._id ?? '');
                setLoadingPrev(false);
            })();
        }
        return () => {
            setNextId('');
            setPreviousId('');
        };
    }, [datapackId, fileId]);

    return <ComposeHeader
        className="resource-listing-navbar"
        type='secondary'
    >
        <ComposeHeader.HeaderItem className='btn-back'>
            <S8Button onClick={handleBackToDatapack} >
                <ArrowLeftOutlined /> Back
            </S8Button>
        </ComposeHeader.HeaderItem>
        <ComposeHeader.HeaderItem span>
            <ComposeHeader.HeaderTitle
                title={datapack?.title}
            />
        </ComposeHeader.HeaderItem>
        <ComposeHeader.HeaderItem className='header-items-right'>
            <S8Button>
                <Copiable copyingContent={getEncounterDirectLink(datapackId, fileId)}>
                    <CopyOutlined />
                    Copy URL
                </Copiable>
            </S8Button>
            <S8Button
                disabled={previousId === '' || loadingNext || loadingPrev}
                onClick={() => handleNextPrevResource(previousId)}
            >
                <DoubleLeftOutlined />
                Previous
            </S8Button>
            <S8Button
                disabled={nextId === '' || loadingNext || loadingPrev}
                onClick={() => handleNextPrevResource(nextId)}
            >
                Next
                <DoubleRightOutlined />
            </S8Button>
        </ComposeHeader.HeaderItem>
    </ComposeHeader >;
};