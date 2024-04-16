import { type CorticalID } from 'app/domain/pose';
import {
  type PlayerEntity,
  PlayerEntityImpl,
} from 'app/domain/scene';
import { type EntityRendererRegistry } from 'app/pages/main/scene/renderer';
import { type CorticalDetectorService } from 'app/services/detector';
import { runInAction } from 'mobx';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Euler,
  Quaternion,
  Vector3,
} from 'three';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';
import {
  type Play,
  type PlayProps,
} from './types';

export function install({
  rendererRegistry,
  corticalDetectorService,
  debug,
}: {
  rendererRegistry: EntityRendererRegistry,
  corticalDetectorService: CorticalDetectorService,
  debug: boolean,
}) {
  const Debug = debug ? installDebug() : undefined;
  const Play = installPlay({ Debug });

  return installInit({
    corticalDetectorService,
    rendererRegistry,
    Play,
    debug,
  });
}

function installPlay({ Debug }: { Debug: Play | undefined }) {
  return function ({
    corticalStream,
    scene,
  }: PlayProps) {
    const handleRef = useRef<number | null>(null);
    const thenRef = useRef<number>(0);
    const player = useMemo<PlayerEntity>(function () {
      const player = new PlayerEntityImpl(
        scene.nextEntityId++,
      );
      // TODO compensate for model rotation elsewhere
      player.rotation = new Quaternion().setFromEuler(new Euler(Math.PI * 2 / 3, Math.PI, 0));
      return player;
    }, [scene]);

    useEffect(function () {
      runInAction(function () {
        scene.entities.push(
          player,
        );
      });
    }, [
      scene,
      player,
    ]);

    useEffect(function () {
      const subscription = corticalStream.subscribe(function ({ poses }) {
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          const keyPositions: Partial<Record<CorticalID, Vector3>> = {};
          for (const id of Object.keys(keypoints)) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const corticalId = id as CorticalID;
            const keypoint = keypoints[corticalId];
            if (keypoint != null && keypoint.score > .6) {
              // x is flipped due to mirroring, y is flipped due to using pixel coordinates, and z
              // is flipped it is measuring depth, we keep z as is because the model is detecting us facing
              // outward and we want to detect facing inward
              keyPositions[corticalId] = new Vector3(
                -keypoint.relativePosition[0],
                -keypoint.relativePosition[1],
                keypoint.relativePosition[2],
              );
            }
          }
          runInAction(function () {
            player.keypoints = {
              // ...player.keypoints,
              ...keyPositions,
            };
          });
        }
      });
      return subscription.unsubscribe.bind(subscription);
    }, [
      player,
      corticalStream,
    ]);

    const update = useCallback(function (now: number) {
      const delta = now - thenRef.current;
      thenRef.current = now;
      runInAction(function () {
        player.rotation = player.rotation.clone().multiply(
          new Quaternion().setFromEuler(new Euler(Math.PI * delta / 1999, 0, 0)),
        );
      });
      const handle = requestAnimationFrame(update);
      handleRef.current = handle;
    }, [player]);

    useEffect(function () {
      // update(0);
      return function () {
        cancelAnimationFrame(handleRef.current!);
      };
    }, [update]);

    return Debug && (
      <Aligner
        xAlignment={Alignment.End}
        yAlignment={Alignment.End}
      >
        <Debug
          corticalStream={corticalStream}
          scene={scene}
        />
      </Aligner>
    );
  };
}
