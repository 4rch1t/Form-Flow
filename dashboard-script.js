// DOM Elements
const formSelect = document.getElementById('form-select');
const totalSubmissions = document.getElementById('total-submissions');
const lastSubmission = document.getElementById('last-submission');
const avgCompletionTime = document.getElementById('avg-completion-time');
const submissionsTableBody = document.getElementById('submissions-table-body');
const exportCsvBtn = document.getElementById('export-csv-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const submissionModal = document.getElementById('submission-modal');
const submissionDetails = document.getElementById('submission-details');
const closeSubmissionBtn = document.getElementById('close-submission-btn');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentForms = [];
let currentSubmissions = [];
let filteredSubmissions = [];
let selectedFormId = null;

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Set user name
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
        userName.textContent = user.name;
    }
}

// Initialize
checkAuth();
loadForms();

// Add logout event listener
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
});

// Event Listeners
formSelect.addEventListener('change', handleFormChange);
exportCsvBtn.addEventListener('click', exportToCsv);
searchBtn.addEventListener('click', searchSubmissions);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchSubmissions();
    }
});
closeSubmissionBtn.addEventListener('click', closeSubmissionModal);

// Functions
function loadForms() {
    const token = localStorage.getItem('token');
    
    fetch('/api/forms', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load forms');
        }
        return response.json();
    })
    .then(forms => {
        currentForms = forms;
        
        // Clear select options
        formSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a form';
        formSelect.appendChild(defaultOption);
        
        // Add form options
        forms.forEach(form => {
            const option = document.createElement('option');
            option.value = form.id;
            option.textContent = form.title;
            formSelect.appendChild(option);
        });
        
        // If no forms, show message
        if (forms.length === 0) {
            const noFormsOption = document.createElement('option');
            noFormsOption.value = '';
            noFormsOption.textContent = 'No forms available';
            noFormsOption.disabled = true;
            formSelect.appendChild(noFormsOption);
        }
    })
    .catch(error => {
        console.error('Error loading forms:', error);
        // Show error message in select
        formSelect.innerHTML = '<option value="" disabled selected>Error loading forms</option>';
    });
}

function handleFormChange(e) {
    const formId = e.target.value;
    
    if (!formId) {
        // Reset dashboard
        resetDashboard();
        return;
    }
    
    selectedFormId = formId;
    loadSubmissions(formId);
}

function loadSubmissions(formId) {
    const token = localStorage.getItem('token');
    
    fetch(`/api/submissions/${formId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load submissions');
        }
        return response.json();
    })
    .then(submissions => {
        currentSubmissions = submissions;
        filteredSubmissions = [...submissions];
        
        // Update stats
        updateStats(submissions);
        
        // Render submissions table
        renderSubmissionsTable(submissions);
    })
    .catch(error => {
        console.error('Error loading submissions:', error);
        // Show error message
        submissionsTableBody.innerHTML = `
            <tr class="error-row">
                <td colspan="4">
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error loading submissions</p>
                    </div>
                </td>
            </tr>
        `;
    });
}

function updateStats(submissions) {
    // Total submissions
    totalSubmissions.textContent = submissions.length;
    
    // Last submission
    if (submissions.length > 0) {
        const lastDate = new Date(submissions[0].timestamp);
        lastSubmission.textContent = lastDate.toLocaleDateString() + ' ' + lastDate.toLocaleTimeString();
    } else {
        lastSubmission.textContent = 'Never';
    }
    
    // Average completion time (this would require start and end times, which we don't have in this demo)
    avgCompletionTime.textContent = 'N/A';
}

function renderSubmissionsTable(submissions) {
    if (submissions.length === 0) {
        submissionsTableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="4">
                    <div class="empty-message">
                        <i class="fas fa-inbox"></i>
                        <p>No submissions yet</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    submissionsTableBody.innerHTML = '';
    
    submissions.forEach(submission => {
        const row = document.createElement('tr');
        
        // Format date and time
        const date = new Date(submission.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        
        row.innerHTML = `
            <td>${submission.submissionId}</td>
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>
                <button class="view-btn" data-submission-id="${submission.submissionId}">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        
        submissionsTableBody.appendChild(row);
        
        // Add event listener to view button
        const viewBtn = row.querySelector('.view-btn');
        viewBtn.addEventListener('click', () => {
            viewSubmission(submission);
        });
    });
}

