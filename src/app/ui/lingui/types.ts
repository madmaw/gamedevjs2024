import { type Messages } from '@lingui/core';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { type GenericAsyncProps } from 'ui/components/async/generic';

export type LinguiWrapperProps = PropsWithChildren<{
  loadMessages: (locale: string) => Promise<Messages>,
  locale: string,
  Async: ComponentType<GenericAsyncProps>,
}>;

export type LinguiWrapper = ComponentType<LinguiWrapperProps>;
