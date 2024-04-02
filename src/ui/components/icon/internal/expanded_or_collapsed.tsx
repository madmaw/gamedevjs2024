import { IconSVG } from './svg';
import { type IconProps } from './types';

export type ExpandOrCollapseProps = { expanded: boolean };

export function ExpandedOrCollapsedIcon(props: IconProps & ExpandOrCollapseProps) {
  const {
    height,
    strokeWidth,
    color,
    expanded,
  } = props;
  const width = height / 2;
  const dimension = Math.min(width, height);
  const y = (height - dimension) / 2;
  const x = (width - dimension) / 2;
  return (
    <IconSVG
      {...props}
      width={width}
    >
      <g
        stroke={color.toString()}
        strokeLinejoin='round'
      >
        <rect
          x={x + strokeWidth}
          y={y + strokeWidth}
          width={dimension - strokeWidth * 2}
          height={dimension - strokeWidth * 2}
          rx={strokeWidth}
          ry={strokeWidth}
        />
        <line
          x1={x + strokeWidth * 3}
          y1={y + dimension / 2}
          x2={x + dimension - strokeWidth * 3}
          y2={y + dimension / 2}
        />
        {expanded && (
          <>
            <line
              x1={x + dimension / 2}
              y1={y + strokeWidth * 3}
              x2={x + dimension / 2}
              y2={y + dimension - strokeWidth * 3}
            />
            <line
              x1={x + dimension / 2}
              y1={y + dimension}
              x2={x + dimension / 2}
              y2={height}
            />
          </>
        )}
      </g>
    </IconSVG>
  );
}
