setupUI();

const navItems = document.querySelectorAll('.nav-item:not(.brand-item)');
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#' || this.hasAttribute('data-bs-toggle')) {
            e.preventDefault();
        }
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

function loginBtnClicked() {
    let userName = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    showLoader();
    SupabaseAPI.login(userName, password)
    .then((response) => {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', JSON.stringify(response.data.user));
        bootstrap.Modal.getInstance(document.getElementById('login-modal')).hide();
        showAlert('Logged in successfully!', 'success');
        setupUI();
        reloadPosts();
    }).catch((error) => {
        showAlert(error.response.data.message, 'danger');
        hideLoader();
    });
}

function registerBtnClicked() {
    const name         = document.getElementById('register-name-input').value;
    const userName     = document.getElementById('register-username-input').value;
    const email        = `${userName}@postly.app`;
    const password     = document.getElementById('register-password-input').value;
    const profileImage = document.getElementById('register-image-input').files[0];

    showLoader();
    SupabaseAPI.register(name, userName, email, password, profileImage)
    .then((response) => {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', JSON.stringify(response.data.user));
        bootstrap.Modal.getInstance(document.getElementById('register-modal')).hide();
        showAlert('Registered successfully!', 'success');
        setupUI();
        reloadPosts();
    }).catch((error) => {
        showAlert(error.response.data.message, 'danger');
        hideLoader();
    });
}

function logoutBtnClicked() {
    showLoader();
    SupabaseAPI.logout().finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        showAlert('Logged out successfully!', 'success');
        setupUI();
        reloadPosts();
    });
}

function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('success-alert');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-lg" role="alert"
             style="position: fixed; bottom: 20px; right: 20px; z-index: 1055; min-width: 250px;">
            <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    alertPlaceholder.append(wrapper);
    setTimeout(() => {
        const alertEl = wrapper.querySelector('.alert');
        if (alertEl) bootstrap.Alert.getOrCreateInstance(alertEl).close();
    }, 3000);
}

function setupUI() {
    const token = localStorage.getItem('token');

    const loginBtn            = document.getElementById('login-btn');
    const registerBtn         = document.getElementById('register-btn');
    const loggedInDiv         = document.getElementById('logged-in-div');
    const createPostBtn       = document.getElementById('add-btn');
    const profileBtn          = document.getElementById('profile-btn');
    const addCommentContainer = document.getElementById('add-comment-container');

    if (!token) {
        if (loginBtn)            loginBtn.style.display = 'flex';
        if (registerBtn)         registerBtn.style.display = 'flex';
        if (loggedInDiv)         loggedInDiv.style.display = 'none';
        if (createPostBtn)       createPostBtn.style.display = 'none';
        if (profileBtn)          profileBtn.style.display = 'none';
        if (addCommentContainer) addCommentContainer.style.display = 'none';
    } else {
        if (loginBtn)      loginBtn.style.display = 'none';
        if (registerBtn)   registerBtn.style.display = 'none';
        if (loggedInDiv)   loggedInDiv.style.display = 'flex';
        if (createPostBtn) createPostBtn.style.display = 'flex';
        if (profileBtn)    profileBtn.style.display = 'flex';
        if (addCommentContainer) addCommentContainer.style.display = 'flex';

        const userStr = localStorage.getItem('username');
        if (userStr) {
            const user = JSON.parse(userStr);
            const usernameEl = document.getElementById('logged-in-username');
            if (usernameEl) usernameEl.innerText = `${user.name}`;
            const userImgEl = document.getElementById('nav-user-image');
            if (userImgEl && user.profile_image) userImgEl.src = user.profile_image.replace(/"/g, "'");
        }
    }
}

function reloadPosts() {
    if (typeof getPosts === 'function') getPosts(true);
    if (typeof getPost === 'function') getPost();
}

function userClicked(userId) {
    if (!userId) return;
    window.location.href = `Profile.html?userid=${userId}`;
}

let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    let currentScroll = window.scrollY || document.documentElement.scrollTop;
    let navbar = document.getElementById('main-nav');
    if (currentScroll > lastScrollTop && currentScroll > 100) {
        navbar.style.top = "-120px";
    } else {
        navbar.style.top = "0px";
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

function getCurrentUser() {
    const stored = localStorage.getItem('username');
    return stored ? JSON.parse(stored) : null;
}

function openImage(imageUrl) {
    document.getElementById('modal-displayed-image').src = imageUrl;
    new bootstrap.Modal(document.getElementById('image-viewer-modal')).show();
}

function showLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }
}

function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 400);
    }
}