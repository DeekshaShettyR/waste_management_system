const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Parser } = require('json2csv');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const complaintsFile = './data/complaints.json';
const complaintsCSV = './data/complaints.csv';
const resolvedFile = './data/resolved.json';
const resolvedCSV = './data/resolved.csv';

const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error(`Error reading file ${file}:`, err);
    return [];
  }
};

const writeJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing JSON to ${file}:`, err);
  }
};

const writeCSV = (file, data) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    fs.writeFileSync(file, csv);
  } catch (err) {
    console.error(`Error writing CSV to ${file}:`, err);
  }
};

// Add new complaint
app.post('/report', (req, res) => {
  const { type, location, priority } = req.body;
  if (!type || !location || !priority) {
    return res.status(400).json({ message: 'Missing fields (type, location, priority)' });
  }

  const newComplaint = {
    id: Date.now(),
    type,
    location,
    priority: parseInt(priority),
    timestamp: new Date().toISOString(),
  };

  const complaints = readJSON(complaintsFile);
  complaints.push(newComplaint);
  complaints.sort((a, b) => a.priority - b.priority);

  writeJSON(complaintsFile, complaints);
  writeCSV(complaintsCSV, complaints);

  res.status(201).json({ message: 'Complaint added successfully', complaint: newComplaint });
});

// Fetch all complaints
app.get('/complaints', (req, res) => {
  const complaints = readJSON(complaintsFile);
  res.json(complaints);
});

// Resolve a complaint
app.post('/resolve', (req, res) => {
  const { id } = req.body;
  let complaints = readJSON(complaintsFile);
  const resolved = readJSON(resolvedFile);

  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  const resolvedComplaint = complaints.splice(index, 1)[0];
  resolvedComplaint.resolvedAt = new Date().toISOString();

  resolved.push(resolvedComplaint);

  writeJSON(complaintsFile, complaints);
  writeCSV(complaintsCSV, complaints);

  writeJSON(resolvedFile, resolved);
  writeCSV(resolvedCSV, resolved);

  res.json({ message: 'Complaint resolved', complaint: resolvedComplaint });
});

// Fetch resolved complaints
app.get('/resolved', (req, res) => {
  const resolved = readJSON(resolvedFile);
  res.json(resolved);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
