import { ColorSchema, DefaultColorSchema, fillSchema } from '@gotecq/theme';

export type ResourceStatus =
    | 'missing'
    | 'matched'
    | 'conflict'
    | 'pending'
    | 'unknown';

export const ResourceColorScheme: Record<ResourceStatus, ColorSchema> = fillSchema(
    {
        missing: DefaultColorSchema.warning,
        matched: DefaultColorSchema.major,
        conflict: DefaultColorSchema.danger,
        pending: DefaultColorSchema.purple,
        unknown: DefaultColorSchema.tertiaryDarker,
    },
);

export const defaultResourceData = {
    _deleted: '',
    schema: '',
    datapack_id: '',
    description: '',
    display: '',
    _updated: '',
    _id: '',
    submitter_email: '',
    kind: '',
    _created: '',
    status: '',
    content_type: '',
    _updater: '',
    submitter_name: '',
    _creator: '',
    _iid: '',
    _etag: '',
    file_id: '',
    content: '',
    length: '',
    path: '',
    checksum: '',
};

export type ResourceModel = typeof defaultResourceData;
