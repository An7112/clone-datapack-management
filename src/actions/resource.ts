import { RealTimeAccess } from '@/access';

export type REFRESH_RESOURCE_TABLE_TYPE = {}

export const REFRESH_RESOURCE_TABLE = () => {
    RealTimeAccess.publish('REFRESH_RESOURCE_TABLE', {});
};