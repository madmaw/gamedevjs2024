import { CorticalID } from 'app/domain/pose';
import { type PlayerEntity } from 'app/domain/scene';
import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
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
  outgoingJointId: CorticalID,
  incomingJointId: CorticalID,
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
  ['handR']: {
    jointId: CorticalID.RightWrist,
    // outgoingAxisId: CorticalID.RightMiddleFingerMCP,
    outgoingJointId: CorticalID.RightMiddleFingerTip,
    incomingJointId: CorticalID.RightElbow,
    naturalRotation: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 3, 'ZYX')),
    // naturalRotation: new Quaternion().setFromEuler(
    //   new Euler(1.6449593706654793, 1.1126009729576014, 0.6316635407325109, 'XYZ'),
    // ),
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
      skeleton.bones.forEach(function (bone) {
        const boneData = BONE_DATA[bone.name];
        if (boneData != null) {
          const {
            jointId,
            incomingJointId,
            outgoingJointId,
            naturalRotation,
          } = boneData;
          const joint = entity.keypoints[jointId];
          const incomingJoint = entity.keypoints[incomingJointId];
          const outgoingJoint = entity.keypoints[outgoingJointId];
          if (joint != null && incomingJoint != null && outgoingJoint != null) {
            const incomingNormal = incomingJoint.clone().sub(joint).normalize();
            const baseNormal = new Vector3(1, 0, 0);
            const rotation = new Quaternion().setFromUnitVectors(
              incomingNormal,
              baseNormal,
            );
            const outgoingNormal = outgoingJoint.clone().sub(joint).applyQuaternion(rotation).normalize();
            const angle = baseNormal.angleTo(outgoingNormal);
            const axis = baseNormal.cross(outgoingNormal).normalize();
            console.log(angle, axis);
            // bone.position.copy(position);
            const q = new Quaternion().setFromAxisAngle(
              axis,
              angle,
            ).multiply(naturalRotation);
            bone.quaternion.copy(q);
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
                  .03,
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
