import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Screen } from 'ui/components/screen';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import {
  HomeMenu,
  type HomeOptions,
} from './menu';

export function install() {
  function onSelect(e: HomeOptions) {
    console.log('onSelect', e);
  }
  return function () {
    const { _ } = useLingui();
    return (
      <SizeProvider size={Size.Large}>
        <Screen title={_(msg`Home`)}>
          <HomeMenu onSelect={onSelect} />
        </Screen>
      </SizeProvider>
    );
  };
}
