import { Datapack } from '@gotecq/model';
import { PaginationSchema } from '@gotecq/paginated';

export const datapackSchema: PaginationSchema<Datapack> = [
    {
        key: ['title'],
        header: ['Datapack Name'],
        sortable: [true],
        grid: '2fr',
    },
    {
        key: ['author__name'],
        header: ['Contact'],
        sortable: [true],
        grid: '1fr',
    },
    {
        key: ['_created'],
        header: ['Created Date'],
        sortable: [true],
        grid: '1fr',
    },
    {
        key: ['_updated'],
        header: ['Last Modified'],
        sortable: [true],
        grid: '1fr',
    },
    {
        key: ['status'],
        sortable: [true],
        grid: '110px',
    },
];