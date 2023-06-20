import { PaginationSchema } from '@gotecq/paginated';
import { ResourceModel } from '@/models';

export const resourceSchema: PaginationSchema<ResourceModel> = [
    {
        key: ['display'],
        header: ['Resource / Path'],
        sortable: [true],
        grid: '1.5fr',
    },
    {
        key: ['_creator'],
        header: ['Contributor / Last Modified'],
        sortable: [true],
        grid: '1fr',
    },
    {
        key: ['length'],
        header: ['File Size'],
        sortable: [true],
        grid: '80px',
    },
    {
        key: ['status'],
        header: ['Status'],
        sortable: [true],
        grid: '100px',
    },
    {
        key: ['action'],
        header: ['Action'],
        sortable: [false],
        grid: '70px',
    },
];