import { Video, Comment, UserAccount, LiveChatMessage } from '../types';

export const CURRENT_USER: UserAccount = {
  id: 'user-current',
  name: 'Alex Rivera',
  handle: '@alexrivera_studio',
  email: 'alex@viewtube.io',
  bio: 'Content creator, 3D animator & tech enthusiast. Creating and streaming weekly! 🚀',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  isLoggedIn: true,
  subscribedChannelIds: ['ch-blender', 'ch-lofi', 'ch-spacex'],
  likedVideoIds: ['vid-1', 'vid-live-1'],
  dislikedVideoIds: [],
  watchLaterIds: ['vid-2', 'vid-3'],
  historyVideoIds: ['vid-1', 'vid-live-1', 'vid-4'],
  createdAt: 'Joined March 2024',
};

export const PRESET_USERS: UserAccount[] = [
  CURRENT_USER,
  {
    id: 'user-sarah',
    name: 'Sarah Connor',
    handle: '@sarah_explores',
    email: 'sarah@viewtube.io',
    bio: 'Digital nomad, coffee connoisseur, and space science geek ☕🌌',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    isLoggedIn: true,
    subscribedChannelIds: ['ch-lofi', 'ch-spacex'],
    likedVideoIds: ['vid-live-1'],
    dislikedVideoIds: [],
    watchLaterIds: ['vid-1'],
    historyVideoIds: ['vid-live-2'],
    createdAt: 'Joined June 2024',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    handle: '@marcus_vance',
    email: 'marcus@viewtube.io',
    bio: 'Game developer and retro electronics tinkerer 🎮',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    isLoggedIn: true,
    subscribedChannelIds: ['ch-blender'],
    likedVideoIds: ['vid-2'],
    dislikedVideoIds: [],
    watchLaterIds: ['vid-live-2'],
    historyVideoIds: ['vid-1'],
    createdAt: 'Joined January 2025',
  },
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-live-1',
    title: '☕ lofi hip hop radio - beats to relax/study to [24/7 LIVE STREAM]',
    description: `Welcome to the ViewTube 24/7 lofi chill beats live broadcast.
Featuring tranquil beats, gentle rain ambiance, and uninterrupted studying rhythm.

Timestamps & Chapters:
0:00 Morning Lo-Fi Warmup
15:30 Coffee shop vibes & rain
42:15 Deep focus state beats
1:10:00 Midnight ambient drift

Connect with the community in the live chat on the right! 💬
#lofi #chillbeats #study #relax #livestream`,
    videoUrl: '/videos/oceans.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
    duration: 0,
    views: 1420800,
    createdAt: 'Streamed live right now',
    category: 'Music',
    isLive: true,
    liveViewerCount: 18450,
    likes: 89400,
    dislikes: 120,
    tags: ['lofi', 'music', 'chill', 'study', 'live'],
    channel: {
      id: 'ch-lofi',
      name: 'Lofi Girl Café',
      handle: '@lofigirl_cafe',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: 14200000,
    },
  },
  {
    id: 'vid-live-2',
    title: '🚀 SpaceX Starship Super Heavy Orbital Flight Test 7 [OFFICIAL BROADCAST]',
    description: `Live multi-camera coverage of the integrated Starship and Super Heavy vehicle launch from Starbase, Texas.
Watch the booster catch at the launch tower and Ship's atmospheric reentry.

Key Events:
0:10 T-30 seconds countdown
0:45 Liftoff of Starship
2:42 Hot-staging separation
6:50 Booster return burn & Mechazilla tower catch

Leave your live questions in chat! 🌌
#SpaceX #Starship #Mars #SpaceLaunch #Live`,
    videoUrl: '/videos/starship.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517976487504-59a1a0512e47?w=800&auto=format&fit=crop&q=80',
    duration: 0,
    views: 3942000,
    createdAt: 'Started streaming 45 minutes ago',
    category: 'Technology',
    isLive: true,
    liveViewerCount: 78920,
    likes: 310500,
    dislikes: 840,
    tags: ['space', 'starship', 'spacex', 'technology', 'live'],
    channel: {
      id: 'ch-spacex',
      name: 'Space Orbit Live',
      handle: '@spaceorbit_live',
      avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: 6850000,
    },
  },
  {
    id: 'vid-1',
    title: 'Big Buck Bunny - 4K 60FPS Remastered Edition (Blender Open Movie)',
    description: `The legendary Blender open-source computer animated comedy film by the Blender Foundation!
Follow a large and lovable rabbit as he deals with a mischievous trio of forest creatures.

Movie Highlights & Timestamps:
0:05 Beautiful spring morning awakenings
0:28 Encounter with the apple tree
1:15 Frank, Rinky, and Gamera plan their ambush
2:10 The counter-trap blueprint sequence
4:30 Bunny's flying triumph!

Made entirely with free and open source 3D creation suite Blender.
Support open source creativity! ❤️
#Blender #Animation #OpenSource #4K #CGI`,
    videoUrl: '/videos/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    duration: 60, // 01:00
    views: 12543000,
    createdAt: '3 days ago',
    category: 'Animation',
    likes: 624000,
    dislikes: 4200,
    tags: ['animation', 'blender', 'cgi', 'film', '4k'],
    channel: {
      id: 'ch-blender',
      name: 'Blender Studio',
      handle: '@blender_studio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: 2840000,
    },
  },
  {
    id: 'vid-2',
    title: 'Tears of Steel - Sci-Fi Cyberpunk VFX Short Film [Full HD]',
    description: `Set in a dystopian future in Amsterdam, a group of scientists and soldiers gather to re-enact a fateful event involving cybernetic humans and giant robotic guardians.

Chapters:
0:00 The Old Church rendezvous
0:42 Celia's cybernetic memories revealed
1:35 Defense grid activation
2:50 The giant rocket mecha sequence

Audio engineering by Joram Letsch.
VFX pipelines powered by open source motion tracking.
#SciFi #Cyberpunk #VFX #ShortFilm #TearsOfSteel`,
    videoUrl: '/videos/tears_of_steel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    duration: 20, // 00:20
    views: 4892100,
    createdAt: '2 weeks ago',
    category: 'Sci-Fi',
    likes: 215000,
    dislikes: 1980,
    tags: ['scifi', 'cyberpunk', 'vfx', 'cgi'],
    channel: {
      id: 'ch-cinevfx',
      name: 'Cinema VFX Hub',
      handle: '@cinemavfx',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: 1450000,
    },
  },
  {
    id: 'vid-3',
    title: 'Sintel - The Dragon Quest: Fantasy Animated Journey',
    description: `The search for a friend across frozen tundras and scorching deserts.
A lonely young woman named Sintel nurtures a wounded baby dragon, only to have it taken away by an adult dragon. Her journey takes her to the ends of the earth.

Timestamps:
0:15 The wandering nomad in the desert
0:48 Memories of the wounded baby dragon
1:40 The bond and training days
3:20 The dragon flight across the peaks

Full orchestral score performed by the Prague Philharmonic Orchestra.
#Fantasy #Animation #Dragon #Storytelling`,
    videoUrl: '/videos/sintel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    duration: 52, // 00:52
    views: 8934200,
    createdAt: '1 month ago',
    category: 'Animation',
    likes: 472000,
    dislikes: 3100,
    tags: ['dragon', 'fantasy', 'animation', 'adventure'],
    channel: {
      id: 'ch-blender',
      name: 'Blender Studio',
      handle: '@blender_studio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: 2840000,
    },
  },
  {
    id: 'vid-4',
    title: 'Elephants Dream - Surreal Steampunk Mechanical Odyssey',
    description: `Two eccentric characters explore the infinite, ever-shifting labyrinth of a gigantic mysterious machine called the Machine.
Proo is captivated and believes in its order, while Emo questions the very fabric of their sanity.

Key sequences:
0:10 Welcome to the acoustic cable forest
1:05 Emo’s monologue on mechanical dreams
2:15 The living electrical phone tree
#Steampunk #Surreal #ShortFilm #Mechanical`,
    videoUrl: '/videos/elephants_dream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 25, // 00:25
    views: 2154000,
    createdAt: '2 months ago',
    category: 'Animation',
    likes: 112000,
    dislikes: 1420,
    tags: ['steampunk', 'animation', 'surreal', 'vintage'],
    channel: {
      id: 'ch-retroanim',
      name: 'Retro Animation Vault',
      handle: '@retroanimation',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: false,
      subscribers: 420000,
    },
  },
  {
    id: 'vid-5',
    title: 'The Great Alpine Coastline Rally - 4K High Speed Documentary',
    description: `Join automotive adventurers traversing jagged cliffs, alpine switchbacks, and seaside straightaways in custom-engineered rally machines.
Shot on high-speed gyro-stabilized cinema cameras.

0:20 Coastal morning engine warmup
1:10 The switchback drift sequence
2:05 Sunset coastal finish line
#Rally #Automotive #4K #Travel #Supercars`,
    videoUrl: '/videos/flower.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    duration: 5, // 00:05
    views: 1820400,
    createdAt: '5 days ago',
    category: 'Travel',
    likes: 98500,
    dislikes: 540,
    tags: ['cars', 'travel', 'documentary', '4k'],
    channel: {
      id: 'ch-motorgraph',
      name: 'Motorgraph Media',
      handle: '@motorgraph',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: 980000,
    },
  },
];

