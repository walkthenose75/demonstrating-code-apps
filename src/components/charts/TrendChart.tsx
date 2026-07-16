import { makeStyles, tokens } from '@fluentui/react-components';
import type { MonthlyCoverage } from '@/lib/analytics';

const useStyles = makeStyles({
  wrap: { width: '100%' },
  row: { display: 'flex', gap: '16px' },
  legend: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  legendItem: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
  swatch: { width: '10px', height: '10px', borderRadius: '2px' },
});

interface Props {
  data: MonthlyCoverage[];
  height?: number;
}

/** Combined bar (volume) + line (coverage %) chart, pure SVG. */
export function TrendChart({ data, height = 200 }: Props) {
  const styles = useStyles();
  const width = 640;
  const padX = 32;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const maxTotal = Math.max(1, ...data.map((d) => d.total));
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const barW = Math.min(28, (innerW / Math.max(1, data.length)) * 0.5);

  const linePoints = data
    .map((d, i) => {
      const x = padX + (data.length > 1 ? i * step : innerW / 2);
      const y = padY + innerH - (d.coveragePct / 100) * innerH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={styles.wrap}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly delivery volume and coverage trend">
        {[0, 25, 50, 75, 100].map((g) => {
          const y = padY + innerH - (g / 100) * innerH;
          return (
            <g key={g}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke={tokens.colorNeutralStroke2} strokeWidth={1} />
              <text x={4} y={y + 4} fontSize={10} fill={tokens.colorNeutralForeground3}>
                {g}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = padX + (data.length > 1 ? i * step : innerW / 2);
          const h = (d.total / maxTotal) * innerH;
          const y = padY + innerH - h;
          return (
            <g key={d.month}>
              <rect
                x={x - barW / 2}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={tokens.colorBrandBackground2}
              />
              <text x={x} y={height - 6} fontSize={10} textAnchor="middle" fill={tokens.colorNeutralForeground3}>
                {d.label}
              </text>
            </g>
          );
        })}
        <polyline points={linePoints} fill="none" stroke="#107c10" strokeWidth={2.5} strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = padX + (data.length > 1 ? i * step : innerW / 2);
          const y = padY + innerH - (d.coveragePct / 100) * innerH;
          return <circle key={d.month} cx={x} cy={y} r={3.5} fill="#107c10" />;
        })}
      </svg>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ backgroundColor: tokens.colorBrandBackground2 }} /> Deliveries
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ backgroundColor: '#107c10' }} /> Coverage %
        </span>
      </div>
    </div>
  );
}
