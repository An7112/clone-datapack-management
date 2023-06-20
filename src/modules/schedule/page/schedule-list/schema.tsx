import { PaginationSchema } from '@gotecq/paginated';
import { Schedule } from '@/models';

export const scheduleSchema: PaginationSchema<Schedule> = [
    {
        key: ['datapack_name'],
        header: ['Scheduling Name'],
        sortable: [true],
        grid: '2fr',
    },
    {
        key: ['creator_name'],
        header: ['Creator'],
        sortable: [true],
        grid: '1fr',
    },
    {
        key: ['last_job'],
        sortable: [true],
        header: ['Last Retrieved'],
        grid: '1fr',
    },
    {
        key: ['next_job'],
        sortable: [true],
        header: ['Next Retrieved'],
        grid: '1fr',
    },
    {
        key: ['enable'],
        header: ['Status'],
        sortable: [true],
        grid: '90px',
    },
];
