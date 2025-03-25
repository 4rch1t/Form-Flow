const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // In a real app, you would verify the token with JWT
        // For this demo, we'll just check if the token exists in our tokens file
        const tokensPath = path.join(__dirname, 'data', 'tokens.json');
        if (fs.existsSync(tokensPath)) {
            const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
            const user = tokensData.find(t => t.token === token);

            if (!user) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            req.user = user;
            next();
        } else {
            return res.status(403).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// Authentication Routes
app.post('/api/auth/signup', (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        // Check if user already exists
        const usersPath = path.join(dataDir, 'users.json');
        let users = [];

        if (fs.existsSync(usersPath)) {
            users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

            if (users.some(user => user.email === email)) {
                return res.status(400).json({ error: 'User already exists' });
            }
        }

        // Hash password (in a real app, use bcrypt)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Create user
        const userId = `user-${Date.now()}`;
        const newUser = {
            id: userId,
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Save user
        users.push(newUser);
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');

        // Save token
        const tokensPath = path.join(dataDir, 'tokens.json');
        let tokens = [];

        if (fs.existsSync(tokensPath)) {
            tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
        }

        tokens.push({
            userId,
            token,
            createdAt: new Date().toISOString()
        });

        fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

        // Return user data and token (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        // Check if users file exists
        const usersPath = path.join(__dirname, 'data', 'users.json');
        if (!fs.existsSync(usersPath)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Get users
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

        // Hash password
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Find user
        const user = users.find(u => u.email === email && u.password === hashedPassword);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');

        // Save token
        const tokensPath = path.join(__dirname, 'data', 'tokens.json');
        let tokens = [];

        if (fs.existsSync(tokensPath)) {
            tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
        }

        tokens.push({
            userId: user.id,
            token,
            createdAt: new Date().toISOString()
        });

        fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

        // Return user data and token (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// API endpoint to save forms
app.post('/api/forms', authenticateToken, (req, res) => {
    try {
        const form = req.body;
        const userId = req.user.userId;

        // Validate form data
        if (!form || !form.id || !form.title) {
            return res.status(400).json({ error: 'Invalid form data' });
        }

        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        // Create user forms directory if it doesn't exist
        const userFormsDir = path.join(dataDir, 'forms', userId);
        if (!fs.existsSync(path.join(dataDir, 'forms'))) {
            fs.mkdirSync(path.join(dataDir, 'forms'));
        }
        if (!fs.existsSync(userFormsDir)) {
            fs.mkdirSync(userFormsDir);
        }

        // Add user ID to form data
        form.userId = userId;

        // Save form to file
        const filePath = path.join(userFormsDir, `${form.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(form, null, 2));

        res.status(201).json({ message: 'Form saved successfully', formId: form.id });
    } catch (error) {
        console.error('Error saving form:', error);
        res.status(500).json({ error: 'Failed to save form' });
    }
});

// API endpoint to get all forms for a user
app.get('/api/forms', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const userFormsDir = path.join(__dirname, 'data', 'forms', userId);

        // Create directories if they don't exist
        if (!fs.existsSync(path.join(__dirname, 'data'))) {
            fs.mkdirSync(path.join(__dirname, 'data'));
        }
        if (!fs.existsSync(path.join(__dirname, 'data', 'forms'))) {
            fs.mkdirSync(path.join(__dirname, 'data', 'forms'));
        }
        if (!fs.existsSync(userFormsDir)) {
            fs.mkdirSync(userFormsDir);
            return res.json([]);
        }

        // Read all form files
        const files = fs.readdirSync(userFormsDir).filter(file => file.endsWith('.json'));
        const forms = files.map(file => {
            const filePath = path.join(userFormsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileContent);
        });

        res.json(forms);
    } catch (error) {
        console.error('Error getting forms:', error);
        res.status(500).json({ error: 'Failed to get forms' });
    }
});

// API endpoint to get a specific form
app.get('/api/forms/:id', (req, res) => {
    try {
        const formId = req.params.id;

        // First, try to find the form in any user's directory
        const formsDir = path.join(__dirname, 'data', 'forms');
        if (!fs.existsSync(formsDir)) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Get all user directories
        const userDirs = fs.readdirSync(formsDir);
        let formPath = null;

        // Search for the form in each user's directory
        for (const userId of userDirs) {
            const potentialPath = path.join(formsDir, userId, `${formId}.json`);
            if (fs.existsSync(potentialPath)) {
                formPath = potentialPath;
                break;
            }
        }

        if (!formPath) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const fileContent = fs.readFileSync(formPath, 'utf8');
        const form = JSON.parse(fileContent);

        res.json(form);
    } catch (error) {
        console.error('Error getting form:', error);
        res.status(500).json({ error: 'Failed to get form' });
    }
});

// API endpoint to delete a form
app.delete('/api/forms/:id', authenticateToken, (req, res) => {
    try {
        const formId = req.params.id;
        const userId = req.user.userId;
        const filePath = path.join(__dirname, 'data', 'forms', userId, `${formId}.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Form not found' });
        }

        fs.unlinkSync(filePath);

        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

// API endpoint to submit form responses
app.post('/api/submit/:id', (req, res) => {
    try {
        const formId = req.params.id;
        const formResponses = req.body;

        // Validate submission data
        if (!formResponses || !formResponses.responses) {
            return res.status(400).json({ error: 'Invalid submission data' });
        }

        // Find the form in any user's directory
        const formsDir = path.join(__dirname, 'data', 'forms');
        if (!fs.existsSync(formsDir)) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Get all user directories
        const userDirs = fs.readdirSync(formsDir);
        let formPath = null;
        let formOwnerUserId = null;

        // Search for the form in each user's directory
        for (const userId of userDirs) {
            const potentialPath = path.join(formsDir, userId, `${formId}.json`);
            if (fs.existsSync(potentialPath)) {
                formPath = potentialPath;
                formOwnerUserId = userId;
                break;
            }
        }

        if (!formPath) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Create submissions directory structure
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        const submissionsDir = path.join(dataDir, 'submissions');
        if (!fs.existsSync(submissionsDir)) {
            fs.mkdirSync(submissionsDir);
        }

        const userSubmissionsDir = path.join(submissionsDir, formOwnerUserId);
        if (!fs.existsSync(userSubmissionsDir)) {
            fs.mkdirSync(userSubmissionsDir);
        }

        const formSubmissionsDir = path.join(userSubmissionsDir, formId);
        if (!fs.existsSync(formSubmissionsDir)) {
            fs.mkdirSync(formSubmissionsDir);
        }

        // Generate submission ID and timestamp
        const submissionId = `submission-${Date.now()}`;
        formResponses.submissionId = submissionId;
        formResponses.timestamp = new Date().toISOString();

        // Save submission to file
        const submissionFilePath = path.join(formSubmissionsDir, `${submissionId}.json`);
        fs.writeFileSync(submissionFilePath, JSON.stringify(formResponses, null, 2));

        res.status(201).json({ message: 'Form submitted successfully', submissionId });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

// API endpoint to get form submissions
app.get('/api/submissions/:formId', authenticateToken, (req, res) => {
    try {
        const formId = req.params.formId;
        const userId = req.user.userId;

        // Check if form exists and belongs to the user
        const formPath = path.join(__dirname, 'data', 'forms', userId, `${formId}.json`);
        if (!fs.existsSync(formPath)) {
            return res.status(404).json({ error: 'Form not found or unauthorized' });
        }

        // Check if submissions directory exists
        const submissionsDir = path.join(__dirname, 'data', 'submissions', userId, formId);
        if (!fs.existsSync(submissionsDir)) {
            return res.json([]);
        }

        // Read all submission files
        const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'));
        const submissions = files.map(file => {
            const filePath = path.join(submissionsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileContent);
        });

        // Sort submissions by timestamp (newest first)
        submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(submissions);
    } catch (error) {
        console.error('Error getting submissions:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});