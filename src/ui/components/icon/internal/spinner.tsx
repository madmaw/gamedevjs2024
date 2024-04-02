import Color from 'colorjs.io';
import { Spinner } from 'ui/components/spinner';
import { IconSVG } from './svg';
import { type IconProps } from './types';

const TRANSPARENT = new Color('transparent');
const EXPONENT = .5;

export function SpinnerIcon(props: IconProps & {
  segments?: number,
  lineThickness?: number,
}) {
  const {
    height,
    color,
    strokeWidth,
    segments = 8,
  } = props;
  const radius = height / 2 - strokeWidth;
  return (
    <Spinner>
      <IconSVG
        {...props}
        width={height}
      >
        <g
          fill='none'
          strokeWidth={strokeWidth}
        >
          {(new Array(segments)).fill(0).map(function (_, i) {
            const id = `lg${i}`;
            const fromAngle = (Math.PI * 2) * -i / segments;
            const toAngle = (Math.PI * 2) * -(i + 1) / segments;
            const fromColor = color.mix(
              TRANSPARENT,
              Math.pow(i / segments, EXPONENT),
            );
            const toColor = color.mix(
              TRANSPARENT,
              Math.pow((i + 1) / segments, EXPONENT),
            );
            const x1 = Math.cos(fromAngle) * radius + height / 2;
            const y1 = Math.sin(fromAngle) * radius + height / 2;
            const x2 = Math.cos(toAngle) * radius + height / 2;
            const y2 = Math.sin(toAngle) * radius + height / 2;
            return (
              <g key={id}>
                <linearGradient
                  id={id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  gradientUnits='userSpaceOnUse'
                >
                  <stop
                    offset='0%'
                    stopColor={fromColor.toString()}
                  />
                  <stop
                    offset='100%'
                    stopColor={toColor.toString()}
                  />
                </linearGradient>
                <path
                  d={`M ${x1} ${y1} A${radius} ${radius} 0 0 0 ${x2} ${y2}`}
                  stroke={`url(#${id})`}
                />
              </g>
            );
          })}
        </g>
      </IconSVG>
    </Spinner>
  );
}
