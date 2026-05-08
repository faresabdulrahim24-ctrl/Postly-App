getPosts();

let currentPage   = 1;
let lastPageReached = 1;

window.addEventListener('scroll', function () {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
    if (endOfPage && currentPage < lastPageReached) {
        getPosts(false, ++currentPage);
    }
});

function getPosts(reload = true, page = 1) {
    SupabaseAPI.getPosts(5, page)
    .then((response) => {
        const posts = response.data.data;
        lastPageReached = response.data.meta.last_page;

        if (reload) document.getElementById('posts').innerHTML = "";

        for (let post of posts) {
            const author    = post.author;
            const postTitle = post.title || "";

            let actionButtons = "";
            const userStr = localStorage.getItem('username');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.id === author.id) {
                    actionButtons = `
                    <div style="margin-left:auto;" class="d-flex gap-2">
                        <button class="btn btn-outline-secondary"
                            onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post)).replace(/'/g, "%27")}')"
                            style="border-radius:50%;padding:8px;">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger"
                            onclick="deletePostBtnClicked(${post.id})"
                            style="border-radius:50%;padding:8px;">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    `;
                }
            }

            const postHTML = `
            <div class="card custom-card shadow-lg mb-5">
                <div class="card-header d-flex align-items-center">
                    <div style="cursor:pointer; display:flex; align-items:center; gap:10px;" onclick="userClicked('${author.id}')">
                        <img src="${author.profile_image}" alt="" loading="lazy"
                            style="height:45px;width:45px;object-fit:cover;"
                            class="rounded-circle border border-2 border-secondary">
                        <div>
                            <b style="font-size:16px;">${author.name}</b>
                            <div style="font-size:12px;color:#adb5bd;">${new Date(post.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                    ${actionButtons}
                </div>
                <div class="card-body" onclick="postClicked(${post.id})" style="cursor:pointer;">
                    <h5 class="mb-3 text-white">${postTitle}</h5>
                    <p style="color:#cbd5e1;line-height:1.6;">${post.body}</p>
                    ${post.image ? `<img class="w-100 post-image" src="${post.image}" alt="Post Image" loading="lazy"
                        style="cursor:pointer;" onclick="event.stopPropagation();openImage('${post.image}')">` : ''}
                    <div class="mt-3 mb-2" id="post-tags-${post.id}"></div>
                    <hr><hr>
                    <div class="d-flex mt-3">
                        <button class="btn text-light d-flex align-items-center justify-content-center gap-2 w-100 py-2"
                            style="background-color:rgba(255,255,255,0.05);border-radius:12px;">
                            <i class="bi bi-chat-right-text"></i>
                            <span>${post.comments_count} Comments</span>
                        </button>
                    </div>
                </div>
            </div>`;

            document.getElementById('posts').innerHTML += postHTML;

            // Render tags
            const tagsEl = document.getElementById(`post-tags-${post.id}`);
            if (tagsEl && post.tags) {
                tagsEl.innerHTML = post.tags.map(tag =>
                    `<button class="badge rounded-pill me-1 text-light"
                        style="background-color:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);font-weight:normal;padding:5px 10px;">
                        #${tag.name}
                    </button>`
                ).join('');
            }
        }
        hideLoader();
    }).catch((error) => {
        console.error('Error fetching posts:', error);
        hideLoader();
    });
}

function addPostBtnClicked() {
    document.getElementById("post-id").value               = "";
    document.getElementById("addPostModalTitle").innerHTML = "Create A New Post";
    document.getElementById("post-header-input").value    = "";
    document.getElementById("post-content-input").value   = "";
    document.getElementById("post-image-input").value     = "";
}

function createPostBtnClicked() {
    const postId    = document.getElementById("post-id").value;
    const isCreate  = !postId;
    const header    = document.getElementById("post-header-input").value;
    const content   = document.getElementById("post-content-input").value;
    const image     = document.getElementById("post-image-input").files[0];
    const token     = localStorage.getItem('token');

    showLoader();
    const promise = isCreate
        ? SupabaseAPI.createPost(header, content, image, token)
        : SupabaseAPI.updatePost(postId, header, content, image, token);

    promise.then(() => {
        showAlert(isCreate ? 'Post created successfully!' : 'Post updated successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('add-post-modal')).hide();
        // Reset form
        document.getElementById("post-id").value               = "";
        document.getElementById("addPostModalTitle").innerHTML = "Create A New Post";
        document.getElementById("post-header-input").value    = "";
        document.getElementById("post-content-input").value   = "";
        document.getElementById("post-image-input").value     = "";
        getPosts();
    }).catch((error) => {
        showAlert(error.response.data.message, 'danger');
        hideLoader();
    });
}

function editPostBtnClicked(postObject) {
    if (!postObject) return;
    const post = JSON.parse(decodeURIComponent(postObject));
    document.getElementById("post-modal-submit-btn").innerHTML= "Edit Post"
    document.getElementById("post-id").value               = post.id;
    document.getElementById("addPostModalTitle").innerHTML = "Edit Post";
    document.getElementById("post-header-input").value    = post.title || "";
    document.getElementById("post-content-input").value   = post.body;
    new bootstrap.Modal(document.getElementById('add-post-modal')).show();
}

function deletePostBtnClicked(postId) {
    document.getElementById("delete-post-id").value = postId;
    new bootstrap.Modal(document.getElementById('delete-post-modal')).show();
}

function confirmDeletePost() {
    const postId = document.getElementById("delete-post-id").value;
    const token = localStorage.getItem('token');
    
    // Hide the modal immediately and clean up backdrop if needed
    const modalEl = document.getElementById('delete-post-modal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
        modalInstance.hide();
    }

    showLoader();
    SupabaseAPI.deletePost(postId, token)
    .then(() => {
        showAlert('Post deleted successfully!', 'success');
        getPosts();
    }).catch((error) => {
        showAlert(error.response?.data?.message || 'Error deleting post', 'danger');
        hideLoader();
    });
}

function addBtnClicked() {

    document.getElementById("post-modal-submit-btn").innerHTML= "Create New Post"
    document.getElementById("post-id").value               = "";
    document.getElementById("addPostModalTitle").innerHTML = "Create A New Post";
    document.getElementById("post-header-input").value    = "";
    document.getElementById("post-content-input").value   = "";
    new bootstrap.Modal(document.getElementById('add-post-modal')).show();
}

function postClicked(postId) {
    if (!postId) return;
    window.location.href = `postDetails.html?postId=${postId}`;
}