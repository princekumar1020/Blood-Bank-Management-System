# Blood Bank Management System

This is the central repository for the MERN stack Blood Bank Management project.

## Installed Packages

### Backend Dependencies (`/backend`)
* **express**: The core web framework for routing and handling HTTP requests.
* **mongoose**: The Object Data Modeling (ODM) library used to connect to and interact with MongoDB.
* **cors**: Middleware that allows our React frontend to securely make API requests to this backend.
* **dotenv**: Loads secure environment variables (like database URIs and port numbers) from a `.env` file.

### Frontend Dependencies (`/frontend`)
* **react** / **react-dom**: The core libraries for building the user interface.
* **vite**: The build tool and local development server, providing fast Hot Module Replacement (HMR).
* **axios**: A promise-based HTTP client used to fetch data from our Node.js backend.
* **react-router-dom**: Handles client-side routing, allowing navigation between different pages (e.g., Dashboard, Login) without reloading the browser.

---

## How to Run the Project Locally

To test the application, you must run the frontend and backend simultaneously in **two separate terminal windows**.

### 1. Start the Backend Server
Open your first terminal, navigate to the root project folder, and execute:

\`\`\`bash
cd backend
npm install
node server.js
\`\`\`
*The backend API will start listening for requests (default is usually `http://localhost:5000`).*

### 2. Start the Frontend Server
Open a **new** terminal window, navigate to the root project folder, and execute:

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*Vite will start the React application. Open your browser and navigate to the Local URL provided in the terminal (usually `http://localhost:5173`).*