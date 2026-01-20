import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from '@xyflow/react';

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
    selected,
    data,
    sourceHandleId,
    source,
    target
}) => {
    const { setEdges, getEdges, getNodes } = useReactFlow();

    // "Sibling Rank" System with Y-Sorting
    // Safety: Ensure hooks return arrays
    const allEdges = (getEdges && getEdges()) || [];
    const allNodes = (getNodes && getNodes()) || [];

    // Determine the "Side" of this edge (Left or Right) based on handle ID prefix
    const currentSide = sourceHandleId ? sourceHandleId.split('-')[0] : 'right'; // default to right

    // Filter siblings sharing the SAME SOURCE NODE and SAME SIDE
    // This organizes ALL edges leaving the right side into a single ordered list
    const siblings = allEdges.filter(e => {
        if (e.source !== source) return false;
        const eSide = e.sourceHandle ? e.sourceHandle.split('-')[0] : 'right';
        return eSide === currentSide;
    });

    // Sort by Target Node Y Position (Top to Bottom)
    // allowing lines to peel off in order
    const siblingsWithPos = siblings.map(e => {
        const targetNode = allNodes.find(n => n.id === e.target);
        return {
            id: e.id,
            y: (targetNode && targetNode.position) ? targetNode.position.y : 0
        };
    });
    siblingsWithPos.sort((a, b) => a.y - b.y);

    const myRank = siblingsWithPos.findIndex(e => e.id === id);
    const rank = myRank >= 0 ? myRank : 0;

    // Offset: Base 15px + (Rank * 10px) = tighter spacing
    let finalOffset = 15 + (rank * 10);

    // COLLISION AVOIDANCE
    // If the vertical segment of this edge cuts through any node, push it out further.
    const verticalSegmentY1 = Math.min(sourceY, targetY);
    const verticalSegmentY2 = Math.max(sourceY, targetY);

    // Safety limit to prevent infinite loops (max 10 bumps)
    for (let attempts = 0; attempts < 10; attempts++) {
        let collision = false;

        // Calculated X position of the vertical lane
        const laneX = sourcePosition === 'right' ? sourceX + finalOffset : sourceX - finalOffset;

        for (const node of allNodes) {
            if (node.id === source || node.id === target) continue; // Ignore start/end nodes

            // Get node bounds (fallback to default size if not measured yet)
            const nX = node.position.x;
            const nY = node.position.y;
            const nW = node.measured?.width || node.width || 200;
            const nH = node.measured?.height || node.height || 150;

            // Check Vertical Overlap (is this node between "start" and "end" Y?)
            // We expand the range slightly to catch partial overlaps
            const isVerticallyInPath = (nY + nH > verticalSegmentY1 - 20) && (nY < verticalSegmentY2 + 20);

            if (isVerticallyInPath) {
                // Check Horizontal Overlap (is the Lane X inside this node?)
                // We add buffer (20px)
                const isHorizontallyHit = (laneX > nX - 20) && (laneX < nX + nW + 20);

                if (isHorizontallyHit) {
                    collision = true;
                    break;
                }
            }
        }

        if (collision) {
            finalOffset += 20; // Bump out by 20px (smaller steps)
        } else {
            break; // Path is clear
        }
    }



    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 20, // Smoother corners
        offset: finalOffset,
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
        // Trigger Auto-Save in App.jsx
        if (data?.onUpdate) {
            data.onUpdate();
        }
    };

    const deleteEdge = () => {
        setEdges((edges) => edges.filter((e) => e.id !== id));
    };

    const relationLabel = data?.relationType || '1:1';

    // Determine Markers based on Relation Type
    let markerStartId = 'url(#one-bar-start)';
    let markerEndId = 'url(#one-bar-end)';

    if (relationLabel === '1:M') {
        markerStartId = 'url(#one-bar-start)';
        markerEndId = 'url(#crow-foot-end)';
    } else if (relationLabel === 'M:M') {
        markerStartId = 'url(#crow-foot-start)';
        markerEndId = 'url(#crow-foot-end)';
    }

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerStart={markerStartId}
                markerEnd={markerEndId}
                style={{ ...style, strokeWidth: 1.5, stroke: selected ? '#747bff' : '#888' }} // Thinner, lighter
            />
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: 'all',
                            zIndex: 9999, // Ensure toolbar is always on top
                        }}
                        className="nodrag nopan"
                    >
                        <div style={{ display: 'flex', gap: '5px', background: '#222', padding: '5px', borderRadius: '5px', border: '1px solid #444' }}>
                            <button className="edge-btn" onClick={() => updateType('1:1')} style={{ background: relationLabel === '1:1' ? '#444' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px' }}>1:1</button>
                            <button className="edge-btn" onClick={() => updateType('1:M')} style={{ background: relationLabel === '1:M' ? '#444' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px' }}>1:M</button>
                            <button className="edge-btn" onClick={() => updateType('M:M')} style={{ background: relationLabel === 'M:M' ? '#444' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px' }}>M:M</button>
                            <div style={{ width: '1px', background: '#444' }}></div>
                            <button className="edge-btn delete" onClick={deleteEdge} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default CustomEdge;
