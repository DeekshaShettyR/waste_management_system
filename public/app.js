const complaintForm = document.getElementById('complaintForm');
const complaintsTable = document.getElementById('complaintsTable').getElementsByTagName('tbody')[0];
const resolvedTable = document.getElementById('resolvedTable').getElementsByTagName('tbody')[0];

// Fetch open complaints
const fetchComplaints = async () => {
  try {
    const response = await fetch('http://localhost:5000/complaints');
    const complaints = await response.json();

    complaintsTable.innerHTML = '';

    complaints.forEach(complaint => {
      const row = complaintsTable.insertRow();
      row.innerHTML = `
        <td>${complaint.id}</td>
        <td>${complaint.type}</td>
        <td>${complaint.location}</td>
        <td>${complaint.priority}</td>
        <td>
          <button onclick="resolveComplaint(${complaint.id})">Resolve</button>
        </td>
      `;
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
  }
};

// Fetch resolved complaints
const fetchResolvedComplaints = async () => {
  try {
    const response = await fetch('http://localhost:5000/resolved');
    const resolved = await response.json();

    resolvedTable.innerHTML = '';

    resolved.forEach(complaint => {
      const row = resolvedTable.insertRow();
      row.innerHTML = `
        <td>${complaint.id}</td>
        <td>${complaint.type}</td>
        <td>${complaint.location}</td>
        <td>${complaint.priority}</td>
      `;
    });
  } catch (error) {
    console.error('Error fetching resolved complaints:', error);
  }
};

// Submit a new complaint
complaintForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('type').value;
  const location = document.getElementById('location').value;
  const priority = document.getElementById('priority').value;

  try {
    const response = await fetch('http://localhost:5000/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, location, priority })
    });

    const data = await response.json();
    if (response.status === 201) {
      alert(data.message);
      complaintForm.reset();
      fetchComplaints();
      showSection('complaints');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error reporting complaint:', error);
  }
});

// Resolve a complaint
const resolveComplaint = async (id) => {
  try {
    const response = await fetch('http://localhost:5000/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      fetchComplaints();
      fetchResolvedComplaints();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error resolving complaint:', error);
  }
};

// Show selected section only
function showSection(section) {
  document.getElementById('formSection').classList.add('hidden');
  document.getElementById('complaintsSection').classList.add('hidden');
  document.getElementById('resolvedSection').classList.add('hidden');

  if (section === 'form') {
    document.getElementById('formSection').classList.remove('hidden');
  } else if (section === 'complaints') {
    document.getElementById('complaintsSection').classList.remove('hidden');
    fetchComplaints();
  } else if (section === 'resolved') {
    document.getElementById('resolvedSection').classList.remove('hidden');
    fetchResolvedComplaints();
  }
}

// Load default section on page load
document.addEventListener('DOMContentLoaded', () => {
  showSection('form');
});
