import componentDocs from 'data/docs';

const Page = async ({ params }) => {
  const { slug } = await params;

  return componentDocs[slug];
};

export default Page;
