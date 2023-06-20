import { fetchUser, searchUser } from '@/access';

export const schema = {
    title: 'Datapack Information',
    type: 'object',
    properties: {
        visible: {
            type: 'string',
            title: 'Visibility',
            options: [
                { label: 'Public', value: 'PUBLIC' },
                { label: 'Restricted Public', value: 'RESTRICTEDPUBLIC' },
                { label: 'Non-Public', value: 'NONPUBLIC' },
            ],
            placeholder: 'Select visible',
        },
        role: {
            type: 'string',
            title: '',
            options: [
                { label: 'Viewer', value: 'VIEWER' },
                { label: 'Editor', value: 'EDITOR' },
            ],
        },
        accessUser: {
            type: 'array',
            title: '',
            placeholder: 'Select user',
            items: {
                type: 'string',
            },
            widget: 'MultipleSelectWithGuidanceField',
            initialValue: [],
            searchProfile: searchUser,
            requireProfile: fetchUser,
            optionLabelProp: 'displayvalue',
        },

    },
};