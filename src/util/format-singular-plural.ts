import { PaginatedSectionProps } from '@gotecq/paginated';

export const formatSingularPlural = (props: React.PropsWithChildren<PaginatedSectionProps<any, any>>) => {
    return `${props.paginatedState.paginationData.totalItem} ${props.paginatedState.paginationData.totalItem > 1 ? `${props.props.title}s` : props.props.title}`;
};