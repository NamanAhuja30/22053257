const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache for storing user and post data
let usersCache = new Map();
let postsCache = new Map();
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

app.use(cors());
app.use(express.json());

// Base URL for the test server
const TEST_SERVER = 'http://20.244.56.144/evaluation-service';

// Helper function to refresh cache
async function refreshCache() {
    try {
        const currentTime = Date.now();
        if (currentTime - lastCacheUpdate > CACHE_TTL) {
            const { data } = await axios.get(`${TEST_SERVER}/users`);
            usersCache.clear();
            
            // Process users and their posts
            for (const [userId, username] of Object.entries(data.users)) {
                const postsResponse = await axios.get(`${TEST_SERVER}/users/${userId}/posts`);
                const userPosts = postsResponse.data.posts;
                usersCache.set(userId, { username, postCount: userPosts.length, posts: userPosts });
                
                // Process posts and their comments
                for (const post of userPosts) {
                    const commentsResponse = await axios.get(`${TEST_SERVER}/posts/${post.id}/comments`);
                    post.comments = commentsResponse.data.comments;
                    postsCache.set(post.id, post);
                }
            }
            
            lastCacheUpdate = currentTime;
        }
    } catch (error) {
        console.error('Error refreshing cache:', error.message);
    }
}

// Get top users with highest number of posts
app.get('/users', async (req, res) => {
    try {
        await refreshCache();
        
        const topUsers = Array.from(usersCache.entries())
            .sort((a, b) => b[1].postCount - a[1].postCount)
            .map(([userId, data]) => ({
                userId,
                username: data.username,
                postCount: data.postCount
            }));
        
        res.json({ users: topUsers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top users' });
    }
});

// Get posts based on type (latest/popular)
app.get('/posts/:type', async (req, res) => {
    try {
        await refreshCache();
        const { type } = req.params;
        
        let posts = Array.from(postsCache.values());
        
        if (type === 'popular') {
            // Get posts with maximum comments
            const maxComments = Math.max(...posts.map(post => post.comments.length));
            posts = posts.filter(post => post.comments.length === maxComments);
        } else if (type === 'latest') {
            // Get latest 5 posts
            posts = posts
                .sort((a, b) => b.id - a.id)
                .slice(0, 5);
        }
        
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch ${req.params.type} posts` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});