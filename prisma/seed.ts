import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const branchesData = [
  {
    number: "1",
    nameAr: "فرع وسط البلد — الأصل",
    nameEn: "Downtown Flagship — The Original",
    addressAr: "٤٠ شارع شامبليون، المعروف، وسط البلد، القاهرة",
    addressEn: "40 Champollion St, Marouf, Downtown Cairo",
    phone: "+201000000000",
    whatsapp: "+201000000000",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Koshary+Abou+Tarek+Champollion+Downtown+Cairo",
  },
];

const categoriesData = [
  {
    nameAr: "الكشري",
    nameEn: "Koshari",
    order: 0,
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Abu_tariq_koshari.jpg",
    items: [
      {
        nameAr: "كشري كلاسيك",
        nameEn: "Classic Koshari",
        descAr: "الوصفة الأصلية من 1950: عدس، أرز، مكرونة، حمص، صلصة، دقة، وبصل مقرمش.",
        descEn: "The original 1950 recipe: lentils, rice, pasta, chickpeas, tomato sauce, garlic-vinegar da'a and crispy onions.",
        price: null,
        sizes: [
          { label: { ar: "صغير", en: "Small" }, price: 40 },
          { label: { ar: "وسط", en: "Medium" }, price: 55 },
          { label: { ar: "كبير", en: "Large" }, price: 70 },
        ],
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Abu_tariq_koshari.jpg",
        badge: "popular",
        available: true,
      },
      {
        nameAr: "أبو طارق سبيشال",
        nameEn: "Abo Tarek Special",
        descAr: "الطبق الأسطوري: كل حاجة تزيد — حمص زيادة، بصل زيادة، ودقة على المزاج.",
        descEn: "The legendary plate: extra everything — chickpeas, crispy onions, and da'a to your taste.",
        price: 95,
        sizes: null,
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Cairo_koshary.jpg",
        badge: "signature",
        available: true,
      },
      {
        nameAr: "كشري عائلي",
        nameEn: "Family Koshari",
        descAr: "صينية تكفي العيلة — نفس الطعم الأصلي بكمية تلمّ العزومة.",
        descEn: "A tray that feeds the family — same original taste, gathering size.",
        price: 160,
        sizes: null,
        image: "https://live.staticflickr.com/41/88387743_d6fa866a05_b.jpg",
        badge: null,
        available: true,
      },
      {
        nameAr: "كشري على المزاج",
        nameEn: "Koshari Your Way",
        descAr: "ظبط طبقك: شطة أكتر، دقة أكتر، بصل أكتر — زي ما تحب بالظبط.",
        descEn: "Tune your plate: more heat, more da'a, more onions — exactly how you like it.",
        price: null,
        sizes: [
          { label: { ar: "وسط", en: "Medium" }, price: 60 },
          { label: { ar: "كبير", en: "Large" }, price: 75 },
        ],
        image: "https://live.staticflickr.com/2692/4356577541_0aba285c4b_b.jpg",
        badge: null,
        available: true,
      },
    ],
  },
  {
    nameAr: "الإضافات",
    nameEn: "Extras",
    order: 1,
    image: "https://live.staticflickr.com/5220/5384913459_f2bbbeb55c_b.jpg",
    items: [
      {
        nameAr: "حمص إضافي",
        nameEn: "Extra Chickpeas",
        descAr: "معلقة حمص زيادة تكمل الطبق صح.",
        descEn: "An extra scoop of chickpeas to finish the plate right.",
        price: 10,
        sizes: null,
        image: "https://live.staticflickr.com/5220/5384913459_f2bbbeb55c_b.jpg",
        badge: null,
        available: true,
      },
      {
        nameAr: "بصل مقرمش إضافي",
        nameEn: "Extra Crispy Onions",
        descAr: "البصل اللي بيتعمل على نار هادية لحد ما يبقى دهبي ومقرمش.",
        descEn: "Slow-fried onions until golden and shattering-crisp.",
        price: 8,
        sizes: null,
        image: "https://live.staticflickr.com/5058/5517257674_967686d469_b.jpg",
        badge: null,
        available: true,
      },
      {
        nameAr: "دقة وشطة",
        nameEn: "Da'a & Chili",
        descAr: "خل وثوم على الطريقة الأصلية + شطة تفتح النفس.",
        descEn: "Original garlic-vinegar da'a plus a kick of chili.",
        price: 5,
        sizes: null,
        image: "https://live.staticflickr.com/8354/8333680937_05bc435446_b.jpg",
        badge: null,
        available: true,
      },
      {
        nameAr: "بيضة مسلوقة",
        nameEn: "Boiled Egg",
        descAr: "بيضة بلدي مسلوقة تكمل بروتين الطبق.",
        descEn: "A country boiled egg to round out the plate.",
        price: 8,
        sizes: null,
        image: "https://live.staticflickr.com/8253/8749857318_533678fc8b_b.jpg",
        badge: null,
        available: true,
      },
    ],
  },
  {
    nameAr: "الحلويات",
    nameEn: "Desserts",
    order: 2,
    image: "https://live.staticflickr.com/150/428297650_7813fc8344_b.jpg",
    items: [
      {
        nameAr: "أرز بلبن",
        nameEn: "Roz Bel Laban",
        descAr: "أرز باللبن على الطريقة المصرية — الختام المثالي بعد الكشري.",
        descEn: "Egyptian rice pudding — the perfect ending after koshari.",
        price: 25,
        sizes: null,
        image: "https://live.staticflickr.com/150/428297650_7813fc8344_b.jpg",
        badge: "signature",
        available: true,
      },
      {
        nameAr: "مهلبية",
        nameEn: "Mahalabia",
        descAr: "مهلبية ناعمة بماء الزهر، باردة وخفيفة.",
        descEn: "Silky orange-blossom milk pudding, served chilled.",
        price: 25,
        sizes: null,
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Mahalabia.JPG",
        badge: null,
        available: true,
      },
    ],
  },
  {
    nameAr: "المشروبات",
    nameEn: "Drinks",
    order: 3,
    image: "https://live.staticflickr.com/73/168926505_a480e25d0e.jpg",
    items: [
      {
        nameAr: "عصير قصب",
        nameEn: "Sugarcane Juice",
        descAr: "قصب طازة بيعصر قدامك — رفيق الكشري الأول.",
        descEn: "Fresh-pressed sugarcane — koshari's oldest friend.",
        price: 20,
        sizes: null,
        image: "https://live.staticflickr.com/73/168926505_a480e25d0e.jpg",
        badge: null,
        available: true,
      },
      {
        nameAr: "كركديه",
        nameEn: "Karkade (Hibiscus)",
        descAr: "كركديه بارد يروّي ويكسر حدة الشطة.",
        descEn: "Iced hibiscus — cools the chili kick.",
        price: 15,
        sizes: null,
        image: "https://live.staticflickr.com/7569/15689044632_ac3009c7e2_b.jpg",
        badge: null,
        available: true,
      },
      {
        nameAr: "تمر هندي",
        nameEn: "Tamarind Juice",
        descAr: "تمر هندي حامض-حلو على الأصول.",
        descEn: "Sweet-sour tamarind, the classic way.",
        price: 15,
        sizes: null,
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Es_Asem_Jawa_%28Javanese_Tamarind_Juice%29.jpg",
        badge: null,
        available: true,
      },
    ],
  },
];

async function main() {
  console.log("Seeding database …\n");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Seed branches
  for (const b of branchesData) {
    await prisma.branch.create({ data: b });
  }
  console.log(`${branchesData.length} branches seeded`);

  // Seed categories + items
  for (const cat of categoriesData) {
    const { items, ...catData } = cat;
    const created = await prisma.category.create({
      data: {
        ...catData,
        items: {
          create: items.map((item) => ({
            ...item,
            sizes: item.sizes ? JSON.parse(JSON.stringify(item.sizes)) : null,
          })),
        },
      },
    });
    console.log(`  ${created.nameEn}: ${items.length} items`);
  }
  console.log(`\n${categoriesData.length} categories seeded`);

  // Seed default system settings
  const defaults = [
    { key: "order_history_ttl_hours", value: 4 },
    { key: "customer_live_tracking", value: false },
    { key: "staff_sound_alerts", value: false },
  ];
  for (const d of defaults) {
    await prisma.systemSetting.create({ data: d });
  }
  console.log(`${defaults.length} system settings seeded`);

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
