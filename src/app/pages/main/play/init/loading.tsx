import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { SpinnerIcon } from 'ui/components/icon/icons';
import { Information } from 'ui/components/information';

export function PlayLoading() {
  // TODO random messages

  const { _ } = useLingui();
  return (
    <Aligner
      xAlignment={Alignment.Middle}
      yAlignment={Alignment.Middle}
    >
      <Information
        Icon={SpinnerIcon}
        heading={_(msg`Scyring`)}
        message={_(msg`This might take a minute…`)}
      />
    </Aligner>
  );
}
