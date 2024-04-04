import {
  type ComponentType,
  type Key,
  useCallback,
} from 'react';
import { List } from 'ui/components/list';

export type MenuListItemProps<T extends MenuItem = MenuItem> = T & {
  onSelect: () => void,
};

export type MenuListItem<T extends MenuItem> = ComponentType<MenuListItemProps<T>>;

export type MenuItem<ID extends Key = Key> = {
  readonly id: ID,
  readonly label: string,
};

export type MenuProps<T extends MenuItem> = {
  items: readonly T[],
  onSelect: (item: T) => void,
  ListItem: MenuListItem<T>,
};

function getKey<T extends MenuItem>({ id }: T): Key {
  return id;
}

export function Menu<T extends MenuItem>({
  items,
  onSelect,
  ListItem,
}: MenuProps<T>) {
  const MenuList = List<T>;
  const MenuListItem = useCallback(function (props: T) {
    // eslint can't reason about useCallback in useCallback
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onMenuItemSelect = useCallback(function () {
      onSelect(props);
    }, [props]);
    return (
      <ListItem
        {...props}
        onSelect={onMenuItemSelect}
      />
    );
  }, [
    onSelect,
    ListItem,
  ]);

  return (
    <MenuList
      ListItem={MenuListItem}
      getKey={getKey}
      items={items}
    />
  );
}
