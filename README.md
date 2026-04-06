# Student Course Planner

## Project Overview
The **Student Course Planner** is a full-stack web application designed to help university students visualize their degree progression. It allows users to create academic terms, organize courses, and track their completion status in a clean, drag-and-drop interface.

## Team Members
* **Daniel Ramirez Bumaguin**
* **Victor Ene**
* **Adam Moor**

## Technology Stack
* **Front-End: HTML5/CSS3 (Potentially React)**
* **Back-End:** Node.js, Express.js
* **Database: SQLite3**
* **Version Control:** GitHub


## Installation & Execution Setup (Deliverable 3)

### Prerequisites
* **Node.js** (v14 or higher recommended)
* **npm** (Node Package Manager)
* **Git** (for cloning the repository)

### Steps to Run Locally (Clean Machine)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/daniel-rbz/CP476-CoursePlanner.git
   cd CP476-CoursePlanner
   ```
2. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
   *This will install all necessary packages, including `express`, `express-session`, `sqlite3`, and `bcrypt`.*

4. **Start the application server:**
   ```bash
   npm start
   ```
   *(Or run `node server.js` manually)*

5. **Access the application:**
   Open your web browser and go to: `http://localhost:3000`

### Environment / Config Notes
* **Database:** The project uses an embedded `SQLite3` database (`database.db`). No separate database server installation or configuration is required. The schema is automatically defined in `schema.sql`.
* **Frontend:** The frontend is served statically through the Express.js backend. No separate frontend development server is needed.
* **Session Secrets:** Currently, the session cookie secret is hardcoded manually in `server.js` (`course-planner-secret`). In a production environments, this would be set using environment variables (e.g., using a `.env` file).

## Documentation
* **Project Board:** [CP476 Project Board](https://github.com/users/daniel-rbz/projects/3)
* **Wiki/Activity Log:** [CP476 Wiki](https://github.com/daniel-rbz/CP476-CoursePlanner/wiki)

## Contributions
* **Front End + Database** Daniel Ramirez Bumaguin
* **Back End + User authentication** Victor Ene, Adam Moor, Daniel Ramirez Bumaguin
