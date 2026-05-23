import { documentation } from 'data/docs';

const Page = async ({ params }) => {
  const { slug } = await params;

  return documentation[slug];
};

export default Page;
