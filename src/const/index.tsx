import { DefaultColorSchema } from '@gotecq/theme';
import { GlobalActivityTimelineEntry } from '@gotecq/component.resource-extension/component/timeline/item';
import { DatapackVisible } from '@gotecq/model';

export const STEP_STATUS = {
    SUBMITTED: 'SUBMITTED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CREATED: 'CREATED',
    RUNNING: 'RUNNING',
    FINALIZED: 'FINALIZED',
};

export const Visibility = {
    PUBLIC: 'PUBLIC',
    RESTRICTEDPUBLIC: 'RESTRICTEDPUBLIC',
    NONPUBLIC: 'NONPUBLIC',
};

export const tooltipVisibility = (visibility: DatapackVisible, creator: boolean) => {
    switch (visibility) {
        case 'PUBLIC':
            return 'All users can edit this datapack.';
        case 'RESTRICTEDPUBLIC':
            return 'All users can view but only users with access can edit this datapack.';
        case 'NONPUBLIC':
            return 'Only users with access can view and edit this datapack.';
        default:
            break;
    }
};

export const STEP_STATUS_LABEL_MAPPING = {
    [STEP_STATUS.SUBMITTED]: { display: 'Submitted', colorSet: DefaultColorSchema.primary },
    [STEP_STATUS.COMPLETED]: { display: 'Completed', colorSet: DefaultColorSchema.success },
    [STEP_STATUS.FAILED]: { display: 'Failed', colorSet: DefaultColorSchema.danger },
    [STEP_STATUS.CREATED]: { display: 'Created', colorSet: DefaultColorSchema.tertiaryDarker },
    [STEP_STATUS.RUNNING]: { display: 'Running', colorSet: DefaultColorSchema.warning },
    [STEP_STATUS.FINALIZED]: { display: 'Finalized', colorSet: DefaultColorSchema.success },
};


export const ItemMapping = {
    'add-resource': GlobalActivityTimelineEntry['AddResource'],
    'create-datapack': GlobalActivityTimelineEntry['CreateActivity'],
    'create-file-request': GlobalActivityTimelineEntry['CreateActivity'],
    'create-transport': GlobalActivityTimelineEntry['CreateActivity'],
    'create-retrieval-scheduling': GlobalActivityTimelineEntry['CreateActivity'],
    'delete-resource': GlobalActivityTimelineEntry['RemoveActivity'],
    'delete-file-request': GlobalActivityTimelineEntry['RemoveActivity'],
    'delete-transport': GlobalActivityTimelineEntry['RemoveActivity'],
    'delete-datapack': GlobalActivityTimelineEntry['RemoveActivity'],
    'lock-datapack': GlobalActivityTimelineEntry['LockActivity'],
    'unlock-datapack': GlobalActivityTimelineEntry['UnlockActivity'],
    'activate-scheduled-data-retrieval': GlobalActivityTimelineEntry['UnlockActivity'],
    'deactivate-scheduled-data-retrieval': GlobalActivityTimelineEntry['LockActivity'],
    'send-data': GlobalActivityTimelineEntry['SendActivity'],
    'replace-file-resource': GlobalActivityTimelineEntry['ReplaceActivity'],
    'retrieve-data': GlobalActivityTimelineEntry['RetrieveActivity'],
    'update-resource-information': GlobalActivityTimelineEntry['UpdateActivity'],
    'update-datapack-information': GlobalActivityTimelineEntry['UpdateActivity'],
    'update-file-request': GlobalActivityTimelineEntry['UpdateActivity'],
    'update-transport': GlobalActivityTimelineEntry['UpdateActivity'],
    'update-scheduled-retrieval-frequency': GlobalActivityTimelineEntry['UpdateActivity'],
    'share-file-request': GlobalActivityTimelineEntry['ShareFileReuqestActivity'],
};