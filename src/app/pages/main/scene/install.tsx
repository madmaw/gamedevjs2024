import { Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  Physics,
  RigidBody,
} from '@react-three/rapier';
import {
  computeCameraDistance,
  PLAYER_HEIGHT,
  RESERVED_HEIGHT,
  type Scene,
  SCENERY_INTERACTION_GROUP,
  TERRAIN_INTERACTION_GROUP,
} from 'app/domain/scene';
import { useReaction } from 'base/react/mobx';
import { observer } from 'mobx-react';
import {
  Suspense,
  useCallback,
  useRef,
} from 'react';
import {
  type DirectionalLight,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { EntityRendererRegistry } from './renderer';

function SuperBall({ radius }: { radius: number }) {
  return (
    <RigidBody
      position={[
        0,
        3,
        0,
      ]}
      restitution={1}
      colliders={'ball'}
      mass={1}
      friction={1}
      collisionGroups={SCENERY_INTERACTION_GROUP}
    >
      <mesh
        castShadow={true}
        receiveShadow={true}
      >
        <sphereGeometry args={[
          radius,
          12,
          8,
        ]} />
        <meshStandardMaterial color='red' />
      </mesh>
    </RigidBody>
  );
}

function BouncyCube() {
  return (
    <RigidBody
      restitution={1}
      position={[
        2,
        .5,
        0,
      ]}
      friction={1}
      type='fixed'
      collisionGroups={SCENERY_INTERACTION_GROUP}
    >
      <mesh
        castShadow={true}
        receiveShadow={true}
      >
        <boxGeometry args={[
          1,
          1,
          1,
        ]} />
        <meshStandardMaterial color='green' />
      </mesh>
    </RigidBody>
  );
}

function Stick() {
  return (
    <RigidBody
      restitution={1}
      position={[
        -2,
        .5,
        0,
      ]}
      friction={1}
      collisionGroups={SCENERY_INTERACTION_GROUP}
    >
      <mesh
        castShadow={true}
        receiveShadow={true}
      >
        <cylinderGeometry args={[
          .1,
          .1,
          1,
          6,
          6,
        ]} />
        <meshStandardMaterial color='brown' />
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      friction={1}
      restitution={0}
      type='fixed'
      collisionGroups={TERRAIN_INTERACTION_GROUP}
    >
      <mesh
        receiveShadow={true}
      >
        <planeGeometry
          args={[
            1000,
            1000,
          ]}
        />
        <meshStandardMaterial color='lightgrey' />
      </mesh>
    </RigidBody>
  );
}

export function install() {
  const rendererRegistry = new EntityRendererRegistry();
  const Component = observer(function ({
    scene,
  }: {
    scene: Scene,
  }) {
    const camera = useRef(new PerspectiveCamera());
    const setLight = useCallback(function (light: DirectionalLight) {
      light.shadow.camera.left = light.shadow.camera.bottom = -RESERVED_HEIGHT;
      light.shadow.camera.right = light.shadow.camera.top = RESERVED_HEIGHT;
    }, []);

    useReaction<Vector3>(
      function () {
        return scene.player
          ? scene.player.position.clone().add(scene.player.headOffset)
          : new Vector3(0, PLAYER_HEIGHT, computeCameraDistance());
      },
      [scene.player],
      function (position) {
        camera.current.position.copy(position);
        // not really required after the first time
        camera.current.lookAt(position.clone().sub(new Vector3(0, 0, computeCameraDistance())));
      },
      {
        fireImmediately: true,
        equals: function (a, b) {
          return a.equals(b);
        },
      },
    );

    const LIGHT_POSITION = new Vector3(3, 10, 2);

    return (
      <Canvas
        shadows='soft'
        camera={camera.current}
        gl={{
          alpha: false,
        }}
      >
        <Sky sunPosition={LIGHT_POSITION} />
        <ambientLight intensity={.5} />
        <directionalLight
          ref={setLight}
          position={LIGHT_POSITION}
          castShadow={true}
        >
        </directionalLight>
        {/* TODO: integrate physics initialization into existing async handling */}
        <Suspense>
          <Physics>
            <SuperBall radius={.3} />
            <BouncyCube />
            <Stick />
            <Ground />
            {scene.entities.map(function (entity) {
              const Renderer = rendererRegistry.getRenderer(entity);
              return Renderer && (
                <Renderer
                  key={entity.id}
                />
              );
            })}
          </Physics>
        </Suspense>
      </Canvas>
    );
  });
  return {
    rendererRegistry,
    Component,
  };
}
