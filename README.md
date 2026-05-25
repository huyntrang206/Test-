# ChatGPT Clone

A ChatGPT-like web application with frontend (React) and backend (Node.js/Express with SQLite database).

## Features

- **Chat Interface**: Modern ChatGPT-like UI for conversations
- **Conversation History**: View and manage all your conversations
- **Search**: Search through conversations and messages
- **Create/Edit/Delete**: Full CRUD operations for conversations
- **SQLite Database**: Lightweight database for storing chat data
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
e:\Test\
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── database.js
│   └── chat.db (created automatically)
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js
        ├── App.css
        └── components/
            ├── Sidebar.js
            ├── Sidebar.css
            ├── ChatArea.js
            └── ChatArea.css
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## API Endpoints

### Conversations

- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get single conversation with messages
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:id` - Update conversation title
- `DELETE /api/conversations/:id` - Delete conversation

### Messages

- `POST /api/conversations/:id/messages` - Add message to conversation

### Search

- `GET /api/search?q=query` - Search conversations and messages

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Click "New Chat" to start a new conversation
4. Type your message and press Enter or click Send
5. Use the search bar to find specific conversations
6. Click on conversations in the sidebar to view history
7. Edit conversation titles by clicking the edit icon
8. Delete conversations using the trash icon

## Technology Stack

### Backend
- Node.js
- Express.js
- SQLite3
- CORS
- Body-parser

### Frontend
- React 18
- Lucide React (icons)
- Axios (for API calls)

## Notes

- The AI response is currently simulated. In a production environment, you would integrate with an actual AI API (like OpenAI's GPT API)
- The SQLite database is automatically created in the backend directory
- All data persists between sessions

## Development

For development with auto-reload:
- Backend: `npm run dev` (requires nodemon)
- Frontend: `npm start` (React has built-in hot reload)
