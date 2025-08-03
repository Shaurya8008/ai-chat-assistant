# Shadcn-UI Template Usage Instructions

## technology stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

- Add global styles to `src/index.css` or create new CSS files as needed
- Use Tailwind classes for styling components

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration

## Note

The `@/` path alias points to the `src/` directory

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Environment Variables**

For local development, create a `.env` file in the root directory with your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
ENCRYPTION_KEY=your_encryption_key_here
```

You can obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).

Note: The `.env` file is not committed to the repository for security reasons. For production deployment on Netlify, you should set these environment variables in the Netlify dashboard instead.

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```
