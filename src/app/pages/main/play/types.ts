import { type CorticalScan } from 'app/domain/pose';
import { type Scene } from 'app/domain/scene';
import { type ComponentType } from 'react';
import { type Observable } from 'rxjs';

export type PlayProps = {
  corticalStream: Observable<CorticalScan>,
  scene: Scene,
};

export type Play = ComponentType<PlayProps>;
