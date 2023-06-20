import { fetchUser, QueryAPI, Requestor, searchUser } from '@/access';
import { EMAIL_PATTERN } from '@gotecq/form';

export const getTag = async () => {
    try {
        const data = await Requestor.request.GET(QueryAPI.datapack.tags.kind('TAG'));
        return data.map((entry: any) => {

            return {
                label: entry.name,
                value: entry.name,
                key: entry.name,
            };
        });
    } catch (e) {
        return [];
    }
};

export const schema = {
    title: 'Datapack Information',
    type: 'object',
    required: [
        'title',
        'visible',
    ],
    properties: {
        title: {
            type: 'string',
            title: 'Datapack Name',
            className: 'no-spacing-top',
            placeholder: 'Enter datapack name',
        },
        description: {
            type: 'string',
            title: 'Description',
            placeholder: 'Enter description',
        },
        tags: {
            title: 'Tags',
            items: {
                type: 'string',
            },
            fetcher: getTag,
            mode: 'multiple',
            showArrow: true,
            showSearch: true,
            type: 'array',
            placeholder: 'Select tags',
        },
        // visible: {
        //     type: 'string',
        //     title: 'Visibility',
        //     options: [
        //         { label: 'Public', value: 'PUBLIC' },
        //         { label: 'Restricted Public', value: 'RESTRICTEDPUBLIC' },
        //         { label: 'Non-Public', value: 'NONPUBLIC' },
        //     ],
        //     placeholder: 'Select visible',
        // },
        period__start: {
            type: 'string',
            title: 'Effective Date',
        },
        period__end: {
            type: 'string',
            title: 'Expiration Date',
        },
        author__email: {
            type: 'string',
            title: 'Contact Email',
            pattern: EMAIL_PATTERN,
            errorMessage: 'Please input a valid email',
            placeholder: 'Enter contact email',
        },
        author__name: {
            type: 'string',
            title: 'Contact Name',
            placeholder: 'Enter contact name',
        },
        // editor: {
        //     type: 'array',
        //     title: 'Editor',
        //     placeholder: 'Select editor',
        //     items: {
        //         type: 'string',
        //     },
        //     widget: 'MultipleSelectWithGuidanceField',
        //     initialValue: [],
        //     searchProfile: searchUser,
        //     requireProfile: fetchUser,
        //     optionLabelProp: 'displayvalue',
        // },
        // viewer: {
        //     type: 'array',
        //     title: 'Viewer',
        //     placeholder: 'Select viewer',
        //     items: {
        //         type: 'string',
        //     },
        //     widget: 'MultipleSelectWithGuidanceField',
        //     initialValue: [],
        //     searchProfile: searchUser,
        //     requireProfile: fetchUser,
        //     optionLabelProp: 'displayvalue',
        // },
    },
};