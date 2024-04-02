import styled from '@emotion/styled';

export const UnstyledButton = styled.button`
  label: unstyled-button;
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  &:hover:enabled {
    cursor: pointer;
  }
`;
