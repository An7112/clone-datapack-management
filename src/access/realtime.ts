import { InternalPubSub } from '@gotecq/access';

export const RealTimeAccess = new InternalPubSub('default');

export const REFRESH_AFTER_RETRIEVE = 'REFRESH_AFTER_RETRIEVE';
export const REFRESH_FROM_MANAGEMENT_JOB_TEXT = 'REFRESH_FROM_MANAGEMENT_JOB_TEXT';
export const REFRESH_AFTER_ADD_SCHEDULE = 'REFRESH_AFTER_RETRIEVE';
export const REFRESH_BACKGROUND_JOB = 'REFRESH_BACKGROUND_JOB';
export const REFRESH_ACCESS_USER_TEXT = 'REFRESH_ACCESS_USER';

export function REFRESH_FROM_MANAGEMENT_JOB() {
    RealTimeAccess.publish(REFRESH_FROM_MANAGEMENT_JOB_TEXT, {});
}
export function REFRESH_BACKGROUND_JOB_LIST() {
    RealTimeAccess.publish(REFRESH_BACKGROUND_JOB, {});
}

export function REFRESH_DATAPACK_AFTER_RETRIEVE() {
    RealTimeAccess.publish(REFRESH_AFTER_RETRIEVE, {});
}


export function REFRESH_SCHEDULE_AFTER_ADD() {
    RealTimeAccess.publish(REFRESH_AFTER_ADD_SCHEDULE, {});
}

export function REFRESH_SCHEDULE_AFTER_EDIT() {
    RealTimeAccess.publish(REFRESH_AFTER_ADD_SCHEDULE, {});
}

export function REFRESH_ACCESS_USER() {
    RealTimeAccess.publish(REFRESH_ACCESS_USER_TEXT, {});
}

