import { humanFormat } from '@gotecq/format';
import { fetchUser, searchUser } from '@/access';
import { User } from '@gotecq/model';

export const schema = {
    type: 'object',
    title: 'Edit Transport',
    required: ['name', 'type', 'accessed_user', 'params'],
    properties: {
        name: {
            type: 'string',
            title: 'Transport Name',
            className: 'no-spacing-top',
        },
        type: {
            type: 'string',
            options: [
                {
                    label: 'SFTP',
                    value: 'SFTP',
                },
                {
                    label: 'S3',
                    value: 'S3',
                },
            ],
            disabled: true,
        },
        accessed_user: {
            type: 'array',
            items: {
                type: 'string',
            },
            title: 'Users',
            initialValue: [],
            searchProfile: searchUser,
            requireProfile: fetchUser,
            optionLabelProp: 'displayvalue',
        },
        params: {
            title: 'Default Parameters',
            items: {
                required: ['key', 'value'],
                properties: {
                    key: {
                        type: 'string',
                        placeholder: 'Enter key',
                        disabled: true,
                    },
                    value: {
                        type: 'string',
                        placeholder: 'Enter value',
                        errorMessage: 'Please input value.',
                    },
                },
                type: 'object',
            },
            type: 'array',
        },
        additional_params: {
            title: '',
            listAddFieldProps: {
                text: 'Add More (Key,Value)',
                type: 'link',
            },
            items: {
                required: ['key', 'value'],
                properties: {
                    key: {
                        type: 'string',
                        placeholder: 'Enter key',
                    },
                    value: {
                        type: 'string',
                        placeholder: 'Enter value',
                        errorMessage: 'Please input value.',
                    },
                },
                type: 'object',
            },
            type: 'array',
        },
    },
};