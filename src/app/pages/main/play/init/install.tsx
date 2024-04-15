import {
  EntityType,
  type Scene,
  SimpleEntity,
} from 'app/domain/scene';
import {
  type Play,
  type PlayProps,
} from 'app/pages/main/play/types';
import { type EntityRendererRegistry } from 'app/pages/main/scene/renderer';
import { PrimitiveEntityRenderer } from 'app/pages/main/scene/renderers/primitive';
import {
  type CorticalDetectorService,
  PoseSourceType,
} from 'app/services/detector';
import {
  AsyncModel,
  AsyncPresenter,
} from 'app/ui/async/presenter';
import { useAsyncEffect } from 'base/react/async';
import {
  createPartialComponent,
  usePartialObserverComponent,
} from 'base/react/partial';
import { runInAction } from 'mobx';
import { useMemo } from 'react';
import {
  Euler,
  type Group,
  type Loader,
  Mesh,
  Quaternion,
  SkeletonHelper,
  Vector3,
} from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { CustomAsync } from 'ui/components/async/custom';
import fpsHandsUrl from './assets/fps-hands.fbx';
import { PlayFailure } from './failure';
import { PlayLoading } from './loading';

type Asset = [
  Loader<Group>,
  string,
  EntityType,
  Vector3,
  number,
];

const fbxLoader = new FBXLoader();
const objLoader = new OBJLoader();

const ASSETS: Asset[] = [
  [
    fbxLoader,
    fpsHandsUrl,
    EntityType.Player,
    new Vector3(0, -90, 0),
    .02,
  ],
];

export function install({
  rendererRegistry,
  corticalDetectorService,
  Play,
}: {
  rendererRegistry: EntityRendererRegistry,
  corticalDetectorService: CorticalDetectorService,
  Play: Play,
}) {
  const asyncPresenter = new AsyncPresenter<PlayProps>();
  const Async = CustomAsync<PlayProps>;

  function PlaySuccess({ value }: { value: PlayProps }) {
    return <Play {...value} />;
  }

  return function ({
    scene,
  }: {
    scene: Scene,
  }) {
    const asyncModel = useMemo(function () {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return new AsyncModel<PlayProps>({} as PlayProps);
    }, []);

    useAsyncEffect(async function () {
      const corticalStream = await asyncPresenter.append(
        asyncModel,
        async function () {
          const detector = await corticalDetectorService.loadDetector();
          return detector.detect({
            type: PoseSourceType.Camera,
          });
        },
        function (value, corticalStream) {
          value.corticalStream = corticalStream;
          return value;
        },
      );
      return function () {
        corticalStream.complete();
      };
    }, [asyncModel]);
    useAsyncEffect(async function () {
      const [object] = await Promise.all(ASSETS.map(async function ([
        loader,
        url,
        entityType,
        offset,
        scale,
      ]) {
        const object = await loader.loadAsync(url);
        const offsetObject = new Mesh();
        object.position.add(offset);
        offsetObject.add(object);

        const EntityRenderer = createPartialComponent(PrimitiveEntityRenderer, {
          object: offsetObject,
          baseScale: scale,
        });
        rendererRegistry.registerRendererForEntityType(entityType, EntityRenderer, 1);
        return offsetObject;
      }));
      const player = new SimpleEntity(
        scene.nextEntityId++,
        EntityType.Player,
        new Vector3(0, 0, 0),
        new Quaternion().setFromEuler(new Euler(-Math.PI / 4, Math.PI, 0)),
      );
      runInAction(function () {
        scene.entities.push(
          player,
        );
      });
      const skeleton = new SkeletonHelper(object);
      // find a bone
      const hand = skeleton.bones.find(function (bone) {
        return bone.name === 'handL';
      });
      // hand?.position.set(1, 0, 0);

      setInterval(function () {
        runInAction(function () {
          player.rotation = player.rotation.clone().multiply(
            new Quaternion().setFromEuler(new Euler(Math.PI / 30, 0, 0)),
          );
        });
      }, 100);
    }, [
      asyncModel,
      scene,
    ]);

    const ObservingAsync = usePartialObserverComponent(
      function () {
        return {
          // TODO is there a better way to force observing changes on model?
          // would be nice to just have `state: asyncModel,`
          state: {
            type: asyncModel.type,
            value: asyncModel.value!,
            // TODO could have progress based on how much of the value is populated
            progress: undefined,
            reason: undefined,
          },
          Loading: PlayLoading,
          Failure: PlayFailure,
          Success: PlaySuccess,
        };
      },
      [asyncModel],
      Async,
    );

    return <ObservingAsync />;
  };
}
