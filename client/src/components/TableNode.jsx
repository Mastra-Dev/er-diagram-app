import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FaEllipsisH, FaComment, FaTag, FaFingerprint } from 'react-icons/fa'; // Added FaFingerprint for AI
import ColumnMenu from './ColumnMenu';

const TableNode = ({ data, id, selected }) => {
    const { label, columns, onAddColumn, onUpdateTableName, onUpdateColumn, onDeleteColumn, updateNodeZIndex } = data;
    const [activeMenuColId, setActiveMenuColId] = useState(null);
    const [tooltip, setTooltip] = useState(null); // { type: 'comment' | 'default', content: string, colId: string }

    // Update Z-Index on interaction to prevent occlusion
    React.useEffect(() => {
        if (updateNodeZIndex) {
            if (activeMenuColId || tooltip) {
                updateNodeZIndex(id, 1000);
            } else {
                updateNodeZIndex(id, 0); // or default z-index
            }
        }
    }, [activeMenuColId, tooltip, id, updateNodeZIndex]);

    // Only show handles when selected
    const handleStyle = {
        background: '#747bff',
        opacity: selected ? 1 : 0,
        transition: 'opacity 0.2s',
        pointerEvents: selected ? 'all' : 'none' // Prevent interaction when hidden
    };

    const columnHandleStyle = {
        ...handleStyle,
        width: '8px',
        height: '8px'
    };

    const handleMenuClose = () => {
        setActiveMenuColId(null);
    };

    return (
        <div className="table-node" style={{ zIndex: (activeMenuColId || tooltip) ? 1000 : 1 }}>
            <div className="table-node-header">
                <input
                    className="editable-input"
                    value={label}
                    onChange={(e) => onUpdateTableName(id, e.target.value)}
                    placeholder="Table Name"
                />
                <Handle type="target" position={Position.Top} style={handleStyle} />
            </div>
            <div className="table-node-body">
                {columns.map((col, index) => (
                    <div key={col.id || index} className="table-row" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {col.isPk && <span className="pk">PK</span>}
                            <input
                                className="editable-input"
                                value={col.name}
                                onChange={(e) => onUpdateColumn(id, index, 'name', e.target.value)}
                                placeholder="col_name"
                                style={{ width: `${(col.name.length || 0) + 2}ch`, minWidth: '40px', maxWidth: '100%' }}
                            />

                            {/* Attribute Indicators - Next to Name */}
                            <div className="col-indicators" style={{ display: 'flex', gap: '3px', marginLeft: '6px', marginRight: '6px' }}>
                                {col.nullable && <span className="indicator-text" title="Nullable">N</span>}
                                {col.unsigned && <span className="indicator-text" title="Unsigned">U</span>}
                                {col.autoIncrement && <span className="indicator-icon" title="Auto Increment"><FaFingerprint size={9} color="#00d09c" /></span>}

                                {col.defaultValue && (
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            className="indicator-icon"
                                            onMouseEnter={() => setTooltip({ type: 'DEFAULT', content: col.defaultValue, colId: col.id })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            <FaTag size={8} color="#a0a0a0" />
                                        </span>
                                        {tooltip?.colId === col.id && tooltip?.type === 'DEFAULT' && (
                                            <div className="custom-tooltip">
                                                <div className="tooltip-header"><FaTag size={8} style={{ marginRight: 4 }} /> VALUE</div>
                                                <div className="tooltip-content">{tooltip.content}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {col.comment && (
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            className="indicator-icon"
                                            onMouseEnter={() => setTooltip({ type: 'COMMENT', content: col.comment, colId: col.id })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            <FaComment size={8} color="#a0a0a0" />
                                        </span>
                                        {tooltip?.colId === col.id && tooltip?.type === 'COMMENT' && (
                                            <div className="custom-tooltip">
                                                <div className="tooltip-header"><FaComment size={8} style={{ marginRight: 4 }} /> COMMENT</div>
                                                <div className="tooltip-content">{tooltip.content}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <input
                            className="editable-input"
                            value={col.type}
                            onChange={(e) => onUpdateColumn(id, index, 'type', e.target.value)}
                            placeholder="bigint"
                            style={{ width: '60px', textAlign: 'right', color: '#747bff' }}
                        />

                        {/* More Options / Menu Trigger */}
                        <div style={{ position: 'relative', marginLeft: '4px' }}>
                            <button
                                className="delete-col-btn" // Reuse existing class for hover effect
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuColId(activeMenuColId === col.id ? null : col.id);
                                }}
                                title="Column Attributes"
                            >
                                <FaEllipsisH size={10} />
                            </button>

                            {/* Render Menu if active */}
                            {activeMenuColId === col.id && (
                                <ColumnMenu
                                    position={{ x: 20, y: 0 }} // Relative to the button container
                                    column={col}
                                    onClose={handleMenuClose}
                                    onUpdate={(field, value) => onUpdateColumn(id, index, field, value)}
                                    onDelete={() => {
                                        onDeleteColumn(id, index);
                                        handleMenuClose();
                                    }}
                                />
                            )}
                        </div>

                        {/* Handles for column connections - Standard Left/Right */}
                        <Handle
                            type="source"
                            position={Position.Left}
                            id={`left-${index}`}
                            style={{ ...columnHandleStyle, left: '-8px' }}
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`right-${index}`}
                            style={{ ...columnHandleStyle, right: '-8px' }}
                        />
                    </div>
                ))}
                <div className="table-row" style={{ justifyContent: 'center', opacity: 0.5, marginTop: '4px' }} onClick={() => onAddColumn(id)}>
                    + Add Column
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export default memo(TableNode);
