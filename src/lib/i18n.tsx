"use client";

/* ============================================================
   ABO TAREK — AR/EN language context (Arabic-first, RTL default)
   ============================================================ */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";

const dictionaries = {
  ar: {
    dir: "rtl" as const,
    nav: {
      home: "الرئيسية",
      about: "حكايتنا",
      menu: "المنيو",
      branches: "الفرع",
      orderNow: "اطلب دلوقتي",
      openMenu: "افتح القائمة",
      closeMenu: "اقفل القائمة",
    },
    hero: {
      badge: "وسط البلد · منذ 1950",
      titleA: "ملك",
      titleB: "الكشري",
      sub: "من عربة خشب سنة 1950 لأسطورة وسط البلد — أبو طارق، الأصل اللي مالوش تقليد. دقة، شطة، وبصل مقرمش… على أصولها.",
      ctaMenu: "شوف المنيو",
      ctaStory: "اعرف حكايتنا",
      since: "منذ 1950",
      stamp: "الأصل",
      scroll: "انزل تحت",
      mini1: "٤٠ شارع شامبليون",
      mini2: "يوميًا 9ص – 12م",
      mini3: "فرع واحد فقط",
    },
    marquee: ["كشري", "دقة", "شطة", "بصل مقرمش", "حمص", "أرز بلبن", "قصب", "منذ 1950"],
    features: {
      eyebrow: "ليه أبو طارق؟",
      title: "٧٠+ سنة ونفس الوصفة",
      sub: "مش سر… ده التزام. نفس المكونات، نفس الطريقة، نفس المكان.",
      items: [
        { title: "وصفة 1950 الأصلية", text: "الوصفة اللي بدأ بها يوسف زكي على عربته الخشب — ما تغير فيها حرف." },
        { title: "دقة وشطة على الأصول", text: "خل وثوم يتضرب كل يوم، وشطة تفتح النفس — زي ما بيتعمل من زمان." },
        { title: "فرع واحد… والباقي تقليد", text: "ملناش غير شارع شامبليون. أي حتة تانية بنفس الاسم؟ مش إحنا." },
        { title: "طبق يوصل للقلب", text: "من أول معلقة هتحس إنك في بيت عيلتك — دي حكاية ٧٦ سنة." },
      ],
    },
    showcase: {
      eyebrow: "الطبق الأسطوري",
      title: "الكشري اللي اتقال عنه",
      text: "عدس أسمر، أرز بشعيرية، مكرونتين، حمص، صلصة طماطم متبلة، وعلى الوش: بصل مقرمش دهبي. تكملها دقة وشطة — وتفهم ليه الناس بتقف طوابير من 1950.",
      cta: "استكشف المنيو كله",
      note: "صور حقيقية للكشري — الصور دي placeholders مؤقتة لحد ما نضيف تصويرنا.",
    },
    statsBand: { eyebrow: "أرقامنا", title: "الأصل في أرقام" },
    founder: {
      eyebrow: "الراجل اللي بدأها",
      title: "يوسف زكي — «أبو طارق»",
      quote: "«أبو طارق… أصل الكشري. اللي يجرب مرة، ييجي تاني.»",
      text: "من عربة خشب سنة 1950 لأشهر عنوان كشري في مصر — الراجل اللي علّم وسط البلد إن أحلى حاجة في الدنيا ممكن تطلع من حلة واحدة.",
      cta: "اقرأ الحكاية كاملة",
    },
    cta: {
      title: "جعان؟ الطبق الأصلي مستنيك",
      text: "تعالى شارع شامبليون، أو كلمنا واتساب — الطبق بيتعمل قدامك، سخن وطازة.",
      whatsapp: "كلمنا واتساب",
      directions: "وصّلنا على الخريطة",
      facebook: "تابعنا على فيسبوك",
    },
    about: {
      eyebrow: "حكايتنا",
      title: "من عربة خشب… لأسطورة",
      p1: "في سنة 1950، كان يوسف زكي — اللي كل مصر بقت تعرفه بـ«أبو طارق» — بيدفع عربة خشب صغيرة في شوارع وسط البلد. عليها حلل سخنة، ووصفة كشري ما فيهاش كلام، وإيد بتعمر أطباق تشبع قلبك قبل معدتك.",
      p2: "النهارده، وبعد أكتر من ٧٠ سنة، لسه نفس الوصفة، نفس الدقة، ونفس العنوان: شارع شامبليون، وسط البلد. العربة بقت عمارة بكذا دور، بس الطعم؟ زي ما هو. بالظبط.",
      p3: "أبو طارق مش مجرد مطعم — ده جزء من ذاكرة القاهرة. فنانين وسياح وأجيال من المصريين قعدوا على نفس الطرابيزة وطلبوا نفس الطبق. ولما تيجي، هتعرف ليه.",
      timelineEyebrow: "المشوار",
      timelineTitle: "٧٦ سنة في ٥ محطات",
      valuesEyebrow: "مبادئنا",
      valuesTitle: "اللي مخلينا الأصل",
      values: [
        { title: "الأصالة", text: "وصفة واحدة، مكان واحد، طعم واحد — من غير مساومة." },
        { title: "الجودة", text: "مكونات تتختار كل صباح، وحلل ما بتبردش." },
        { title: "الناس", text: "الزبون عندنا ضيف العيلة — من 1950 للنهارده." },
      ],
    },
    menuPage: {
      eyebrow: "المنيو",
      title: "اختار طبقك",
      sub: "كل حاجة بتتعمل قدامك، سخنة وطازة — زي 1950 بالظبط.",
      sizes: "الأحجام",
      egp: "ج.م",
      noteTitle: "ملحوظة",
      note: "الأسعار دي placeholders للعرض — هتتأكد وتتحدث من صاحب المطعم. الصور مؤقتة لحد ما يتضاف التصوير الرسمي.",
      order: "اطلب واتساب",
    },
    branchesPage: {
      eyebrow: "الفرع",
      title: "فرع واحد بس… والباقي تقليد",
      sub: "من 1950 واحنا في نفس العنوان. تعالى لحد عندنا.",
      address: "العنوان",
      hours: "المواعيد",
      call: "اتصل بينا",
      whatsapp: "واتساب",
      directions: "الاتجاهات",
      landmarks: "قريبين من",
      warningTitle: "احذر التقليد",
      warning: "ليس لدينا فروع أخرى. أي مكان تاني بيستخدم اسم «أبو طارق» مش تبعنا — الأصل عنوان واحد بس: ٤٠ شارع شامبليون.",
    },
    footer: {
      about: "أشهر عنوان كشري في مصر — فرع واحد في وسط البلد منذ 1950. اللي يجرب مرة، ييجي تاني.",
      links: "روابط",
      contact: "كلمنا",
      rights: "كل الحقوق محفوظة",
      credits: "صور الأكل الحالية: Wikimedia Commons وFlickr (رخص CC) — مؤقتة لحد التصوير الرسمي.",
    },
    whatsapp: { aria: "كلمنا على واتساب" },
  },
  en: {
    dir: "ltr" as const,
    nav: {
      home: "Home",
      about: "Our Story",
      menu: "Menu",
      branches: "Location",
      orderNow: "Order Now",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    hero: {
      badge: "Downtown Cairo · Since 1950",
      titleA: "King of",
      titleB: "Koshari",
      sub: "From a wooden cart in 1950 to a Downtown Cairo legend — Abo Tarek, the original that can't be copied. Da'a, chili, and crispy onions… the way they were meant to be.",
      ctaMenu: "See the Menu",
      ctaStory: "Our Story",
      since: "Since 1950",
      stamp: "Original",
      scroll: "Scroll down",
      mini1: "40 Champollion St",
      mini2: "Daily 9AM–12AM",
      mini3: "One branch only",
    },
    marquee: ["Koshari", "Da'a", "Chili", "Crispy Onions", "Chickpeas", "Rice Pudding", "Sugarcane", "Since 1950"],
    features: {
      eyebrow: "Why Abo Tarek?",
      title: "70+ years, same recipe",
      sub: "No secret — just commitment. Same ingredients, same method, same address.",
      items: [
        { title: "The Original 1950 Recipe", text: "The exact recipe Youssef Zaki started with on his wooden cart — untouched since." },
        { title: "Da'a & Chili Done Right", text: "Garlic-vinegar da'a whipped fresh daily, and chili that wakes you up — as always." },
        { title: "One Branch — the Rest Are Fakes", text: "We're only on Champollion Street. Anywhere else with our name? Not us." },
        { title: "A Plate That Reaches the Heart", text: "From the first spoon you'll feel at home — that's 76 years of practice." },
      ],
    },
    showcase: {
      eyebrow: "The legendary plate",
      title: "The koshari they talk about",
      text: "Black lentils, rice with vermicelli, two pastas, chickpeas, spiced tomato sauce, and a golden crown of crispy onions. Add da'a and chili — and you'll understand the queues since 1950.",
      cta: "Explore the full menu",
      note: "Real koshari photos — these are temporary placeholders until our own shoot.",
    },
    statsBand: { eyebrow: "In numbers", title: "The original, quantified" },
    founder: {
      eyebrow: "The man who started it",
      title: "Youssef Zaki — “Abo Tarek”",
      quote: "“Abo Tarek… the original koshari. Try it once, come back twice.”",
      text: "From a wooden cart in 1950 to Egypt's most famous koshari address — the man who taught Downtown Cairo that the best things come out of one pot.",
      cta: "Read the full story",
    },
    cta: {
      title: "Hungry? The original plate is waiting",
      text: "Come to Champollion Street, or message us on WhatsApp — your plate is made right in front of you, hot and fresh.",
      whatsapp: "WhatsApp us",
      directions: "Get directions",
      facebook: "Follow on Facebook",
    },
    about: {
      eyebrow: "Our story",
      title: "From a wooden cart… to a legend",
      p1: "In 1950, Youssef Zaki — who all of Egypt came to know as “Abo Tarek” — pushed a small wooden cart through the streets of Downtown Cairo. On it: steaming pots, a flawless koshari recipe, and hands that served plates to fill your heart before your stomach.",
      p2: "Today, more than 70 years later, it's still the same recipe, the same da'a, and the same address: Champollion Street, Downtown Cairo. The cart became a multi-floor building — but the taste? Exactly the same.",
      p3: "Abo Tarek isn't just a restaurant — it's part of Cairo's memory. Artists, tourists, and generations of Egyptians have sat at the same tables and ordered the same plate. When you come, you'll understand why.",
      timelineEyebrow: "The journey",
      timelineTitle: "76 years in 5 stops",
      valuesEyebrow: "Our values",
      valuesTitle: "What makes us the original",
      values: [
        { title: "Authenticity", text: "One recipe, one place, one taste — no compromises." },
        { title: "Quality", text: "Ingredients picked every morning, and pots that never cool." },
        { title: "People", text: "Every customer is a guest of the family — since 1950." },
      ],
    },
    menuPage: {
      eyebrow: "Menu",
      title: "Pick your plate",
      sub: "Everything made in front of you, hot and fresh — exactly like 1950.",
      sizes: "Sizes",
      egp: "EGP",
      noteTitle: "Note",
      note: "Prices are display placeholders — to be confirmed by the owner. Photos are temporary until the official shoot.",
      order: "Order on WhatsApp",
    },
    branchesPage: {
      eyebrow: "Location",
      title: "One branch only… the rest are fakes",
      sub: "Same address since 1950. Come find us.",
      address: "Address",
      hours: "Hours",
      call: "Call us",
      whatsapp: "WhatsApp",
      directions: "Directions",
      landmarks: "Near",
      warningTitle: "Beware of imitations",
      warning: "We have no other branches. Any other place using the name “Abo Tarek” is not us — the original has one address only: 40 Champollion Street.",
    },
    footer: {
      about: "Egypt's most famous koshari address — one branch in Downtown Cairo since 1950. Try it once, come back twice.",
      links: "Links",
      contact: "Contact",
      rights: "All rights reserved",
      credits: "Current food photos: Wikimedia Commons & Flickr (CC licenses) — temporary until the official shoot.",
    },
    whatsapp: { aria: "Chat with us on WhatsApp" },
  },
};

export type Dict = Omit<(typeof dictionaries)["ar"], "dir"> & {
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<{
  lang: Lang;
  t: Dict;
  toggle: () => void;
}>({ lang: "ar", t: dictionaries.ar, toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  // restore preference after hydration (avoids SSR/CSR mismatch)
  useEffect(() => {
    const saved = window.localStorage.getItem("abotarek-lang");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "en" || saved === "ar") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dictionaries[lang].dir;
    window.localStorage.setItem("abotarek-lang", lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  return (
    <LanguageContext.Provider
      value={{ lang, t: dictionaries[lang], toggle }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
