import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const LazyImage = ({ src, alt, className, effect = "blur", ...props }) => {
  return (
    <LazyLoadImage
      alt={alt}
      src={src}
      effect={effect}
      className={className}
      {...props}
    />
  );
};

export default LazyImage;
