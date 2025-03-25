// DOM Elements
const formBuilder = document.getElementById('form-builder');
const formQuestions = document.getElementById('form-questions');
const addQuestionBtn = document.getElementById('add-question-btn');
const questionTypesPanel = document.getElementById('question-types-panel');
const formsList = document.getElementById('forms-list');
const newFormBtn = document.getElementById('new-form-btn');
const saveFormBtn = document.getElementById('save-form-btn');
const previewFormBtn = document.getElementById('preview-form-btn');
const shareFormBtn = document.getElementById('share-form-btn');
const previewModal = document.getElementById('preview-modal');
const previewForm = document.getElementById('preview-form');
const closePreviewBtn = document.getElementById('close-preview-btn');
const formTitleInput = document.getElementById('form-title');
const shareModal = document.getElementById('share-modal');
const closeShareBtn = document.getElementById('close-share-btn');
const shareLink = document.getElementById('share-link');
const copyLinkBtn = document.getElementById('copy-link-btn');
const copySuccess = document.getElementById('copy-success');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentForm = {
    id: generateId(),
    title: 'Untitled Form',
    questions: []
};

let forms = loadForms();
let questionCounter = 0;

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
renderFormsList();

// Add logout event listener
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
});

// Event Listeners
addQuestionBtn.addEventListener('click', toggleQuestionTypesPanel);

// Add event listeners for question type selection
document.querySelectorAll('.question-type').forEach(type => {
    type.addEventListener('click', () => {
        const questionType = type.getAttribute('data-type');
        addQuestion(questionType);
        questionTypesPanel.style.display = 'none';
    });
});

newFormBtn.addEventListener('click', createNewForm);
saveFormBtn.addEventListener('click', saveCurrentForm);
previewFormBtn.addEventListener('click', previewCurrentForm);
shareFormBtn.addEventListener('click', shareForm);
closePreviewBtn.addEventListener('click', closePreview);
closeShareBtn.addEventListener('click', closeShareModal);
copyLinkBtn.addEventListener('click', copyShareLink);
formTitleInput.addEventListener('input', updateFormTitle);

// Functions
function toggleQuestionTypesPanel() {
    if (questionTypesPanel.style.display === 'none') {
        questionTypesPanel.style.display = 'block';
    } else {
        questionTypesPanel.style.display = 'none';
    }
}

