import { ColorSchema, fillSchema, DefaultColorSchema } from '@gotecq/theme';

export type IdentifierUsage = 'usual' | 'official' | 'temp' | 'secondary' | 'old' | 'entered-in-error' | 'unknown';
export const IdentifierUsageScheme: Record<IdentifierUsage, ColorSchema> = fillSchema({
    'usual': DefaultColorSchema.success,
    'official': DefaultColorSchema.major,
    'temp': DefaultColorSchema.warning,
    'secondary': DefaultColorSchema.info,
    'old': DefaultColorSchema.danger,
    'entered-in-error': DefaultColorSchema.purple,
    'unknown': DefaultColorSchema.grey,
});
export const IdentifierUsageFormOption = [
    { label: 'Usual', value: 'usual' },
    { label: 'Official', value: 'official' },
    { label: 'Temp', value: 'temp' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Old', value: 'old' },
];

export type Identifier = typeof defaultIdentifier;
export const defaultIdentifier = {
    _created: '',
    _creator: '',
    _deleted: '',
    _did: '',
    _etag: '',
    _id: '',
    _iid: '',
    _updated: '',
    _updater: '',
    assigner: '',
    member_id: '',
    period__end: '',
    period__start: '',
    system: '',
    type__coding: '',
    type__text: '',
    use: 'unknown' as IdentifierUsage,
    value: '',
};
export const defaultIdentifierModel = {
    assigner: '',
    member_id: '',
    member_identifier_id: '',
    period__end: '',
    period__start: '',
    system: '',
    type__coding: '',
    type__text: '',
    use: 'unknown' as IdentifierUsage,
    value: '',
};