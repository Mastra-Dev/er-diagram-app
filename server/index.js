const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Init Database Table
async function initDB() {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS diagrams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) DEFAULT 'Untitled Diagram',
        data LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Database initialized: diagrams table checked/created.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

initDB();

// API Endpoints

// Save Diagram
app.post('/api/save', async (req, res) => {
    const { name, data, id } = req.body;
    try {
        if (id) {
            // Update existing
            await db.query('UPDATE diagrams SET name = ?, data = ? WHERE id = ?', [name, JSON.stringify(data), id]);
            res.json({ message: 'Diagram updated', id });
        } else {
            // Create new (or simple single-slot logic if specific requirement, but user mentioned "data disimpen", assuming multiple or single is fine. Let's assume single diagram for MVP simplicty or create new?)
            // Let's support multiple saves effectively acting as "Create New" if no ID.
            const [result] = await db.query('INSERT INTO diagrams (name, data) VALUES (?, ?)', [name || 'My Diagram', JSON.stringify(data)]);
            res.json({ message: 'Diagram saved', id: result.insertId });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save diagram' });
    }
});

// Load Diagram (Latests or Specific)
// Load Diagram List (Metadata only)
app.get('/api/list', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, updated_at FROM diagrams ORDER BY updated_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load diagram list' });
    }
});

// Load Specific Diagram
app.get('/api/load/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM diagrams WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            const diagram = rows[0];
            try {
                diagram.data = JSON.parse(diagram.data);
            } catch (e) {
                console.error("Error parsing JSON", e);
                diagram.data = { nodes: [], edges: [] };
            }
            res.json(diagram);
        } else {
            res.status(404).json({ error: 'Diagram not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load diagram' });
    }
});

// Delete Diagram
app.delete('/api/delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM diagrams WHERE id = ?', [req.params.id]);
        res.json({ message: 'Diagram deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete diagram' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
