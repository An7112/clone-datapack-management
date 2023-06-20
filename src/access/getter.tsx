import React from 'react';
import { DataProfile } from './factory';
import { QueryAPI } from './url';
import { TransportModel } from 'models';
import { humanFormat } from '@gotecq/format';
import { Datapack, User } from '@gotecq/model';
import { EntityUserItem } from '@gotecq/component.entity';

export const fetchTransport = async (idList: string[] = []) => {
    try {
        if (!Array.isArray(idList) || idList.length === 0) return [];
        const { data } = await DataProfile.Get(QueryAPI.transport.require(idList));
        return data.map((entry: TransportModel) => {
            return {
                label: entry.name,
                value: entry._id,
                key: entry._id,
                displayvalue: entry.name,
            };
        });
    } catch (e) {
        return [];
    }
};

export const fetchDatapack = async (idList: string[] = []) => {
    try {
        if (!Array.isArray(idList) || idList.length === 0) return [];
        const { data } = await DataProfile.Get(QueryAPI.datapack.require(idList));
        return data.map((entry: Datapack) => {
            return {
                label: entry.title,
                value: entry._id,
                key: entry._id,
                displayvalue: entry.title,
            };
        });
    } catch (e) {
        return [];
    }
};

export const fetchUser = async (idList: string[] = []) => {
    try {
        if (!Array.isArray(idList) || idList.length === 0) return [];
        const { data } = await DataProfile.Get(QueryAPI.user.require(idList));
        return data.map((entry: User) => {
            return {
                label: <>{humanFormat.name(entry)} | {entry.telecom__email}</>,
                value: entry._id,
                key: entry._id,
                data: entry,
                displayvalue: <>{humanFormat.name(entry)} | {entry.telecom__email}</>,
            };
        });
    } catch (e) {
        return [];
    }
};

export const fetchLocation = async (transportId: string) => {
    try {
        if (!transportId) return [];
        const { data } = await DataProfile.Get(QueryAPI.transport.location(transportId));
        return data.map((entry: string[]) => {
            return {
                label: entry,
                value: entry,
                key: entry,
                data: entry,
                displayvalue: entry,
            };
        });
    } catch (e) {
        return [];
    }
};

export const fetchLocationForSendData = async (transportId: string, loactionOption: string) => {
    try {
        if (!transportId) return [];
        const { data } = await DataProfile.Get(QueryAPI.transport.location(transportId));
        data.unshift(loactionOption);
        return data.map((entry: string[]) => {
            return {
                label: entry,
                value: entry,
                key: entry,
                data: entry,
                displayvalue: entry,
            };
        });
    } catch (e) {
        return [];
    }
};

export const searchLocation = async (transportId: string, queryString: string) => {
    try {
        if (!transportId) return [];
        const { data } = await DataProfile.Get(`${QueryAPI.transport.location(transportId)}&key=${queryString}`);
        return data.map((entry: string[]) => {
            return {
                label: entry,
                value: entry,
                key: entry,
                data: entry,
                displayvalue: entry,
            };
        });
    } catch (e) {
        return [];
    }
};

export const searchLocationForSendData = async (transportId: string, queryString: string, loactionOption: string) => {
    try {
        if (!transportId) return [];
        const { data } = await DataProfile.Get(`${QueryAPI.transport.location(transportId)}&key=${queryString}`);

        if (queryString === '') data.unshift(loactionOption);

        return data.map((entry: string[]) => {
            return {
                label: entry,
                value: entry,
                key: entry,
                data: entry,
                displayvalue: entry,
            };
        });
    } catch (e) {
        return [];
    }
};

export const searchTransport = async (queryString: string, userId: string) => {
    try {
        const { data } = await DataProfile.Get(`${QueryAPI.transport.available(userId ?? '')}&txt=${queryString}`);
        return data.map((entry: TransportModel) => {
            return {
                value: entry._id,
                data: entry,
                displayvalue: entry.name,
                key: entry._id,
            };
        });
    } catch (e) {
        return [];
    }
};

export const searchDatapack = async (queryString: string) => {
    try {
        const { data } = await DataProfile.Get(`${QueryAPI.datapack.all()}?txt=${queryString}`);
        return data.map((entry: Datapack) => {
            return {
                value: entry._id,
                data: entry,
                displayvalue: entry.title,
                key: entry._id,
            };
        });
    } catch (e) {
        return [];
    }
};

export const searchUser = async (queryString: string) => {
    try {
        const { data } = await DataProfile.Get(`${QueryAPI.user.all()}?txt=${queryString ?? ''}`);
        return data.map((entry: User) => {
            return {
                value: entry._id,
                data: entry,
                displayvalue: <>{humanFormat.name(entry)} | {entry.telecom__email}</>,
                key: entry._id,
                label: <>{humanFormat.name(entry)} | {entry.telecom__email}</>,
                children: <EntityUserItem
                    data={entry}
                />,
            };
        });
    } catch (e) {
        return [];
    }
};

