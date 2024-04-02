import styled from '@emotion/styled';
import { type Icon } from './icon/icons';
import { Text } from './typography/text';
import {
  TextAlignment,
  Typography,
} from './typography/types';

export type InformationProps = {
  Icon?: Icon,
  heading?: string,
  message?: string,
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export function Information({
  Icon,
  heading,
  message,
}: InformationProps) {
  return (
    <Container>
      {Icon && <Icon type={Typography.Heading} />}
      {heading && (
        <Text
          alignment={TextAlignment.Middle}
          type={Typography.Heading}
        />
      )}
      {message && (
        <Text
          alignment={TextAlignment.Middle}
          type={Typography.Body}
        >
          {message}
        </Text>
      )}
    </Container>
  );
}
