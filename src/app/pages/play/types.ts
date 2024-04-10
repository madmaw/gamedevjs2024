import { type WithPoseStream } from 'app/ui/detector/types';
import { type WithWebcam } from 'app/ui/webcam/types';
import { type ComponentType } from 'react';

export type PlayInputs = WithPoseStream & WithWebcam;

export type PlayProps = PlayInputs;

export type Play = ComponentType<PlayProps>;
