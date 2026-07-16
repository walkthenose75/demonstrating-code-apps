import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  track: {
    position: 'relative',
    height: '8px',
    width: '100%',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: tokens.borderRadiusCircular,
    transition: 'width 500ms ease',
  },
});

interface Props {
  value: number; // 0..100
  color?: string;
}

export function CoverageBar({ value, color = '#0f6cbd' }: Props) {
  const styles = useStyles();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.fill} style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  );
}
