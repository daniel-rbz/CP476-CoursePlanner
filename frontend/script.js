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

function showCourseModal(addCourseButton) {
    activeTermBox = addCourseButton ? addCourseButton.closest(".term-box") : null;
    document.getElementById("courseModal").style.display = "block";
}

function hideCourseModal() {
    document.getElementById("courseModal").style.display = "none";
}

function resetCourseModalForm() {
    document.getElementById("courseCodeInput").value = "";
    document.getElementById("courseTitleInput").value = "";
    document.getElementById("courseCreditInput").value = "";
    document.getElementById("courseStatusInput").value = "Planned";
}

function applyStatusToBadge(statusBadge, status) {
    statusBadge.textContent = status;
    statusBadge.className = `course-status-toggle ${status === "Completed" ? "badge-black" : "badge-white"}`;
}

function addCourseCardToTerm(termBox, courseData) {
    const courseBox = document.createElement("div");
    courseBox.className = "course-box";
    if (courseData.id) {
        courseBox.dataset.courseId = String(courseData.id);
    }

    const topRow = document.createElement("div");
    topRow.className = "course-top-row";

    const codeText = document.createElement("b");
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

    const deleteCourseButton = document.createElement("button");
    deleteCourseButton.className = "delete-course-btn";
    deleteCourseButton.textContent = "Delete Course";
    deleteCourseButton.setAttribute("onclick", "deleteCourse(this)");
    courseBox.appendChild(deleteCourseButton);

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

function addTermBox(termName) {
    const dashboard = document.querySelector(".dashboard");
    const existingTermBox = findTermBoxByName(termName);
    if (!dashboard || existingTermBox) {
        return existingTermBox;
    }

    const termBox = document.createElement("div");
    termBox.className = "term-box";

    const heading = document.createElement("h3");
    heading.textContent = termName;

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
    if (!termBox) {
        return;
    }

    const termName = termBox.querySelector("h3")?.textContent?.trim() || "";
    if (!termName) {
        return;
    }

    const shouldDelete = confirm(`Delete ${termName}?`);
    if (!shouldDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/terms/${encodeURIComponent(termName)}`, {
            method: "DELETE"
        });

        if (!response.ok && response.status !== 404) {
            throw new Error("Failed to delete term from API.");
        }
    } catch (error) {
        console.warn("API delete failed, removing term locally instead:", error);
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
            addTermBox(term.termName);
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

    const termName = `${semester} ${year}`;
    if (findTermBoxByName(termName)) {
        alert("That term already exists.");
        return;
    }

    try {
        const response = await fetch("/api/terms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ semester, year })
        });

        if (!response.ok) {
            if (response.status === 409) {
                alert("That term already exists.");
                return;
            }
            throw new Error("Failed to save term to API.");
        }
    } catch (error) {
        console.warn("API save failed, adding term locally instead:", error);
    }

    addTermBox(termName);
    hideTermModal();
    resetTermModalForm();
}

async function toggleCourseStatus(statusBadge) {
    const courseBox = statusBadge?.closest(".course-box");
    if (!courseBox) {
        return;
    }

    const currentStatus = statusBadge.textContent.trim();
    let nextStatus = currentStatus === "Completed" ? "Planned" : "Completed";
    const courseId = courseBox.dataset.courseId;

    if (courseId) {
        try {
            const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/status`, {
                method: "PATCH"
            });

            if (!response.ok) {
                throw new Error("Failed to toggle course status in API.");
            }

            const updatedCourse = await response.json();
            nextStatus = updatedCourse.status;
        } catch (error) {
            console.warn("API status toggle failed, updating locally instead:", error);
        }
    }

    applyStatusToBadge(statusBadge, nextStatus);
}

async function deleteCourse(deleteButton) {
    const courseBox = deleteButton?.closest(".course-box");
    if (!courseBox) {
        return;
    }

    const shouldDelete = confirm("Delete this course?");
    if (!shouldDelete) {
        return;
    }

    const courseId = courseBox.dataset.courseId;
    if (courseId) {
        try {
            const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
                method: "DELETE"
            });

            if (!response.ok && response.status !== 404) {
                throw new Error("Failed to delete course from API.");
            }
        } catch (error) {
            console.warn("API delete failed, removing course locally instead:", error);
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

    if (!activeTermBox) {
        alert("Please choose a term using that term's Add Course button.");
        return;
    }

    const termName = activeTermBox.querySelector("h3")?.textContent?.trim() || "";
    const courseData = {
        termName,
        courseCode,
        courseTitle,
        creditWeight,
        status
    };

    let courseToRender = courseData;

    try {
        const response = await fetch("/api/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            throw new Error("Failed to save course to API.");
        }

        courseToRender = await response.json();
    } catch (error) {
        console.warn("API save failed, adding course locally instead:", error);
    }

    addCourseCardToTerm(activeTermBox, courseToRender);
    hideCourseModal();
    resetCourseModalForm();
    activeTermBox = null;
}

async function initializePlanner() {
    await loadSavedTerms();
    await loadSavedCourses();
}

document.addEventListener("DOMContentLoaded", initializePlanner);
