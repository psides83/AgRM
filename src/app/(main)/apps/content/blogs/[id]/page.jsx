import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import BlogContent from 'components/sections/content/views/details/BlogContent';

export default function Page() {
  return (
    <>
      <BackToListButton fallbackHref={paths.content} fallbackLabel="Content" />
      <BlogContent />
    </>
  );
}
