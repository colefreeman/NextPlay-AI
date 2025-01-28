// src/components/Feed/PostCard.jsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { ENGAGE_POST } from '../../graphql/mutations/engagementMutations';
import MediaDisplay from '../Shared/MediaDisplay';
// import PostActions from './PostActions';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [engagePost] = useMutation(ENGAGE_POST);

  const handleLike = async () => {
    try {
      await engagePost({
        variables: {
          postId: post.id,
          action: isLiked ? 'UNLIKE' : 'LIKE'
        }
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Post Header */}
      <div className="p-4 flex items-center space-x-3">
        <img
          src={post.author.profile?.avatarUrl || '/default-avatar.png'}
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="font-medium text-white">{post.author.name}</h3>
          <p className="text-sm text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 py-2 text-white">
        {post.content.text}
      </div>

      {/* Media Content */}
      {post.content.mediaUrls?.length > 0 && (
        <MediaDisplay 
          media={post.content.mediaUrls[0]} 
          type={post.content.mediaType}
        />
      )}

      {/* Hashtags */}
      {post.content.hashtags?.length > 0 && (
        <div className="px-4 py-2">
          {post.content.hashtags.map(tag => (
            <span 
              key={tag} 
              className="inline-block bg-gray-700 text-blue-400 px-2 py-1 rounded-full text-sm mr-2"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={isLiked ? 'fill-current' : ''} size={20} />
              <span>{post.metrics.likeCount}</span>
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-500"
            >
              <MessageCircle size={20} />
              <span>{post.metrics.commentCount}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-400 hover:text-green-500">
              <Share size={20} />
              <span>{post.metrics.shareCount}</span>
            </button>
          </div>

          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={`${
              isSaved ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Bookmark className={isSaved ? 'fill-current' : ''} size={20} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-700">
          {/* Add comments component here */}
          <div className="space-y-4">
            {post.engagement.comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <img
                  src={comment.user.profile?.avatarUrl || '/default-avatar.png'}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="font-medium text-white">{comment.user.name}</p>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;