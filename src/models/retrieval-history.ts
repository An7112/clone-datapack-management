import { ColorSchema, DefaultColorSchema, fillSchema } from '@gotecq/theme';
export type RetrievalHistoryStatus = 'FAILED'
    | 'SUCCESS'
    | 'RUNNING'
    | 'unknown'

export const RetrievalHistoryColorScheme: Record<RetrievalHistoryStatus, ColorSchema> = fillSchema(
    {
        FAILED: DefaultColorSchema.warning,
        SUCCESS: DefaultColorSchema.success,
        RUNNING: DefaultColorSchema.purple,
        unknown: DefaultColorSchema.tertiaryDarker,
    },
);

export type RetrievalHistory = typeof defaultRetrievalHistory;

export const defaultRetrievalHistory = {
    _created: '',
    _creator: '',
    _deleted: '',
    metadata: {
        resources_total: '',
    },
    _etag: '',
    _id: '',
    _updated: '',
    _updater: '',
    finish_time: '',
    log_detail: '',
    scheduler_id: '',
    start_time: '',
    status: '',
};

