import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import API from "../services/api";
import { io } from "socket.io-client";
import { Bell, CheckCircle, Heart, Sparkles, ShieldCheck, Plus, Droplet, MessageCircle, ThumbsUp, CalendarDays, Loader2 } from "lucide-react";

const compatibilityMatrix = {
    'A+': { receiving: ['A+', 'A-', 'O+', 'O-'], donating: ['A+', 'AB+'] },
    'A-': { receiving: ['A-', 'O-'], donating: ['A+', 'A-', 'AB+', 'AB-'] },
    'B+': { receiving: ['B+', 'B-', 'O+', 'O-'], donating: ['B+', 'AB+'] },
    'B-': { receiving: ['B-', 'O-'], donating: ['B+', 'B-', 'AB+', 'AB-'] },
    'AB+': { receiving: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], donating: ['AB+'] },
    'AB-': { receiving: ['AB-', 'A-', 'B-', 'O-'], donating: ['AB+', 'AB-'] },
    'O+': { receiving: ['O+', 'O-'], donating: ['A+', 'B+', 'AB+', 'O+'] },
    'O-': { receiving: ['O-'], donating: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-'] },
};

const categoryOptions = [
    'Blood Donation Experience',
    'Awareness Posts',
    'Emergency Requests',
    'Donation Camps',
    'Achievement/Milestone Posts',
];

const recipientCategoryOptions = [
    'Awareness Posts',
    'Emergency Requests',
    'Achievement/Milestone Posts',
];

const getInitialPostDraft = (role) => ({
    category: role === 'recipient' ? recipientCategoryOptions[0] : categoryOptions[0],
    content: '',
    imageUrl: '',
});

