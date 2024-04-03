import { type Key } from 'react';
import { UnstyledButton } from 'ui/components/button/unstyled';
import { Text } from 'ui/components/typography/text';
import { Typography } from 'ui/components/typography/types';
import {
  type MenuItem,
  type MenuListItemProps,
} from './menu';

export function SimpleMenuItem<ID extends Key>({
  label,
  onSelect,
}: MenuListItemProps<MenuItem<ID>>) {
  return (
    <UnstyledButton onClick={onSelect}>
      <Text type={Typography.Subheading}>
        {label}
      </Text>
    </UnstyledButton>
  );
}
