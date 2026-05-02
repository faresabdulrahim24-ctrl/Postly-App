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

            const postHTML = `
            <div class="card custom-card shadow-lg mb-5">
                <div class="card-header">
                    <img src="${author.profile_image}" alt=""
                        style="height:45px;width:45px;object-fit:cover;"
                        class="rounded-circle border border-2 border-secondary">
                    <div>
                        <b style="font-size:16px;">@${author.username}</b>
                        <div style="font-size:12px;color:#adb5bd;">${new Date(post.created_at).toLocaleString()}</div>
                    </div>
                    <button class="btn btn-outline-secondary"
                        onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post)).replace(/'/g, "%27")}')"
                        style="border-radius:50%;padding:8px;margin-left:auto;">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
                <div class="card-body" onclick="postClicked(${post.id})" style="cursor:pointer;">
                    <h5 class="mb-3 text-white">${postTitle}</h5>
                    <p style="color:#cbd5e1;line-height:1.6;">${post.body}</p>
                    ${post.image ? `<img class="w-100 post-image" src="${post.image}" alt="Post Image"
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
    }).catch((error) => {
        console.error('Error fetching posts:', error);
    });
}

function createPostBtnClicked() {
    const postId    = document.getElementById("post-id").value;
    const isCreate  = !postId;
    const header    = document.getElementById("post-header-input").value;
    const content   = document.getElementById("post-content-input").value;
    const image     = document.getElementById("post-image-input").files[0];
    const token     = localStorage.getItem('token');

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
    });
}

function editPostBtnClicked(postObject) {
    if (!postObject) return;
    const post = JSON.parse(decodeURIComponent(postObject));
    document.getElementById("post-id").value               = post.id;
    document.getElementById("addPostModalTitle").innerHTML = "Edit Post";
    document.getElementById("post-header-input").value    = post.title || "";
    document.getElementById("post-content-input").value   = post.body;
    new bootstrap.Modal(document.getElementById('add-post-modal')).show();
}

function postClicked(postId) {
    if (!postId) return;
    window.location.href = `postDetails.html?postId=${postId}`;
}