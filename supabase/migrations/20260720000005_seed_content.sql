-- Seed SiteContent with brand, stats, gallery, timeline from data.ts

INSERT INTO "SiteContent" (id, key, value, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'brand', '{
  "nameAr": "أبو طارق",
  "nameEn": "Abo Tarek",
  "taglineAr": "ملك الكشري — الأصل منذ 1950",
  "taglineEn": "King of Koshari — The Original since 1950",
  "foundedYear": 1950,
  "founderAr": "يوسف زكي «أبو طارق»",
  "founderEn": "Youssef Zaki \"Abo Tarek\"",
  "facebook": "https://web.facebook.com/kosharyaboutarek",
  "phone": "+201000000000",
  "whatsapp": "https://wa.me/201000000000"
}', NOW(), NOW()),

(gen_random_uuid(), 'stats', '[
  {"id": "years", "from": 0, "to": 76, "suffixAr": "+", "suffixEn": "+", "labelAr": "سنة من الأصل", "labelEn": "years of the original"},
  {"id": "branch", "from": 0, "to": 1, "suffixAr": "", "suffixEn": "", "labelAr": "فرع واحد فقط", "labelEn": "one branch only"},
  {"id": "since", "from": 1900, "to": 1950, "suffixAr": "", "suffixEn": "", "labelAr": "سنة البداية", "labelEn": "the year it started"},
  {"id": "original", "from": 0, "to": 100, "suffixAr": "٪", "suffixEn": "%", "labelAr": "طعم أصلي", "labelEn": "original taste"}
]', NOW(), NOW()),

