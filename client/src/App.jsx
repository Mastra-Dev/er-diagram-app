import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MiniMap,
  ReactFlowProvider
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

const initialNodes = [
  {
    id: '1',
    type: 'table',
    position: { x: 250, y: 50 },
    data: {
      label: 'users',
      columns: [
        { name: 'id', type: 'bigint', isPk: true },
        { name: 'email', type: 'varchar', isPk: false }
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

  // Callbacks for Node interactions
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'custom-edge', data: { relationType: '1:1' }, style: { strokeWidth: 2, stroke: '#e0e0e0' } }, eds));
  }, [setEdges]);

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
  }, []);

  const onAddColumn = useCallback((id) => {
    updateNodeData(id, (data) => ({
      ...data,
      columns: [...data.columns, { name: 'new_col', type: 'varchar', isPk: false }]
    }));
  }, []);

  const onUpdateColumn = useCallback((id, colIndex, field, value) => {
    updateNodeData(id, (data) => {
      const newCols = [...data.columns];
      newCols[colIndex] = { ...newCols[colIndex], [field]: value };
      return { ...data, columns: newCols };
    });
  }, []);

  // Hydrate functions into data for custom nodes
  useEffect(() => {
    setNodes((nds) => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        onUpdateTableName,
        onAddColumn,
        onUpdateColumn
      }
    })));
  }, [onUpdateTableName, onAddColumn, onUpdateColumn, setNodes]);


  const addTable = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNode = {
      id,
      type: 'table',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 50 },
      data: {
        label: 'new_table',
        columns: [{ name: 'id', type: 'bigint', isPk: true }],
        onUpdateTableName,
        onAddColumn,
        onUpdateColumn
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const saveDiagram = async () => {
    // Only save serializable data (remove functions)
    const serializableNodes = nodes.map(n => ({
      ...n,
      data: {
        label: n.data.label,
        columns: n.data.columns
      }
    }));

    const payload = {
      name: diagramName,
      data: { nodes: serializableNodes, edges },
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
        setDiagramId(result.id);
        alert('Diagram saved!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const loadDiagram = async () => {
    // Load latest for now
    try {
      const res = await fetch(`${API_URL}/load`);
      const result = await res.json();
      if (result && result.length > 0) {
        const latest = result[0];
        setDiagramId(latest.id);
        setDiagramName(latest.name);

        const loadedData = latest.data;
        if (loadedData.nodes) {
          // Re-attach functions
          const hydratedNodes = loadedData.nodes.map(n => ({
            ...n,
            type: 'table', // ensure type
            data: {
              ...n.data,
              onUpdateTableName,
              onAddColumn,
              onUpdateColumn
            }
          }));
          setNodes(hydratedNodes);
          setEdges(loadedData.edges || []);
        }
      } else {
        alert('No saved diagrams found.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        nodes={nodes}
        onAddTable={addTable}
        onUpdateTableName={onUpdateTableName}
        onAddColumn={onAddColumn}
        onUpdateColumn={onUpdateColumn}
      />
      <div style={{ flex: 1, position: 'relative', height: '100vh' }}>

        <div className="ui-panel">
          <h3 style={{ margin: 0, color: 'white' }}>ER Builder</h3>
          <input
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
            className="editable-input"
            style={{ marginBottom: '8px' }}
          />
          {/* Add Table moved to Sidebar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={saveDiagram} className="ui-btn secondary">Save</button>
            <button onClick={loadDiagram} className="ui-btn secondary">Load</button>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          colorMode="dark"
        >
          <Background />
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
