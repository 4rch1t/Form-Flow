// Get form ID from URL
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('id');

// DOM Elements
const formTitle = document.getElementById('form-title');
const formContent = document.getElementById('form-content');
const submitFormBtn = document.getElementById('submit-form-btn');
const successMessage = document.getElementById('success-message');
const closeSuccessBtn = document.getElementById('close-success-btn');

// State
let currentForm = null;
let formResponses = {};

// Initialize
if (formId) {
    loadForm(formId);
} else {
    showError('No form ID provided');
}

// Event Listeners
submitFormBtn.addEventListener('click', submitForm);
closeSuccessBtn.addEventListener('click', closeSuccessMessage);

// Functions
function loadForm(formId) {
    fetch(`/api/forms/${formId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Form not found');
            }
            return response.json();
        })
        .then(form => {
            currentForm = form;
            renderForm();
        })
        .catch(error => {
            console.error('Error loading form:', error);
            showError('Failed to load form. Please try again later.');
        });
}

function renderForm() {
    // Set form title
    formTitle.textContent = currentForm.title;
    
    // Clear loading state
    formContent.innerHTML = '';
    
    // Render questions
    currentForm.questions.forEach(question => {
        const questionElement = createQuestionElement(question);
        formContent.appendChild(questionElement);
    });
}

function createQuestionElement(question) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.setAttribute('data-question-id', question.id);
    
    // Create question text
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.question || 'Untitled Question';
    
    // Add required indicator if needed
    if (question.required) {
        const requiredSpan = document.createElement('span');
        requiredSpan.className = 'required';
        requiredSpan.textContent = '*';
        questionText.appendChild(requiredSpan);
    }
    
    questionDiv.appendChild(questionText);
    
    // Create input based on question type
    let inputElement;
    
    switch (question.type) {
        case 'short-text':
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'question-input';
            inputElement.setAttribute('data-question-id', question.id);
            inputElement.placeholder = 'Your answer';
            
            if (question.required) {
                inputElement.setAttribute('required', 'true');
            }
            
            // Add event listener to update responses
            inputElement.addEventListener('input', (e) => {
                updateResponse(question.id, e.target.value);
            });
            
            questionDiv.appendChild(inputElement);
            
            // Add error message element
            const errorElement = document.createElement('div');
            errorElement.className = 'error';
            errorElement.textContent = 'This field is required';
            errorElement.setAttribute('data-error-for', question.id);
            questionDiv.appendChild(errorElement);
            break;
            
        case 'long-text':
            inputElement = document.createElement('textarea');
            inputElement.className = 'question-input';
            inputElement.setAttribute('data-question-id', question.id);
            inputElement.placeholder = 'Your answer';
            inputElement.rows = 4;
            
            if (question.required) {
                inputElement.setAttribute('required', 'true');
            }
            
            // Add event listener to update responses
            inputElement.addEventListener('input', (e) => {
                updateResponse(question.id, e.target.value);
            });
            
            questionDiv.appendChild(inputElement);
            
            // Add error message element
            const textareaError = document.createElement('div');
            textareaError.className = 'error';
            textareaError.textContent = 'This field is required';
            textareaError.setAttribute('data-error-for', question.id);
            questionDiv.appendChild(textareaError);
            break;
            
        case 'multiple-choice':
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            
            (question.options || []).forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question-${question.id}`;
                radio.id = `option-${question.id}-${index}`;
                radio.value = option;
                
                if (question.required) {
                    radio.setAttribute('required', 'true');
                }
                
                // Add event listener to update responses
                radio.addEventListener('change', () => {
                    updateResponse(question.id, option);
                });
                
                const label = document.createElement('label');
                label.htmlFor = `option-${question.id}-${index}`;
                label.textContent = option;
                
                optionDiv.appendChild(radio);
                optionDiv.appendChild(label);
                optionsDiv.appendChild(optionDiv);
            });
            
            questionDiv.appendChild(optionsDiv);
            
            // Add error message element
            const radioError = document.createElement('div');
            radioError.className = 'error';
            radioError.textContent = 'Please select an option';
            radioError.setAttribute('data-error-for', question.id);
            questionDiv.appendChild(radioError);
            break;
            
        case 'yes-no':
            const yesNoDiv = document.createElement('div');
            yesNoDiv.className = 'options';
            
            // Yes option
            const yesDiv = document.createElement('div');
            yesDiv.className = 'option';
            
            const yesRadio = document.createElement('input');
            yesRadio.type = 'radio';
            yesRadio.name = `question-${question.id}`;
            yesRadio.id = `yes-${question.id}`;
            yesRadio.value = 'Yes';
            
            if (question.required) {
                yesRadio.setAttribute('required', 'true');
            }
            
            // Add event listener to update responses
            yesRadio.addEventListener('change', () => {
                updateResponse(question.id, 'Yes');
            });
            
            const yesLabel = document.createElement('label');
            yesLabel.htmlFor = `yes-${question.id}`;
            yesLabel.textContent = 'Yes';
            
            yesDiv.appendChild(yesRadio);
            yesDiv.appendChild(yesLabel);
            
            // No option
            const noDiv = document.createElement('div');
            noDiv.className = 'option';
            
            const noRadio = document.createElement('input');
            noRadio.type = 'radio';
            noRadio.name = `question-${question.id}`;
            noRadio.id = `no-${question.id}`;
            noRadio.value = 'No';
            
            // Add event listener to update responses
            noRadio.addEventListener('change', () => {
                updateResponse(question.id, 'No');
            });
            
            const noLabel = document.createElement('label');
            noLabel.htmlFor = `no-${question.id}`;
            noLabel.textContent = 'No';
            
            noDiv.appendChild(noRadio);
            noDiv.appendChild(noLabel);
            
            yesNoDiv.appendChild(yesDiv);
            yesNoDiv.appendChild(noDiv);
            questionDiv.appendChild(yesNoDiv);
            
            // Add error message element
            const yesNoError = document.createElement('div');
            yesNoError.className = 'error';
            yesNoError.textContent = 'Please select an option';
            yesNoError.setAttribute('data-error-for', question.id);
            questionDiv.appendChild(yesNoError);
            break;
            
        case 'rating':
            const ratingDiv = document.createElement('div');
            ratingDiv.className = 'rating';
            ratingDiv.setAttribute('data-question-id', question.id);
            
            const maxRating = question.maxRating || 5;
            for (let i = 1; i <= maxRating; i++) {
                const star = document.createElement('span');
                star.innerHTML = '<i class="far fa-star"></i>';
                star.setAttribute('data-rating', i);
                
                // Add event listener to update responses
                star.addEventListener('click', () => {
                    // Update UI
                    const stars = ratingDiv.querySelectorAll('span');
                    stars.forEach(s => {
                        const rating = parseInt(s.getAttribute('data-rating'));
                        if (rating <= i) {
                            s.innerHTML = '<i class="fas fa-star"></i>';
                            s.classList.add('active');
                        } else {
                            s.innerHTML = '<i class="far fa-star"></i>';
                            s.classList.remove('active');
                        }
                    });
                    
                    // Update response
                    updateResponse(question.id, i);
                });
                
                ratingDiv.appendChild(star);
            }
            
            questionDiv.appendChild(ratingDiv);
            
            // Add error message element
            const ratingError = document.createElement('div');
            ratingError.className = 'error';
            ratingError.textContent = 'Please select a rating';
            ratingError.setAttribute('data-error-for', question.id);
            questionDiv.appendChild(ratingError);
            break;
            
        case 'date':
            inputElement = document.createElement('input');
            inputElement.type = 'date';
            inputElement.className = 'question-input';
            inputElement.setAttribute('data-question-id', question.id);
            
            if (question.required) {
                inputElement.setAttribute('required', 'true');
            }
            
            // Add event listener to update responses
            inputElement.addEventListener('input', (e) => {
                updateResponse(question.id, e.target.value);
            });
            
            questionDiv.appendChild(inputElement);
            
            // Add error message element
            const dateError = document.createElement('div');
            dateError.className = 'error';
            dateError.textContent = 'Please select a date';
            dateError.setAttribute('data-error-for', question.id);
            questionDiv.appendChild(dateError);
            break;
    }
    
    return questionDiv;
}

