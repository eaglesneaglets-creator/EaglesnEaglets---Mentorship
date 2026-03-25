import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories } from '../hooks/useStore';

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    category_id: z.string().optional(),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
    stock_quantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    status: z.enum(['draft', 'published', 'archived']),
    image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const AdminProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
    const { data: categoriesData } = useCategories();
    const categories = categoriesData?.data ?? [];

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            category_id: '',
            price: '',
            stock_quantity: 0,
            status: 'draft',
            image_url: '',
        },
    });

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                description: product.description ?? '',
                category_id: product.category?.id ?? '',
                price: product.price,
                stock_quantity: product.stock_quantity,
                status: product.status,
                image_url: product.images?.[0]?.image_url ?? '',
            });
        }
    }, [product, reset]);

    const Field = ({ label, error, children }) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );

    Field.propTypes = {
        label: PropTypes.string.isRequired,
        error: PropTypes.string,
        children: PropTypes.node.isRequired,
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Product Name *" error={errors.name?.message}>
                <input {...register('name')} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Eagles Cap" />
            </Field>

            <Field label="Description" error={errors.description?.message}>
                <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Product description..." />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₦) *" error={errors.price?.message}>
                    <input {...register('price')} type="number" step="0.01" min="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0.00" />
                </Field>
                <Field label="Stock Quantity *" error={errors.stock_quantity?.message}>
                    <input {...register('stock_quantity')} type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Category" error={errors.category_id?.message}>
                    <select {...register('category_id')} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="">No category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Status" error={errors.status?.message}>
                    <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </Field>
            </div>

            <Field label="Primary Image URL" error={errors.image_url?.message}>
                <input {...register('image_url')} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="https://..." />
            </Field>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
                    {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                </button>
            </div>
        </form>
    );
};

AdminProductForm.propTypes = {
    product: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default AdminProductForm;
