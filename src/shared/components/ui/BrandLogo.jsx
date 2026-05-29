import PropTypes from 'prop-types';
import logoJpeg from '../../../assets/EaglesnEagletsLogo.jpeg';

/**
 * BrandLogo — single source for the platform mark.
 *
 * Renders the logo with explicit width/height (eliminates CLS) and
 * decoding="async" + fetchpriority="high" so it never blocks first paint.
 *
 * No SVG asset exists yet; when one lands, swap the <img> for it here and
 * every call site upgrades for free. AVIF/WebP <source>s can be added the
 * same way once generated from the JPEG.
 */
const BrandLogo = ({ className = '', width = 56, height = 56, alt = 'Eagles & Eaglets' }) => (
  <img
    src={logoJpeg}
    alt={alt}
    width={width}
    height={height}
    loading="eager"
    decoding="async"
    fetchpriority="high"
    className={className}
  />
);

BrandLogo.propTypes = {
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  alt: PropTypes.string,
};

export default BrandLogo;
