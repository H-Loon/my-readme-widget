# My Readme Widget

A powerful, interactive editor to create stunning dynamic widgets for your GitHub profile README.

![Widget](https://my-readme-widget.vercel.app/api/badge?id=outcSEh6gf3b0uq6fBPf)

## Features

- 🎨 **Visual Editor**: Drag-and-drop interface to design your widget.
- ✍️ **Rich Text**: Add text with custom fonts, colors, gradients, and neon effects.
- 🖼️ **Image Support**: Embed images, badges, and icons (supports `skillicons.dev`, `shields.io`, etc.).
- 🌌 **Dynamic Backgrounds**: Choose from presets like "Ethereal" with animated blobs, or use custom gradients and images.
- 📐 **Precision Tools**: Grid snapping and alignment tools for pixel-perfect designs.
- 💾 **Save & Share**: Save your designs (via Firebase) and get a dynamic URL to use in your markdown.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Canvas**: [Konva.js](https://konvajs.org/) / [React Konva](https://github.com/konvajs/react-konva)
- **Backend/Auth**: Firebase (Firestore & Auth)
- **Deployment**: Vercel

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Sign in with Google to save your widgets.
2. Use the sidebar to add text or images.
3. Customize appearance using the properties panel.
4. Click "Copy Markdown" to get the code for your GitHub README.
