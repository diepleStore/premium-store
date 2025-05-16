import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  return (
    <div className="relative">
      <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory">
        {images.map((image, index) => (
          <div key={index} className="flex-shrink-0 snap-center">
            <Image
              src={image}
              alt={`Product image ${index + 1}`}
              width={400}
              height={400}
              className="object-cover rounded-lg w-64 h-64 md:w-96 md:h-96"
            />
          </div>
        ))}
      </div>
      {/* Scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 8px;
        }
        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}