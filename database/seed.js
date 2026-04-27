const { db, User, Goal, Progress } = require('./setup');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        await db.authenticate();
        console.log('Connected to database for seeding.');

        // Clear existing data first
        await Progress.destroy({ where: {} });
        await Goal.destroy({ where: {} });
        await User.destroy({ where: {} });

        // Hash passwords and seed users
        const saltRounds = 10;
        const usersToCreate = [
            {
                name: 'Nicholas Carter',
                email: 'nicholas@example.com',
                password: await bcrypt.hash('password123', saltRounds),
                role: 'user'
            },
            {
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: await bcrypt.hash('password123', saltRounds),
                role: 'user'
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: await bcrypt.hash('password123', saltRounds),
                role: 'admin'
            }
        ];

        const users = await User.bulkCreate(usersToCreate);
        console.log('Sample users inserted successfully.');

        const goals = await Goal.bulkCreate([
            {
                title: 'Read 12 Books This Year',
                description: 'Read at least one book per month to expand knowledge',
                category: 'education',
                targetDate: new Date('2026-12-31'),
                status: 'active',
                userId: users[0].id
            },
            {
                title: 'Run a Half-Marathon',
                description: 'Train and complete a 21K race',
                category: 'fitness',
                targetDate: new Date('2026-06-01'),
                status: 'active',
                userId: users[0].id
            },
            {
                title: 'Save $5000',
                description: 'Build an emergency fund',
                category: 'finance',
                targetDate: new Date('2026-12-31'),
                status: 'active',
                userId: users[0].id
            },
            {
                title: 'Learn Spanish',
                description: 'Reach conversational level in Spanish',
                category: 'personal',
                targetDate: new Date('2026-09-01'),
                status: 'active',
                userId: users[1].id
            },
            {
                title: 'Get a Promotion',
                description: 'Complete leadership training and get promoted',
                category: 'career',
                targetDate: new Date('2026-12-01'),
                status: 'active',
                userId: users[1].id
            },
            {
                title: 'Lose 20 Pounds',
                description: 'Reach target weight through diet and exercise',
                category: 'fitness',
                targetDate: new Date('2026-08-01'),
                status: 'abandoned',
                userId: users[1].id
            }
        ]);
        console.log('Sample goals inserted successfully.');

        await Progress.bulkCreate([
            // Read 12 Books
            {
                step: 'Read Atomic Habits',
                notes: 'Great book about building habits',
                completed: true,
                completedAt: new Date('2026-01-15'),
                goalId: goals[0].id
            },
            {
                step: 'Read The Alchemist',
                notes: 'Inspiring story',
                completed: true,
                completedAt: new Date('2026-02-20'),
                goalId: goals[0].id
            },
            {
                step: 'Read Deep Work',
                notes: 'Currently reading',
                completed: false,
                completedAt: null,
                goalId: goals[0].id
            },
            // Run a Half-Marathon
            {
                step: 'Run 10 kilometers without stopping',
                notes: 'Completed at local park',
                completed: true,
                completedAt: new Date('2026-01-10'),
                goalId: goals[1].id
            },
            {
                step: 'Run 15 kilometers',
                notes: 'Took 22 minutes',
                completed: true,
                completedAt: new Date('2026-02-01'),
                goalId: goals[1].id
            },
            {
                step: 'Run full Half-Marathon',
                notes: 'Race day!',
                completed: false,
                completedAt: null,
                goalId: goals[1].id
            },
            // Save $5000
            {
                step: 'Save first $500',
                notes: 'Cut back on eating out',
                completed: true,
                completedAt: new Date('2026-01-31'),
                goalId: goals[2].id
            },
            {
                step: 'Save $1000',
                notes: 'On track',
                completed: false,
                completedAt: null,
                goalId: goals[2].id
            },
            // Learn Spanish
            {
                step: 'Complete Duolingo beginner course',
                notes: 'Finished in 3 weeks',
                completed: true,
                completedAt: new Date('2026-01-20'),
                goalId: goals[3].id
            },
            {
                step: 'Learn 500 vocabulary words',
                notes: 'Using flashcards daily',
                completed: false,
                completedAt: null,
                goalId: goals[3].id
            },
            // Get a Promotion
            {
                step: 'Enroll in leadership course',
                notes: 'Signed up for online course',
                completed: true,
                completedAt: new Date('2026-01-05'),
                goalId: goals[4].id
            },
            {
                step: 'Complete leadership course',
                notes: 'In progress',
                completed: false,
                completedAt: null,
                goalId: goals[4].id
            },
            {
                step: 'Schedule review with manager',
                notes: 'Not started yet',
                completed: false,
                completedAt: null,
                goalId: goals[4].id
            }
        ]);
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