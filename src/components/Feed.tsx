import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import CreatePost from './CreatePost';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  userId: string;
  caption: string;
  mediaUrl: string;
  likesCount: number;
  createdAt: string;
  user: {
    username: string;
    avatarUrl: string;
  };
}

export default function Feed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = async (pageNum: number, reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${pageNum}`);
      const data = await res.json();
      
      if (data.success && data.posts) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.posts.length === 10);
      }
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchPosts(nextPage);
          return nextPage;
        });
      }
    },
    [hasMore, loading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { threshold: 1.0 });
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [observerCallback]);

  const handleLike = async (postId: string) => {
    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    } catch (e) {
      // Revert if needed (simplified here)
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto h-full overflow-y-auto bg-gray-50 flex flex-col p-4">
      <CreatePost userId={userId} onPostCreated={() => { setPage(1); fetchPosts(1, true); }} />
      
      <div className="space-y-6 pb-20">
        {posts.map(post => (
          <div key={post.id} className="bg-white border text-gray-900 border-gray-200 rounded-xl shadow-sm overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
               <div className="flex items-center space-x-3">
                 <img src={post.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`} alt={post.user?.username || 'User'} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100" />
                 <div>
                   <h3 className="font-semibold text-gray-900 text-sm">{post.user?.username || post.userId}</h3>
                   <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                   </p>
                 </div>
               </div>
               <button className="text-gray-400 hover:text-gray-600">
                 <MoreHorizontal className="w-5 h-5" />
               </button>
            </div>

            {/* Content */}
            {post.caption && (
               <p className="px-4 pb-3 text-sm text-gray-800">{post.caption}</p>
            )}
            
            {post.mediaUrl && (
               <div className="w-full max-h-[600px] bg-black flex items-center justify-center overflow-hidden">
                 <img loading="lazy" src={post.mediaUrl} alt="Post content" className="w-full h-full object-contain" />
               </div>
            )}

            {/* Interaction Footer */}
            <div className="p-4">
               <div className="flex items-center space-x-4 mb-3">
                  <button onClick={() => handleLike(post.id)} className="flex items-center space-x-1.5 group">
                     <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" />
                  </button>
                  <button className="flex items-center space-x-1.5 group">
                     <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </button>
                  <button className="flex items-center space-x-1.5 group">
                     <Share2 className="w-6 h-6 text-gray-600 group-hover:text-green-500 transition-colors" />
                  </button>
               </div>
               <div className="text-sm font-semibold text-gray-900">
                  {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
               </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="py-4 flex justify-center">
             <div className="w-6 h-6 border-2 border-gray-300 border-t-[#00a884] rounded-full animate-spin" />
          </div>
        )}
        
        {/* Infinite Scroll Anchor */}
        <div ref={observerTarget} className="h-1" />
      </div>
    </div>
  );
}
