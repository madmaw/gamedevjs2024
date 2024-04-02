import { IconSVG } from './svg';
import { type IconProps } from './types';

const ID_TRI = 'tri';
const ID_MASK = 'mask';

export function AlertIcon(props: IconProps) {
  const {
    height,
    color,
  } = props;
  const width = 2 * Math.tan(Math.PI / 6) * height;
  const r = height / 6;
  const h = r / Math.sin(Math.PI / 6);
  const dx = r * Math.sin(Math.PI / 3);
  const dy = r * Math.cos(Math.PI / 3);
  const o = Math.tan(Math.PI / 3) * r;
  const tw = width + (o - r) * 2 - 1;
  const th = height + h - r - 1;
  return (
    <IconSVG
      {...props}
      width={width}
    >
      <mask id={ID_MASK}>
        <g>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill='white'
          />
          <text
            x={width / 2}
            y={height * 2 / 3}
            textAnchor='middle'
            alignmentBaseline='middle'
            fontSize={height * .8}
            fill='black'
          >
            {/* TODO make by hand */}
            !
          </text>
        </g>
      </mask>
      <g
        id={ID_TRI}
        mask={`url(#${ID_MASK})`}
      >
        <path
          transform={`translate(${r - o}, ${r - h})`}
          fill={color.toString()}
          stroke='none'
          d={`
            M ${tw / 2 - dx} ${h - dy}
            A ${r} ${r} 0 0 1 ${tw / 2 + dx} ${h - dy}
            L ${tw - o + dx} ${th - r - dy}
            A ${r} ${r} 0 0 1 ${tw - o} ${th}
            L ${o} ${th}
            A ${r} ${r} 0 0 1 ${o - dx} ${th - r - dy}
            z
        `}
        />
      </g>
    </IconSVG>
  );
}
