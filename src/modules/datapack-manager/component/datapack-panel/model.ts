import { ILayoutService } from '@gotecq/layout';

export type DatapackPanelProps = {
    datapackId: string,
    // setPanel: (panelKey?: string, id?: string, idType?: string) => void,
    subPanelData?: {
        subPanelType: string,
        subPanelId: string,
        subPanelIdType: string,
    },
    setSubPanel: (subPanelKey?: string, id?: string, idType?: string) => void,
    setFilter: (filter: any) => void,
    layoutService?: ILayoutService;
};