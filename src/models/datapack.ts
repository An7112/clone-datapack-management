import { DatapackStatus, DatapackVisible } from '@gotecq/model';
import { DefaultColorSchema, ColorSchema } from '@gotecq/theme';


export const DatapackVisibleText = {
    'PUBLIC': 'Public',
    'RESTRICTEDPUBLIC': 'Restricted Public',
    'NONPUBLIC': 'Non-Public',
};

export const DatapackColorScheme: Record<DatapackStatus, ColorSchema> = {
    'FINAL': DefaultColorSchema.success,
    'COMPLETE': DefaultColorSchema.major,
    'INCOMPLETE': DefaultColorSchema.warning,
    'INVALID': DefaultColorSchema.danger,
    'EMPTY': DefaultColorSchema.grey,
    'SYNCING': DefaultColorSchema.purple,
    'unknown': DefaultColorSchema.tertiaryDarker,
};

export const DatapackVisibleColorScheme: Record<DatapackVisible, ColorSchema> = {
    'PUBLIC': DefaultColorSchema.success,
    'RESTRICTEDPUBLIC': DefaultColorSchema.warning,
    'NONPUBLIC': DefaultColorSchema.danger,
    'unknown': DefaultColorSchema.tertiaryDarker,
};

