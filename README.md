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
- **Bilingual**: Ensure Arabic/English support in all features
- **Testing**: Comprehensive testing for healthcare data processing
- **Security**: Follow HIPAA compliance considerations

## 📚 Development Resources

### GitHub Copilot Integration
This repository is configured with GitHub Copilot settings to improve code suggestions:
- Preferred languages: TypeScript, JavaScript, CSS, HTML
- Domain-specific context for healthcare analytics
- Coding standards alignment with BrainSAIT practices

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