import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';

const normalizeUserId = (userId) => {
  if (!userId) return null;
  return typeof userId === 'string' ? userId : userId?._id || userId?.id || null;
};

const emitSocketEvent = (req, event, payload) => {
  req?.app?.locals?.io?.emit(event, payload);
};

export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .populate('likes', 'fullName')
      .populate('author', 'fullName role')
      .populate({ path: 'comments.author', select: 'fullName role' });

    // Format posts with latest 3 likes and comments
    const formattedPosts = posts.map(post => {
      // Get latest 3 likes with formatted text
      const latest3Likes = [];
      if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
        // Get last 3 likes in reverse order (newest first)
        const likesToShow = post.likes.slice(Math.max(0, post.likes.length - 3));
        for (let i = likesToShow.length - 1; i >= 0; i--) {
          const user = likesToShow[i];
          if (user && user.fullName) {
            latest3Likes.push({
              userName: user.fullName,
              text: `${user.fullName} liked your post`
            });
          }
        }
      }
      
      // Get latest 3 comments with formatted text
      const latest3Comments = [];
      if (post.comments && Array.isArray(post.comments) && post.comments.length > 0) {
        // Get last 3 comments in reverse order (newest first)
        const commentsToShow = post.comments.slice(Math.max(0, post.comments.length - 3));
        for (let i = commentsToShow.length - 1; i >= 0; i--) {
          const comment = commentsToShow[i];
          if (comment && comment.authorName && comment.text) {
            latest3Comments.push({
              authorName: comment.authorName,
              text: `${comment.authorName} commented: ${comment.text}`
            });
          }
        }
      }
      
      return {
        _id: post._id,
        author: post.author,
        authorName: post.authorName,
        authorRole: post.authorRole,
        bloodGroup: post.bloodGroup,
        category: post.category,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        totalLikes: post.likes ? post.likes.length : 0,
        totalComments: post.comments ? post.comments.length : 0,
        latestLikes: latest3Likes,
        latestComments: latest3Comments
      };
    });

    return res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return res.status(500).json({ message: 'Could not load community posts.' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { userId, category, content, imageUrl } = req.body;
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) {
      return res.status(400).json({ message: 'User identifier is required.' });
    }

    const user = await User.findById(normalizedId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const newPost = new CommunityPost({
      author: user._id,
      authorName: user.fullName,
      authorRole: user.role,
      bloodGroup: user.bloodGroup,
      category: category || 'Blood Donation Experience',
      content: content?.trim() || '',
      imageUrl: imageUrl?.trim() || '',
    });

    await newPost.save();
    const populatedPost = await CommunityPost.findById(newPost._id)
      .populate('likes', 'fullName')
      .populate('author', 'fullName role')
      .populate({ path: 'comments.author', select: 'fullName role' });

    emitSocketEvent(req, 'newPost', populatedPost);
    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating community post:', error);
    return res.status(500).json({ message: 'Could not create community post.' });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) {
      return res.status(400).json({ message: 'User identifier is required to like a post.' });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const existingIndex = post.likes.findIndex((likeId) => likeId.toString() === normalizedId);
    if (existingIndex >= 0) {
      post.likes.splice(existingIndex, 1);
    } else {
      post.likes.push(normalizedId);
    }

    await post.save();
    const updatedPost = await CommunityPost.findById(id)
      .populate('likes', 'fullName')
      .populate('author', 'fullName role')
      .populate({ path: 'comments.author', select: 'fullName role' });

    emitSocketEvent(req, 'postUpdated', updatedPost);
    if (existingIndex < 0 && post.author?.toString() !== normalizedId) {
      const actor = await User.findById(normalizedId).select('fullName');
      const actorName = actor?.fullName || 'Someone';
      const io = req?.app?.locals?.io;
      io?.to(post.author.toString()).emit('personalInteraction', {
        type: 'like',
        actorName,
        postId: post._id,
        createdAt: new Date(),
        updatedPost,
      });
    }
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error toggling like on community post:', error);
    return res.status(500).json({ message: 'Could not update like status.' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId || !text?.trim()) {
      return res.status(400).json({ message: 'User and comment text are both required.' });
    }

    const user = await User.findById(normalizedId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    post.comments.push({
      author: user._id,
      authorName: user.fullName,
      authorRole: user.role,
      text: text.trim(),
    });

    await post.save();
    const updatedPost = await CommunityPost.findById(id)
      .populate('likes', 'fullName')
      .populate('author', 'fullName role')
      .populate({ path: 'comments.author', select: 'fullName role' });

    emitSocketEvent(req, 'postUpdated', updatedPost);
    const io = req?.app?.locals?.io;
    if (post.author?.toString() !== normalizedId) {
      io?.to(post.author.toString()).emit('personalInteraction', {
        type: 'comment',
        actorName: user.fullName,
        commentText: text.trim(),
        postId: post._id,
        createdAt: new Date(),
        updatedPost,
      });
    }
    return res.status(201).json(updatedPost);
  } catch (error) {
    console.error('Error adding comment to community post:', error);
    return res.status(500).json({ message: 'Could not add comment.' });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const userSockets = req?.app?.locals?.userSockets;
    if (userSockets) {
      const activeCounts = { donors: 0, recipients: 0 };
      for (const [, { role }] of userSockets) {
        if (role === 'donor') activeCounts.donors += 1;
        if (role === 'recipient') activeCounts.recipients += 1;
      }
      return res.status(200).json(activeCounts);
    }

    const donors = await User.countDocuments({ role: 'donor' });
    const recipients = await User.countDocuments({ role: 'recipient' });
    return res.status(200).json({ donors, recipients });
  } catch (error) {
    console.error('Error fetching active users:', error);
    return res.status(500).json({ message: 'Could not fetch active user counts.' });
  }
};

export const getHealthTips = async (req, res) => {
  try {
    const tips = [
      'Stay hydrated before transfusion',
      'Always verify blood compatibility',
      'Keep your contact details updated',
      'Report any fever after donation immediately',
      'Eat iron-rich foods to boost blood count',
      'Get adequate sleep before donating',
      'Avoid strenuous exercise post-donation',
      'Inform staff about any medications',
      'Blood donation can save multiple lives',
      'Share your blood type with family and friends',
    ];
    return res.status(200).json(tips);
  } catch (error) {
    console.error('Error fetching health tips:', error);
    return res.status(500).json({ message: 'Could not fetch health tips.' });
  }
};
