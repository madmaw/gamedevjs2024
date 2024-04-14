import {
  type BodyScan,
  type HandScan,
} from 'app/domain/pose';
import { type ComponentType } from 'react';
import { type Observable } from 'rxjs';

export type PlayProps = {
  poseStream: Observable<BodyScan>,
  handStream: Observable<HandScan>,
};

export type Play = ComponentType<PlayProps>;
