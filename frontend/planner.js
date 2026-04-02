const storedUser = localStorage.getItem('coursePlannerUser');
if (!storedUser) {
  window.location.href = 'login.html';
}

const state = {
  user: storedUser ? JSON.parse(storedUser) : null,
  terms: [],
  coursesByTerm: {},
  selectedTermId: null,
};

const dashboard = document.getElementById('dashboard');
const emptyState = document.getElementById('emptyState');
const toastMessage = document.getElementById('toastMessage');
const loadingText = document.getElementById('loadingText');
const currentUserLabel = document.getElementById('currentUserLabel');
const logoutBtn = document.getElementById('logoutBtn');

const semesterInput = document.getElementById('semesterInput');
const yearInput = document.getElementById('yearInput');
const createTermBtn = document.getElementById('createTermBtn');

const courseCodeInput = document.getElementById('courseCodeInput');
const courseTitleInput = document.getElementById('courseTitleInput');
const creditsInput = document.getElementById('creditsInput');
const statusInput = document.getElementById('statusInput');
const saveCourseBtn = document.getElementById('saveCourseBtn');

function showToast(message) {
  toastMessage.textContent = message;
  toastMessage.classList.remove('hidden');
  setTimeout(() => {
    toastMessage.classList.add('hidden');
  }, 2500);
}

function setLoading(isLoading) {
  loadingText.classList.toggle('hidden', !isLoading);
}

async function apiRequest(path, method, body) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

function showTermModal() {
  document.getElementById('termModal').style.display = 'block';
}

function hideTermModal() {
  document.getElementById('termModal').style.display = 'none';
}

function showCourseModal(termId) {
  state.selectedTermId = termId;
  document.getElementById('courseModal').style.display = 'block';
}

function hideCourseModal() {
  document.getElementById('courseModal').style.display = 'none';
}

window.showTermModal = showTermModal;
window.hideTermModal = hideTermModal;
window.hideCourseModal = hideCourseModal;

function getBadgeClass(status) {
  if (status === 'Completed') {
    return 'badge-black';
  }
  return 'badge-white';
}

function renderDashboard() {
  dashboard.innerHTML = '';

  if (!state.terms.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  state.terms.forEach((term) => {
    const termBox = document.createElement('div');
    termBox.className = 'term-box';

    const courses = state.coursesByTerm[term.term_id] || [];
    const coursesHtml = courses
      .map(
        (course) => `
          <div class="course-box">
            <div class="course-top-row">
              <b>${course.course_code}</b>
              <span class="${getBadgeClass(course.status)}">${course.status}</span>
            </div>
            <p class="course-name">${course.course_title} (${course.credits})</p>
          </div>
        `
      )
      .join('');

    termBox.innerHTML = `
      <h3>${term.semester} ${term.academic_year}</h3>
      ${coursesHtml || '<p class="course-name">No courses yet.</p>'}
      <button class="add-course-btn" data-term-id="${term.term_id}">+ Add Course</button>
    `;

    dashboard.appendChild(termBox);
  });

  document.querySelectorAll('.add-course-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const termId = Number(button.getAttribute('data-term-id'));
      showCourseModal(termId);
    });
  });
}

async function loadTermsAndCourses() {
  if (!state.user) {
    return;
  }

  setLoading(true);
  try {
    const terms = await apiRequest(`/api/terms?user_id=${state.user.user_id}`, 'GET');
    state.terms = terms;
    state.coursesByTerm = {};

    await Promise.all(
      terms.map(async (term) => {
        const courses = await apiRequest(`/api/courses?term_id=${term.term_id}`, 'GET');
        state.coursesByTerm[term.term_id] = courses;
      })
    );

    renderDashboard();
  } catch (error) {
    showToast(error.message);
  } finally {
    setLoading(false);
  }
}

if (state.user) {
  currentUserLabel.textContent = state.user.email;
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('coursePlannerUser');
  window.location.href = 'login.html';
});

createTermBtn.addEventListener('click', async () => {
  if (!state.user) {
    showToast('Please log in first.');
    return;
  }

  const semester = semesterInput.value;
  const academicYear = Number(yearInput.value);

  if (!academicYear) {
    showToast('Please enter a valid year.');
    return;
  }

  try {
    await apiRequest('/api/terms', 'POST', {
      user_id: state.user.user_id,
      semester,
      academic_year: academicYear,
    });
    hideTermModal();
    yearInput.value = '';
    showToast('Term created.');
    await loadTermsAndCourses();
  } catch (error) {
    showToast(error.message);
  }
});

saveCourseBtn.addEventListener('click', async () => {
  if (!state.selectedTermId) {
    showToast('Please choose a term first.');
    return;
  }

  const courseCode = courseCodeInput.value.trim().toUpperCase();
  const courseTitle = courseTitleInput.value.trim();
  const credits = Number(creditsInput.value);
  const status = statusInput.value;

  if (!courseCode || !courseTitle || !credits) {
    showToast('Please fill in all course fields.');
    return;
  }

  try {
    await apiRequest('/api/courses', 'POST', {
      term_id: state.selectedTermId,
      course_code: courseCode,
      course_title: courseTitle,
      credits,
      status,
    });
    hideCourseModal();
    courseCodeInput.value = '';
    courseTitleInput.value = '';
    creditsInput.value = '';
    statusInput.value = 'Planned';
    showToast('Course saved.');
    await loadTermsAndCourses();
  } catch (error) {
    showToast(error.message);
  }
});

loadTermsAndCourses();
