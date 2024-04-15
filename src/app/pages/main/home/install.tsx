import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { type StackController } from 'app/ui/stack/controller';
import { UnreachableError } from 'base/unreachable_error';
import {
  type ComponentType,
  useCallback,
} from 'react';
import { Screen } from 'ui/components/screen';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import {
  HomeMenu,
  HomeOptions,
} from './menu';

export function install() {
  return function ({
    Play,
    stackController,
  }: {
    stackController: StackController,
    Play: ComponentType,
  }) {
    const { _ } = useLingui();

    const onSelect = useCallback(function (option: HomeOptions) {
      switch (option) {
        case HomeOptions.NewGame:
          stackController.push({
            Component: Play,
            id: option,
          });
          break;
        case HomeOptions.Help:
          console.log(option);
          break;
        case HomeOptions.Settings:
          console.log(option);
          break;
        default:
          throw new UnreachableError(option);
      }
    }, [
      stackController,
      Play,
    ]);
    return (
      <SizeProvider size={Size.Large}>
        <Screen title={_(msg`Home`)}>
          <HomeMenu onSelect={onSelect} />
        </Screen>
      </SizeProvider>
    );
  };
}
