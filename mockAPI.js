// ============================================================
//  mockAPI.js  —  Full Tarmeez API mock (runs in the browser)
//  Covers: Auth, User, Posts, Comments, Tags
//  Usage: include this file BEFORE homeScript.js / postDetailsScript.js
//  Then call MockAPI.* instead of axios.*
// ============================================================

const MockAPI = (() => {

  // ── Seed data ──────────────────────────────────────────────

  const AVATARS = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
  ];

  const db = {
    users: [
      { id: 1, name: 'Fares Ahmed', username: 'fares_dev', password: 'password123', profile_image: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, name: 'Sara Hassan', username: 'sara_h',    password: 'sara1234',    profile_image: 'https://i.pravatar.cc/150?img=2' },
      { id: 3, name: 'Mohamed Ali', username: 'moh_ali',   password: 'moh1234',     profile_image: 'https://i.pravatar.cc/150?img=3' },
      { id: 4, name: 'Nour Eldin',  username: 'nour99',    password: 'nour1234',    profile_image: 'https://i.pravatar.cc/150?img=4' },
      { id: 5, name: 'Ahmed Tarek', username: 'a_tarek',   password: 'ahmed123',    profile_image: 'https://i.pravatar.cc/150?img=5' },
    ],

    posts: [
      { id: 1, title: 'Welcome to Postly!',  body: 'This is the very first post on our platform. Glad to have you here!',           image: 'https://picsum.photos/seed/p1/800/400', tags: [{ id: 1, name: 'welcome' }, { id: 2, name: 'first' }],            author_id: 1, created_at: '2025-04-20T10:00:00.000000Z' },
      { id: 2, title: 'Sunset Photography',      body: 'Caught this beautiful sunset yesterday evening. Nature never fails to amaze.',  image: 'https://picsum.photos/seed/p2/800/400', tags: [{ id: 3, name: 'photography' }, { id: 4, name: 'nature' }],       author_id: 2, created_at: '2025-04-21T15:30:00.000000Z' },
      { id: 3, title: 'Learning JavaScript',     body: 'Just finished a great advanced JS course. Highly recommend it to everyone!',   image: null,                                    tags: [{ id: 5, name: 'coding' }, { id: 6, name: 'javascript' }],       author_id: 3, created_at: '2025-04-21T18:00:00.000000Z' },
      { id: 4, title: 'Coffee Time',             body: 'Nothing like a morning coffee to kickstart the day. What is your go-to drink?',image: 'https://picsum.photos/seed/p4/800/400', tags: [{ id: 7, name: 'coffee' }, { id: 8, name: 'morning' }],          author_id: 1, created_at: '2025-04-22T08:00:00.000000Z' },
      { id: 5, title: 'City Lights',             body: 'The city looks magical at night. Shot from the rooftop last night.',           image: 'https://picsum.photos/seed/p5/800/400', tags: [{ id: 9, name: 'city' }, { id: 10, name: 'night' }],             author_id: 4, created_at: '2025-04-22T22:00:00.000000Z' },
      { id: 6, title: 'Book Recommendation',     body: 'Just finished Atomic Habits. Absolutely life-changing. Anyone else read it?',  image: null,                                    tags: [{ id: 11, name: 'books' }, { id: 12, name: 'selfimprovement' }], author_id: 2, created_at: '2025-04-23T11:00:00.000000Z' },
      { id: 7, title: 'Friday Vibes',            body: 'Finally the weekend! What are your plans? I am thinking of a road trip.',      image: 'https://picsum.photos/seed/p7/800/400', tags: [{ id: 13, name: 'weekend' }, { id: 14, name: 'travel' }],        author_id: 5, created_at: '2025-04-23T17:00:00.000000Z' },
      { id: 8, title: 'New Project Launch',      body: 'Excited to share that I just launched my first open source project on GitHub!',image: null,                                    tags: [{ id: 15, name: 'opensource' }, { id: 5, name: 'coding' }],      author_id: 3, created_at: '2025-04-24T09:00:00.000000Z' },
    ],

    comments: [
      { id: 1,  body: 'Amazing post, thanks for sharing!', author_id: 2, post_id: 1, created_at: '2025-04-20T10:30:00.000000Z' },
      { id: 2,  body: 'Totally agree!',                    author_id: 3, post_id: 1, created_at: '2025-04-20T11:00:00.000000Z' },
      { id: 3,  body: 'Stunning shot!',                    author_id: 1, post_id: 2, created_at: '2025-04-21T16:00:00.000000Z' },
      { id: 4,  body: 'Which course did you follow?',      author_id: 4, post_id: 3, created_at: '2025-04-21T19:00:00.000000Z' },
      { id: 5,  body: 'Espresso all the way!',             author_id: 5, post_id: 4, created_at: '2025-04-22T08:30:00.000000Z' },
      { id: 6,  body: 'Coffee is life.',                   author_id: 2, post_id: 4, created_at: '2025-04-22T09:00:00.000000Z' },
      { id: 7,  body: 'The city never sleeps!',            author_id: 1, post_id: 5, created_at: '2025-04-22T22:30:00.000000Z' },
      { id: 8,  body: 'Read it twice already!',            author_id: 3, post_id: 6, created_at: '2025-04-23T12:00:00.000000Z' },
      { id: 9,  body: 'Same, going camping this weekend!', author_id: 2, post_id: 7, created_at: '2025-04-23T17:30:00.000000Z' },
      { id: 10, body: 'Enjoy the weekend!',                author_id: 4, post_id: 7, created_at: '2025-04-23T18:00:00.000000Z' },
      { id: 11, body: 'Congrats on the launch!',           author_id: 1, post_id: 8, created_at: '2025-04-24T09:30:00.000000Z' },
      { id: 12, body: 'Will definitely check it out.',     author_id: 5, post_id: 8, created_at: '2025-04-24T10:00:00.000000Z' },
    ],

    tags: [
      { id: 1,  name: 'welcome' },
      { id: 2,  name: 'first' },
      { id: 3,  name: 'photography' },
      { id: 4,  name: 'nature' },
      { id: 5,  name: 'coding' },
      { id: 6,  name: 'javascript' },
      { id: 7,  name: 'coffee' },
      { id: 8,  name: 'morning' },
      { id: 9,  name: 'city' },
      { id: 10, name: 'night' },
      { id: 11, name: 'books' },
      { id: 12, name: 'selfimprovement' },
      { id: 13, name: 'weekend' },
      { id: 14, name: 'travel' },
      { id: 15, name: 'opensource' },
    ],

    likes: [
      { id: 1, post_id: 1, user_id: 2 },
      { id: 2, post_id: 1, user_id: 3 },
      { id: 3, post_id: 2, user_id: 1 },
    ],

    tokens: {},
    nextPostId:    9,
    nextCommentId: 13,
    nextUserId:    6,
    nextTagId:     16,
    nextLikeId:    4,
  };

  // ── Restore token across page navigation ──────────────────
  // This MUST be inside the (() => { wrapper and right after db,
  // so that db is accessible when we restore the token.
  const _savedToken = localStorage.getItem('token');
  const _savedUser  = localStorage.getItem('username');
  if (_savedToken && _savedUser) {
    try {
      const _user = JSON.parse(_savedUser);
      db.tokens[_savedToken] = _user.id;
    } catch (e) {
      console.warn('MockAPI: could not restore token', e);
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  const getUser = id => db.users.find(u => u.id === id) || null;

  const getUserFromToken = token => {
    const uid = db.tokens[token];
    return uid ? getUser(uid) : null;
  };

  const publicUser = u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    profile_image: u.profile_image,
  });

  const formatPost = p => ({
    ...p,
    author: publicUser(getUser(p.author_id)),
    comments: db.comments
      .filter(c => c.post_id === p.id)
      .map(c => ({ ...c, author: publicUser(getUser(c.author_id)) })),
    comments_count: db.comments.filter(c => c.post_id === p.id).length,
    likes: db.likes.filter(l => l.post_id === p.id).map(l => ({ user_id: l.user_id })),
    likes_count: db.likes.filter(l => l.post_id === p.id).length,
  });

  const paginate = (array, limit, page) => {
    limit = parseInt(limit) || 10;
    page  = parseInt(page)  || 1;
    const total     = array.length;
    const last_page = Math.max(1, Math.ceil(total / limit));
    const data      = array.slice((page - 1) * limit, page * limit);
    return { data, meta: { current_page: page, last_page, per_page: limit, total } };
  };

  const ok  = data => Promise.resolve({ data });
  const err = (msg, code = 422) => Promise.reject({ response: { status: code, data: { message: msg } } });

  const randomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const fakeImageUrl = seed => `https://picsum.photos/seed/${seed}/800/400`;

  // ── AUTH ───────────────────────────────────────────────────

  function register(name, username, password, profile_image) {
    if (!name || !username || !password)
      return err('Name, username and password are required.');
    if (db.users.find(u => u.username === username))
      return err('The username has already been taken.');

    const imgUrl = profile_image instanceof File
      ? URL.createObjectURL(profile_image)
      : randomAvatar();

    const user = { id: db.nextUserId++, name, username, password, profile_image: imgUrl };
    db.users.push(user);

    const token = 'mock_' + user.id + '_' + Date.now();
    db.tokens[token] = user.id;

    return ok({ token, user: publicUser(user) });
  }

  function login(username, password) {
    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) return err('Invalid credentials.', 401);

    const token = 'mock_' + user.id + '_' + Date.now();
    db.tokens[token] = user.id;

    return ok({ token, user: publicUser(user) });
  }

  function logout(token) {
    if (!token || !db.tokens[token]) return err('Unauthenticated.', 401);
    delete db.tokens[token];
    return ok({ message: 'Logged out successfully.' });
  }

  function updateProfile(token, { name, username, password, profile_image } = {}) {
    const user = getUserFromToken(token);
    if (!user) return err('Unauthenticated.', 401);

    if (username && username !== user.username && db.users.find(u => u.username === username))
      return err('The username has already been taken.');

    if (name)     user.name     = name;
    if (username) user.username = username;
    if (password) user.password = password;
    if (profile_image instanceof File)
      user.profile_image = URL.createObjectURL(profile_image);

    return ok({ user: publicUser(user) });
  }

  // ── USERS ──────────────────────────────────────────────────

  function getUsers(limit = 10, page = 1) {
    const result = paginate(db.users.map(publicUser), limit, page);
    return ok(result);
  }

  function showUser(id) {
    const user = getUser(parseInt(id));
    if (!user) return err('User not found.', 404);
    return ok({ data: publicUser(user) });
  }

  function getUserPosts(userId, limit = 5, page = 1) {
    const user = getUser(parseInt(userId));
    if (!user) return err('User not found.', 404);

    const userPosts = db.posts
      .filter(p => p.author_id === parseInt(userId))
      .sort((a, b) => b.id - a.id)
      .map(formatPost);

    const result = paginate(userPosts, limit, page);
    return ok(result);
  }

  // ── POSTS ──────────────────────────────────────────────────

  function getPosts(limit = 5, page = 1) {
    const sorted = [...db.posts].sort((a, b) => b.id - a.id).map(formatPost);
    const result = paginate(sorted, limit, page);
    return ok(result);
  }

  function getPost(id) {
    const post = db.posts.find(p => p.id == id);
    if (!post) return err('Post not found.', 404);
    return ok({ data: formatPost(post) });
  }

  function createPost(title, body, image, token) {
    const user = getUserFromToken(token);
    if (!user) return err('Unauthenticated.', 401);
    if (!body)  return err('The body field is required.');

    const imgUrl = image instanceof File ? fakeImageUrl('np' + db.nextPostId) : null;
    const post = {
      id: db.nextPostId++,
      title: title || null,
      body,
      image: imgUrl,
      tags: [],
      author_id: user.id,
      created_at: new Date().toISOString(),
    };
    db.posts.push(post);
    return ok({ data: formatPost(post) });
  }

  function updatePost(id, title, body, image, token) {
    const user = getUserFromToken(token);
    if (!user) return err('Unauthenticated.', 401);

    const post = db.posts.find(p => p.id == id);
    if (!post) return err('Post not found.', 404);
    if (post.author_id !== user.id) return err('Forbidden.', 403);

    if (title !== undefined) post.title = title || null;
    if (body  !== undefined) post.body  = body;
    if (image instanceof File) post.image = fakeImageUrl('up' + id);

    return ok({ data: formatPost(post) });
  }

  function deletePost(id, token) {
    const user = getUserFromToken(token);
    if (!user) return err('Unauthenticated.', 401);

    const idx = db.posts.findIndex(p => p.id == id);
    if (idx === -1) return err('Post not found.', 404);
    if (db.posts[idx].author_id !== user.id) return err('Forbidden.', 403);

    db.posts.splice(idx, 1);
    db.comments = db.comments.filter(c => c.post_id != id);
    return ok({ message: 'Post deleted successfully.' });
  }

  // ── COMMENTS ───────────────────────────────────────────────

  function createComment(postId, body, token) {
    const user = getUserFromToken(token);
    if (!user) return err('Unauthenticated.', 401);
    if (!body) return err('The body field is required.');

    const post = db.posts.find(p => p.id == postId);
    if (!post) return err('Post not found.', 404);

    const comment = {
      id: db.nextCommentId++,
      body,
      author_id: user.id,
      post_id: parseInt(postId),
      created_at: new Date().toISOString(),
    };
    db.comments.push(comment);
    return ok({ data: { ...comment, author: publicUser(user) } });
  }

  // ── LIKES ──────────────────────────────────────────────────

  function toggleLike(postId, token) {
    const user = getUserFromToken(token);
    if (!user) return err('Unauthenticated.', 401);

    postId = parseInt(postId);
    const post = db.posts.find(p => p.id === postId);
    if (!post) return err('Post not found.', 404);

    const idx = db.likes.findIndex(l => l.post_id === postId && l.user_id === user.id);
    let liked;
    if (idx > -1) {
      db.likes.splice(idx, 1);
      liked = false;
    } else {
      db.likes.push({ id: db.nextLikeId++, post_id: postId, user_id: user.id });
      liked = true;
    }

    const likes_count = db.likes.filter(l => l.post_id === postId).length;
    return ok({ liked, likes_count });
  }

  // ── TAGS ───────────────────────────────────────────────────

  function getTags() {
    return ok({ data: db.tags });
  }

  function getTagPosts(tagId, limit = 5, page = 1) {
    const tag = db.tags.find(t => t.id == tagId);
    if (!tag) return err('Tag not found.', 404);

    const tagged = db.posts
      .filter(p => p.tags.some(t => t.id == tagId))
      .sort((a, b) => b.id - a.id)
      .map(formatPost);

    const result = paginate(tagged, limit, page);
    return ok({ ...result, tag });
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    register,
    login,
    logout,
    updateProfile,
    getUsers,
    showUser,
    getUserPosts,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    createComment,
    toggleLike,
    getTags,
    getTagPosts,
  };

})();