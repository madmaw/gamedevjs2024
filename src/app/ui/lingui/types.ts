import { type Messages } from '@lingui/core';
import { type AsyncController } from 'app/ui/async/controller';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type LinguiLoaderProps = PropsWithChildren<{
  loadMessages: (locale: string) => Promise<Messages>,
  asyncController: AsyncController<void>,
  locale: string,
}>;

export type LinguiLoader = ComponentType<LinguiLoaderProps>;
