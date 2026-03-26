const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'reports.json');

// Ensure data and uploads directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'));
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper: read/write reports
const readReports = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeReports = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// POST /api/reports - Submit a new pothole report
app.post('/api/reports', upload.single('photo'), (req, res) => {
  try {
    const { name, phone, address, description, latitude, longitude, severity } = req.body;
    if (!address || !description) {
      return res.status(400).json({ error: 'Address and description are required.' });
    }
    const reports = readReports();
    const newReport = {
      id: Date.now().toString(),
      name: name || 'Anonymous',
      phone: phone || '',
      address,
      description,
      severity: severity || 'medium',
      latitude: latitude || null,
      longitude: longitude || null,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    reports.push(newReport);
    writeReports(reports);
    res.status(201).json({ message: 'Report submitted successfully!', report: newReport });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /api/reports - Get all reports (admin)
app.get('/api/reports', (req, res) => {
  const reports = readReports();
  const { status } = req.query;
  const filtered = status ? reports.filter(r => r.status === status) : reports;
  res.json(filtered.reverse()); // newest first
});

// GET /api/reports/:id - Get single report
app.get('/api/reports/:id', (req, res) => {
  const reports = readReports();
  const report = reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  res.json(report);
});

// PATCH /api/reports/:id/status - Update report status
app.patch('/api/reports/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'in-progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const reports = readReports();
  const index = reports.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Report not found.' });
  reports[index].status = status;
  reports[index].updatedAt = new Date().toISOString();
  writeReports(reports);
  res.json({ message: 'Status updated.', report: reports[index] });
});

// DELETE /api/reports/:id - Delete a report
app.delete('/api/reports/:id', (req, res) => {
  let reports = readReports();
  const index = reports.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Report not found.' });
  reports.splice(index, 1);
  writeReports(reports);
  res.json({ message: 'Report deleted.' });
});

// GET /api/stats - Dashboard statistics
app.get('/api/stats', (req, res) => {
  const reports = readReports();
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    highSeverity: reports.filter(r => r.severity === 'high').length,
  };
  res.json(stats);
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
