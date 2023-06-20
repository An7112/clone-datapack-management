import { EntityFactory } from '@gotecq/state';
import {
    Schedule,
    TransportModel,
} from '@/models';
import { QueryAPI } from '@/access';
import { APPLICATION_PARAM, ACTION_PARAM } from '@/config';
import { Datapack } from '@gotecq/model';

export const DatapackEntity = EntityFactory<Datapack>('datapack', {
    url: ({ _id }) => QueryAPI.datapack.single(_id),
});

export const ScheduleEntity = EntityFactory<Schedule>('schedule', {
    url: ({ _id }) => QueryAPI.schedule.single(_id),
});

export const TransportEntity = EntityFactory<TransportModel>('transport', {
    url: ({ _id }) => QueryAPI.transport.single(_id),
});