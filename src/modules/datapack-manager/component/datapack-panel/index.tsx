import { DetailedDatapackPanel } from './detail';
import { UploadResourcePanel } from './upload-resource';
import { DatapackPanelProps } from './model';
import { HistoryPanel } from './history';

export const DatapackPanel: Record<string, React.ComponentType<DatapackPanelProps>> = {
    main: DetailedDatapackPanel,
    upload_resource: UploadResourcePanel,
    history: HistoryPanel,
};

export type { DatapackPanelProps } from './model';