import {
  CorticalID,
  HandKind,
} from 'app/domain/pose';
import {
  type Hand,
  type Joint,
  type PlayerEntity,
} from 'app/domain/scene';
import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
import { exists } from 'base/exists';
import { type Node } from 'base/graph/types';
import Color from 'colorjs.io';
import {
  autorun,
  runInAction,
} from 'mobx';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import {
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';

const DEBUG_COLORS: Partial<Record<CorticalID, Color>> = {
  [CorticalID.RightWrist]: new Color('green'),
  [CorticalID.RightElbow]: new Color('red'),
  [CorticalID.RightIndexFingerMCP]: new Color('orange'),
  [CorticalID.RightPinkyFingerMCP]: new Color('orange'),
  [CorticalID.RightMiddleFingerPIP]: new Color('magenta'),
};

export const FingerRenderer = observer(function ({
  segment,
  position,
  length,
}: {
  segment: Node<Joint>,
  position: Vector3,
  length: number,
}) {
  return (
    <group
      position={position}
    >
      <group quaternion={segment.value.rotation}>
        <mesh
          quaternion={new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2)}
          position={[
            length / 2,
            0,
            0,
          ]}
        >
          <capsuleGeometry
            args={[
              .05,
              length,
              6,
              6,
            ]}
          />
          <meshStandardMaterial color='orange' />
        </mesh>
        {segment.connections.map(function (connection) {
          return (
            <FingerRenderer
              key={connection.value.id}
              segment={connection}
              position={new Vector3(length, 0, 0)}
              length={length * .8}
            />
          );
        })}
      </group>
    </group>
  );
});

const HAND_FINGER_POSITIONS: [Vector3, number][] = [
  [
    new Vector3(.15, .25, 0),
    .1,
  ],
  [
    new Vector3(.4, .15, 0),
    .15,
  ],
  [
    new Vector3(.4, .05, 0),
    .18,
  ],
  [
    new Vector3(.4, -.05, 0),
    .15,
  ],
  [
    new Vector3(.4, -.15, 0),
    .1,
  ],
];

export const HandRenderer = observer(function ({
  hand,
  transform,
}: {
  hand: Hand,
  transform: Matrix4,
}) {
  return (
    <group
      position={hand.position}
      quaternion={hand.wrist.value.rotation}
    >
      {/* palm */}
      <mesh
        position={[
          .2,
          0,
          0,
        ]}
      >
        <boxGeometry
          args={[
            .4,
            .4,
            .1,
          ]}
        />
        <meshStandardMaterial color='green' />
      </mesh>
      {hand.wrist.connections.map(function (connection, i) {
        const [
          position,
          length,
        ] = HAND_FINGER_POSITIONS[i];
        return (
          <FingerRenderer
            key={connection.value.id}
            segment={connection}
            position={position.clone().applyMatrix4(transform)}
            length={length}
          />
        );
      })}
    </group>
  );
});

const LEFT_HAND_TRANSFORM: Matrix4 = new Matrix4().makeScale(1, -1, 1);
const RIGHT_HAND_TRANSFORM: Matrix4 = new Matrix4().identity();

export const PlayerEntityRenderer2 = observer(function ({
  entity,
  debug = false,
}: EntityRendererProps<PlayerEntity> & {
  debug?: boolean,
}) {
  useEffect(function () {
    return autorun(function () {
      // TODO move this into the game creation code, but we do it here for now to prevent constant
      // reloading
      convertHandRotations(entity);
    });
  }, [entity]);

  const rightHand = entity.hands[HandKind.Right];
  const leftHand = entity.hands[HandKind.Left];
  return (
    <>
      <HandRenderer
        hand={rightHand}
        transform={RIGHT_HAND_TRANSFORM}
      />
      <HandRenderer
        hand={leftHand}
        transform={LEFT_HAND_TRANSFORM}
      />
      {debug && Object.keys(entity.keypoints).map((key) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const id = key as CorticalID;
        const point = entity.keypoints[id]?.clone().multiplyScalar(6);
        if (point) {
          const color = DEBUG_COLORS[id]?.toString({ format: 'hex' }) || 'blue';
          return (
            <mesh
              key={key}
              position={point}
            >
              <sphereGeometry
                args={[
                  .02 * Math.pow((1 - point.z) / 2, 2),
                  8,
                  8,
                ]}
              />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        }
      })}
    </>
  );
});

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

function convertHandRotations({
  keypoints,
  hands,
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
        convertFingerRotations(
          keypoints,
          kind,
          connection,
          handDirection,
          inverseQ,
        );
      });
      // ;
      // adjust the position to account for rotation
      runInAction(function () {
        hand.wrist.value.rotation = q;
        hand.position = joint.clone().multiplyScalar(2);
      });
      // bone.position.copy(adjustedPosition);
    }
  }
}

function convertFingerRotations(
  keypoints: Partial<Record<CorticalID, Vector3>>,
  kind: HandKind,
  // TODO: do we need both segment and joint?
  currentJoint: Node<Joint>,
  previousDirection: Vector3,
  unrotate: Quaternion,
) {
  const jointCorticalId = `${kind}_${currentJoint.value.id}` as CorticalID;
  const nextJoint = currentJoint.connections.length === 1 ? currentJoint.connections[0] : null;
  if (nextJoint == null) {
    return;
  }
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
      convertFingerRotations(
        keypoints,
        kind,
        nextJoint,
        segmentDirection,
        unrotate.clone().premultiply(q.clone().invert()),
      );
    }
  }
}
