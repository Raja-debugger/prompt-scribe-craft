
import VoiceOver from "./VoiceOver";

interface VideoGeneratorProps {
  articleContent: string;
  articleTitle: string;
  onClose: () => void;
}

// This component serves as a wrapper for the VoiceOver component
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
