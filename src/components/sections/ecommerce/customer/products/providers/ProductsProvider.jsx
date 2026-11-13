import { createContext, useCallback, use, useEffect, useMemo } from 'react';
import useListState from 'hooks/useListState';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

export const ProductsContext = createContext({});

const ProductsProvider = ({ children, products }) => {
  const [filters, setFilters, restored] = useListState('products:filters', {});
  const [sortBy, handleProductsSort] = useListState('products:sort', 'recommended');
  const methods = useForm({ defaultValues: {} });
  const { control, setValue, reset, subscribe } = methods;
  const formValues = useWatch({ control });

  useEffect(() => {
    if (!restored) return;
    reset(filters);
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => setFilters(values),
    });
  }, [restored, reset, subscribe, setFilters]);

  const filterItems = useMemo(() => {
    return Object.keys(formValues).reduce((acc, key) => {
      if (key !== 'priceRange' && Array.isArray(formValues[key])) {
        formValues[key].forEach((element) => {
          acc.push({
            value: element,
            filter: key,
          });
        });
      }

      return acc;
    }, []);
  }, [formValues]);

  const handleDeleteFilterItem = useCallback(
    (item) => {
      setValue(
        item.filter,
        formValues[item.filter].filter((value) => value !== item.value),
      );
    },
    [formValues],
  );

  const handleResetFilters = () => reset({});

  const visibleProducts = useMemo(() => {
    const data = formValues;
    const filteredProducts = products.filter((product) => {
      return Object.keys(data).every((key) => {
        if (!data[key]?.length) {
          return true;
        }
        if (key === 'priceRange') {
          const [min, max] = data[key];

          return product.price.discounted >= min && product.price.discounted <= max;
        } else {
          const productValues = product[key];

          return productValues.some((value) => data[key].includes(value));
        }
      });
    });

    switch (sortBy) {
      case 'lowToHight':
        return filteredProducts.sort((a, b) => a.price.discounted - b.price.discounted);
      case 'highToLow':
        return filteredProducts.sort((a, b) => b.price.discounted - a.price.discounted);
      case 'highestRated':
        return filteredProducts.sort((a, b) => b.ratings - a.ratings);
      default:
        return filteredProducts;
    }
  }, [formValues, products, sortBy]);

  return (
    <ProductsContext
      value={{
        filterItems,
        visibleProducts,
        handleDeleteFilterItem,
        handleResetFilters,
        sortBy,
        handleProductsSort,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </ProductsContext>
  );
};

export const useProducts = () => use(ProductsContext);

export default ProductsProvider;
