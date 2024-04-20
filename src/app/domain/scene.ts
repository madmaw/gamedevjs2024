import { interactionGroups } from '@react-three/rapier';
import { type Node } from 'base/graph/types';
import {
  computed,
  observable,
} from 'mobx';
import {
  Quaternion,
  Vector3,
} from 'three';
import {
  type CorticalID,
  HandKind,
} from './pose';

export const FOV_Y = Math.PI * 5 / (2 * 9); // 50 degrees (default)
export const PLAYER_HEIGHT = 2;
export const RESERVED_HEIGHT = 5;
export const PLAYABLE_HEIGHT = 4;
export const RESERVED_BELOW = .5;
export const PLAYABLE_ASPECT_RATIO = 3 / 2; // narrowest common webcam aspect ratio

export function computeCameraDistance(screenAspectRatio: number = window.innerWidth / window.innerHeight) {
  return RESERVED_HEIGHT * Math.max(1, PLAYABLE_ASPECT_RATIO / screenAspectRatio) / (2 * Math.tan(FOV_Y / 2));
}

const TERRAIN_COLLISION_GROUP = 1;
const PLAYER_COLLISION_GROUP = 2;
const SCENERY_COLLISION_GROUP = 3;

export const TERRAIN_INTERACTION_GROUP = interactionGroups([TERRAIN_COLLISION_GROUP], [
  SCENERY_COLLISION_GROUP,
  PLAYER_COLLISION_GROUP,
]);
export const PLAYER_INTERACTION_GROUP = interactionGroups([PLAYER_COLLISION_GROUP], [
  SCENERY_COLLISION_GROUP,
  TERRAIN_COLLISION_GROUP,
]);
export const SCENERY_INTERACTION_GROUP = interactionGroups([SCENERY_COLLISION_GROUP], [
  TERRAIN_COLLISION_GROUP,
  PLAYER_COLLISION_GROUP,
  SCENERY_COLLISION_GROUP,
]);

export class Scene {
  nextEntityId: number = 1;

  @observable.shallow
  accessor scanSize: readonly [number, number] | undefined;

  @observable.shallow
  accessor entities: Entity[] = [];

  @observable.ref
  accessor progress: number = 0;

  @computed
  get player(): PlayerEntity | undefined {
    return this.entities.find(isPlayer);
  }

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

  headOffset: Vector3,

  readonly hands: Record<HandKind, Hand>,
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

  @observable.ref
  accessor headOffset: Vector3 = new Vector3(0, PLAYER_HEIGHT, 0);

  readonly hands: Record<HandKind, Hand> = {
    [HandKind.Left]: new Hand(
      new Vector3(-1, 1, 0),
      new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2),
    ),
    [HandKind.Right]: new Hand(
      new Vector3(1, 1, 0),
      new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2),
    ),
  };

  constructor(id: number) {
    super(id, EntityType.Player);
  }
}

function isPlayer(entity: Entity): entity is PlayerEntity {
  return entity.type === EntityType.Player;
}

export class Hand {
  @observable.ref
  accessor position: Vector3 = new Vector3();

  readonly wrist: Skeleton;

  constructor(position: Vector3, rotation: Quaternion) {
    this.position.copy(position);
    this.wrist = {
      value: new Joint(HandJointID.Wrist, rotation),
      connections: [
        // thumb
        {
          value: new Joint(HandJointID.ThumbCMC),
          connections: [
            {
              value: new Joint(HandJointID.ThumbMCP),
              connections: [
                {
                  value: new Joint(HandJointID.ThumbIP),
                  connections: [
                    {
                      value: new Joint(HandJointID.ThumbTip),
                      connections: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // index finger
        {
          value: new Joint(HandJointID.IndexFingerMCP),
          connections: [
            {
              value: new Joint(HandJointID.IndexFingerPIP),
              connections: [
                {
                  value: new Joint(HandJointID.IndexFingerDIP),
                  connections: [
                    {
                      value: new Joint(HandJointID.IndexFingerTip),
                      connections: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // middle finger
        {
          value: new Joint(HandJointID.MiddleFingerMCP),
          connections: [
            {
              value: new Joint(HandJointID.MiddleFingerPIP),
              connections: [
                {
                  value: new Joint(HandJointID.MiddleFingerDIP),
                  connections: [
                    {
                      value: new Joint(HandJointID.MiddleFingerTip),
                      connections: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ring finger
        {
          value: new Joint(HandJointID.RingFingerMCP),
          connections: [
            {
              value: new Joint(HandJointID.RingFingerPIP),
              connections: [
                {
                  value: new Joint(HandJointID.RingFingerDIP),
                  connections: [
                    {
                      value: new Joint(HandJointID.RingFingerTip),
                      connections: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // pinky finger
        {
          value: new Joint(HandJointID.PinkyFingerMCP),
          connections: [
            {
              value: new Joint(HandJointID.PinkyFingerPIP),
              connections: [
                {
                  value: new Joint(HandJointID.PinkyFingerDIP),
                  connections: [
                    {
                      value: new Joint(HandJointID.PinkyFingerTip),
                      connections: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }
}

export const enum HandJointID {
  Wrist = 'wrist',
  ThumbCMC = 'thumb_cmc',
  ThumbMCP = 'thumb_mcp',
  ThumbIP = 'thumb_ip',
  ThumbTip = 'thumb_tip',
  IndexFingerMCP = 'index_finger_mcp',
  IndexFingerPIP = 'index_finger_pip',
  IndexFingerDIP = 'index_finger_dip',
  IndexFingerTip = 'index_finger_tip',
  MiddleFingerMCP = 'middle_finger_mcp',
  MiddleFingerPIP = 'middle_finger_pip',
  MiddleFingerDIP = 'middle_finger_dip',
  MiddleFingerTip = 'middle_finger_tip',
  RingFingerMCP = 'ring_finger_mcp',
  RingFingerPIP = 'ring_finger_pip',
  RingFingerDIP = 'ring_finger_dip',
  RingFingerTip = 'ring_finger_tip',
  PinkyFingerMCP = 'pinky_finger_mcp',
  PinkyFingerPIP = 'pinky_finger_pip',
  PinkyFingerDIP = 'pinky_finger_dip',
  PinkyFingerTip = 'pinky_finger_tip',
}

export class Joint {
  @observable.ref
  accessor rotation: Quaternion = new Quaternion();

  constructor(readonly id: HandJointID, rotation?: Quaternion) {
    if (rotation != null) {
      this.rotation.copy(rotation);
    }
  }
}

export type Skeleton = Node<Joint>;
