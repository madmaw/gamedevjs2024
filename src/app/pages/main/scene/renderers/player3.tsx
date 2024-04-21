import {
  type RigidBody as RigidBodyType,
  type World,
} from '@dimforge/rapier3d-compat';
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
import { useMergedRefs } from 'base/react/refs';
import Color from 'colorjs.io';
import { observer } from 'mobx-react';
import {
  forwardRef,
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
const FINGER_LIGHTENING = .03;

const HAND_ARGS: [number, number, number] = [
  HAND_WIDTH,
  HAND_LENGTH,
  HAND_DEPTH,
];
const HAND_OFFSET: [number, number, number] = [
  0,
  HAND_LENGTH / 2,
  0,
];

export const FingerRenderer = function ({
  segment,
  transform,
  parents,
  parentRef,
  parentPosition,
  parentTranslation,
  length,
  radius,
  color,
}: {
  segment: Node<Joint>,
  transform: Matrix4,
  parents: readonly Node<Joint>[],
  parentRef: RefObject<RapierRigidBody>,
  parentPosition: Vector3,
  parentTranslation: Vector3,
  length: number,
  radius: number,
  color: Color,
}) {
  const fingerSegmentRef = useRef<RapierRigidBody>(null);
  const position = new Vector3(0, length / 2, 0)
    .applyMatrix4(transform)
    .add(parentTranslation)
    .add(parentPosition);
  const positionRef = useRef(position);

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
      // rotation is calculated on the x axis, but our hand is pointing upward so we need to correct
      const segmentRotation = segment.value.rotation.clone().premultiply(
        new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 2)),
      ).multiply(
        new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 2)),
      );

      const parentRotation = parentRef.current!.rotation();
      const targetRotation = new Quaternion(parentRotation.x, parentRotation.y, parentRotation.z, parentRotation.w)
        .multiply(segmentRotation);
      const deltaRotation = currentQuaternion.clone().invert().premultiply(targetRotation);
      const deltaEuler = new Euler().setFromQuaternion(deltaRotation);
      const deltaVector = new Vector3().setFromEuler(deltaEuler).multiplyScalar(1 / world.timestep);

      // console.log(new Vector3(1, 0, 0).applyQuaternion(targetRotation));

      fingerSegmentRef.current.setAngvel(deltaVector, true);
      // fingerSegmentRef.current.setRotation(currentQuaternion.slerp(targetRotation, .5), true);
      // fingerSegmentRef.current.setRotation(targetRotation, true);
    }
  });

  // unfortunately joint positions are set on the unadjusted capsule geometry
  const joint = useSphericalJoint(parentRef, fingerSegmentRef, [
    parentTranslation.toArray(),
    new Vector3(0, -length / 2, 0).applyMatrix4(transform).toArray(),
  ]);

  const adjustGeometry = useCallback(function (geometry: CapsuleGeometry | null) {
    if (geometry != null) {
      const t = new Matrix4()
        // offset
        .makeTranslation(0, length / 2, 0)
        .premultiply(transform);
      geometry.applyMatrix4(t);
    }
  }, [
    length,
    transform,
  ]);

  return (
    <>
      <RigidBody
        ref={fingerSegmentRef}
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
          <meshStandardMaterial color={color.toString({
            format: 'hex',
          })} />
        </mesh>
      </RigidBody>
      {segment.connections.map(function (connection) {
        // only render segments that have two ends (i.e. not the tip)
        if (connection.connections.length > 0) {
          return (
            <FingerRenderer
              key={connection.value.id}
              segment={connection}
              transform={transform}
              parents={[
                segment,
                ...parents,
              ]}
              parentRef={fingerSegmentRef}
              parentPosition={position}
              parentTranslation={new Vector3(0, length, 0).applyMatrix4(transform)}
              length={length * .9}
              radius={radius * .9}
              color={new Color(color.darken(FINGER_LIGHTENING))}
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
    new Vector3(HAND_WIDTH / 3, HAND_LENGTH * .3, -HAND_DEPTH / 2),
    BASE_FINGER_LENGTH * 1.2,
    BASE_FINGER_RADIUS * 1.1,
  ],
  // index
  [
    new Vector3(HAND_WIDTH / 2 - BASE_FINGER_RADIUS, HAND_LENGTH - BASE_FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // middle
  [
    new Vector3(HAND_WIDTH / 2 - BASE_FINGER_RADIUS - FINGER_GAP, HAND_LENGTH - BASE_FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // ring
  [
    new Vector3(BASE_FINGER_RADIUS + FINGER_GAP - HAND_WIDTH / 2, HAND_LENGTH - BASE_FINGER_RADIUS, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS,
  ],
  // pinky
  [
    new Vector3(BASE_FINGER_RADIUS * .9 - HAND_WIDTH / 2, HAND_LENGTH - BASE_FINGER_RADIUS * .9, 0),
    BASE_FINGER_LENGTH * 1.5,
    BASE_FINGER_RADIUS * .9,
  ],
];

type HandProps = {
  hand: Hand,
  transform: Matrix4,
  position: Vector3,
  movable: boolean,
  color: Color,
};

export const HandRenderer = forwardRef<RigidBodyType, HandProps>(function ({
  hand,
  transform,
  position,
  movable,
  color,
}: HandProps, forwardRef) {
  const palmRef = useRef<RapierRigidBody>(null);
  const ref = useMergedRefs(forwardRef, palmRef);
  const initialPosition = useRef(position);

  return (
    <>
      <RigidBody
        ref={ref}
        position={initialPosition.current}
        gravityScale={0}
        restitution={0}
        mass={1}
        collisionGroups={PLAYER_INTERACTION_GROUP}
        friction={.1}
        lockRotations={!movable}
        lockTranslations={!movable}
      >
        {/* palm */}
        <RoundedBox
          args={HAND_ARGS}
          radius={HAND_DEPTH / 2}
          smoothness={2}
          bevelSegments={2}
          position={new Vector3(...HAND_OFFSET).applyMatrix4(transform)}
          castShadow={true}
        >
          <meshStandardMaterial color={color.toString({
            format: 'hex',
          })} />
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
              transform={transform}
              parentPosition={initialPosition.current}
              parents={[hand.wrist]}
              parentRef={palmRef}
              parentTranslation={parentTranslation}
              length={length}
              radius={radius}
              color={new Color('red')}
            />
          );
        }
      })}
    </>
  );
});

const LEFT_HAND_TRANSFORM: Matrix4 = new Matrix4().identity();
// const LEFT_HAND_TRANSFORM: Matrix4 = new Matrix4().scale(new Vector3(1, -1, 1));

// .copy(new Matrix4().identity());
const RIGHT_HAND_TRANSFORM: Matrix4 = new Matrix4().scale(new Vector3(-1, 1, 1));

export const PlayerEntityRenderer3 = observer(function ({
  entity,
  debug = false,
}: EntityRendererProps<PlayerEntity> & {
  debug?: boolean,
}) {
  const rightHandRef = useRef<RigidBodyType>(null);
  const leftHandRef = useRef<RigidBodyType>(null);

  const rightHand = entity.hands[HandKind.Right];
  const leftHand = entity.hands[HandKind.Left];

  useBeforePhysicsStep(function (world: World) {
    if (leftHandRef.current && rightHandRef.current) {
      // get the relative rotation of the two hands
      // right - left
      const desiredDelta = leftHand.wrist.value.rotation.clone()
        .invert().premultiply(rightHand.wrist.value.rotation);

      const rightHandRotation = rightHandRef.current.rotation();
      const leftHandRotation = leftHandRef.current.rotation();
      const rightHandQuaternion = new Quaternion(
        rightHandRotation.x,
        rightHandRotation.y,
        rightHandRotation.z,
        rightHandRotation.w,
      );
      const leftHandQuaternion = new Quaternion(
        leftHandRotation.x,
        leftHandRotation.y,
        leftHandRotation.z,
        leftHandRotation.w,
      );
      // right - left
      const currentDelta = leftHandQuaternion.clone().invert().premultiply(rightHandQuaternion);
      const delta = desiredDelta.clone().invert().premultiply(currentDelta);
      const eulerDelta = new Euler().setFromQuaternion(delta);
      const angularVelocity = new Vector3().setFromEuler(eulerDelta).multiplyScalar(.5 / world.timestep);

      // set the rotational velocity of the hands to achieve the desired rotation
      // rightHandRef.current.setAngvel(angularVelocity, true);
      // leftHandRef.current.setAngvel(vectorDelta.clone().multiplyScalar(-1), true);

      // rightHandRef.current.setRotation(rightHandQuaternion, true);
      // rightHandRef.current.setAngvel(new Vector3(), true);
      // leftHandRef.current.setRotation(rightHandQuaternion.clone().multiply(currentDelta), true);
      // leftHandRef.current.setAngvel(new Vector3(), true);
      // rightHandRef.current.setRotation(
      //   rightHand.wrist.value.rotation,
      //   true,
      // );
      // rightHandRef.current.setAngvel(new Vector3(), true);

      // leftHandRef.current.setRotation(
      //   leftHand.wrist.value.rotation.clone().multiply(new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 2))),
      //   true,
      // );
      // leftHandRef.current.setAngvel(new Vector3(), true);

      const leftHandDelta = leftHandQuaternion.clone().invert().premultiply(
        leftHand.wrist.value.rotation.clone().multiply(
          new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 2)),
        ),
      );
      leftHandRef.current.setAngvel(
        new Vector3().setFromEuler(new Euler().setFromQuaternion(leftHandDelta)).multiplyScalar(1 / world.timestep),
        true,
      );
      const rightHandDelta = rightHandQuaternion.clone().invert().premultiply(
        rightHand.wrist.value.rotation.clone().multiply(new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 2))),
      );
      rightHandRef.current.setAngvel(
        new Vector3().setFromEuler(new Euler().setFromQuaternion(rightHandDelta)).multiplyScalar(1 / world.timestep),
        true,
      );
    }
  });

  // const joint = useSphericalJoint(rightHandRef, leftHandRef, [
  //   [
  //     -HAND_WIDTH,
  //     0,
  //     0,
  //   ],
  //   [
  //     HAND_WIDTH,
  //     0,
  //     0,
  //   ],
  // ]);
  return (
    <>
      <HandRenderer
        ref={rightHandRef}
        hand={rightHand}
        transform={RIGHT_HAND_TRANSFORM}
        position={new Vector3(HAND_WIDTH, 2, 0)}
        movable={true}
        color={new Color('orange')}
      />
      <HandRenderer
        ref={leftHandRef}
        hand={leftHand}
        transform={LEFT_HAND_TRANSFORM}
        position={new Vector3(-HAND_WIDTH, 2, 0)}
        movable={true}
        color={new Color('orange')}
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
