import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { FaTrash, FaBars, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Reorder } from 'framer-motion';

const Sidebar = ({ nodes, onAddTable, onUpdateTableName, onAddColumn, onUpdateColumn, onDeleteColumn, onReorderColumns, onDeleteTable }) => {
    const { setCenter } = useReactFlow();
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [expandedColIds, setExpandedColIds] = useState(new Set());

    // Sync active sidebar item with selected node
    const selectedNodeId = nodes.find(n => n.selected && n.type === 'table')?.id;
    useEffect(() => {
        if (selectedNodeId) {
            setActiveNodeId(selectedNodeId);
        }
    }, [selectedNodeId]);

    const handleNodeClick = (node) => {
        setActiveNodeId(activeNodeId === node.id ? null : node.id);
        setCenter(node.position.x + (node.measured?.width || 200) / 2, node.position.y + (node.measured?.height || 200) / 2, { zoom: 1, duration: 800 });
    };

    const toggleColExpansion = (colId) => {
        const newSet = new Set(expandedColIds);
        if (newSet.has(colId)) {
            newSet.delete(colId);
        } else {
            newSet.add(colId);
        }
        setExpandedColIds(newSet);
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
                                        <Reorder.Group
                                            axis="y"
                                            values={node.data.columns}
                                            onReorder={(newOrder) => onReorderColumns(node.id, newOrder)}
                                            style={{ padding: 0, margin: 0, listStyleType: 'none' }}
                                        >
                                            {node.data.columns.map((col, idx) => (
                                                <Reorder.Item
                                                    key={col.id}
                                                    value={col}
                                                    className="column-item-wrapper"
                                                    style={{ marginBottom: '4px' }}
                                                >
                                                    <div className="column-row" style={{ cursor: 'grab' }}>
                                                        <div style={{ color: '#666', marginRight: '4px', display: 'flex', alignItems: 'center' }}>
                                                            <FaBars size={10} />
                                                        </div>
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
                                                        <button
                                                            className="edge-btn"
                                                            style={{ marginLeft: '4px', padding: '4px', color: expandedColIds.has(col.id) ? '#747bff' : '#666' }}
                                                            onClick={() => toggleColExpansion(col.id)}
                                                            title="Column Settings"
                                                        >
                                                            <FaCog size={10} />
                                                        </button>
                                                        <button
                                                            className="edge-btn delete"
                                                            style={{ marginLeft: '4px', padding: '4px' }}
                                                            onClick={() => onDeleteColumn(node.id, idx)}
                                                            title="Delete Column"
                                                        >
                                                            <FaTrash size={10} />
                                                        </button>
                                                    </div>

                                                    {/* Expanded Settings */}
                                                    {expandedColIds.has(col.id) && (
                                                        <div className="column-settings">
                                                            <div className="settings-row">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={col.autoIncrement || false}
                                                                        onChange={(e) => onUpdateColumn(node.id, idx, 'autoIncrement', e.target.checked)}
                                                                    />
                                                                    AI
                                                                </label>
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={col.unsigned || false}
                                                                        onChange={(e) => onUpdateColumn(node.id, idx, 'unsigned', e.target.checked)}
                                                                    />
                                                                    UN
                                                                </label>
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={col.nullable || false}
                                                                        onChange={(e) => onUpdateColumn(node.id, idx, 'nullable', e.target.checked)}
                                                                    />
                                                                    NULL
                                                                </label>
                                                            </div>
                                                            <div className="settings-input-group">
                                                                <input
                                                                    className="sidebar-input small"
                                                                    value={col.defaultValue || ''}
                                                                    onChange={(e) => onUpdateColumn(node.id, idx, 'defaultValue', e.target.value)}
                                                                    placeholder="Value"
                                                                />
                                                            </div>
                                                            <div className="settings-input-group">
                                                                <textarea
                                                                    className="sidebar-input small"
                                                                    value={col.comment || ''}
                                                                    onChange={(e) => onUpdateColumn(node.id, idx, 'comment', e.target.value)}
                                                                    placeholder="Comment"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                        <button className="add-col-btn" onClick={() => onAddColumn(node.id)}>
                                            + Add Column
                                        </button>
                                        <button
                                            className="delete-table-btn"
                                            onClick={() => onDeleteTable(node.id)}
                                        >
                                            Delete Table
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
