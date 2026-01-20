import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MiniMap,
  ReactFlowProvider,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TableNode from './components/TableNode';
import Sidebar from './components/Sidebar';
import CustomEdge from './components/CustomEdge';

const nodeTypes = {
  table: TableNode,
};

const edgeTypes = {
  'custom-edge': CustomEdge,
};

import Dashboard from './components/Dashboard';

// ... existing imports

const initialNodes = [
  {
    id: '1',
    type: 'table',
    position: { x: 250, y: 50 },
    data: {
      label: 'users',
      columns: [
        { id: 'c1', name: 'id', type: 'bigint', isPk: true },
        { id: 'c2', name: 'email', type: 'varchar', isPk: false }
      ]
    },
  },
];

const initialEdges = [];

const API_URL = 'http://localhost:3000/api';

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [diagramName, setDiagramName] = useState('My Diagram');
  const [diagramId, setDiagramId] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'

  // Callbacks for Node interactions
  const onEdgeDataChange = useCallback(() => {
    setTriggerSave(Date.now());
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'custom-edge',
      data: {
        relationType: '1:1',
        onUpdate: onEdgeDataChange
      },
      style: { strokeWidth: 2, stroke: '#e0e0e0' }
    }, eds));
    setTriggerSave(Date.now());
  }, [setEdges, onEdgeDataChange]);

  const updateNodeData = (nodeId, processData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newData = processData(node.data);
          return { ...node, data: { ...newData } }; // force update
        }
        return node;
      })
    );
  };

  const onUpdateTableName = useCallback((id, newName) => {
    updateNodeData(id, (data) => ({ ...data, label: newName }));
    setTriggerSave(Date.now());
  }, []);

  const onUpdateTableColor = useCallback((id, color) => {
    updateNodeData(id, (data) => ({ ...data, headerColor: color }));
    setTriggerSave(Date.now());
  }, []);

  const onAddColumn = useCallback((id) => {
    updateNodeData(id, (data) => ({
      ...data,
      columns: [...data.columns, { id: Math.random().toString(36).substr(2, 9), name: 'new_col', type: 'varchar', isPk: false }]
    }));
    setTriggerSave(Date.now());
  }, []);

  const onUpdateColumn = useCallback((id, colIndex, field, value) => {
    updateNodeData(id, (data) => {
      const newCols = [...data.columns];
      newCols[colIndex] = { ...newCols[colIndex], [field]: value };
      return { ...data, columns: newCols };
    });
    setTriggerSave(Date.now());
  }, []);

  const onDeleteColumn = useCallback((id, colIndex) => {
    updateNodeData(id, (data) => {
      const newCols = data.columns.filter((_, index) => index !== colIndex);
      return { ...data, columns: newCols };
    });
    setTriggerSave(Date.now());
  }, []);

  const onReorderColumns = useCallback((nodeId, newColumns) => {
    updateNodeData(nodeId, (data) => ({
      ...data,
      columns: newColumns
    }));
    setTriggerSave(Date.now());
  }, []);

  const updateNodeZIndex = useCallback((nodeId, zIndex) => {
    setNodes((nds) => nds.map(node => {
      if (node.id === nodeId) {
        // Only update if changed to avoid loop/render thrashing
        if (node.zIndex === zIndex) return node;
        return { ...node, zIndex };
      }
      return node;
    }));
  }, [setNodes]);

  // Hydrate functions into data for custom nodes
  useEffect(() => {
    setNodes((nds) => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        onUpdateTableName,
        onUpdateTableColor, // Added handler
        onAddColumn,
        onUpdateColumn,
        onDeleteColumn,
        updateNodeZIndex
      }
    })));
  }, [onUpdateTableName, onUpdateTableColor, onAddColumn, onUpdateColumn, onDeleteColumn, updateNodeZIndex, setNodes]);


  const addTable = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNode = {
      id,
      type: 'table',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 50 },
      data: {
        label: 'new_table',
        columns: [{ id: Math.random().toString(36).substr(2, 9), name: 'id', type: 'bigint', isPk: true }],
        onUpdateTableName,
        onAddColumn,
        onUpdateTableName,
        onAddColumn,
        onUpdateColumn,
        onDeleteColumn,
        updateNodeZIndex
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setTriggerSave(Date.now());
  };

  const deleteTable = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setTriggerSave(Date.now());
  };

  const onEdgesDelete = useCallback(() => {
    setTriggerSave(Date.now());
  }, []);

  // Auto Save Logic
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [triggerSave, setTriggerSave] = useState(null); // Timestamp to trigger save

  const saveDiagram = async (currentNodes, currentEdges) => {
    if (!diagramId) return;

    setSaveStatus('saving');
    const serializableNodes = currentNodes.map(n => ({
      ...n,
      data: {
        label: n.data.label,
        columns: n.data.columns
      }
    }));

    const payload = {
      name: diagramName,
      data: { nodes: serializableNodes, edges: currentEdges },
      id: diagramId
    };

    try {
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.id) {
        setSaveStatus('saved');
        setDiagramId(result.id);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Trigger Save Effect
  useEffect(() => {
    if (triggerSave && diagramId) {
      saveDiagram(nodes, edges);
    }
  }, [triggerSave]);

  const onNodeDragStop = useCallback((event, node) => {
    setTriggerSave(Date.now());
  }, []);

  const loadDiagram = useCallback(async (idToLoad) => {
    if (!idToLoad) return;
    try {
      const res = await fetch(`${API_URL}/load/${idToLoad}`);
      if (!res.ok) throw new Error('Not found');
      const result = await res.json();

      setDiagramId(result.id);
      setDiagramName(result.name);

      const loadedData = result.data;
      if (loadedData.nodes) {
        // Re-attach functions
        const hydratedNodes = loadedData.nodes.map(n => ({
          ...n,
          type: 'table',
          data: {
            ...n.data,
            columns: n.data.columns.map(c => ({ ...c, id: c.id || Math.random().toString(36).substr(2, 9) })), // Ensure ID
            onUpdateTableName,
            onAddColumn,
            onUpdateTableName,
            onAddColumn,
            onUpdateColumn,
            onDeleteColumn,
            updateNodeZIndex
          }
        }));
        setNodes(hydratedNodes);

        // Re-attach functions to Edges
        const hydratedEdges = (loadedData.edges || []).map(e => ({
          ...e,
          data: {
            ...e.data,
            onUpdate: onEdgeDataChange
          }
        }));
        setEdges(hydratedEdges);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load diagram');
    }
  }, [onUpdateTableName, onAddColumn, onUpdateColumn, onDeleteColumn, onEdgeDataChange, setNodes, setEdges]);

  const handleSelectProject = (id) => {
    setDiagramId(id);
    setView('editor');
    loadDiagram(id);
  };

  const handleCreateProject = async (name) => {
    const initialName = name || 'Untitled Diagram';
    setNodes(initialNodes);
    setEdges([]);
    setDiagramName(initialName);

    // Auto save immediately to create ID
    const payload = {
      name: initialName,
      data: { nodes: initialNodes, edges: [] }
    };
    try {
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.id) {
        setDiagramId(result.id);
        setView('editor');
        setSaveStatus('saved');
      }
    } catch (e) {
      console.error(e);
      alert("Failed to init project");
    }
  };

  const handleExport = () => {
    const serializableNodes = nodes.map(n => ({
      ...n,
      data: {
        label: n.data.label,
        columns: n.data.columns,
        headerColor: n.data.headerColor
      }
    }));

    const exportData = {
      name: diagramName,
      version: '1.0',
      timestamp: Date.now(),
      nodes: serializableNodes,
      edges: edges
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${diagramName.replace(/\s+/g, '_')}_er_diagram.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);

        // Basic validation
        if (!imported.nodes || !imported.edges) {
          alert('Invalid file format');
          return;
        }

        if (confirm(`Importing will overwrite current diagram "${diagramName}". Continue?`)) {
          setDiagramName(imported.name || 'Imported Diagram');

          // Re-hydrate nodes
          const hydratedNodes = imported.nodes.map(n => ({
            ...n,
            type: 'table',
            data: {
              ...n.data,
              columns: (n.data.columns || []).map(c => ({ ...c, id: c.id || Math.random().toString(36).substr(2, 9) })), // Ensure ID
              onUpdateTableName,
              onAddColumn,
              onUpdateTableName,
              onAddColumn, // Duplicate ref in original? keeping safe
              onUpdateColumn,
              onDeleteColumn,
              updateNodeZIndex
            }
          }));

          // Re-hydrate edges
          const hydratedEdges = imported.edges.map(e => ({
            ...e,
            data: {
              ...e.data,
              onUpdate: onEdgeDataChange
            }
          }));

          setNodes(hydratedNodes);
          setEdges(hydratedEdges);
          setTriggerSave(Date.now()); // Auto save after import
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setDiagramId(null);
  };


  if (view === 'dashboard') {
    return (
      <Dashboard
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        nodes={nodes}
        onAddTable={addTable}
        onUpdateTableName={onUpdateTableName}
        onUpdateTableColor={onUpdateTableColor}
        onAddColumn={onAddColumn}
        onUpdateColumn={onUpdateColumn}
        onDeleteColumn={onDeleteColumn}
        onReorderColumns={onReorderColumns}
        onDeleteTable={deleteTable}
      />
      <div style={{ flex: 1, position: 'relative', height: '100vh' }}>

        <div className="ui-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleBackToDashboard}
              className="ui-btn secondary"
              style={{ marginRight: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              &larr; Back
            </button>
            <h3 style={{ margin: 0, color: 'white' }}>ER Builder</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '8px' }}>
            <input
              value={diagramName}
              onChange={(e) => {
                setDiagramName(e.target.value);
                setTriggerSave(Date.now());
              }}
              className="editable-input"
              style={{ flex: 1 }}
            />
            <div style={{
              fontSize: '12px',
              color: saveStatus === 'error' ? '#ff4444' : '#888',
              fontStyle: 'italic',
              minWidth: '60px',
              textAlign: 'right'
            }}>
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'error' && 'Error'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={handleExport}
              className="ui-btn"
              style={{ flex: 1, fontSize: '11px', padding: '6px', background: '#333', border: '1px solid #555' }}
            >
              Export JSON
            </button>
            <label
              className="ui-btn"
              style={{ flex: 1, fontSize: '11px', padding: '6px', background: '#333', border: '1px solid #555', textAlign: 'center', cursor: 'pointer', display: 'block' }}
            >
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          colorMode="dark"
        >
          <svg style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              {/* 1:N Crow Foot Marker */}
              <marker id="crow-foot-start" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto">
                <path d="M12,6 L0,0 M12,6 L0,12 M12,6 L0,6" fill="none" stroke="#888" strokeWidth="1.5" />
              </marker>
              <marker id="crow-foot-end" markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
                <path d="M0,6 L12,0 M0,6 L12,12 M0,6 L12,6" fill="none" stroke="#888" strokeWidth="1.5" />
              </marker>

              {/* 1:1 Bar Marker */}
              <marker id="one-bar-start" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto">
                <path d="M9,0 L9,12 M3,0 L3,12" fill="none" stroke="#888" strokeWidth="1.5" />
              </marker>
              <marker id="one-bar-end" markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
                <path d="M3,0 L3,12 M9,0 L9,12" fill="none" stroke="#888" strokeWidth="1.5" />
              </marker>
            </defs>
          </svg>
          <Background color="#1a1a1a" gap={20} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
