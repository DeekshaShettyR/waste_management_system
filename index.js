
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 5000;
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); 
const complaintsFile = './data/complaints.json';
const resolvedFile = './data/resolved.json';
const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error(`Error reading file from disk: ${err}`);
    return []; 
  }
};

const writeJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2)); 
  } catch (err) {
    console.error(`Error writing to file: ${err}`);
  }
};
app.post('/report', (req, res) => {
  const { type, location, priority } = req.body;
  if (!type || !location || !priority) {
    return res.status(400).json({ message: 'Missing required fields (type, location, priority)' });
  }
  const newComplaint = {
    id: Date.now(), 
    type,
    location,
    priority,
    timestamp: new Date().toISOString(),
  };

  try {
    const complaints = readJSON(complaintsFile);

    complaints.push(newComplaint);

    writeJSON(complaintsFile, complaints);

    res.status(201).json({ message: 'Complaint added successfully', complaint: newComplaint });
  } catch (err) {
    console.error('Error handling the complaint:', err);
    res.status(500).json({ message: 'Error processing complaint' });
  }
});

app.get('/complaints', (req, res) => {
  const complaints = readJSON(complaintsFile);
  res.json(complaints);
});

app.post('/resolve', (req, res) => {
  const { id } = req.body;

  let complaints = readJSON(complaintsFile);

  const resolvedComplaint = complaints.find((c) => c.id === id);

  if (!resolvedComplaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  complaints = complaints.filter((c) => c.id !== id);
  writeJSON(complaintsFile, complaints);

  const resolvedComplaints = readJSON(resolvedFile);
  resolvedComplaint.resolvedAt = new Date().toISOString();
  resolvedComplaints.push(resolvedComplaint);
  writeJSON(resolvedFile, resolvedComplaints);

  res.json({ message: 'Complaint resolved', complaint: resolvedComplaint });
});

app.get('/resolved', (req, res) => {
  try {
    const resolvedComplaints = readJSON(resolvedFile);
    res.json(resolvedComplaints);
  } catch (error) {
    console.error('Error fetching resolved complaints:', error);
    res.status(500).json({ message: 'Error retrieving resolved complaints' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
