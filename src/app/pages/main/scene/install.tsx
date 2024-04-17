import {
  Physics,
  usePlane,
  useSphere,
} from '@react-three/cannon';
import { Canvas } from '@react-three/fiber';
import { type Scene } from 'app/domain/scene';
import { observer } from 'mobx-react';
import {
  useEffect,
  useRef,
} from 'react';
import {
  type Mesh,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { EntityRendererRegistry } from './renderer';

function SuperBall({ radius }: { radius: number }) {
  const [ref] = useSphere<Mesh>(() => ({
    mass: 1,
    position: [
      0,
      1,
      0,
    ],
    args: [radius],
    material: {
      restitution: 1,
    },
  }));
  return (
    <mesh
      ref={ref}
      castShadow={true}
    >
      <sphereGeometry args={[
        radius,
        12,
        8,
      ]} />
      <meshStandardMaterial color='red' />
    </mesh>
  );
}

function Ground() {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [
      -Math.PI / 2,
      0,
      0,
    ],
    position: [
      0,
      -2,
      0,
    ],
    material: {
      restitution: .5,
    },
  }));
  return (
    <mesh
      ref={ref}
      receiveShadow={true}
    >
      <planeGeometry
        args={[
          1000,
          1000,
        ]}
      />
      <meshStandardMaterial color='pink' />
    </mesh>
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
    useEffect(function () {
      // adjust the camera to follow the users head
      const cameraPosition = camera.current.position;
      const eyePosition = scene.player?.eyePosition;
      cameraPosition.copy(eyePosition ?? new Vector3(0, 0, 10));
      camera.current.lookAt(eyePosition?.clone().sub(new Vector3(0, 0, 10)) ?? new Vector3());
    }, [
      scene.scanSize,
      scene.player,
      scene.player?.eyePosition,
    ]);

    return (
      <Canvas
        shadows={true}
        camera={camera.current}
      >
        <ambientLight intensity={.5} />
        <directionalLight
          position={[
            -1,
            1,
            0,
          ]}
          castShadow={true}
        />
        <Physics>
          <SuperBall radius={.3} />
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
      </Canvas>
    );
  });
  return {
    rendererRegistry,
    Component,
  };
}
