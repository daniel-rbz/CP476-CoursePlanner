// authentication variables and functions
let currentUser = null;

function toggleAuthForm() {
    document.getElementById("loginForm").style.display = 
        document.getElementById("loginForm").style.display === "none" ? "block" : "none";
    document.getElementById("registerForm").style.display = 
        document.getElementById("registerForm").style.display === "none" ? "block" : "none";
}

async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    
    if (!email || !password) {
        document.getElementById("authError").textContent = "Please enter email and password";
        return;
    }

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            document.getElementById("authError").textContent = data.error || "Login failed";
            return;
        }

        currentUser = { user_id: data.user_id, email: data.email };
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
        showApp();
        await initializePlanner();
    } catch (error) {
        document.getElementById("authError").textContent = "An error occurred";
    }
}

async function handleRegister() {
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regPasswordConfirm").value;
    
    if (!email || !password || !confirm) {
        document.getElementById("authError").textContent = "Please fill in all fields";
        return;
    }
    
    if (password !== confirm) {
        document.getElementById("authError").textContent = "Passwords do not match";
        return;
    }

    try {
        const response = await fetch("/api/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            document.getElementById("authError").textContent = data.error || "Registration failed";
            return;
        }

        currentUser = { user_id: data.user_id, email: data.email };
        document.getElementById("regEmail").value = "";
        document.getElementById("regPassword").value = "";
        document.getElementById("regPasswordConfirm").value = "";
        showApp();
        await initializePlanner();
    } catch (error) {
        document.getElementById("authError").textContent = "An error occurred";
    }
}

async function handleLogout() {
    try {
        await fetch("/api/users/logout", { method: "POST" });
    } catch (error) {
        console.warn("Logout failed", error);
    }
    
    currentUser = null;
    clearDashboard();
    document.getElementById("authScreen").style.display = "block";
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("authError").textContent = "";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
}

