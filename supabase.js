// ============================================================
//  supabase.js  —  Supabase client + all API calls
//  No ES modules — works with normal <script src="..."> tags
// ============================================================

const SUPABASE_URL = 'https://kxfffaezxlvfbhgampkg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1_MRbzEkKR_2XadF5xl-Gg_LtuWrSZX';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ────────────────────────────────────────────────

function _ok(data) {
    return Promise.resolve({ data });
}

function _err(message, code = 422) {
    return Promise.reject({ response: { status: code, data: { message } } });
}

async function _getFullPost(postId) {
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles(*),
            comments(*, author:profiles(*)),
            post_tags(tag:tags(*))
        `)
        .eq('id', postId)
        .single();

    if (error) throw error;

    return {
        ...post,
        tags: post.post_tags.map(pt => pt.tag),
        comments_count: post.comments.length,
    };
}

// ── SupabaseAPI global object ──────────────────────────────

window.SupabaseAPI = {

    // ── AUTH ───────────────────────────────────────────────

    async register(name, username, password, profileImageFile) {
        // Check username is unique
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existing) return _err('The username has already been taken.');

        let profile_image = `https://i.pravatar.cc/150?u=${username}`;

        // Upload profile image if provided
        if (profileImageFile instanceof File) {
            const ext = profileImageFile.name.split('.').pop();
            const fileName = `avatars/${username}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, profileImageFile, { upsert: true });

            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
                profile_image = urlData.publicUrl;
            }
        }

        const { data, error } = await supabase.auth.signUp({
            email: `${username}@faresbook.app`,
            password,
            options: {
                data: { name, username, profile_image }
            }
        });

        if (error) return _err(error.message);

        const token = data.session?.access_token;
        const user  = { id: data.user.id, name, username, profile_image };

        return _ok({ token, user });
    },

    async login(username, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${username}@faresbook.app`,
            password,
        });

        if (error) return _err('Invalid credentials.', 401);

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const token = data.session.access_token;
        return _ok({ token, user: profile });
    },

    async logout() {
        await supabase.auth.signOut();
        return _ok({ message: 'Logged out successfully.' });
    },

    async updateProfile(token, { name, username, password, profile_image } = {}) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);

        let imgUrl = undefined;
        if (profile_image instanceof File) {
            const ext = profile_image.name.split('.').pop();
            const fileName = `avatars/${user.id}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, profile_image, { upsert: true });
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
                imgUrl = urlData.publicUrl;
            }
        }

        const updates = {};
        if (name)     updates.name = name;
        if (username) updates.username = username;
        if (imgUrl)   updates.profile_image = imgUrl;

        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) return _err(error.message);
        return _ok({ user: updatedProfile });
    },

    // ── USERS ──────────────────────────────────────────────

    async getUsers(limit = 10, page = 1) {
        const from = (page - 1) * limit;
        const to   = from + limit - 1;
        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .range(from, to);
        if (error) return _err(error.message);
        const last_page = Math.ceil(count / limit);
        return _ok({ data, meta: { current_page: page, last_page, total: count } });
    },

    async showUser(id) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return _err('User not found.', 404);
        return _ok({ data });
    },

    async getUserPosts(userId, limit = 5, page = 1) {
        const from = (page - 1) * limit;
        const to   = from + limit - 1;
        const { data, error, count } = await supabase
            .from('posts')
            .select(`*, author:profiles(*), comments(id), post_tags(tag:tags(*))`, { count: 'exact' })
            .eq('author_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) return _err(error.message);
        const posts = data.map(p => ({
            ...p,
            tags: p.post_tags.map(pt => pt.tag),
            comments_count: p.comments.length,
        }));
        return _ok({ data: posts, meta: { current_page: page, last_page: Math.ceil(count / limit), total: count } });
    },

    // ── POSTS ──────────────────────────────────────────────

    async getPosts(limit = 5, page = 1) {
        const from = (page - 1) * limit;
        const to   = from + limit - 1;
        const { data, error, count } = await supabase
            .from('posts')
            .select(`*, author:profiles(*), comments(id), post_tags(tag:tags(*))`, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) return _err(error.message);
        const posts = data.map(p => ({
            ...p,
            tags: p.post_tags.map(pt => pt.tag),
            comments_count: p.comments.length,
        }));
        const last_page = Math.ceil(count / limit);
        return _ok({ data: posts, meta: { current_page: page, last_page, total: count } });
    },

    async getPost(id) {
        try {
            const post = await _getFullPost(id);
            return _ok({ data: post });
        } catch (e) {
            return _err('Post not found.', 404);
        }
    },

    async createPost(title, body, imageFile, token) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);
        if (!body) return _err('The body field is required.');

        let imgUrl = null;
        if (imageFile instanceof File) {
            const ext = imageFile.name.split('.').pop();
            const fileName = `posts/${user.id}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, imageFile, { upsert: true });
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
                imgUrl = urlData.publicUrl;
            }
        }

        const { data: post, error } = await supabase
            .from('posts')
            .insert({ title: title || null, body, image: imgUrl, author_id: user.id })
            .select()
            .single();

        if (error) return _err(error.message);
        const fullPost = await _getFullPost(post.id);
        return _ok({ data: fullPost });
    },

    async updatePost(id, title, body, imageFile, token) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);

        const updates = { title: title || null, body };
        if (imageFile instanceof File) {
            const ext = imageFile.name.split('.').pop();
            const fileName = `posts/${user.id}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, imageFile, { upsert: true });
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
                updates.image = urlData.publicUrl;
            }
        }

        const { error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', id)
            .eq('author_id', user.id);

        if (error) return _err(error.message);
        const fullPost = await _getFullPost(id);
        return _ok({ data: fullPost });
    },

    async deletePost(id, token) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)
            .eq('author_id', user.id);
        if (error) return _err(error.message);
        return _ok({ message: 'Post deleted successfully.' });
    },

    // ── COMMENTS ───────────────────────────────────────────

    async createComment(postId, body, token) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);
        if (!body) return _err('The body field is required.');

        const post = await supabase.from('posts').select('id').eq('id', postId).single();
        if (post.error) return _err('Post not found.', 404);

        const { data: comment, error } = await supabase
            .from('comments')
            .insert({ body, author_id: user.id, post_id: postId })
            .select(`*, author:profiles(*)`)
            .single();

        if (error) return _err(error.message);
        return _ok({ data: comment });
    },

    // ── TAGS ───────────────────────────────────────────────

    async getTags() {
        const { data, error } = await supabase.from('tags').select('*');
        if (error) return _err(error.message);
        return _ok({ data });
    },

    async getTagPosts(tagId, limit = 5, page = 1) {
        const from = (page - 1) * limit;
        const to   = from + limit - 1;
        const { data, error, count } = await supabase
            .from('post_tags')
            .select(`post:posts(*, author:profiles(*), comments(id), post_tags(tag:tags(*)))`, { count: 'exact' })
            .eq('tag_id', tagId)
            .range(from, to);
        if (error) return _err(error.message);
        const posts = data.map(d => ({
            ...d.post,
            tags: d.post.post_tags.map(pt => pt.tag),
            comments_count: d.post.comments.length,
        }));
        return _ok({ data: posts, meta: { current_page: page, last_page: Math.ceil(count / limit), total: count } });
    },
};