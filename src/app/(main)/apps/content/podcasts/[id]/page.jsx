import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import PodcastContent from 'components/sections/content/views/details/PodcastContent';

export default function Page() {
  return (
    <>
      <BackToListButton fallbackHref={paths.content} fallbackLabel="Content" />
      <PodcastContent />
    </>
  );
}