function addQuestion(type) {
    questionCounter++;
    const questionId = `question-${questionCounter}`;
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.id = questionId;
    
    let questionContent = '';
    let questionData = {
        id: questionId,
        type: type,
        question: '',
        required: false
    };
    
    // Create different question types
    switch (type) {
        case 'short-text':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionId}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox"> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <input type="text" disabled placeholder="Short text answer" class="preview-input">
                </div>
            `;
            break;
            
        case 'long-text':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionId}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox"> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <textarea disabled placeholder="Long text answer" rows="3" class="preview-input"></textarea>
                </div>
            `;
            break;
            
        case 'multiple-choice':
            questionData.options = ['Option 1', 'Option 2'];
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionId}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox"> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <div class="options-list" data-question-id="${questionId}">
                        <div class="option-item">
                            <input type="text" value="Option 1" class="option-text">
                            <button class="remove-option-btn"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="option-item">
                            <input type="text" value="Option 2" class="option-text">
                            <button class="remove-option-btn"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <button class="add-option-btn" data-question-id="${questionId}">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
            `;
            break;
            
        case 'yes-no':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionId}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox"> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <div class="yes-no-options">
                        <label>
                            <input type="radio" name="preview-${questionId}" disabled> Yes
                        </label>
                        <label>
                            <input type="radio" name="preview-${questionId}" disabled> No
                        </label>
                    </div>
                </div>
            `;
            break;
            
        case 'rating':
            questionData.maxRating = 5;
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionId}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox"> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <div class="rating-options">
                        <div class="rating-scale">
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                        </div>
                        <div class="rating-config">
                            <label>
                                Max rating:
                                <select class="max-rating" data-question-id="${questionId}">
                                    <option value="5" selected>5</option>
                                    <option value="10">10</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'date':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionId}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox"> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <input type="date" disabled class="preview-input">
                </div>
            `;
            break;
    }
    
    // Add question actions
    questionContent += `
        <div class="question-actions">
            <button class="duplicate-question" data-question-id="${questionId}"><i class="fas fa-copy"></i></button>
            <button class="delete-question" data-question-id="${questionId}"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    questionCard.innerHTML = questionContent;
    formQuestions.appendChild(questionCard);
    
    // Add event listeners for the new question
    const questionTextInput = questionCard.querySelector('.question-text');
    questionTextInput.addEventListener('input', (e) => {
        updateQuestionText(questionId, e.target.value);
    });
    
    const requiredCheckbox = questionCard.querySelector('.required-checkbox');
    requiredCheckbox.addEventListener('change', (e) => {
        updateQuestionRequired(questionId, e.target.checked);
    });
    
    const deleteBtn = questionCard.querySelector('.delete-question');
    deleteBtn.addEventListener('click', () => {
        deleteQuestion(questionId);
    });
    
    const duplicateBtn = questionCard.querySelector('.duplicate-question');
    duplicateBtn.addEventListener('click', () => {
        duplicateQuestion(questionId);
    });
    
    // Add specific event listeners based on question type
    if (type === 'multiple-choice') {
        const addOptionBtn = questionCard.querySelector('.add-option-btn');
        addOptionBtn.addEventListener('click', () => {
            addOption(questionId);
        });
        
        // Add event listeners for existing remove option buttons
        questionCard.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeOption(questionId, e.target.closest('.option-item'));
            });
        });
    }
    
    if (type === 'rating') {
        const maxRatingSelect = questionCard.querySelector('.max-rating');
        maxRatingSelect.addEventListener('change', (e) => {
            updateMaxRating(questionId, parseInt(e.target.value));
        });
    }
    
    // Add question to current form
    currentForm.questions.push(questionData);
}

function updateQuestionText(questionId, text) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        currentForm.questions[questionIndex].question = text;
    }
}

function updateQuestionRequired(questionId, required) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        currentForm.questions[questionIndex].required = required;
    }
}

function deleteQuestion(questionId) {
    // Remove from DOM
    const questionCard = document.getElementById(questionId);
    if (questionCard) {
        questionCard.remove();
    }
    
    // Remove from state
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        currentForm.questions.splice(questionIndex, 1);
    }
}

function duplicateQuestion(questionId) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        const originalQuestion = currentForm.questions[questionIndex];
        addQuestion(originalQuestion.type);
        
        // Copy properties to the new question (which is the last one added)
        const newQuestion = currentForm.questions[currentForm.questions.length - 1];
        const newQuestionElement = document.getElementById(newQuestion.id);
        
        // Update question text
        newQuestion.question = originalQuestion.question;
        const questionTextInput = newQuestionElement.querySelector('.question-text');
        questionTextInput.value = originalQuestion.question;
        
        // Update required status
        newQuestion.required = originalQuestion.required;
        const requiredCheckbox = newQuestionElement.querySelector('.required-checkbox');
        requiredCheckbox.checked = originalQuestion.required;
        
        // Handle specific question type properties
        if (originalQuestion.type === 'multiple-choice' && originalQuestion.options) {
            // Remove default options
            const optionsList = newQuestionElement.querySelector('.options-list');
            optionsList.innerHTML = '';
            
            // Add copied options
            newQuestion.options = [...originalQuestion.options];
            newQuestion.options.forEach(optionText => {
                const optionItem = document.createElement('div');
                optionItem.className = 'option-item';
                optionItem.innerHTML = `
                    <input type="text" value="${optionText}" class="option-text">
                    <button class="remove-option-btn"><i class="fas fa-times"></i></button>
                `;
                optionsList.appendChild(optionItem);
                
                // Add event listener for the remove button
                const removeBtn = optionItem.querySelector('.remove-option-btn');
                removeBtn.addEventListener('click', () => {
                    removeOption(newQuestion.id, optionItem);
                });
            });
        }
        
        if (originalQuestion.type === 'rating' && originalQuestion.maxRating) {
            newQuestion.maxRating = originalQuestion.maxRating;
            const maxRatingSelect = newQuestionElement.querySelector('.max-rating');
            maxRatingSelect.value = originalQuestion.maxRating;
        }
    }
}

