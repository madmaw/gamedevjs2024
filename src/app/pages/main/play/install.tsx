import {
  CorticalID,
  HandKind,
} from 'app/domain/pose';
import {
  computeCameraDistance,
  type Joint,
  PLAYABLE_HEIGHT,
  PLAYER_HEIGHT,
  type PlayerEntity,
  PlayerEntityImpl,
} from 'app/domain/scene';
import { type EntityRendererRegistry } from 'app/pages/main/scene/renderer';
import { type CorticalDetectorService } from 'app/services/detector';
import { exists } from 'base/exists';
import { type Node } from 'base/graph/types';
import { runInAction } from 'mobx';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Quaternion,
  Vector3,
} from 'three';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';
import {
  type Play,
  type PlayProps,
} from './types';

export function install({
  rendererRegistry,
  corticalDetectorService,
  debug,
}: {
  rendererRegistry: EntityRendererRegistry,
  corticalDetectorService: CorticalDetectorService,
  debug: boolean,
}) {
  const Debug = debug ? installDebug() : undefined;
  const Play = installPlay({ Debug });

  return installInit({
    corticalDetectorService,
    rendererRegistry,
    Play,
    debug,
  });
}

function installPlay({ Debug }: { Debug: Play | undefined }) {
  return function ({
    corticalStream,
    scene,
  }: PlayProps) {
    const handleRef = useRef<number | null>(null);
    const thenRef = useRef<number>(0);
    const player = useMemo<PlayerEntity>(function () {
      const player = new PlayerEntityImpl(
        scene.nextEntityId++,
      );
      player.position.copy(new Vector3(0, 0, computeCameraDistance()));
      return player;
    }, [scene]);

    useEffect(function () {
      runInAction(function () {
        scene.entities.push(
          player,
        );
      });
      // TODO remove player on unmount
    }, [
      scene,
      player,
    ]);

    useEffect(function () {
      const subscription = corticalStream.subscribe(function ({
        poses,
        size,
      }) {
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          const keyPositions: Partial<Record<CorticalID, Vector3>> = {};
          for (const id of Object.keys(keypoints)) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const corticalId = id as CorticalID;
            const keypoint = keypoints[corticalId];
            if (keypoint != null && keypoint.score > .6) {
              // x is flipped due to mirroring, y is flipped due to using pixel coordinates, and z
              // is flipped it is measuring depth, we keep z as is because the model is detecting us facing
              // outward and we want to detect facing inward (so double flip cancels out)
              keyPositions[corticalId] = new Vector3(
                -keypoint.relativePosition[0],
                -keypoint.relativePosition[1],
                keypoint.relativePosition[2],
              );
            }
          }

          const playerKeypoints = {
            ...player.keypoints,
            ...keyPositions,
          };
          runInAction(function () {
            player.keypoints = playerKeypoints;
            const nosePosition = poses[0].keypoints[CorticalID.Nose]?.screenPosition;
            const [
              width,
              height,
            ] = size;
            const minDimension = Math.min(width, height);

            if (nosePosition != null) {
              const dx = (width / 2 - nosePosition[0]) / minDimension;
              const dy = (height / 2 - nosePosition[1]) / minDimension;
              player.headOffset = new Vector3(dx, dy + PLAYER_HEIGHT, 0);

              const windowWidth = window.innerWidth;
              const windowHeight = window.innerHeight;
              const windowAspectRatio = windowWidth / windowHeight;
              const scanAspectRatio = width / height;

              ([
                [
                  CorticalID.RightWrist,
                  HandKind.Right,
                ],
                [
                  CorticalID.LeftWrist,
                  HandKind.Left,
                ],
              ] as const).forEach(
                function ([
                  id,
                  kind,
                ]) {
                  const wrist = poses[0].keypoints[id];
                  if (wrist != null) {
                    const wristScreenPosition = wrist.screenPosition;
                    const dx = (wristScreenPosition[0] - width / 2) * 2 / width;
                    // base bottom of screen at 0
                    const dy = (wristScreenPosition[1] - height) / height;
                    const y = dy * PLAYABLE_HEIGHT;
                    const x = dx * PLAYABLE_HEIGHT * scanAspectRatio;
                    player.hands[kind].position = player.position.clone().sub(new Vector3(
                      x,
                      y,
                      // unfortunately the z coordinate is not accurate enough to use while seated
                      //  - (wrist.relativePosition[2] + .4) * 10
                      computeCameraDistance(windowAspectRatio),
                    ));
                  }
                },
              );
            }

            scene.scanSize = size;
            applyHandsKeypoints(player);
          });
        }
      });
      return subscription.unsubscribe.bind(subscription);
    }, [
      player,
      scene,
      corticalStream,
    ]);

    const update = useCallback(function (now: number) {
      const delta = now - thenRef.current;
      // TODO update anything that needs updating
      player.position.z = computeCameraDistance() - scene.progress;

      thenRef.current = now;
      const handle = requestAnimationFrame(update);
      handleRef.current = handle;
    }, [
      scene,
      player,
    ]);

    useEffect(function () {
      update(0);
      return function () {
        cancelAnimationFrame(handleRef.current!);
      };
    }, [update]);

    return Debug && (
      <Aligner
        xAlignment={Alignment.End}
        yAlignment={Alignment.Start}
      >
        <Debug
          corticalStream={corticalStream}
          scene={scene}
        />
      </Aligner>
    );
  };
}

