// src/components/Feed/CreatePost.jsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Image, Video, File, X } from 'lucide-react';
import { CREATE_POST } from '../../graphql/mutations/postMutations';
import { GET_FEED } from '../../graphql/queries/feedQueries';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [postType, setPostType] = useState('TEXT');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isLoading, setIsLoading] = useState(false);

  const [createPost] = useMutation(CREATE_POST, {
    update(cache, { data: { createPost } }) {
      try {
        const { feed } = cache.readQuery({
          query: GET_FEED,
          variables: { 
            filter: { visibility: ['PUBLIC'] },
            pagination: { limit: 10 }
          }
        });

        cache.writeQuery({
          query: GET_FEED,
          variables: { 
            filter: { visibility: ['PUBLIC'] },
            pagination: { limit: 10 }
          },
          data: {
            feed: {
              ...feed,
              posts: [createPost, ...feed.posts]
            }
          }
        });
      } catch (error) {
        console.error('Error updating cache:', error);
      }
    }
  });

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles([...mediaFiles, ...files]);
    setPostType(files[0]?.type.includes('image') ? 'IMAGE' : 'VIDEO');
  };

  const removeMedia = (index) => {
    setMediaFiles(files => files.filter((_, i) => i !== index));
    if (mediaFiles.length <= 1) setPostType('TEXT');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsLoading(true);
    try {
      // TODO: Handle media upload to cloud storage
      const mediaUrls = []; // Replace with actual upload logic

      await createPost({
        variables: {
          input: {
            type: postType,
            content: {
              text: content,
              mediaUrls,
              hashtags: content.match(/#[\w]+/g) || []
            },
            visibility
          }
        }
      });

      setContent('');
      setMediaFiles([]);
      setPostType('TEXT');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-gray-700 text-white rounded-lg p-4 min-h-[120px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        />

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex space-x-4">
            {/* Media Upload Buttons */}
            <label className="cursor-pointer text-gray-400 hover:text-blue-500">
              <Image size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMediaUpload}
                disabled={isLoading}
              />
            </label>
            <label className="cursor-pointer text-gray-400 hover:text-blue-500">
              <Video size={20} />
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleMediaUpload}
                disabled={isLoading}
              />
            </label>
            <label className="cursor-pointer text-gray-400 hover:text-blue-500">
              <File size={20} />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleMediaUpload}
                disabled={isLoading}
              />
            </label>
          </div>

          {/* Visibility Selector */}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="PUBLIC">Public</option>
            <option value="TEAM">Team Only</option>
            <option value="PRIVATE">Private</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!content.trim() && mediaFiles.length === 0)}
            className={`px-6 py-2 rounded-lg font-medium ${
              isLoading || (!content.trim() && mediaFiles.length === 0)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;