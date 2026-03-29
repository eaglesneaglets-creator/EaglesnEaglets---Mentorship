import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StoreService from '../services/store-service';

export const adminOrderKeys = {
    all: ['adminOrders'],
    list: (filters) => [...adminOrderKeys.all, 'list', filters],
    detail: (id) => [...adminOrderKeys.all, 'detail', id],
};

export const useAdminOrders = (filters = {}) => useQuery({
    queryKey: adminOrderKeys.list(filters),
    queryFn: () => StoreService.getAdminOrders(filters),
});

export const useAdminOrderDetail = (id) => useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => StoreService.getAdminOrderDetail(id),
    enabled: !!id,
});

export const useUpdateOrderStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => StoreService.updateAdminOrderStatus(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: adminOrderKeys.all }),
    });
};
