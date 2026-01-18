import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FaTimes } from 'react-icons/fa';

const TableNode = ({ data, id, selected }) => {
    const { label, columns, onAddColumn, onUpdateTableName, onUpdateColumn, onDeleteColumn } = data;

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

    return (
        <div className="table-node">
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
                    <div key={index} className="table-row" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {col.isPk && <span className="pk">PK</span>}
                            <input
                                className="editable-input"
                                value={col.name}
                                onChange={(e) => onUpdateColumn(id, index, 'name', e.target.value)}
                                placeholder="col_name"
                                style={{ width: '80px' }}
                            />
                        </div>
                        <input
                            className="editable-input"
                            value={col.type}
                            onChange={(e) => onUpdateColumn(id, index, 'type', e.target.value)}
                            placeholder="bigint"
                            style={{ width: '60px', textAlign: 'right', color: '#747bff' }}
                        />
                        <button
                            className="delete-col-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteColumn(id, index);
                            }}
                            title="Delete Column"
                        >
                            <FaTimes size={10} />
                        </button>
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
                <div className="table-row" style={{ justifyContent: 'center', opacity: 0.5 }} onClick={() => onAddColumn(id)}>
                    + Add Column
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export default memo(TableNode);
