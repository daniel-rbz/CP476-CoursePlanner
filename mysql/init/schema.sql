CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Terms (
    term_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    semester ENUM('Fall', 'Winter', 'Spring', 'Summer') NOT NULL,
    academic_year INT NOT NULL,
    CONSTRAINT unique_user_term UNIQUE (user_id, semester, academic_year),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    term_id INT NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    credits DECIMAL(3,2) NOT NULL CHECK (credits IN (0.25, 0.50)),
    status ENUM('Planned', 'In Progress', 'Completed') NOT NULL DEFAULT 'Planned',
    FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE
);
