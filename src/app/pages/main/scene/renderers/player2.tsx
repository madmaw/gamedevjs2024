import {
  type Triplet,
  useCompoundBody,
} from '@react-three/cannon';
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
import {
  type Group,
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
const BASE_FINGER_LENGTH = .2;

const HAND_SIZE: Triplet = [
  HAND_WIDTH,
  HAND_LENGTH,
  HAND_DEPTH,
];
const HAND_OFFSET: Triplet = [
  HAND_WIDTH / 2,
  0,
  0,
];

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
  const [
    box,
    api,
  ] = useCompoundBody<Group>(() => ({
    position: hand.position.toArray(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    quaternion: hand.wrist.value.rotation.toArray() as [number, number, number, number],
    mass: 1,
    shapes: [
      {
        type: 'Box',
        args: HAND_SIZE,
        position: HAND_OFFSET,
      },
    ],
  }));

  return (
    <group
      // ref={box}
      quaternion={hand.wrist.value.rotation}
      position={hand.position}
    >
      {/* palm */}
      <mesh
        position={HAND_OFFSET}
        castShadow={true}
      >
        <boxGeometry
          args={HAND_SIZE}
        />
        <meshStandardMaterial color='orange' />
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
