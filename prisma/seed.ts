import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  console.log('Cleaning up existing data...')
  await prisma.favorite.deleteMany()
  await prisma.recipeTag.deleteMany()
  await prisma.recipeCategory.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.groupMembership.deleteMany()
  await prisma.group.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  console.log('Creating test users...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'Admin User',
    },
  })

  const powerUser = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      password: await bcrypt.hash('Editor123!', 10),
      name: 'Editor User',
    },
  })

  const readOnlyUser = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      password: await bcrypt.hash('Viewer123!', 10),
      name: 'Viewer User',
    },
  })

  // Create a test group
  console.log('Creating test group...')
  const group = await prisma.group.create({
    data: {
      name: "Smith Family's Recipes",
      slug: 'smith-family',
      recipeBookTitle: 'Smith Family Cookbook',
      allowPowerUserEdit: true,
    },
  })

  // Add users to group with different roles
  console.log('Adding users to group...')
  await prisma.groupMembership.createMany({
    data: [
      {
        userId: adminUser.id,
        groupId: group.id,
        role: 'ADMIN',
      },
      {
        userId: powerUser.id,
        groupId: group.id,
        role: 'POWER_USER',
      },
      {
        userId: readOnlyUser.id,
        groupId: group.id,
        role: 'READ_ONLY',
      },
    ],
  })

  // Create starter categories
  console.log('Creating starter categories...')
  const categoryNames = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Desserts',
    'Appetizers',
    'Snacks',
    'Drinks',
    'Baking',
  ]

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase(),
          groupId: group.id,
        },
      })
    )
  )

  console.log(`✅ Created ${categories.length} starter categories`)

  // Create sample tags
  console.log('Creating sample tags...')
  const tagNames = ['Easy', 'Quick', 'Vegetarian', 'Kid-Friendly']
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          groupId: group.id,
        },
      })
    )
  )

  console.log(`✅ Created ${tags.length} sample tags`)

  // Create sample recipes
  console.log('Creating sample recipes...')

  // Recipe 1: Full recipe with all fields
  const recipe1 = await prisma.recipe.create({
    data: {
      title: "Grandma's Chocolate Chip Cookies",
      description: 'The best cookies in the world! Crispy edges with a chewy center.',
      ingredients: [
        {
          quantity: '2',
          unit: 'cups',
          name: 'all-purpose flour',
          note: null,
        },
        {
          quantity: '1',
          unit: 'cup',
          name: 'butter',
          note: 'softened',
        },
        {
          quantity: '3/4',
          unit: 'cup',
          name: 'granulated sugar',
          note: null,
        },
        {
          quantity: '3/4',
          unit: 'cup',
          name: 'brown sugar',
          note: 'packed',
        },
        {
          quantity: '2',
          unit: null,
          name: 'large eggs',
          note: null,
        },
        {
          quantity: '1',
          unit: 'tbsp',
          name: 'vanilla extract',
          note: null,
        },
        {
          quantity: '1',
          unit: 'tsp',
          name: 'baking soda',
          note: null,
        },
        {
          quantity: '1/2',
          unit: 'tsp',
          name: 'salt',
          note: null,
        },
        {
          quantity: '2',
          unit: 'cups',
          name: 'chocolate chips',
          note: 'semi-sweet',
        },
        {
          quantity: '1',
          unit: 'cup',
          name: 'walnuts',
          note: 'chopped (optional)',
        },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Preheat oven to 375°F.',
          notes: 'Make sure oven rack is in the middle position',
        },
        {
          stepNumber: 2,
          instruction:
            'In a small bowl, combine flour, baking soda, and salt. Set aside.',
          notes: null,
        },
        {
          stepNumber: 3,
          instruction:
            'In a large bowl, beat softened butter and both sugars until light and fluffy.',
          notes: 'This should take about 3-4 minutes with an electric mixer',
        },
        {
          stepNumber: 4,
          instruction: 'Add eggs and vanilla extract to butter mixture. Beat well.',
          notes: null,
        },
        {
          stepNumber: 5,
          instruction:
            'Gradually stir in flour mixture until just combined.',
          notes: 'Do not overmix',
        },
        {
          stepNumber: 6,
          instruction:
            'Fold in chocolate chips and walnuts using a wooden spoon or rubber spatula.',
          notes: null,
        },
        {
          stepNumber: 7,
          instruction:
            'Drop rounded tablespoons of dough onto ungreased baking sheets, spacing them about 2 inches apart.',
          notes: null,
        },
        {
          stepNumber: 8,
          instruction: 'Bake for 9-12 minutes or until golden brown.',
          notes: 'Cookies will continue to cook on the pan after removed from oven',
        },
        {
          stepNumber: 9,
          instruction:
            'Cool on baking sheet for 2 minutes, then transfer to wire rack.',
          notes: null,
        },
      ],
      servings: 48,
      prepTime: 15,
      cookTime: 11,
      notes:
        'For chewier cookies, slightly underbake them. For crispier cookies, bake a minute or two longer. Store in an airtight container for up to 5 days.',
      familyStory:
        'This recipe has been passed down through three generations of our family. Grandma Margaret made these every Sunday for 40 years, and they were always the first thing to disappear from the cookie jar. We have so many memories of baking these together during the holidays!',
      createdBy: adminUser.id,
      groupId: group.id,
    },
  })

  // Recipe 2: Simple recipe with minimal fields
  const recipe2 = await prisma.recipe.create({
    data: {
      title: 'Simple Spaghetti Bolognese',
      description: 'A quick and easy weeknight dinner',
      ingredients: [
        {
          quantity: '1',
          unit: 'lb',
          name: 'ground beef',
          note: null,
        },
        {
          quantity: '1',
          unit: 'medium',
          name: 'onion',
          note: 'diced',
        },
        {
          quantity: '3',
          unit: 'cloves',
          name: 'garlic',
          note: 'minced',
        },
        {
          quantity: '1',
          unit: 'can (28 oz)',
          name: 'crushed tomatoes',
          note: null,
        },
        {
          quantity: '2',
          unit: 'tbsp',
          name: 'tomato paste',
          note: null,
        },
        {
          quantity: '1',
          unit: 'lb',
          name: 'spaghetti',
          note: null,
        },
        {
          quantity: '2',
          unit: 'tbsp',
          name: 'olive oil',
          note: null,
        },
        {
          quantity: 'to taste',
          unit: null,
          name: 'salt and pepper',
          note: null,
        },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Heat olive oil in a large pan over medium-high heat.',
          notes: null,
        },
        {
          stepNumber: 2,
          instruction: 'Add ground beef and cook until browned, breaking it apart.',
          notes: null,
        },
        {
          stepNumber: 3,
          instruction: 'Add diced onion and cook for 3-4 minutes until softened.',
          notes: null,
        },
        {
          stepNumber: 4,
          instruction: 'Add minced garlic and tomato paste. Cook for 1 minute.',
          notes: null,
        },
        {
          stepNumber: 5,
          instruction:
            'Add crushed tomatoes and bring to a simmer. Let simmer for 15-20 minutes.',
          notes: 'Stir occasionally',
        },
        {
          stepNumber: 6,
          instruction: 'While sauce simmers, cook spaghetti according to package directions.',
          notes: null,
        },
        {
          stepNumber: 7,
          instruction: 'Season sauce with salt and pepper to taste.',
          notes: null,
        },
        {
          stepNumber: 8,
          instruction: 'Serve sauce over cooked spaghetti.',
          notes: 'Top with grated Parmesan cheese if desired',
        },
      ],
      servings: 4,
      prepTime: 10,
      cookTime: 30,
      notes: null,
      familyStory: null,
      createdBy: powerUser.id,
      groupId: group.id,
    },
  })

  // Recipe 3: Medium complexity recipe
  const recipe3 = await prisma.recipe.create({
    data: {
      title: 'Homemade Margherita Pizza',
      description:
        'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
      ingredients: [
        {
          quantity: '2.5',
          unit: 'cups',
          name: 'all-purpose flour',
          note: null,
        },
        {
          quantity: '1',
          unit: 'tsp',
          name: 'instant yeast',
          note: null,
        },
        {
          quantity: '1',
          unit: 'cup',
          name: 'warm water',
          note: null,
        },
        {
          quantity: '1.5',
          unit: 'tsp',
          name: 'salt',
          note: null,
        },
        {
          quantity: '2',
          unit: 'tbsp',
          name: 'olive oil',
          note: null,
        },
        {
          quantity: '1',
          unit: 'cup',
          name: 'tomato sauce',
          note: null,
        },
        {
          quantity: '8',
          unit: 'oz',
          name: 'fresh mozzarella',
          note: 'torn into pieces',
        },
        {
          quantity: '1',
          unit: 'bunch',
          name: 'fresh basil',
          note: null,
        },
        {
          quantity: 'to taste',
          unit: null,
          name: 'salt and pepper',
          note: null,
        },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction:
            'Mix flour, yeast, and salt in a large bowl. Add warm water and olive oil.',
          notes: 'Stir until a shaggy dough forms',
        },
        {
          stepNumber: 2,
          instruction: 'Knead dough for 8-10 minutes until smooth and elastic.',
          notes: 'Can use a stand mixer with dough hook',
        },
        {
          stepNumber: 3,
          instruction: 'Place dough in a lightly oiled bowl. Cover and let rise 1-2 hours.',
          notes: 'Dough should double in size',
        },
        {
          stepNumber: 4,
          instruction: 'Preheat oven to 475°F.',
          notes: null,
        },
        {
          stepNumber: 5,
          instruction:
            'Punch down dough and stretch it into a 12-inch round on a pizza pan.',
          notes: 'Lightly oil the pan first',
        },
        {
          stepNumber: 6,
          instruction: 'Spread tomato sauce over the dough, leaving a 1/2-inch border.',
          notes: null,
        },
        {
          stepNumber: 7,
          instruction:
            'Scatter mozzarella pieces evenly over the sauce.',
          notes: null,
        },
        {
          stepNumber: 8,
          instruction: 'Bake for 12-15 minutes until crust is golden and cheese is melted.',
          notes: null,
        },
        {
          stepNumber: 9,
          instruction:
            'Remove from oven and top with fresh basil leaves. Drizzle with olive oil.',
          notes: null,
        },
        {
          stepNumber: 10,
          instruction: 'Let cool for 2 minutes before slicing and serving.',
          notes: null,
        },
      ],
      servings: 2,
      prepTime: 20,
      cookTime: 15,
      notes:
        'If making ahead, you can prepare and freeze the dough before the final rise. Thaw in the refrigerator and use as directed.',
      familyStory:
        'We discovered this recipe on a trip to Italy and have been making it at home ever since. The kids love helping stretch the dough!',
      createdBy: adminUser.id,
      groupId: group.id,
    },
  })

  // Assign categories to sample recipes
  console.log('Assigning categories to recipes...')
  await prisma.recipeCategory.createMany({
    data: [
      { recipeId: recipe1.id, categoryId: categories[3].id }, // Desserts
      { recipeId: recipe2.id, categoryId: categories[2].id }, // Dinner
      { recipeId: recipe3.id, categoryId: categories[2].id }, // Dinner
    ],
  })

  // Assign tags to sample recipes
  console.log('Assigning tags to recipes...')
  await prisma.recipeTag.createMany({
    data: [
      { recipeId: recipe1.id, tagId: tags[3].id }, // Kid-Friendly
      { recipeId: recipe2.id, tagId: tags[1].id }, // Quick
      { recipeId: recipe3.id, tagId: tags[0].id }, // Easy
    ],
  })

  console.log(`✅ Created ${3} recipes`)
  console.log(`✅ Created ${categories.length} categories`)
  console.log(`✅ Created ${tags.length} tags`)
  console.log(`✅ Created ${1} group`)
  console.log(`✅ Created ${3} users`)
  console.log('')
  console.log('📋 Test Credentials:')
  console.log('═══════════════════════════════════════════')
  console.log('ADMIN USER:')
  console.log('  Email: admin@example.com')
  console.log('  Password: Admin123!')
  console.log('  Role: ADMIN')
  console.log('')
  console.log('EDITOR USER:')
  console.log('  Email: editor@example.com')
  console.log('  Password: Editor123!')
  console.log('  Role: POWER_USER')
  console.log('')
  console.log('VIEWER USER:')
  console.log('  Email: viewer@example.com')
  console.log('  Password: Viewer123!')
  console.log('  Role: READ_ONLY')
  console.log('═══════════════════════════════════════════')
  console.log('')
  console.log('Group: Smith Family\'s Recipes (slug: smith-family)')
  console.log('Settings: allowPowerUserEdit = true')
  console.log('')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
