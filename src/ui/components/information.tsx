import { Alignment } from 'ui/alignment';
import { type Icon } from './icon/icons';
import { Column } from './layout';
import { Text } from './typography/text';
import { Typography } from './typography/types';

export type InformationProps = {
  Icon?: Icon,
  heading?: string,
  message?: string,
};

export function Information({
  Icon,
  heading,
  message,
}: InformationProps) {
  return (
    <Column
      alignment={Alignment.Middle}
      gap={1}
    >
      {Icon && <Icon type={Typography.Heading} />}
      {heading && (
        <Text
          alignment={Alignment.Middle}
          type={Typography.Heading}
        >
          {heading}
        </Text>
      )}
      {message && (
        <Text
          alignment={Alignment.Middle}
          type={Typography.Body}
        >
          {message}
        </Text>
      )}
    </Column>
  );
}
