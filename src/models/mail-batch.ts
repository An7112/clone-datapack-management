const _MailBatchItemModel = {
    _created: '1970-01-01T00:00:00.000Z',
    _creator: '',
    _deleted: '1970-01-01T00:00:00.000Z',
    _etag: '',
    _id: '',
    _updated: '1970-01-01T00:00:00.000Z',
    _updater: '',
    excluded: 0,
    status: 'unknown' as MailBatchStatus,
    name: '',
    new: 0,
    resource: '',
    sent: 0,
    template_id: '',
    total: 0,
    is_deleted: 0,
    generated: 0,
    template_name: '',
    creator_name: '',
};

export type MailBatchStatus = 'ACCESSIBLE' | 'PENDING'
export type MailBatchItemModel = typeof _MailBatchItemModel;

