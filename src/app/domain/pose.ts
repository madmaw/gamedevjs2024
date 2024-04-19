export type Keypoint = {
  readonly relativePosition: readonly [number, number, number],
  readonly screenPosition: readonly [number, number, number],
  readonly score: number,
};

export type Pose<Kind, ID extends string | number | symbol> = {
  readonly kind: Kind,
  readonly keypoints: Partial<Record<ID, Keypoint>>,
  readonly score: number | undefined,
};

export type Scan<Kind, ID extends string | number | symbol> = {
  readonly epoch: number,
  readonly poses: readonly Pose<Kind, ID>[],
  readonly size: readonly [number, number],
};

export const enum HandID {
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

export const enum HandKind {
  Left = 'left',
  Right = 'right',
}

export type HandPose = Pose<HandKind, HandID>;
export type HandScan = Scan<HandKind, HandID>;

export const enum BodyID {
  Nose = 'nose',
  LeftEyeInner = 'left_eye_inner',
  LeftEye = 'left_eye',
  LeftEyeOuter = 'left_eye_outer',
  RightEyeInner = 'right_eye_inner',
  RightEye = 'right_eye',
  RightEyeOuter = 'right_eye_outer',
  LeftEar = 'left_ear',
  RightEar = 'right_ear',
  MouthLeft = 'mouth_left',
  MouthRight = 'mouth_right',
  LeftShoulder = 'left_shoulder',
  RightShoulder = 'right_shoulder',
  LeftELbow = 'left_elbow',
  RightElbow = 'right_elbow',
  LeftWrist = 'left_wrist',
  RightWrist = 'right_wrist',
  LeftPinky = 'left_pinky',
  RightPinky = 'right_pinky',
  LeftIndex = 'left_index',
  RightIndex = 'right_index',
  LeftThumb = 'left_thumb',
  RightThumb = 'right_thumb',
  LeftHip = 'left_hip',
  RightHip = 'right_hip',
  LeftKnee = 'left_knee',
  RightKnee = 'right_knee',
  LeftAnkle = 'left_ankle',
  RightAngle = 'right_ankle',
  LeftHeel = 'left_heel',
  RightHeel = 'right_heel',
  LeftFootIndex = 'left_foot_index',
  RightFootIndex = 'right_foot_index',
}

export enum BodyKind {
  Body = 'body',
}

export type BodyPose = Pose<BodyKind, BodyID>;
export type BodyScan = Scan<BodyKind, BodyID>;

// TODO remove unused keypoints
// cortical as in "cortical homunculus" with focus on hands and face
export const enum CorticalID {
  // body (excluding hands)
  Nose = 'nose',
  LeftEyeInner = 'left_eye_inner',
  LeftEye = 'left_eye',
  LeftEyeOuter = 'left_eye_outer',
  RightEyeInner = 'right_eye_inner',
  RightEye = 'right_eye',
  RightEyeOuter = 'right_eye_outer',
  LeftEar = 'left_ear',
  RightEar = 'right_ear',
  MouthLeft = 'mouth_left',
  MouthRight = 'mouth_right',
  LeftShoulder = 'left_shoulder',
  RightShoulder = 'right_shoulder',
  LeftElbow = 'left_elbow',
  RightElbow = 'right_elbow',
  LeftWrist = 'left_wrist',
  RightWrist = 'right_wrist',
  // redundant with hand positions, also 3D detection completely inaccurate
  // LeftPinky = 'left_pinky',
  // RightPinky = 'right_pinky',
  // LeftIndex = 'left_index',
  // RightIndex = 'right_index',
  // LeftThumb = 'left_thumb',
  // RightThumb = 'right_thumb',
  LeftHip = 'left_hip',
  RightHip = 'right_hip',
  LeftKnee = 'left_knee',
  RightKnee = 'right_knee',
  LeftAnkle = 'left_ankle',
  RightAngle = 'right_ankle',
  LeftHeel = 'left_heel',
  RightHeel = 'right_heel',
  LeftFootIndex = 'left_foot_index',
  RightFootIndex = 'right_foot_index',
  // hand (left)
  LeftThumbCMC = 'left_thumb_cmc',
  LeftThumbMCP = 'left_thumb_mcp',
  LeftThumbIP = 'left_thumb_ip',
  LeftThumbTip = 'left_thumb_tip',
  LeftIndexFingerMCP = 'left_index_finger_mcp',
  LeftIndexFingerPIP = 'left_index_finger_pip',
  LeftIndexFingerDIP = 'left_index_finger_dip',
  LeftIndexFingerTip = 'left_index_finger_tip',
  LeftMiddleFingerMCP = 'left_middle_finger_mcp',
  LeftMiddleFingerPIP = 'left_middle_finger_pip',
  LeftMiddleFingerDIP = 'left_middle_finger_dip',
  LeftMiddleFingerTip = 'left_middle_finger_tip',
  LeftRingFingerMCP = 'left_ring_finger_mcp',
  LeftRingFingerPIP = 'left_ring_finger_pip',
  LeftRingFingerDIP = 'left_ring_finger_dip',
  LeftRingFingerTip = 'left_ring_finger_tip',
  LeftPinkyFingerMCP = 'left_pinky_finger_mcp',
  LeftPinkyFingerPIP = 'left_pinky_finger_pip',
  LeftPinkyFingerDIP = 'left_pinky_finger_dip',
  LeftPinkyFingerTip = 'left_pinky_finger_tip',
  // hand (right)
  RightThumbCMC = 'right_thumb_cmc',
  RightThumbMCP = 'right_thumb_mcp',
  RightThumbIP = 'right_thumb_ip',
  RightThumbTip = 'right_thumb_tip',
  RightIndexFingerMCP = 'right_index_finger_mcp',
  RightIndexFingerPIP = 'right_index_finger_pip',
  RightIndexFingerDIP = 'right_index_finger_dip',
  RightIndexFingerTip = 'right_index_finger_tip',
  RightMiddleFingerMCP = 'right_middle_finger_mcp',
  RightMiddleFingerPIP = 'right_middle_finger_pip',
  RightMiddleFingerDIP = 'right_middle_finger_dip',
  RightMiddleFingerTip = 'right_middle_finger_tip',
  RightRingFingerMCP = 'right_ring_finger_mcp',
  RightRingFingerPIP = 'right_ring_finger_pip',
  RightRingFingerDIP = 'right_ring_finger_dip',
  RightRingFingerTip = 'right_ring_finger_tip',
  RightPinkyFingerMCP = 'right_pinky_finger_mcp',
  RightPinkyFingerPIP = 'right_pinky_finger_pip',
  RightPinkyFingerDIP = 'right_pinky_finger_dip',
  RightPinkyFingerTip = 'right_pinky_finger_tip',
}

export const enum CorticalKind {
  Cortical = 'cortical',
}

export type CorticalPose = Pose<CorticalKind, CorticalID>;
export type CorticalScan = Scan<CorticalKind, CorticalID>;
