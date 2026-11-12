import { PrismaClient, PostStatus, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding (100% shuhanrizwan.com clone)...');

  // 1. Seed Admin User
  console.log('👤 Seeding Admin User...');
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variable. Both are required for seeding.'
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'ফেরদৌস আনাম জীবন',
      role: Role.ADMIN,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'ফেরদৌস আনাম জীবন',
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 2. Seed Site Settings (All editable from Admin Panel)
  console.log('⚙️ Seeding Site Settings...');
  const goodreadsBooks = [
    {
      title: 'Hoa Mộng Ảo',
      author: 'Keigo Higashino',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=160&auto=format&fit=crop&q=80',
      rating: 0,
      link: 'https://www.goodreads.com',
    },
    {
      title: 'Invisible Helix',
      author: 'Keigo Higashino',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=160&auto=format&fit=crop&q=80',
      rating: 0,
      link: 'https://www.goodreads.com',
    },
    {
      title: "A Midsummer's Equation",
      author: 'Keigo Higashino',
      coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=160&auto=format&fit=crop&q=80',
      rating: 0,
      link: 'https://www.goodreads.com',
    },
    {
      title: 'বিশ্বাসঘাতকগণ',
      author: 'Afsan Chowdhury',
      coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=160&auto=format&fit=crop&q=80',
      rating: 3,
      link: 'https://www.goodreads.com',
    },
    {
      title: 'Guilt',
      author: 'Keigo Higashino',
      coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=160&auto=format&fit=crop&q=80',
      rating: 0,
      link: 'https://www.goodreads.com',
    },
  ];

  // SVG Data URI matching the black banner with yellow "Help us to keep on writing!" text from Screenshot 4
  const helpUsBannerSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="170" viewBox="0 0 500 170">
      <rect width="500" height="170" fill="#050505"/>
      <text x="250" y="72" text-anchor="middle" fill="#ffea00" font-family="Comic Sans MS, Segoe Print, cursive, sans-serif" font-size="36" font-style="italic" font-weight="bold">Help us to</text>
      <text x="250" y="128" text-anchor="middle" fill="#ffea00" font-family="Comic Sans MS, Segoe Print, cursive, sans-serif" font-size="36" font-style="italic" font-weight="bold">keep on writing!</text>
    </svg>`
  )}`;

  const settingsPayload = {
    siteName: 'ফেরদৌস আনাম জীবন',
    siteSubtitle: 'লেখালেখি',
    readMoreBtnText: 'READ MORE',
    navLinks: [
      { label: 'মূলপাতা', href: '/' },
      { label: 'প্রকাশিত বই', href: '/category/prokashito-boi' },
      { label: 'দিনলিপি', href: '/category/dinlipi' },
      { label: 'লেখক প্রসঙ্গে', href: '/about' },
    ],
    headerCtaText: 'Subscribe',
    headerCtaLink: '#subscribe',
    heroCoordText: 'লেখালেখি — সাহিত্য, চলচ্চিত্র ও অনুবাদ',
    heroTitle: 'ফেরদৌস আনাম জীবন | লেখালেখি',
    heroSubtitle: 'দেশ-বিদেশের সাহিত্য, অনুবাদ, চলচ্চিত্র এবং সমসাময়িক ভাবনার ব্যক্তিগত সংকলন।',
    heroPrimaryBtnText: 'সকল লেখা দেখুন',
    heroPrimaryBtnLink: '#index',
    heroSecondaryBtnText: 'ইমেইলে নতুন লেখা পান',
    heroSecondaryBtnLink: '#subscribe',
    heroPanelLabel: 'ঢাকা, বাংলাদেশ',
    heroImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&auto=format&fit=crop&q=80',
    sidebarNewsletterLabel: 'নতুন লেখা মেইলে পেতে সাবস্ক্রাইব করুনঃ',
    newsletterTitle: 'The Dhakaiya Journal',
    newsletterSubtitle: 'By Ferdaus Anam Jibon',
    newsletterPlaceholder: 'Type your email...',
    newsletterBtnText: 'Subscribe',
    newsletterNote: "By subscribing you agree to Substack's Terms of Use, our Privacy Policy and our Information collection notice",
    footerMark: '© ২০২৬ ফেরদৌস আনাম জীবন — লেখালেখি | সর্বস্বত্ব সংরক্ষিত',
    footerLinks: [
      { label: 'মূলপাতা', href: '/' },
      { label: 'বইয়ের আলাপ', href: '/category/boiyer-alap' },
      { label: 'অনুবাদ', href: '/category/onubad' },
      { label: 'লেখক প্রসঙ্গে', href: '/about' },
    ],
    sidebarAboutTitle: '',
    sidebarAboutImage: helpUsBannerSvg,
    sidebarAboutText: `প্রিয় পাঠক,\n\n০৮ বছর ধরে এই ওয়েবসাইটে আমি আলোচনা করছি দেশ বিদেশের বিভিন্ন বই নিয়ে, অনুবাদ করছি ভিনদেশি প্রবন্ধ কি সাক্ষাৎকার, অথবা আলাপ করছি পছন্দের সিনেমা কি ব্যক্তিত্বদের নিয়ে। যথেষ্ট সময় আর শ্রম ব্যয় করে, ব্যক্তি প্রচেষ্টায় তিলে তিলে গড়ে তোলা এই ওয়েবসাইটকে আমি চেষ্টা করেছি অগণিত বাংলাভাষী ওয়েবপোর্টালের মাঝে স্বতন্ত্র করে তুলতে। আর পাঠক এখানে লেখাগুলো পড়তে পারছেন কোনো ধরনের বিজ্ঞাপনের উৎপাত ছাড়াই।\n\nঅতএব, প্রিয় পাঠক, এই সাইটের কোনো লেখা যদি আপনাকে আনন্দ দেয়, কিংবা আপনার উপকারে আসে, তবে চাইলে আপনি সংগ্রহ করতে পারেন আমার প্রকাশিত বইগুলো, {{LINK}}।\n\nআপনার সামান্য আগ্রহও লেখককে উৎসাহিত করবে বহুগুণ।`,
    sidebarAboutLinkText: 'এই লিংক থেকে',
    sidebarAboutLinkUrl: '/category/prokashito-boi',
    sidebarAboutSignoff: '- ফেরদৌস আনাম জীবন',
    sidebarGoodreadsTitle: 'গুডরিডসের পড়াশোনা',
    sidebarGoodreadsBooks: goodreadsBooks,
    sidebarRecentTitle: 'সাম্প্রতিক লেখা',
    sidebarRecentCount: 5,
    sidebarCategoriesTitle: 'বিষয় নির্বাচন',
    sidebarTagsTitle: 'যা নিয়ে লিখছি, যাদের নিয়ে লিখছি',
    sidebarCustomHtml: '',
    showSidebarAbout: true,
    showSidebarNewsletter: true,
    showSidebarGoodreads: true,
    showSidebarRecent: true,
    showSidebarCategories: true,
    showSidebarTags: true,
  };

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: settingsPayload,
    create: {
      id: 'default',
      ...settingsPayload,
    },
  });

  // 3. Seed About Page
  console.log('📄 Seeding About Page...');
  await prisma.aboutPage.upsert({
    where: { id: 'default' },
    update: {
      name: 'ফেরদৌস আনাম জীবন',
      designation: 'কথাসাহিত্যিক, গবেষক ও প্রাবন্ধিক',
      email: adminEmail,
      phone: '+880 1700-000000',
      biography: `ফেরদৌস আনাম জীবন সমসাময়িক বাংলা সাহিত্যের একজন নিষ্ঠাবান পাঠক, লেখক ও গবেষক। দেশ-বিদেশের ক্লাসিক ও সমকালীন উপন্যাস, ছোটগল্প, অনুবাদ সাহিত্য এবং বিশ্ব চলচ্চিত্রের নানা বাঁক নিয়ে তিনি নিয়মিত লেখালেখি করছেন।\n\nতাঁর লেখালেখির মূল আগ্রহ লাতিন আমেরিকান ও ইউরোপীয় সাহিত্য, ইতিহাস আশ্রিত ফিকশন এবং প্রামাণ্যচিত্র। পাঠকের কাছে বিশ্বসাহিত্যের রস ও বিশ্লেষণ সহজবোধ্য ও গভীরতায় পৌঁছে দিতেই এই ব্যক্তিগত ওয়েবসাইটের যাত্রা।`,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      skills: [
        { name: 'সাহিত্য সমালোচনা', percentage: 95 },
        { name: 'অনুবাদ সাহিত্য', percentage: 90 },
        { name: 'চলচ্চিত্র বিশ্লেষণ', percentage: 85 },
        { name: 'ইতিহাস ও গবেষণা', percentage: 88 },
      ],
    },
    create: {
      id: 'default',
      name: 'ফেরদৌস আনাম জীবন',
      designation: 'কথাসাহিত্যিক, গবেষক ও প্রাবন্ধিক',
      email: adminEmail,
      phone: '+880 1700-000000',
      biography: `ফেরদৌস আনাম জীবন সমসাময়িক বাংলা সাহিত্যের একজন নিষ্ঠাবান পাঠক, লেখক ও গবেষক। দেশ-বিদেশের ক্লাসিক ও সমকালীন উপন্যাস, ছোটগল্প, অনুবাদ সাহিত্য এবং বিশ্ব চলচ্চিত্রের নানা বাঁক নিয়ে তিনি নিয়মিত লেখালেখি করছেন।\n\nতাঁর লেখালেখির মূল আগ্রহ লাতিন আমেরিকান ও ইউরোপীয় সাহিত্য, ইতিহাস আশ্রিত ফিকশন এবং প্রামাণ্যচিত্র। পাঠকের কাছে বিশ্বসাহিত্যের রস ও বিশ্লেষণ সহজবোধ্য ও গভীরতায় পৌঁছে দিতেই এই ব্যক্তিগত ওয়েবসাইটের যাত্রা।`,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      skills: [
        { name: 'সাহিত্য সমালোচনা', percentage: 95 },
        { name: 'অনুবাদ সাহিত্য', percentage: 90 },
        { name: 'চলচ্চিত্র বিশ্লেষণ', percentage: 85 },
        { name: 'ইতিহাস ও গবেষণা', percentage: 88 },
      ],
    },
  });

  // 4. Seed Hierarchical Categories matching shuhanrizwan.com
  console.log('📂 Seeding Categories & Subcategories...');
  const parentCategoriesData = [
    { name: 'অনুবাদ', slug: 'onubad', showInHeader: false },
    { name: 'ইতিহাস', slug: 'itihash', showInHeader: false },
    { name: 'খেলা', slug: 'khela', showInHeader: false },
    { name: 'গল্প', slug: 'golpo', showInHeader: false },
    { name: 'চলচ্চিত্র', slug: 'cholochitro', showInHeader: false },
    { name: 'টিভি সিরিজ', slug: 'tv-series', showInHeader: false },
    { name: 'বইয়ের আলাপ', slug: 'boiyer-alap', showInHeader: false },
    { name: 'বিবিধ', slug: 'bibidho', showInHeader: false },
    { name: 'বিশেষ মাসিক প্রতিবেদন', slug: 'bishesh-mashik-protibedon', showInHeader: false },
    { name: 'ব্যক্তিত্ব', slug: 'bektitto', showInHeader: false },
    { name: 'ভ্রমণ', slug: 'bhromon', showInHeader: false },
    { name: 'সাক্ষাৎকার', slug: 'shakkhatkar', showInHeader: false },
    { name: 'প্রকাশিত বই', slug: 'prokashito-boi', showInHeader: true },
    { name: 'দিনলিপি', slug: 'dinlipi', showInHeader: true },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of parentCategoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, showInHeader: cat.showInHeader },
      create: { name: cat.name, slug: cat.slug, showInHeader: cat.showInHeader },
    });
    categoryMap[cat.slug] = record.id;
  }

  // Child Categories matching shuhanrizwan.com
  const childCategoriesData = [
    // Under খেলা (khela)
    { name: 'ক্রিকেট', slug: 'cricket', parentSlug: 'khela' },
    { name: 'ফুটবল', slug: 'football', parentSlug: 'khela' },
    // Under বইয়ের আলাপ (boiyer-alap)
    { name: 'উপন্যাস', slug: 'uponnash', parentSlug: 'boiyer-alap' },
    { name: 'কবিতা', slug: 'kobita', parentSlug: 'boiyer-alap' },
    { name: 'ছোটগল্প', slug: 'chotogolpo', parentSlug: 'boiyer-alap' },
    // Under প্রকাশিত বই (prokashito-boi)
    { name: 'সাক্ষী ছিল শিরস্ত্রাণ', slug: 'shakkhi-chilo-shirostran', parentSlug: 'prokashito-boi' },
    { name: 'পদতলে চমকায় মাটি', slug: 'podotole-chomkay-mati', parentSlug: 'prokashito-boi' },
    // Under দিনলিপি (dinlipi)
    { name: 'স্মৃতিচারণ ও দিনলিপি', slug: 'smriticharon', parentSlug: 'dinlipi' },
  ];

  for (const sub of childCategoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {
        name: sub.name,
        parentId: categoryMap[sub.parentSlug],
      },
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId: categoryMap[sub.parentSlug],
      },
    });
    categoryMap[sub.slug] = record.id;
  }

  // 5. Seed Tags matching Screenshot 1 (যা নিয়ে লিখছি, যাদের নিয়ে লিখছি)
  console.log('🏷️ Seeding Literary & Topic Tags...');
  const tagsData = [
    { name: 'অদিতি ফাল্গুনী', slug: 'aditi-falguni' },
    { name: 'আখতারুজ্জামান ইলিয়াস', slug: 'akhtaruzzaman-elias' },
    { name: 'আঁধার ওয়াল্ড', slug: 'adhar-world' },
    { name: 'আর্নেস্ট হেমিংওয়ে', slug: 'ernest-hemingway' },
    { name: 'আলবার্তো ম্যাঙ্গুয়েল', slug: 'alberto-manguel' },
    { name: 'আসগর ফরহাদি', slug: 'asghar-farhadi-1' },
    { name: 'আসগার ফারহাদি', slug: 'asghar-farhadi' },
    { name: 'ইতালো কালভিনো', slug: 'italo-calvino' },
    { name: 'ইফ অন আ উইন্টার’স নাইট এ ট্রাভেলার', slug: 'if-on-a-winters-night-a-traveler' },
    { name: 'ইসমাইল কাদারে', slug: 'ismail-kadare' },
    { name: 'উইচ হান্টিং', slug: 'witch-hunting' },
    { name: 'এদুয়ার্দো গ্যালিয়ানো', slug: 'eduardo-galeano' },
    { name: 'এমাদুল রেজা', slug: 'emadul-reza' },
    { name: 'ওরহান পামুক', slug: 'orhan-pamuk' },
    { name: 'গাব্রিয়েল গার্সিয়া মার্কেজ', slug: 'gabriel-garcia-marquez' },
    { name: 'জিল্লুর রহমান সোহাগ', slug: 'zillur-rahman-sohag' },
    { name: 'তিতুবা:সালেমের কালো ডাইনি', slug: 'tituba-black-witch-of-salem' },
    { name: 'দস্তয়েভস্কি', slug: 'dostoevsky' },
    { name: 'প্যারিস', slug: 'paris' },
    { name: 'বইমেলা ২০২০', slug: 'boimela-2020' },
    { name: 'বইয়ের তালিকা', slug: 'boiyer-talika' },
    { name: 'বর্ণালী সাহা', slug: 'bornali-saha' },
    { name: 'বিশেষ প্রতিবেদন', slug: 'bishesh-protibedon' },
    { name: 'বিশ্বকাপ ফুটবল', slug: 'world-cup-football' },
    { name: 'মানিক বন্দ্যোপাধ্যায়', slug: 'manik-bandyopadhyay' },
    { name: 'মারিও বার্গাস ইয়োসা', slug: 'mario-vargas-llosa' },
    { name: 'মাসরুর আরেফিন', slug: 'masroor-arefin' },
    { name: 'রবের্তো বোলানিও', slug: 'roberto-bolano' },
  ];

  const tagMap: Record<string, string> = {};
  for (const t of tagsData) {
    const record = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: { name: t.name, slug: t.slug },
    });
    tagMap[t.slug] = record.id;
  }

  // 6. Seed Posts with Multiple Categories & Tags matching shuhanrizwan.com screenshots
  console.log('📝 Seeding Blog Posts with Multiple Categories & Tags...');
  const postsData = [
    {
      title: 'বিশ্বকাপের বিদায়ে',
      slug: 'bishwokaper-bidaye',
      coverImage: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&auto=format&fit=crop&q=80',
      excerpt: `বিশ্বকাপ শেষের টুকরো ভাবনাগুলো তুলে রাখতে এই পোস্ট।\n\n১) রাত-জাগা টিভি পর্দার বাইরেও বিশ্বকাপকে মধুর করে তোলে টুকটাক আরও কিছু ব্যাপার। বন্ধুর সাথে খোঁচাখুঁচি, এক সাথে খেলা দেখা, ফুটবল সংক্রান্ত লেখালেখি পড়া, কন্টেন্ট দেখা। বিশেষ করে শেষের প্রসঙ্গ দুটোয় আমার আগ্রহ বেশি।\n\nসদ্য ফুরানো বিশ্বকাপটা যাপনের সময় কিছু জিনিস নিয়মিত পড়েছি, দেখেছি। বিশ্বকাপের ঘোরের ওপর ইরেজার ধরাতে গিয়ে মনে হলো, তাদের প্রতি এক ধরনের কৃতজ্ঞতা প্রকাশের দায় আছে।`,
      content: `
        <p>বিশ্বকাপ শেষের টুকরো ভাবনাগুলো তুলে রাখতে এই পোস্ট।</p>
        <p><strong>১)</strong> রাত-জাগা টিভি পর্দার বাইরেও বিশ্বকাপকে মধুর করে তোলে টুকটাক আরও কিছু ব্যাপার। বন্ধুর সাথে খোঁচাখুঁচি, এক সাথে খেলা দেখা, ফুটবল সংক্রান্ত লেখালেখি পড়া, কন্টেন্ট দেখা। বিশেষ করে শেষের প্রসঙ্গ দুটোয় আমার আগ্রহ বেশি।</p>
        <p>সদ্য ফুরানো বিশ্বকাপটা যাপনের সময় কিছু জিনিস নিয়মিত পড়েছি, দেখেছি। বিশ্বকাপের ঘোরের ওপর ইরেজার ধরাতে গিয়ে মনে হলো, তাদের প্রতি এক ধরনের কৃতজ্ঞতা প্রকাশের দায় আছে।</p>
        <h2>মাঠের বাইরের সাহিত্য</h2>
        <p>ফুটবল কেবল নব্বই মিনিটের খেলা নয়; লাতিন আমেরিকা থেকে শুরু করে ইউরোপ কিংবা আমাদের দক্ষিণ এশিয়ার গলিপথ—সবখানেই ফুটবল ঘিরে তৈরি হয় অজস্র মানবিক আখ্যান। মেসির শেষ বিশ্বকাপ জয়ের এই মুহূর্তটি যেমন ইতিহাসের পাতায় অমর হয়ে থাকবে, তেমনি অমর হয়ে থাকবে দর্শকদের এই এক মাসের সম্মিলিত উন্মাদনা।</p>
      `,
      categorySlugs: ['khela', 'football', 'bibidho'],
      tagSlugs: ['world-cup-football', 'eduardo-galeano'],
      isFeatured: true,
      readTime: 6,
      displayOrder: 1,
      views: 342,
      publishedAt: new Date('2026-07-22T10:00:00Z'),
    },
    {
      title: 'ফুটবল নিয়ে ০৫ সিনেমা',
      slug: 'football-niye-05-cinema',
      coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80',
      excerpt: `গল্পটা প্রতি চার বছরে ফিরে ফিরে আসতো লাতিন আমেরিকার সাহিত্য জগতে।\n\nমানুষটা নাকি তখন একমাসের জন্য বাড়ির দরজা বন্ধ রাখে, দরজার বাইরে নোটিশ দেয়ঃ খেলা দেখার জন্য বন্ধ। ওই একটা মাস নাকি মানুষটা টিভির সামনে নিজের প্রিয় চেয়ারে বসে শুধু খেলা দ্যাখে, আর সেটা নিয়ে লিখে যায়।\n\nমানুষটা এদুয়ার্দো গ্যালিয়ানো, খেলাটা ফুটবল, আর সময়টা বিশ্বকাপ।\n\nপ্রিয় লেখক, ইতিহাসবিদ গ্যালিয়ানো আর বেঁচে নেই—কিন্তু তার সেই খেলা দেখার পাগলামিকে প্রতিনিয়ত দেখতে পাই অনেকের মাঝে। বিশ্বকাপ এলেই রাত জেগে খেলা দেখা যেন বাঙালির উৎসব-মনা প্রবৃত্তির একটা দিককে প্রকাশ করে নতুন ভাবে।`,
      content: `
        <p>গল্পটা প্রতি চার বছরে ফিরে ফিরে আসতো লাতিন আমেরিকার সাহিত্য জগতে।</p>
        <p>মানুষটা নাকি তখন একমাসের জন্য বাড়ির দরজা বন্ধ রাখে, দরজার বাইরে নোটিশ দেয়ঃ খেলা দেখার জন্য বন্ধ। ওই একটা মাস নাকি মানুষটা টিভির সামনে নিজের প্রিয় চেয়ারে বসে শুধু খেলা দ্যাখে, আর সেটা নিয়ে লিখে যায়।</p>
        <p>মানুষটা এদুয়ার্দো গ্যালিয়ানো, খেলাটা ফুটবল, আর সময়টা বিশ্বকাপ।</p>
        <p>প্রিয় লেখক, ইতিহাসবিদ গ্যালিয়ানো আর বেঁচে নেই—কিন্তু তার সেই খেলা দেখার পাগলামিকে প্রতিনিয়ত দেখতে পাই অনেকের মাঝে। বিশ্বকাপ এলেই রাত জেগে খেলা দেখা যেন বাঙালির উৎসব-মনা প্রবৃত্তির একটা দিককে প্রকাশ করে নতুন ভাবে।</p>
        <h2>১. দ্য ড্যামড ইউনাইটেড (The Damned United)</h2>
        <p>ব্রায়ান ক্লাফের লিডস ইউনাইটেড অধ্যায়ের সেই চমৎকার মনস্তাত্ত্বিক লড়াই নিয়ে নির্মিত এই চলচ্চিত্রটি ফুটবলপ্রেমীদের জন্য এক অনন্য অভিজ্ঞতা।</p>
        <h2>২. অফসাইড (Offside - 2006)</h2>
        <p>ইরানি নির্মাতা জাফর পানাহির এই অসাধারণ সিনেমাটি স্টেডিয়ামে নারীদের প্রবেশাধিকার ও ফুটবল উন্মাদনাকে এক মানবিক দৃষ্টিতে তুলে ধরেছে।</p>
      `,
      categorySlugs: ['khela', 'cholochitro', 'football'],
      tagSlugs: ['eduardo-galeano', 'world-cup-football', 'asghar-farhadi'],
      isFeatured: false,
      readTime: 8,
      displayOrder: 2,
      views: 289,
      publishedAt: new Date('2026-05-31T10:00:00Z'),
    },
    {
      title: '‘মহাশূন্যতায়’ প্রসঙ্গে',
      slug: 'mohashunnotay-proshonge',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
      excerpt: `একবিংশ শতাব্দীর দ্বিতীয় দশকে বাংলাদেশি সাহিত্যের একটা বাঁক বদল ঘটেছে। বিশ্বায়নের হাত ধরে মার্গারেট অ্যাটউডের ডিস্টোপিয়া কি ডেভিড লিঞ্চের হরর—সবই ঢুকে গেছে বাঙালির জনমানসে, ফিকশনের জগতেও গত দশক থেকে সেটার একটা প্রতিফলন পাওয়া যায়। নতুন যে লেখকেরা লিখতে শুরু করেন এই সময়টায়— জঁরা হোক কি লিটারারি ফিকশন, উভয় ধারাতেই — পূর্বের তুলনায় অনেক বেশি বৈচিত্র্য আর চোখে পড়ার মতো আত্মবিশ্বাস দেখা যায় তাদের মাঝে। উদ্দিষ্ট এসব লেখকের মাঝে এক দশক পরেও যারা টিকে গেছেন আর পাঠকের কাছে যাদের পরিচিতি ক্রমশ বাড়ছে—তানজীম রহমান তাদের মাঝে অন্যতম।`,
      content: `
        <p>একবিংশ শতাব্দীর দ্বিতীয় দশকে বাংলাদেশি সাহিত্যের একটা বাঁক বদল ঘটেছে। বিশ্বায়নের হাত ধরে মার্গারেট অ্যাটউডের ডিস্টোপিয়া কি ডেভিড লিঞ্চের হরর—সবই ঢুকে গেছে বাঙালির জনমানসে, ফিকশনের জগতেও গত দশক থেকে সেটার একটা প্রতিফলন পাওয়া যায়। নতুন যে লেখকেরা লিখতে শুরু করেন এই সময়টায়— জঁরা হোক কি লিটারারি ফিকশন, উভয় ধারাতেই — পূর্বের তুলনায় অনেক বেশি বৈচিত্র্য আর চোখে পড়ার মতো আত্মবিশ্বাস দেখা যায় তাদের মাঝে। উদ্দিষ্ট এসব লেখকের মাঝে এক দশক পরেও যারা টিকে গেছেন আর পাঠকের কাছে যাদের পরিচিতি ক্রমশ বাড়ছে—তানজীম রহমান তাদের মাঝে অন্যতম।</p>
        <h2>আখ্যান ও কাঠামো</h2>
        <p>‘মহাশূন্যতায়’ উপন্যাসের পরতে পরতে রয়েছে নগরজীবনের বিচ্ছিন্নতা, পরাবাস্তব আবহ এবং ভাষাগত নিরীক্ষা। লেখকের গদ্যভঙ্গি পাঠককে এক অদ্ভুত ঘোরের ভেতর টেনে নেয়।</p>
      `,
      categorySlugs: ['uponnash', 'boiyer-alap'],
      tagSlugs: ['boimela-2020', 'boiyer-talika', 'emadul-reza'],
      isFeatured: false,
      readTime: 10,
      displayOrder: 3,
      views: 215,
      publishedAt: new Date('2026-05-09T10:00:00Z'),
    },
    {
      title: 'নিভু নিভু ‘দূরের তারা’',
      slug: 'nivu-nivu-durer-tara',
      coverImage: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=1200&auto=format&fit=crop&q=80',
      excerpt: `[২০০৩ সালে রবের্তো বোলানিওর এই সাক্ষাৎকারটি নিয়েছিলেন মিরনিকা মারিস্টেইন। প্লেবয় পত্রিকার আর্জেন্টিনা সংস্করণে ছাপা হওয়া বোলানিওর শেষ সাক্ষাৎকার ছিল এটি। এ বছরের জুলাই মাসে বোলানিওর প্রয়াণ দিবসে তার স্মৃতির প্রতি শ্রদ্ধা জানিয়ে সাক্ষাৎকারটির অনুবাদ প্রকাশ করা হলো।]`,
      content: `
        <p><em>[২০০৩ সালে রবের্তো বোলানিওর এই সাক্ষাৎকারটি নিয়েছিলেন মিরনিকা মারিস্টেইন। প্লেবয় পত্রিকার আর্জেন্টিনা সংস্করণে ছাপা হওয়া বোলানিওর শেষ সাক্ষাৎকার ছিল এটি। বোলানিওর প্রয়াণ দিবসে তার স্মৃতির প্রতি শ্রদ্ধা জানিয়ে সাক্ষাৎকারটির অনুবাদ প্রকাশ করা হলো।]</em></p>
        <p>লাতিন আমেরিকান সাহিত্যে গাব্রিয়েল গার্সিয়া মার্কেজ পরবর্তী প্রজন্মের সবচেয়ে শক্তিশালী কণ্ঠস্বর মনে করা হয় চিলিয়ান কথাসাহিত্যিক রবের্তো বোলানিওকে। তাঁর ‘দ্য স্যাভেজ ডিটেকটিভস’ এবং ‘২৬৬৬’ বিশ্বসাহিত্যের মোড় ঘুরিয়ে দেওয়া দুই কীর্তি।</p>
        <h2>সাহিত্য ও নির্বাসন প্রসঙ্গে</h2>
        <p>সাক্ষাৎকারে বোলানিও নিজের লেখক জীবন, চিলি ত্যাগ, মেক্সিকোর বোহেমিয়ান দিনগুলো এবং লাতিন আমেরিকার রাজনীতি নিয়ে অকপটে কথা বলেছেন।</p>
      `,
      categorySlugs: ['bektitto', 'shakkhatkar', 'onubad'],
      tagSlugs: ['roberto-bolano', 'gabriel-garcia-marquez', 'mario-vargas-llosa', 'alberto-manguel'],
      isFeatured: false,
      readTime: 12,
      displayOrder: 4,
      views: 198,
      publishedAt: new Date('2026-04-29T10:00:00Z'),
    },
    {
      title: '‘দেলুপি’ নিয়ে কয়েক লাইন',
      slug: 'delupi-niye-koyek-line',
      coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      excerpt: `সাম্প্রতিক সময়ে দেখা দেশি-বিদেশি স্বাধীন চলচ্চিত্র ও এর নির্মাণশৈলী নিয়ে কিছু বিচ্ছিন্ন ভাবনা।\n\nস্থানীয় জনপদের গল্প যখন বিশ্বজনীন ভাষায় কথা বলে, তখন তা দর্শকের মনে দীর্ঘস্থায়ী ছাপ ফেলে।`,
      content: `
        <p>সাম্প্রতিক সময়ে দেখা দেশি-বিদেশি স্বাধীন চলচ্চিত্র ও এর নির্মাণশৈলী নিয়ে কিছু বিচ্ছিন্ন ভাবনা। স্থানীয় জনপদের গল্প যখন বিশ্বজনীন ভাষায় কথা বলে, তখন তা দর্শকের মনে দীর্ঘস্থায়ী ছাপ ফেলে।</p>
        <p>দৃশ্যভাষা, আবহসংগীত এবং অপেশাদার অভিনয়শিল্পীদের স্বতঃস্ফূর্ত উপস্থিতি ‘দেলুপি’-কে এক অনন্য উচ্চতায় নিয়ে গেছে।</p>
      `,
      categorySlugs: ['cholochitro', 'bibidho'],
      tagSlugs: ['asghar-farhadi-1', 'asghar-farhadi'],
      isFeatured: false,
      readTime: 5,
      displayOrder: 5,
      views: 176,
      publishedAt: new Date('2026-02-19T10:00:00Z'),
    },
    {
      title: '‘অ্যানিমেল ফার্ম’ প্রসঙ্গে',
      slug: 'animal-farm-proshonge',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
      excerpt: `জর্জ অরওয়েলের কালজয়ী রূপকধর্মী উপন্যাস ‘অ্যানিমেল ফার্ম’-এর বাংলা অনুবাদ এবং সমকালীন বিশ্ব রাজনীতিতে এর প্রাসঙ্গিকতা নিয়ে বিস্তারিত আলোচনা।\n\nক্ষমতার মনস্তত্ত্ব ও বিপ্লবের বেহাত হওয়ার আখ্যান।`,
      content: `
        <p>জর্জ অরওয়েলের কালজয়ী রূপকধর্মী উপন্যাস ‘অ্যানিমেল ফার্ম’-এর বাংলা অনুবাদ এবং সমকালীন বিশ্ব রাজনীতিতে এর প্রাসঙ্গিকতা নিয়ে বিস্তারিত আলোচনা।</p>
        <p>ম্যানর ফার্মের পশুদের বিদ্রোহ এবং পরবর্তীতে নেপোলিয়নের একনায়কতান্ত্রিক শাসনের মধ্য দিয়ে অরওয়েল যে রাজনৈতিক রূপক নির্মাণ করেছেন, তা আজও সমানভাবে প্রাসঙ্গিক।</p>
      `,
      categorySlugs: ['onubad', 'uponnash', 'boiyer-alap'],
      tagSlugs: ['dostoevsky', 'ismail-kadare', 'italo-calvino'],
      isFeatured: false,
      readTime: 7,
      displayOrder: 6,
      views: 154,
      publishedAt: new Date('2025-03-17T10:00:00Z'),
    },
    {
      title: 'ওরহান পামুকের জাদুঘর ও ইস্তাম্বুলের বিষণ্ণতা',
      slug: 'orhan-pamuk-istanbul',
      coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&auto=format&fit=crop&q=80',
      excerpt: `নোবেলজয়ী তুর্কি কথাসাহিত্যিক ওরহান পামুকের ‘দ্য মিউজিয়াম অব ইনোসেন্স’ এবং ইস্তাম্বুল শহরের স্মৃতিমেদুরতা নিয়ে ভ্রমণ ও সাহিত্যের এক যৌথ পাঠ।`,
      content: `
        <p>নোবেলজয়ী তুর্কি কথাসাহিত্যিক ওরহান পামুকের ‘দ্য মিউজিয়াম অব ইনোসেন্স’ কেবল একটি উপন্যাস নয়, বরং ভালোবাসার এক জীবন্ত জাদুঘর।</p>
        <p>ইস্তাম্বুলের অলিগলি, বসফরাসের হাওয়া আর ‘হুজুন’ বা সামষ্টিক বিষণ্ণতার যে ছবি পামুক এঁকেছেন, তা যেকোনো সাহিত্যপ্রেমী পর্যটককে ভাবিয়ে তোলে।</p>
      `,
      categorySlugs: ['bhromon', 'boiyer-alap', 'itihash'],
      tagSlugs: ['orhan-pamuk', 'paris', 'if-on-a-winters-night-a-traveler'],
      isFeatured: false,
      readTime: 9,
      displayOrder: 7,
      views: 132,
      publishedAt: new Date('2025-01-12T10:00:00Z'),
    },
    {
      title: 'আখতারুজ্জামান ইলিয়াসের ছোটগল্পে নিম্নবর্গের ভাষা',
      slug: 'akhtaruzzaman-elias-chotogolpo',
      coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=80',
      excerpt: `বাংলা কথাসাহিত্যে আখতারুজ্জামান ইলিয়াস যে নির্মম বাস্তবতা ও ব্ল্যাক হিউমারের আমদানি করেছিলেন, তাঁর ছোটগল্পগুলোর আলোকে তার এক নিবিড় পাঠ।`,
      content: `
        <p>বাংলা কথাসাহিত্যে আখতারুজ্জামান ইলিয়াস এক অদ্বিতীয় নাম। ‘অন্য ঘরে অন্য স্বর’, ‘খোঁয়ারি’ কিংবা ‘দুধেভাতে উৎপাত’—প্রতিটি গল্পেই পুরান ঢাকা থেকে শুরু করে প্রান্তিক মানুষের মুখের ভাষা ও জীবনযুদ্ধ উঠে এসেছে নির্মোহ ভঙ্গিতে।</p>
      `,
      categorySlugs: ['chotogolpo', 'golpo', 'boiyer-alap'],
      tagSlugs: ['akhtaruzzaman-elias', 'manik-bandyopadhyay', 'masroor-arefin'],
      isFeatured: false,
      readTime: 11,
      displayOrder: 8,
      views: 120,
      publishedAt: new Date('2024-11-20T10:00:00Z'),
    },
    {
      title: 'সালেমের কালো ডাইনি ও মধ্যযুগীয় উইচ হান্টিংয়ের ইতিহাস',
      slug: 'salem-witch-hunting-itihash',
      coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop&q=80',
      excerpt: `ম্যারি কঁদের ‘তিতুবা: সালেমের কালো ডাইনি’ উপন্যাসের সূত্র ধরে সপ্তদশ শতাব্দীর সালেম উইচ ট্রায়াল এবং ইতিহাসের অন্ধকার অধ্যায়ের অনুসন্ধান।`,
      content: `
        <p>ম্যারি কঁদের বিখ্যাত উপন্যাস ‘তিতুবা: সালেমের কালো ডাইনি’ আমাদের নিয়ে যায় ১৬৯২ সালের ম্যাসাচুসেটসের সেই ভয়াল সময়ে, যেখানে কুসংস্কার ও ক্ষমতার দ্বন্দ্বে বলি হয়েছিলেন অসংখ্য নারী।</p>
      `,
      categorySlugs: ['itihash', 'onubad', 'uponnash'],
      tagSlugs: ['tituba-black-witch-of-salem', 'witch-hunting', 'aditi-falguni', 'bornali-saha'],
      isFeatured: false,
      readTime: 10,
      displayOrder: 9,
      views: 110,
      publishedAt: new Date('2024-09-14T10:00:00Z'),
    },
    {
      title: 'ক্রিকেটের ধ্রুপদী টেস্ট ও বিষণ্ণ বিকেলের কাব্য',
      slug: 'cricket-test-kabyo',
      coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
      excerpt: `পাঁচ দিনের টেস্ট ক্রিকেট যেন এক দীর্ঘ উপন্যাসের মতো—যেখানে প্রতিটি সেশন নতুন বাঁক নেয়, আর শেষ বিকেলের দীর্ঘ ছায়ায় লুকিয়ে থাকে জয়-পরাজয়ের নাটকীয়তা।`,
      content: `
        <p>পাঁচ দিনের টেস্ট ক্রিকেট যেন এক দীর্ঘ উপন্যাসের মতো—যেখানে প্রতিটি সেশন নতুন বাঁক নেয়, আর শেষ বিকেলের দীর্ঘ ছায়ায় লুকিয়ে থাকে জয়-পরাজয়ের নাটকীয়তা।</p>
      `,
      categorySlugs: ['khela', 'cricket', 'dinlipi'],
      tagSlugs: ['ernest-hemingway', 'zillur-rahman-sohag'],
      isFeatured: false,
      readTime: 6,
      displayOrder: 10,
      views: 95,
      publishedAt: new Date('2024-07-05T10:00:00Z'),
    },
    {
      title: 'আধুনিক কবিতায় শহরের নিঃসঙ্গতা ও টিভি সিরিজের বয়ান',
      slug: 'kobita-o-tv-series',
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
      excerpt: `সমকালীন কবিতা এবং আধুনিক ওটিটি টিভি সিরিজগুলোতে নাগরিক মানুষের একাকীত্ব যেভাবে ফুটে উঠছে, তার এক তুলনামূলক বিশেষ মাসিক প্রতিবেদন।`,
      content: `
        <p>সমকালীন কবিতা এবং আধুনিক টিভি সিরিজগুলোতে নাগরিক মানুষের একাকীত্ব যেভাবে ফুটে উঠছে, তার এক তুলনামূলক আলোচনা।</p>
      `,
      categorySlugs: ['kobita', 'tv-series', 'bishesh-mashik-protibedon', 'prokashito-boi'],
      tagSlugs: ['bishesh-protibedon', 'adhar-world'],
      isFeatured: false,
      readTime: 8,
      displayOrder: 11,
      views: 88,
      publishedAt: new Date('2024-05-18T10:00:00Z'),
    },
  ];

  const seededPosts = [];
  for (const p of postsData) {
    const catIds = p.categorySlugs.map((slug) => categoryMap[slug]).filter(Boolean);
    const tIds = p.tagSlugs.map((slug) => tagMap[slug]).filter(Boolean);
    const primaryCatId = catIds[0] || null;

    const post = await prisma.post.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        ogImage: p.coverImage,
        metaTitle: p.title,
        metaDescription: p.excerpt.substring(0, 300),
        status: PostStatus.PUBLISHED,
        isFeatured: p.isFeatured,
        readTime: p.readTime,
        displayOrder: p.displayOrder,
        views: p.views,
        categoryId: primaryCatId,
        categories: {
          set: catIds.map((id) => ({ id })),
        },
        tags: {
          set: tIds.map((id) => ({ id })),
        },
        publishedAt: p.publishedAt,
      },
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        ogImage: p.coverImage,
        metaTitle: p.title,
        metaDescription: p.excerpt.substring(0, 300),
        status: PostStatus.PUBLISHED,
        isFeatured: p.isFeatured,
        readTime: p.readTime,
        displayOrder: p.displayOrder,
        views: p.views,
        authorId: adminUser.id,
        categoryId: primaryCatId,
        categories: {
          connect: catIds.map((id) => ({ id })),
        },
        tags: {
          connect: tIds.map((id) => ({ id })),
        },
        publishedAt: p.publishedAt,
      },
    });
    seededPosts.push(post);
  }

  // 7. Seed Sample Comments
  console.log('💬 Seeding Sample Comments...');
  const commentCount = await prisma.comment.count();
  if (commentCount === 0 && seededPosts.length > 0) {
    const parentComment = await prisma.comment.create({
      data: {
        postId: seededPosts[0].id,
        authorName: 'তানভীর আহমেদ',
        authorEmail: 'tanvir@example.com',
        content: 'চমৎকার লেখা! বিশ্বকাপের রেশ সত্যিই সহজে কাটার নয়। এদুয়ার্দো গ্যালিয়ানোর প্রসঙ্গটিও দারুণ লেগেছে।',
      },
    });

    await prisma.comment.create({
      data: {
        postId: seededPosts[0].id,
        parentId: parentComment.id,
        authorName: 'ফেরদৌস আনাম জীবন',
        authorEmail: adminEmail,
        content: 'অসংখ্য ধন্যবাদ তানভীর ভাই, পাঠ ও মতামতের জন্য কৃতজ্ঞতা!',
      },
    });
  }

  // 8. Seed Sample Subscribers
  console.log('📧 Seeding Sample Subscribers...');
  const sampleSubscribers = ['reader1@example.com', 'literature.lover@example.com', 'bangla.bookworm@example.com'];
  for (const email of sampleSubscribers) {
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
