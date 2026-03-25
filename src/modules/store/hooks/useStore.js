import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StoreService from '../services/store-service';

export const storeKeys = {
    all: ['store'],
    categories: () => [...storeKeys.all, 'categories'],
    products: (params) => [...storeKeys.all, 'products', params],
    product: (id) => [...storeKeys.all, 'product', id],
};

export const useCategories = () => useQuery({
    queryKey: storeKeys.categories(),
    queryFn: () => StoreService.getCategories(),
    staleTime: 10 * 60 * 1000,
});

export const useProducts = (params = {}) => useQuery({
    queryKey: storeKeys.products(params),
    queryFn: () => StoreService.getProducts(params),
});

export const useProductDetail = (id) => useQuery({
    queryKey: storeKeys.product(id),
    queryFn: () => StoreService.getProductDetail(id),
    enabled: !!id,
});

export const useCreateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => StoreService.createProduct(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
    });
};

export const useUpdateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => StoreService.updateProduct(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
    });
};

export const useDeleteProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => StoreService.deleteProduct(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
    });
};
