import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import VideoContent from 'components/sections/content/views/details/VideoContent';

export default function Page() {
  return (
    <>
      <BackToListButton fallbackHref={paths.content} fallbackLabel="Content" />
      <VideoContent />
    </>
  );
}
