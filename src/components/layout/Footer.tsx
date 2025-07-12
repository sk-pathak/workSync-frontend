import { Github, Linkedin, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialConfig } from '@/lib/socialConfig';

export function Footer() {
  const socialLinks = [
    {
      name: socialConfig.github.name,
      icon: Github,
      url: socialConfig.github.url,
      color: socialConfig.github.color
    },
    {
      name: socialConfig.linkedin.name,
      icon: Linkedin,
      url: socialConfig.linkedin.url,
      color: socialConfig.linkedin.color
    },
    {
      name: socialConfig.lastfm.name,
      icon: Music,
      url: socialConfig.lastfm.url,
      color: socialConfig.lastfm.color
    }
  ];

  return (
    <footer className="glass-card border-t border-violet-700/30 shadow-glass">
      <div className="flex items-center justify-between px-8 py-3">
        {/* Left: Copyright */}
        <div className="text-sm text-text-secondary font-medium">
          © 2024 WorkSync. Built with ❤️
        </div>

        {/* Right: Social Links */}
        <div className="flex items-center space-x-3">
          {socialLinks.map((social) => (
            <Button
              key={social.name}
              variant="ghost"
              size="icon"
              asChild
              className={`glass-button ${social.color} transition-all duration-150 hover:scale-105 active:scale-95`}
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex items-center justify-center w-9 h-9"
              >
                <social.icon className="w-4 h-4" />
              </a>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
} 