export const INITIAL_COMMENTS: Record<string, Comment[]> = {
  'vid-1': [
    {
      id: 'c-1',
      videoId: 'vid-1',
      isPinned: true,
      author: {
        id: 'ch-blender',
        name: 'Blender Studio',
        handle: '@blender_studio',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        isCreator: true,
      },
      content: '📌 Thank you everyone for supporting open source animation for over 15 years! Check out 2:10 for the famous trap design that inspired an entire generation of 3D artists. What was your favorite scene?',
      createdAt: '3 days ago (edited)',
      likes: 2450,
      isLiked: true,
      isHeartedByCreator: true,
      replies: [
        {
          id: 'c-1-r1',
          videoId: 'vid-1',
          parentId: 'c-1',
          author: {
            id: 'u-marcus',
            name: 'Marcus Chen',
            handle: '@marcus_vfx',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          },
          content: 'The lighting model at 0:28 is still unmatched! Can’t believe this was rendered using open tools so early on. Respect to the whole team!',
          createdAt: '2 days ago',
          likes: 412,
          isHeartedByCreator: true,
        },
        {
          id: 'c-1-r2',
          videoId: 'vid-1',
          parentId: 'c-1',
          author: {
            id: 'u-sarah',
            name: 'Sarah Jenkins',
            handle: '@sarah_animates',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          },
          content: 'Agreed! And the comedic timing when the squirrel drops the acorn at 1:15 is pure gold 😂',
          createdAt: '1 day ago',
          likes: 188,
        },
      ],
    },
    {
      id: 'c-2',
      videoId: 'vid-1',
      author: {
        id: 'u-dave',
        name: 'Dave K.',
        handle: '@dave_k_tech',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Rewatching in 2026 and this 60fps remaster brings out every single fur follicle on the rabbit at 4:30. Absolutely glorious work!',
      createdAt: '1 day ago',
      likes: 934,
      isLiked: false,
      isHeartedByCreator: true,
      replies: [
        {
          id: 'c-2-r1',
          videoId: 'vid-1',
          parentId: 'c-2',
          author: {
            id: 'u-leo',
            name: 'Leo Thorne',
            handle: '@leothorne',
            avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          },
          content: 'Same here, watching on a 120Hz display and the fluid motion is mesmerizing.',
          createdAt: '18 hours ago',
          likes: 74,
        },
      ],
    },
    {
      id: 'c-3',
      videoId: 'vid-1',
      author: {
        id: 'u-elena',
        name: 'Elena Rostova',
        handle: '@elena_3d',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      content: 'Notice how the squirrel checks both sides before climbing the branch at 0:42. Subtle character animation touches like that make a classic.',
      createdAt: '16 hours ago',
      likes: 418,
      isLiked: false,
      replies: [],
    },
  ],
  'vid-2': [
    {
      id: 'c-t-1',
      videoId: 'vid-2',
      author: {
        id: 'u-cyber',
        name: 'Neon Wanderer',
        handle: '@neon_blade',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      content: 'The sound design when the robotic walker stomps at 2:50 gives me chills every time. Pure cinematic grit.',
      createdAt: '1 week ago',
      likes: 820,
      isLiked: true,
      isHeartedByCreator: true,
      replies: [
        {
          id: 'c-t-1-r1',
          videoId: 'vid-2',
          parentId: 'c-t-1',
          author: {
            id: 'u-audio',
            name: 'Freq Engineer',
            handle: '@sub_bass',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          },
          content: 'They layered heavy hydraulic sub-bass with metallic resonance. Masterclass in audio!',
          createdAt: '5 days ago',
          likes: 95,
        },
      ],
    },
  ],
};

export const INITIAL_LIVE_CHAT: Record<string, LiveChatMessage[]> = {
  'vid-live-1': [
    {
      id: 'chat-1',
      user: {
        id: 'u-1',
        name: 'Mia Sol',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        badge: 'Member (6 mos)',
      },
      text: 'Good morning everyone! Studying for my algorithms final today ☕📚',
      timestamp: '1:02 PM',
    },
    {
      id: 'chat-2',
      user: {
        id: 'u-2',
        name: 'Kai Takahashi',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      text: 'This saxophone track is pure heaven 🎷✨',
      timestamp: '1:03 PM',
    },
    {
      id: 'chat-3',
      user: {
        id: 'u-3',
        name: 'Devin Cole',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      text: 'Sending love from Vancouver! Rainy outside, warm inside ❤️🌧️',
      timestamp: '1:03 PM',
    },
    {
      id: 'chat-4',
      user: {
        id: 'u-super',
        name: 'Samantha Ray',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      text: 'Thank you for keeping me sane during thesis writing! $10 well spent ☕🎉',
      timestamp: '1:04 PM',
      isSuperChat: true,
      superChatAmount: '$10.00',
      superChatColor: '#00bfa5',
    },
    {
      id: 'chat-5',
      user: {
        id: 'ch-lofi',
        name: 'Lofi Girl Café',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isOwner: true,
        isMod: true,
        badge: 'STREAMER',
      },
      text: 'Welcome newcomers! Take a deep breath, drink some water, and stay productive today ✨',
      timestamp: '1:04 PM',
    },
  ],
  'vid-live-2': [
    {
      id: 'sc-1',
      user: {
        id: 'u-sp1',
        name: 'AstroGeek_99',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        badge: 'VIP',
      },
      text: 'Look at the frost on the LOX tanks! Cryo loading is nearly complete! ❄️🚀',
      timestamp: '1:12 PM',
    },
    {
      id: 'sc-2',
      user: {
        id: 'u-sp2',
        name: 'CosmicExplorer',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      },
      text: 'Mechazilla chopstick arms are calibrated and ready for the catch attempt! 🔥',
      timestamp: '1:13 PM',
    },
    {
      id: 'sc-3',
      user: {
        id: 'u-sp3',
        name: 'MarsBound2028',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      },
      text: 'GO FLIGHT! Watching with the entire physics club from Tokyo! 🇯🇵',
      timestamp: '1:13 PM',
      isSuperChat: true,
      superChatAmount: '$25.00',
      superChatColor: '#e91e63',
    },
  ],
};

export const SIMULATED_CHAT_BOTS = [
  { name: 'Jordan V.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', texts: ['This is incredible!! 🔥', 'Let’s goooo!', 'Quality is so crisp in 4K', 'Who else is watching live? 🙌', 'W stream! ❤️'] },
  { name: 'Chloe Becker', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', texts: ['Love the camera angle right now!', 'Greetings from Berlin 🇩🇪', 'Chat is moving so fast haha', 'Amazing work on this stream!'] },
  { name: 'Ryan O’Connor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', texts: ['Dropped a like! 👍', 'Sound is so good with headphones', 'Can you shout out Canada? 🇨🇦', 'Subscribed! Keep it up 🔥'] },
  { name: 'Aria Martinez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', texts: ['Best stream of the weekend ☕', 'Just shared this to my friends!', 'Legendary vibes right now ✨', 'Poggers in the chat!'] },
];
