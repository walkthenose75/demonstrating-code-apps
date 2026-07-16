import { makeStyles, tokens } from '@fluentui/react-components';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const useStyles = makeStyles({
  wrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    textAlign: 'center',
  },
  big: { fontSize: '26px', fontWeight: tokens.fontWeightBold, lineHeight: '28px', color: tokens.colorNeutralForeground1 },
  sub: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
});

interface Props {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: string;
  centerLabel?: string;
}

/** Multi-segment donut (pure SVG). Segments render clockwise from 12 o'clock. */
export function DonutChart({ segments, size = 200, thickness = 26, centerValue, centerLabel }: Props) {
  const styles = useStyles();
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={centerLabel ?? 'Distribution'}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tokens.colorNeutralStroke2} strokeWidth={thickness} />
        {segments.map((seg) => {
          const frac = seg.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {(centerValue || centerLabel) && (
        <div className={styles.center}>
          {centerValue ? <span className={styles.big}>{centerValue}</span> : null}
          {centerLabel ? <span className={styles.sub}>{centerLabel}</span> : null}
        </div>
      )}
    </div>
  );
}
