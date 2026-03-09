# Student Course Planner

## Project Overview
The **Student Course Planner** is a full-stack web application that helps students visualize degree progression by organizing terms and courses.

## Team Members
- **Daniel Ramirez Bumaguin**
- **Victor Ene**
- **Adam Moor**

## Technology Stack
- **Front End:** HTML, CSS, JavaScript
- **Back End:** Node.js, Express.js
- **Database:** MySQL (planned)
- **Containerization:** Docker, Docker Compose
- **Version Control:** GitHub

## Prerequisites
- **Local run:** Node.js 18+ and npm
- **Container run:** Docker Desktop (or Docker Engine + Compose)

## Run Locally (Without Docker)
1. Open a terminal in the project root.
2. Install backend dependencies:

	```bash
	cd backend
	npm install
	```

3. Start the server:

	```bash
	npm start
	```

4. Open the app at `http://localhost:3000`.

Notes:
- The backend serves the frontend from the `frontend/` folder.
- You can override the port with an environment variable, for example:

  ```bash
  # PowerShell
  $env:PORT=3000
  npm start
  ```

## Run With Docker Compose
From the project root:

1. Build and start:

	```bash
	docker compose up --build -d
	```

2. Open the app at `http://localhost:3000`.

3. View logs:

	```bash
	docker compose logs -f app
	```

4. Stop services:

	```bash
	docker compose down
	```

The compose setup builds from `Dockerfile` and uses image tag `danielrbz/courseplanner:1.0`.

## Build and Run Docker Image Manually
From the project root:

```bash
docker build -t danielrbz/courseplanner:1.0 .
docker run --rm -p 3000:3000 danielrbz/courseplanner:1.0
```

## Useful Docker Commands
```bash
docker compose ps
docker compose config
docker image ls danielrbz/courseplanner
```

## Repository Files for Docker
Keep these in the repository:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

Do not commit secrets. Keep real environment values in `.env` files that are gitignored.

## Documentation
- **Project Board:** [CP476 Project Board](https://github.com/users/daniel-rbz/projects/3)
- **Wiki/Activity Log:** [CP476 Wiki](https://github.com/daniel-rbz/CP476-CoursePlanner/wiki)

## Contributions
- **Front End + Database:** Daniel Ramirez Bumaguin
- **Back End:** Victor Ene