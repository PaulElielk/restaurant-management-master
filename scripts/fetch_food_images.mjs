import fs from 'fs/promises';

const titlesToDownload = [
  // African items
  {
    name: 'Attiéké Poisson Braisé',
    title: 'File:Poisson la braise bien cuit.JPG',
    dest: 'frontend/src/assets/images/African/poisson_braise.jpg'
  },
  {
    name: 'Poulet Braisé Ivoirien',
    title: 'File:Poulets braisé.jpg',
    dest: 'frontend/src/assets/images/African/poulet_braise.jpg'
  },
  {
    name: "Pain Brochette (Pain-Chien d'Abidjan)",
    title: 'File:Brochette de viande aussi appelé "pain chien" en Côte d\'Ivoire.jpg',
    dest: 'frontend/src/assets/images/African/pain_brochette.jpg'
  },
  {
    name: 'Sauce Arachide (Tiguadèguè / Mafé)',
    title: 'File:Mafé Sénégalais.jpg',
    dest: 'frontend/src/assets/images/African/mafe.jpg'
  },
  {
    name: 'Dêguê',
    title: 'File:Thiakry 2013.jpg',
    dest: 'frontend/src/assets/images/African/degue.jpg'
  },
  {
    name: 'Gbofloto (Ivorian Beignets)',
    title: 'File:Nigerian-puff-puff-recipe cropped.jpg',
    dest: 'frontend/src/assets/images/African/gbofloto.jpg'
  },
  {
    name: 'Alloco avec Œuf Bouilli & Sauce Piment',
    title: 'File:Aloko.jpg',
    dest: 'frontend/src/assets/images/African/alloco_oeuf.jpg'
  },
  {
    name: 'Placali Sauce Gombo Frais (Vegan)',
    title: 'File:Sauce gombo.jpg',
    dest: 'frontend/src/assets/images/African/sauce_gombo.jpg'
  },
  {
    name: 'Gnamakoudji (Fresh Ginger Juice)',
    title: 'File:Ginger Juice.jpg',
    dest: 'frontend/src/assets/images/African/gnamakoudji.jpg'
  },

  // Fast Food items
  {
    name: 'Spicy Buffalo Wings',
    title: 'File:Homemade buffalo wings.jpg',
    dest: 'frontend/src/assets/images/fastfood/buffalo_wings.jpg'
  },
  {
    name: 'Loaded Chili Cheese Fries',
    title: 'File:Chili Cheese Fries with fork.jpg',
    dest: 'frontend/src/assets/images/fastfood/chili_cheese_fries.jpg'
  },
  {
    name: 'Philly Cheesesteak Sub',
    title: 'File:Philly Cheesesteak - 5449870218.jpg',
    dest: 'frontend/src/assets/images/fastfood/philly_cheesesteak.jpg'
  },
  {
    name: 'Crispy Chicken Tenders',
    title: 'File:Chicken tenders and french fries - June 2023 - Sarah Stierch.jpg',
    dest: 'frontend/src/assets/images/fastfood/chicken_tenders.jpg'
  },
  {
    name: 'BBQ Pulled Pork Sandwich',
    title: 'File:Pulled-pork-sandwiches.jpg',
    dest: 'frontend/src/assets/images/fastfood/pulled_pork.jpg'
  },
  {
    name: 'Beer-Battered Onion Rings',
    title: 'File:Onion Rings - Gourmet Burger Kitchen 2023-10-03.jpg',
    dest: 'frontend/src/assets/images/fastfood/onion_rings.jpg'
  },
  {
    name: 'Mozzarella Cheese Sticks',
    title: 'File:Mozzarella Sticks at Mobtown Ballroom.jpg',
    dest: 'frontend/src/assets/images/fastfood/mozzarella_sticks.jpg'
  },
  {
    name: 'Jalapeño Poppers',
    title: 'File:Jalapeño poppers.jpg',
    dest: 'frontend/src/assets/images/fastfood/jalapeno_poppers.jpg'
  },
  {
    name: 'Plant-Based Beyond Burger',
    title: 'File:Plant-based Cheeseburger - Depot Cinema and Restaurant 2025-03-06.jpg',
    dest: 'frontend/src/assets/images/fastfood/beyond_burger.jpg'
  },
  {
    name: 'Crispy Chicken Caesar Wrap',
    title: "File:Crispy Chick'n Caesar Wrap.jpg",
    dest: 'frontend/src/assets/images/fastfood/chicken_wrap.jpg'
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getThumbUrl(fileTitle) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=960&titles=' +
    encodeURIComponent(fileTitle);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RestaurantMenuImageDownloader/1.0 (academic-project; student@iugb.edu.ci)'
    }
  });
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error('No pages in API response');
  const page = Object.values(pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`No imageinfo for ${fileTitle}`);
  return info.thumburl || info.url;
}

async function run() {
  console.log(`Processing ${titlesToDownload.length} images...`);
  for (const item of titlesToDownload) {
    try {
      console.log(`\nResolving thumbnail for [${item.name}] (${item.title})...`);
      const thumbUrl = await getThumbUrl(item.title);
      console.log(`Downloading: ${thumbUrl}`);

      await sleep(600); // 600ms throttle

      const imgRes = await fetch(thumbUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!imgRes.ok) throw new Error(`Image HTTP ${imgRes.status}`);

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      await fs.writeFile(item.dest, buffer);
      console.log(`✓ Successfully saved: ${item.dest} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`✗ Failed for [${item.name}]:`, err.message);
    }
    await sleep(600);
  }
  console.log('\nAll done!');
}

run();

