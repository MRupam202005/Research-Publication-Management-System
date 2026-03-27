import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function BipartiteGraph({ graphData }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 500
      });
    }
    
    // Auto-fit after mount
    setTimeout(() => {
      fgRef.current?.zoomToFit(400, 50);
    }, 1000);
  }, []);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return <div className="text-center p-8 text-slate-500">No bipartite data available to map.</div>;
  }

  return (
    <div ref={containerRef} className="w-full flex justify-center bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {typeof window !== 'undefined' && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="label"
          nodeColor={node => node.group === 'author' ? '#3b82f6' : '#f59e0b'} // Blue for authors, orange/amber for keywords
          nodeRelSize={6}
          linkColor={() => 'rgba(148, 163, 184, 0.4)'} // Slate 400 with opacity
          linkWidth={1.5}
          d3Force="charge"
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={100}
        />
      )}
    </div>
  );
}
