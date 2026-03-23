import { Image, Button } from "react-bootstrap";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface ImageCarouselProps {
  images: string[];
  currentImage: string;
  onSelect: (img: string) => void;
}

const ImageCarousel = ({
  images,
  currentImage,
  onSelect,
}: ImageCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo =
        direction === "left" ? scrollLeft - 200 : scrollLeft + 200;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="d-flex align-items-center w-100 gap-2">
      <Button
        variant="dark"
        className="rounded-circle border-secondary p-0 d-flex align-items-center justify-content-center shadow-sm"
        style={{ minWidth: "40px", height: "40px", zIndex: 2 }}
        onClick={() => scroll("left")}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </Button>

      <div
        ref={scrollRef}
        className="d-flex gap-2 overflow-auto flex-grow-1 no-scrollbar p-1"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`rounded-3 overflow-hidden border border-2 flex-shrink-0 cursor-pointer transition-all ${
              currentImage === img
                ? "border-primary scale-up"
                : "border-secondary opacity-50"
            }`}
            style={{
              width: "150px",
              height: "150px",
              transition: "all 0.2s ease-in-out",
            }}
            onClick={() => onSelect(img)}
          >
            <Image
              src={img}
              className="w-100 h-100 object-fit-cover shadow-inner"
            />
          </div>
        ))}
      </div>

      <Button
        variant="dark"
        className="rounded-circle border-secondary p-0 d-flex align-items-center justify-content-center shadow-sm"
        style={{ minWidth: "40px", height: "40px", zIndex: 2 }}
        onClick={() => scroll("right")}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </Button>
    </div>
  );
};

export default ImageCarousel;
