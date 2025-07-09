# Just A Min - Focus Timer App

A beautiful, water-themed focus timer application built with Vue 3, Nuxt 3, and TypeScript.

## 🌊 Features

- **Conversational Time Display**: Shows time in natural language (e.g., "5 minutes left")
- **Water Animations**: Dynamic rain and water effects that intensify as time progresses
- **Keyboard Controls**: Full keyboard navigation and shortcuts
- **URL Parameters**: Set timer duration via URL (e.g., `?min=10`)
- **Complex Audio Chime**: Multi-layered musical chime with bass, drums, and classical elements
- **Browser Notifications**: Desktop notifications when timer completes
- **Responsive Design**: Works perfectly on all device sizes
- **Accessibility**: Full ARIA support and keyboard navigation

## 🏗️ Architecture

### Modular Design

The application follows a modular architecture with clear separation of concerns:

```
nuxt-app/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── BaseButton.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseToggle.vue
│   │   ├── ErrorBoundary.vue
│   │   └── LoadingSpinner.vue
│   ├── FocusTimer.vue         # Main timer component
│   ├── MinuteWheelPicker.vue  # Time selection wheel
│   └── Paani.vue             # Water animation component
├── composables/               # Reusable logic
│   ├── useTimer.ts
│   ├── useAudioGenerator.ts
│   ├── useNotifications.ts
│   ├── useSettings.ts
│   ├── useEventHandlers.ts
│   ├── useUrlParams.ts
│   ├── useErrorHandler.ts
│   ├── useLoading.ts
│   └── useAccessibility.ts
├── utils/                     # Utility functions
│   ├── constants.ts
│   └── timeUtils.ts
├── types/                     # TypeScript definitions
│   └── index.ts
└── docs/                      # Documentation
    └── COMPONENTS.md
```

### Key Design Principles

1. **Single Responsibility**: Each component and composable has one clear purpose
2. **Type Safety**: Full TypeScript support with comprehensive interfaces
3. **Accessibility First**: ARIA labels, keyboard navigation, and screen reader support
4. **Error Handling**: Graceful error boundaries and recovery mechanisms
5. **Performance**: Optimized rendering and efficient state management
6. **Maintainability**: Clean, documented code with clear separation of concerns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd focusweb/nuxt-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Basic Timer**: Visit `http://localhost:3000` to start a 5-minute timer
2. **Custom Duration**: Use URL parameters like `?min=10` for a 10-minute timer
3. **Keyboard Shortcuts**:
   - `Space`: Start/Pause timer
   - `R`: Reset timer
   - `P`: Open/Close settings
   - `↑/↓`: Adjust minutes (when timer is not running)

## 🎨 UI Components

### Base Components

The application includes a comprehensive set of reusable UI components:

- **BaseButton**: Versatile button with multiple variants and states
- **BaseModal**: Accessible modal with focus management
- **BaseToggle**: Toggle switch with ARIA support
- **ErrorBoundary**: Graceful error handling and recovery
- **LoadingSpinner**: Loading indicator with multiple sizes

### Feature Components

- **FocusTimer**: Main timer orchestrator
- **MinuteWheelPicker**: Interactive time selection
- **Paani**: Dynamic water animation system

## 🎵 Audio System

The application features a sophisticated audio system that generates complex musical chimes:

- **Multi-layered Composition**: Bass, drums, hi-hats, snares, and classical elements
- **Dynamic Generation**: Real-time audio synthesis using Web Audio API
- **Configurable**: Enable/disable audio and test chimes in settings

## ♿ Accessibility

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus trapping and restoration
- **Live Regions**: Dynamic content announcements
- **High Contrast**: Clear visual hierarchy and contrast ratios

## 🧪 Error Handling

- **Error Boundaries**: Graceful component error recovery
- **Centralized Error Management**: Unified error logging and handling
- **User-Friendly Messages**: Clear error communication
- **Recovery Mechanisms**: Automatic retry and reset functionality

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to all screen sizes
- **Touch Support**: Full touch interaction support
- **Performance**: Optimized for various device capabilities

## 🔧 Development

### Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **Vue 3 Composition API**: Modern Vue patterns
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting

### Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

- **[Component Documentation](./docs/COMPONENTS.md)**: Detailed component API reference
- **[Type Definitions](./types/index.ts)**: Complete TypeScript interfaces
- **[Composables](./composables/)**: Reusable logic documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Implement proper error handling
- Add accessibility features
- Write comprehensive tests
- Update documentation
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Vue.js Team**: For the amazing framework
- **Nuxt Team**: For the excellent meta-framework
- **Web Audio API**: For enabling complex audio generation
- **Noto Sans Font**: For beautiful typography

---

Built with ❤️ and lots of ☕ 