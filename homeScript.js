getPosts();

// infinite scroll
let currentPage = 1;
let lastPageReached = 1;
window.addEventListener('scroll', function () {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight; 
    if (endOfPage && currentPage < lastPageReached) {
        getPosts(false,currentPage++);
    }
})

function getPosts(reload = true, page = 1) {
    axios.get(`https://tarmeezacademy.com/api/v1/posts?limit=5&page=${page}`)
        .then((response) => {
            let posts = response.data.data;
            lastPageReached = response.data.meta.last_page;
            if (reload) {
                document.getElementById('posts').innerHTML = "";
            }
            for (let post of posts) {
                let author = post.author;
                let postTitle = "";
                if (post.title != null) {
                    postTitle = post.title;
                }

                let content = `
            <div class="card custom-card shadow-lg mb-5">

                        <div class="card-header">
                            <img src="${author.profile_image}" alt="" style="height: 45px; width: 45px; object-fit: cover;"
                                class="rounded-circle border border-2 border-secondary">
                            <div>
                                <b style="font-size: 16px;">@${author.username}</b>
                                <div style="font-size: 12px; color: #adb5bd;">${post.created_at}</div>
                            </div>
                            <button class="btn btn-outline-secondary" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post)).replace(/'/g, "%27")}')" style="border-radius: 50%; padding: 8px; margin-left: auto;">  
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>

                        <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">

                            <h5 class="mb-3 text-white">${postTitle}</h5>

                            <p style="color: #cbd5e1; line-height: 1.6;">
                                ${post.body}
                            </p>

                            ${typeof post.image === 'string' ? `<img class="w-100 post-image" src="${post.image}" alt="Post Image" style="cursor: pointer;" onclick="openImage('${post.image}')">` : ''}

                            <div class="mt-3 mb-2" id="post-tags-${post.id}">
                            </div>

                            <hr>
                            <hr>

                            <div class="d-flex mt-3">
                                <button
                                    class="btn text-light d-flex align-items-center justify-content-center gap-2 w-100 py-2"
                                    style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; transition: 0.3s;">
                                    <i class="bi bi-chat-right-text"></i>
                                    <span>${post.comments_count} Comments
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>`
                document.getElementById('posts').innerHTML += content;
            
                const currentPostTagsId = `post-tags-${post.id}`;
                document.getElementById(currentPostTagsId).innerHTML = "";
                for (tag of post.tags) {
                    console.log(tag.name);
                    let tagsContent = `<button id="post-tags-${post.id}" class="badge rounded-pill me-1 text-light" style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); font-weight: normal; padding: 5px 10px;">
                                  ${tag.name}
                                  </button>`
                    document.getElementById(currentPostTagsId).innerHTML += tagsContent;
                }
            }

        }).catch((error) => {
        console.error('Error fetching posts:', error);
    });
}

function createPostBtnClicked() {
    let postId = document.getElementById("post-id").value;
    let isCreate = postId == null || postId == "";

    let header = document.getElementById("post-header-input").value;
    let content = document.getElementById("post-content-input").value;
    let image = document.getElementById("post-image-input").files[0];
    
    let formData = new FormData();
    formData.append('title', header);
    formData.append('body', content);
    if (image != null) {
        formData.append('image', image);
    }
    
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    };

    let url = `https://tarmeezacademy.com/api/v1/posts`;
    if (!isCreate) {
        url = `https://tarmeezacademy.com/api/v1/posts/${postId}`;
        formData.append('_method', 'put');
    }
    
    axios.post(url, formData, {
        headers: headers
    })
    .then((response) => {
        showAlert(isCreate ? 'Post created successfully!' : 'Post updated successfully!', 'success');
        const modal = document.getElementById('add-post-modal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        getPosts();
        
        // Reset the form
        document.getElementById("post-id").value = "";
        document.getElementById("post-header-input").value = "";
        document.getElementById("post-content-input").value = "";
        document.getElementById("post-image-input").value = "";
    }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger');
        console.error('Action failed:', message);
    });
}

function editPostBtnClicked(postObject) {
    if (!postObject) return;
    let post = JSON.parse(decodeURIComponent(postObject));

    document.getElementById("post-id").value = post.id;
    document.getElementById("addPostModalTitle").innerHTML = "Edit Post";
    document.getElementById("post-header-input").value = post.title;
    document.getElementById("post-content-input").value = post.body;
    // We cannot programmatically set the value of an <input type="file"> for security reasons
    // document.getElementById("post-image-input").value = post.image;
    
    let postModal = new bootstrap.Modal(document.getElementById('add-post-modal'), {});
    postModal.toggle();
}

function postClicked(postId) { 
    if (postId === undefined || postId === null) return;
    window.location.href = `postDetails.html?postId=${postId}`;
}
