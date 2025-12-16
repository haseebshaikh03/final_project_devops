const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const taskCounter = new client.Counter({
  name: 'tasks_total',
  help: 'Total number of tasks created',
  registers: [register]
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Request timing middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Database setup
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initDatabase();
  }
});

// Initialize database schema
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Tasks table ready');
    }
  });
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ tasks: rows });
    }
  });
});

// Get task by ID
app.get('/api/tasks/:id', (req, res) => {
  const query = 'SELECT * FROM tasks WHERE id = ?';
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.json({ task: row });
    }
  });
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
  db.run(query, [title, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      taskCounter.inc();
      res.status(201).json({ 
        message: 'Task created successfully',
        id: this.lastID
      });
    }
  });
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  const query = `
    UPDATE tasks 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [title, description, status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.json({ message: 'Task updated successfully' });
    }
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.json({ message: 'Task deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   DevOps Task Manager Server Running      ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║   Metrics: http://localhost:${PORT}/metrics ║
║   Health: http://localhost:${PORT}/health   ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(err ? 1 : 0);
  });
});
