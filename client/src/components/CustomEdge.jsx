import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected, // React Flow prop: true if edge is selected
    data
}) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt, id) => {
        evt.stopPropagation();
        // Logic mostly handled by 'selected' prop
    };

    const updateType = (newType) => {
        setEdges((edges) => edges.map((e) => {
            if (e.id === id) {
                return { ...e, data: { ...e.data, relationType: newType } };
            }
            return e;
        }));
    };

    const deleteEdge = () => {
        setEdges((edges) => edges.filter((e) => e.id !== id));
    };

    const relationLabel = data?.relationType || '1:1';

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: selected ? '#747bff' : '#555' }} />
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                            background: '#1a1a1a',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid #747bff',
                            display: 'flex',
                            gap: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                            color: 'white',
                            zIndex: 1000 /* Ensure menu is always on top */
                        }}
                        className="nodrag nopan"
                    >
                        <button className="edge-btn" onClick={() => updateType('1:1')} style={{ background: relationLabel === '1:1' ? '#444' : 'transparent' }}>1:1</button>
                        <button className="edge-btn" onClick={() => updateType('1:N')} style={{ background: relationLabel === '1:N' ? '#444' : 'transparent' }}>1:N</button>
                        <button className="edge-btn" onClick={() => updateType('M:M')} style={{ background: relationLabel === 'M:M' ? '#444' : 'transparent' }}>M:M</button>
                        <div style={{ width: '1px', background: '#444' }}></div>
                        <button className="edge-btn delete" onClick={deleteEdge}>🗑️</button>
                    </div>
                </EdgeLabelRenderer>
            )}
            <EdgeLabelRenderer>
                {!selected && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 10,
                            pointerEvents: 'all',
                            background: '#2b2b2b',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            color: '#aaa',
                            border: '1px solid #444'
                        }}
                        className="nodrag nopan"
                    >
                        {relationLabel}
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export default CustomEdge;
