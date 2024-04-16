import { observable } from 'mobx';
import {
  Quaternion,
  Vector3,
} from 'three';
import { type CorticalID } from './pose';

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

type BaseEntity<T extends EntityType> = {
  readonly id: number,
  readonly type: T,
  position: Vector3,
  rotation: Quaternion,
};

export type PlayerEntity = BaseEntity<EntityType.Player> & {
  keypoints: Partial<Readonly<Record<CorticalID, Vector3>>>,
};

export type Entity = PlayerEntity;

export class SimpleEntity<T extends EntityType = EntityType> {
  @observable.ref
  accessor position: Vector3 = new Vector3();

  @observable.ref
  accessor rotation: Quaternion = new Quaternion();

  constructor(
    readonly id: number,
    readonly type: T,
  ) {
  }
}

export class PlayerEntityImpl extends SimpleEntity<EntityType.Player> implements PlayerEntity {
  @observable.ref
  accessor keypoints: Partial<Record<CorticalID, Vector3>> = {};

  constructor(id: number) {
    super(id, EntityType.Player);
  }
}
