import {
  useCallback,
  useMemo,
} from 'react';
import {
  Menu,
  type MenuItem,
} from 'ui/components/menu/menu';
import { SimpleMenuItem } from 'ui/components/menu/simple_item';

export const enum HomeOptions {
  NewGame = 'New Game',
  Settings = 'Settings',
  About = 'About',
}

const HomeMenu = Menu<MenuItem<HomeOptions>>;
const HomeMenuListItem = SimpleMenuItem<HomeOptions>;

export function install() {
  return function ({
    onSelect,
  }: {
    onSelect: (option: HomeOptions) => void,
  }) {
    const items = useMemo<readonly MenuItem<HomeOptions>[]>(function () {
      // TODO
      return [];
    }, []);

    const onMenuItemSelect = useCallback(function ({ id }: MenuItem<HomeOptions>) {
      onSelect(id);
    }, []);
    return (
      <HomeMenu
        ListItem={HomeMenuListItem}
        items={items}
        onSelect={onMenuItemSelect}
      />
    );
  };
}
