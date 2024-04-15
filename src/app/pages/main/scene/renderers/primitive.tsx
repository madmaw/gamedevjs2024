import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
import { observer } from 'mobx-react';
import {
  type Object3D,
  Vector3,
} from 'three';

export const PrimitiveEntityRenderer = observer(function ({
  entity,
  object,
  baseScale = 1,
}: EntityRendererProps & {
  object: Object3D,
  baseScale?: number,
}) {
  return (
    <primitive
      object={object}
      quaternion={entity.rotation}
      position={entity.position}
      scale={new Vector3(baseScale, baseScale, baseScale)}
    />
  );
});
