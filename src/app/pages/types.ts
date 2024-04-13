import { type Messages } from '@lingui/core';
import { type AsyncController } from 'app/ui/async/controller';

export type PageProps = {
  asyncController: AsyncController,
};

export type Page = {
  Component: React.ComponentType<PageProps>,
  loadMessages?: (locale: string) => Promise<Messages>,
};
