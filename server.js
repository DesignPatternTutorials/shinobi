const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- JSON file helpers ---

function readPosts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writePosts(posts) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

function validatePost(body) {
  const { title, author, body: content } = body;
  if (!title || !title.trim()) return 'Title is required';
  if (!author || !author.trim()) return 'Author is required';
  if (!content || !content.trim()) return 'Body is required';
  return null;
}

// --- API routes ---

// List all posts (newest first)
app.get('/api/posts', (req, res) => {
  const posts = readPosts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(posts);
});

// Get a single post
app.get('/api/posts/:id', (req, res) => {
  const post = readPosts().find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Create a post
app.post('/api/posts', (req, res) => {
  const error = validatePost(req.body);
  if (error) return res.status(400).json({ error });

  const now = new Date().toISOString();
  const post = {
    id: crypto.randomUUID(),
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    body: req.body.body.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const posts = readPosts();
  posts.push(post);
  writePosts(posts);
  res.status(201).json(post);
});

// Update a post
app.put('/api/posts/:id', (req, res) => {
  const error = validatePost(req.body);
  if (error) return res.status(400).json({ error });

  const posts = readPosts();
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.title = req.body.title.trim();
  post.author = req.body.author.trim();
  post.body = req.body.body.trim();
  post.updatedAt = new Date().toISOString();

  writePosts(posts);
  res.json(post);
});

// Delete a post
app.delete('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const remaining = posts.filter((p) => p.id !== req.params.id);
  if (remaining.length === posts.length) {
    return res.status(404).json({ error: 'Post not found' });
  }
  writePosts(remaining);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Shinobi running at http://localhost:${PORT}`);
});
