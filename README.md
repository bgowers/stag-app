# 🍺 Stag Points

A real-time points tracking web app for stag do (bachelor party) challenges. Create games, add challenges, and watch your mates compete for glory!

## ✨ Features

- **No Authentication Required** - Simple player selection per device using localStorage
- **Real-time Updates** - Live scoreboard and activity feed powered by Supabase Realtime
- **Host Dashboard** - Full CRUD for players and challenges with activity monitoring
- **Player Experience** - Clean tabs interface for challenges, scores, and activity
- **Claim System** - Each challenge has base points + optional bonus points
- **Undo Functionality** - Hosts can reverse claims for mistakes or disputes
- **Database-Enforced Uniqueness** - Players can only claim each challenge type once
- **Mobile-First Design** - Optimized for "stag conditions" (fat thumbs + a few pints!)
- **Confetti Celebrations** - Visual feedback for high-point claims

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Animations**: Canvas Confetti

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stag-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the SQL in `supabase/schema.sql` in your Supabase SQL Editor to create tables, indexes, and RLS policies.

5. **Enable Realtime** (Important!)

   Run these commands in your Supabase SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE events;
   ALTER PUBLICATION supabase_realtime ADD TABLE players;
   ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
   ```

   See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for detailed instructions.

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure

```
stag-app/
├── app/                      # Next.js App Router
│   ├── g/[gameId]/          # Player and host views
│   │   ├── host/page.tsx    # Host dashboard
│   │   └── page.tsx         # Player view
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Loading state
│   ├── not-found.tsx        # 404 page
│   └── page.tsx             # Home page (create game)
├── components/              # React components
│   ├── ActivityFeed.tsx
│   ├── ChallengesList.tsx
│   ├── ChallengesManager.tsx
│   ├── CreateGameForm.tsx
│   ├── HostActivityFeed.tsx
│   ├── PlayerPicker.tsx
│   ├── PlayersManager.tsx
│   ├── Scoreboard.tsx
│   └── ShareLink.tsx
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── types.ts             # TypeScript types
├── supabase/
│   ├── migrations/          # Database migrations
│   └── schema.sql           # Database schema
├── CLAUDE.md                # Project guidance for AI
├── REALTIME_SETUP.md        # Realtime setup instructions
└── README.md                # This file
```

## 🎮 How It Works

### Game Flow

1. **Create Game**: Host creates a game and gets a shareable link
2. **Add Players**: Host adds players to the game
3. **Create Challenges**: Host creates challenges with base + bonus points
4. **Player Selection**: Each device selects a player from the list
5. **Claim Points**: Players claim base/bonus points for challenges
6. **Live Updates**: All devices see updates in real-time
7. **Monitor Activity**: Host can view activity and undo claims if needed

### Player Identity Pattern

The app doesn't use traditional authentication. Instead:
- Each device selects a player identity from the game's player list
- Player ID is stored in localStorage per game: `stagApp_playerId_{gameId}`
- Anyone with the game link can participate
- Players can switch their identity anytime

### Database Schema

**Four core tables:**

- `games` - Game sessions
- `players` - Players in each game
- `challenges` - Challenges with base + bonus points
- `events` - Claim events (with unique constraint per player/challenge/kind)

**Key constraint:**
```sql
UNIQUE (player_id, challenge_id, kind)
```
This ensures each player can claim base points once and bonus points once per challenge.

## 🧪 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm test             # Run Jest tests
```

### Quality Gates

Before committing:
1. `npm run typecheck` must pass
2. `npm run lint` must pass
3. `npm test` must pass

### Database Migrations

Using Supabase CLI:

```bash
# Create new migration
supabase migration new migration_name

# Push migrations to remote
supabase db push --db-url postgresql://...

# Pull schema from remote
supabase db pull --db-url postgresql://...
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📝 Configuration

### Supabase Setup

1. **Row Level Security**: Enabled on all tables with permissive policies (`USING (true)`)
2. **Realtime**: Must be manually enabled for `events`, `players`, and `challenges` tables
3. **Anonymous Access**: Uses `anon` key for all operations (no auth required)

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 🐛 Troubleshooting

### Realtime not working?

See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for detailed troubleshooting steps.

### Database connection issues?

- Verify environment variables are correct
- Check Supabase project is not paused
- Ensure RLS policies are set correctly

### Build errors?

Run `npm run typecheck` to identify TypeScript issues.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Keep components small and focused
- Use Tailwind utility classes
- Add comments for complex logic

## 📄 License

MIT License - feel free to use this project for your own stag dos!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made for legendary stag dos** 🍻
