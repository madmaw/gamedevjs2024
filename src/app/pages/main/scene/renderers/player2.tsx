import {
  type RapierRigidBody,
  RigidBody,
} from '@react-three/rapier';
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
import { type Node } from 'base/graph/types';
import Color from 'colorjs.io';
import { observer } from 'mobx-react';
import { useRef } from 'react';
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

const HAND_WIDTH = .8;
const HAND_LENGTH = .8;
const HAND_DEPTH = .2;
const FINGER_RADIUS = HAND_DEPTH * .5;
const BASE_FINGER_LENGTH = .15;

const HAND_SIZE: [number, number, number] = [
  HAND_WIDTH,
  HAND_LENGTH,
  HAND_DEPTH,
];
const HAND_OFFSET: [number, number, number] = [
  HAND_WIDTH / 2,
  0,
  0,
];

export const FingerRenderer = observer(function ({
  segment,
  position,
  parentRotation,
  length,
}: {
  segment: Node<Joint>,
  position: Vector3,
  parentRotation: Quaternion,
  length: number,
}) {
  const rotation = segment.value.rotation.clone().premultiply(parentRotation);
  const fullRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2).premultiply(rotation);
  const bodyPosition = new Vector3(
    length / 2,
    0,
    0,
  ).applyQuaternion(rotation).add(position);
  return (
    <>
      <RigidBody
        quaternion={fullRotation}
        position={bodyPosition}
        lockRotations={true}
        lockTranslations={true}
      >
        <mesh
          castShadow={true}
        >
          <capsuleGeometry
            args={[
              FINGER_RADIUS,
              length,
              6,
              6,
            ]}
          />
          <meshStandardMaterial color='orange' />
        </mesh>
      </RigidBody>
      {segment.connections.map(function (connection) {
        const childPosition = new Vector3(length, 0, 0).applyQuaternion(rotation).add(position);
        return (
          <FingerRenderer
            key={connection.value.id}
            segment={connection}
            position={childPosition}
            parentRotation={rotation}
            length={length * .8}
          />
        );
      })}
    </>
  );
});

const HAND_FINGER_OFFSETS: [Vector3, number][] = [
  [
    new Vector3(HAND_LENGTH * .4, HAND_WIDTH / 2 + FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH,
  ],
  [
    new Vector3(HAND_LENGTH, HAND_WIDTH / 2 - FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH * 1.5,
  ],
  [
    new Vector3(HAND_LENGTH, HAND_WIDTH / 2 - FINGER_RADIUS * 3, 0),
    BASE_FINGER_LENGTH * 1.8,
  ],
  [
    new Vector3(HAND_LENGTH, FINGER_RADIUS * 3 - HAND_WIDTH / 2, 0),
    BASE_FINGER_LENGTH * 1.5,
  ],
  [
    new Vector3(HAND_LENGTH, FINGER_RADIUS - HAND_WIDTH / 2, 0),
    BASE_FINGER_LENGTH,
  ],
];

export const HandRenderer = observer(function ({
  hand,
  transform,
}: {
  hand: Hand,
  transform: Matrix4,
}) {
  const ref = useRef<RapierRigidBody | null>(null);
  const rotation = hand.wrist.value.rotation;
  return (
    <>
      <RigidBody
        ref={ref}
        quaternion={rotation}
        position={hand.position}
        lockRotations={true}
        lockTranslations={true}
        mass={0}
      >
        {/* palm */}
        <mesh
          position={HAND_OFFSET}
          castShadow={true}
          // because the hand is symmetrical, this isn't really necessary
          matrix={transform}
        >
          <boxGeometry
            args={HAND_SIZE}
          />
          <meshStandardMaterial color='orange' />
        </mesh>
      </RigidBody>
      {hand.wrist.connections.map(function (connection, i) {
        const [
          offset,
          length,
        ] = HAND_FINGER_OFFSETS[i];
        const position = offset
          .clone()
          .applyMatrix4(transform)
          .applyQuaternion(rotation)
          .add(hand.position);
        return (
          <FingerRenderer
            key={connection.value.id}
            segment={connection}
            position={position}
            parentRotation={rotation}
            length={length}
          />
        );
      })}
    </>
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
