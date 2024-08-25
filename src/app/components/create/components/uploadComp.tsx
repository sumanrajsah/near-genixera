// CustomInput.js
import React, { useState, useRef } from 'react';
import  '../modal.css'; // Import your CSS file
import Image from 'next/image';
import { Audio, Gif, ImageIcon, Video } from '../../svg';

interface UploadComponentsProps {
  onImageUpload: (files: FileList) => void;
  onGifUpload: (files: FileList) => void;
  onAudioUpload: (files: FileList) => void;
  onVideoUpload: (files: FileList) => void;
  notUpload:any;
}

export const UploadComponents: React.FC<UploadComponentsProps> = ({ onImageUpload, onGifUpload, onAudioUpload,onVideoUpload,notUpload }) => {

  const handleImageChange = (event:any) => {
    const files = event.target.files;
    onImageUpload(files);
  };

  const handleGifChange = (event:any) => {
    const files = event.target.files;
    onGifUpload(files);
  };

  const handleAudioChange = (event:any) => {
    const files = event.target.files;
    onAudioUpload(files);
  };
  const handleVideoChange = (event:any) => {
    const files = event.target.files;
    onVideoUpload(files);
  };

  return (
    <div className='upload-body'>
        <label className='upload-image' title='Image'>
        <div className='image-svg' onChange={handleVideoChange}>
          <ImageIcon/>
 </div>
        <input  type='file' accept='image/*' onChange={handleImageChange} disabled={notUpload} />
        </label>
        <label className='upload-gif' title='GIF'>
        <div className='gif-svg' onChange={handleVideoChange}>
          <Gif/>
 </div>
        <input  type='file' accept='image/gif' onChange={handleGifChange} disabled={notUpload} />
        </label>
        <label className='upload-gif' title='Audio'>
        <div className='gif-svg' onChange={handleVideoChange}>
          <Audio/>
 </div>
        <input  type='file' accept='audio/*' onChange={handleAudioChange} disabled={notUpload} />
        </label>
        <label className='upload-gif' title='Video'>
        <div className='gif-svg' onChange={handleVideoChange}>
          <Video/>
 </div>
        <input  type='file' accept='video/*' onChange={handleVideoChange} disabled={notUpload} />
        </label>
    </div>
  );
};

