# BPL Commander

A comprehensive project management application with role-based access control, designed for organizations that need robust project tracking, workload management, and team collaboration features.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Admin, Program Managers, R&D/Project Managers, Team Managers, and Employees
- **Workload Management**: 120% maximum workload limit with 20% cap for "Over & Beyond" initiatives
- **Project Management**: Complete project lifecycle management with timeline tracking
- **Version Control**: Automatic version tracking with snapshots for all project changes
- **Communication**: Project discussion pages for team collaboration
- **Analytics**: Comprehensive dashboard analytics and reporting
- **Export System**: Data export in Excel/PDF formats

### User Experience
- **Theme Customization**: Multiple theme options with custom color schemes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Elements**: Animated owl companion that follows your cursor
- **User Profiles**: Comprehensive user profile management
- **Notifications**: Real-time notification system
- **Settings**: Centralized settings with password recovery functionality

### Technical Features
- **Offline Demo Mode**: Fully functional demo with predefined users and sample data
- **Centralized Database**: Structured data management system
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with React, Tailwind CSS, and Radix UI components

## 🛠️ Installation

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone or extract the project files**
   ```bash
   # If you have the files in a folder, navigate to it
   cd bpl-commander
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   The application will automatically open at `http://localhost:3000`

## 🔑 Demo Login Credentials

The application includes predefined demo users for testing all role functionalities:

### Admin Account
- **Email**: `admin@bpl.com`
- **Password**: `admin123`

### Program Manager
- **Email**: `sarah.wilson@bpl.com`
- **Password**: `sarah123`

### R&D Manager
- **Email**: `mike.chen@bpl.com`
- **Password**: `mike123`

### Team Manager
- **Email**: `lisa.garcia@bpl.com`
- **Password**: `lisa123`

### Employee
- **Email**: `john.doe@bpl.com`
- **Password**: `john123`

## 📁 Project Structure

```
bpl-commander/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (Shadcn/ui)
│   │   ├── project/        # Project-specific components
│   │   ├── initiatives/    # Initiative management components
│   │   └── figma/          # Figma integration components
│   ├── contexts/           # React contexts for state management
│   ├── utils/              # Utility functions and helpers
│   ├── styles/             # CSS and styling files
│   └── main.tsx           # Application entry point
├── App.tsx                 # Main application component
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🎨 Theme Customization

The application supports multiple themes:
- Light theme (default)
- Dark theme
- Custom theme with personalized colors

Access theme settings through the Settings page in the application.

## 🦉 Interactive Features

- **Owl Animation**: A cute animated owl sits in the bottom-right corner, follows your cursor with its eyes, and disappears when you get too close
- **Responsive Navigation**: Smart navigation that adapts based on user roles
- **Real-time Updates**: Live data updates throughout the application
- **Interactive Charts**: Dynamic charts and visualizations for project analytics

## 🚧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Auto-fix linting issues

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🔧 Configuration

### Environment Variables (Optional)
For production deployment, you may want to configure:
- API endpoints
- Database connections
- Authentication providers

The current version runs entirely in demo mode with no external dependencies required.

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Implementing real backend integration
- Adding user authentication with external providers
- Setting up proper database persistence
- Adding comprehensive testing

## 📄 License

This project is provided as-is for demonstration purposes.

## 🆘 Support

If you encounter any issues:
1. Check that all dependencies are installed correctly
2. Ensure you're using Node.js version 18 or higher
3. Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`
4. Check the browser console for any error messages

## 🎯 Key Features Demonstration

1. **Login** with any of the demo accounts
2. **Explore different dashboards** based on user roles
3. **Create and manage projects** (Admin/Manager roles)
4. **Track workload** and monitor team capacity
5. **Use the export system** to generate reports
6. **Customize themes** in Settings
7. **Watch the owl** follow your cursor around the screen!

---

**BPL Commander** - Making project management delightful and efficient! 🦉