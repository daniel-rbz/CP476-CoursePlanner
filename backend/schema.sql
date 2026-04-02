PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Terms (
    term_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    semester TEXT NOT NULL CHECK (semester IN ('Fall', 'Winter', 'Spring', 'Summer')),
    academic_year INTEGER NOT NULL,
    UNIQUE (user_id, semester, academic_year),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_id INTEGER NOT NULL,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    credits REAL NOT NULL CHECK (credits IN (0.25, 0.50)),
    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed')),
    FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE
);