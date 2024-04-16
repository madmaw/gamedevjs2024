import { type CorticalID } from 'app/domain/pose';
import { type PlayerEntity } from 'app/domain/scene';
import { type EntityRendererProps } from 'app/pages/main/scene/renderer';
import { observer } from 'mobx-react';

export const PlayerPointsEntityRenderer = observer(function ({
  entity,
}: EntityRendererProps<PlayerEntity>) {
  return (
    <>
      {Object.keys(entity.keypoints).map((key) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const point = entity.keypoints[key as CorticalID];
        return (
          <mesh
            key={key}
            position={point}
          >
            <sphereGeometry
              args={[
                .01,
                8,
                8,
              ]}
            />
            <meshStandardMaterial color='blue' />
          </mesh>
        );
      })}
    </>
  );
});
