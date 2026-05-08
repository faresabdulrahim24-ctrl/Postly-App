// ============================================================
//  supabase.js — Supabase client + all API calls
//  Include AFTER: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ============================================================

const SUPABASE_URL = 'https://kxfffaezxlvfbhgampkg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1_MRbzEkKR_2XadF5xl-Gg_LtuWrSZX';

const _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function _ok(data)           { return Promise.resolve({ data }); }
function _err(msg, code=422) { return Promise.reject({ response: { status: code, data: { message: msg } } }); }

async function _getFullPost(postId) {
    const { data: post, error } = await _db
        .from('posts')
        .select('*, author:profiles(*), comments(*, author:profiles(*)), post_tags(tag:tags(*))')
        .eq('id', postId)
        .single();
    if (error) throw error;
    return { ...post, tags: post.post_tags.map(pt => pt.tag), comments_count: post.comments.length };
}

window.SupabaseAPI = {

    // ── AUTH ───────────────────────────────────────────────────────────────

    async register(name, username, email, password, profileImageFile) {
        const { data: existing } = await _db.from('profiles').select('id').eq('username', username).maybeSingle();
        if (existing) return _err('The username has already been taken.');

        // Use a clean default avatar silhouette if no image is uploaded
        let profile_image = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236c757d"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;

        if (profileImageFile instanceof File) {
            const ext      = profileImageFile.name.split('.').pop();
            const fileName = `avatars/${username}_${Date.now()}.${ext}`;
            const { error: uploadError } = await _db.storage.from('images').upload(fileName, profileImageFile, { upsert: true });
            if (!uploadError) {
                const { data: urlData } = _db.storage.from('images').getPublicUrl(fileName);
                profile_image = urlData.publicUrl;
            }
        }

        const { data, error } = await _db.auth.signUp({
            email,
            password,
            options: { data: { name, username, profile_image } }
        });

        if (error) return _err(error.message);

        const token = data.session?.access_token;
        const user  = { id: data.user.id, name, username, profile_image };
        return _ok({ token, user });
    },

    async login(usernameOrEmail, password) {
        let emailToTry = usernameOrEmail;
        let username = usernameOrEmail;

        if (!usernameOrEmail.includes('@')) {
            // It's a username, try to construct the default email pattern
            emailToTry = `${usernameOrEmail}@postly.app`;
        }

        const { data, error } = await _db.auth.signInWithPassword({
            email: emailToTry,
            password,
        });

        if (error) {
            // If they registered with a real email but tried to login with username, we can't find their email.
            // Return generic error.
            return _err('Invalid credentials. If you registered with a real email, please use your email to login.', 401);
        }

        const actualUsername = data.user.user_metadata?.username || username;

        // Fetch profile
        const { data: profile } = await _db.from('profiles').select('*').eq('username', actualUsername).maybeSingle();

        const token = data.session.access_token;
        return _ok({ token, user: profile || data.user.user_metadata });
    },

    async logout() {
        await _db.auth.signOut();
        return _ok({ message: 'Logged out successfully.' });
    },

    // ── USERS ──────────────────────────────────────────────────────────────

    async getUsers(limit=10, page=1) {
        const from = (page-1)*limit, to = from+limit-1;
        const { data, error, count } = await _db.from('profiles').select('*', { count:'exact' }).range(from, to);
        if (error) return _err(error.message);
        return _ok({ data, meta: { current_page: page, last_page: Math.ceil(count/limit), total: count } });
    },

    async showUser(id) {
        const { data, error } = await _db.from('profiles').select('*').eq('id', id).single();
        if (error) return _err('User not found.', 404);
        return _ok({ data });
    },

    async getUserPosts(userId, limit=5, page=1) {
        const from = (page-1)*limit, to = from+limit-1;
        const { data, error, count } = await _db
            .from('posts')
            .select('*, author:profiles(*), comments(id), post_tags(tag:tags(*))', { count:'exact' })
            .eq('author_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) return _err(error.message);
        const posts = data.map(p => ({ ...p, tags: p.post_tags.map(pt=>pt.tag), comments_count: p.comments.length }));
        return _ok({ data: posts, meta: { current_page: page, last_page: Math.ceil(count/limit), total: count } });
    },

    async getUserCommentsCount(userId) {
        const { count, error } = await _db
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userId);
        if (error) return _err(error.message);
        return _ok({ count });
    },

    // ── POSTS ──────────────────────────────────────────────────────────────

    async getPosts(limit=5, page=1) {
        const from = (page-1)*limit, to = from+limit-1;
        const { data, error, count } = await _db
            .from('posts')
            .select('*, author:profiles(*), comments(id), post_tags(tag:tags(*))', { count:'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) return _err(error.message);
        const posts = data.map(p => ({ ...p, tags: p.post_tags.map(pt=>pt.tag), comments_count: p.comments.length }));
        return _ok({ data: posts, meta: { current_page: page, last_page: Math.ceil(count/limit), total: count } });
    },

    async getPost(id) {
        try {
            const post = await _getFullPost(id);
            return _ok({ data: post });
        } catch(e) {
            return _err('Post not found.', 404);
        }
    },

    async createPost(title, body, imageFile, token) {
        const { data: { user }, error: authError } = await _db.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);


        let imgUrl = null;
        if (imageFile instanceof File) {
            const ext      = imageFile.name.split('.').pop();
            const fileName = `posts/${user.id}_${Date.now()}.${ext}`;
            const { error: uploadError } = await _db.storage.from('images').upload(fileName, imageFile, { upsert: true });
            if (!uploadError) {
                const { data: urlData } = _db.storage.from('images').getPublicUrl(fileName);
                imgUrl = urlData.publicUrl;
            }
        }

        const { data: post, error } = await _db
            .from('posts')
            .insert({ title: title || null, body: body || "", image: imgUrl, author_id: user.id })
            .select()
            .single();

        if (error) return _err(error.message);
        const fullPost = await _getFullPost(post.id);
        return _ok({ data: fullPost });
    },

    async updatePost(id, title, body, imageFile, token) {
        const { data: { user }, error: authError } = await _db.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);

        const updates = { title: title || null, body: body || "" };
        if (imageFile instanceof File) {
            const ext      = imageFile.name.split('.').pop();
            const fileName = `posts/${user.id}_${Date.now()}.${ext}`;
            const { error: uploadError } = await _db.storage.from('images').upload(fileName, imageFile, { upsert: true });
            if (!uploadError) {
                const { data: urlData } = _db.storage.from('images').getPublicUrl(fileName);
                updates.image = urlData.publicUrl;
            }
        }

        const { error } = await _db.from('posts').update(updates).eq('id', id).eq('author_id', user.id);
        if (error) return _err(error.message);
        const fullPost = await _getFullPost(id);
        return _ok({ data: fullPost });
    },

    async deletePost(id, token) {
        const { data: { user }, error: authError } = await _db.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);
        const { error } = await _db.from('posts').delete().eq('id', id).eq('author_id', user.id);
        if (error) return _err(error.message);
        return _ok({ message: 'Post deleted successfully.' });
    },

    // ── COMMENTS ───────────────────────────────────────────────────────────

    async createComment(postId, body, token) {
        const { data: { user }, error: authError } = await _db.auth.getUser(token);
        if (authError || !user) return _err('Unauthenticated.', 401);
        if (!body) return _err('The body field is required.');

        const { data: comment, error } = await _db
            .from('comments')
            .insert({ body, author_id: user.id, post_id: Number(postId) })
            .select('*, author:profiles(*)')
            .single();

        if (error) return _err(error.message);
        return _ok({ data: comment });
    },

    // ── TAGS ───────────────────────────────────────────────────────────────

    async getTags() {
        const { data, error } = await _db.from('tags').select('*');
        if (error) return _err(error.message);
        return _ok({ data });
    },

    async getTagPosts(tagId, limit=5, page=1) {
        const from = (page-1)*limit, to = from+limit-1;
        const { data, error, count } = await _db
            .from('post_tags')
            .select('post:posts(*, author:profiles(*), comments(id), post_tags(tag:tags(*)))', { count:'exact' })
            .eq('tag_id', tagId)
            .range(from, to);
        if (error) return _err(error.message);
        const posts = data.map(d => ({ ...d.post, tags: d.post.post_tags.map(pt=>pt.tag), comments_count: d.post.comments.length }));
        return _ok({ data: posts, meta: { current_page: page, last_page: Math.ceil(count/limit), total: count } });
    },
};