function showApp() {
    document.getElementById("authScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("userEmail").textContent = "Logged in as: " + currentUser.email;
}

function clearDashboard() {
    const dashboard = document.querySelector(".dashboard");
    if (dashboard) dashboard.innerHTML = "";
}

async function checkAuth() {
    try {
        const response = await fetch("/api/users/session");
        if (response.ok) {
            const data = await response.json();
            currentUser = { user_id: data.user_id, email: data.email };
            showApp();
            await initializePlanner();
        } else {
            document.getElementById("authScreen").style.display = "block";
            document.getElementById("mainApp").style.display = "none";
        }
    } catch (error) {
        document.getElementById("authScreen").style.display = "block";
        document.getElementById("mainApp").style.display = "none";
    }
}

// term pop-up button
function showTermModal() {
    document.getElementById("termModal").style.display = "block";
}

function hideTermModal() {
    document.getElementById("termModal").style.display = "none";
}

function resetTermModalForm() {
    document.getElementById("termSemesterInput").value = "Fall";
    document.getElementById("termYearInput").value = "";
}

// course pop-up button
let activeTermBox = null;
let editingCourseBox = null;

function showCourseModal(addCourseButton) {
    activeTermBox = addCourseButton ? addCourseButton.closest(".term-box") : null;
    document.getElementById("courseModal").style.display = "block";
}

function hideCourseModal() {
    document.getElementById("courseModal").style.display = "none";
    editingCourseBox = null;
}

function resetCourseModalForm() {
    document.getElementById("courseModalTitle").textContent = "Add New Course";
    document.getElementById("courseCodeInput").value = "";
    document.getElementById("courseTitleInput").value = "";
    document.getElementById("courseCreditInput").value = "0.5";
    document.getElementById("courseStatusInput").value = "Planned";
}

function openEditCourseModal(editButton) {
    const courseBox = editButton.closest(".course-box");
    if (!courseBox) return;

    editingCourseBox = courseBox;
    activeTermBox = null;

    const code = courseBox.querySelector(".course-code").textContent.trim();
    const title = courseBox.querySelector(".course-name").textContent.trim();
    const credits = courseBox.dataset.credits;
    const status = courseBox.querySelector(".course-status-toggle").textContent.trim();

    document.getElementById("courseModalTitle").textContent = "Edit Course";
    document.getElementById("courseCodeInput").value = code;
    document.getElementById("courseTitleInput").value = title;
    document.getElementById("courseCreditInput").value = credits;
    document.getElementById("courseStatusInput").value = status;

    document.getElementById("courseModal").style.display = "block";
}

// status cycles: Planned -> In Progress -> Completed -> Planned
const STATUS_CYCLE = ["Planned", "In Progress", "Completed"];

function getStatusBadgeClass(status) {
    if (status === "Completed") return "badge-black";
    if (status === "In Progress") return "badge-gray";
    return "badge-white";
}

function applyStatusToBadge(statusBadge, status) {
    statusBadge.textContent = status;
    statusBadge.className = `course-status-toggle ${getStatusBadgeClass(status)}`;
}

function addCourseCardToTerm(termBox, courseData) {
    const courseBox = document.createElement("div");
    courseBox.className = "course-box";
    if (courseData.course_id) {
        courseBox.dataset.courseId = String(courseData.course_id);
    }
    if (courseData.credits) {
        courseBox.dataset.credits = String(courseData.credits);
    }

    const topRow = document.createElement("div");
    topRow.className = "course-top-row";

    const codeText = document.createElement("b");
    codeText.className = "course-code";
    codeText.textContent = courseData.courseCode;

    const statusBadge = document.createElement("span");
    applyStatusToBadge(statusBadge, courseData.status);
    statusBadge.setAttribute("onclick", "toggleCourseStatus(this)");

    topRow.appendChild(codeText);
    topRow.appendChild(statusBadge);

    const titleText = document.createElement("p");
    titleText.className = "course-name";
    titleText.textContent = courseData.courseTitle;

    courseBox.appendChild(topRow);
    courseBox.appendChild(titleText);

    const courseCardActions = document.createElement("div");
    courseCardActions.className = "course-card-actions";

    const editCourseButton = document.createElement("button");
    editCourseButton.className = "edit-course-btn";
    editCourseButton.textContent = "Edit";
    editCourseButton.setAttribute("onclick", "openEditCourseModal(this)");

    const deleteCourseButton = document.createElement("button");
    deleteCourseButton.className = "delete-course-btn";
    deleteCourseButton.textContent = "Delete";
    deleteCourseButton.setAttribute("onclick", "deleteCourse(this)");

    courseCardActions.appendChild(editCourseButton);
    courseCardActions.appendChild(deleteCourseButton);
    courseBox.appendChild(courseCardActions);

    const termActions = termBox.querySelector(".term-actions");
    termBox.insertBefore(courseBox, termActions);
}

function findTermBoxByName(termName) {
    const termBoxes = document.querySelectorAll(".term-box");
    for (const termBox of termBoxes) {
        const heading = termBox.querySelector("h3")?.textContent?.trim();
        if (heading === termName) {
            return termBox;
        }
    }
    return null;
}

function addTermBox(termData) {
    const dashboard = document.querySelector(".dashboard");
    const existingTermBox = findTermBoxByName(termData.termName);
    if (!dashboard || existingTermBox) {
        return existingTermBox;
    }

    const termBox = document.createElement("div");
    termBox.className = "term-box";
    if (termData.term_id) {
        termBox.dataset.termId = String(termData.term_id);
    }

    const heading = document.createElement("h3");
    heading.textContent = termData.termName;

    const termActions = document.createElement("div");
    termActions.className = "term-actions";

    const addCourseButton = document.createElement("button");
    addCourseButton.className = "add-course-btn";
    addCourseButton.textContent = "+ Add Course";
    addCourseButton.setAttribute("onclick", "showCourseModal(this)");

    const deleteTermButton = document.createElement("button");
    deleteTermButton.className = "delete-term-btn";
    deleteTermButton.textContent = "Delete";
    deleteTermButton.setAttribute("onclick", "deleteTerm(this)");

    termBox.appendChild(heading);
    termActions.appendChild(addCourseButton);
    termActions.appendChild(deleteTermButton);
    termBox.appendChild(termActions);
    dashboard.appendChild(termBox);
    return termBox;
}

async function deleteTerm(deleteButton) {
    const termBox = deleteButton?.closest(".term-box");
    if (!termBox) return;

    const termName = termBox.querySelector("h3")?.textContent?.trim() || "";
    if (!termName) return;

    const shouldDelete = confirm(`Delete ${termName} and all its courses?`);
    if (!shouldDelete) return;

    const termId = termBox.dataset.termId;
    if (termId) {
        try {
            const response = await fetch(`/api/terms/${encodeURIComponent(termId)}`, {
                method: "DELETE"
            });

            if (!response.ok && response.status !== 404) {
                throw new Error("Failed to delete term from API.");
            }
        } catch (error) {
            alert("Failed to delete term. Please try again.");
            return;
        }
    }

    if (activeTermBox === termBox) {
        hideCourseModal();
        activeTermBox = null;
    }

    termBox.remove();
}

async function loadSavedTerms() {
    try {
        const response = await fetch("/api/terms");
        if (!response.ok) {
            throw new Error("Failed to fetch saved terms.");
        }

        const savedTerms = await response.json();
        savedTerms.forEach((term) => {
            addTermBox(term);
        });
    } catch (error) {
        console.warn("Could not load saved terms:", error);
    }
}

async function loadSavedCourses() {
    try {
        const response = await fetch("/api/courses");
        if (!response.ok) {
            throw new Error("Failed to fetch saved courses.");
        }

        const savedCourses = await response.json();
        savedCourses.forEach((course) => {
            const matchingTermBox = findTermBoxByName(course.termName);
            if (matchingTermBox) {
                addCourseCardToTerm(matchingTermBox, course);
            }
        });
    } catch (error) {
        console.warn("Could not load saved courses:", error);
    }
}

async function saveTermFromModal() {
    const semester = document.getElementById("termSemesterInput").value;
    const year = document.getElementById("termYearInput").value.trim();

    if (!year) {
        alert("Please enter a year.");
        return;
    }

    try {
        const response = await fetch("/api/terms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ semester, year })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                alert("That term already exists.");
                return;
            }
            alert(data.message || "Failed to save term.");
            return;
        }

        addTermBox(data);
        hideTermModal();
        resetTermModalForm();
    } catch (error) {
        alert("An error occurred while saving the term.");
        console.warn("Term save error:", error);
    }
}

