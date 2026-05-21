import express from 'express';
import { getPosts, createPost, toggleLikePost, addComment, getActiveUsers, getHealthTips } from '../controllers/communityController.js';
import updateActivity from '../middleware/updateActivity.js';

const router = express.Router();

router.use(updateActivity);

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/like', toggleLikePost);
router.post('/posts/:id/comments', addComment);
router.get('/active-users', getActiveUsers);
router.get('/health-tips', getHealthTips);

export default router;
