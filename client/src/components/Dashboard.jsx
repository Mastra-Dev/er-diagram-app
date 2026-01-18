import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaDatabase, FaFolderOpen, FaTimes } from 'react-icons/fa';

const API_URL = 'http://localhost:3000/api';

export default function Dashboard({ onSelectProject, onCreateProject }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_URL}/list`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Apakah anda yakin ingin menghapus project ini?')) return;

        try {
            await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
            fetchProjects(); // Refresh list
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Gagal menghapus project");
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '40px', color: 'white', height: '100vh', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>My Diagrams</h1>
                        <p style={{ color: '#888', marginTop: '5px' }}>Kelola diagram database anda</p>
                    </div>
                    <button className="ui-btn primary" onClick={() => { setNewProjectName(''); setIsModalOpen(true); }} style={{ padding: '10px 20px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPlus /> New Diagram
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {projects.map(p => (
                            <div
                                key={p.id}
                                className="project-card"
                                onClick={() => onSelectProject(p.id)}
                                style={{
                                    background: '#1e1e1e',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid #333',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#646cff'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'rgba(100, 108, 255, 0.2)', padding: '10px', borderRadius: '8px', color: '#646cff' }}>
                                        <FaDatabase size={20} />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <h3 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #333' }}>
                                    Updated: {new Date(p.updated_at).toLocaleDateString()} {new Date(p.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                <button
                                    onClick={(e) => handleDelete(e, p.id)}
                                    className="delete-btn"
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#666',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                    title="Hapus Project"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Create Project */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#1e1e1e',
                            padding: '30px',
                            borderRadius: '12px',
                            width: '400px',
                            maxWidth: '90%',
                            border: '1px solid #333',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                            >
                                <FaTimes size={16} />
                            </button>

                            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Nama Project Baru</h2>

                            <input
                                autoFocus
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Masukkan nama project..."
                                className="editable-input"
                                style={{ width: '100%', padding: '12px', fontSize: '1rem', background: '#2a2a2a', border: '1px solid #444', marginBottom: '20px', borderRadius: '6px' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newProjectName.trim()) {
                                        onCreateProject(newProjectName);
                                        setIsModalOpen(false);
                                    }
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="ui-btn secondary"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        if (newProjectName.trim()) {
                                            onCreateProject(newProjectName);
                                            setIsModalOpen(false);
                                        }
                                    }}
                                    className="ui-btn primary"
                                    style={{ padding: '10px 20px' }}
                                    disabled={!newProjectName.trim()}
                                >
                                    Buat Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
