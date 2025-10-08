import { useEffect, useState } from "react";

interface YouTubeEmbedProps {
  query: string;
}

export const YouTubeEmbed = ({ query }: YouTubeEmbedProps) => {
  const [videoId, setVideoId] = useState<string>("");

  useEffect(() => {
    // In a production app, you would use YouTube Data API
    // For now, we'll create a search URL that opens YouTube search
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " educational tutorial")}`;
    
    // For demo purposes, we'll embed a search results page
    // In production, use YouTube Data API to get actual video IDs
    setVideoId(encodeURIComponent(query));
  }, [query]);

  return (
    <div className="aspect-video w-full">
      <iframe
        className="w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed?listType=search&list=${videoId}+educational+tutorial`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
