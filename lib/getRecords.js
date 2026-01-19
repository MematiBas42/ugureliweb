import "server-only";

import { cache } from 'react';

// --- MANUEL LINK AYARLARI ---
// Otomatik bulunamayan linkleri buraya albümün Spotify ID'si ile ekleyebilirsiniz.
// Örnek: "spotify_album_id": { youtubeMusic: "https://..." }
const MANUAL_OVERRIDES = {
  // "Ben Hala Sendeyim" Manual Override
  "189EjB1wTzKWbd54J6xuG0": {
    youtubeMusic: "https://music.youtube.com/watch?v=ZEusmaOURP0&si=tVDWB9E3NxQEU24m",
    //youtube: "https://www.youtube.com/watch?v=YVIWBpVpXCM",
    deezer: "https://www.deezer.com/track/3370424371"
  }
};

// Helper to fetch platform links AND iTunes ID from Odesli (Songlink)
async function fetchPlatformLinks(spotifyUrl) {
  try {
    const res = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const links = data.linksByPlatform;

    // Extract iTunes ID if available (Format: "ITUNES_ALBUM::123456")
    let itunesId = null;
    if (links.itunes?.entityUniqueId) {
      itunesId = links.itunes.entityUniqueId.split('::')[1];
    } else if (links.appleMusic?.entityUniqueId) {
      itunesId = links.appleMusic.entityUniqueId.split('::')[1];
    }

    return {
      links: {
        spotify: links.spotify?.url || spotifyUrl,
        appleMusic: links.appleMusic?.url || null,
        youtubeMusic: links.youtubeMusic?.url || null,
        youtube: links.youtube?.url || null,
        deezer: links.deezer?.url || null,
        itunes: links.itunes?.url || null,
        amazonMusic: links.amazonMusic?.url || null,
        amazonStore: links.amazonStore?.url || null,
      },
      itunesId
    };
  } catch (error) {
    console.warn(`Failed to fetch links for ${spotifyUrl}`, error);
    return null;
  }
}

// Helper to fetch preview from iTunes API using ID (Fallback)
async function fetchItunesPreview(itunesId) {
  if (!itunesId) return null;
  try {
    // entity=song ensures we get the track list with previews even if ID is an album
    const res = await fetch(`https://itunes.apple.com/lookup?id=${itunesId}&entity=song`, {
      next: { revalidate: 86400 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    // result[0] is usually the collection, result[1] is the first track
    // If it's a single, result[0] might be the track itself or collection. 
    // We look for 'previewUrl' in the list.
    const track = data.results.find(item => item.wrapperType === 'track' && item.previewUrl);
    
    return track?.previewUrl || null;
  } catch (error) {
    console.warn(`Failed to fetch iTunes preview for ${itunesId}`, error);
    return null;
  }
}

// Helper to fetch album details (tracks & preview) from Spotify
async function fetchSpotifyAlbumDetails(albumId, accessToken) {
  try {
    const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    // Get preview_url from the first track
    const firstTrack = data.tracks?.items?.[0];
    return firstTrack?.preview_url || null;
  } catch (error) {
    console.warn(`Failed to fetch details for album ${albumId}`, error);
    return null;
  }
}

export const getRecords = cache(async () => {
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      next: { revalidate: 3600 },
    });

    if (!tokenRes.ok) {
      throw new Error(`Spotify auth failed: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json();

    const albumsRes = await fetch(
      `https://api.spotify.com/v1/artists/${process.env.NEXT_PUBLIC_SPOTIFY_ARTIST_ID}/albums?include_groups=single,album`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        next: { revalidate: 86400 }, 
      }
    );

    if (!albumsRes.ok) {
      throw new Error(`Spotify API error: ${albumsRes.status}`);
    }

    const data = await albumsRes.json();
    const items = data?.items ?? [];

    if (!items.length) {
      console.warn('No Spotify albums found for artist.');
      return [];
    }

    // Process albums in parallel to fetch links and details
    const records = await Promise.all(items.map(async (e) => {
      const isSingle = e.album_group === 'single';
      const releaseDate = new Date(e.release_date);
      const spotifyUrl = e.external_urls.spotify;

      // Parallel fetching: Odesli Links AND Spotify Details
      const [odesliData, spotifyPreview] = await Promise.all([
        fetchPlatformLinks(spotifyUrl),
        fetchSpotifyAlbumDetails(e.id, access_token)
      ]);

      const platformLinks = odesliData?.links || { spotify: spotifyUrl };
      const itunesId = odesliData?.itunesId;

      // Fallback: If Spotify has no preview, try iTunes using the ID from Odesli
      let finalPreviewUrl = spotifyPreview;
      if (!finalPreviewUrl && itunesId) {
        finalPreviewUrl = await fetchItunesPreview(itunesId);
      }

      // Check for Manual Overrides
      const manualLinks = MANUAL_OVERRIDES[e.id] || {};
      const hasManualYoutube = !!manualLinks.youtube;
      
      const finalPlatforms = { 
        ...platformLinks, 
        ...manualLinks 
      };

      const formattedName = e.name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-') 
        .replace(/^-+|-+$/g, ''); 
      
      const legacyLink = `https://distrokid.com/hyperfollow/${process.env.NEXT_PUBLIC_ARTIST_NAME}/${formattedName}`;

      return {
        id: e.id,
        title: e.name,
        name: `${e.name} ${isSingle ? '(Single)' : '(Albüm)'}`,
        description: isSingle ? 'Single' : 'Albüm',
        image: e.images?.[1]?.url ?? e.images?.[0]?.url ?? '',
        date: releaseDate.toISOString(),
        tag: e.album_group,
        link: legacyLink,
        platforms: finalPlatforms,
        previewUrl: finalPreviewUrl,
        hasManualYoutube,
      };
    }));

    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (records[0]) {
      records[0].tag = `New ${records[0].tag}`;
    }

    return records;
  } catch (err) {
    console.error('Failed to fetch Spotify records:', err);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Returning MOCK data for local testing/fallback.');
      return [
        {
          id: 'mock-1',
          title: 'Ben Hala Sendeyim',
          name: 'Ben Hala Sendeyim (Single)',
          description: 'Single',
          image: '/main.webp',
          date: new Date().toISOString(),
          tag: 'New single',
          link: '#',
          platforms: {
            spotify: 'https://open.spotify.com/track/test',
            appleMusic: 'https://music.apple.com/tr/album/test',
            youtube: 'https://youtube.com/watch?v=test',
            youtubeMusic: 'https://music.youtube.com/watch?v=test',
            deezer: 'https://deezer.com/track/test'
          },
          previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        }
      ];
    }

    return [];
  }
});
