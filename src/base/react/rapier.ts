import {
  useCallback,
  useRef,
} from 'react';
import {
  type BufferGeometry,
  Matrix4,
  type Quaternion,
  Vector3,
} from 'three';

export function useAdjustedGeometry(rotation: Quaternion, offset: Vector3 = new Vector3()) {
  const offsetRef = useRef(offset);
  const rotationRef = useRef(rotation);
  return useCallback(function (geometry: BufferGeometry | null) {
    if (geometry != null) {
      const t = new Matrix4()
        // offset
        .makeTranslation(offsetRef.current)
        .premultiply(new Matrix4().makeRotationFromQuaternion(rotationRef.current));
      // this will screw up the back faces and normals
      // .premultiply(transform);
      geometry.applyMatrix4(t);
    }
  }, []);
}
