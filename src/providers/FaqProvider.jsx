import { createContext, use, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { faqCategories } from 'data/faqs';
import useHashScrollIntoView from 'hooks/useHashScrollIntoView';
import { kebabCase } from 'lib/utils';
import paths from 'routes/paths';
import { useScrollSpyContext } from 'components/scroll-spy';

export const FaqContext = createContext({});

const FaqProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFaqItem, setActiveFaqItem] = useState('');
  const { category } = useParams();
  const router = useRouter();
  const { setActiveElemId } = useScrollSpyContext();

  useHashScrollIntoView({
    behavior: 'smooth',
  });

  useEffect(() => {
    const faqCategory = faqCategories.find((item) => item.slug === category);
    if (!faqCategory) {
      router.push(paths[404]);
    } else {
      setActiveCategory(faqCategory);
      setActiveFaqItem(faqCategory.items[0].question);
      setActiveElemId(kebabCase(faqCategory.items[0].question));
    }
  }, [router, category]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleActiveItemChange = (id) => {
    setActiveFaqItem(id);
  };

  return (
    <FaqContext
      value={{
        activeCategory,
        drawerOpen,
        activeFaqItem,
        handleDrawerOpen,
        handleDrawerClose,
        handleActiveItemChange,
      }}
    >
      {children}
    </FaqContext>
  );
};

export const useFaqContext = () => use(FaqContext);

export default FaqProvider;
