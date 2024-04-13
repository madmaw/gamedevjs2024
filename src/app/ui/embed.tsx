import styled from '@emotion/styled';
import { type Embed } from 'app/services/types';
import { toUrl } from 'app/to_url';
import { type RoutingContext } from 'app/types';
import { observer } from 'mobx-react';

const EmbedsContainer = styled.div<{ debug: boolean }>`
  label: embeds;
  position: absolute; 
  display: ${props => props.debug ? 'block' : 'none'};
  bottom: 0;
  left: 0;
`;

const EmbedIframe = styled.iframe`
  width: 240px;
  height: 180px;
  border: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
`;

const EmbedComponent = observer(
  function ({
    embed: {
      routes,
    },
    context,
  }: {
    embed: Embed,
    context: RoutingContext,
  }) {
    return (
      <>
        {routes.map(route => {
          const src = toUrl(route, context);
          return (
            <EmbedIframe
              key={src}
              src={src}
            />
          );
        })}
      </>
    );
  },
);

export function Embeds({
  embeds,
  context,
}: {
  embeds: readonly Embed[],
  context: RoutingContext,
}) {
  return (
    <EmbedsContainer debug={context.debug}>
      {embeds.map((embed, i) => (
        <EmbedComponent
          key={i}
          context={context}
          embed={embed}
        />
      ))}
    </EmbedsContainer>
  );
}
