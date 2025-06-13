import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingCarouselProps {
  /** Number of placeholder items to render */
  items?: number;
}

/**
 * Displays a carousel made of `Skeleton` placeholders.
 * Intended to be used as a page-level loading indicator while
 * remote data or resources are being fetched.
 */
const LoadingCarousel = ({ items = 4 }: LoadingCarouselProps) => {
  return (
    <Carousel className="w-full max-w-3xl">
      <CarouselContent>
        {Array.from({ length: items }).map((_, idx) => (
          <CarouselItem
            key={idx}
            className="basis-1/2 sm:basis-1/3 lg:basis-1/4"
          >
            <div className="p-4">
              {/* Card-sized skeleton */}
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default LoadingCarousel;
