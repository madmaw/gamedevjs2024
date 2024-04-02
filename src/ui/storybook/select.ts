import { type InputType } from '@storybook/types';

export function createSelectInputTypes<
  Value,
  Label extends string = string,
>(mapping: Record<Label, Value>): InputType {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const options = Object.keys(mapping) as Label[];
  return {
    options,
    mapping,
    control: {
      type: 'select',
    },
  };
}
