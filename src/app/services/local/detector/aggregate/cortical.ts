import {
  type BodyID,
  type BodyScan,
  type CorticalID,
  CorticalKind,
  type CorticalPose,
  type CorticalScan,
  type HandScan,
  type Keypoint,
} from 'app/domain/pose';
import {
  type BodyDetectorService,
  type Detector,
  type DetectorService,
  type HandDetectorService,
  type PoseSource,
} from 'app/services/detector';
import {
  combineLatest,
  map,
  type Observable,
  Subject,
} from 'rxjs';

function aggregate(bodyScan: BodyScan, handScan: HandScan): CorticalScan {
  const poses = bodyScan.poses.map<CorticalPose>(bodyPose => {
    // TODO attempt to match the hands to the closest body
    const keypoints = handScan.poses.reduce<Partial<Record<CorticalID, Keypoint>>>(
      (
        keypoints,
        {
          kind,
          keypoints: handKeypoints,
        },
      ) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const wristID = `${kind}_wrist` as BodyID;
        const bodyWrist = bodyPose.keypoints[wristID];
        const handWrist = handKeypoints.wrist;
        if (bodyWrist != null && handWrist != null) {
          for (const [
            id,
            handKeypoint,
          ] of Object.entries(handKeypoints)) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const corticalID = `${kind}_${id}` as CorticalID;
            // match the wrists up with the 3D keypoints
            // TODO scale 3D hand keypoints to match body (somehow - maybe use the length of the forearm and width of the hand or something)
            const scale = .3;
            const adjustedHandKeypoint: Keypoint = {
              ...handKeypoint,
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              relativePosition: handKeypoint.relativePosition.map((v, i) => {
                return bodyWrist.relativePosition[i] + (v - handWrist.relativePosition[i]) * scale;
              }) as [number, number, number],
            };
            keypoints[corticalID] = adjustedHandKeypoint;
          }
        }
        return keypoints;
      },
      {
        ...bodyPose.keypoints,
      },
    );

    return {
      keypoints,
      kind: CorticalKind.Cortical,
      score: bodyPose.score,
    };
  });

  return {
    epoch: Math.max(handScan.epoch, bodyScan.epoch),
    poses,
  };
}

export class AggregateCorticalDetector implements Detector<CorticalScan> {
  constructor(
    private readonly bodyDetector: Detector<BodyScan>,
    private readonly handDetector: Detector<HandScan>,
  ) {
  }

  async detectOnce(source: PoseSource): Promise<CorticalScan> {
    const [
      bodyScan,
      handScan,
    ] = await Promise.all([
      this.bodyDetector.detectOnce(source),
      this.handDetector.detectOnce(source),
    ]);
    return aggregate(bodyScan, handScan);
  }

  async detect(source: PoseSource): Promise<Observable<CorticalScan> & { complete(): void }> {
    const [
      bodyStream,
      handStream,
    ] = await Promise.all([
      this.bodyDetector.detect(source),
      this.handDetector.detect(source),
    ]);
    const combined = combineLatest([
      bodyStream,
      handStream,
    ]).pipe(
      map(([
        bodyScan,
        handScan,
      ]) => aggregate(bodyScan, handScan)),
    );
    const result = new Subject<CorticalScan>();
    const s1 = combined.subscribe(result);
    const s2 = combined.subscribe({
      complete() {
        handStream.complete();
        bodyStream.complete();
        s1.unsubscribe();
        s2.unsubscribe();
      },
    });
    return result;
  }

  destroy(): void {
  }
}

export class AggregateCorticalDetectorService implements DetectorService<CorticalScan> {
  constructor(
    private readonly bodyDetectorService: BodyDetectorService,
    private readonly handDetectorService: HandDetectorService,
  ) {
  }

  async loadDetector(): Promise<Detector<CorticalScan>> {
    const [
      bodyDetector,
      handDetector,
    ] = await Promise.all([
      this.bodyDetectorService.loadDetector(),
      this.handDetectorService.loadDetector(),
    ]);
    return new AggregateCorticalDetector(bodyDetector, handDetector);
  }
}
