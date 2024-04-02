import {
  type Meta,
  type StoryObj,
} from '@storybook/react';
import { Stack } from 'ui/components/stack/stack';
import { LayerBehavior } from 'ui/components/stack/types';

const meta: Meta<typeof Stack> = {
  component: Stack,
  // parameters: {
  //   layout: 'fullscreen',
  // },
};
export default meta;

type Story = StoryObj<typeof Stack>;

export const Test: Story = {
  args: {
    layers: [
      {
        id: '1',
        title: 'Layer 1',
        behavior: LayerBehavior.Displaced,
        Component: () => (
          <div>
            Layer 1
          </div>
        ),
      },
      {
        id: '2',
        title: 'Layer 2',
        behavior: LayerBehavior.Displaced,
        Component: () => (
          <div>
            Layer 2
          </div>
        ),
      },
    ],
  },
};
