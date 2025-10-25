export const socialConfig = {
  github: {
    name: 'GitHub',
    url: import.meta.env.VITE_GITHUB_URL || 'https://github.com/sk-pathak',
    color: 'hover:text-gray-400'
  },
  linkedin: {
    name: 'LinkedIn',
    url: import.meta.env.VITE_LINKEDIN_URL || 'https://linkedin.com/in/yourusername',
    color: 'hover:text-blue-400'
  },
  lastfm: {
    name: 'Last.fm',
    url: import.meta.env.VITE_LASTFM_URL || 'https://last.fm/user/Sumit2002',
    color: 'hover:text-red-400'
  }
} as const;

export type SocialPlatform = keyof typeof socialConfig; 