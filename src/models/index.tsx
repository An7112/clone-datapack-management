export * from './identifier';
export * from './error';
export * from './datapack';
export * from './schedule';
export * from './resource';
export * from './transport';
export * from './file-request';
export * from './retrieval-history';
export * from './background-job';
export * from './mail-batch';
export * from './access-user';

export const cloneModel = <D extends Record<string, any>>(model: D) => {
    return { ...model };
};