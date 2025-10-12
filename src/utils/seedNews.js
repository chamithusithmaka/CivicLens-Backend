const mongoose = require('mongoose');
require('dotenv').config();
const News = require('../models/news');

const newsData = [
  {
    title: 'Government Announces Major Infrastructure Investment',
    summary: 'A $2 billion investment plan has been approved for national infrastructure development over the next five years.',
    content: 'The Ministry of Infrastructure unveiled an ambitious plan to revitalize the country\'s aging infrastructure. The program includes renovating 150 bridges, constructing 500km of new highways, and modernizing public transportation in major cities. "This investment will not only improve our national infrastructure but also create thousands of jobs," said the Minister during the announcement. The first phase is scheduled to begin next month with projects in the northern regions.',
    category: 'Infrastructure',
    author: 'Sarah Johnson',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-05'),
    tags: ['infrastructure', 'government', 'development']
  },
  {
    title: 'Healthcare Reform Bill Passes Parliament',
    summary: 'Landmark healthcare legislation approved after months of debate, promising universal coverage by 2025.',
    content: 'After six months of intensive debate and negotiations, Parliament has passed the comprehensive Healthcare Reform Act with a majority of 62%. The bill aims to provide universal healthcare coverage to all citizens by 2025, restructure hospital funding, and increase resources for preventive medicine. Opposition parties have expressed concerns about the implementation timeline and budget allocations. The Ministry of Health will begin rolling out the first phase of reforms in January, focusing on rural healthcare access improvements.',
    category: 'Healthcare',
    author: 'Dr. Michael Chen',
    imageUrl: 'https://images.unsplash.com/photo-1631815588090-d1bcbe9a3537?q=80&w=1000',
    isBreaking: true,
    isActive: true,
    date: new Date('2023-11-12'),
    tags: ['healthcare', 'reform', 'parliament', 'policy']
  },
  {
    title: 'Education Ministry Launches New Digital Curriculum',
    summary: 'Schools nationwide to implement technology-focused learning program starting next academic year.',
    content: 'The Ministry of Education has announced a comprehensive overhaul of the national curriculum, with a strong emphasis on digital literacy and STEM subjects. The initiative, called "Education for Tomorrow," will equip all public schools with modern computer labs and provide teacher training for new teaching methodologies. Education experts have praised the move as necessary for preparing students for future workforce demands. Parents\' associations have generally responded positively but raised concerns about potential screen time increases for younger students.',
    category: 'Education',
    author: 'Robert Williams',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-08'),
    tags: ['education', 'digital', 'curriculum', 'schools']
  },
  {
    title: 'Economic Growth Exceeds Expectations in Third Quarter',
    summary: 'GDP grows at 3.8%, surpassing analyst predictions and signaling strong recovery.',
    content: 'The Central Bank released its quarterly economic report showing impressive growth figures that exceeded market expectations. The 3.8% GDP expansion was driven primarily by strong performance in the technology sector, increased exports, and recovery in consumer spending. Economists are cautiously optimistic about the trend continuing, though they warn that inflation pressures remain a concern. The Finance Minister stated that these figures validate the government\'s economic policies and stimulus measures implemented earlier this year.',
    category: 'Economy',
    author: 'Jennifer Kumar',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-10'),
    tags: ['economy', 'growth', 'gdp', 'finance']
  },
  {
    title: 'Political Parties Begin Election Campaign Season',
    summary: 'With general elections six months away, major parties unveil their platforms and candidates.',
    content: 'The Electoral Commission has officially marked the beginning of the campaign season for the upcoming general elections. The ruling Unity Party has emphasized economic achievements and infrastructure development in their platform, while the Progressive Alliance is focusing on healthcare reform and environmental policies. Political analysts predict a tight race, with recent polling showing the gap between major parties narrowing to just 3 percentage points. Regional parties are expected to play kingmaker roles in forming the next government coalition.',
    category: 'Politics',
    author: 'Thomas Anderson',
    imageUrl: 'https://images.unsplash.com/photo-1569209067215-e2c83306f9c8?q=80&w=1000',
    isBreaking: true,
    isActive: true,
    date: new Date('2023-11-15'),
    tags: ['politics', 'elections', 'campaign', 'parties']
  },
  {
    title: 'New Environmental Protection Measures Announced',
    summary: 'Government unveils ambitious plan to reduce carbon emissions and protect natural habitats.',
    content: 'The Ministry of Environment has introduced a comprehensive environmental protection package that includes strict carbon emission targets, expanded protected forest areas, and new regulations for industrial waste management. The plan aims to achieve a 30% reduction in carbon emissions by 2030 and increase renewable energy usage to 50% of the national power supply. Environmental groups have welcomed the measures but called for stronger enforcement mechanisms. Industries will have a two-year transition period to implement the new standards.',
    category: 'Environment',
    author: 'Lisa Green',
    imageUrl: 'https://images.unsplash.com/photo-1552799446-159ba9523315?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-07'),
    tags: ['environment', 'climate', 'policy', 'conservation']
  },
  {
    title: 'Technology Innovation Hub Opens in Capital City',
    summary: 'State-of-the-art research center aims to foster tech startups and attract international investment.',
    content: 'The ribbon-cutting ceremony for the National Technology Innovation Hub took place yesterday, marking a significant milestone in the country\'s digital transformation journey. The $120 million facility features advanced research laboratories, co-working spaces for startups, and a venture capital fund to support emerging technologies. Several international tech companies have already announced plans to establish offices in the hub. The Minister of Digital Economy stated that the initiative is expected to create over 5,000 high-skilled jobs and position the country as a regional technology leader.',
    category: 'Technology',
    author: 'Daniel Park',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-09'),
    tags: ['technology', 'innovation', 'startups', 'digital']
  },
  {
    title: 'International Trade Agreement Signed with European Union',
    summary: 'Historic deal expected to boost exports by 25% and open new markets for local businesses.',
    content: 'After three years of negotiations, government officials have signed a comprehensive trade agreement with the European Union. The deal eliminates tariffs on most agricultural and manufactured goods, streamlines customs procedures, and includes provisions for intellectual property protection. Economic analysts predict the agreement will increase national exports by approximately 25% over the next five years and create significant opportunities for small and medium-sized enterprises. Opposition parties have criticized certain concessions made on agricultural standards and called for additional support for farmers during the transition period.',
    category: 'International',
    author: 'Elena Rodriguez',
    imageUrl: 'https://images.unsplash.com/photo-1633158829875-e5316a358c6f?q=80&w=1000',
    isBreaking: true,
    isActive: true,
    date: new Date('2023-11-14'),
    tags: ['international', 'trade', 'economy', 'eu']
  },
  {
    title: 'Healthcare Workers Stage Nationwide Strike',
    summary: 'Medical professionals demand better working conditions and increased hospital funding.',
    content: 'Healthcare workers across the country began a 48-hour strike today, affecting non-emergency services in most public hospitals. The Healthcare Workers Union, representing over 75,000 professionals, is calling for a 15% budget increase for public hospitals, better staff-to-patient ratios, and improved working conditions. Emergency departments remain operational, but thousands of non-critical appointments and procedures have been postponed. Government representatives have invited union leaders for emergency talks tomorrow to address their concerns and potentially end the strike early.',
    category: 'Healthcare',
    author: 'Amanda White',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-16'),
    tags: ['healthcare', 'strike', 'workers', 'hospitals']
  },
  {
    title: 'Major Infrastructure Project Faces Delays and Budget Overruns',
    summary: 'The national airport expansion project is now six months behind schedule with costs exceeding initial estimates by 30%.',
    content: 'The Transportation Authority confirmed today that the flagship airport expansion project is experiencing significant delays and cost overruns. Originally scheduled for completion in June 2024, the project is now expected to be finished in December 2024 at the earliest. The budget has increased from $1.2 billion to approximately $1.56 billion. Officials cite unexpected geological challenges, supply chain disruptions, and design modifications as the primary causes. Opposition parties are calling for a parliamentary inquiry into the project management and procurement processes. Despite the setbacks, authorities insist the expanded airport remains essential for supporting future tourism and trade growth.',
    category: 'Infrastructure',
    author: 'Carlos Mendez',
    imageUrl: 'https://images.unsplash.com/photo-1517800249805-f3d51bd0fb22?q=80&w=1000',
    isBreaking: false,
    isActive: true,
    date: new Date('2023-11-11'),
    tags: ['infrastructure', 'airport', 'construction', 'budget']
  }
];

async function seedNews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if we already have news data
    const count = await News.countDocuments();
    console.log(`Current news count in database: ${count}`);

    if (count > 0) {
      console.log('News data already exists. Clearing existing news...');
      await News.deleteMany({});
      console.log('Existing news data cleared.');
    }

    // Insert the news data
    const result = await News.insertMany(newsData);
    console.log(`Successfully seeded ${result.length} news articles`);

    // Log all the news titles that were added
    console.log('\nAdded news articles:');
    result.forEach(article => {
      console.log(`- ${article.title} (${article.category})`);
    });

    // Count breaking news
    const breakingCount = await News.countDocuments({ isBreaking: true });
    console.log(`\nNumber of breaking news articles: ${breakingCount}`);

    // Count by category
    const categories = [...new Set(newsData.map(item => item.category))];
    console.log('\nNews articles by category:');
    
    for (const category of categories) {
      const categoryCount = await News.countDocuments({ category });
      console.log(`- ${category}: ${categoryCount}`);
    }

    console.log('\nNews seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding news data:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder function if this script is executed directly
if (require.main === module) {
  seedNews()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

// Export the function for use in other scripts
module.exports = { seedNews };