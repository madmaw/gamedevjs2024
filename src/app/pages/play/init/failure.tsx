import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { AlertIcon } from 'ui/components/icon/icons';
import { Information } from 'ui/components/information';

export function PlayFailure() {
  return (
    <Aligner
      xAlignment={Alignment.Middle}
      yAlignment={Alignment.Middle}
    >
      <Information
        Icon={AlertIcon}
        heading={'No Magic Today!'}
        message={'Something went wrong'}
      />
    </Aligner>
  );
}
