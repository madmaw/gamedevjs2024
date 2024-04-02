import styled from '@emotion/styled';

export type ListProps<T> = {
  items: readonly T[],
  getKey: (item: T) => string,
  ListItem: React.ComponentType<T>,
};

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export function List<T>({
  items,
  getKey,
  ListItem,
}: ListProps<T>) {
  return (
    <ListContainer>
      {items.map(item => (
        <ListItem
          key={getKey(item)}
          {...item}
        />
      ))}
    </ListContainer>
  );
}
