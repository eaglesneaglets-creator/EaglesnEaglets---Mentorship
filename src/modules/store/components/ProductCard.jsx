import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onCategoryClick }) => {
    const { name, slug, price, stock_quantity, category_name, category_slug, primary_image } = product;
    const isOutOfStock = stock_quantity === 0;
    const isLowStock = stock_quantity > 0 && stock_quantity <= 5;

    return (
        <Link
            to={`/store/${slug}`}
            className="group block bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
            {/* Image */}
            <div className="relative overflow-hidden bg-slate-50 aspect-square">
                {primary_image ? (
                    <img
                        src={primary_image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300">shopping_bag</span>
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                )}
                {category_name && (
                    <div className="absolute top-2 left-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onCategoryClick?.(category_slug);
                            }}
                            className="bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            {category_name}
                        </button>
                    </div>
                )}
                {isLowStock && !isOutOfStock && (
                    <div className="absolute top-2 right-2">
                        <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {stock_quantity} left
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">₵{Number(price).toLocaleString()}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-base text-slate-400">arrow_forward</span>
                    </div>
                </div>
                {isLowStock && !isOutOfStock && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">Only {stock_quantity} remaining</p>
                )}
                {isOutOfStock && (
                    <p className="text-xs text-slate-400 mt-1">Currently unavailable</p>
                )}
            </div>
        </Link>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        stock_quantity: PropTypes.number,
        category_name: PropTypes.string,
        category_slug: PropTypes.string,
        primary_image: PropTypes.string,
    }).isRequired,
    onCategoryClick: PropTypes.func,
};

export default ProductCard;
