import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';

const Sidebar = ({ nodes, onAddTable, onUpdateTableName, onAddColumn, onUpdateColumn }) => {
    const { setCenter } = useReactFlow();
    const [activeNodeId, setActiveNodeId] = useState(null);

    const handleNodeClick = (node) => {
        setActiveNodeId(activeNodeId === node.id ? null : node.id);
        setCenter(node.position.x + (node.measured?.width || 200) / 2, node.position.y + (node.measured?.height || 200) / 2, { zoom: 1, duration: 800 });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3>Tables</h3>
                <button onClick={onAddTable} className="add-btn" title="Add New Table">
                    +
                </button>
            </div>
            <div className="sidebar-list">
                {nodes.filter(n => n.type === 'table').map((node) => {
                    const isActive = activeNodeId === node.id;
                    return (
                        <div key={node.id} className={`sidebar-group ${isActive ? 'active' : ''}`}>
                            <div
                                className="sidebar-item"
                                onClick={() => handleNodeClick(node)}
                            >
                                <span className="sidebar-item-icon">{isActive ? '📂' : '📄'}</span>
                                <span className="sidebar-item-label">{node.data.label || 'Untitled'}</span>
                                <span className="sidebar-toggle-icon">{isActive ? '▲' : '▼'}</span>
                            </div>

                            {isActive && (
                                <div className="sidebar-details">
                                    <div className="detail-row">
                                        <label>Table Name</label>
                                        <input
                                            className="sidebar-input"
                                            value={node.data.label}
                                            onChange={(e) => onUpdateTableName(node.id, e.target.value)}
                                        />
                                    </div>
                                    <div className="detail-columns">
                                        <label>Columns</label>
                                        {node.data.columns.map((col, idx) => (
                                            <div key={idx} className="column-row">
                                                <input
                                                    className="col-input name"
                                                    value={col.name}
                                                    onChange={(e) => onUpdateColumn(node.id, idx, 'name', e.target.value)}
                                                    placeholder="Name"
                                                />
                                                <input
                                                    className="col-input type"
                                                    value={col.type}
                                                    onChange={(e) => onUpdateColumn(node.id, idx, 'type', e.target.value)}
                                                    placeholder="Type"
                                                />
                                                <div
                                                    className={`col-pk ${col.isPk ? 'active' : ''}`}
                                                    onClick={() => onUpdateColumn(node.id, idx, 'isPk', !col.isPk)}
                                                    title="Toggle Primary Key"
                                                >
                                                    🔑
                                                </div>
                                            </div>
                                        ))}
                                        <button className="add-col-btn" onClick={() => onAddColumn(node.id)}>
                                            + Add Column
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {nodes.length === 0 && (
                    <div className="sidebar-empty">No tables yet. Click + to add.</div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
