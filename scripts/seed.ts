import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !key.startsWith('#')) {
        process.env[key.trim()] = value
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  try {
    const testEmail = 'test@tripcompanion.com'
    const testPassword = 'password123'

    // Try to sign in first to check if user exists
    console.log('👤 Checking for existing user...')

    let userId: string | undefined

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInData?.user) {
      userId = signInData.user.id
      console.log('✅ Using existing test user!')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Password: ${testPassword}`)
      console.log(`   User ID: ${userId}\n`)
    } else {
      // User doesn't exist, create via signup
      console.log('👤 Creating new test user...')

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      userId = signUpData.user?.id

      if (!userId) {
        throw new Error('Failed to create user')
      }

      console.log('✅ Test user created!')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Password: ${testPassword}`)
      console.log(`   User ID: ${userId}`)
      console.log('   ⚠️  Check your email to confirm the account, or disable email confirmation in Supabase\n')
    }

    // Create a test trip
    console.log('🗺️  Creating test trip...')
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: 'Summer Beach Adventure 2024',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        created_by: userId,
      })
      .select()
      .single()

    if (tripError) throw tripError

    console.log('✅ Test trip created!')
    console.log(`   Trip ID: ${trip.id}`)
    console.log(`   Name: ${trip.name}\n`)

    // Seed challenges
    console.log('🎯 Seeding challenges...')

    const challenges = [
      // Photo Challenges
      { text: 'Take a selfie with a stranger', points: 15, category: 'photo', location_required: false },
      { text: 'Capture a beautiful sunrise or sunset', points: 10, category: 'photo', location_required: false },
      { text: 'Photo with local street food', points: 10, category: 'photo', location_required: false },
      { text: 'Jump shot with the whole group', points: 15, category: 'photo', location_required: false },
      { text: 'Picture with a local landmark', points: 10, category: 'photo', location_required: true },
      { text: 'Recreate a famous movie scene', points: 20, category: 'photo', location_required: false },
      { text: 'Photo making a funny face', points: 5, category: 'photo', location_required: false },
      { text: 'Picture with an animal', points: 10, category: 'photo', location_required: false },
      { text: 'Mirror selfie at a unique location', points: 10, category: 'photo', location_required: false },
      { text: 'Photo of the weirdest thing you find', points: 15, category: 'photo', location_required: false },

      // Dare Challenges
      { text: 'Speak in an accent for 10 minutes', points: 15, category: 'dare', location_required: false },
      { text: 'Dance in a public place', points: 20, category: 'dare', location_required: false },
      { text: 'Eat something you\'ve never tried before', points: 15, category: 'dare', location_required: false },
      { text: 'Give someone a genuine compliment', points: 10, category: 'dare', location_required: false },
      { text: 'Sing karaoke (even badly)', points: 25, category: 'dare', location_required: false },
      { text: 'Try a local phrase in the native language', points: 10, category: 'dare', location_required: false },
      { text: 'Wear your shirt backwards for 2 hours', points: 15, category: 'dare', location_required: false },
      { text: 'Do 20 pushups in a public spot', points: 15, category: 'dare', location_required: false },
      { text: 'Make a new friend from another country', points: 20, category: 'dare', location_required: false },
      { text: 'Go an entire meal without using your phone', points: 10, category: 'dare', location_required: false },

      // Scavenger Hunt Challenges
      { text: 'Find something red, round, and edible', points: 10, category: 'scavenger', location_required: false },
      { text: 'Collect a business card from a local shop', points: 10, category: 'scavenger', location_required: false },
      { text: 'Find a coin from this year', points: 5, category: 'scavenger', location_required: false },
      { text: 'Get a map or brochure of the city', points: 5, category: 'scavenger', location_required: false },
      { text: 'Find something with the trip destination name on it', points: 15, category: 'scavenger', location_required: true },
      { text: 'Collect a receipt from the highest altitude', points: 15, category: 'scavenger', location_required: false },
      { text: 'Find a postcard and mail it', points: 20, category: 'scavenger', location_required: false },
      { text: 'Get a recommendation from a local', points: 15, category: 'scavenger', location_required: false },
      { text: 'Find a leaf from a unique tree', points: 10, category: 'scavenger', location_required: false },
      { text: 'Locate the oldest building nearby', points: 20, category: 'scavenger', location_required: true },
    ]

    const challengeData = challenges.map(c => ({
      ...c,
      trip_id: trip.id
    }))

    const { error: challengesError } = await supabase
      .from('challenges')
      .insert(challengeData)

    if (challengesError) throw challengesError

    console.log(`✅ ${challenges.length} challenges seeded!\n`)

    // Create sample activities
    console.log('📅 Creating sample activities...')

    const activities = [
      { day: 1, title: 'Beach Volleyball', time: '10:00', description: 'Morning game at Main Beach', finalized: true },
      { day: 1, title: 'Sunset Dinner', time: '18:00', description: 'Beachfront restaurant', finalized: true },
      { day: 2, title: 'Hiking Adventure', time: '08:00', description: 'Mountain trail', finalized: false },
      { day: 2, title: 'Local Market Visit', time: '15:00', description: 'Explore local crafts and food', finalized: false },
      { day: 3, title: 'Water Sports', time: '11:00', description: 'Surfing and paddleboarding', finalized: false },
    ]

    const activityData = activities.map(a => ({
      ...a,
      trip_id: trip.id,
      created_by: userId
    }))

    const { error: activitiesError } = await supabase
      .from('activities')
      .insert(activityData)

    if (activitiesError) throw activitiesError

    console.log(`✅ ${activities.length} sample activities created!\n`)

    // Create invite code
    console.log('🔗 Creating invite code...')

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { error: inviteError } = await supabase
      .from('invite_codes')
      .insert({
        trip_id: trip.id,
        code: inviteCode,
        created_by: userId
      })

    if (inviteError) throw inviteError

    console.log(`✅ Invite code created: ${inviteCode}\n`)

    console.log('🎉 Database seeding completed successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 LOGIN CREDENTIALS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email:    ${testEmail}`)
    console.log(`Password: ${testPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n🔗 Invite Link: http://localhost:3000/api/invite/${inviteCode}`)
    console.log(`\n💡 Next steps:`)
    console.log(`   1. Run: npm run dev`)
    console.log(`   2. Go to: http://localhost:3000/login`)
    console.log(`   3. Log in with the credentials above`)
    console.log(`   4. Start exploring your trip!\n`)

  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
