import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, Send, X } from 'lucide-react';

interface CreatePostProps {
  userId: string;
  onPostCreated: () => void;
}

export default function CreatePost({ userId, onPostCreated }: CreatePostProps) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  } as any);

  const handleSubmit = async () => {
    if (!caption.trim() && !file) return;
    
    setIsUploading(true);
    let finalMediaUrl = '';

    try {
      if (file) {
        // Get presigned URL
        const presignedRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            userId,
          }),
        });
        
        const { signedUrl, publicUrl } = await presignedRes.json();

        if (signedUrl) {
          // Real Supabase Upload
          await fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
          finalMediaUrl = publicUrl;
        } else {
          // Fallback to random image
          finalMediaUrl = `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80&hash=${Date.now()}`;
        }
      }

      // Create post via backend
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, caption, mediaUrl: finalMediaUrl }),
      });

      setCaption('');
      setFile(null);
      setPreviewUrl(null);
      onPostCreated();
      
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="bg-white border text-gray-900 border-gray-200 rounded-xl shadow-sm mb-6 p-4">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="User AV" />
        </div>
        <textarea
          placeholder="What's on your mind?"
          className="flex-1 bg-transparent border-none outline-none resize-none pt-2 text-gray-800 placeholder-gray-500 min-h-[60px]"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {previewUrl ? (
        <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center max-h-[300px]">
          <img src={previewUrl} alt="Preview" className="max-h-[300px] object-contain" />
          <button 
            onClick={clearFile}
            className="absolute top-2 right-2 bg-gray-900/60 p-1.5 rounded-full text-white hover:bg-gray-900 transition backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`mb-4 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer
            ${isDragActive ? 'border-[#00a884] bg-green-50' : 'border-gray-200 hover:bg-gray-50'}
          `}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-8 h-8 mb-2 ${isDragActive ? 'text-[#00a884]' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-600">
            {isDragActive ? "Drop the file here" : "Drag & drop an image, or click to browse"}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button 
          onClick={() => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.click();
          }}
          className="text-[#00a884] flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-green-50 transition font-medium text-sm"
        >
          <ImageIcon className="w-5 h-5" />
          <span>Photo</span>
        </button>

        <button 
          onClick={handleSubmit}
          disabled={isUploading || (!caption.trim() && !file)}
          className="bg-[#00a884] text-white flex items-center space-x-2 px-5 py-2 rounded-full font-medium shadow-sm hover:bg-[#008f6f] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             <>
               <span>Post</span>
               <Send className="w-4 h-4 ml-1" />
             </>
          )}
        </button>
      </div>
    </div>
  );
}
