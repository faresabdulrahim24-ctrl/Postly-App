const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postId');

getPost();

function getPost() {
    axios.get(`https://tarmeezacademy.com/api/v1/posts/${postId}`)
        .then((response) => {
            const post = response.data.data;
            const comments = post.comments;
            const author = post.author;

            let postTitle = "";
            if (post.title != null) {
                postTitle = post.title;
            }
            document.getElementById('username-span').textContent = `${author.username}'s`;

            let commentsContent = "";
            for (let comment of comments) {
                commentsContent += `
                    <div class="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-10">
                        <img src="${comment.author.profile_image}" alt="" style="height: 40px; width: 40px; object-fit: cover;"
                            class="rounded-circle border border-2 border-secondary">
                        <div>
                            <b class="text-white" style="font-size: 14px;">@${comment.author.username}</b>
                            <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 0; margin-top: 3px;">
                                ${comment.body}
                            </p>
                        </div>
                    </div>`;
            }

            let tagsHTML = "";
            if (post.tags && post.tags.length > 0) {
                tagsHTML = `
                <button class="badge rounded-pill me-1 text-light" style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); font-weight: normal; padding: 7px 10px;">
                    #${post.tags[0].name}
                </button>`;
            }
            const postContent = `
                <div class="card custom-card shadow-lg mb-5 border-0" style="background: linear-gradient(145deg, rgba(11, 19, 43, 0.7), rgba(34, 40, 49, 0.9));">
                    <div class="card-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center bg-transparent">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${author.profile_image}" alt="" style="height: 55px; width: 55px; object-fit: cover;"
                                class="rounded-circle border border-2 border-primary shadow-sm">
                            <div>
                                <b class="text-white d-flex align-items-center gap-1" style="font-size: 18px;">
                                    ${author.username} <i class="bi bi-patch-check-fill text-primary" style="font-size: 15px;"></i>
                                </b>
                                <div style="font-size: 13px; color: #adb5bd;">${post.created_at}</div>
                            </div>
                        </div>
                    </div>

                    <div class="card-body px-4">
                        <h4 class="mb-3 text-white fw-bold">${postTitle}</h4>
                        <p style="color: #e2e8f0; line-height: 1.8; font-size: 17px;">
                            ${post.body}
                        </p>

                        <div class="mb-3" id="post-tags">
                            ${tagsHTML}
                        </div>

                        ${typeof post.image === 'string' ? `<img class="w-100 post-image rounded-4 shadow-sm" src="${post.image}" alt="Post Image" style="max-height: 500px; object-fit: cover; cursor: pointer;" onclick="event.stopPropagation(); openImage('${post.image}')">` : ''}

                        <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                            <button class="btn text-light d-flex align-items-center justify-content-center gap-2 custom-action-btn flex-grow-1">
                                <i class="bi bi-chat-text"></i> <span>${post.comments_count} Comments</span>
                            </button>
                        </div>

                        <div id="comments-container" class="mt-4 pt-3 border-top border-secondary border-opacity-25 px-3">
                            <h6 class="text-white mb-4"><i class="bi bi-chat-text me-2"></i>Comments</h6>
                            ${commentsContent}
                        </div>
                    </div> 

                    <div id="add-comment-container" class="card-footer border-0 p-3" style="background-color: #212529; border-radius: 0 0 15px 15px;">
                        <div class="d-flex align-items-center gap-3">
                            <img src="./profile-pics/1.png" alt="" style="height: 40px; width: 40px; object-fit: cover;"
                                class="rounded-circle border border-2 border-secondary">
                            <input id="comment-input" type="text" class="form-control text-light" placeholder="Write a comment..." style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1);">
                            <button class="btn btn-outline-secondary text-light px-4" style="border-radius: 12px;"
                                onclick="commentBtnClicked()">Comment</button>
                        </div>
                    </div>
                </div>`;

            document.getElementById('post').innerHTML = postContent;

        }).catch((error) => {
            console.error('Error fetching post:', error);
        });
}

function commentBtnClicked() { 
    let commentBody = document.getElementById('comment-input').value;
    let params = {
        "body": commentBody
    }
    let token = localStorage.getItem('token');
    axios.post(`https://tarmeezacademy.com/api/v1/posts/${postId}/comments`, params, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then((response) => {
        getPost();
        showAlert('Comment added successfully!', 'success');
    }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger');
    });
}