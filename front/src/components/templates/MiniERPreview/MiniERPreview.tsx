import styles from './MiniERPreview.module.css';

type LayoutKey = 'triangle' | 'row' | 'diag' | 'star' | 'tree';

interface LayoutDef {
  boxes: { x: number; y: number }[];
  edges: [number, number][];
}

const LAYOUTS: Record<LayoutKey, LayoutDef> = {
  triangle: { boxes: [{ x: 30, y: 18 }, { x: 120, y: 18 }, { x: 75, y: 90 }], edges: [[0, 1], [0, 2], [1, 2]] },
  row:      { boxes: [{ x: 14, y: 50 }, { x: 96, y: 50 }, { x: 178, y: 50 }], edges: [[0, 1], [1, 2]] },
  diag:     { boxes: [{ x: 18, y: 18 }, { x: 90, y: 62 }, { x: 160, y: 106 }], edges: [[0, 1], [1, 2]] },
  star:     { boxes: [{ x: 90, y: 14 }, { x: 18, y: 78 }, { x: 162, y: 78 }, { x: 90, y: 120 }], edges: [[0, 1], [0, 2], [1, 3], [2, 3]] },
  tree:     { boxes: [{ x: 90, y: 14 }, { x: 30, y: 80 }, { x: 150, y: 80 }], edges: [[0, 1], [0, 2]] },
};

const LAYOUT_KEYS: LayoutKey[] = ['triangle', 'row', 'diag', 'star', 'tree'];

const TBOX_W = 60;
const TBOX_H = 38;

function pickLayout(seed: string): LayoutKey {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return LAYOUT_KEYS[Math.abs(hash) % LAYOUT_KEYS.length];
}

interface MiniERPreviewProps {
  templateId: string;
  height?: number;
}

export function MiniERPreview({ templateId, height = 160 }: MiniERPreviewProps) {
  const layout = LAYOUTS[pickLayout(templateId)];

  return (
    <div className={styles.thumb} style={{ height }}>
      {layout.boxes.map((b, i) => (
        <div key={i} className={styles.tbox} style={{ left: b.x, top: b.y }}>
          <div className={styles.hh} />
          <div className={styles.ll} />
          <div className={`${styles.ll} ${styles.llShort}`} />
          <div className={styles.ll} />
        </div>
      ))}
      <svg className={styles.curves} viewBox="0 0 240 160" preserveAspectRatio="none">
        {layout.edges.map(([a, b], i) => {
          const A = layout.boxes[a];
          const B = layout.boxes[b];
          const ax = A.x + TBOX_W / 2;
          const ay = A.y + TBOX_H;
          const bx = B.x + TBOX_W / 2;
          const by = B.y;
          const my = (ay + by) / 2;
          return (
            <g key={i}>
              <path d={`M${ax} ${ay} C ${ax} ${my}, ${bx} ${my}, ${bx} ${by}`} stroke="#2a2a3e" strokeWidth="1" fill="none" />
              <circle cx={bx} cy={by} r="1.6" fill="#06b6d4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
