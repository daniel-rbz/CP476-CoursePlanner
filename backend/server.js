const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

// middleware to parse JSON requests
app.use(express.json());

// session middleware
app.use(session({
  secret: 'course-planner-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static('frontend'));

// import routes
const termRoutes = require('./routes/terms');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

// initial route structure setup
app.use('/api/terms', termRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// serve the frontend entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// runnable server entry point
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});