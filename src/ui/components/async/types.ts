export const enum AsyncStateType {
  Success = 1,
  Failure,
  Loading,
}

export type AsyncState<Value, Reason, Progress> = {
  type: AsyncStateType.Success,
  value: Value,
} | {
  type: AsyncStateType.Failure,
  reason: Reason,
} | {
  type: AsyncStateType.Loading,
  progress: Progress,
};