function addOption(questionId) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        const optionsList = document.querySelector(`.options-list[data-question-id="${questionId}"]`);
        const optionCount = optionsList.children.length + 1;
        
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.innerHTML = `
            <input type="text" value="Option ${optionCount}" class="option-text">
            <button class="remove-option-btn"><i class="fas fa-times"></i></button>
        `;
        optionsList.appendChild(optionItem);
        
        // Add event listener for the remove button
        const removeBtn = optionItem.querySelector('.remove-option-btn');
        removeBtn.addEventListener('click', () => {
            removeOption(questionId, optionItem);
        });
        
        // Add event listener for the text input
        const textInput = optionItem.querySelector('.option-text');
        textInput.addEventListener('input', () => {
            updateOptions(questionId);
        });
        
        // Update options in state
        if (!currentForm.questions[questionIndex].options) {
            currentForm.questions[questionIndex].options = [];
        }
        currentForm.questions[questionIndex].options.push(`Option ${optionCount}`);
    }
}

function removeOption(questionId, optionElement) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1 && currentForm.questions[questionIndex].options) {
        const optionsList = optionElement.parentElement;
        const optionIndex = Array.from(optionsList.children).indexOf(optionElement);
        
        // Remove from state
        currentForm.questions[questionIndex].options.splice(optionIndex, 1);
        
        // Remove from DOM
        optionElement.remove();
    }
}

function updateOptions(questionId) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        const optionsList = document.querySelector(`.options-list[data-question-id="${questionId}"]`);
        const optionInputs = optionsList.querySelectorAll('.option-text');
        
        // Update options in state
        currentForm.questions[questionIndex].options = Array.from(optionInputs).map(input => input.value);
    }
}

function updateMaxRating(questionId, maxRating) {
    const questionIndex = currentForm.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        currentForm.questions[questionIndex].maxRating = maxRating;
    }
}

function createNewForm() {
    // Save current form if it has questions
    if (currentForm.questions.length > 0) {
        saveCurrentForm();
    }
    
    // Create new form
    currentForm = {
        id: generateId(),
        title: 'Untitled Form',
        questions: []
    };
    
    // Reset UI
    formTitleInput.value = currentForm.title;
    formQuestions.innerHTML = '';
    questionCounter = 0;
}

function saveCurrentForm() {
    // Don't save empty forms
    if (currentForm.questions.length === 0) {
        return;
    }

    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to save forms');
        window.location.href = '/login';
        return;
    }

    // Save to server
    fetch('/api/forms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentForm),
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Unauthorized, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Unauthorized');
            }
            throw new Error('Failed to save form');
        }
        return response.json();
    })
    .then(data => {
        // Check if form already exists
        const existingFormIndex = forms.findIndex(form => form.id === currentForm.id);

        if (existingFormIndex !== -1) {
            // Update existing form
            forms[existingFormIndex] = {...currentForm};
        } else {
            // Add new form
            forms.push({...currentForm});
        }

        // Update forms list
        renderFormsList();

        // Show success message
        alert('Form saved successfully!');
    })
    .catch(error => {
        console.error('Error saving form:', error);
        if (error.message !== 'Unauthorized') {
            alert('Failed to save form. Please try again.');
        }
    });
}

