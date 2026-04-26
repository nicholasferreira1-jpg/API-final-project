const { db, User, Goal, Progress } = require('./setup');
const bcrypt = require('bcryptjs');

// Sample users
const sampleUsers = [
    {
        name: 'Nicholas Carter',
        email: 'nicholas@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    }
];

// Sample goals
const sampleGoals = [
    {
        title: 'Read 12 Books This Year',
        description: 'Read at least one book per month to expand knowledge',
        category: 'education',
        targetDate: new Date('2026-12-31'),
        status: 'active',
        userId: 1
    },
    {
        title: 'Run a Half-Marathon',
        description: 'Train and complete a 21K race',
        category: 'fitness',
        targetDate: new Date('2026-06-01'),
        status: 'active',
        userId: 1
    },
    {
        title: 'Save $5000',
        description: 'Build an emergency fund',
        category: 'finance',
        targetDate: new Date('2026-12-31'),
        status: 'active',
        userId: 1
    },
    {
        title: 'Learn Spanish',
        description: 'Reach conversational level in Spanish',
        category: 'personal',
        targetDate: new Date('2026-09-01'),
        status: 'active',
        userId: 2
    },
    {
        title: 'Get a Promotion',
        description: 'Complete leadership training and get promoted',
        category: 'career',
        targetDate: new Date('2026-12-01'),
        status: 'active',
        userId: 2
    },
    {
        title: 'Lose 20 Pounds',
        description: 'Reach target weight through diet and exercise',
        category: 'fitness',
        targetDate: new Date('2026-08-01'),
        status: 'abandoned',
        userId: 2
    }
];

// Sample progress steps
const sampleProgress = [
    // Read 12 Books
    {
        step: 'Read Atomic Habits',
        notes: 'Great book about building habits',
        completed: true,
        completedAt: new Date('2026-01-15'),
        goalId: 1
    },
    {
        step: 'Read The Alchemist',
        notes: 'Inspiring story',
        completed: true,
        completedAt: new Date('2026-02-20'),
        goalId: 1
    },
    {
        step: 'Read Deep Work',
        notes: 'Currently reading',
        completed: false,
        completedAt: null,
        goalId: 1
    },
    // Run a 5K
    {
        step: 'Run 10 kilometers without stopping',
        notes: 'Completed at local park',
        completed: true,
        completedAt: new Date('2026-01-10'),
        goalId: 2
    },
    {
        step: 'Run 15 kilometers',
        notes: 'Took 22 minutes',
        completed: true,
        completedAt: new Date('2026-02-01'),
        goalId: 2
    },
    {
        step: 'Run full Half-Marathon',
        notes: 'Race day!',
        completed: false,
        completedAt: null,
        goalId: 2
    },
    // Save $5000
    {
        step: 'Save first $500',
        notes: 'Cut back on eating out',
        completed: true,
        completedAt: new Date('2026-01-31'),
        goalId: 3
    },
    {
        step: 'Save $1000',
        notes: 'On track',
        completed: false,
        completedAt: null,
        goalId: 3
    },
    // Learn Spanish
    {
        step: 'Complete Duolingo beginner course',
        notes: 'Finished in 3 weeks',
        completed: true,
        completedAt: new Date('2026-01-20'),
        goalId: 4
    },
    {
        step: 'Learn 500 vocabulary words',
        notes: 'Using flashcards daily',
        completed: false,
        completedAt: null,
        goalId: 4
    },
    // Get a Promotion
    {
        step: 'Enroll in leadership course',
        notes: 'Signed up for online course',
        completed: true,
        completedAt: new Date('2026-01-05'),
        goalId: 5
    },
    {
        step: 'Complete leadership course',
        notes: 'In progress',
        completed: false,
        completedAt: null,
        goalId: 5
    },
    {
        step: 'Schedule review with manager',
        notes: 'Not started yet',
        completed: false,
        completedAt: null,
        goalId: 5
    }
];

// Seed database
async function seedDatabase() {
    try {
        await db.authenticate();
        console.log('Connected to database for seeding.');

        // Hash passwords and seed users
        const saltRounds = 10;
        for (let user of sampleUsers) {
            user.password = await bcrypt.hash(user.password, saltRounds);
        }
        await User.bulkCreate(sampleUsers);
        console.log('Sample users inserted successfully.');

        // Insert sample goals
        await Goal.bulkCreate(sampleGoals);
        console.log('Sample goals inserted successfully.');

        // Insert sample progress steps
        await Progress.bulkCreate(sampleProgress);
        console.log('Sample progress inserted successfully.');

        console.log('Database seeding completed.');

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
