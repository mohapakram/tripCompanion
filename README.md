# Trip Companion

A comprehensive web application for planning group trips with activities, games, and media sharing.

## Features

### 1. Trip Activities Planner
- Create and manage daily activities
- Vote on proposed activities
- Set finalized activities
- View activities by day
- Real-time updates with Supabase channels

### 2. Trip Games Module
- **Challenges**: Complete photo, dare, and scavenger hunt challenges
- **Leaderboard**: Track points and compete with friends
- **Truth or Dare**: Random generator for fun group activities

### 3. Group Media Vault
- Upload photos and videos
- Organize media by day
- View in gallery or lightbox mode
- Filter by day or activity

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS
- **UI Components**: Shadcn-UI
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   cd dahabApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Go to SQL Editor and run the migration:
   ```sql
   -- Copy and paste contents of supabase/migrations/001_initial_schema.sql
   ```

   c. Create storage bucket:
      - Go to Storage → Create bucket
      - Name: `trip-media`
      - Make it public

   d. Get your credentials:
      - Go to Settings → API
      - Copy the Project URL and anon/public key

4. **Configure environment variables**

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Seeding Challenges

To seed your trip with challenges:

1. Create a trip first through the UI
2. Get the trip ID from the URL
3. Open `supabase/seed.sql`
4. Replace `YOUR_TRIP_ID_HERE` with your actual trip ID
5. Run the seed SQL in Supabase SQL Editor

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
   - Deploy!

3. **Update Supabase settings**
   - Go to Authentication → URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add `https://your-domain.vercel.app/**` to "Redirect URLs"

## Project Structure

```
trip-companion/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Main app pages
│   │   └── trip/[tripId]/  # Trip-specific pages
│   │       ├── activities/ # Activities module
│   │       ├── games/      # Games module
│   │       ├── media/      # Media vault
│   │       └── settings/   # Trip settings
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   ├── activities/        # Activity components
│   ├── games/             # Game components
│   ├── media/             # Media components
│   └── layout/            # Layout components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   ├── hooks/            # Custom React hooks
│   └── utils.ts          # Helper functions
├── supabase/             # Database
│   ├── migrations/       # SQL migrations
│   └── seed.sql          # Seed data
└── types/                # TypeScript types
```

## Database Schema

### Core Tables

- **profiles**: User profiles (extended from auth.users)
- **trips**: Trip information
- **trip_members**: User-trip relationships
- **activities**: Planned activities
- **activity_votes**: Voting on activities
- **challenges**: Available challenges
- **challenge_submissions**: Completed challenges
- **media**: Uploaded photos/videos
- **leaderboard_cache**: Cached point totals
- **invite_codes**: Trip invitation codes

### Security

All tables use Row Level Security (RLS):
- Users can only see trips they're members of
- Members can create activities and vote
- Admins can manage trip settings
- Users can upload and delete their own media

## Key Features Explained

### Real-time Updates

Activities use Supabase real-time channels:
```typescript
const channel = supabase
  .channel(`activities-${tripId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'activities'
  }, handleChange)
  .subscribe()
```

### Invite System

1. Admin generates invite code
2. Share link: `/api/invite/[code]`
3. New users sign up and auto-join trip
4. Existing users join immediately

### Points & Leaderboard

- Challenges have point values
- Submissions require admin approval
- Leaderboard updates automatically via trigger
- Cached for performance

## Customization

### Adding New Challenges

Edit `supabase/seed.sql` and add:
```sql
INSERT INTO challenges (trip_id, text, points, category, location_required)
VALUES ('trip-id', 'Your challenge', 20, 'photo', false);
```

### Modifying UI Theme

Edit `tailwind.config.ts` colors or `app/globals.css` CSS variables.

### Changing Activity Vote Behavior

See `lib/hooks/useActivities.ts` → `toggleVote` mutation

## Troubleshooting

### "Failed to load trips"
- Check Supabase credentials in `.env.local`
- Verify RLS policies are applied
- Check browser console for errors

### Media upload fails
- Verify storage bucket exists and is public
- Check storage policies in Supabase
- Ensure file size is under limit

### Real-time not working
- Check Supabase project status
- Verify real-time is enabled in project settings
- Check browser console for WebSocket errors

## Future Enhancements

- Push notifications for activity votes
- Export trip as PDF/summary
- Integration with mapping services
- Group expenses tracker
- Weather integration
- AI-powered activity suggestions

## License

MIT

## Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with Next.js, Supabase, and TailwindCSS
