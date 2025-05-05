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
        "https://scontent.fsgn8-3.fna.fbcdn.net/v/t39.30808-6/494700103_701556535721055_7614215983910996121_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=WW7XKgu6AmcQ7kNvwHw7jkT&_nc_oc=Adm1qjdD5T-AEn8d3ac1RDHz8OMtoED8KzI4GatdtVbzGOdxb-UmHHSsH7k5c2dl85s&_nc_zt=23&_nc_ht=scontent.fsgn8-3.fna&_nc_gid=mv1Ef25TS5M8hqUFGFvfkA&oh=00_AfF1HRSw21MmYpNLcJD_iCACqcI7Ae-6g_fO779ascoDyA&oe=681C846B",
        "https://scontent.fsgn8-3.fna.fbcdn.net/v/t39.30808-6/494749012_699197359290306_3802928796592357987_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=5nRJ8RcfGLMQ7kNvwGxOpRq&_nc_oc=AdnZz44mv9zAOoDXZRl2OmsNY8UX-jOXk_mYRYvzkyhJAmP3Nn3enJ3x9Ga54C0pGPU&_nc_zt=23&_nc_ht=scontent.fsgn8-3.fna&_nc_gid=nh0kLI2uuvPbwtAVxXO68w&oh=00_AfHmJ0L1-Bd5F8Zcx3dseFXeVJZCn-eFIA-5808XUZquAA&oe=681C5C60",
        "https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/495296886_701556915721017_8981410923425920852_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=XvVV8M0LY5QQ7kNvwE8gsZx&_nc_oc=AdkNpZoCX3ixSBYIfjMreTB94fwE3tBwd-sPYTsEMMsQmH_dloeqMmSK3YJOlyugAPA&_nc_zt=23&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=Vy6ltbZaykpZqPhHxaotmQ&oh=00_AfFuMKkp1LYPjvS4bNTC_2ctxHZp4PbEP_9mxUPpMaYo-Q&oe=681C60FA",
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
      {/* <Watermark text="PREMIUM  Store" reverse /> */}
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
          className="pointer-events-none absolute left-0 top-0 h-40 w-auto rounded-xl border-2 border-slate-900 bg-slate-800 object-cover opacity-0"
          src={img}
          alt={`Mouse move image ${index}`}
          key={index}
          data-mouse-move-index={index}
        />
      ))}
    </div>
  );
};