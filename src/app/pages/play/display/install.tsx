import styled from '@emotion/styled';
import { type PlayProps } from 'app/pages/play/types';
import { useCallback } from 'react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';

const VideoContainer = styled(Aligner)`
  transform: scale(-1, 1);
`;

export function install() {
  return function (props: PlayProps) {
    const { webcam } = props;
    const populate = useCallback(function (ref: HTMLDivElement) {
      if (ref != null) {
        while (ref.firstElementChild != null) {
          ref.removeChild(ref.firstElementChild);
        }
        if (webcam != null) {
          ref.appendChild(webcam);
        }
      }
    }, [webcam]);
    return (
      <VideoContainer
        xAlignment={Alignment.Stretch}
        yAlignment={Alignment.Stretch}
        ref={populate}
      />
    );
  };
}
