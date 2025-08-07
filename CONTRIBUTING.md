# Contributing to healthcare-claims-analyzer

## Coding Guidelines

- Use TypeScript for all new features.
- Use camelCase for variables and functions.
- Use PascalCase for classes and types.
- Indentation: 2 spaces for JS/TS, 4 spaces for others.
- Write clear, modular, testable code.
- Add JSDoc/TSDoc comments to all functions and classes.
- Never hardcode secrets—use environment variables.
- Organize code by domain.
- Use mobile-first responsive design principles.
- Ensure accessibility compliance (WCAG AA).
- Follow Saudi healthcare regulation compliance standards.

## Mobile-First Development

- **Design Philosophy**: Start with mobile designs and progressively enhance for larger screens.
- **Responsive Breakpoints**: Use Tailwind's responsive breakpoints systematically:
  - `sm:` (640px+) - Small tablets and large phones in landscape
  - `md:` (768px+) - Tablets in portrait mode
  - `lg:` (1024px+) - Small laptops and tablets in landscape
  - `xl:` (1280px+) - Desktop computers
  - `2xl:` (1536px+) - Large desktop screens
- **Touch Targets**: Ensure minimum touch target size of 44x44px for interactive elements.
- **Navigation**: Implement hamburger menu for mobile with sidebar, expand to horizontal nav for desktop.
- **Content Priority**: Use progressive disclosure - show essential content first, reveal details as screen real estate increases.
- **Performance**: Optimize images and components for mobile networks and lower-powered devices.
- **Testing**: Test on various screen sizes, orientations, and real devices.
- **Gestures**: Support touch gestures where appropriate (swipe, pinch, long press).

## File Processing Standards

- **Upload Experience**: Provide clear upload areas with drag-and-drop support and progress indicators.
- **File Validation**: Validate file types, sizes, and content before processing.
- **Error Handling**: Provide specific, actionable error messages for file processing failures.
- **Progress Tracking**: Show real-time progress for file uploads and processing.
- **Export Options**: Support multiple export formats (PDF, Excel, JSON) with custom formatting.
- **Large Files**: Handle large files gracefully with chunked processing and memory management.

## Pull Request Process

- Branch off main.
- Ensure your code passes all tests and linters.
- Write clear PR descriptions.
- Test on multiple devices and screen sizes.
- Verify Arabic RTL support works correctly.

## Healthcare & Saudi Market Standards

- **CCHI Compliance**: Follow Council of Cooperative Health Insurance regulations and standards.
- **Arabic Language**: Proper RTL (Right-to-Left) text support with Noto Sans Arabic font.
- **Cultural Sensitivity**: Design patterns appropriate for Saudi healthcare environment.
- **Data Privacy**: Implement strong data protection following local regulations.
- **Medical Terminology**: Use accurate Arabic translations for medical terms.
- **Rejection Categories**: Support custom categorization with bilingual labels.
- **Insurance Providers**: Accommodate various Saudi insurance provider workflows.

## Code Quality & Testing

- **TypeScript Strict Mode**: Enable strict type checking for all new code.
- **Component Testing**: Test components with various props and states.
- **Integration Testing**: Test file processing workflows end-to-end.
- **Accessibility Testing**: Verify keyboard navigation and screen reader compatibility.
- **Performance Testing**: Monitor bundle size and runtime performance.
- **Cross-Browser Testing**: Ensure compatibility across modern browsers.

## Security Guidelines

- **Data Sanitization**: Sanitize all user inputs and file contents.
- **No Hardcoded Secrets**: Use environment variables for any configuration.
- **Secure File Handling**: Validate and scan uploaded files for security threats.
- **Local Processing**: Keep all data processing local - no external API calls with sensitive data.
- **Audit Logging**: Log important actions for compliance and debugging.
- **Error Messages**: Don't expose system internals in user-facing error messages.