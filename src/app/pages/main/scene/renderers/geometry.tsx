import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
import { observer } from 'mobx-react';

export const GeometryEntityRenderer = observer(function ({
  entity,
  baseScale = 1,
}: EntityRendererProps & {
  baseScale?: number,
}) {
  return (
    <mesh
      position={entity.position}
      quaternion={entity.rotation}
    >
      <boxGeometry
        args={[
          baseScale,
          baseScale,
          baseScale,
        ]}
      />
      <meshStandardMaterial color='green' />
    </mesh>
  );
});
