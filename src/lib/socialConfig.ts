export const socialConfig = {
  github: {
    name: 'GitHub',
    url: 'https://github.com/sk-pathak',
    color: 'hover:text-gray-400'
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/yourusername',
    color: 'hover:text-blue-400'
  },
  lastfm: {
    name: 'Last.fm',
    url: 'https://last.fm/user/Sumit2002',
    color: 'hover:text-red-400'
  }
} as const;

export type SocialPlatform = keyof typeof socialConfig; 