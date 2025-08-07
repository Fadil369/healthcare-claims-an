# Contributing to Healthcare Claims Analyzer

## Overview

This repository contains a bilingual (English/Arabic) healthcare claims analysis tool designed for the Saudi market. We welcome contributions that improve the system's functionality, user experience, and analytical capabilities.

## Coding Guidelines

### General Standards
- Use TypeScript for all new features
- Write clear, modular, and testable code
- Follow the existing architecture patterns
- Ensure bilingual support (English/Arabic) in all user-facing features
- Add comprehensive comments for complex logic

### Naming Conventions
- **Variables and functions**: camelCase (`getUserData`, `claimTotal`)
- **Components**: PascalCase (`DashboardView`, `AnalysisChart`)
- **Types and interfaces**: PascalCase (`ClaimData`, `RejectionRule`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_ENDPOINTS`)
- **Files**: kebab-case for utility files, PascalCase for components

### Code Style
- **Indentation**: 2 spaces for JS/TS/TSX/CSS, 4 spaces for others
- **Quotes**: Single quotes for JavaScript/TypeScript
- **Semicolons**: Always use semicolons
- **Line length**: Maximum 100 characters
- **Imports**: Group and sort imports (external libraries first, then internal modules)

### React/TypeScript Specific
- Use functional components with hooks
- Prefer `const` over `let` where possible
- Use proper TypeScript types instead of `any`
- Implement proper error boundaries
- Use React.memo() for performance optimization where beneficial
- Prefer custom hooks for complex state logic

### Documentation
- Add JSDoc/TSDoc comments to all exported functions and components
- Document complex algorithms and business logic
- Include examples in documentation for utility functions
- Keep README files updated with new features

### Security & Best Practices
- Never hardcode secrets—use environment variables
- Sanitize all user inputs
- Implement proper error handling
- Use HTTPS for all external API calls
- Follow OWASP security guidelines for healthcare data

### Healthcare Domain Specific
- Ensure HIPAA compliance considerations
- Validate all medical data formats
- Implement proper audit logging for claims processing
- Follow Saudi healthcare regulations and standards

## Architecture Guidelines

### File Organization
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── assets/            # Static assets
└── lib/               # External library configurations
```

### State Management
- Use React Context for global state (language, theme)
- Use `useKV` hook for persistent data
- Use `useState` for local component state
- Implement proper loading and error states

### Data Processing
- Implement robust file parsing for PDF and Excel
- Use streaming for large file processing
- Implement proper validation for claims data
- Cache processed results when appropriate

## Pull Request Process

1. **Branch Creation**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/description-of-feature
   ```

2. **Development**: 
   - Write clean, tested code following the guidelines above
   - Ensure bilingual support where applicable
   - Test with sample healthcare data

3. **Testing**:
   - Verify all existing functionality still works
   - Test new features thoroughly
   - Ensure responsive design works on mobile and desktop
   - Test with different file formats and sizes

4. **Documentation**: Update relevant documentation and comments

5. **Submission**:
   - Write clear PR descriptions explaining the changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Request review from maintainers

## Code Review Checklist

- [ ] Code follows established patterns and guidelines
- [ ] Proper TypeScript types are used
- [ ] Bilingual support is implemented where needed
- [ ] Error handling is comprehensive
- [ ] Performance considerations are addressed
- [ ] Security best practices are followed
- [ ] Documentation is updated
- [ ] No hardcoded values or secrets
- [ ] Accessibility standards are met

## Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Follow the setup instructions in README.md
4. Use the development server for testing

## Questions and Support

If you have questions about contributing or need clarification on any guidelines, please open an issue or contact the maintainers.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.