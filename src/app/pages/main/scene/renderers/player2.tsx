import { type World } from '@dimforge/rapier3d-compat';
import {
  type RapierRigidBody,
  RigidBody,
  useBeforePhysicsStep,
  useSphericalJoint,
} from '@react-three/rapier';
import {
  CorticalID,
  HandKind,
} from 'app/domain/pose';
import {
  type Hand,
  type Joint,
  PLAYER_INTERACTION_GROUP,
  type PlayerEntity,
} from 'app/domain/scene';
import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
import { type Node } from 'base/graph/types';
import Color from 'colorjs.io';
import { observer } from 'mobx-react';
import {
  type RefObject,
  useRef,
} from 'react';
import {
  Euler,
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
const HAND_LENGTH = .6;
const HAND_DEPTH = .2;
const BASE_FINGER_RADIUS = HAND_DEPTH * .5;
const FINGER_GAP = HAND_DEPTH;
const BASE_FINGER_LENGTH = .15;

const HAND_SIZE: [number, number, number] = [
  HAND_LENGTH,
  HAND_WIDTH,
  HAND_DEPTH,
];
const HAND_OFFSET: [number, number, number] = [
  HAND_LENGTH / 2,
  0,
  0,
];

export const FingerRenderer = observer(function ({
  segment,
  position,
  parents,
  parentRef,
  parentTranslation,
  parentRotation,
  length,
  radius,
}: {
  segment: Node<Joint>,
  position: Vector3,
  parents: readonly Node<Joint>[],
  parentRef: RefObject<RapierRigidBody>,
  parentTranslation: Vector3,
  parentRotation: Quaternion,
  length: number,
  radius: number,
}) {
  // TODO just have a sensible starting position and don't do all these calculations
  // as the physics is updated immediately to represent the actual rotation anyway
  const fingerSegmentRef = useRef<RapierRigidBody>(null);
  const rotation = parentRotation; // segment.value.rotation.clone().premultiply(parentRotation);
  const fullRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2).premultiply(rotation);
  const bodyPosition = new Vector3(
    length / 2,
    0,
    0,
  ).applyQuaternion(rotation).add(position);
  // TODO avoid expensive calculations
  const bodyPositionRef = useRef(bodyPosition);
  const fullRotationRef = useRef(fullRotation);

  useBeforePhysicsStep(function (world: World) {
    if (fingerSegmentRef.current) {
      const currentRotation = fingerSegmentRef.current.rotation();
      const targetRotation = parents.reduce(
        function (acc, parent) {
          return acc.premultiply(parent.value.rotation);
        },
        new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2)
          .premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
          .premultiply(segment.value.rotation),
      );
      const deltaRotation = new Quaternion(
        currentRotation.x,
        currentRotation.y,
        currentRotation.z,
        currentRotation.w,
      ).invert().premultiply(targetRotation);
      const deltaEuler = new Euler().setFromQuaternion(deltaRotation);
      const deltaVector = new Vector3().setFromEuler(deltaEuler).multiplyScalar(1 / world.timestep);

      // console.log(new Vector3(1, 0, 0).applyQuaternion(targetRotation));

      // fingerSegmentRef.current.setAngvel(deltaVector, true);
      fingerSegmentRef.current.setRotation(targetRotation, true);
    }
  });

  const joint = useSphericalJoint(parentRef, fingerSegmentRef, [
    parentTranslation.toArray(),
    [
      0,
      -length / 2,
      0,
    ],
  ]);

  return (
    <>
      <RigidBody
        ref={fingerSegmentRef}
        quaternion={fullRotationRef.current}
        position={bodyPositionRef.current}
        collisionGroups={PLAYER_INTERACTION_GROUP}
        gravityScale={0}
        restitution={0}
        mass={1}
        // lockRotations={true}
        // lockTranslations={true}
      >
        <mesh castShadow={true}>
          <capsuleGeometry
            args={[
              radius,
              length,
              6,
              6,
            ]}
          />
          <meshStandardMaterial color='orange' />
        </mesh>
      </RigidBody>
      {segment.connections.map(function (connection) {
        // only render segments that have two ends (i.e. not the tip)
        if (connection.connections.length > 0) {
          return (
            <FingerRenderer
              key={connection.value.id}
              segment={connection}
              position={new Vector3(length, 0, 0).applyQuaternion(rotation).add(bodyPosition)}
              parents={[
                segment,
                ...parents,
              ]}
              parentRef={fingerSegmentRef}
              parentTranslation={new Vector3(0, length, 0)}
              parentRotation={rotation}
              length={length * .9}
              radius={radius}
            />
          );
        }
      })}
    </>
  );
});

