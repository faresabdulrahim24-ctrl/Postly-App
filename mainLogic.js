setupUI();

const navItems = document.querySelectorAll('.nav-item:not(.brand-item)');
navItems.forEach(item => {
    item.addEventListener('click', function(e){
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

function loginBtnClicked() {
    let userName = document.getElementById("username").value
    let password = document.getElementById("password").value

    const params = {
        "username": userName,
        "password": password
    }
    
    axios.post('https://tarmeezacademy.com/api/v1/login', params)
    .then((response) => {
        let token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('username', JSON.stringify(response.data.user));

        const modal = document.getElementById('login-modal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        showAlert('Logged in successfully!', 'success');
        setupUI();

    }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger');
        console.error('Login failed:', message);
    });
}

function registerBtnClicked() { 
    const name = document.getElementById('register-name-input').value;
    const userName = document.getElementById('register-username-input').value;
    const password = document.getElementById('register-password-input').value;
    const profileImage = document.getElementById('register-image-input').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', userName);
    formData.append('password', password);
    formData.append('profile_image', profileImage);

    const params = formData;
    headers = {
        'Content-Type': 'multipart/form-data'
    }
    
    axios.post('https://tarmeezacademy.com/api/v1/register', params, {
        headers: headers
    })  
    .then((response) => {
        let token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('username', JSON.stringify(response.data.user));

        const modal = document.getElementById('register-modal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        showAlert('Registered successfully!', 'success');
        setupUI();

    }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger');
        console.error('Registration failed:', message);
    });
}

function logoutBtnClicked() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    showAlert('Logged out successfully!', 'success');
    setupUI();
}

function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('success-alert');
    const wrapper = document.createElement('div');
    
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show shadow-lg" role="alert" style="position: fixed; bottom: 20px; right: 20px; z-index: 1055; min-width: 250px;">`,
        `   <strong>Success!</strong> ${message}`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');
    
    alertPlaceholder.append(wrapper);

    // Auto remove alert after 3 seconds
    setTimeout(() => {
        const alertElement = wrapper.querySelector('.alert');

        if (alertElement) {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
            bsAlert.close();
        }
    }, 3000);
}

function setupUI() {
    const token = localStorage.getItem('token')

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loggedInDiv = document.getElementById('logged-in-div');
    const createPostBtn = document.getElementById('add-btn');
    const profileBtn = document.getElementById('profile-btn');
    const addCommentContainer = document.getElementById('add-comment-container');

    if(token == null) //user is guest
    {
        if(loginBtn) loginBtn.style.display = 'flex';
        if(registerBtn) registerBtn.style.display = 'flex';
        if(loggedInDiv) loggedInDiv.style.display = 'none';
        if(createPostBtn) createPostBtn.style.display = 'none'; 
        if (profileBtn) profileBtn.style.display = 'none';
        if (addCommentContainer) addCommentContainer.style.display = 'none';
        
    } else { // user is logged in
        if(loggedInDiv) loggedInDiv.style.display = 'flex';
        if(loginBtn) loginBtn.style.display = 'none';
        if(registerBtn) registerBtn.style.display = 'none';
        if (createPostBtn) createPostBtn.style.display = 'flex';
        if (profileBtn) profileBtn.style.display = 'flex';
        
        const userStr = localStorage.getItem('username');
        if(userStr) {
            const user = JSON.parse(userStr);
            const usernameEl = document.getElementById('logged-in-username');
            if(usernameEl) usernameEl.innerText = `@${user.username}`;
            
            const userImgEl = document.getElementById('nav-user-image');
            if(userImgEl && user.profile_image && typeof user.profile_image === 'string') {
                userImgEl.src = user.profile_image;
            }
        }
    }
}

let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    let currentScroll = window.scrollY || document.documentElement.scrollTop;
    let navbar = document.getElementById('main-nav');
    
    // Hide navbar if scrolled down past 100px. Show if scrolled up.
    if (currentScroll > lastScrollTop && currentScroll > 100) {
        navbar.style.top = "-120px"; 
    } else {
        navbar.style.top = "0px";   
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

function getCurrentUser() { 
    let user = null;
    const storagedUser = localStorage.getItem('username');
    if (storagedUser != null) {
        user = JSON.parse(storagedUser);
    }
    return user;
}

function openImage(imageUrl) {
    document.getElementById('modal-displayed-image').src = imageUrl;
    const imageModal = new bootstrap.Modal(document.getElementById('image-viewer-modal'));
    imageModal.show();
}
