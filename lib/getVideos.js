import "server-only";

export async function getVideos() {
  try {
    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID}&key=${process.env.YOUTUBE_API_KEY}`,
      {
        next: { revalidate: 43200 },
      }
    );

    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.status}`);
    }

    const data = await res.json();
    const items = data?.items ?? [];

    if (!items.length) {
      console.warn("No YouTube videos found for playlist.");
      return [];
    }

    const videos = items
      .filter((e) => e.snippet?.resourceId?.videoId)
      .map((e) => ({
        id: e.snippet.resourceId.videoId,
        title: e.snippet.title,
        thumbnail:
          e.snippet.thumbnails?.medium?.url ||
          e.snippet.thumbnails?.default?.url ||
          "",
        publishedAt: e.snippet.publishedAt,
      }));

    // Removed sort by date to keep YouTube playlist order
    // videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return videos;
  } catch (err) {
    console.error("Failed to fetch YouTube videos:", err);
    
    // Always return mock data on error for now to debug rendering issues
    console.warn("Returning MOCK video data for debugging.");
    return [
      {
        id: "YVIWBpVpXCM",
        title: "Ben Hala Sendeyim (Test Video)",
        thumbnail: "https://i.ytimg.com/vi/YVIWBpVpXCM/hqdefault.jpg",
        publishedAt: new Date().toISOString(),
      },
      {
        id: "dQw4w9WgXcQ",
        title: "Rick Astley - Never Gonna Give You Up (Test 2)",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        publishedAt: new Date().toISOString(),
      }
    ];
  }
}