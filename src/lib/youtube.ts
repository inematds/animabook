export interface LatestVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  published: string;
  channelName: string;
}

const CHANNELS = [
  {
    id: 'UChUeRy-BwHEDo-ZydZj3sHA',
    handle: '@inemagamer',
    name: 'IneMAGamer',
  },
  {
    id: 'UC2QbQDyPKuHk93dwo5iq3Sw',
    handle: '@inematdsx',
    name: 'IneMAT DSX',
  },
];

function parseRSS(xml: string, channelName: string): LatestVideo | null {
  // Extract first <entry> block
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entryMatch) return null;
  const entry = entryMatch[1];

  const videoId = (entry.match(/<yt:videoId>(.+?)<\/yt:videoId>/) ?? [])[1];
  const title = (entry.match(/<title>(.+?)<\/title>/) ?? [])[1];
  const published = (entry.match(/<published>(.+?)<\/published>/) ?? [])[1];

  if (!videoId || !title) return null;

  return {
    videoId,
    title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    published: published ? new Date(published).toLocaleDateString('pt-BR') : '',
    channelName,
  };
}

export async function fetchLatestVideos(): Promise<(LatestVideo | null)[]> {
  return Promise.all(
    CHANNELS.map(async ch => {
      try {
        const res = await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`,
          { next: { revalidate: 3600 } } // revalida a cada 1h
        );
        if (!res.ok) return null;
        const xml = await res.text();
        return parseRSS(xml, ch.name);
      } catch {
        return null;
      }
    })
  );
}
