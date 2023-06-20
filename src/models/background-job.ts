import { ColorSchema, DefaultColorSchema, fillSchema } from '@gotecq/theme';

export type BackgroundJobModel = typeof defaultBackgroundJob;

export const defaultBackgroundJob = {
    'job_message': '',
    'resource_id': '',
    '_id': '',
    'start_time': '',
    'resource': '',
    'job_id': '',
    '_deleted': '',
    'function': '',
    'job_progress': 0,
    'finish_time': '',
    'reference_domain': '',
    'enqueue_time': '',
    '_creator': '',
    'reference_id': '',
    '_created': '',
    'job_try': '',
    'domain': '',
    'job_status': '' as BackgroundJobStatus,
    'reference_resource': '',
    'error_message': '',
};

export type BackgroundJobStatus = 'pending' | 'finished' | 'in progress' | 'canceled' | 'failed';

export const BackgroundJobStatusColorScheme: Record<BackgroundJobStatus, ColorSchema> = {
    pending: DefaultColorSchema.warning,
    finished: DefaultColorSchema.success,
    failed: DefaultColorSchema.danger,
    'in progress': DefaultColorSchema.purple,
    canceled: DefaultColorSchema.tertiaryDarker,
};