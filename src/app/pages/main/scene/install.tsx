import {
  Canvas,
  useFrame,
} from '@react-three/fiber';
import { type Scene } from 'app/domain/scene';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { Euler } from 'three';
import { EntityRendererRegistry } from './renderer';

function MyMesh() {
  const [
    rotation,
    setRotation,
  ] = useState<Euler>(new Euler(0, 0, 0));
  useFrame(function (_, delta) {
    setRotation((rotation) => rotation.set(0, rotation.y + delta * Math.PI / 2, 0).clone());
  });
  return (
    <mesh
      position={[
        0,
        0,
        0,
      ]}
      rotation={rotation}
    >
      <boxGeometry
        args={[
          .1,
          .1,
          .1,
        ]}
      />
      <meshStandardMaterial color='red' />
    </mesh>
  );
}

export function install() {
  const rendererRegistry = new EntityRendererRegistry();
  const Component = function ({
    scene,
  }: {
    scene: Scene,
  }) {
    return (
      <Canvas>
        <ambientLight intensity={1} />
        <pointLight
          position={[
            -10,
            10,
            10,
          ]}
          decay={0}
          intensity={Math.PI}
        />
        <MyMesh />
        {scene.entities.map(function (entity) {
          const Renderer = rendererRegistry.getRenderer(entity);
          return Renderer && (
            <Renderer
              key={entity.id}
            />
          );
        })}
      </Canvas>
    );
  };
  return {
    rendererRegistry,
    Component: observer(Component),
  };
}