function viewSubmission(submission) {
    // Find the form
    const form = currentForms.find(f => f.id === selectedFormId);
    
    if (!form) {
        alert('Form not found');
        return;
    }
    
    // Build submission details HTML
    let detailsHtml = `
        <div class="submission-info">
            <p><strong>Submission ID:</strong> ${submission.submissionId}</p>
            <p><strong>Date:</strong> ${new Date(submission.timestamp).toLocaleString()}</p>
            <p><strong>Form:</strong> ${form.title}</p>
        </div>
        <h3>Responses</h3>
    `;
    
    // Add responses
    submission.responses.forEach(response => {
        // Find the question in the form
        const question = form.questions.find(q => q.id === response.questionId);
        
        detailsHtml += `
            <div class="response-item">
                <div class="question-text">${response.questionText || 'Untitled Question'}</div>
                <div class="response-text">${formatResponse(response)}</div>
            </div>
        `;
    });
    
    // Update modal content
    submissionDetails.innerHTML = detailsHtml;
    
    // Show modal
    submissionModal.style.display = 'flex';
}

function formatResponse(response) {
    if (response.response === null || response.response === undefined) {
        return '<em>No response</em>';
    }
    
    switch (response.questionType) {
        case 'rating':
            return '⭐'.repeat(response.response);
        case 'yes-no':
            return response.response === 'Yes' ? 
                '<span style="color: #27ae60;">Yes</span>' : 
                '<span style="color: #e74c3c;">No</span>';
        default:
            return response.response;
    }
}

function closeSubmissionModal() {
    submissionModal.style.display = 'none';
}

function searchSubmissions() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredSubmissions = [...currentSubmissions];
        renderSubmissionsTable(filteredSubmissions);
        return;
    }
    
    // Filter submissions
    filteredSubmissions = currentSubmissions.filter(submission => {
        // Check submission ID
        if (submission.submissionId.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Check timestamp
        const date = new Date(submission.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        if (dateStr.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Check responses
        return submission.responses.some(response => {
            if (response.response && typeof response.response === 'string') {
                return response.response.toLowerCase().includes(searchTerm);
            }
            return false;
        });
    });
    
    renderSubmissionsTable(filteredSubmissions);
}

function exportToCsv() {
    if (filteredSubmissions.length === 0) {
        alert('No submissions to export');
        return;
    }
    
    // Find the form
    const form = currentForms.find(f => f.id === selectedFormId);
    
    if (!form) {
        alert('Form not found');
        return;
    }
    
    // Create CSV header
    let csvContent = 'Submission ID,Timestamp';
    
    // Add question headers
    form.questions.forEach(question => {
        csvContent += `,${question.question.replace(/,/g, ' ')}`;
    });
    
    csvContent += '\n';
    
    // Add submission rows
    filteredSubmissions.forEach(submission => {
        csvContent += `${submission.submissionId},${submission.timestamp}`;
        
        // Add responses
        form.questions.forEach(question => {
            const response = submission.responses.find(r => r.questionId === question.id);
            let responseText = '';
            
            if (response && response.response !== null) {
                responseText = typeof response.response === 'string' ? 
                    response.response.replace(/,/g, ' ') : response.response;
            }
            
            csvContent += `,${responseText}`;
        });
        
        csvContent += '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${form.title}_submissions.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

function resetDashboard() {
    selectedFormId = null;
    currentSubmissions = [];
    filteredSubmissions = [];
    
    // Reset stats
    totalSubmissions.textContent = '0';
    lastSubmission.textContent = 'Never';
    avgCompletionTime.textContent = 'N/A';
    
    // Reset table
    submissionsTableBody.innerHTML = `
        <tr class="empty-state">
            <td colspan="4">
                <div class="empty-message">
                    <i class="fas fa-inbox"></i>
                    <p>No submissions yet</p>
                </div>
            </td>
        </tr>
    `;
}