import { makeStyles, tokens, Tooltip } from '@fluentui/react-components';
import type { HeatCell } from '@/lib/analytics';
import { formatDate } from '@/lib/format';

const useStyles = makeStyles({
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  grid: { display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '4px' },
  col: { display: 'flex', flexDirection: 'column', gap: '3px' },
  cell: {
    width: '13px',
    height: '13px',
    borderRadius: '3px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    alignSelf: 'flex-end',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
});

const BASE = '#0f6cbd';
function shade(count: number, max: number): string {
  if (count <= 0) return tokens.colorNeutralBackground3;
  const intensity = 0.25 + 0.75 * (count / Math.max(1, max));
  const alpha = Math.round(intensity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${BASE}${alpha}`;
}

interface Props {
  grid: HeatCell[][];
  max: number;
}

/** GitHub-style contribution grid of delivery activity. */
export function ActivityHeatmap({ grid, max }: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {grid.map((col, ci) => (
          <div key={ci} className={styles.col}>
            {col.map((cell) => (
              <Tooltip
                key={cell.date}
                relationship="label"
                content={`${cell.count} ${cell.count === 1 ? 'delivery' : 'deliveries'} · ${formatDate(cell.date)}`}
              >
                <div className={styles.cell} style={{ backgroundColor: shade(cell.count, max) }} />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span>Less</span>
        {[0, 1, Math.ceil(max / 2), max].map((c, i) => (
          <span
            key={i}
            className={styles.cell}
            style={{ backgroundColor: shade(c, max), display: 'inline-block' }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
