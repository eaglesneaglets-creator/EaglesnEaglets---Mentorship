import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StoreService from '../services/store-service';
import { useAuthStore } from '@store';

export const cartKeys = {
    cart: ['store', 'cart'],
};

export const useCart = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: cartKeys.cart,
        queryFn: () => StoreService.getCart(),
        enabled: !!user,
    });
};

export const useCartCount = () => {
    const { data } = useCart();
    return data?.data?.item_count ?? 0;
};

export const useAddToCart = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => StoreService.addToCart(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.cart }),
    });
};

export const useUpdateCartItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, quantity }) => StoreService.updateCartItem(id, { quantity }),
        onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.cart }),
    });
};

export const useRemoveFromCart = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => StoreService.removeFromCart(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.cart }),
    });
};