function updateResponse(questionId, value) {
    formResponses[questionId] = value;
    
    // Hide error message if any
    const errorElement = document.querySelector(`[data-error-for="${questionId}"]`);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function submitForm() {
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Prepare submission data
    const submissionData = {
        formId: currentForm.id,
        formTitle: currentForm.title,
        responses: []
    };

    // Format responses
    currentForm.questions.forEach(question => {
        submissionData.responses.push({
            questionId: question.id,
            questionText: question.question,
            questionType: question.type,
            response: formResponses[question.id] || null
        });
    });

    // Disable submit button and show loading state
    submitFormBtn.disabled = true;
    submitFormBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    // Send data to server
    fetch(`/api/submit/${currentForm.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit form');
        }
        return response.json();
    })
    .then(data => {
        console.log('Form submission successful:', data);

        // Show success message
        showSuccessMessage();
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        alert('Failed to submit form. Please try again.');

        // Reset submit button
        submitFormBtn.disabled = false;
        submitFormBtn.innerHTML = 'Submit';
    });
}

function validateForm() {
    let isValid = true;
    
    // Check each required question
    currentForm.questions.forEach(question => {
        if (question.required) {
            const response = formResponses[question.id];
            const errorElement = document.querySelector(`[data-error-for="${question.id}"]`);
            
            if (!response) {
                isValid = false;
                
                // Show error message
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
                
                // Highlight input
                const inputElement = document.querySelector(`[data-question-id="${question.id}"]`);
                if (inputElement) {
                    inputElement.classList.add('error-input');
                    
                    // Scroll to the first error
                    if (!isValid) {
                        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else {
                // Hide error message
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
                
                // Remove highlight
                const inputElement = document.querySelector(`[data-question-id="${question.id}"]`);
                if (inputElement) {
                    inputElement.classList.remove('error-input');
                }
            }
        }
    });
    
    return isValid;
}

function showSuccessMessage() {
    successMessage.style.display = 'flex';
}

function closeSuccessMessage() {
    successMessage.style.display = 'none';
    
    // In a real application, you might redirect to a thank you page or back to the form list
    window.location.href = '/';
}

function showError(message) {
    formContent.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <a href="/" class="back-link">Back to Home</a>
        </div>
    `;
    
    // Hide submit button
    submitFormBtn.style.display = 'none';
}