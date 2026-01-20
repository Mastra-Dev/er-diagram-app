import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { FaTrash, FaBars, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Reorder } from 'framer-motion';

const Sidebar = ({ nodes, onAddTable, onUpdateTableName, onUpdateTableColor, onAddColumn, onUpdateColumn, onDeleteColumn, onReorderColumns, onDeleteTable }) => {
    const { setCenter } = useReactFlow();
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [activeColSettings, setActiveColSettings] = useState(null);

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

    const toggleColSettings = (e, colId, nodeId, idx) => {
        e.stopPropagation();
        if (activeColSettings?.colId === colId) {
            setActiveColSettings(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setActiveColSettings({
            colId,
            nodeId,
            colIndex: idx,
            top: rect.top,
            left: rect.right + 10, // 10px spacing from gear icon
        });
    };



    const activeCol = activeColSettings
        ? nodes.find(n => n.id === activeColSettings.nodeId)?.data.columns[activeColSettings.colIndex]
        : null;

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

                                    <div className="detail-row">
                                        <label>Header Color</label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {['#1e1e1e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map(color => (
                                                <div
                                                    key={color}
                                                    onClick={() => onUpdateTableColor(node.id, color)}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        backgroundColor: color,
                                                        cursor: 'pointer',
                                                        border: (node.data.headerColor || '#1e1e1e') === color ? '2px solid white' : '2px solid transparent',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                    }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
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
                                                            style={{ marginLeft: '4px', padding: '4px', color: activeColSettings?.colId === col.id ? '#747bff' : '#666' }}
                                                            onClick={(e) => toggleColSettings(e, col.id, node.id, idx)}
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

            {/* Floating Settings Popover */}
            {activeColSettings && activeCol && (
                <>
                    <div
                        className="popover-backdrop"
                        onClick={() => setActiveColSettings(null)}
                    />
                    <div
                        className="sidebar-settings-popover"
                        style={{
                            top: activeColSettings.top,
                            left: activeColSettings.left
                        }}
                    >
                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={activeCol.autoIncrement || false}
                                onChange={(e) => onUpdateColumn(activeColSettings.nodeId, activeColSettings.colIndex, 'autoIncrement', e.target.checked)}
                            />
                            <span className="label-text">Auto increment</span>
                        </label>

                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={activeCol.unsigned || false}
                                onChange={(e) => onUpdateColumn(activeColSettings.nodeId, activeColSettings.colIndex, 'unsigned', e.target.checked)}
                            />
                            <span className="label-text">Unsigned</span>
                        </label>

                        <label className="checkbox-row" style={{ marginBottom: '10px' }}>
                            <input
                                type="checkbox"
                                checked={activeCol.nullable || false}
                                onChange={(e) => onUpdateColumn(activeColSettings.nodeId, activeColSettings.colIndex, 'nullable', e.target.checked)}
                            />
                            <span className="label-text">Nullable</span>
                        </label>

                        <div className="input-group">
                            <label>Value</label>
                            <input
                                className="menu-input"
                                value={activeCol.defaultValue || ''}
                                onChange={(e) => onUpdateColumn(activeColSettings.nodeId, activeColSettings.colIndex, 'defaultValue', e.target.value)}
                                placeholder="Value"
                            />
                        </div>
                        <div className="input-group">
                            <label>Comment</label>
                            <textarea
                                className="menu-textarea"
                                value={activeCol.comment || ''}
                                onChange={(e) => onUpdateColumn(activeColSettings.nodeId, activeColSettings.colIndex, 'comment', e.target.value)}
                                placeholder="Optional description"
                                rows={2}
                            />
                        </div>
                    </div>
                </>
            )}
        </aside>
    );
};

export default Sidebar;
