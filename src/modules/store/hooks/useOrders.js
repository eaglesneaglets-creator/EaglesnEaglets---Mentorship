import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StoreService from '../services/store-service';

export const orderKeys = {
    all: ['store', 'orders'],
    detail: (id) => ['store', 'orders', id],
};

export const useOrders = () => useQuery({
    queryKey: orderKeys.all,
    queryFn: () => StoreService.getOrders(),
});

export const useOrderDetail = (id) => useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => StoreService.getOrderDetail(id),
    enabled: !!id,
});

export const useCreateOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => StoreService.createOrder(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: orderKeys.all });
            qc.invalidateQueries({ queryKey: ['store', 'cart'] });
        },
    });
};

export const useCancelOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => StoreService.cancelOrder(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
    });
};
