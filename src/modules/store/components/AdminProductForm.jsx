import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories } from '../hooks/useStore';

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

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    category_id: z.string().optional(),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
    stock_quantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    status: z.enum(['draft', 'published', 'archived']),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const AdminProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
    const { data: categoriesData } = useCategories();
    const categories = categoriesData?.data ?? [];
    const fileInputRef = useRef(null);

    // Pending image files (new uploads)
    const [imageFiles, setImageFiles] = useState([]);
    // Preview URLs for new files
    const [imagePreviews, setImagePreviews] = useState([]);
    // Existing images from the product being edited
    const [existingImages, setExistingImages] = useState([]);
    const [imageError, setImageError] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            category_id: '',
            price: '',
            stock_quantity: 0,
            status: 'published',
        },
    });

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                description: product.description ?? '',
                category_id: product.category?.id ?? product.category_id ?? '',
                price: product.price,
                stock_quantity: product.stock_quantity,
                status: product.status,
            });
            setExistingImages(product.images ?? []);
        } else {
            setExistingImages([]);
        }
        setImageFiles([]);
        setImagePreviews([]);
        setImageError('');
    }, [product, reset]);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleFilesSelected = (e) => {
        const files = Array.from(e.target.files);
        setImageError('');

        const invalid = files.filter(f => !ALLOWED_TYPES.includes(f.type));
        if (invalid.length) {
            setImageError('Only JPEG, PNG, WebP, and GIF images are allowed.');
            return;
        }

        const tooLarge = files.filter(f => f.size > MAX_FILE_SIZE);
        if (tooLarge.length) {
            setImageError('Each image must be under 5MB.');
            return;
        }

        const newPreviews = files.map(f => URL.createObjectURL(f));
        setImageFiles(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...newPreviews]);

        // Reset file input so re-selecting the same file works
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeNewImage = (index) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const onFormSubmit = (data) => {
        onSubmit({ data, images: imageFiles });
    };


    const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <Field label="Product Name *" error={errors.name?.message}>
                <input {...register('name')} className={inputClass} placeholder="e.g. Eagles Cap" />
            </Field>

            <Field label="Description" error={errors.description?.message}>
                <textarea {...register('description')} rows={3} className={`${inputClass} resize-none`} placeholder="Product description..." />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₵) *" error={errors.price?.message}>
                    <input {...register('price')} type="number" step="0.01" min="0.01" className={inputClass} placeholder="0.00" />
                </Field>
                <Field label="Stock Quantity *" error={errors.stock_quantity?.message}>
                    <input {...register('stock_quantity')} type="number" min="0" className={inputClass} placeholder="0" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Category" error={errors.category_id?.message}>
                    <select {...register('category_id')} className={`${inputClass} bg-white`}>
                        <option value="">No category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Status" error={errors.status?.message}>
                    <select {...register('status')} className={`${inputClass} bg-white`}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </Field>
            </div>

            {/* Image Upload Section */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Images</label>

                {/* Existing images (when editing) */}
                {existingImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {existingImages.map((img, i) => (
                            <div key={img.id || i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(i)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-white text-sm">close</span>
                                </button>
                                {img.is_primary && (
                                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] text-center py-0.5">Primary</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {imagePreviews.map((url, i) => (
                            <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/30">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(i)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-white text-sm">close</span>
                                </button>
                                <span className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 text-white text-[9px] text-center py-0.5">New</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* File input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                    id="product-images"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors w-full justify-center"
                >
                    <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                    {imageFiles.length > 0 ? 'Add More Images' : 'Upload Images'}
                </button>
                <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP, GIF • Max 5MB each • Multiple allowed</p>
                {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
            </div>

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