# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Frontend Structure

project-root/
├── public/
│   ├── assets/                # Static assets like images, fonts, and public files
│   └── favicon.ico            # Favicon for the app
├── src/
│   ├── api/                   # Functions to make API calls, with type-safe methods and service layers
│   ├── assets/                # Non-public assets used in the app (e.g., SVGs, images)
│   ├── components/            # Reusable and stateless components
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.styles.ts (optional: for styled-components or CSS-in-JS styles)
│   │       └── index.ts       # Index file for clean imports
│   ├── constants/             # Constants used across the app (e.g., API URLs, configurations)
│   ├── contexts/              # Context API providers (global state management)
│   ├── hooks/                 # Custom reusable hooks
│   ├── layouts/               # Layout components to structure pages (e.g., header, footer, sidebar)
│   ├── pages/                 # Page components, each representing a unique route
│   │   └── Home/
│   │       ├── Home.tsx
│   │       ├── Home.styles.ts
│   │       └── index.ts
│   ├── routes/                # Route configuration for the app
│   ├── services/              # Service files for business logic (data manipulation, transformations)
│   ├── store/                 # Global state management (e.g., Zustand, Redux)
│   ├── styles/                # Global and shared styles (e.g., CSS/SCSS, theme files)
│   ├── types/                 # TypeScript type definitions and interfaces
│   ├── utils/                 # Utility functions (e.g., date formatting, helper functions)
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Entry point for React and Vite, rendering the App component
│   └── vite-env.d.ts          # Vite-specific TypeScript types
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── package.json               # Project dependencies and scripts