import React, { useEffect, useRef } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

const ColumnMenu = ({ position, column, onClose, onUpdate, onDelete }) => {
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            className="column-menu"
            ref={menuRef}
            style={{
                top: position.y,
                left: position.x
            }}
            onClick={(e) => e.stopPropagation()} // Prevent node selection when clicking menu
        >
            <div className="column-menu-header">
                <span className="title">COLUMN ATTRIBUTES</span>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes size={12} />
                </button>
            </div>

            <div className="column-menu-body">
                <label className="checkbox-row">
                    <input
                        type="checkbox"
                        checked={column.autoIncrement || false}
                        onChange={(e) => onUpdate('autoIncrement', e.target.checked)}
                    />
                    <span className="label-text">Auto increment</span>
                </label>

                <label className="checkbox-row">
                    <input
                        type="checkbox"
                        checked={column.unsigned || false}
                        onChange={(e) => onUpdate('unsigned', e.target.checked)}
                    />
                    <span className="label-text">Unsigned</span>
                </label>

                <label className="checkbox-row" style={{ marginTop: '8px' }}>
                    <input
                        type="checkbox"
                        checked={column.nullable || false}
                        onChange={(e) => onUpdate('nullable', e.target.checked)}
                    />
                    <span className="label-text">Nullable</span>
                </label>

                <div className="input-group">
                    <label>Value</label>
                    <input
                        className="menu-input"
                        value={column.defaultValue || ''}
                        onChange={(e) => onUpdate('defaultValue', e.target.value)}
                        placeholder="Value"
                    />
                </div>

                <div className="input-group">
                    <label>Comment</label>
                    <textarea
                        className="menu-textarea"
                        value={column.comment || ''}
                        onChange={(e) => onUpdate('comment', e.target.value)}
                        placeholder="Optional description for this column"
                        rows={3}
                    />
                </div>
            </div>

            <div className="column-menu-footer">
                <button className="delete-btn-full" onClick={onDelete}>
                    <FaTrash size={12} style={{ marginRight: '8px' }} />
                    Delete column
                </button>
            </div>
        </div>
    );
};

export default ColumnMenu;