type HandData = {
  kind: HandKind,
  jointId: CorticalID,
  crossAxisJointIds: [CorticalID, CorticalID],
  incomingJointId: CorticalID,
  outgoingJointId: CorticalID,
};

const RIGHT_HAND_DATA: HandData = {
  kind: HandKind.Right,
  jointId: CorticalID.RightWrist,
  crossAxisJointIds: [
    CorticalID.RightPinkyFingerMCP,
    CorticalID.RightIndexFingerMCP,
  ],
  incomingJointId: CorticalID.RightElbow,
  outgoingJointId: CorticalID.RightMiddleFingerMCP,
};
const LEFT_HAND_DATA: HandData = {
  kind: HandKind.Left,
  jointId: CorticalID.LeftWrist,
  crossAxisJointIds: [
    CorticalID.LeftIndexFingerMCP,
    CorticalID.LeftPinkyFingerMCP,
  ],
  incomingJointId: CorticalID.LeftElbow,
  outgoingJointId: CorticalID.LeftMiddleFingerMCP,
};
const HANDS = [
  RIGHT_HAND_DATA,
  LEFT_HAND_DATA,
];

// TODO move into a separate file
function applyHandsKeypoints({
  keypoints,
  hands,
  position,
}: PlayerEntity) {
  for (const handData of HANDS) {
    const {
      kind,
      jointId,
      crossAxisJointIds,
      incomingJointId,
      outgoingJointId,
    } = handData;
    const hand = hands[kind];
    const joint = keypoints[jointId];
    const incomingJoint = keypoints[incomingJointId];
    const outgoingJoint = keypoints[outgoingJointId];
    const crossAxisJoints = crossAxisJointIds.map((jointId) => keypoints[jointId]);
    if (
      joint != null
      && incomingJoint != null
      && outgoingJoint != null
      && crossAxisJoints.every(exists)
    ) {
      const q = new Quaternion();
      // account for forearm rotation
      const forearmDirection = joint.clone().sub(incomingJoint).normalize();
      // tends to hallucinate elbow position, which is convenient, but the z is never right
      forearmDirection.z = 0;
      const forearmAngle = Math.atan2(forearmDirection.y, forearmDirection.x);

      const screenNormal = new Vector3(0, 0, 1);
      const handDirection = (outgoingJoint.clone().sub(joint)).normalize();
      q.setFromUnitVectors(
        forearmDirection,
        handDirection,
      ).multiply(new Quaternion().setFromAxisAngle(screenNormal, forearmAngle));

      const inverseQNoSpin = q.clone().invert();
      const unrotatedCrossAxis = crossAxisJoints.map((joint) => joint.clone().applyQuaternion(inverseQNoSpin));
      const crossAxis1 = unrotatedCrossAxis[0];
      const crossAxis2 = unrotatedCrossAxis[1];
      const crossAxis = crossAxis2.sub(crossAxis1);
      const crossAxisAngle = Math.PI / 2 - Math.atan2(crossAxis.y, crossAxis.z);
      q.premultiply(new Quaternion().setFromAxisAngle(handDirection, crossAxisAngle));

      const inverseQ = q.clone().invert();

      hand.wrist.connections.forEach(function (connection) {
        applyFingerKeypoints(
          keypoints,
          kind,
          connection,
          handDirection,
          inverseQ,
        );
      });
      // calculate hand position based on the dimensions of the viewing area and the dimensions of the
      // camera feed

      hand.wrist.value.rotation = q;
      // hand.position = joint.clone().multiplyScalar(2);
    }
  }
}

function applyFingerKeypoints(
  keypoints: Partial<Record<CorticalID, Vector3>>,
  kind: HandKind,
  // TODO: do we need both segment and joint?
  currentJoint: Node<Joint>,
  previousDirection: Vector3,
  unrotate: Quaternion,
) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const jointCorticalId = `${kind}_${currentJoint.value.id}` as CorticalID;
  const nextJoint = currentJoint.connections.length === 1 ? currentJoint.connections[0] : null;
  if (nextJoint == null) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const nextJointCorticalId = `${kind}_${nextJoint.value.id}` as CorticalID;

  const jointPoint = keypoints[jointCorticalId];

  const nextJointPoint = keypoints[nextJointCorticalId];
  if (jointPoint != null && nextJointPoint != null) {
    const segmentDirection = nextJointPoint.clone().sub(jointPoint).normalize();
    const rotationAxis = previousDirection.clone().cross(segmentDirection).normalize().applyQuaternion(unrotate);
    const rotationAngle = previousDirection.angleTo(segmentDirection);

    // console.log('normal', previousDirection, 'dir', segmentDirection, 'axis', rotationAxis, rotationAngle);

    const q = new Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);
    runInAction(function () {
      currentJoint.value.rotation = q;
    });

    if (nextJoint != null) {
      applyFingerKeypoints(
        keypoints,
        kind,
        nextJoint,
        segmentDirection,
        unrotate.clone().premultiply(q.clone().invert()),
      );
    }
  }
}
