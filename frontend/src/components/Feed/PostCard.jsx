import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { ENGAGE_POST } from '../../graphql/mutations/engagementMutations';
import MediaDisplay from '../Shared/MediaDisplay';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const defaultProfilePicture = '/default-profile.png';

  const [engagePost] = useMutation(ENGAGE_POST, {
    onError: (error) => {
      console.error('Error engaging with post:', error);
      setIsLiked(!isLiked);
    }
  });

  const handleLike = async () => {
    try {
      await engagePost({
        variables: {
          postId: post.id,
          action: isLiked ? 'UNLIKE' : 'LIKE'
        },
        optimisticResponse: {
          engagePost: {
            success: true,
            post: {
              id: post.id,
              metrics: {
                ...post.metrics,
                likeCount: post.metrics.likeCount + (isLiked ? -1 : 1)
              }
            }
          }
        }
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Post Header */}
      <div className="p-4 flex items-center space-x-3">
        <a href={`/profile/${post.author.id}`} className="hover:opacity-75 transition-opacity">
          <img
            src={post.author.profile?.profilePicture || defaultProfilePicture}
            alt={`${post.author.name}'s profile`}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.src = defaultProfilePicture;
            }}
          />
        </a>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <a 
              href={`/profile/${post.author.id}`}
              className="font-medium text-white hover:text-blue-400 transition-colors"
            >
              <h3>{post.author.name}</h3>
            </a>
            <span className="text-sm text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>
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
          thumbnailUrl={post.content.thumbnailUrl}
          title={post.content.title}
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
              disabled={!post.settings?.allowReactions}
            >
              <Heart className={isLiked ? 'fill-current' : ''} size={20} />
              <span>{post.metrics?.likeCount || 0}</span>
            </button>

            <button 
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-500"
              disabled={!post.settings?.allowComments}
            >
              <MessageCircle size={20} />
              <span>{post.metrics?.commentCount || 0}</span>
            </button>

            <button 
              className="flex items-center space-x-2 text-gray-400 hover:text-green-500"
              disabled={!post.settings?.allowShares}
            >
              <Share size={20} />
              <span>{post.metrics?.shareCount || 0}</span>
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
    </div>
  );
};

export default PostCard;