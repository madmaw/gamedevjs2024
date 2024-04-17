import { type Node } from 'base/graph/types';
import { observable } from 'mobx';
import {
  Quaternion,
  Vector3,
} from 'three';
import {
  type CorticalID,
  HandKind,
} from './pose';

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

  hands: Record<HandKind, Hand>,
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

  hands: Record<HandKind, Hand> = {
    [HandKind.Left]: new Hand(),
    [HandKind.Right]: new Hand(),
  };

  constructor(id: number) {
    super(id, EntityType.Player);
  }
}

export class Hand {
  @observable.ref
  accessor position: Vector3 = new Vector3();

  readonly wrist: Skeleton;

  constructor() {
    this.wrist = {
      value: new Joint(HandJointID.Wrist),
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

  constructor(readonly id: HandJointID) {
  }
}

export type Skeleton = Node<Joint>;
