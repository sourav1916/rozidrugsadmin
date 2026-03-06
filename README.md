# Rozi Drugs Admin Panel

A modern React admin panel for managing pharmaceutical products, users, orders, and more.

## Features

- **Dashboard**: Overview with statistics and recent activity
- **Users Management**: Manage user accounts and permissions
- **Orders Management**: Track and manage customer orders
- **Products Management**: Inventory and product catalog management
- **Settings**: Configure system settings and preferences

## Tech Stack

- **React 18** with TypeScript
- **React Router DOM** for navigation
- **Framer Motion** for animations
- **React Icons** for UI icons
- **Bootstrap** for responsive design
- **Tailwind CSS** for utility-first styling
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout component with sidebar
├── pages/
│   ├── Dashboard.tsx       # Dashboard overview
│   ├── Users.tsx          # User management
│   ├── Orders.tsx         # Order management
│   ├── Products.tsx       # Product management
│   └── Settings.tsx       # System settings
├── App.tsx                # Main app component with routing
├── index.css              # Global styles with Tailwind
└── index.tsx              # App entry point
```

## Features Overview

### Dashboard

- Statistics cards with animations
- Recent activity feed
- Quick action buttons
- Responsive grid layout

### Users Management

- User listing with search functionality
- Role-based access control
- Status management (active/inactive)
- Edit and delete operations

### Orders Management

- Order filtering by status
- Order statistics
- Export functionality
- Detailed order views

### Products Management

- Product catalog with search
- Stock level indicators
- Category management
- Price and inventory tracking

### Settings

- Tabbed interface for different settings
- General configuration
- Notification preferences
- Security settings
- Account management

## Customization

The admin panel is built with extensibility in mind:

- Add new pages by creating components in the `pages/` directory
- Update the navigation menu in `Layout.tsx`
- Modify the color scheme and styling using Tailwind CSS
- Extend the routing configuration in `App.tsx`

## Deployment

To build the application for production:

```bash
npm run build
```

This creates an optimized `build/` folder ready for deployment to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
