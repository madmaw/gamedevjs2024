import styled from '@emotion/styled';
import { type PlayProps } from 'app/pages/play/types';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { Column } from 'ui/components/layout';
import { Text } from 'ui/components/typography/text';

const VideoContainer = styled(Aligner)`
  transform: scale(-1, 1);
`;

export function install() {
  return function ({
    detector,
    webcam,
  }: PlayProps) {
    const [
      detections,
      setDetections,
    ] = useState<Date[]>([]);

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
    useEffect(function () {
      if (detector == null || webcam == null) {
        return;
      }
      const poseStream = detector.detect(webcam);
      poseStream.subscribe({
        next(poses) {
          setDetections((detections) => {
            const now = new Date();
            const newDetections = [
              ...detections,
              now,
            ];
            if (newDetections.length > 100) {
              newDetections.shift();
            }
            return newDetections;
          });
        },
      });
      return function () {
        poseStream.complete();
      };
    }, [
      detector,
      webcam,
    ]);
    const detectionsPerSecond = detections.length > 10
      ? 1000 * detections.length / (detections[detections.length - 1].getTime() - detections[0].getTime())
      : 0;
    return (
      <Column>
        <Text>
          {Math.round(detectionsPerSecond)}
        </Text>
        <VideoContainer
          xAlignment={Alignment.Middle}
          yAlignment={Alignment.Middle}
          ref={populate}
        />
      </Column>
    );
  };
}
