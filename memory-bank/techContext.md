# Tech Context: n8n-nodes-longcat

## Technologies Used

### Core Technologies

#### Runtime Environment

- **Node.js**: >=20.15.0 (LTS version requirement)
- **TypeScript**: ^5.9.2 (Type-safe JavaScript compilation)
- **n8n-workflow**: \* (Peer dependency for n8n integration)

#### Development Tools

- **ESLint**: ^8.57.1 (Code linting and style enforcement)
- **Prettier**: ^3.3.3 (Code formatting)
- **Gulp**: ^5.0.1 (Build automation and asset processing)
- **TypeScript Compiler**: Built-in tsc for compilation

#### External APIs

- **LongCat Chat API**: OpenAI-compatible REST API
- **Endpoint**: `https://api.longcat.chat/openai/v1/chat/completions`
- **Authentication**: Bearer token (API key)

## Development Setup

### Project Structure

```
n8n-nodes-longcat/
├── nodes/
│   └── LongCat/
│       ├── LongCat.node.ts      # Main node implementation
│       └── LongCat.svg          # Node icon
├── credentials/
│   └── LongCatApi.credentials.ts # Credential definitions
├── memory-bank/                 # Project documentation
├── dist/                        # Compiled output (generated)
├── package.json                 # Project configuration
├── tsconfig.json               # TypeScript configuration
├── gulpfile.js                 # Build automation
└── various config files...
```

### Build Process

1. **TypeScript Compilation**: `tsc` compiles .ts files to .js
2. **Asset Processing**: Gulp processes and optimizes SVG icons
3. **Packaging**: npm pack creates distributable package

### Development Workflow

- **Installation**: `npm install` installs all dependencies
- **Development**: `npm run dev` for watch mode compilation
- **Building**: `npm run build` for production build
- **Linting**: `npm run lint` for code quality checks
- **Formatting**: `npm run format` for code style consistency

## Technical Constraints

### Node.js Version

- **Minimum Version**: 20.15.0 (as specified in package.json)
- **Rationale**: Ensures modern JavaScript features and security updates
- **Compatibility**: Must work across different n8n deployment environments

### n8n Compatibility

- **Peer Dependency**: `n8n-workflow: "*"` allows any version
- **Interface Compliance**: Must implement `INodeType` and related interfaces
- **Credential System**: Must integrate with n8n's credential management
- **Node Registry**: Must follow n8n's node registration patterns

### API Limitations

- **Rate Limiting**: Subject to LongCat API rate limits
- **Token Limits**: Model-specific token constraints (max 8192)
- **Thinking Budget**: LongCat-Flash-Thinking has thinking token limits (1024-4096)
- **Authentication**: API key required for all requests

### Build Constraints

- **Single Package**: Must compile to a single npm package
- **File Inclusion**: Only `dist/` contents included in package
- **Icon Requirements**: SVG icon must be processed and included
- **Type Definitions**: Must generate and include .d.ts files

## Dependencies

### Runtime Dependencies

- **None**: All dependencies are development-only (n8n handles runtime)

### Peer Dependencies

- **n8n-workflow**: Core n8n framework integration
  - Provides node interfaces and workflow execution context
  - Handles HTTP requests, credential management, error handling

### Development Dependencies

#### TypeScript Ecosystem

- **@typescript-eslint/parser**: ^8.14.0 - ESLint parser for TypeScript
- **typescript**: ^5.9.2 - TypeScript compiler and language service

#### Code Quality

- **eslint**: ^8.57.1 - JavaScript/TypeScript linting
- **eslint-plugin-n8n-nodes-base**: ^1.16.3 - n8n-specific linting rules
- **prettier**: ^3.3.3 - Code formatting

#### Build Tools

- **gulp**: ^5.0.1 - Task automation and asset processing

### Deprecated Dependencies

- **eslint**: 8.57.1 (deprecated, should upgrade to v9)
- **rimraf**: 3.0.2 (deprecated, should use native rm or fs.rm)
- **glob**: 7.2.3 (deprecated, should upgrade to v10)
- **@humanwhocodes/config-array**: 0.13.0 (deprecated)
- **@humanwhocodes/object-schema**: 2.0.3 (deprecated)

## Tool Usage Patterns

### TypeScript Configuration

- **Target**: ES2020 (compatible with Node.js 20+)
- **Module**: CommonJS (n8n requirement)
- **Declaration Files**: Generated for type checking
- **Source Maps**: Enabled for debugging

### ESLint Configuration

- **Extends**: n8n base rules + TypeScript rules
- **Prepublish Checks**: Strict linting before publishing
- **Auto-fix**: Available for style issues

### Gulp Tasks

- **Icon Processing**: SVG optimization and copying
- **Build Orchestration**: Coordinates TypeScript compilation
- **Watch Mode**: Automatic recompilation on file changes

## Environment Considerations

### Development Environment

- **IDE**: VSCode recommended (with TypeScript support)
- **Node Version Manager**: nvm or similar for version management
- **Git**: Version control with conventional commits

### Production Environment

- **n8n Installation**: Compatible with various n8n deployments
- **Network Access**: Must reach `api.longcat.chat`
- **Security**: API keys stored securely in n8n credentials

### Testing Environment

- **Manual Testing**: Direct n8n workflow testing
- **API Testing**: curl commands for endpoint validation
- **Build Testing**: Local npm link for development testing

## Security Considerations

### API Key Management

- **Storage**: n8n's encrypted credential storage
- **Transmission**: HTTPS-only communication
- **Logging**: API keys never logged or exposed

### Code Security

- **Dependency Scanning**: npm audit for vulnerability detection
- **Type Safety**: TypeScript prevents type-related vulnerabilities
- **Input Validation**: Parameter validation prevents injection attacks

### Network Security

- **HTTPS Only**: All API communication encrypted
- **Certificate Validation**: Standard TLS certificate verification
- **Timeout Protection**: Request timeouts prevent hanging connections

## Performance Considerations

### Compilation Performance

- **Incremental Builds**: TypeScript's incremental compilation
- **Asset Optimization**: Gulp processes icons efficiently
- **Bundle Size**: Minimal package size for fast installation

### Runtime Performance

- **Asynchronous Operations**: Non-blocking API calls
- **Memory Efficiency**: Stateless execution pattern
- **Error Recovery**: Fast failure handling without resource leaks

### API Performance

- **Request Optimization**: Minimal payload sizes
- **Connection Reuse**: n8n's HTTP client handles connection pooling
- **Rate Limit Awareness**: Respectful of API limitations
