'use client'

import { Fragment, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react'
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import ButtonCloseHeader from './button-close-header'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white fixed z-500 w-full">
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className='mt-10 ml-4 flex flex-col gap-7' >
              <div>
                <span className='uppercase font-["Mont"] font-[600] text-lg' >Danh mục</span>
                <div className='flex flex-col gap-7 border-l pl-2 mt-6 mb-2 ml-3' >
                  <a href="/products?tag=my-pham" className='uppercase font-["Mont"] font-[400] text-lg' >Mỹ Phẩm</a>
                  <a href="/products?tag=thoi-trang" className='uppercase font-["Mont"] font-[400] text-lg' >Thời Trang</a>
                  <a href="/products?tag=nha-cua-doi-song" className='uppercase font-["Mont"] font-[400] text-lg' >Nhà cửa & đời sống</a>
                  <a href="/products?tag=me-be" className='uppercase font-["Mont"] font-[400] text-lg' >Mẹ & bé</a>
                </div>
              </div>
              <a href="/products?tag=diep-le-choices&tags=DL-choices" className='uppercase font-["Mont"] font-[600] text-lg' >DIỆP LÊ CHOICES</a>
              <a href="/products?tag=diep-le-collab&tags=DL-collab" className='uppercase font-["Mont"] font-[600] text-lg' >DIỆP LÊ COLLAB</a>
              <a href="/products?tag=diep-le-pass&tags=DL-pass" className='uppercase font-["Mont"] font-[600] text-lg' >DIỆP LÊ PASS</a>
              <a href="/products?tag=dai-su-doc-quyen&tags=dai-su-doc-quyen" className='uppercase font-["Mont"] font-[600] text-lg' >ĐẠI SỨ - ĐỘC QUYỀN</a>
              {/* <span className='uppercase font-["Mont"] font-[600] text-lg' >TESTING</span>
              <span className='uppercase font-["Mont"] font-[600] text-lg' >BLOG</span> */}

            </div>

            {/* Links */}
            {/* <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-indigo-600 data-selected:text-indigo-600"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8">
                    <div className="space-y-4">
                      {category.featured.map((item, itemIdx) => (
                        <div key={itemIdx} className="group relative overflow-hidden rounded-md bg-gray-100">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="aspect-square w-full object-cover group-hover:opacity-75"
                          />
                          <div className="absolute inset-0 flex flex-col justify-end">
                            <div className="bg-white/60 p-4 text-base sm:text-sm">
                              <a href={item.href} className="font-medium text-gray-900">
                                <span aria-hidden="true" className="absolute inset-0" />
                                {item.name}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {category.sections.map((column, columnIdx) => (
                      <div key={columnIdx} className="space-y-10">
                        {column.map((section) => (
                          <div key={section.name}>
                            <p id={`${category.id}-${section.id}-heading-mobile`} className="font-medium text-gray-900">
                              {section.name}
                            </p>
                            <ul
                              role="list"
                              aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                              className="mt-6 flex flex-col space-y-6"
                            >
                              {section.items.map((item) => (
                                <li key={item.name} className="flow-root">
                                  <a href={item.href} className="-m-2 block p-2 text-gray-500">
                                    {item.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup> */}

            {/* <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {navigation.pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <a href={page.href} className="-m-2 block p-2 font-medium text-gray-900">
                    {page.name}
                  </a>
                </div>
              ))}
            </div> */}

            {/* <div className="border-t border-gray-200 px-4 py-6">
              <a href="#" className="-m-2 flex items-center p-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                  className="block h-auto w-5 shrink-0"
                />
                <span className="ml-3 block text-base font-medium text-gray-900">CAD</span>
                <span className="sr-only">, change currency</span>
              </a>
            </div> */}
          </DialogPanel>
        </div>
      </Dialog>


      <header className="relative bg-white">
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-400">
            <div className="flex h-[70px] items-center justify-between">
              <div className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="-ml-2 rounded-md bg-white p-2 text-gray-400"
                >
                  <span className="sr-only">Open menu</span>
                  {/* <Bars3Icon aria-hidden="true" className="size-6" /> */}
                  {
                    open ? (
                      <Image
                        src={'/assets/icons/close-menu-icon.svg'}
                        alt='DiepLeHouse'
                        className='w-[24px] h-[24px]'
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Image
                        src={'/assets/icons/three-line-menu-icon.svg'}
                        alt='DiepLeHouse'
                        className='w-[24px] h-[24px]'
                        width={24}
                        height={24}
                      />
                    )
                  }
                </button>

                {/* <a href="#" className="ml-2 p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Search</span>
                  <MagnifyingGlassIcon aria-hidden="true" className="size-6" />
                </a> */}
              </div>

              {/* Flyout menus */}
              {/* <PopoverGroup className="hidden lg:block lg:flex-1 lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      {({ close }) => (
                        <>
                          <div className="relative flex">
                            <PopoverButton className="group relative z-10 flex items-center justify-center text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:text-indigo-600">
                              {category.name}
                              <span
                                aria-hidden="true"
                                className="absolute inset-x-0 bottom-0 h-0.5 transition-colors duration-200 ease-out group-data-open:bg-gray-600 sm:mt-5 sm:translate-y-px sm:transform"
                              />
                            </PopoverButton>
                          </div>

                          <PopoverPanel
                            transition
                            className="absolute inset-x-0 top-full transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                          >
                            <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow-xs" />

                            <div className="relative bg-white">
                              <div className="mx-auto max-w-7xl px-8">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                                  <div className="grid grid-cols-2 grid-rows-1 gap-8 text-sm">
                                    {category.featured.map((item, itemIdx) => (
                                      <div
                                        key={item.name}
                                        className={cn(
                                          itemIdx === 0 ? 'col-span-2' : '',
                                          'group relative overflow-hidden rounded-md bg-gray-100',
                                        )}
                                      >
                                        <img
                                          alt={item.imageAlt}
                                          src={item.imageSrc}
                                          className={cn(
                                            itemIdx === 0 ? 'aspect-2/1' : 'aspect-square',
                                            'w-full object-cover group-hover:opacity-75',
                                          )}
                                        />
                                        <div className="absolute inset-0 flex flex-col justify-end">
                                          <div className="bg-black/60 p-4 text-sm">
                                            <a
                                              href={item.href}
                                              className="font-bold text-white"
                                            >
                                              <span aria-hidden="true" className="absolute inset-0" />
                                              {item.name}
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className='flex flex-col justify-between '>
                                    <div className="grid grid-cols-3 gap-x-8 gap-y-10 text-sm text-gray-500">
                                      {category.sections.map((column, columnIdx) => (
                                        <div key={columnIdx} className="space-y-10">
                                          {column.map((section) => (
                                            <div key={section.name}>
                                              <p
                                                id={`${category.id}-${section.id}-heading`}
                                                className="font-medium text-gray-900"
                                              >
                                                {section.name}
                                              </p>
                                              <ul
                                                role="list"
                                                aria-labelledby={`${category.id}-${section.id}-heading`}
                                                className="mt-4 space-y-4"
                                              >
                                                {section.items.map((item) => (
                                                  <li key={item.name} className="flex">
                                                    <a
                                                      href={item.href}
                                                      className="hover:text-gray-800"
                                                    >
                                                      {item.name}
                                                    </a>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                    <ButtonCloseHeader onClickProp={() => close()} />
                                  </div>
                                </div>
                              </div>

                            </div>
                          </PopoverPanel>
                        </>
                      )}
                    </Popover>
                  ))}

                  {navigation.pages.map((page) => (
                    <a
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </a>
                  ))}
                </div>
              </PopoverGroup> */}

              {/* Logo */}
              <a href="/" className="flex ml-2">
                <span className="sr-only">DiepLeHouse</span>
                <img
                  src={'/assets/icons/dieple-logo.svg'}
                  alt='DiepLeHouse'
                  className='w-[64px] h-[64px] sm:h-[84px] sm:w-[84px]'
                />
              </a>

              <div className="flex flex-1 items-center justify-end">

                {/* Search */}
                <a href="#" className="p-2 text-gray-400 hover:text-gray-500 block">
                  <span className="sr-only">Search</span>
                  <img
                    src={'/assets/icons/human-icon.svg'}
                    alt='DiepLeHouse'
                    className='w-[22px] h-[22px] sm:h-[24px]'
                  />
                </a>

                {/* Search */}
                <a href="#" className="p-2 text-gray-400 hover:text-gray-500 block lg:ml-4">
                  <span className="sr-only">Search</span>
                  <img
                    src={'/assets/icons/search-icon.svg'}
                    alt='DiepLeHouse'
                    className='w-[20px] h-[20px] sm:h-[24px] sm:w-[24px]'
                  />
                </a>

                {/* Account */}
                <a href="#" className="p-2 text-gray-400 hover:text-gray-500 lg:ml-4">
                  <span className="sr-only">Account</span>
                  <img
                    src={'/assets/icons/heart-icon.svg'}
                    alt='DiepLeHouse'
                    className='w-[24px] h-[24px] sm:h-[24px]'
                  />
                </a>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <a href="/cart" className="group -m-2 flex items-center p-2">
                    <img
                      src={'/assets/icons/cart-icon.svg'}
                      alt='DiepLeHouse'
                      className='w-[20px] h-[20px] sm:h-[24px]'
                    />

                    {/* <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span> */}
                    <span className="sr-only">items in cart, view bag</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav >
      </header >
    </div >
  )
}
