'use client';

import { useReactFlow } from '@xyflow/react';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './ZoomControls.module.css';

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div className={styles.controls}>
      <Tooltip content="Увеличить" side="left">
        <button
          type="button"
          className={styles.btn}
          onClick={() => zoomIn({ duration: 150 })}
          aria-label="Увеличить"
        >
          <Icon name="zoom-in" size={16} />
        </button>
      </Tooltip>
      <Tooltip content="Уменьшить" side="left">
        <button
          type="button"
          className={styles.btn}
          onClick={() => zoomOut({ duration: 150 })}
          aria-label="Уменьшить"
        >
          <Icon name="zoom-out" size={16} />
        </button>
      </Tooltip>
      <Tooltip content="По размеру экрана" side="left">
        <button
          type="button"
          className={styles.btn}
          onClick={() => fitView({ padding: 0.15, duration: 200 })}
          aria-label="По размеру экрана"
        >
          <Icon name="maximize" size={16} />
        </button>
      </Tooltip>
    </div>
  );
}
