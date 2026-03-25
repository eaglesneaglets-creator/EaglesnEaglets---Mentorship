import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart, isAddingToCart }) => {
    const primaryImage = product.primary_image;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
            {/* Product Image */}
            <Link to={`/store/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50">
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">shopping_bag</span>
                    </div>
                )}
                {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                )}
            </Link>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-1">
                {product.category_name && (
                    <p className="text-xs text-primary font-medium mb-1">{product.category_name}</p>
                )}
                <Link to={`/store/${product.slug}`}>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-slate-900">
                        ₦{Number(product.price).toLocaleString()}
                    </p>
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock_quantity === 0 || isAddingToCart}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        stock_quantity: PropTypes.number.isRequired,
        category_name: PropTypes.string,
        primary_image: PropTypes.string,
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
    isAddingToCart: PropTypes.bool,
};

export default ProductCard;
