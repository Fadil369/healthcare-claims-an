# 🏥 Healthcare Claims Analyzer

A bilingual (English/Arabic) healthcare insurance claims analysis tool designed specifically for the Saudi market. This application processes PDF documents and Excel spreadsheets to analyze claims data, identify rejection patterns, and provide actionable insights.

## 🚀 Features

- **Bilingual Support**: Full English and Arabic interface support
- **Multi-format Processing**: Upload and analyze PDF documents and Excel spreadsheets
- **Advanced Analytics**: Deep analysis of claims, rejections, and billing patterns
- **Custom Categorization**: Configurable rejection rules for different insurance providers
- **Saudi Market Focus**: Tailored for Saudi healthcare regulations and standards
- **Professional Dashboard**: Modern, intuitive interface with comprehensive data visualization
- **Export Capabilities**: Export analysis results and reports
- **Training Materials**: Generate insights and training materials for healthcare providers

## 🛠️ Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + useKV for persistence
- **Build Tool**: Vite
- **Analytics**: Advanced LLM-powered data analysis
- **File Processing**: Support for unlimited file sizes and formats

## 📋 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main navigation header
│   ├── DashboardView.tsx
│   ├── AnalysisView.tsx
│   └── ...
├── contexts/           # React contexts (Language, etc.)
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── assets/            # Static assets
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and standards
- Development workflow
- Pull request process
- Testing requirements

### Development Standards
- **TypeScript**: All new code must use TypeScript
- **Code Style**: Follow the established patterns in `.editorconfig`
- **Mobile-First**: Always start with mobile designs, then enhance for larger screens
- **Bilingual**: Ensure Arabic/English support in all features
- **Testing**: Comprehensive testing for healthcare data processing
- **Security**: Follow HIPAA compliance considerations
- **Accessibility**: Maintain WCAG AA compliance for all interactive elements
- **Performance**: Optimize for large file processing and mobile devices

## 📚 Development Resources

## 🤖 GitHub Copilot Integration

This repository has been specifically configured to maximize GitHub Copilot's effectiveness for healthcare domain development:

### Configuration Files
- **`.copilot/settings.json`**: Domain-specific context for healthcare analytics and Saudi market requirements
- **`.editorconfig`**: Consistent code formatting across team members and Copilot suggestions
- **`.vscode/settings.json`**: VS Code configuration optimized for TypeScript, React, and Tailwind CSS
- **`.prettierrc.yml`**: Code formatting rules aligned with mobile-first development
- **CONTRIBUTING.md**: Comprehensive coding standards including healthcare-specific guidelines

### Copilot Context Enhancement
The `.copilot/settings.json` file provides Copilot with:
- **Healthcare Domain Knowledge**: Understanding of CCHI regulations, insurance terminology, and medical workflows
- **Bilingual Support**: Context for English/Arabic development patterns and RTL support
- **Mobile-First Patterns**: Responsive design principles and touch-friendly interface guidelines
- **File Processing**: Best practices for handling large healthcare datasets and document processing
- **Saudi Market Context**: Specific requirements for Saudi healthcare insurance providers

### Development Workflow
1. **Smart Suggestions**: Copilot understands healthcare terminology and provides relevant code suggestions
2. **Bilingual Support**: Automatically suggests Arabic translations and RTL-compatible layouts
3. **Mobile Optimization**: Prioritizes responsive design patterns in suggestions
4. **Security Awareness**: Understands healthcare data privacy requirements and suggests secure patterns
5. **Saudi Compliance**: Recognizes CCHI and local regulatory requirements in suggestions

### Best Practices with Copilot
- Use descriptive comments in English and Arabic to guide Copilot's suggestions
- Leverage the healthcare domain context for accurate medical terminology
- Utilize mobile-first design patterns that Copilot has learned from this configuration
- Take advantage of bilingual development assistance for Arabic UI components

### Best Practices
- Reference: [Best practices for Copilot coding agent](https://gh.io/copilot-coding-agent-tips)
- Follow established patterns in the codebase
- Maintain consistency in bilingual implementation
- Ensure proper error handling for file processing

## 🔒 Security & Compliance

- No hardcoded secrets or API keys
- Proper data sanitization for healthcare information
- HTTPS for all external communications
- Audit logging for claims processing activities
- Saudi healthcare regulation compliance

## 🌍 Internationalization

The application supports:
- **English**: Primary language for development
- **Arabic**: Full RTL support with Noto Sans Arabic font
- Dynamic language switching
- Culturally appropriate design patterns

## 🧹 Clean Up

If you're exploring and don't need to keep this code:
- Simply delete your Spark
- Everything will be cleaned up automatically

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.