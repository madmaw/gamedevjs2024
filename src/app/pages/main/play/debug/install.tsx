import styled from '@emotion/styled';
import {
  BodyID,
  CorticalID,
} from 'app/domain/pose';
import { type PlayProps } from 'app/pages/main/play/types';
import { exists } from 'base/exists';
import Color from 'colorjs.io';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alignment } from 'ui/alignment';
import { createCamera } from 'ui/camera';
import { Aligner } from 'ui/components/aligner';
import { Row } from 'ui/components/layout';
import { Text } from 'ui/components/typography/text';

const VideoWrapper = styled.div`
  position: relative;
`;

const VideoFlipper = styled.video`
  transform: scale(-1, 1);
`;

const ConstrainedWrapper = styled.div`
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const KeypointCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: scale(-1, 1);
  z-index: 1;  
`;

const POIs: Partial<Record<CorticalID, Color>> = {
  [CorticalID.RightWrist]: new Color('white'),
  // [CorticalID.RightElbow]: new Color('white'),
  [CorticalID.RightIndexFingerTip]: new Color('yellow'),
  [CorticalID.RightThumbTip]: new Color('orange'),
  [CorticalID.LeftElbow]: new Color('white'),
  // [CorticalID.LeftWrist]: new Color('blue'),
  // [CorticalID.LeftIndexFingerTip]: new Color('magenta'),
  // [CorticalID.LeftThumbTip]: new Color('cyan'),
};

export function install() {
  return function ({
    corticalStream,
  }: PlayProps) {
    const [
      detections,
      setDetections,
    ] = useState<Date[]>([]);

    const [
      camera,
      setCamera,
    ] = useState<HTMLVideoElement | null>(null);

    const populate = useCallback(async function (ref: HTMLVideoElement) {
      if (ref != null) {
        const camera = await createCamera(ref);
        setCamera(camera);
      }
    }, []);
    const keypointCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(function () {
      const subscription = corticalStream.subscribe({
        next({ poses }) {
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
          if (keypointCanvas.current != null) {
            const ctx = keypointCanvas.current.getContext('2d');
            if (ctx != null && camera != null) {
              keypointCanvas.current.width = camera.videoWidth;
              keypointCanvas.current.height = camera.videoHeight;
              ctx.clearRect(0, 0, keypointCanvas.current.width, keypointCanvas.current.height);
              ctx.strokeStyle = 'black';
              poses.forEach(function ({
                keypoints,
              }) {
                const nose = keypoints[BodyID.Nose];
                const eyes = [
                  keypoints[BodyID.LeftEye],
                  keypoints[BodyID.RightEye],
                ].filter(exists);
                const eyeDistance = eyes.length > 1
                  ? Math.sqrt(
                    Math.pow(eyes[0].screenPosition[0] - eyes[1].screenPosition[0], 2)
                      + Math.pow(eyes[0].screenPosition[1] - eyes[1].screenPosition[1], 2),
                  )
                  : 0;

                ctx.font = `${eyeDistance * 4}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (eyes.length > 1 && nose) {
                  const angle = Math.atan2(
                    eyes[1].screenPosition[1] - eyes[0].screenPosition[1],
                    eyes[1].screenPosition[0] - eyes[0].screenPosition[0],
                  );

                  ctx.save();
                  ctx.globalAlpha = (eyes[0].score ?? 1) * (eyes[1].score ?? 1);
                  ctx.translate(...nose.screenPosition);
                  ctx.rotate(angle);
                  ctx.scale(1, -1);
                  ctx.fillText('😄', 0, 0);
                  ctx.restore();
                }

                ctx.font = '30px serif';
                for (const key in POIs) {
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  const corticalID = key as CorticalID;
                  const color = POIs[corticalID];
                  const poi = keypoints[corticalID];
                  if (poi && color) {
                    const r = 10 - 5 * Math.pow(poi.relativePosition[2], 3);
                    ctx.fillStyle = color.toString();
                    ctx.beginPath();
                    ctx.arc(
                      poi.screenPosition[0],
                      poi.screenPosition[1],
                      r,
                      0,
                      2 * Math.PI,
                    );
                    ctx.fill();
                    if (poi.score) {
                      ctx.save();
                      ctx.translate(poi.screenPosition[0], poi.screenPosition[1]);
                      ctx.scale(-1, 1);
                      // ctx.fillText((poi.score * 100).toFixed(0), 0, -r * 2);
                      ctx.fillText(poi.relativePosition.map(v => Math.round(v * 100)).join(), 0, -r * 2);
                      ctx.restore();
                    }
                  }
                }

                //   hands3D.forEach((hand3D, i) => {
                //     const hand2D = hands2D[i];
                //     if (hand3D && hand2D) {
                //       const [
                //         wrist,
                //         index,
                //         pinky,
                //       ] = hand3D.map(function ({
                //         x,
                //         y,
                //         z,
                //       }) {
                //         return new Vector3(x, -y, z);
                //       });

                //       const toPinky = pinky.clone().sub(wrist).normalize();
                //       const toIndex = index.clone().sub(wrist).normalize();

                //       const normal = toPinky.clone().cross(toIndex).normalize();
                //       const rotationAxis = new Vector3(0, 0, 1).cross(normal).normalize();
                //       const rotationAngle = new Vector3(0, 0, 1).angleTo(normal);
                //       const matrix = new Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

                //       // const base = new Vector3(i ? 1 : -1, 0, 0);

                //       // const rotationAxis = base.clone().cross(toIndex).normalize();
                //       // const rotationAngle = base.angleTo(toIndex);
                //       // const matrix = new Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

                //       ctx.save();
                //       ctx.translate(hand2D[3].x, hand2D[3].y);
                //       ctx.transform(
                //         matrix.elements[0],
                //         matrix.elements[1],
                //         matrix.elements[4],
                //         matrix.elements[5],
                //         matrix.elements[12],
                //         matrix.elements[13],
                //       );
                //       if (i === 0) {
                //         ctx.scale(-1, 1);
                //       }

                //       ctx.globalAlpha = hand3D[3].score ?? 1;
                //       ctx.fillText('👉', 0, 0);
                //       ctx.restore();

                //       hand2D.forEach(function (keypoint, i) {
                //         const {
                //           x,
                //           y,
                //         } = keypoint;
                //         const { z } = hand3D[i];
                //         const handRadius = 5 * Math.pow(2, Math.max(1, Math.pow((z ?? wrist.z) / wrist.z, 4)));
                //         ctx.globalAlpha = keypoint.score ?? 1;
                //         ctx.beginPath();
                //         ctx.arc(x, y, handRadius, 0, 2 * Math.PI);
                //         ctx.fillStyle = COLORS[i];
                //         ctx.fill();
                //       });
                //     }
                //   });
              });
            }
          }
        },
      });
      return subscription.unsubscribe.bind(subscription);
    }, [
      corticalStream,
      camera,
    ]);
    const detectionsPerSecond = detections.length > 10
      ? 1000 * detections.length / (detections[detections.length - 1].getTime() - detections[0].getTime())
      : 0;
    return (
      <Row>
        <Aligner
          xAlignment={Alignment.End}
          yAlignment={Alignment.Middle}
        >
          <VideoWrapper>
            <ConstrainedWrapper>
              <Text>
                PPS:
                {Math.round(detectionsPerSecond)}
              </Text>
            </ConstrainedWrapper>
            <KeypointCanvas ref={keypointCanvas} />

            <VideoFlipper
              ref={populate}
            />
          </VideoWrapper>
        </Aligner>
      </Row>
    );
  };
}
