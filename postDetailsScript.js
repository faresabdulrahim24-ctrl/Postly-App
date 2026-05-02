const urlParams = new URLSearchParams(window.location.search);
const postId    = urlParams.get('postId');

getPost();

function getPost() {
    if (!postId) {
        window.location.href = 'Home.html';
        return;
    }

    const currentUser = getCurrentUser();

    SupabaseAPI.getPost(postId)
    .then((response) => {
        const post     = response.data.data;
        const author   = post.author;
        const comments = post.comments || [];
        const postTitle = post.title || "";

        document.getElementById('username-span').textContent = `${author.username}'s`;

        const commentsHTML = comments.map(comment => `
        <div class="d-flex align-items-start gap-3 mb-4">
            <img src="${comment.author.profile_image}" alt=""
                style="height:45px;width:45px;object-fit:cover;flex-shrink:0;"
                class="rounded-circle border border-2 border-secondary shadow-sm">
            <div style="background-color: rgba(255,255,255,0.06); border-radius: 0 15px 15px 15px; padding: 12px 16px; flex-grow:1; border: 1px solid rgba(255,255,255,0.05);">
                <b class="text-white" style="font-size:14px;">@${comment.author.username}</b>
                <p style="font-size:14px;color:#e2e8f0;margin-bottom:0;margin-top:6px;line-height:1.6;">
                    ${comment.body}
                </p>
            </div>
        </div>`
        ).join('');

        // Build tags HTML
        const tagsHTML = (post.tags || []).map(tag => `
            <button class="badge rounded-pill me-1 text-light"
                style="background-color:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);font-weight:normal;padding:7px 10px;">
                #${tag.name}
            </button>`
        ).join('');

        const userAvatar = currentUser?.profile_image || 'https://i.pravatar.cc/150?img=1';

        document.getElementById('post').innerHTML = `
        <div class="card custom-card shadow-lg mb-5 border-0"
            style="background:linear-gradient(145deg,rgba(11,19,43,0.7),rgba(34,40,49,0.9));">

            <div class="card-header border-0 pb-0 pt-4 px-4 bg-transparent">
                <div class="d-flex align-items-center gap-3">
                    <img src="${author.profile_image}" alt=""
                        style="height:55px;width:55px;object-fit:cover;"
                        class="rounded-circle border border-2 border-primary shadow-sm">
                    <div>
                        <b class="text-white d-flex align-items-center gap-1" style="font-size:18px;">
                            ${author.username}
                            <i class="bi bi-patch-check-fill text-primary" style="font-size:15px;"></i>
                        </b>
                        <div style="font-size:13px;color:#adb5bd;">
                            ${new Date(post.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-body px-4">
                <h4 class="mb-3 text-white fw-bold">${postTitle}</h4>
                <p style="color:#e2e8f0;line-height:1.8;font-size:17px;">${post.body}</p>

                <div class="mb-3">${tagsHTML}</div>

                ${post.image ? `
                <img class="w-100 post-image rounded-4 shadow-sm mb-3" src="${post.image}" alt="Post Image"
                    style="max-height:500px;object-fit:cover;cursor:pointer;"
                    onclick="openImage('${post.image}')">` : ''}

                <!-- زرار عدد الكومنتات -->
                <div class="d-flex align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                    <!-- التعديل هنا: ضفنا justify-content-center عشان الأيقونة والكلمة يجوا في النص -->
                    <button class="btn text-light d-flex align-items-center justify-content-center gap-2 w-100 py-2"
                        style="background-color:rgba(255,255,255,0.05);border-radius:12px;">
                        <i class="bi bi-chat-text"></i>
                        <span>${post.comments_count} Comments</span>
                    </button>
                </div>

                <div class="mt-4 pt-3 border-top border-secondary border-opacity-25 px-3">
                    <h6 class="text-white mb-4 "><i class="bi bi-chat-text me-2"></i>Comments</h6>
                    ${commentsHTML}
                </div>
            </div>

            <div id="add-comment-container" class="card-footer bg-transparent border-0 p-4"
                style="border-top: 1px solid rgba(255,255,255,0.1) !important;">
                <!-- اتأكدنا إن الحاوية دي واخده w-100 -->
                <div class="d-flex align-items-center gap-3 w-100">
                    <img src="${userAvatar}" alt=""
                        style="height:45px;width:45px;object-fit:cover;"
                        class="rounded-circle border border-2 border-secondary shadow-sm">
                    
                    <input id="comment-input" type="text" class="form-control text-light custom-comment-input flex-grow-1"
                        placeholder="Write a comment..."
                        style="background-color: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 12px 20px;">
                    
                    <button class="btn btn-primary px-4 d-flex align-items-center gap-2 shadow-sm"
                        style="border-radius: 20px; font-weight: 500; white-space: nowrap;"
                        onclick="commentBtnClicked()">
                        <i class="bi bi-send-fill"></i> Comment
                    </button>
                </div>
            </div>
        </div>`;

        setupUI();

    }).catch((error) => {
        console.error('Error fetching post:', error);
    });
}

function commentBtnClicked() {
    const commentBody = document.getElementById('comment-input').value;
    const token       = localStorage.getItem('token');

    SupabaseAPI.createComment(postId, commentBody, token)
    .then(() => {
        document.getElementById('comment-input').value = "";
        getPost();
        showAlert('Comment added successfully!', 'success');
    }).catch((error) => {
        showAlert(error.response.data.message, 'danger');
    });
}