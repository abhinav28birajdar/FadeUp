# Contributing to FadeUp

Thank you for your interest in contributing to FadeUp! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js v22.14.0 or higher
- npm 8.19.3 or higher
- Git
- Expo CLI
- Understanding of React Native, TypeScript, and Expo

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/FadeUp.git
   cd FadeUp
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/abhinav28birajdar/FadeUp.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

5. **Start development server**
   ```bash
   npm start
   ```

## 🔄 Development Workflow

### Creating a Feature Branch
```bash
# Sync with upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Making Changes

1. **Code Style**: Follow our TypeScript and React Native conventions
2. **Testing**: Write tests for new features and bug fixes
3. **Documentation**: Update documentation for significant changes
4. **Commits**: Use conventional commit format

### Commit Convention
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Feature
git commit -m "feat: add real-time queue notifications"

# Bug fix
git commit -m "fix: resolve booking time slot overlap"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve queue management logic"

# Test
git commit -m "test: add unit tests for booking service"

# Chore
git commit -m "chore: update dependencies"
```

### Submitting Changes

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template completely
   - Link any related issues

3. **Code Review Process**
   - Wait for code review feedback
   - Address review comments
   - Ensure CI passes

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- booking.test.ts

# Run in watch mode
npm run test:watch
```

### Writing Tests

#### Unit Tests
```typescript
// __tests__/utils/booking.test.ts
import { calculateBookingDuration } from '../../src/utils/booking';

describe('calculateBookingDuration', () => {
  it('should calculate correct duration for single service', () => {
    const services = [{ id: '1', duration: 30 }];
    const result = calculateBookingDuration(services);
    expect(result).toBe(30);
  });
});
```

#### Component Tests
```typescript
// __tests__/components/BookingCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import BookingCard from '../../src/components/BookingCard';

describe('BookingCard', () => {
  it('should render booking information correctly', () => {
    const mockBooking = {
      id: '1',
      shop_name: 'Test Shop',
      service_name: 'Haircut',
      // ... other properties
    };

    const { getByText } = render(<BookingCard booking={mockBooking} />);
    expect(getByText('Test Shop')).toBeTruthy();
    expect(getByText('Haircut')).toBeTruthy();
  });
});
```

## 🎨 Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type usage
- Use proper generics where applicable

```typescript
// ✅ Good
interface BookingRequest {
  shopId: string;
  serviceIds: string[];
  appointmentTime: Date;
  customerNotes?: string;
}

// ❌ Avoid
function createBooking(data: any) {
  // ...
}
```

### React Native Components
- Use functional components with hooks
- Implement proper TypeScript props interfaces
- Use memo for performance optimization when needed

```typescript
// ✅ Good
interface BookingCardProps {
  booking: Booking;
  onPress: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = memo(({ booking, onPress }) => {
  // Component implementation
});
```

### Styling
- Use NativeWind/Tailwind classes consistently
- Follow the design system color palette
- Implement responsive design principles

```typescript
// ✅ Good
<View className="bg-gray-900 p-4 rounded-lg border border-gray-800">
  <Text className="text-white text-lg font-semibold">
    {shop.name}
  </Text>
</View>
```

### File Structure
- Keep components in appropriate directories
- Use barrel exports for cleaner imports
- Follow naming conventions

```
src/
├── components/
│   ├── ui/           # Generic UI components
│   ├── booking/      # Booking-specific components
│   └── index.ts      # Barrel exports
├── lib/
│   ├── supabase.ts   # Supabase client
│   └── utils.ts      # Utility functions
└── types/
    └── index.ts      # Type definitions
```

## 📱 Platform-Specific Guidelines

### iOS Development
- Test on iOS Simulator and physical devices
- Follow iOS Human Interface Guidelines
- Ensure proper safe area handling

### Android Development
- Test on Android Emulator and physical devices
- Follow Material Design principles
- Handle different screen densities

### Web Development
- Ensure responsive design works on web
- Test keyboard navigation
- Verify accessibility features

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Expo SDK version
   - React Native version
   - Device/simulator details
   - Operating system

2. **Reproduction Steps**
   - Clear, step-by-step instructions
   - Expected vs actual behavior
   - Screenshots or videos if applicable

3. **Additional Context**
   - Error messages or logs
   - Related code snippets
   - Potential solutions you've tried

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Expo SDK: [e.g. 54.0.0]
- React Native: [e.g. 0.80.1]
- Device: [e.g. iPhone 15, Android Pixel 7]
- OS: [e.g. iOS 17.0, Android 14]

**Additional Context**
Any other context about the problem.
```

## ✨ Feature Requests

When requesting features:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: Your idea for implementing the feature
3. **Alternatives**: Other solutions you've considered
4. **Mockups**: Visual designs if applicable

## 🔐 Security

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email us directly at security@fadeup.app
3. Include detailed steps to reproduce
4. Allow reasonable time for response

## 📋 Code Review Process

### For Contributors
- Ensure all tests pass
- Address review feedback promptly
- Keep PRs focused and reasonably sized
- Update documentation as needed

### For Reviewers
- Provide constructive feedback
- Test changes when possible
- Review for code quality, performance, and security
- Approve when satisfied with changes

## 🏆 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes for significant contributions
- Annual contributor acknowledgments

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/fadeup)
- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Email**: contribute@fadeup.app

## 📄 License

By contributing to FadeUp, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FadeUp! Your efforts help make the barbering experience better for everyone. 💈✨
