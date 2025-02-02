import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Image, Video, File, X } from 'lucide-react';
import { CREATE_POST } from '../graphql/mutations/postMutations';
import { GET_FEED } from '../graphql/queries/feedQueries';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    content: {
      text: '',
      hashtags: [],
      mediaUrls: [],
      title: ''
    },
    type: 'TEXT',
    visibility: 'PUBLIC'
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [createPost] = useMutation(CREATE_POST, {
    onCompleted: (data) => {
      console.log('Mutation completed with data:', data);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
    update(cache, { data }) {
      console.log('Update cache called with data:', data);
      try {
        if (!data?.createPost) {
          console.warn('No data returned from createPost mutation');
          return;
        }

        const existingFeed = cache.readQuery({
          query: GET_FEED,
          variables: { 
            filter: { visibility: ['PUBLIC'] },
            pagination: { limit: 10 }
          }
        });

        console.log('Existing feed:', existingFeed);

        if (existingFeed?.feed) {
          cache.writeQuery({
            query: GET_FEED,
            variables: { 
              filter: { visibility: ['PUBLIC'] },
              pagination: { limit: 10 }
            },
            data: {
              feed: {
                ...existingFeed.feed,
                posts: [data.createPost, ...existingFeed.feed.posts]
              }
            }
          });
        }
      } catch (error) {
        console.error('Error updating cache:', error);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let postType = 'TEXT';
      if (mediaFiles.length > 0) {
        const fileType = mediaFiles[0].type;
        if (fileType.startsWith('image/')) postType = 'IMAGE';
        else if (fileType.startsWith('video/')) postType = 'VIDEO';
        else if (fileType.startsWith('application/')) postType = 'DOCUMENT';
      }

      const postData = {
        content: {
          text: formData.content.text.trim(),
          hashtags: formData.content.hashtags,
          mediaUrls: formData.content.mediaUrls,
          title: formData.content.title
        },
        type: postType,
        visibility: formData.visibility
      };

      console.log('Submitting post data:', postData);

      const response = await createPost({
        variables: {
          input: postData
        }
      });

      console.log('Mutation response:', response);

      if (response?.data?.createPost) {
        setFormData({
          content: {
            text: '',
            hashtags: [],
            mediaUrls: [],
            title: ''
          },
          type: 'TEXT',
          visibility: 'PUBLIC'
        });
        setMediaFiles([]);
      } else {
        console.error('No data in response:', response);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component stays the same
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles([...mediaFiles, ...files]);
    
    // Update form data with media type
    const fileType = files[0]?.type;
    let mediaType = 'TEXT';
    if (fileType?.startsWith('image/')) mediaType = 'IMAGE';
    else if (fileType?.startsWith('video/')) mediaType = 'VIDEO';
    else if (fileType?.startsWith('application/')) mediaType = 'DOCUMENT';

    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        mediaType
      }
    }));
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    if (mediaFiles.length <= 1) {
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          mediaType: 'TEXT'
        }
      }));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={formData.content.text}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            content: {
              ...prev.content,
              text: e.target.value
            }
          }))}
          placeholder="What's on your mind?"
          className="w-full bg-gray-700 text-white rounded-lg p-4 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={3}
          disabled={isLoading}
        />

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
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

          <select
            value={formData.visibility}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              visibility: e.target.value
            }))}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="PUBLIC">Public</option>
            <option value="TEAM">Team Only</option>
            <option value="PRIVATE">Private</option>
          </select>

          <button
            type="submit"
            disabled={isLoading || (!formData.content.text.trim() && mediaFiles.length === 0)}
            className={`px-6 py-2 rounded-lg font-medium ${
              isLoading || (!formData.content.text.trim() && mediaFiles.length === 0)
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