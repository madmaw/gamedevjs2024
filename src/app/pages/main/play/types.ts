import { type CorticalScan } from 'app/domain/pose';
import { type ComponentType } from 'react';
import { type Observable } from 'rxjs';

export type PlayProps = {
  corticalStream: Observable<CorticalScan>,
};

export type Play = ComponentType<PlayProps>;
