import { CentralURLBuilder } from '@gotecq/access';

export const AppNavigator = {
    mailBatch: (mailBatchId: string) => CentralURLBuilder('URL_MAIL_MERGE')
        .paths(['mail-merge', mailBatchId])
        .build(),
};

export const QueryAPI = {
    transport: {
        all: (textSearch?: string) => {
            if (textSearch) return CentralURLBuilder('API_DATA_FOUNDATION')
                .path('data-transport')
                .param('txt', textSearch)
                .build();
            return CentralURLBuilder('API_DATA_FOUNDATION').path('data-transport').build();
        },
        available: (userId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .path('data-transport')
            .param('where', `[{"accessed_user:ov":["${userId}"]}]`)
            .build(),
        allFull: () => CentralURLBuilder('API_DATA_FOUNDATION')
            .path('data-transport')
            .param('max_results', 99999)
            .build(),
        single: (transportId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['data-transport', transportId])
            .build(),
        require: (idList: string[]) => {
            const stringifyIdList = idList.map(entry => `"${entry}"`).join(',');
            return CentralURLBuilder('API_DATA_FOUNDATION')
                .path('data-transport')
                .param('where', `[{"_id:in":[${stringifyIdList}]}]`)
                .build();
        },
        listAccessedUsers: (transportId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['data-transport', transportId, 'user'])
            .build(),
        location: (transportId: string, refresh?: boolean) => {
            if (refresh) return CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['data-transport', transportId, 'location'])
                .param('refresh', true)
                .param('max_results', 25)
                .build();
            return CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['data-transport', transportId, 'location'])
                .param('max_results', 25)
                .build();
        },
    },
    datapack: {
        all: (textSearch?: string) => {
            if (textSearch) return CentralURLBuilder('API_DATA_FOUNDATION')
                .path('datapack')
                .param('txt', textSearch)
                .build();
            return CentralURLBuilder('API_DATA_FOUNDATION').path('datapack').build();
        },
        allFull: () => CentralURLBuilder('API_DATA_FOUNDATION')
            .path('datapack')
            .param('max_results', 99999).build(),
        available: () => CentralURLBuilder('API_DATA_FOUNDATION') //apply visibility
            .path('available-datapack')
            .param('max_results', 99999).build(),
        single: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['datapack', datapackId])
            .build(),
        require: (idList: string[]) => {
            const stringifyIdList = idList.map(entry => `"${entry}"`).join(',');
            return CentralURLBuilder('API_DATA_FOUNDATION')
                .path('datapack')
                .param('where', `[{"_id:in":[${stringifyIdList}]}]`)
                .build();
        },
        download: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['datapack', datapackId, 'download'])
            .build(),
        resource: {
            all: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'resource'])
                .build(),
            allFull: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'resource'])
                .param('max_results', 99999)
                .build(),
            single: (datapackId: string, resourceId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'resource', resourceId])
                .build(),
            download: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'download-resource'])
                .build(),
            kind_file: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'resource'])
                .param('where', '[{"kind:eq":"FILE"}]')
                .param('max_results', 99999).build(),
            nextFile: (datapackId: string, timeString: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'resource'])
                .param('where', `[{"kind:eq":"FILE"},{"_created:lt":"${timeString}"}]`)
                .param('max_results', 1)
                .build(),
            previousFile: (datapackId: string, timeString: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'resource'])
                .param('where', `[{"kind:eq":"FILE"},{"_created:gt":"${timeString}"}]`)
                .param('max_results', 1)
                .param('sort', '["_created.1"]')
                .build(),
            preview: {
                file: (datapackId: string, resourceId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                    .paths(['datapack', datapackId, 'resource', resourceId, 'file', ''])
                    .build(),
                meida: (datapackId: string, resourceId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                    .paths(['datapack', datapackId, 'resource', resourceId, 'media'])
                    .build(),
            },
        },
        tags: {
            all: () => CentralURLBuilder('API_DATA_FOUNDATION')
                .path('datapack-tag')
                .build(),
            kind: (kind: 'TAG' | 'FLAG') => CentralURLBuilder('API_DATA_FOUNDATION')
                .path('datapack-tag')
                .param('where', `[{"kind:eq":"${kind}"}]`)
                .build(),
        },
        path: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['datapack', datapackId, 'path'])
            .build(),
        accessUser: {
            all: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['datapack', datapackId, 'accessibility'])
                .param('max_results', 9999)
                .build(),
        },
    },
    schedule: {
        all: () => CentralURLBuilder('API_DATA_FOUNDATION')
            .path('scheduler-retrieve-datapack')
            .param('max_results', 99999)
            .build(),
        single: (id: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['scheduler-retrieve-datapack', id])
            .build(),
        task: {
            all: (schedule_id: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .paths(['scheduler-retrieve-datapack-task', schedule_id])
                .param('max_results', 99999)
                .build(),
            single: (schedule_id: string, task_id: string) => CentralURLBuilder('API_BASE')
                .paths(['scheduler-task', schedule_id, task_id])
                .param('max_results', 99999)
                .build(),
        },
        filter: {
            idDatapack: (datapack_id: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .path('scheduler-retrieve-datapack')
                .param('where', `[{"datapack_id:eq":"${datapack_id}"}]`)
                .param('max_results', 99999)
                .build(),
        },
    },
    user: {
        all: () => CentralURLBuilder('API_USER_MANAGEMENT').path('user').build(),
        single: (id: string) =>
            CentralURLBuilder('API_USER_MANAGEMENT').paths(['user', id]).build(),
        require: (idList: string[] = []) => {
            const stringifyIdList = idList?.length !== 0 ? idList.map(entry => `"${entry}"`)?.join(',') : '';
            return CentralURLBuilder('API_USER_MANAGEMENT')
                .path('user')
                .param('where', `[{"_id:in":[${stringifyIdList}]}]`)
                .build();
        },
    },
    fileRequest: {
        all: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['datapack', datapackId, 'file-request'])
            .build(),
        single: (datapackId: string, fileRequestId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['datapack', datapackId, 'file-request', fileRequestId])
            .build(),
        singlePublic: (fileRequestId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .paths(['file-request', fileRequestId])
            .build(),
    },
    backgroundJob: {
        all: (domain: string, resourceName: string, resourceId: string) => CentralURLBuilder('API_PLATFORM')
            .paths(['gotecq.job-queue', 'job', domain, resourceName, resourceId])
            .build(),
    },
    mailBatch: {
        single: (batch_id: string) => CentralURLBuilder('API_MAIL_MERGE')
            .paths(['mail-batch', batch_id])
            .build(),
    },
};

export const CommandAPI = {
    datapack: {
        add: () => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('create-datapack')
            .path('datapack').build(),
        update: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('update-datapack')
            .paths(['datapack', datapackId])
            .build(),
        delete: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('delete-datapack')
            .paths(['datapack', datapackId])
            .build(),
        lock: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('lock-datapack')
            .paths(['datapack', datapackId])
            .build(),
        unlock: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('unlock-datapack')
            .paths(['datapack', datapackId])
            .build(),
        sendData: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('send-datapack')
            .paths(['datapack', datapackId])
            .build(),
        retrieveData: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('retrieve-data')
            .paths(['datapack', datapackId])
            .build(),
        sync: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('sync-datapack')
            .paths(['datapack', datapackId])
            .build(),
        resource: {
            add: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .command('add-resource')
                .paths(['datapack', datapackId])
                .build(),
            delete: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .command('delete-resource')
                .paths(['datapack', datapackId])
                .build(),
            replace: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .command('replace-resource-file')
                .paths(['datapack', datapackId])
                .build(),
            update: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .command('update-resource')
                .paths(['datapack', datapackId])
                .build(),
        },
        accessUser: {
            add: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .command('add-datapack-member')
                .paths(['datapack', datapackId]).build(),
            delete: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
                .command('remove-datapack-member')
                .paths(['datapack', datapackId]).build(),
        },
    },
    schedule: {
        add: (datapack_id: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('create-scheduler-retrieve')
            .paths(['datapack', datapack_id])
            .build(),
        delete: (datapack_id: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('delete-scheduler-retrieve')
            .paths(['datapack', datapack_id])
            .build(),
        update: (datapack_id: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('update-scheduler-retrieve')
            .paths(['datapack', datapack_id])
            .build(),
        retry: (scheduler_task_id: string) => CentralURLBuilder('API_SCHEDULER_MANAGEMENT')
            .command('try-scheduler-task-again')
            .paths(['scheduler-task', scheduler_task_id])
            .build(),
    },
    transport: {
        add: () => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('create-data-transport')
            .path('data-transport')
            .build(),
        addUser: (transportId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('add-user-to-data-transport')
            .paths(['data-transport', transportId])
            .build(),
        removeUser: (transportId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('remove-user-from-data-transport')
            .paths(['data-transport', transportId])
            .build(),
        update: (transportId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('update-data-transport')
            .paths(['data-transport', transportId])
            .build(),
        delete: (transportId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('delete-data-transport')
            .paths(['data-transport', transportId])
            .build(),
    },
    fileRequest: {
        create: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('create-file-request')
            .paths(['datapack', datapackId]).build(),
        update: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('update-file-request')
            .paths(['datapack', datapackId]).build(),
        disable: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('disable-file-request')
            .paths(['datapack', datapackId]).build(),
        enable: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('enable-file-request')
            .paths(['datapack', datapackId]).build(),
        share: (datapackId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('share-file-request')
            .paths(['datapack', datapackId]).build(),
        submitFile: (fileRequestId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('submit-file-request')
            .paths(['file-request', fileRequestId]).build(),
        delete: (fileRequestId: string) => CentralURLBuilder('API_DATA_FOUNDATION')
            .command('delete-file-request')
            .paths(['datapack', fileRequestId]).build(),
    },
    backgroundJob: {
        cancel: (jobId: string) => CentralURLBuilder('API_PLATFORM')
            .path('gotecq.job-queue')
            .command('cancel-job')
            .paths(['job', jobId])
            .build(),
    },
};

export const BaseQueryAPI = {
    media: {
        all: (resource: string, resourceId: string) => CentralURLBuilder('API_BASE')
            .paths(['media', resource, resourceId])
            .build(),
        single: (resource: string, resourceId: string, fileId: string) => CentralURLBuilder('API_BASE')
            .paths(['media', resource, resourceId, fileId])
            .build(),
    },
    file: {
        single: (resource: string, resourceId: string, fileId: string) => CentralURLBuilder('API_BASE')
            .paths(['file', resource, resourceId, fileId])
            .build(),
        download: (resource: string, resourceId: string, fileId: string) => CentralURLBuilder('API_BASE')
            .paths(['file', resource, resourceId, fileId, 'download'])
            .build(),
    },

};