import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black min-h-[280px] flex items-center justify-between px-2 sm:px-14 py-10  ">
      <a href="#" className="flex w-[35%] sm:w-[200px] sm:mr-10 justify-center items-center">
        <span className="sr-only">DiepLeHouse</span>
        <img
          src={'/assets/icons/dieple-white-logo.svg'}
          alt='DiepLeHouse'
          className='w-[150px] h-[150px] sm:h-[200px] sm:w-[200px]'
        />
      </a>
      <div className="mx-auto w-[60%] sm:w-full">
        <div className="xl:grid xl:gap-8 relative w-full">
          <div className="w-full grid grid-cols-1 ml-3 sm:ml-20 md:ml-4 md:grid-cols-2 gap-4 xl:col-span-2  max-w-[500px] mx-auto lg:max-w-[100vw] lg:flex lg:justify-center lg:w-full">
            <div className="md:grid xl:grid-cols-2 md:gap-4 mb-6 md:mb-0 lg:mr-4">
              <div className="lg:mr-12">
                <h3 className="text-sm/6 lg:text-xl font-semibold font-['Mont'] text-white uppercase">Hướng dẫn</h3>

              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm/6 lg:text-xl font-semibold text-white font-['Mont'] uppercase">Chính sách</h3>

              </div>
            </div>
            <div className="md:grid xl:grid-cols-2">
              <h3 className="text-sm/6 lg:text-xl font-semibold text-white font-['Mont'] uppercase lg:mr-12">Câu hỏi thường gặp</h3>

              <div className="mt-10 md:mt-0 flex items-center justify-start gap-6">
                <h3 className="text-sm/6 lg:text-xl font-semibold text-white font-['Mont'] uppercase">Liên hệ</h3>
                <img
                  src={'/assets/icons/facebook-icon.svg'}
                  alt='DiepLeHouse'
                  className='w-[20px] h-[20px] sm:h-[25px] sm:w-[25px]'
                />
                <img
                  src={'/assets/icons/instagram-icon.svg'}
                  alt='DiepLeHouse'
                  className='w-[20px] h-[20px] sm:h-[25px] sm:w-[25px]'
                />
                <img
                  src={'/assets/icons/tiktok-icon.svg'}
                  alt='DiepLeHouse'
                  className='w-[20px] h-[20px] sm:h-[25px] sm:w-[25px]'
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex gap-x-6 md:order-2">
            {navigation.social.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-600 hover:text-gray-800">
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="size-6" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm/6 text-gray-600 md:order-1 md:mt-0">
            &copy; 2024 DiepLeHouse, Inc. All rights reserved.
          </p>
        </div> */}
      </div>
    </footer>
  )
}
