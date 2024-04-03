import styled from '@emotion/styled';
import {
  type Meta,
  type StoryObj,
} from '@storybook/react';
import { createPartialComponent } from 'base/react/partial';
import {
  useCallback,
  useState,
} from 'react';
import { Column } from 'ui/components/layout';
import { type StackProps } from 'ui/components/stack/internal/stack';
import { Stack } from 'ui/components/stack/stack';
import { type Layer } from 'ui/components/stack/types';
import { Text } from 'ui/components/typography/text';

function Panel({
  index,
}: { index: number }) {
  return (
    <Text>
      index:&nbsp;
      {index}
    </Text>
  );
}

const StackContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
`;

const StoryColumn = styled(Column)`
  height: 100%;
`;

function InteractiveStack({
  animationDurationMillis,
}: Pick<StackProps, 'animationDurationMillis'>) {
  const requestBack = useCallback(function () {
    setLayers((prev) => {
      return prev.slice(0, -1);
    });
  }, []);

  const requestAdd = useCallback(function () {
    setLayers((prev) => {
      return [
        ...prev,
        {
          id: prev.length.toString(),
          title: `Layer ${prev.length}`,
          Component: createPartialComponent(Panel, {
            index: prev.length,
          }),
        },
      ];
    });
  }, []);

  const [
    layers,
    setLayers,
  ] = useState<Layer[]>([]);
  return (
    <StoryColumn>
      <StackContainer>
        <Stack
          animationDurationMillis={animationDurationMillis}
          layers={layers}
          requestBack={requestBack}
        />
      </StackContainer>
      <button onClick={requestAdd}>
        <Text>
          Add
        </Text>
      </button>
    </StoryColumn>
  );
}

const meta: Meta<typeof InteractiveStack> = {
  component: InteractiveStack,
};
export default meta;

type Story = StoryObj<typeof InteractiveStack>;

export const Interactive: Story = {
  args: {
    animationDurationMillis: 300,
  },
};
