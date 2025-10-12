const Election = require('../models/election');

const seedElections = async () => {
  console.log('Seeding elections...');
  if (process.env.NODE_ENV !== 'production') {
    await Election.deleteMany({ source: 'seed' });
  }

  const elections = [
    // Upcoming Presidential Election
    {
      title: '2025 Sri Lankan Presidential Election',
      electionType: 'Presidential',
      date: new Date('2025-11-17T08:00:00.000Z'),
      description: 'The Sri Lankan presidential election of 2025 is the upcoming 9th presidential election, scheduled to elect the President of Sri Lanka.',
      candidates: [
        {
          name: 'Ranil Wickremesinghe',
          party: 'United National Party',
          imageUrl: 'https://example.com/ranil.jpg',
          manifesto: 'Economic reforms and international cooperation'
        },
        {
          name: 'Sajith Premadasa',
          party: 'Samagi Jana Balawegaya',
          imageUrl: 'https://example.com/sajith.jpg',
          manifesto: 'Social welfare and rural development'
        },
        {
          name: 'Anura Kumara Dissanayaka',
          party: 'National People\'s Power',
          imageUrl: 'https://example.com/anura.jpg',
          manifesto: 'Anti-corruption and economic restructuring'
        }
      ],
      isUpcoming: true,
      status: 'upcoming',
      facts: [
        {
          text: 'The President of Sri Lanka is elected for a five-year term.',
          category: 'General'
        },
        {
          text: 'Sri Lanka uses a preferential voting system where voters can select up to three preferences.',
          category: 'Voting System'
        },
        {
          text: 'In the 2019 presidential election, voter turnout was 83.72%.',
          category: 'Statistics'
        },
        {
          text: 'A candidate needs over 50% of valid votes to win in the first round.',
          category: 'Voting System'
        },
        {
          text: 'Sri Lanka has had 8 presidents since the establishment of the executive presidency in 1978.',
          category: 'History'
        },
        {
          text: 'The current Sri Lankan constitution requires presidential elections to be held between November 17 and December 17, 2025.',
          category: 'Legal'
        },
        {
          text: 'First-time voters will make up approximately 5% of the electorate in the 2025 election.',
          category: 'Demographics'
        },
        {
          text: 'The Election Commission of Sri Lanka was established in 2015 to ensure free and fair elections.',
          category: 'Administration'
        }
      ],
      seedData: true
    },

    // Upcoming Parliamentary Election
    {
      title: '2026 Sri Lankan Parliamentary Election',
      electionType: 'Parliamentary',
      date: new Date('2026-08-05T08:00:00.000Z'),
      description: 'Election to select members for the 10th Parliament of the Democratic Socialist Republic of Sri Lanka.',
      candidates: [],
      provinces: [],
      isUpcoming: true,
      status: 'upcoming',
      facts: [
        {
          text: 'The Parliament of Sri Lanka has 225 members elected through proportional representation.',
          category: 'General'
        },
        {
          text: 'Parliamentary elections in Sri Lanka are usually held every five years.',
          category: 'Timeline'
        },
        {
          text: 'In the 2020 parliamentary election, the Sri Lanka Podujana Peramuna won 145 seats.',
          category: 'Statistics'
        }
      ],
      seedData: true
    },

    // Past Presidential Election
    {
      title: '2019 Sri Lankan Presidential Election',
      electionType: 'Presidential',
      date: new Date('2019-11-16T08:00:00.000Z'),
      description: 'The 2019 Sri Lankan presidential election was the 8th presidential election, which elected the 8th president of Sri Lanka.',
      candidates: [
        {
          name: 'Gotabaya Rajapaksa',
          party: 'Sri Lanka Podujana Peramuna',
          imageUrl: 'https://example.com/gotabaya.jpg',
          manifesto: 'National security and economic development',
          votes: 6924255
        },
        {
          name: 'Sajith Premadasa',
          party: 'New Democratic Front',
          imageUrl: 'https://example.com/sajith.jpg',
          manifesto: 'Democratic reforms and social justice',
          votes: 5564239
        },
        {
          name: 'Anura Kumara Dissanayaka',
          party: 'National People\'s Power',
          imageUrl: 'https://example.com/anura.jpg',
          manifesto: 'Anti-corruption and economic reforms',
          votes: 418553
        }
      ],
      provinces: [
        {
          name: 'Western',
          leadingParty: 'New Democratic Front',
          results: [
            { party: 'New Democratic Front', votes: 1709736, percentage: 53.95 },
            { party: 'Sri Lanka Podujana Peramuna', votes: 1338729, percentage: 42.23 },
            { party: 'National People\'s Power', votes: 89339, percentage: 2.82 }
          ]
        },
        {
          name: 'Southern',
          leadingParty: 'Sri Lanka Podujana Peramuna',
          results: [
            { party: 'Sri Lanka Podujana Peramuna', votes: 968962, percentage: 65.99 },
            { party: 'New Democratic Front', votes: 457864, percentage: 31.18 },
            { party: 'National People\'s Power', votes: 29911, percentage: 2.04 }
          ]
        },
        {
          name: 'Central',
          leadingParty: 'New Democratic Front',
          results: [
            { party: 'New Democratic Front', votes: 737364, percentage: 57.62 },
            { party: 'Sri Lanka Podujana Peramuna', votes: 499868, percentage: 39.05 },
            { party: 'National People\'s Power', votes: 25866, percentage: 2.02 }
          ]
        }
      ],
      voterTurnout: 83.72,
      isUpcoming: false,
      status: 'completed',
      facts: [
        {
          text: 'The 2019 Sri Lankan Presidential Election had a record number of 35 candidates.',
          category: 'Statistics'
        },
        {
          text: 'Gotabaya Rajapaksa won with 52.25% of the total valid votes.',
          category: 'Results'
        }
      ],
      seedData: true
    },

    // Past Parliamentary Election
    {
      title: '2020 Sri Lankan Parliamentary Election',
      electionType: 'Parliamentary',
      date: new Date('2020-08-05T08:00:00.000Z'),
      description: 'Election held to elect 225 members to Sri Lanka\'s 9th Parliament.',
      candidates: [],
      provinces: [
        {
          name: 'Western',
          leadingParty: 'Sri Lanka Podujana Peramuna',
          results: [
            { party: 'Sri Lanka Podujana Peramuna', votes: 1492844, percentage: 59.09 },
            { party: 'Samagi Jana Balawegaya', votes: 677992, percentage: 26.84 },
            { party: 'Jathika Jana Balawegaya', votes: 186036, percentage: 7.36 }
          ]
        },
        {
          name: 'Southern',
          leadingParty: 'Sri Lanka Podujana Peramuna',
          results: [
            { party: 'Sri Lanka Podujana Peramuna', votes: 873234, percentage: 68.07 },
            { party: 'Samagi Jana Balawegaya', votes: 260789, percentage: 20.33 },
            { party: 'Jathika Jana Balawegaya', votes: 59234, percentage: 4.62 }
          ]
        }
      ],
      voterTurnout: 75.89,
      isUpcoming: false,
      status: 'completed',
      seedData: true
    },

    // Past Provincial Election
    {
      title: '2019 Western Provincial Council Election',
      electionType: 'Provincial',
      date: new Date('2019-02-10T08:00:00.000Z'),
      description: 'Election to elect members to the Western Provincial Council of Sri Lanka.',
      candidates: [],
      provinces: [
        {
          name: 'Western',
          leadingParty: 'Sri Lanka Podujana Peramuna',
          results: [
            { party: 'Sri Lanka Podujana Peramuna', votes: 892734, percentage: 56.25 },
            { party: 'United National Party', votes: 532892, percentage: 33.59 },
            { party: 'Janatha Vimukthi Peramuna', votes: 98563, percentage: 6.21 }
          ]
        }
      ],
      voterTurnout: 70.12,
      isUpcoming: false,
      status: 'completed',
      seedData: true
    },

    // Past Local Election
    {
      title: '2018 Sri Lankan Local Elections',
      electionType: 'Local',
      date: new Date('2018-02-10T08:00:00.000Z'),
      description: 'Elections held to elect members to 340 local government bodies in Sri Lanka.',
      candidates: [],
      provinces: [],
      voterTurnout: 65.79,
      isUpcoming: false,
      status: 'completed',
      seedData: true
    }
  ];

  await Election.insertMany(elections);
  console.log('Elections seeded.');
};

module.exports = { seedElections };