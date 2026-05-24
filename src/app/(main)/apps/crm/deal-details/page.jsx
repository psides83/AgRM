import { redirect } from 'next/navigation';
import paths from 'routes/paths';

const Page = () => {
  redirect(paths.deals);
};

export default Page;
