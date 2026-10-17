const postList = document.getElementById('postList');
const alertArea = document.getElementById('alertArea');

const postModal = new bootstrap.Modal(document.getElementById('postModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

const form = document.getElementById('postForm');
const fields = {
  id: document.getElementById('postId'),
  title: document.getElementById('postTitle'),
  author: document.getElementById('postAuthor'),
  body: document.getElementById('postBody'),
};

let posts = [];
let pendingDeleteId = null;

// --- Helpers ---

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function showAlert(message, type = 'success') {
  alertArea.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

// --- Rendering ---

function renderPosts() {
  if (posts.length === 0) {
    postList.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="bi bi-journal-x display-4"></i>
        <p class="mt-3">No posts yet. Click <strong>New Post</strong> to write one.</p>
      </div>`;
    return;
  }

  postList.innerHTML = posts.map((post) => {
    const edited = post.updatedAt !== post.createdAt
      ? `<span class="badge text-bg-light ms-2">edited</span>` : '';
    return `
      <div class="col-md-6">
        <article class="card h-100 post-card">
          <div class="card-body">
            <h2 class="card-title h4">${escapeHtml(post.title)}</h2>
            <h6 class="card-subtitle mb-3 text-muted">
              <i class="bi bi-person"></i> ${escapeHtml(post.author)}
              &middot; ${formatDate(post.createdAt)}${edited}
            </h6>
            <p class="card-text post-body">${escapeHtml(post.body)}</p>
          </div>
          <div class="card-footer bg-transparent border-0 pb-3">
            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${post.id}">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${post.id}">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </article>
      </div>`;
  }).join('');
}

async function loadPosts() {
  try {
    posts = await api('/api/posts');
    renderPosts();
  } catch (err) {
    postList.innerHTML = '';
    showAlert(`Could not load posts: ${err.message}`, 'danger');
  }
}

// --- Create / edit ---

function openPostModal(post = null) {
  form.classList.remove('was-validated');
  document.getElementById('postModalTitle').textContent = post ? 'Edit Post' : 'New Post';
  fields.id.value = post ? post.id : '';
  fields.title.value = post ? post.title : '';
  fields.author.value = post ? post.author : '';
  fields.body.value = post ? post.body : '';
  postModal.show();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const id = fields.id.value;
  const payload = JSON.stringify({
    title: fields.title.value,
    author: fields.author.value,
    body: fields.body.value,
  });

  try {
    if (id) {
      await api(`/api/posts/${id}`, { method: 'PUT', body: payload });
      showAlert('Post updated.');
    } else {
      await api('/api/posts', { method: 'POST', body: payload });
      showAlert('Post created.');
    }
    postModal.hide();
    loadPosts();
  } catch (err) {
    showAlert(`Could not save post: ${err.message}`, 'danger');
  }
});

// --- Delete ---

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  try {
    await api(`/api/posts/${pendingDeleteId}`, { method: 'DELETE' });
    showAlert('Post deleted.', 'warning');
    deleteModal.hide();
    loadPosts();
  } catch (err) {
    showAlert(`Could not delete post: ${err.message}`, 'danger');
  }
});

// --- Wiring ---

document.getElementById('newPostBtn').addEventListener('click', () => openPostModal());

postList.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;

  const post = posts.find((p) => p.id === button.dataset.id);
  if (!post) return;

  if (button.dataset.action === 'edit') {
    openPostModal(post);
  } else if (button.dataset.action === 'delete') {
    pendingDeleteId = post.id;
    document.getElementById('deleteTitle').textContent = post.title;
    deleteModal.show();
  }
});

loadPosts();
