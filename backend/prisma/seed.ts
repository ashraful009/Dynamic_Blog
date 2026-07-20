import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Site Settings
  console.log('Seeding Site Settings...');
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'DATUM',
      navLinks: [
        { label: 'Field Notes', href: '#index' },
        { label: 'Principles', href: '#' },
        { label: 'About', href: '#' },
      ],
      headerCtaText: 'Subscribe',
      headerCtaLink: '#subscribe',
      heroCoordText: 'FIG. 01 / HOMEPAGE — LAST UPDATED 09.07.2026',
      heroTitle: 'Design is <accent>measured</accent>, not guessed.',
      heroSubtitle: 'A journal documenting the intersection of system architecture, interface design, and typography. Updated irregularly.',
      heroPrimaryBtnText: 'Browse the index',
      heroPrimaryBtnLink: '#index',
      heroSecondaryBtnText: 'Get new notes by email',
      heroSecondaryBtnLink: '#subscribe',
      heroPanelLabel: 'N 41.203 / E 6.004',
      newsletterTitle: 'Get new notes by email.',
      newsletterSubtitle: 'Periodic updates on design systems, craft, and process. No spam.',
      newsletterPlaceholder: 'your@email.com',
      newsletterBtnText: 'Subscribe',
      newsletterNote: 'Free. Unsubscribe anytime.',
      footerMark: 'Datum — index 048, updated 2026',
      footerLinks: [
        { label: 'Field Notes', href: '#index' },
        { label: 'Archive', href: '#' },
        { label: 'RSS', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  });

  // 2. Seed Categories
  console.log('Seeding Categories...');
  const categories = ['Systems', 'Craft', 'Theory', 'Process'];
  const createdCategories = [];
  
  for (const name of categories) {
    const slug = name.toLowerCase();
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    createdCategories.push(category);
  }

  // 3. Optional: Ensure an author exists before seeding posts (assuming User model exists)
  const defaultUser = await prisma.user.findFirst();

  if (defaultUser) {
    console.log('Seeding Demo Posts...');
    const demoPosts = [
      {
        title: 'The mechanics of whitespace',
        slug: 'mechanics-of-whitespace',
        content: '<p>Whitespace is an active element...</p>',
        excerpt: 'Why nothing is the most important thing you can add to a design.',
        status: 'PUBLISHED',
        readTime: 6,
        displayOrder: 1,
        categoryId: createdCategories.find(c => c.name === 'Theory')?.id,
      },
      {
        title: 'Building resilient token systems',
        slug: 'resilient-token-systems',
        content: '<p>A design token is...</p>',
        excerpt: 'How to structure semantic variables that scale across platforms without breaking.',
        status: 'PUBLISHED',
        readTime: 12,
        displayOrder: 2,
        categoryId: createdCategories.find(c => c.name === 'Systems')?.id,
        isFeatured: true,
      },
    ];

    for (const p of demoPosts) {
      await prisma.post.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          ...p,
          status: 'PUBLISHED' as any,
          authorId: defaultUser.id,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
