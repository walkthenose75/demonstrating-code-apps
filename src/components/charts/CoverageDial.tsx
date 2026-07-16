import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  wrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  pct: {
    fontSize: '34px',
    fontWeight: tokens.fontWeightBold,
    lineHeight: '36px',
    color: tokens.colorNeutralForeground1,
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
});

interface Props {
  value: number; // 0..100
  size?: number;
  thickness?: number;
  label?: string;
}

function colorFor(value: number): string {
  if (value >= 75) return '#107c10';
  if (value >= 50) return '#ca5010';
  return '#c50f1f';
}

/** A donut gauge for a single 0–100 percentage. Pure SVG, no chart lib. */
export function CoverageDial({ value, size = 180, thickness = 16, label = 'Coverage' }: Props) {
  const styles = useStyles();
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;
  const color = colorFor(clamped);
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${label} ${clamped}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tokens.colorNeutralStroke2}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 600ms ease' }}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.pct} style={{ color }}>
          {clamped}%
        </span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
