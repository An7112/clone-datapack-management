import styled from 'styled-components';

export const SupplementFilterBar = styled.div`
    display: grid;
    padding: var(--spacing-sm);
    column-gap: var(--spacing-sm);
    border-top: var(--bd-blunt);
    background-color: var(--color-white);
    z-index: 100;
    position: relative;
    flex-basis: 100%;

    .ant-input-search {
        min-width: 0;
    }
    .ant-select {
        min-width: 0;
    }
`;