import { CorticalID } from 'app/domain/pose';
import { type PlayerEntity } from 'app/domain/scene';
import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
import { exists } from 'base/exists';
import Color from 'colorjs.io';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import {
  useEffect,
  useMemo,
} from 'react';
import {
  Euler,
  type Object3D,
  Quaternion,
  SkeletonHelper,
  Vector3,
} from 'three';

type BoneData = {
  jointId: CorticalID,
  planeIds: [CorticalID, CorticalID, CorticalID],
  incomingJointId: CorticalID,
  outgoingJointId: CorticalID,
  naturalRotation: Quaternion,
};

// clavicleR
// deltoidR
// upper_armR *
// forearmR *
// forearmR_end
// clavicleL
// deltoidL
// upper_armL
// forearmL
// forearmL_end
// forearmL001
// handL *
// palm_middleL
// f_middle01L
// f_middle02L
// f_middle03L
// f_middle03L_end
// palm_ringL
// f_ring01L
// f_ring02L
// f_ring03L
// f_ring03L_end
// palm_pinkyL
// f_pinky01L
// f_pinky02L
// f_pinky03L
// f_pinky03L_end
// thumb01L
// thumb02L
// thumb03L
// thumb03L_end
// palm_indexL
// f_index01L
// f_index02L
// f_index03L
// f_index03L_end
// forearmR001
// handR *
// palm_indexR
// f_index01R
// f_index02R
// f_index03R
// f_index03R_end
// thumb01R
// thumb02R
// thumb03R
// thumb03R_end
// palm_middleR
// f_middle01R
// f_middle02R
// f_middle03R
// f_middle03R_end
// palm_ringR
// f_ring01R
// f_ring02R
// f_ring03R
// f_ring03R_end
// palm_pinkyR
// f_pinky01R
// f_pinky02R
// f_pinky03R
// f_pinky03R_end
const BONE_DATA: Record<string, BoneData> = {
  // ['upper_armR']: CorticalID.RightShoulder,
  // ['forearmR']: CorticalID.RightElbow,
  // ['forearmR_end']: CorticalID.RightWrist,
  ['forearmR001']: {
    jointId: CorticalID.RightWrist,
    planeIds: [
      CorticalID.RightIndexFingerMCP,
      CorticalID.RightWrist,
      CorticalID.RightPinkyFingerMCP,
    ],
    incomingJointId: CorticalID.RightElbow,
    outgoingJointId: CorticalID.RightMiddleFingerMCP,
    naturalRotation: new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, -Math.PI / 3, 'XYZ')),
  },
  ['forearmL001']: {
    jointId: CorticalID.LeftWrist,
    planeIds: [
      CorticalID.LeftPinkyFingerMCP,
      CorticalID.LeftWrist,
      CorticalID.LeftIndexFingerMCP,
    ],
    incomingJointId: CorticalID.LeftElbow,
    outgoingJointId: CorticalID.LeftMiddleFingerMCP,
    naturalRotation: new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, Math.PI / 3, 'XYZ')),
  },
  // ['handL']: CorticalID.LeftWrist,
  // ['thumb01R']: CorticalID.RightThumbCMC,
  // ['thumb02R']: CorticalID.RightThumbMCP,
  // ['thumb03R']: CorticalID.RightThumbIP,
  // ['thumb03R_end']: CorticalID.RightThumbTip,
};

const DEBUG_COLORS: Partial<Record<CorticalID, Color>> = {
  [CorticalID.RightWrist]: new Color('green'),
  [CorticalID.RightElbow]: new Color('red'),
  [CorticalID.RightMiddleFingerMCP]: new Color('red'),
  [CorticalID.RightMiddleFingerPIP]: new Color('magenta'),
};

export const PlayerEntityRenderer = observer(function ({
  entity,
  object,
  baseScale = 1,
  debug = false,
}: EntityRendererProps<PlayerEntity> & {
  object: Object3D,
  baseScale?: number,
  debug?: boolean,
}) {
  const skeleton = useMemo(function () {
    return new SkeletonHelper(object);
  }, [object]);
  useEffect(function () {
    // TODO may not cause a rerender
    const disposer = autorun(function () {
      const nose = entity.keypoints.nose;
      if (!nose) {
        return;
      }
      skeleton.bones.forEach(function (bone) {
        const boneData = BONE_DATA[bone.name];
        if (boneData != null) {
          const {
            jointId,
            planeIds,
            naturalRotation,
            incomingJointId,
            outgoingJointId,
          } = boneData;
          const joint = entity.keypoints[jointId];
          const incomingJoint = entity.keypoints[incomingJointId];
          const outgoingJoint = entity.keypoints[outgoingJointId];
          const planesPoints = planeIds.map((planeId) => entity.keypoints[planeId]);
          if (joint != null && incomingJoint != null && outgoingJoint != null && planesPoints.every(exists)) {
            const alignNormal = planesPoints[0].clone().sub(planesPoints[1]).normalize();
            const planeNormal = alignNormal.cross(
              planesPoints[2].clone().sub(planesPoints[1]).normalize(),
            ).normalize();

            const screenNormal = new Vector3(0, 0, -1);
            const q = new Quaternion().setFromUnitVectors(
              planeNormal,
              screenNormal,
            );
            // get around plane normal
            const q2 = new Quaternion().setFromUnitVectors(
              planeNormal,
              new Vector3(0, 1, 0),
            );
            const planeJoint = joint.clone().applyQuaternion(q2);
            const planeIncomingJoint = incomingJoint.clone().applyQuaternion(q2);
            const planeOutgoingJoint = outgoingJoint.clone().applyQuaternion(q2);
            const v1 = planeOutgoingJoint.sub(planeJoint);
            const v2 = planeJoint.sub(planeIncomingJoint);

            const a = 0; // normalizeAngle(new Vector2(v1.x, v1.z).angle() - new Vector2(v2.x, v2.z).angle());

            console.log(
              'plane',
              planeNormal,
              'incoming normal',
              joint.clone().sub(incomingJoint).normalize(),
              'outgoing normal',
              outgoingJoint.clone().sub(joint).normalize(),
              // 'joint',
              // joint,
              'angle',
              a,
            );
            bone.quaternion.copy(new Quaternion().setFromAxisAngle(planeNormal, a))
              .multiply(q)
              .multiply(naturalRotation);
            // adjust the position to account for rotation
            const adjustedPosition = joint.clone().sub(nose).applyQuaternion(
              entity.rotation.invert(),
            ).sub(
              entity.position,
            );
            // bone.position.copy(adjustedPosition);
          }
        }
      });
    });
    return disposer;
  }, [
    entity,
    skeleton,
  ]);
  return (
    <>
      <primitive
        object={object}
        quaternion={entity.rotation}
        position={entity.position}
        scale={new Vector3(baseScale, baseScale, baseScale)}
      />
      {debug && Object.keys(entity.keypoints).map((key) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const id = key as CorticalID;
        const point = entity.keypoints[id]?.clone().multiplyScalar(2);
        if (point) {
          const color = DEBUG_COLORS[id]?.toString({ format: 'hex' }) || 'blue';
          return (
            <mesh
              key={key}
              position={point}
            >
              <sphereGeometry
                args={[
                  .03 * Math.pow((1 - point.z) / 2, 2),
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