(gen_random_uuid(), 'gallery', '[
  {"src": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Abu_tariq_koshari.jpg", "altAr": "طبق كشري أبو طارق الشهير", "altEn": "The famous Abo Tarek koshari plate", "credit": "Morios — CC BY-SA 3.0 (Wikimedia Commons)"},
  {"src": "https://upload.wikimedia.org/wikipedia/commons/f/f7/Cairo_koshary.jpg", "altAr": "كشري على الطريقة القاهرية", "altEn": "Cairo-style koshary", "credit": "Arria Belli — CC BY-SA 2.0 (Wikimedia Commons)"},
  {"src": "https://live.staticflickr.com/41/88387743_d6fa866a05_b.jpg", "altAr": "طبق كشري مصري", "altEn": "Egyptian koshary plate", "credit": "mnadi — CC BY-NC 2.0 (Flickr)"},
  {"src": "https://live.staticflickr.com/2692/4356577541_0aba285c4b_b.jpg", "altAr": "كشري بالبصل المقرمش", "altEn": "Koshary topped with crispy onions", "credit": "h-bomb — CC BY-NC-SA 2.0 (Flickr)"}
]', NOW(), NOW()),

(gen_random_uuid(), 'timeline', '[
  {"yearAr": "1950", "yearEn": "1950", "titleAr": "عربة الخشب", "titleEn": "The Wooden Cart", "textAr": "يوسف زكي يبدأ بعربة كشري صغيرة في شوارع وسط البلد — حلة سخنة، وصفة سرية، وقلب كبير.", "textEn": "Youssef Zaki starts with a small koshari cart in the streets of Downtown Cairo — a hot pot, a secret recipe, and a big heart."},
  {"yearAr": "الستينيات", "yearEn": "The 60s", "titleAr": "من عربة لمحل", "titleEn": "From Cart to Shop", "textAr": "الطابور يطول، والعربة تتحول لمحل ثابت في شارع شامبليون — نفس المكان اللي بنستناكم فيه النهارده.", "textEn": "The queue grows, and the cart becomes a permanent shop on Champollion Street — the same address waiting for you today."},
  {"yearAr": "الثمانينيات", "yearEn": "The 80s", "titleAr": "اسم في كل بيت", "titleEn": "A Household Name", "textAr": "أبو طارق يبقى علامة وسط البلد. المحل يتوسع دور ورا دور، والناس تقصد من كل حتة في مصر.", "textEn": "Abo Tarek becomes a Downtown landmark. The shop grows floor after floor, and people come from all over Egypt."},
  {"yearAr": "الألفينات", "yearEn": "The 2000s", "titleAr": "وجهة المشاهير", "titleEn": "A Celebrity Destination", "textAr": "فنانين، إعلاميين، وسياح من كل العالم — الكل ييجي يجرب الأصل ويتصور في المكان الأشهر.", "textEn": "Artists, journalists, and tourists from everywhere — all come to taste the original at the most famous address."},
  {"yearAr": "النهارده", "yearEn": "Today", "titleAr": "نفس الوصفة، نفس المكان", "titleEn": "Same Recipe, Same Place", "textAr": "فرع واحد فقط في شارع شامبليون. الباقي؟ تقليد. والأسطورة مستمرة بإيد الجيل اللي بعده.", "textEn": "One branch only, on Champollion Street. Everything else? An imitation. The legend goes on with the next generation."}
]', NOW(), NOW());

-- Seed Branch with all fields including the new ones
INSERT INTO "Branch" (id, number, "nameAr", "nameEn", "addressAr", "addressEn", phone, whatsapp, "mapsUrl", "hoursAr", "hoursEn", "landmarksAr", "landmarksEn", "createdAt", "updatedAt") VALUES
(1, 'flagship', 'فرع وسط البلد — الأصل', 'Downtown Flagship — The Original', '٤٠ شارع شامبليون، المعروف، وسط البلد، القاهرة', '40 Champollion St, Marouf, Downtown Cairo', '+201000000000', 'https://wa.me/201000000000', 'https://www.google.com/maps/search/?api=1&query=Koshary+Abou+Tarek+Champollion+Downtown+Cairo', 'يوميًا: 9:00 صباحًا – 12:00 منتصف الليل', 'Daily: 9:00 AM – 12:00 midnight', '["ميدان التحرير","الجامعة الأمريكية – التحرير","مترو السادات"]', '["Tahrir Square","AUC Tahrir","Sadat Metro"]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('"Branch_id_seq"', (SELECT MAX(id) FROM "Branch"));

INSERT INTO "Category" (id, "nameAr", "nameEn", "order", image, "createdAt", "updatedAt") VALUES
(1, 'الكشري', 'Koshari', 0, 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Abu_tariq_koshari.jpg', NOW(), NOW()),
(2, 'الإضافات', 'Extras', 1, 'https://live.staticflickr.com/5220/5384913459_f2bbbeb55c_b.jpg', NOW(), NOW()),
(3, 'الحلويات', 'Desserts', 2, 'https://live.staticflickr.com/150/428297650_7813fc8344_b.jpg', NOW(), NOW()),
(4, 'المشروبات', 'Drinks', 3, 'https://live.staticflickr.com/73/168926505_a480e25d0e.jpg', NOW(), NOW());

SELECT setval('"Category_id_seq"', (SELECT MAX(id) FROM "Category"));

INSERT INTO "MenuItem" (id, "categoryId", "nameAr", "nameEn", "descAr", "descEn", price, sizes, image, badge, available, "createdAt", "updatedAt") VALUES
(1, 1, 'كشري كلاسيك', 'Classic Koshari', 'الوصفة الأصلية من 1950: عدس، أرز، مكرونة، حمص، صلصة، دقة، وبصل مقرمش.', 'The original 1950 recipe: lentils, rice, pasta, chickpeas, tomato sauce, garlic-vinegar da''a and crispy onions.', NULL, '[{"label":{"ar":"صغير","en":"Small"},"price":40},{"label":{"ar":"وسط","en":"Medium"},"price":55},{"label":{"ar":"كبير","en":"Large"},"price":70}]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Abu_tariq_koshari.jpg', 'popular', true, NOW(), NOW()),
(2, 1, 'أبو طارق سبيشال', 'Abo Tarek Special', 'الطبق الأسطوري: كل حاجة تزيد — حمص زيادة، بصل زيادة، ودقة على المزاج.', 'The legendary plate: extra everything — chickpeas, crispy onions, and da''a to your taste.', 95, NULL, 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Cairo_koshary.jpg', 'signature', true, NOW(), NOW()),
(3, 1, 'كشري عائلي', 'Family Koshari', 'صينية تكفي العيلة — نفس الطعم الأصلي بكمية تلمّ العزومة.', 'A tray that feeds the family — same original taste, gathering size.', 160, NULL, 'https://live.staticflickr.com/41/88387743_d6fa866a05_b.jpg', NULL, true, NOW(), NOW()),
(4, 1, 'كشري على المزاج', 'Koshari Your Way', 'ظبط طبقك: شطة أكتر، دقة أكتر، بصل أكتر — زي ما تحب بالظبط.', 'Tune your plate: more heat, more da''a, more onions — exactly how you like it.', NULL, '[{"label":{"ar":"وسط","en":"Medium"},"price":60},{"label":{"ar":"كبير","en":"Large"},"price":75}]'::jsonb, 'https://live.staticflickr.com/2692/4356577541_0aba285c4b_b.jpg', NULL, true, NOW(), NOW()),
(5, 2, 'حمص إضافي', 'Extra Chickpeas', 'معلقة حمص زيادة تكمل الطبق صح.', 'An extra scoop of chickpeas to finish the plate right.', 10, NULL, 'https://live.staticflickr.com/5220/5384913459_f2bbbeb55c_b.jpg', NULL, true, NOW(), NOW()),
(6, 2, 'بصل مقرمش إضافي', 'Extra Crispy Onions', 'البصل اللي بيتعمل على نار هادية لحد ما يبقى دهبي ومقرمش.', 'Slow-fried onions until golden and shattering-crisp.', 8, NULL, 'https://live.staticflickr.com/5058/5517257674_967686d469_b.jpg', NULL, true, NOW(), NOW()),
(7, 2, 'دقة وشطة', 'Da''a & Chili', 'خل وثوم على الطريقة الأصلية + شطة تفتح النفس.', 'Original garlic-vinegar da''a plus a kick of chili.', 5, NULL, 'https://live.staticflickr.com/8354/8333680937_05bc435446_b.jpg', NULL, true, NOW(), NOW()),
(8, 2, 'بيضة مسلوقة', 'Boiled Egg', 'بيضة بلدي مسلوقة تكمل بروتين الطبق.', 'A country boiled egg to round out the plate.', 8, NULL, 'https://live.staticflickr.com/8253/8749857318_533678fc8b_b.jpg', NULL, true, NOW(), NOW()),
(9, 3, 'أرز بلبن', 'Roz Bel Laban', 'أرز باللبن على الطريقة المصرية — الختام المثالي بعد الكشري.', 'Egyptian rice pudding — the perfect ending after koshari.', 25, NULL, 'https://live.staticflickr.com/150/428297650_7813fc8344_b.jpg', 'signature', true, NOW(), NOW()),
(10, 3, 'مهلبية', 'Mahalabia', 'مهلبية ناعمة بماء الزهر، باردة وخفيفة.', 'Silky orange-blossom milk pudding, served chilled.', 25, NULL, 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Mahalabia.JPG', NULL, true, NOW(), NOW()),
(11, 4, 'عصير قصب', 'Sugarcane Juice', 'قصب طازة بيعصر قدامك — رفيق الكشري الأول.', 'Fresh-pressed sugarcane — koshari''s oldest friend.', 20, NULL, 'https://live.staticflickr.com/73/168926505_a480e25d0e.jpg', NULL, true, NOW(), NOW()),
(12, 4, 'كركديه', 'Karkade (Hibiscus)', 'كركديه بارد يروّي ويكسر حدة الشطة.', 'Iced hibiscus — cools the chili kick.', 15, NULL, 'https://live.staticflickr.com/7569/15689044632_ac3009c7e2_b.jpg', NULL, true, NOW(), NOW()),
(13, 4, 'تمر هندي', 'Tamarind Juice', 'تمر هندي حامض-حلو على الأصول.', 'Sweet-sour tamarind, the classic way.', 15, NULL, 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Es_Asem_Jawa_%28Javanese_Tamarind_Juice%29.jpg', NULL, true, NOW(), NOW());

SELECT setval('"MenuItem_id_seq"', (SELECT MAX(id) FROM "MenuItem"));

INSERT INTO "SystemSetting" (id, key, value, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'order_history_ttl_hours', '4'::jsonb, NOW(), NOW()),
(gen_random_uuid(), 'customer_live_tracking', 'false'::jsonb, NOW(), NOW()),
(gen_random_uuid(), 'staff_sound_alerts', 'false'::jsonb, NOW(), NOW());
