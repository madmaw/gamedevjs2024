import { observable } from 'mobx';
import {
  type Quaternion,
  type Vector3,
} from 'three';

export class Scene {
  nextEntityId: number = 1;

  @observable.shallow
  accessor entities: Entity[] = [];

  constructor() {
  }
}

export enum EntityType {
  Player = 1,
  Other,
}

export type Entity = {
  readonly id: number,
  readonly type: EntityType,
  position: Vector3,
  rotation: Quaternion,
};

export class SimpleEntity {
  @observable.ref
  accessor position: Vector3;

  @observable.ref
  accessor rotation: Quaternion;

  constructor(
    readonly id: number,
    readonly type: EntityType,
    position: Vector3,
    rotation: Quaternion,
  ) {
    this.position = position;
    this.rotation = rotation;
  }
}

export class Skeleton {
  constructor() {
  }
}
