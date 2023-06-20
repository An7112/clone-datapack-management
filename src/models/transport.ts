export const defaultTransport = {
    _created: '',
    _creator: '',
    _deleted: '',
    _etag: '',
    _id: '',
    _updated: '',
    _updater: '',
    description: '',
    name: '',
    accessed_user: [''],
    params: [
        {
            _created: '',
            _creator: '',
            _deleted: '',
            _etag: '',
            _id: '',
            _iid: '',
            _updated: '',
            _updater: '',
            key: '',
            secret: false,
            transport_id: '',
            value: '',
            required: false,
        },
    ],
    type: '',
};

export type TransportModel = typeof defaultTransport;

export const defaultTransportUser = {
    _updater: '',
    _deleted: '',
    transport_id: '',
    _iid: '',
    user_id: '',
    _etag: '',
    _creator: '',
    _created: '',
    _updated: '',
    _id: '',
};

export type TransportUserModel = typeof defaultTransportUser;