function loadForm(formId) {
    // Save current form if it has questions
    if (currentForm.questions.length > 0) {
        saveCurrentForm();
    }

    // Fetch form from server
    fetch(`/api/forms/${formId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load form');
            }
            return response.json();
        })
        .then(form => {
            // Load selected form
            currentForm = {...form};

            // Update UI
            formTitleInput.value = currentForm.title;
            formQuestions.innerHTML = '';

            // Reset question counter
            questionCounter = 0;

            // Find the highest question number to set the counter correctly
            currentForm.questions.forEach(question => {
                const match = question.id.match(/question-(\d+)/);
                if (match && parseInt(match[1]) > questionCounter) {
                    questionCounter = parseInt(match[1]);
                }
            });

            // Recreate questions
            currentForm.questions.forEach(question => {
                addQuestionFromData(question);
            });
        })
        .catch(error => {
            console.error('Error loading form:', error);
            alert('Failed to load form. Please try again.');

            // Fallback to local cache
            const form = forms.find(f => f.id === formId);
            if (form) {
                currentForm = {...form};
                formTitleInput.value = currentForm.title;
                formQuestions.innerHTML = '';
                questionCounter = 0;

                currentForm.questions.forEach(question => {
                    const match = question.id.match(/question-(\d+)/);
                    if (match && parseInt(match[1]) > questionCounter) {
                        questionCounter = parseInt(match[1]);
                    }
                });

                currentForm.questions.forEach(question => {
                    addQuestionFromData(question);
                });
            }
        });
}

function addQuestionFromData(questionData) {
    // Create question element
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.id = questionData.id;
    
    let questionContent = '';
    
    // Create different question types
    switch (questionData.type) {
        case 'short-text':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionData.id}" value="${questionData.question || ''}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox" ${questionData.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <input type="text" disabled placeholder="Short text answer" class="preview-input">
                </div>
            `;
            break;
            
        case 'long-text':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionData.id}" value="${questionData.question || ''}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox" ${questionData.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <textarea disabled placeholder="Long text answer" rows="3" class="preview-input"></textarea>
                </div>
            `;
            break;
            
        case 'multiple-choice':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionData.id}" value="${questionData.question || ''}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox" ${questionData.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <div class="options-list" data-question-id="${questionData.id}">
                        ${(questionData.options || ['Option 1', 'Option 2']).map(option => `
                            <div class="option-item">
                                <input type="text" value="${option}" class="option-text">
                                <button class="remove-option-btn"><i class="fas fa-times"></i></button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-option-btn" data-question-id="${questionData.id}">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
            `;
            break;
            
        case 'yes-no':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionData.id}" value="${questionData.question || ''}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox" ${questionData.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <div class="yes-no-options">
                        <label>
                            <input type="radio" name="preview-${questionData.id}" disabled> Yes
                        </label>
                        <label>
                            <input type="radio" name="preview-${questionData.id}" disabled> No
                        </label>
                    </div>
                </div>
            `;
            break;
            
        case 'rating':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionData.id}" value="${questionData.question || ''}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox" ${questionData.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <div class="rating-options">
                        <div class="rating-scale">
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                            <span><i class="far fa-star"></i></span>
                        </div>
                        <div class="rating-config">
                            <label>
                                Max rating:
                                <select class="max-rating" data-question-id="${questionData.id}">
                                    <option value="5" ${(!questionData.maxRating || questionData.maxRating === 5) ? 'selected' : ''}>5</option>
                                    <option value="10" ${questionData.maxRating === 10 ? 'selected' : ''}>10</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'date':
            questionContent = `
                <div class="question-header">
                    <input type="text" class="question-text" placeholder="Enter your question" data-question-id="${questionData.id}" value="${questionData.question || ''}">
                    <div class="question-required">
                        <label>
                            <input type="checkbox" class="required-checkbox" ${questionData.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
                <div class="question-content">
                    <input type="date" disabled class="preview-input">
                </div>
            `;
            break;
    }
    
    // Add question actions
    questionContent += `
        <div class="question-actions">
            <button class="duplicate-question" data-question-id="${questionData.id}"><i class="fas fa-copy"></i></button>
            <button class="delete-question" data-question-id="${questionData.id}"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    questionCard.innerHTML = questionContent;
    formQuestions.appendChild(questionCard);
    
    // Add event listeners for the question
    const questionTextInput = questionCard.querySelector('.question-text');
    questionTextInput.addEventListener('input', (e) => {
        updateQuestionText(questionData.id, e.target.value);
    });
    
    const requiredCheckbox = questionCard.querySelector('.required-checkbox');
    requiredCheckbox.addEventListener('change', (e) => {
        updateQuestionRequired(questionData.id, e.target.checked);
    });
    
    const deleteBtn = questionCard.querySelector('.delete-question');
    deleteBtn.addEventListener('click', () => {
        deleteQuestion(questionData.id);
    });
    
    const duplicateBtn = questionCard.querySelector('.duplicate-question');
    duplicateBtn.addEventListener('click', () => {
        duplicateQuestion(questionData.id);
    });
    
    // Add specific event listeners based on question type
    if (questionData.type === 'multiple-choice') {
        const addOptionBtn = questionCard.querySelector('.add-option-btn');
        addOptionBtn.addEventListener('click', () => {
            addOption(questionData.id);
        });
        
        // Add event listeners for existing remove option buttons
        questionCard.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeOption(questionData.id, e.target.closest('.option-item'));
            });
        });
        
        // Add event listeners for option text inputs
        questionCard.querySelectorAll('.option-text').forEach(input => {
            input.addEventListener('input', () => {
                updateOptions(questionData.id);
            });
        });
    }
    
    if (questionData.type === 'rating') {
        const maxRatingSelect = questionCard.querySelector('.max-rating');
        maxRatingSelect.addEventListener('change', (e) => {
            updateMaxRating(questionData.id, parseInt(e.target.value));
        });
    }
}

function renderFormsList() {
    formsList.innerHTML = '';
    
    if (forms.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No forms yet';
        emptyMessage.style.backgroundColor = 'transparent';
        formsList.appendChild(emptyMessage);
        return;
    }
    
    forms.forEach(form => {
        const formItem = document.createElement('li');
        formItem.textContent = form.title;
        formItem.setAttribute('data-form-id', form.id);
        formItem.addEventListener('click', () => {
            loadForm(form.id);
        });
        formsList.appendChild(formItem);
    });
}

function previewCurrentForm() {
    if (currentForm.questions.length === 0) {
        alert('Please add at least one question to preview the form.');
        return;
    }
    
    previewForm.innerHTML = '';
    
    // Add form title
    const titleElement = document.createElement('h2');
    titleElement.textContent = currentForm.title;
    titleElement.style.marginBottom = '30px';
    previewForm.appendChild(titleElement);
    
    // Add questions
    currentForm.questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'preview-question';
        
        const questionTitle = document.createElement('h3');
        questionTitle.textContent = question.question || 'Untitled Question';
        if (question.required) {
            const requiredSpan = document.createElement('span');
            requiredSpan.textContent = ' *';
            requiredSpan.style.color = '#e74c3c';
            questionTitle.appendChild(requiredSpan);
        }
        questionElement.appendChild(questionTitle);
        
        let inputElement;
        
        switch (question.type) {
            case 'short-text':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Your answer';
                questionElement.appendChild(inputElement);
                break;
                
            case 'long-text':
                inputElement = document.createElement('textarea');
                inputElement.rows = 3;
                inputElement.placeholder = 'Your answer';
                questionElement.appendChild(inputElement);
                break;
                
            case 'multiple-choice':
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                
                (question.options || []).forEach((option, index) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `preview-${question.id}`;
                    radio.id = `preview-${question.id}-option-${index}`;
                    
                    const label = document.createElement('label');
                    label.htmlFor = `preview-${question.id}-option-${index}`;
                    label.textContent = option;
                    
                    optionDiv.appendChild(radio);
                    optionDiv.appendChild(label);
                    optionsDiv.appendChild(optionDiv);
                });
                
                questionElement.appendChild(optionsDiv);
                break;
                
            case 'yes-no':
                const yesNoDiv = document.createElement('div');
                yesNoDiv.className = 'options';
                
                // Yes option
                const yesDiv = document.createElement('div');
                yesDiv.className = 'option';
                
                const yesRadio = document.createElement('input');
                yesRadio.type = 'radio';
                yesRadio.name = `preview-${question.id}`;
                yesRadio.id = `preview-${question.id}-yes`;
                
                const yesLabel = document.createElement('label');
                yesLabel.htmlFor = `preview-${question.id}-yes`;
                yesLabel.textContent = 'Yes';
                
                yesDiv.appendChild(yesRadio);
                yesDiv.appendChild(yesLabel);
                
                // No option
                const noDiv = document.createElement('div');
                noDiv.className = 'option';
                
                const noRadio = document.createElement('input');
                noRadio.type = 'radio';
                noRadio.name = `preview-${question.id}`;
                noRadio.id = `preview-${question.id}-no`;
                
                const noLabel = document.createElement('label');
                noLabel.htmlFor = `preview-${question.id}-no`;
                noLabel.textContent = 'No';
                
                noDiv.appendChild(noRadio);
                noDiv.appendChild(noLabel);
                
                yesNoDiv.appendChild(yesDiv);
                yesNoDiv.appendChild(noDiv);
                questionElement.appendChild(yesNoDiv);
                break;
                
            case 'rating':
                const ratingDiv = document.createElement('div');
                ratingDiv.className = 'rating-preview';
                
                const maxRating = question.maxRating || 5;
                for (let i = 1; i <= maxRating; i++) {
                    const star = document.createElement('span');
                    star.innerHTML = '<i class="far fa-star"></i>';
                    star.style.fontSize = '24px';
                    star.style.cursor = 'pointer';
                    star.style.margin = '0 5px';
                    
                    // Add hover effect
                    star.addEventListener('mouseover', () => {
                        // Highlight this star and all previous stars
                        const stars = ratingDiv.querySelectorAll('span');
                        for (let j = 0; j < stars.length; j++) {
                            if (j <= i - 1) {
                                stars[j].innerHTML = '<i class="fas fa-star"></i>';
                            } else {
                                stars[j].innerHTML = '<i class="far fa-star"></i>';
                            }
                        }
                    });
                    
                    ratingDiv.appendChild(star);
                }
                
                // Reset on mouseout
                ratingDiv.addEventListener('mouseout', () => {
                    const stars = ratingDiv.querySelectorAll('span');
                    stars.forEach(star => {
                        star.innerHTML = '<i class="far fa-star"></i>';
                    });
                });
                
                questionElement.appendChild(ratingDiv);
                break;
                
            case 'date':
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                questionElement.appendChild(inputElement);
                break;
        }
        
        previewForm.appendChild(questionElement);
    });
    
    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'primary-btn';
    submitButton.style.marginTop = '30px';
    submitButton.addEventListener('click', () => {
        alert('This is just a preview. In a real form, this would submit the responses.');
    });
    previewForm.appendChild(submitButton);
    
    // Show preview modal
    previewModal.style.display = 'flex';
}

function closePreview() {
    previewModal.style.display = 'none';
}

function shareForm() {
    // Check if form has been saved
    if (currentForm.questions.length === 0) {
        alert('Please add at least one question before sharing the form.');
        return;
    }

    // Make sure form is saved first
    saveCurrentForm();

    // Generate share link
    const formUrl = `${window.location.origin}/form?id=${currentForm.id}`;
    shareLink.value = formUrl;

    // Show share modal
    shareModal.style.display = 'flex';
}

function closeShareModal() {
    shareModal.style.display = 'none';
    copySuccess.style.display = 'none';
}

function copyShareLink() {
    // Select the text
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text
    document.execCommand('copy');

    // Show success message
    copySuccess.style.display = 'block';

    // Hide success message after 3 seconds
    setTimeout(() => {
        copySuccess.style.display = 'none';
    }, 3000);
}

function updateFormTitle(e) {
    currentForm.title = e.target.value;
}

function loadForms() {
    // Initialize with empty array
    let savedForms = [];

    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
        return savedForms;
    }

    // Try to fetch forms from server
    fetch('/api/forms', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Unauthorized, redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Unauthorized');
                }
                throw new Error('Failed to load forms');
            }
            return response.json();
        })
        .then(data => {
            forms = data;
            renderFormsList();
        })
        .catch(error => {
            console.error('Error loading forms:', error);
        });

    return savedForms;
}

function generateId() {
    return 'form-' + Math.random().toString(36).substr(2, 9);
}