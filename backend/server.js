const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// middleware to parse JSON requests
app.use(express.json());

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
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// runnable server entry point
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});