async function toggleCourseStatus(statusBadge) {
    const courseBox = statusBadge?.closest(".course-box");
    if (!courseBox) return;

    const courseId = courseBox.dataset.courseId;
    if (!courseId) {
        // local-only fallback (no db id)
        const currentStatus = statusBadge.textContent.trim();
        const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
        const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
        applyStatusToBadge(statusBadge, nextStatus);
        return;
    }

    try {
        const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/status`, {
            method: "PATCH"
        });

        if (!response.ok) {
            throw new Error("Failed to toggle course status in API.");
        }

        const updatedCourse = await response.json();
        applyStatusToBadge(statusBadge, updatedCourse.status);
    } catch (error) {
        console.warn("API status toggle failed:", error);
    }
}

async function deleteCourse(deleteButton) {
    const courseBox = deleteButton?.closest(".course-box");
    if (!courseBox) return;

    const shouldDelete = confirm("Delete this course?");
    if (!shouldDelete) return;

    const courseId = courseBox.dataset.courseId;
    if (courseId) {
        try {
            const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
                method: "DELETE"
            });

            if (!response.ok && response.status !== 404) {
                alert("Failed to delete course. Please try again.");
                return;
            }
        } catch (error) {
            alert("An error occurred while deleting the course.");
            return;
        }
    }

    courseBox.remove();
}

async function saveCourseFromModal() {
    const courseCode = document.getElementById("courseCodeInput").value.trim().toUpperCase();
    const courseTitle = document.getElementById("courseTitleInput").value.trim();
    const creditWeight = document.getElementById("courseCreditInput").value.trim();
    const status = document.getElementById("courseStatusInput").value;

    if (!courseCode || !courseTitle || !creditWeight) {
        alert("Please fill in course code, title, and credit weight.");
        return;
    }

    // --- EDIT MODE ---
    if (editingCourseBox) {
        const courseId = editingCourseBox.dataset.courseId;
        try {
            const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseCode, courseTitle, creditWeight, status })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Failed to update course.");
                return;
            }

            // update the card in place
            editingCourseBox.dataset.credits = String(data.credits);
            editingCourseBox.querySelector(".course-code").textContent = data.courseCode;
            editingCourseBox.querySelector(".course-name").textContent = data.courseTitle;
            applyStatusToBadge(editingCourseBox.querySelector(".course-status-toggle"), data.status);
        } catch (error) {
            alert("An error occurred while updating the course.");
            console.warn("Course update error:", error);
            return;
        }

        hideCourseModal();
        resetCourseModalForm();
        return;
    }

    // --- ADD MODE ---
    if (!activeTermBox) {
        alert("Please choose a term using that term's Add Course button.");
        return;
    }

    const term_id = activeTermBox.dataset.termId;
    if (!term_id) {
        alert("Could not identify the selected term. Please try again.");
        return;
    }

    try {
        const response = await fetch("/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ term_id, courseCode, courseTitle, creditWeight, status })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to save course.");
            return;
        }

        addCourseCardToTerm(activeTermBox, data);
        hideCourseModal();
        resetCourseModalForm();
        activeTermBox = null;
    } catch (error) {
        alert("An error occurred while saving the course.");
        console.warn("Course save error:", error);
    }
}

async function initializePlanner() {
    clearDashboard();
    await loadSavedTerms();
    await loadSavedCourses();
}

window.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});
