import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  const { searchTerm } = await request.json();

  if (!searchTerm) {
    return NextResponse.json({ error: 'Search term required' }, { status: 400 });
  }

  try {
    // Khởi động Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Nếu dùng proxy, bỏ comment:
      // args: [`--proxy-server=${process.env.PROXY_URL}`],
    });
    const page = await browser.newPage();

    // Thiết lập User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Nếu dùng proxy có auth:
    // await page.authenticate({ username: 'your_username', password: 'your_password' });

    // Truy cập trang tìm kiếm Shopee
    const url = `https://shopee.vn/search?keyword=${encodeURIComponent(searchTerm)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Xử lý popup ngôn ngữ (nếu có)
    try {
      await page.waitForSelector('button:has-text("Tiếng Việt")', { timeout: 5000 });
      await page.click('button:has-text("Tiếng Việt")');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      // Không có popup
    }

    // Chờ danh sách sản phẩm
    await page.waitForSelector('.shopee-search-item-result__item', { timeout: 10000 });

    // Trích xuất dữ liệu từ HTML elements
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.shopee-search-item-result__item'));
      return items.slice(0, 20).map((item) => {
        const nameElement = item.querySelector('div[data-sqe="name"] > div');
        const priceElement = item.querySelector('.ZEgDH9, .hpDKMN'); // Giá hiện tại hoặc giá giảm
        const imageElement = item.querySelector('img');
        const shopElement = item.querySelector('div[data-sqe="ad"] ~ div > div');
        const linkElement = item.querySelector('a');

        return {
          name: nameElement?.textContent?.trim() || 'Unknown',
          price: priceElement?.textContent?.trim() || 'N/A',
          image: imageElement?.getAttribute('src') || '',
          shop: shopElement?.textContent?.trim() || 'Unknown',
          link: linkElement?.href || '',
        };
      });
    });

    await browser.close();

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Scrape error:', err);
    return NextResponse.json({ error: 'Không thể tải dữ liệu từ Shopee' }, { status: 500 });
  }
}