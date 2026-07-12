import { Article, Comment, SiteSettings, Video } from '../types';

// Dummy export to keep type compatibility if imported elsewhere
export const db: any = {};

// Seeding is now handled automatically by the server-side JSON DB on startup
export async function seedDatabaseIfEmpty(): Promise<void> {
  console.log('[Local DB] Database seeding is handled by the server.');
  return Promise.resolve();
}

// Get all articles
export async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch('/api/articles');
    if (!res.ok) throw new Error('Failed to fetch articles');
    return await res.json();
  } catch (error) {
    console.error('Error fetching articles from local API:', error);
    return [];
  }
}

// Get a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`/api/articles/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch article');
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching article by slug (${slug}):`, error);
    return null;
  }
}

// Increment view count
export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    await fetch(`/api/articles/${articleId}/view`, { method: 'POST' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Increment likes count (likes in React state calls this function)
export async function incrementArticleLikes(articleId: string): Promise<void> {
  try {
    await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
  } catch (error) {
    console.error('Error incrementing likes count:', error);
  }
}

// Upload Image to Local Server
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64: base64String
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to upload image');
        }
        const data = await res.json();
        resolve(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

// Save or Update Article (Admin)
export async function saveArticle(article: Partial<Article>): Promise<string> {
  try {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article)
    });
    if (!res.ok) throw new Error('Failed to save article');
    const data = await res.json();
    return data.id;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
}

// Delete Article (Admin)
export async function deleteArticle(articleId: string): Promise<void> {
  try {
    const res = await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete article');
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

// Get comments for an article
export async function getComments(articleId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`/api/comments/article/${articleId}`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return await res.json();
  } catch (error) {
    console.error(`Error fetching comments for article (${articleId}):`, error);
    return [];
  }
}

// Get all comments (for admin moderation)
export async function getAllComments(): Promise<Comment[]> {
  try {
    const res = await fetch('/api/admin/comments');
    if (!res.ok) throw new Error('Failed to fetch all comments');
    return await res.json();
  } catch (error) {
    console.error('Error fetching all comments:', error);
    return [];
  }
}

// Add comment
export async function addComment(comment: Omit<Comment, 'id' | 'approved' | 'createdAt'>): Promise<string> {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
    if (!res.ok) throw new Error('Failed to add comment');
    const data = await res.json();
    return data.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Delete comment
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete comment');
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Get site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (error) {
    console.error('Error fetching site settings:', error);
    // Return standard defaults if server fails
    return {
      siteName: 'مجله خودرویی سرعت‌گیر',
      siteDescription: 'آخرین اخبار، دستاوردها و تکنولوژی‌های روز دنیای خودرو',
      aboutText: 'سرعت‌گیر یک مجله تخصصی خودرویی مستقل است که با هدف ارتقای آگاهی مخاطبان فارسی‌زبان از پیشرفت‌های صنعت خودروسازی جهان، اخبار روز، بررسی‌های فنی عمیق و مقالات دستاوردهای تکنولوژی خودرو را ارائه می‌دهد.',
      contactEmail: 'info@soraatgir.ir',
      adminPasscode: '123456'
    };
  }
}

// Save site settings
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to save settings');
  } catch (error) {
    console.error('Error saving site settings:', error);
    throw error;
  }
}

// Get all videos
export async function getVideos(): Promise<Video[]> {
  try {
    const res = await fetch('/api/videos');
    if (!res.ok) throw new Error('Failed to fetch videos');
    return await res.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

// Save or Update Video (Admin)
export async function saveVideo(video: Partial<Video>): Promise<string> {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    });
    if (!res.ok) throw new Error('Failed to save video');
    const data = await res.json();
    return data.id;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
}

// Delete Video (Admin)
export async function deleteVideo(videoId: string): Promise<void> {
  try {
    const res = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete video');
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}
