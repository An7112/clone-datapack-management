import { ColorSchema, DefaultColorSchema, fillSchema } from '@gotecq/theme';

export type ScheduleStatus = 'active'
    | 'inactive'

export const ScheduleColorScheme: Record<ScheduleStatus, ColorSchema> = fillSchema(
    {
        active: DefaultColorSchema.major,
        inactive: DefaultColorSchema.grey,
        // conflict: DefaultColorSchema.danger,
        // orphaned: DefaultColorSchema.major,
        // unknown: DefaultColorSchema.tertiaryDarker,
    },
);

export type Schedule = typeof defaultSchedule;

export const defaultSchedule = {
    datapack_id: '',
    _created: '',
    _creator: '',
    _deleted: '',
    _etag: '',
    _id: '',
    _updated: '',
    _updater: '',
    action: '',
    description: '',
    enable: '',
    frequency_time: {
        'month': 0,
        'day': 0,
        'weekday': 0,
        'hour': 0,
        'minute': 0,
    },
    last_job: '',
    metadata: {
        'datapack_id': '',
        'location': '',
        'transport_id': '',
    },
    next_job: '',
    scheduled_by: '',
    datapack_name: '',
};


export type Frequency = {
    month: number | null,
    day: number | null,
    weekday: number | null,
    hour: number | null,
    minute: number | null
}