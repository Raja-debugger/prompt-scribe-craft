
import VoiceOver from "./VoiceOver";

interface VideoGeneratorProps {
  articleContent: string;
  articleTitle: string;
  onClose: () => void;
}

// This is now just a wrapper component that renders the VoiceOver component
const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  articleContent,
  articleTitle,
  onClose,
}) => {
  return (
    <VoiceOver
      articleContent={articleContent}
      articleTitle={articleTitle}
      onClose={onClose}
    />
  );
};

export default VideoGenerator;
