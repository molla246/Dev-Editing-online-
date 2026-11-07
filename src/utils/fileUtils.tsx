import React from 'react';
import {
  Image as ImageIcon,
  FileText,
  Music,
  Film,
  Code,
  Archive,
  Paperclip,
} from 'lucide-react';

export const MAX_PAGE_TOTAL_FILE_SIZE = 16 * 1024 * 1024; // 16 MB in bytes

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface RenderFileIconProps {
  type?: string;
  name?: string;
  size?: number;
}

export function getFileCategoryIcon(type?: string, name?: string, iconSize = 16) {
  const mime = (type || '').toLowerCase();
  const filename = (name || '').toLowerCase();

  // Image
  if (
    mime.startsWith('image/') ||
    filename.endsWith('.png') ||
    filename.endsWith('.jpg') ||
    filename.endsWith('.jpeg') ||
    filename.endsWith('.webp') ||
    filename.endsWith('.gif') ||
    filename.endsWith('.svg')
  ) {
    return <ImageIcon size={iconSize} style={{ color: '#3b82f6', flexShrink: 0 }} />;
  }

  // PDF
  if (mime === 'application/pdf' || filename.endsWith('.pdf')) {
    return <FileText size={iconSize} style={{ color: '#ef4444', flexShrink: 0 }} />;
  }

  // Audio
  if (
    mime.startsWith('audio/') ||
    filename.endsWith('.mp3') ||
    filename.endsWith('.wav') ||
    filename.endsWith('.aac') ||
    filename.endsWith('.ogg') ||
    filename.endsWith('.m4a')
  ) {
    return <Music size={iconSize} style={{ color: '#a822f6', flexShrink: 0 }} />;
  }

  // Video
  if (
    mime.startsWith('video/') ||
    filename.endsWith('.mp4') ||
    filename.endsWith('.webm') ||
    filename.endsWith('.mkv') ||
    filename.endsWith('.avi') ||
    filename.endsWith('.mov')
  ) {
    return <Film size={iconSize} style={{ color: '#ec4899', flexShrink: 0 }} />;
  }

  // Code
  if (
    filename.endsWith('.js') ||
    filename.endsWith('.ts') ||
    filename.endsWith('.tsx') ||
    filename.endsWith('.jsx') ||
    filename.endsWith('.html') ||
    filename.endsWith('.css') ||
    filename.endsWith('.json') ||
    filename.endsWith('.py') ||
    filename.endsWith('.cpp') ||
    filename.endsWith('.c') ||
    filename.endsWith('.php') ||
    filename.endsWith('.java') ||
    filename.endsWith('.sh') ||
    filename.endsWith('.sql')
  ) {
    return <Code size={iconSize} style={{ color: '#10b981', flexShrink: 0 }} />;
  }

  // Zip / Archive
  if (
    filename.endsWith('.zip') ||
    filename.endsWith('.rar') ||
    filename.endsWith('.7z') ||
    filename.endsWith('.tar') ||
    filename.endsWith('.gz')
  ) {
    return <Archive size={iconSize} style={{ color: '#f59e0b', flexShrink: 0 }} />;
  }

  // General Document
  return <Paperclip size={iconSize} style={{ color: '#ff5e36', flexShrink: 0 }} />;
}
