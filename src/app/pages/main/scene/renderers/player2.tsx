import { type World } from '@dimforge/rapier3d-compat';
import { RoundedBox } from '@react-three/drei';
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
  useCallback,
  useRef,
} from 'react';
import {
  type CapsuleGeometry,
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
const BASE_FINGER_LENGTH = .1;

const HAND_ARGS: [number, number, number] = [
  HAND_LENGTH,
  HAND_WIDTH,
  HAND_DEPTH,
];
const HAND_OFFSET: [number, number, number] = [
  HAND_LENGTH / 2,
  0,
  0,
];

export const FingerRenderer = function ({
  segment,
  parents,
  parentRef,
  parentPosition,
  parentTranslation,
  parentRotation,
  length,
  radius,
}: {
  segment: Node<Joint>,
  parents: readonly Node<Joint>[],
  parentRef: RefObject<RapierRigidBody>,
  parentPosition: Vector3,
  parentTranslation: Vector3,
  parentRotation: Quaternion,
  length: number,
  radius: number,
}) {
  const fingerSegmentRef = useRef<RapierRigidBody>(null);
  const position = new Vector3(length / 2, 0, 0)
    .add(parentTranslation)
    .applyQuaternion(parentRotation).add(parentPosition);
  const positionRef = useRef(position);
  const rotationRef = useRef(parentRotation);

  useBeforePhysicsStep(function (world: World) {
    if (fingerSegmentRef.current) {
      const currentRotation = fingerSegmentRef.current.rotation();
      const currentQuaternion = new Quaternion(
        currentRotation.x,
        currentRotation.y,
        currentRotation.z,
        currentRotation.w,
      );
      // const targetRotation = parents.reduce(
      //   function (acc, parent) {
      //     return acc.premultiply(parent.value.rotation);
      //   },
      //   // not sure why this rotation is necessary
      //   new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
      //     .premultiply(segment.value.rotation),
      // );
      const parentRotation = parentRef.current!.rotation();
      const targetRotation = new Quaternion(parentRotation.x, parentRotation.y, parentRotation.z, parentRotation.w)
        .multiply(segment.value.rotation);
      const deltaRotation = currentQuaternion.clone().invert().premultiply(targetRotation);
      const deltaEuler = new Euler().setFromQuaternion(deltaRotation);
      const deltaVector = new Vector3().setFromEuler(deltaEuler).multiplyScalar(1 / world.timestep);

      // console.log(new Vector3(1, 0, 0).applyQuaternion(targetRotation));

      fingerSegmentRef.current.setAngvel(deltaVector, true);
      // fingerSegmentRef.current.setRotation(currentQuaternion.slerp(targetRotation, .5), true);
      // fingerSegmentRef.current.setRotation(targetRotation, true);
    }
  });

  // unfortunately initial positions are set on the unadjusted capsule geometry
  const joint = useSphericalJoint(parentRef, fingerSegmentRef, [
    parentTranslation.toArray(),
    [
      -length / 2,
      0,
      0,
    ],
  ]);

  const adjustGeometry = useCallback(function (geometry: CapsuleGeometry | null) {
    if (geometry != null) {
      const transform = new Matrix4()
        // offset
        .makeTranslation(length / 2, 0, 0)
        // rotate capsule so it is horizontal (default is vertical)
        .multiply(new Matrix4().makeRotationFromEuler(new Euler(0, 0, Math.PI / 2)));
      geometry.applyMatrix4(transform);
    }
  }, [length]);

  return (
    <>
      <RigidBody
        ref={fingerSegmentRef}
        quaternion={rotationRef.current}
        position={positionRef.current}
        collisionGroups={PLAYER_INTERACTION_GROUP}
        gravityScale={0}
        restitution={0}
        friction={.5}
        // massProperties={{
        //   mass: 1,
        //   centerOfMass: new Vector3(0, 0, 0),
        //   principalAngularInertia: new Vector3(1, 1, 1),
        //   angularInertiaLocalFrame: new Quaternion(),
        // }}
        // lockRotations={true}
        // lockTranslations={true}
      >
        <mesh
          castShadow={true}
        >
          <capsuleGeometry
            ref={adjustGeometry}
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
              parents={[
                segment,
                ...parents,
              ]}
              parentRef={fingerSegmentRef}
              parentPosition={position}
              parentTranslation={new Vector3(length, 0, 0)}
              parentRotation={parentRotation}
              length={length * .9}
              radius={radius * .9}
            />
          );
        }
      })}
    </>
  );
};

const HAND_FINGER_OFFSETS: [Vector3, number, number][] = [
  // thumb
  [
    new Vector3(HAND_LENGTH * .3, HAND_WIDTH / 2 - BASE_FINGER_RADIUS, -HAND_DEPTH / 2),
    BASE_FINGER_LENGTH * 1.2,
    BASE_FINGER_RADIUS * 1.1,
  ],
  // index
  [
    new Vector3(HAND_LENGTH - BASE_FINGER_RADIUS, HAND_WIDTH / 2 - BASE_FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // middle
  [
    new Vector3(HAND_LENGTH - BASE_FINGER_RADIUS, HAND_WIDTH / 2 - BASE_FINGER_RADIUS - FINGER_GAP, 0),
    BASE_FINGER_LENGTH * 1.8,
    BASE_FINGER_RADIUS,
  ],
  // ring
  [
    new Vector3(HAND_LENGTH - BASE_FINGER_RADIUS, BASE_FINGER_RADIUS + FINGER_GAP - HAND_WIDTH / 2, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // pinky
  [
    new Vector3(HAND_LENGTH - BASE_FINGER_RADIUS * .9, BASE_FINGER_RADIUS * .9 - HAND_WIDTH / 2, 0),
    BASE_FINGER_LENGTH,
    BASE_FINGER_RADIUS * .9,
  ],
];

export const HandRenderer = function ({
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
      palmRef.current.setLinvel(delta.multiplyScalar(.1 / world.timestep), true);

      const currentRotation = palmRef.current.rotation();
      const currentQuaternion = new Quaternion(
        currentRotation.x,
        currentRotation.y,
        currentRotation.z,
        currentRotation.w,
      );
      const targetRotation = hand.wrist.value.rotation.clone();
      const deltaRotation = currentQuaternion.invert().premultiply(targetRotation);
      const deltaEuler = new Euler().setFromQuaternion(deltaRotation);
      const deltaVector = new Vector3().setFromEuler(deltaEuler).multiplyScalar(.5 / world.timestep);

      palmRef.current.setAngvel(deltaVector, true);
      // palmRef.current.setRotation(currentQuaternion.slerp(targetRotation, .5), true);
    }
  });

  return (
    <>
      <RigidBody
        ref={palmRef}
        quaternion={initialRotation.current}
        position={initialPosition.current}
        // gravityScale={0}
        restitution={0}
        mass={1}
        collisionGroups={PLAYER_INTERACTION_GROUP}
        friction={.1}
        // lockRotations={true}
        // lockTranslations={true}
      >
        {/* palm */}
        <RoundedBox
          args={HAND_ARGS}
          radius={HAND_DEPTH / 2}
          smoothness={2}
          bevelSegments={2}
          position={HAND_OFFSET}
          castShadow={true}
          // because the hand is symmetrical, this isn't really necessary
          matrix={transform}
        >
          <meshStandardMaterial color='orange' />
        </RoundedBox>
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
              parentPosition={initialPosition.current}
              parents={[hand.wrist]}
              parentRef={palmRef}
              parentTranslation={parentTranslation}
              parentRotation={initialRotation.current}
              length={length}
              radius={radius}
            />
          );
        }
      })}
    </>
  );
};

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