const HAND_FINGER_OFFSETS: [Vector3, number, number][] = [
  // thumb
  [
    new Vector3(HAND_LENGTH * .4, HAND_WIDTH / 2 + BASE_FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH,
    BASE_FINGER_RADIUS * 1.1,
  ],
  // index
  [
    new Vector3(HAND_LENGTH, HAND_WIDTH / 2 - BASE_FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // middle
  [
    new Vector3(HAND_LENGTH, HAND_WIDTH / 2 - BASE_FINGER_RADIUS - FINGER_GAP, 0),
    BASE_FINGER_LENGTH * 1.8,
    BASE_FINGER_RADIUS,
  ],
  // ring
  [
    new Vector3(HAND_LENGTH, BASE_FINGER_RADIUS + FINGER_GAP - HAND_WIDTH / 2, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // pinky
  [
    new Vector3(HAND_LENGTH, BASE_FINGER_RADIUS - HAND_WIDTH / 2, 0),
    BASE_FINGER_LENGTH,
    BASE_FINGER_RADIUS * .9,
  ],
];

export const HandRenderer = observer(function ({
  hand,
  transform,
}: {
  hand: Hand,
  transform: Matrix4,
}) {
  const palmRef = useRef<RapierRigidBody>(null);
  const initialPosition = useRef(hand.position);
  const initialRotation = useRef(hand.wrist.value.rotation);

  useBeforePhysicsStep(function (world: World) {
    if (palmRef.current) {
      const currentPosition = palmRef.current.translation();
      const targetPosition = hand.position;
      const delta = targetPosition.clone().sub(currentPosition);
      // move to the target position
      // ref.current.setTranslation(targetPosition, true);
      palmRef.current.setLinvel(delta.multiplyScalar(.5 / world.timestep), true);

      const currentRotation = palmRef.current.rotation();
      const targetRotation = hand.wrist.value.rotation;
      const deltaRotation = new Quaternion(
        currentRotation.x,
        currentRotation.y,
        currentRotation.z,
        currentRotation.w,
      ).invert().premultiply(targetRotation);
      const deltaEuler = new Euler().setFromQuaternion(deltaRotation);
      const deltaVector = new Vector3().setFromEuler(deltaEuler).multiplyScalar(.5 / world.timestep);

      palmRef.current.setAngvel(deltaVector, true);
    }
  });

  const rotation = hand.wrist.value.rotation;
  return (
    <>
      <RigidBody
        ref={palmRef}
        quaternion={initialRotation.current}
        position={initialPosition.current}
        gravityScale={0}
        restitution={0}
        mass={1000}
        collisionGroups={PLAYER_INTERACTION_GROUP}
        // lockRotations={true}
        // lockTranslations={true}
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
        const fingerOffset = HAND_FINGER_OFFSETS[i];
        if (fingerOffset) {
          const [
            offset,
            length,
            radius,
          ] = fingerOffset;
          const parentTranslation = offset
            .clone()
            .applyMatrix4(transform);
          return (
            <FingerRenderer
              key={connection.value.id}
              segment={connection}
              position={hand.position.clone().add(parentTranslation.clone().applyQuaternion(rotation))}
              parents={[hand.wrist]}
              parentRef={palmRef}
              parentTranslation={parentTranslation}
              parentRotation={rotation}
              length={length}
              radius={radius}
            />
          );
        }
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
