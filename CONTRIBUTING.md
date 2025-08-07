# Contributing to Healthcare Claims Analyzer

## Coding Guidelines

### General Standards
- Use TypeScript for all new features and components
- Use camelCase for variables and functions
- Use PascalCase for React components, types, and interfaces
- Indentation: 2 spaces for JS/TS/TSX, 4 spaces for others
- Write clear, modular, testable code
- Add JSDoc/TSDoc comments to all functions and classes
- Never hardcode secrets—use environment variables
- Organize code by domain and feature

### React/TypeScript Specific
- Use functional components with hooks
- Prefer named exports over default exports for components
- Use proper TypeScript types and interfaces
- Implement proper error boundaries
- Use the useKV hook for persistent data storage
- Follow the existing component structure and patterns

### Styling Guidelines
- Use Tailwind utility classes for styling
- Follow the design system defined in index.css
- Use shadcn components when available
- Maintain responsive design principles
- Ensure proper contrast ratios for accessibility

### File Organization
- Components in `/src/components/`
- Utility functions in `/src/lib/`
- Context providers in `/src/contexts/`
- Types and interfaces in appropriate component files
- Assets in `/src/assets/` with proper subdirectories

### Code Quality
- Write self-documenting code with clear variable names
- Implement proper error handling and validation
- Use proper loading states and user feedback
- Follow SOLID principles where applicable
- Ensure mobile-first responsive design

### Security Best Practices
- Validate all user inputs
- Use secure file upload practices
- Implement proper data sanitization
- Never expose sensitive data in client-side code
- Use environment variables for configuration

## Pull Request Process

1. Branch off main with descriptive branch names
2. Ensure your code passes all tests and linters
3. Write clear PR descriptions explaining changes
4. Include screenshots for UI changes
5. Test on multiple screen sizes and browsers
6. Ensure accessibility standards are met

## Code Review Standards

- Focus on code clarity and maintainability
- Verify proper TypeScript usage
- Check for security vulnerabilities
- Ensure consistent styling and patterns
- Validate accessibility compliance
- Test functionality thoroughly

## Healthcare Domain Considerations

- Understand insurance claim terminology
- Respect data privacy and security requirements
- Implement proper data validation for healthcare data
- Consider bilingual support (English/Arabic)
- Follow healthcare industry best practices