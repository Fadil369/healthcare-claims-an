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

- Start with mobile designs and progressively enhance for larger screens.
- Use Tailwind's responsive breakpoints: sm: (640px+), md: (768px+), lg: (1024px+), xl: (1280px+).
- Ensure minimum touch target size of 44x44px for interactive elements.
- Test on various screen sizes and orientations.
- Optimize for both portrait and landscape mobile views.

## Pull Request Process

- Branch off main.
- Ensure your code passes all tests and linters.
- Write clear PR descriptions.
- Test on multiple devices and screen sizes.
- Verify Arabic RTL support works correctly.

## UI/UX Standards

- Prioritize intuitive navigation on small screens.
- Use clear visual hierarchy with appropriate typography scaling.
- Implement progressive disclosure for complex features.
- Ensure consistent spacing using Tailwind's spacing scale.
- Maintain high contrast ratios for accessibility.
- Support both Arabic and English languages properly.