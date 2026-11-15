import prisma from "../src/db";
import { SYSTEM_HOME_CATEGORY_SLUG } from "../src/constants/category";

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const mode = apply ? "APPLY" : "DRY-RUN";

  console.log(`[assign-dinolipi] Running in ${mode} mode...`);

  const homeCategory = await prisma.category.findFirst({
    where: {
      OR: [{ isSystem: true }, { slug: SYSTEM_HOME_CATEGORY_SLUG }],
    },
    include: {
      children: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!homeCategory) {
    console.error(
      `[assign-dinolipi] System category "${SYSTEM_HOME_CATEGORY_SLUG}" not found. Run Prisma migrations first.`
    );
    process.exitCode = 1;
    return;
  }

  const homeCategoryIds = [
    homeCategory.id,
    ...homeCategory.children.map((c) => c.id),
  ];

  const postsToUpdate = await prisma.post.findMany({
    where: {
      NOT: {
        OR: [
          { categoryId: { in: homeCategoryIds } },
          { categories: { some: { id: { in: homeCategoryIds } } } },
        ],
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      categoryId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const publishedCount = postsToUpdate.filter(
    (p) => p.status === "PUBLISHED"
  ).length;
  const otherCount = postsToUpdate.length - publishedCount;

  console.log(
    `[assign-dinolipi] Target category: ${homeCategory.name} (${homeCategory.slug}, id=${homeCategory.id})`
  );
  console.log(
    `[assign-dinolipi] Sub-categories included: ${homeCategory.children.length}`
  );
  console.log(
    `[assign-dinolipi] Posts without দিনলিপি (or its sub-categories): ${postsToUpdate.length} total (PUBLISHED: ${publishedCount}, OTHER: ${otherCount})`
  );

  if (postsToUpdate.length > 0) {
    console.log("[assign-dinolipi] Sample affected posts (up to 10):");
    postsToUpdate.slice(0, 10).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.status}] ${p.title} (${p.slug})`);
    });
  }

  if (!apply) {
    console.log(
      "[assign-dinolipi] Dry run complete. No database records were modified."
    );
    console.log(
      "[assign-dinolipi] Re-run with --apply to connect these posts to দিনলিপি."
    );
    return;
  }

  await prisma.$transaction(
    postsToUpdate.map((post) =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          categories: {
            connect: { id: homeCategory.id },
          },
          ...(post.categoryId === null ? { categoryId: homeCategory.id } : {}),
        },
      })
    )
  );

  console.log(
    `[assign-dinolipi] Successfully assigned ${postsToUpdate.length} post(s) to ${homeCategory.name}.`
  );
}

main()
  .catch((err) => {
    console.error("[assign-dinolipi] Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
