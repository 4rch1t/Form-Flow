# FormFlow - Typeform Clone

FormFlow is a simple Typeform clone that focuses on the form creation feature. It allows users to create interactive forms with various question types, customize them, and preview how they will look to respondents.

## Features

- Create forms with different question types:
  - Short text
  - Long text
  - Multiple choice
  - Yes/No
  - Rating
  - Date
- Customize questions (required/optional)
- Preview forms
- Save and edit forms
- Simple and intuitive user interface

## Question Types

1. **Short Text**: For brief text responses
2. **Long Text**: For longer, paragraph-style responses
3. **Multiple Choice**: For selecting from predefined options
4. **Yes/No**: Simple yes or no questions
5. **Rating**: Star-based rating system (5 or 10 stars)
6. **Date**: For date selection

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/formflow.git
   cd formflow
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development

For development with auto-restart:
```
npm run dev
```

## Usage

1. **Creating a Form**:
   - Click "Create New Form" in the sidebar
   - Add a title to your form
   - Click "Add Question" to add different question types
   - Configure each question as needed

2. **Editing Questions**:
   - Type your question text
   - Check "Required" if the question must be answered
   - For Multiple Choice questions, add or remove options
   - For Rating questions, select the maximum rating (5 or 10)

3. **Previewing Forms**:
   - Click the "Preview" button to see how your form will appear to respondents

4. **Saving Forms**:
   - Click the "Save" button to save your form
   - Your form will appear in the sidebar list

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js
- React

## Project Structure

- `index.html`: Main HTML file
- `styles.css`: CSS styles
- `script.js`: Client-side JavaScript
- `server.js`: Node.js/Express server
- `data/`: Directory where form data is stored

## License

MIT

## Acknowledgements

This project is inspired by [Typeform](https://www.typeform.com/) but is a simplified version focusing on the form creation aspect.
