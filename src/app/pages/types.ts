import { type Messages } from '@lingui/core';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type InitializerProps = PropsWithChildren<{
  initialize?: () => Promise<(() => void) | undefined>,
}>;

export type Initializer = ComponentType<InitializerProps>;

export type PageProps = {
  Initializer: Initializer,
};

export type Page = {
  Component: React.ComponentType<PageProps>,
  loadMessages?: (locale: string) => Promise<Messages>,
};