const formatRelativeTime = (dateString) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const CommunityAlerts = ({ user, requests }) => {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(user?.bloodGroup || 'A+');
    const [postDraft, setPostDraft] = useState(getInitialPostDraft(user?.role));
    const [commentDrafts, setCommentDrafts] = useState({});
    const [openCommentBoxes, setOpenCommentBoxes] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTab, setModalTab] = useState('feed');
    const [notificationCount, setNotificationCount] = useState(0);
    const [isPulsing, setIsPulsing] = useState(false);
    const feedRef = useRef(null);
    const latestPostRef = useRef(null);
    const socketRef = useRef(null);
    const [activeDonors, setActiveDonors] = useState(0);
    const [activeRecipients, setActiveRecipients] = useState(0);
    const [interactionEvents, setInteractionEvents] = useState([]);
    const postCategoryOptions = user?.role === 'recipient' ? recipientCategoryOptions : categoryOptions;
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

        const [healthTips, setHealthTips] = useState([
          'Stay hydrated before transfusion',
          'Always verify blood compatibility',
          'Keep your contact details updated',
          'Report any fever after donation immediately',
          'Eat iron-rich foods to boost blood count',
          'Get adequate sleep before donating',
          'Avoid strenuous exercise post-donation',
          'Inform staff about any medications',
          'Blood donation saves up to 3 lives',
          'Share your blood type with family',
        ]);
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [postsRes, statsRes, activeUsersRes] = await Promise.all([
                    API.get('/community/posts'),
                    axios.get('/api/admin/dashboard'),
                    API.get('/community/active-users'),
                ]);
                setAlerts([]);
                setPosts(postsRes.data || []);
                // track latest post
                const latest = (postsRes.data || [])[0];
                if (latest) latestPostRef.current = latest.createdAt;
                const fetchedStats = statsRes.data || {};
                const activeUsers = activeUsersRes.data || {};
                setStats(fetchedStats);
                setActiveDonors(activeUsers.donors ?? 0);
                setActiveRecipients(activeUsers.recipients ?? 0);
                // try fetch health tips
                try {
                    const tipsRes = await API.get('/community/health-tips');
                    if (Array.isArray(tipsRes.data) && tipsRes.data.length) setHealthTips(tipsRes.data.slice(0,4));
                } catch (e) {
                    // keep defaults
                }
            } catch (error) {
                console.error('Community data loading failed:', error);
                setAlerts([]);
                setPosts([]);
                setStats({});
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Socket.IO client setup for instant updates
    useEffect(() => {
        try {
            const token = sessionStorage.getItem('token');
            const socket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                path: '/socket.io',
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Connected to community socket:', socket.id);
            });

            socket.on('activeUsers', (counts) => {
                if (counts?.donors != null) setActiveDonors(counts.donors);
                if (counts?.recipients != null) setActiveRecipients(counts.recipients);
            });

            socket.on('newPost', (post) => {
                if (!post) return;
                setPosts((prev) => {
                    if (prev.find(p => p._id === post._id)) return prev;
                    return [post, ...prev];
                });
                setNotificationCount((c) => c + 1);
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 2200);
                latestPostRef.current = post.createdAt;
            });

            socket.on('postUpdated', (updatedPost) => {
                if (!updatedPost?._id) return;
                setPosts((prev) => prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
            });

            socket.on('personalInteraction', (interaction) => {
                if (!interaction?.updatedPost) return;
                setPosts((prev) => prev.map((post) => (post._id === interaction.updatedPost._id ? interaction.updatedPost : post)));
                setInteractionEvents((prev) => [interaction, ...prev].slice(0, 5));
                setNotificationCount((c) => c + 1);
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 2200);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection failed:', error);
            });

            socket.on('disconnect', () => {
                // console.log('socket disconnected');
            });

            return () => {
                socket.disconnect();
            };
        } catch (e) {
            // ignore socket errors
        }
    }, []);

    // Poll for new posts periodically and show bell pulse when new posts arrive
    useEffect(() => {
        const checkNew = async () => {
            try {
                const res = await API.get('/community/posts');
                const fresh = res.data || [];
                if (!fresh.length) return;
                const newest = fresh.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt))[0];
                if (latestPostRef.current && new Date(newest.createdAt) > new Date(latestPostRef.current)) {
                    setNotificationCount((c) => c + 1);
                    setIsPulsing(true);
                    setTimeout(() => setIsPulsing(false), 3000);
                }
                // update posts state (keep sorted newest first)
                setPosts(fresh.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)));
                latestPostRef.current = newest.createdAt;
            } catch (err) {
                // ignore
            }
        };
        const interval = setInterval(checkNew, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!feedRef.current) return;
        // ensure newest posts show at top, start at top
        feedRef.current.scrollTop = 0;
        const interval = setInterval(() => {
            const el = feedRef.current;
            if (el && el.scrollHeight > el.clientHeight) {
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
                    el.scrollTop = 0;
                } else {
                    el.scrollTop += 1;
                }
            }
        }, 80);
        return () => clearInterval(interval);
    }, [posts]);

    const userId = user?._id || user?.id || user?.userId || '';

    const refreshPosts = async () => {
        try {
            const res = await API.get('/community/posts');
            setPosts(res.data || []);
        } catch (error) {
            console.error('Unable to refresh community posts:', error);
        }
    };

    const handleDraftChange = (field, value) => {
        setPostDraft((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreatePost = async (event) => {
        event.preventDefault();
        if (!userId || !postDraft.content.trim()) return;
        setSubmitting(true);

        try {
            const res = await API.post('/community/posts', {
                userId,
                category: postDraft.category,
                content: postDraft.content,
                imageUrl: postDraft.imageUrl,
            });
            const created = res.data;
            setPostDraft(getInitialPostDraft(user?.role));
            // optimistic: prepend if server returned the created post
            if (created && created._id) {
                setPosts((prev) => [created, ...prev]);
                latestPostRef.current = created.createdAt || new Date().toISOString();
            } else {
                await refreshPosts();
            }
            // new post created by current user should close modal and clear notification
            setShowModal(false);
            setNotificationCount(0);
        } catch (error) {
            console.error('Could not publish post:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleLike = async (postId) => {
        if (!userId) return;
        try {
            await API.post(`/community/posts/${postId}/like`, { userId });
            await refreshPosts();
        } catch (error) {
            console.error('Unable to update like:', error);
        }
    };

    const handleCommentDraft = (postId, value) => {
        setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
    };

    const handleAddComment = async (postId) => {
        const text = commentDrafts[postId]?.trim();
        if (!userId || !text) return;

        try {
            await API.post(`/community/posts/${postId}/comments`, { userId, text });
            setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
            await refreshPosts();
        } catch (error) {
            console.error('Unable to add comment:', error);
        }
    };

    const toggleCommentBox = (postId) => {
        setOpenCommentBoxes((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const compatibility = compatibilityMatrix[selectedGroup] || compatibilityMatrix['A+'];
        const liveFeed = (posts && posts.length)
            ? // sort newest first and take top 6
                posts
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 6)
            : [
                { _id: '1', authorName: 'Rahul', authorRole: 'Donor', content: 'Donated blood today ❤️', likes: [1,2,3], comments: [{_id:'c1'}], createdAt: new Date().toISOString() },
                { _id: '2', authorName: 'Admin', authorRole: 'Admin', content: 'Blood donation camp on Sunday.', likes: [1,2], comments: [{_id:'c1'},{_id:'c2'}], createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
                { _id: '3', authorName: 'Ayesha', authorRole: 'Recipient', content: 'Thank you donor community 🙏', likes: [1,2,3,4], comments: [{_id:'c1'}], createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
        ];

    const isOwnPost = (post) => {
        const postAuthorId = post.author?._id || post.author;
        return postAuthorId && String(postAuthorId) === String(userId);
    };

    const ownPostLikes = posts.filter(isOwnPost).reduce((acc, post) => acc + (post.likes?.length || 0), 0);
    const ownPostComments = posts.filter(isOwnPost).reduce((acc, post) => acc + (post.comments?.length || 0), 0);

    const statsWidgets = [
      { label: 'Active Donors Now', value: activeDonors, color: 'bg-blue-100 text-blue-700' },
      { label: 'Active Recipients', value: activeRecipients, color: 'bg-purple-100 text-purple-700' },
      { label: 'Your Post Likes', value: ownPostLikes, color: 'bg-red-100 text-red-700' },
      { label: 'Your Post Comments', value: ownPostComments, color: 'bg-orange-100 text-orange-700' },
    ];

    const latestInteractions = posts
        .filter(isOwnPost)
        .flatMap((post) => {
            const comments = (post.comments || []).map((comment) => ({
                type: 'comment',
                message: `${comment.authorName || 'Someone'} commented on your post`,
                detail: comment.text || post.category,
                createdAt: comment.createdAt || post.createdAt,
            }));
            const likes = (post.likes || []).map((like) => {
                let likerName = 'Someone';
                if (typeof like === 'object' && like !== null) {
                    likerName = like.fullName || like.authorName || 'Someone';
                }
                return {
                    type: 'like',
                    message: `${likerName} liked your post`,
                    detail: post.category,
                    createdAt: post.updatedAt || post.createdAt,
                };
            });
            return [...comments, ...likes];
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    const displayInteractions = [...interactionEvents, ...latestInteractions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    if (loading) {
        return (
            <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
                <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" />
                Loading community wall...
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 p-8">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur-sm shadow-xl shadow-pink-100/40 p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.35em] text-red-600">Community Hub ❤️</p>
                        <h2 className="mt-3 text-3xl font-black text-gray-900">Live Community Feed</h2>
                        <p className="mt-2 text-gray-500 max-w-2xl">Latest community updates, donor stories, and recipient gratitude keep this wall alive.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-3xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Latest first</div>
                        <button
                            onClick={() => { setShowModal(true); setModalTab('create'); setNotificationCount(0); }}
                            className={`relative inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/90 shadow-sm transition ${isPulsing ? 'bell-pulse' : ''}`}
                        >
                            <Bell className="text-red-600" size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">{notificationCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
                    <div ref={feedRef} className="max-h-[520px] space-y-4 overflow-y-auto pr-2 scroll-smooth">
                        {liveFeed.map((item) => (
                            <div key={item._id} className="rounded-[1.75rem] border border-gray-200 bg-red-50 p-5 shadow-sm transition hover:shadow-md hover:-translate-y-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700 font-bold">{item.authorName?.charAt(0) || 'U'}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{item.authorName || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{item.authorRole || 'Community'}</div>
                                    </div>
                                    <span className="ml-auto text-xs uppercase tracking-[0.24em] text-gray-400">{formatRelativeTime(item.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 text-base leading-relaxed">“{item.content || item.message}”</p>
                                {item.imageUrl && (
                                    <img
                                        src={item.imageUrl}
                                        alt="Community post"
                                        className="mt-4 h-56 w-full rounded-3xl object-cover border border-gray-200"
                                    />
                                )}
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleLike(item._id)}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-red-50"
                                    >
                                        <Heart className="w-4 h-4 text-red-500" />
                                        Like {item.likes?.length ?? item.likes ?? 0}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleCommentBox(item._id)}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-red-50"
                                    >
                                        <MessageCircle className="w-4 h-4 text-gray-500" />
                                        Comment {item.comments?.length ?? item.comments ?? 0}
                                    </button>
                                </div>
                                {openCommentBoxes[item._id] && (
                                    <div className="mt-4 rounded-3xl bg-white p-4 border border-gray-200">
                                        <textarea
                                            rows={3}
                                            value={commentDrafts[item._id] || ''}
                                            onChange={(e) => handleCommentDraft(item._id, e.target.value)}
                                            className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                                            placeholder="Write a comment..."
                                        />
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleAddComment(item._id)}
                                                className="inline-flex items-center justify-center rounded-3xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Post Comment
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div>
                                <p className="text-sm uppercase tracking-[0.35em] text-red-600">Blood Compatibility Visualizer</p>
                                <h3 className="mt-3 text-2xl font-black text-gray-900">See who can match</h3>
                            </div>
                            <span className="text-sm text-gray-500">Interactive</span>
                        </div>
                        <div className="mb-6 flex flex-col items-center gap-4">
                            <div className="compat-map relative w-full max-w-sm h-56">
                                <div className="compat-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-black shadow-sm w-20 h-20">
                                    {selectedGroup}
                                </div>
                                {(() => {
                                    const visualGroups = ['A+', 'O-', 'B+', 'AB-', 'O+', 'A-'];
                                    const radius = 92;
                                    return visualGroups.map((g, i) => {
                                        const angle = (i / visualGroups.length) * Math.PI * 2 - Math.PI / 2;
                                        const x = Math.round(Math.cos(angle) * radius);
                                        const y = Math.round(Math.sin(angle) * radius * 0.65);
                                        const isCompatible = (compatibility.receiving || []).includes(g) || (compatibility.donating || []).includes(g) || selectedGroup === g;
                                        return (
                                            <button
                                                key={g}
                                                onClick={() => setSelectedGroup(g)}
                                                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                                                className={`compat-node absolute flex items-center justify-center w-14 h-14 rounded-full border shadow-sm font-bold transition-transform ${selectedGroup === g ? 'ring-4 ring-red-200 scale-105' : ''} ${isCompatible ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200'}`}
                                            >
                                                {g}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="w-full rounded-3xl bg-red-50 p-4 border border-red-100">
                                <div className="text-sm uppercase tracking-[0.24em] text-red-600 font-semibold">{selectedGroup} details</div>
                                <div className="mt-3 grid gap-3">
                                    <div className="flex items-center justify-between rounded-3xl bg-white p-3 border border-gray-100">
                                        <span className="font-semibold">Can Receive From</span>
                                        <span className="text-sm text-gray-500">{(compatibility.receiving || []).join(', ')}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-3xl bg-white p-3 border border-gray-100">
                                        <span className="font-semibold">Can Donate To</span>
                                        <span className="text-sm text-gray-500">{(compatibility.donating || []).join(', ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.35em] text-red-600">Community Quick Stats</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-1">
                            {statsWidgets.map((widget) => (
                                <div key={widget.label} className={`rounded-3xl p-5 ${widget.color}`}>
                                    <div className="text-3xl font-black">{widget.value}</div>
                                    <div className="mt-2 text-sm font-semibold text-gray-700">{widget.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                            <p className="text-sm uppercase tracking-[0.35em] text-red-600">Health Tips</p>
                            <h3 className="mt-3 text-2xl font-black text-gray-900">Quick wellness cards</h3>
                        </div>
                        <span className="text-sm text-gray-500">Swipe</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {healthTips.map((tip, idx) => (
                            <div key={idx} className="min-w-[220px] rounded-[1.75rem] bg-gradient-to-br from-red-50 via-pink-50 to-white p-5 shadow-sm border border-white/80">
                                <div className="mb-3 text-sm uppercase tracking-[0.35em] text-red-600">Tip {idx + 1}</div>
                                <p className="text-gray-700 font-semibold">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.35em] text-red-600">Community Dialog</p>
                            <h2 className="mt-2 text-2xl font-black text-gray-900">Create or browse posts</h2>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="rounded-full bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                        >
                            Close
                        </button>
                    </div>
                    <div className="mb-5 flex gap-3">
                        {['feed', 'create'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setModalTab(tab)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${modalTab === tab ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {tab === 'feed' ? 'Feed' : 'New Post'}
                            </button>
                        ))}
                    </div>
                    {displayInteractions.length > 0 && (
                        <div className="mb-5 rounded-[1.75rem] border border-gray-200 bg-red-50 p-4">
                            <p className="text-xs uppercase tracking-[0.35em] text-red-600">Your post interactions</p>
                            <div className="mt-3 space-y-3">
                                {displayInteractions.map((interaction, idx) => (
                                    <div key={`${interaction.type}-${idx}`} className="rounded-3xl bg-white p-3 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-semibold text-gray-900">{interaction.type === 'comment' ? 'Comment' : 'Like'}</span>
                                            <span className="text-xs text-gray-500">{formatRelativeTime(interaction.createdAt)}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {interaction.message}
                                            {interaction.detail && interaction.type === 'comment' ? `: "${interaction.detail}"` : ''}
                                            {interaction.detail && interaction.type === 'like' ? ` on ${interaction.detail}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {modalTab === 'feed' ? (
                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                            {liveFeed.length ? liveFeed.map((item) => (
                                <div key={item._id} className="rounded-[1.75rem] border border-gray-200 bg-red-50 p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700 font-bold">{item.authorName?.charAt(0) || 'U'}</div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{item.authorName || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{item.authorRole || 'Community'}</div>
                                        </div>
                                        <span className="ml-auto text-xs uppercase tracking-[0.24em] text-gray-400">{formatRelativeTime(item.createdAt)}</span>
                                    </div>
                                    <p className="text-gray-700 text-base leading-relaxed">“{item.content || item.message}”</p>
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt="Community post"
                                            className="mt-4 h-56 w-full rounded-3xl object-cover border border-gray-200"
                                        />
                                    )}
                                </div>
                            )) : (
                                <div className="rounded-[1.75rem] border border-gray-200 bg-red-50 p-5 shadow-sm text-gray-500">No posts yet. Be the first to share.</div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <select
                                value={postDraft.category}
                                onChange={(e) => handleDraftChange('category', e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900"
                            >
                                {postCategoryOptions.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <textarea
                                rows={5}
                                placeholder="Write something to the community..."
                                value={postDraft.content}
                                onChange={(e) => handleDraftChange('content', e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                            />
                            <input
                                type="text"
                                placeholder="Optional image URL"
                                value={postDraft.imageUrl}
                                onChange={(e) => handleDraftChange('imageUrl', e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                            />
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-gray-500">Post will be shared with donors and recipients.</p>
                                <button
                                    type="submit"
                                    disabled={submitting || !postDraft.content.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? 'Posting...' : 'Post update'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}
            <style>{`
                .compat-map { position: relative; }
                .compat-node { transform: translate(-50%, -50%); }
                .compat-node:hover { transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
                .compat-center { backdrop-filter: blur(6px); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .modal-overlay { }
                .modal-backdrop { }
                .modal { }
                .bell-pulse { animation: bellPulse 1.6s infinite ease-in-out; }
                @keyframes bellPulse { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }
            `}</style>
        </>
    );
};

export default CommunityAlerts;
