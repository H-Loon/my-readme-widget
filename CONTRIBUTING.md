# Community

Welcome to the My Readme Widget community!

## Have Fun!

We hope you enjoy using this tool to create stunning widgets for your GitHub profile.

## Getting Started for Contributors

> ✨ **This project is fully vibe coded.**

If you'd like to contribute to the project, here is a guide to help you get set up.

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

1.  **Fork the repository** on GitHub.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/my-readme-widget.git
    cd my-readme-widget
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory. You will need Firebase configuration keys if you plan to work on the saving/authentication features.
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

### Development

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Project Structure

The project follows a modified MVC architecture adapted for React/Next.js:

- **`src/app`**: Next.js App Router files.
  - `page.tsx`: The main entry point.
  - `api/`: API routes for generating the SVG badges.
- **`src/views`**: UI Components and View logic.
  - `HomeView.tsx`: The main application view.
  - `components/`: Reusable UI components (CanvasEditor, Controls, etc.).
- **`src/controllers`**: Business logic and state management custom hooks.
- **`src/models`**: TypeScript interfaces and data definitions.
- **`src/hooks`**: General utility hooks (e.g., `useHistory`).
- **`src/lib`**: Configuration for external services (Firebase).
- **`src/utils`**: Helper functions for canvas and fonts.

## Feedback & Contributions

I would love to hear your feedback! Here's how you can get involved:

- **Fork the Project**: Feel free to fork the repository and experiment with your own changes.
- **Open Issues**: If you find a bug or have a feature request, please open an issue.
- **Submit Pull Requests**: Contributions are welcome! Please ensure your code follows the existing style and structure.
