import { useEffect, useState } from 'react';
import type { NetworkEdge, NetworkNode } from '../../types';

const WIDTH = 840;
const HEIGHT = 560;

export function useForceLayout(
  initialNodes: NetworkNode[],
  edges: NetworkEdge[],
) {
  const [nodes, setNodes] = useState<NetworkNode[]>(initialNodes);

  useEffect(() => {
    const simNodes = initialNodes.map((n) => ({ ...n }));
    const nodeById = new Map(simNodes.map((n) => [n.id, n]));
    let frameId = 0;
    let tick = 0;
    const maxTicks = 110;

    const step = () => {
      tick += 1;
      const alpha = Math.max(0.05, 1 - tick / maxTicks);

      // Pairwise repulsion (O(N^2) with N <= 80 is only 3,160 ops/frame)
      for (let i = 0; i < simNodes.length; i += 1) {
        for (let j = i + 1; j < simNodes.length; j += 1) {
          const a = simNodes[i];
          const b = simNodes[j];
          const dx = b.x - a.x || 0.5;
          const dy = b.y - a.y || 0.5;
          const distSq = Math.max(180, dx * dx + dy * dy);
          const force = (820 * alpha) / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force * 14;
          const fy = (dy / dist) * force * 14;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // Spring attraction along directed edges
      for (const edge of edges) {
        const src = nodeById.get(edge.source);
        const tgt = nodeById.get(edge.target);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const desired = edge.isCircular ? 80 : 98;
        const pull = (dist - desired) * 0.045 * alpha;
        const fx = (dx / dist) * pull;
        const fy = (dy / dist) * pull;
        src.vx += fx;
        src.vy += fy;
        tgt.vx -= fx;
        tgt.vy -= fy;
      }

      // Center gravity + velocity damping + boundary clamp
      for (const n of simNodes) {
        n.vx += (WIDTH / 2 - n.x) * 0.032 * alpha;
        n.vy += (HEIGHT / 2 - n.y) * 0.032 * alpha;
        n.vx *= 0.72;
        n.vy *= 0.72;
        n.x = Math.max(52, Math.min(WIDTH - 52, n.x + n.vx));
        n.y = Math.max(46, Math.min(HEIGHT - 46, n.y + n.vy));
      }

      setNodes(simNodes.map((n) => ({ ...n })));

      if (tick < maxTicks) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [initialNodes, edges]);

  return { nodes, width: WIDTH, height: HEIGHT };
}
