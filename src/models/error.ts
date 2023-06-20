export const ErrorResponseMap = {
    '9000': {
        code: '9000',
        message: 'Could not query data',
        description: 'Data\'s id(s) are missing',
    },
};
export const ErrorMap = {
    MissingId: Object.assign(new Error('Data\'s id(s) are missing'), { code: 9000 }),
};