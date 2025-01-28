// src/components/Feed/PostActions.jsx
import React from 'react';
import { useMutation } from '@apollo/client';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { ENGAGE_POST } from '../../graphql/mutations/engagementMutations';

const PostActions = ({ post, isLiked, onLikeChange, onCommentClick }) => {
  const [engagePost] = useMutation(ENGAGE_POST);

  const handleLike = async () => {
    try {
      await engagePost({
        variables: {
          postId: post.id,
          action: isLiked ? 'UNLIKE' : 'LIKE'
        }
      });
      onLikeChange?.(!isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2">
      <div className="flex space-x-6">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={isLiked ? 'fill-current' : ''} size={20} />
          <span>{post.metrics.likeCount}</span>
        </button>

        <button
          onClick={onCommentClick}
          className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
        >
          <MessageCircle size={20} />
          <span>{post.metrics.commentCount}</span>
        </button>

        <button
          className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
        >
          <Share size={20} />
          <span>{post.metrics.shareCount}</span>
        </button>
      </div>

      <button
        className="text-gray-400 hover:text-yellow-500 transition-colors"
      >
        <Bookmark size={20} />
      </button>
    </div>
  );
};

export default PostActions;