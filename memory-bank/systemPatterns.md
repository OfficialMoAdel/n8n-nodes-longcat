# System Patterns: n8n-nodes-longcat

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   n8n Workflow  │───▶│  LongCat Node    │───▶│ LongCat API     │
│   (User Input)  │    │  (TypeScript)    │    │ (External)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Response        │
                       │  Processing      │
                       └──────────────────┘
```

### Component Breakdown

#### LongCat Node (`LongCat.node.ts`)

- **Entry Point**: Main node implementation extending `INodeType`
- **Configuration**: Parameter definitions and UI specifications
- **Execution**: Core business logic for API communication
- **Error Handling**: Comprehensive error management and recovery

#### Credentials (`LongCatApi.credentials.ts`)

- **Authentication**: Secure API key storage and retrieval
- **Validation**: Credential format verification
- **Integration**: Seamless n8n credential system integration

#### Build System

- **TypeScript Compilation**: Source-to-JavaScript transpilation
- **Asset Processing**: Icon optimization via Gulp
- **Packaging**: npm package structure and file inclusion

## Key Technical Decisions

### Node Architecture

- **Single Responsibility**: One node handles all LongCat operations (currently chat completion)
- **Extensible Design**: Modular parameter system allows future operation types
- **TypeScript First**: Full type safety with n8n-workflow interfaces

### API Integration

- **HTTP Abstraction**: Uses n8n's `httpRequest` helper for consistency
- **OpenAI Compatibility**: Leverages LongCat's OpenAI-compatible API
- **Parameter Mapping**: Direct translation of n8n parameters to API fields

### AI Agent Optimization

- **Structured Responses**: JSON formatting for AI agent parsing
- **Metadata Enrichment**: Comprehensive response metadata
- **Tool Mode**: Special handling for AI agent workflows

## Design Patterns

### Node Implementation Pattern

```typescript
export class LongCat implements INodeType {
    description: INodeTypeDescription = { ... };
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Implementation
    }
}
```

#### Key Elements

- **Interface Implementation**: Follows n8n's `INodeType` contract
- **Asynchronous Execution**: Non-blocking API calls with proper error handling
- **Data Flow**: Input processing → API call → Response formatting → Output

### Parameter Configuration Pattern

- **Hierarchical Options**: Main parameters with conditional sub-options
- **Type Safety**: Strict typing for all parameter values
- **Validation**: Built-in min/max values and format constraints
- **Conditional Display**: Dynamic UI based on parameter selections

### Error Handling Pattern

- **Try-Catch Blocks**: Comprehensive exception management
- **Continue on Fail**: Optional error recovery for workflow robustness
- **Structured Errors**: Consistent error response format
- **User-Friendly Messages**: Clear error communication

### Response Processing Pattern

- **Format Detection**: Automatic JSON parsing with fallback
- **Metadata Addition**: Rich context for downstream processing
- **AI Agent Support**: Special formatting for tool mode
- **Usage Tracking**: Token and cost monitoring

## Component Relationships

### Node ↔ Credentials

- **Dependency**: Node requires valid credentials for API access
- **Isolation**: Credentials managed separately for security
- **Retrieval**: Runtime credential resolution via n8n framework

### Node ↔ n8n Workflow

- **Input Processing**: Receives data from upstream nodes
- **Output Generation**: Produces structured data for downstream nodes
- **Error Propagation**: Workflow-level error handling integration

### Node ↔ LongCat API

- **Request Formation**: Translates n8n parameters to API format
- **Response Mapping**: Converts API responses to n8n data structures
- **Authentication**: Bearer token authentication flow

## Critical Implementation Paths

### Chat Completion Flow

1. **Parameter Extraction**: Retrieve and validate node parameters
2. **Message Construction**: Build OpenAI-compatible message array
3. **API Request**: Execute HTTP POST to LongCat API
4. **Response Processing**: Parse and format API response
5. **Output Generation**: Create n8n-compatible return data

### AI Tool Mode Flow

1. **Mode Detection**: Check for AI tool mode activation
2. **Format Selection**: Determine JSON vs text output
3. **Metadata Enhancement**: Add AI-specific response fields
4. **Structured Output**: Ensure parseable response format

### Error Recovery Flow

1. **Exception Catching**: Capture API and processing errors
2. **Error Formatting**: Create consistent error response structure
3. **Recovery Decision**: Apply continue-on-fail logic if enabled
4. **Workflow Continuation**: Allow workflow to proceed or halt

## Data Flow Patterns

### Input Data Flow

```
User Input → Parameter Validation → Message Construction → API Request
```

### Output Data Flow

```
API Response → Content Extraction → Format Processing → Metadata Addition → n8n Output
```

### Error Data Flow

```
Exception → Error Formatting → Recovery Check → Workflow Output/Error
```

## Security Patterns

### Credential Management

- **Secure Storage**: n8n's encrypted credential storage
- **Runtime Access**: Just-in-time credential retrieval
- **No Persistence**: Credentials not cached in node memory

### API Communication

- **HTTPS Only**: Secure communication with LongCat API
- **Token Authentication**: Bearer token in Authorization header
- **No Sensitive Data Logging**: Credentials excluded from logs

## Performance Patterns

### Efficient API Calls

- **Minimal Payloads**: Only required parameters sent to API
- **Streaming Support**: Potential for future streaming implementation
- **Timeout Handling**: Appropriate request timeouts

### Memory Management

- **Stateless Execution**: No persistent state between executions
- **Garbage Collection**: Automatic cleanup of temporary objects
- **Resource Limits**: Parameter constraints prevent excessive resource use
