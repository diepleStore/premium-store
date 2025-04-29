const incentives = [
    {
      name: '24/7 Shipping',
      description: "It's not actually free we just price it into the products. Someone's paying for it, and it's not us.",
      imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce/icons/icon-delivery-light.svg',
    },
    {
      name: '24/7 Chăm sóc khách hàng',
      description: 'Our AI chat widget is powered by a naive series of if/else statements. Guaranteed to irritate.',
      imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce/icons/icon-chat-light.svg',
    },
    {
      name: 'Mua sắm nhanh gọn',
      description: "Look how fast that cart is going. What does this mean for the actual experience? I don't know.",
      imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce/icons/icon-fast-checkout-light.svg',
    },
    {
      name: 'Quà tặng thành viên',
      description: "Buy them for your friends, especially if they don't like our store. Free money for us, it's great.",
      imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce/icons/icon-gift-card-light.svg',
    },
  ]
  
  export default function Incentives() {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-2xl py-5 sm:py-15 lg:max-w-7xl">
          <div className="grid grid-cols-2 gap-y-12 sm:grid-cols-2 sm:gap-x-2 lg:grid-cols-4 lg:gap-x-8">
            {incentives.map((incentive) => (
              <div key={incentive.name}>
                <img alt="" src={incentive.imageSrc} className="h-24 w-auto" />
                <h3 className="mt-6 text-sm font-medium text-gray-900">{incentive.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{incentive.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  