import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const TableNode = ({ data, id }) => {
    const { label, columns, onAddColumn, onUpdateTableName, onUpdateColumn } = data;

    return (
        <div className="table-node">
            <div className="table-node-header">
                <input
                    className="editable-input"
                    value={label}
                    onChange={(e) => onUpdateTableName(id, e.target.value)}
                    placeholder="Table Name"
                />
                <Handle type="target" position={Position.Top} style={{ background: '#747bff' }} />
            </div>
            <div className="table-node-body">
                {columns.map((col, index) => (
                    <div key={index} className="table-row">
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
                        {/* Handles for column connections (optional, for now just global handles) */}
                    </div>
                ))}
                <div className="table-row" style={{ justifyContent: 'center', opacity: 0.5 }} onClick={() => onAddColumn(id)}>
                    + Add Column
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: '#747bff' }} />
        </div>
    );
};

export default memo(TableNode);
