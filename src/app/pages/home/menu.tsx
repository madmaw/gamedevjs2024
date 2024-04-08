import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
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
  Help = 'Help',
}

const HomeOptionMenu = Menu<MenuItem<HomeOptions>>;
const HomeOptionMenuListItem = SimpleMenuItem<HomeOptions>;

export function HomeMenu({
  onSelect,
}: {
  onSelect: (option: HomeOptions) => void,
}) {
  const { _ } = useLingui();
  const items = useMemo<readonly MenuItem<HomeOptions>[]>(function () {
    return [
      {
        id: HomeOptions.NewGame,
        label: _(msg`New Game`),
      },
      {
        id: HomeOptions.Settings,
        label: _(msg`Settings`),
      },
      {
        id: HomeOptions.Help,
        label: _(msg`Help`),
      },
    ];
  }, [_]);

  const onMenuItemSelect = useCallback(function ({ id }: MenuItem<HomeOptions>) {
    onSelect(id);
  }, [onSelect]);
  return (
    <HomeOptionMenu
      ListItem={HomeOptionMenuListItem}
      items={items}
      onSelect={onMenuItemSelect}
    />
  );
}
