import styled from '@emotion/styled';
import { type PlayProps } from 'app/pages/play/types';
import { exists } from 'base/exists';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Matrix4,
  Vector3,
} from 'three';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { Row } from 'ui/components/layout';
import { Text } from 'ui/components/typography/text';

const VideoWrapper = styled.div`
  position: relative;
`;

const VideoFlipper = styled.div`
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

const HAND_PREFIXES = [
  'left_',
  'right_',
];

const HAND_POSTFIXES = [
  'wrist',
  'pinky',
  'thumb',
  'index',
];

const COLORS = [
  'black',
  'pink',
  'green',
  'yellow',
];

function getHands<
  K extends { readonly name?: string },
>(keypoints: readonly K[] | undefined): (K[] | undefined)[] {
  return HAND_PREFIXES.map(function (prefix) {
    return HAND_POSTFIXES.map(function (postfix) {
      const name = prefix + postfix;
      return keypoints?.find(function (keypoint) {
        return keypoint.name === name;
      });
    });
  }).map(function (hand) {
    return hand.every(exists) ? hand : undefined;
  });
}

export function install() {
  return function ({
    poseStream,
    camera,
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
        ref.appendChild(camera);
      }
    }, [camera]);
    const keypointCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(function () {
      const subscription = poseStream.subscribe({
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
          if (keypointCanvas.current != null) {
            const ctx = keypointCanvas.current.getContext('2d');
            if (ctx != null) {
              keypointCanvas.current.width = camera.videoWidth;
              keypointCanvas.current.height = camera.videoHeight;
              ctx.clearRect(0, 0, keypointCanvas.current.width, keypointCanvas.current.height);
              ctx.strokeStyle = 'black';
              poses.forEach(function (pose) {
                const eyes = pose.keypoints.filter(function (keypoint) {
                  return keypoint.name?.endsWith('eye');
                }).sort((a, b) => a.x - b.x);
                const eyeDistance = eyes.length > 1
                  ? Math.sqrt(Math.pow(eyes[0].x - eyes[1].x, 2) + Math.pow(eyes[0].y - eyes[1].y, 2))
                  : 0;
                const hands2D = getHands(pose.keypoints);
                const hands3D = getHands(pose.keypoints3D);

                ctx.font = `${eyeDistance * 2}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (eyes.length > 1) {
                  const angle = Math.atan2(eyes[1].y - eyes[0].y, eyes[1].x - eyes[0].x);
                  const [
                    eyeX,
                    eyeY,
                  ] = [
                    (eyes[0].x + eyes[1].x) / 2,
                    (eyes[0].y + eyes[1].y) / 2,
                  ];
                  ctx.save();
                  ctx.globalAlpha = (eyes[0].score ?? 1) * (eyes[1].score ?? 1);
                  ctx.translate(eyeX, eyeY);
                  ctx.rotate(angle);
                  ctx.fillText('👀', 0, 0);
                  ctx.restore();
                }

                hands3D.forEach((hand3D, i) => {
                  const hand2D = hands2D[i];
                  if (hand3D && hand2D) {
                    const [
                      wrist,
                      index,
                      pinky,
                    ] = hand3D.map(function ({
                      x,
                      y,
                      z,
                    }) {
                      return new Vector3(x, -y, z);
                    });

                    const toPinky = pinky.clone().sub(wrist).normalize();
                    const toIndex = index.clone().sub(wrist).normalize();

                    const normal = toPinky.clone().cross(toIndex).normalize();
                    const rotationAxis = new Vector3(0, 0, 1).cross(normal).normalize();
                    const rotationAngle = new Vector3(0, 0, 1).angleTo(normal);
                    const matrix = new Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

                    // const base = new Vector3(i ? 1 : -1, 0, 0);

                    // const rotationAxis = base.clone().cross(toIndex).normalize();
                    // const rotationAngle = base.angleTo(toIndex);
                    // const matrix = new Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

                    ctx.save();
                    ctx.translate(hand2D[3].x, hand2D[3].y);
                    ctx.transform(
                      matrix.elements[0],
                      matrix.elements[1],
                      matrix.elements[4],
                      matrix.elements[5],
                      matrix.elements[12],
                      matrix.elements[13],
                    );
                    if (i === 0) {
                      ctx.scale(-1, 1);
                    }

                    ctx.globalAlpha = hand3D[3].score ?? 1;
                    ctx.fillText('👉', 0, 0);
                    ctx.restore();

                    hand2D.forEach(function (keypoint, i) {
                      const {
                        x,
                        y,
                      } = keypoint;
                      const { z } = hand3D[i];
                      const handRadius = 5 * Math.pow(2, Math.max(1, Math.pow((z ?? wrist.z) / wrist.z, 4)));
                      ctx.globalAlpha = keypoint.score ?? 1;
                      ctx.beginPath();
                      ctx.arc(x, y, handRadius, 0, 2 * Math.PI);
                      ctx.fillStyle = COLORS[i];
                      ctx.fill();
                    });
                  }
                });
              });
            }
          }
        },
      });
      return subscription.unsubscribe.bind(subscription);
    }, [
      poseStream,
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