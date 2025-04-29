"use client"
import { useAnimate } from "framer-motion";
import React, { MouseEventHandler, ReactNode, useRef } from "react";
import { motion } from "framer-motion";
// import { FiArrowDownCircle, FiDollarSign } from "react-icons/fi";
// import { SiApple } from "react-icons/si";

export const ImageTrailHero = () => {
  return (
    <MouseImageTrail
      renderImageBuffer={100}
      rotationRange={25}
      images={[
        "https://www.watchstore.vn/upload_images/images/news/2024/dong-ho-nu-nhat-ban-8-1630386513574.jpg",
        "https://product.hstatic.net/200000456445/product/_products_tui-nu-dior-medium-book-tote-black-multicolor-m1296zrty-m911_dfc0b6a88fc4450c80d79c0720746044_master.png",
        "https://product.hstatic.net/200000456445/product/nuoc_hoa_dolce___gabbana_devotion_edp-2_212d29093eb14f128d0f5266203180c2_master.png",
        "https://product.hstatic.net/200000456445/product/www.shoesbagsall_974e26d8e0844679b4f0c895475e3233_1024x1024_7b383909926b4d6c82305ff1263ae750_master.png",
        "https://kyo.vn/wp-content/uploads/2024/12/Son-Yves-Saint-Laurent-YSL-The-Inks-Vinyl-Cream-622-Plum-Liberation-6.png",
        "https://product.hstatic.net/200000456445/product/_products_tui-nu-dior-medium-book-tote-black-multicolor-m1296zrty-m911_dfc0b6a88fc4450c80d79c0720746044_master.png",
        "https://product.hstatic.net/200000456445/product/nuoc_hoa_dolce___gabbana_devotion_edp-2_212d29093eb14f128d0f5266203180c2_master.png",
        "https://product.hstatic.net/200000456445/product/www.shoesbagsall_974e26d8e0844679b4f0c895475e3233_1024x1024_7b383909926b4d6c82305ff1263ae750_master.png",
      ]}
    >
      <section className="h-full bg-slate-200">
        <WatermarkWrapper />
      </section>
    </MouseImageTrail>
  );
};

const WatermarkWrapper = () => {
  return (
    <>
      <Watermark text="DIEPLE  House" />
      <Watermark text="PREMIUM  Store" reverse />
    </>
  );
};

const Watermark = ({ reverse, text }: { reverse?: boolean; text: string }) => (
  <div className="flex -translate-y-0 select-none overflow-hidden">
    <TranslateWrapper reverse={reverse}>
      <span className="w-fit whitespace-nowrap text-[18vmax] font-black uppercase leading-[0.75] text-slate-300">
        {text}
      </span>
    </TranslateWrapper>
    <TranslateWrapper reverse={reverse}>
      <span className="ml-48 w-fit whitespace-nowrap text-[18vmax] font-black uppercase leading-[0.75] text-slate-300">
        {text}
      </span>
    </TranslateWrapper>
  </div>
);

const TranslateWrapper = ({
  children,
  reverse,
}: {
  children: ReactNode;
  reverse?: boolean;
}) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-100%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-100%" }}
      transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      className="flex"
    >
      {children}
    </motion.div>
  );
};

const MouseImageTrail = ({
  children,
  // List of image sources
  images,
  // Will render a new image every X pixels between mouse moves
  renderImageBuffer,
  // images will be rotated at a random number between zero and rotationRange,
  // alternating between a positive and negative rotation
  rotationRange,
}: {
  children: ReactNode;
  images: string[];
  renderImageBuffer: number;
  rotationRange: number;
}) => {
  const [scope, animate] = useAnimate();

  const lastRenderPosition = useRef({ x: 0, y: 0 });
  const imageRenderCount = useRef(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const { clientX, clientY } = e;

    const distance = calculateDistance(
      clientX,
      clientY,
      lastRenderPosition.current.x,
      lastRenderPosition.current.y
    );

    if (distance >= renderImageBuffer) {
      lastRenderPosition.current.x = clientX;
      lastRenderPosition.current.y = clientY;

      renderNextImage();
    }
  };

  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    // Using the Pythagorean theorem to calculate the distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
  };

  const renderNextImage = () => {
    const imageIndex = imageRenderCount.current % images.length;
    const selector = `[data-mouse-move-index="${imageIndex}"]`;

    const el = document.querySelector(selector) as HTMLElement;

    el.style.top = `${lastRenderPosition.current.y}px`;
    el.style.left = `${lastRenderPosition.current.x}px`;
    el.style.zIndex = imageRenderCount.current.toString();

    const rotation = Math.random() * rotationRange;

    animate(
      selector,
      {
        opacity: [0, 1],
        transform: [
          `translate(-50%, -25%) scale(0.5) ${
            imageIndex % 2
              ? `rotate(${rotation}deg)`
              : `rotate(-${rotation}deg)`
          }`,
          `translate(-50%, -50%) scale(1) ${
            imageIndex % 2
              ? `rotate(-${rotation}deg)`
              : `rotate(${rotation}deg)`
          }`,
        ],
      },
      { type: "spring", damping: 15, stiffness: 200 }
    );

    animate(
      selector,
      {
        opacity: [1, 0],
      },
      { ease: "linear", duration: 1, delay: 1.5 }
    );

    imageRenderCount.current = imageRenderCount.current + 1;
  };

  return (
    <div
      ref={scope}
      className="relative overflow-hidden MouseImageTrail"
      onMouseMove={handleMouseMove}
    >
      {children}

      {images.map((img: any, index: number) => (
        <img
          className="pointer-events-none absolute left-0 top-0 h-36 w-auto rounded-xl border-2 border-slate-900 bg-slate-800 object-cover opacity-0"
          src={img}
          alt={`Mouse move image ${index}`}
          key={index}
          data-mouse-move-index={index}
        />
      ))}
    </div>
  );
};