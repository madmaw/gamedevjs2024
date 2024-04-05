import styled from '@emotion/styled';
import type { Preview } from '@storybook/react';
import { metrics as defaultMetrics } from 'app/ui/metrics/base';
import {
  darkTheme,
  lightTheme,
} from 'app/ui/theme/themes';
import { reverse } from 'base/record';
import type Color from 'colorjs.io';
import {
  type Metrics,
  MetricsProvider,
  Size,
  SizeProvider,
} from 'ui/metrics';
import { createSelectInputTypes } from 'ui/storybook/select';
import {
  type Theme,
  ThemeProvider,
} from 'ui/theme';

const StoryContainer = styled.div`
  label: story-container;
  position: relative;
  width: 100%;
  height: 100%;
`;

const Container = styled.div<{ backgroundColor: Color }>`
  label: preview-container;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${({ backgroundColor }) => backgroundColor.toString()};
`;

const sizeLabels: Record<Size, string> = {
  [Size.Small]: 'Small',
  [Size.Medium]: 'Medium',
  [Size.Large]: 'Large',
};

const preview: Preview = {
  args: {
    theme: lightTheme,
    size: Size.Medium,
    metrics: defaultMetrics,
    // TODO locale
  },
  argTypes: {
    // TODO complains Theme has a cycle in it (probably due to color object). Claims can be fixed
    // by supplying mapping, however we do this here and it still complains
    theme: createSelectInputTypes({
      ['Light']: lightTheme,
      ['Dark']: darkTheme,
    }),
    metrics: createSelectInputTypes({
      ['Desktop']: defaultMetrics,
      ['Mobile']: defaultMetrics,
    }),
    size: createSelectInputTypes(reverse(sizeLabels)),
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    function (Story, {
      args,
    }) {
      const {
        theme,
        size,
        metrics,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      } = args as {
        theme: Theme,
        size: Size,
        metrics: Record<Size, Metrics>,
      };
      return (
        <Container backgroundColor={theme.background}>
          <StoryContainer>
            <ThemeProvider theme={theme}>
              <MetricsProvider metrics={metrics}>
                <SizeProvider size={size}>
                  <Story />
                </SizeProvider>
              </MetricsProvider>
            </ThemeProvider>
          </StoryContainer>
        </Container>
      );
    },
  ],
};

export default preview;
