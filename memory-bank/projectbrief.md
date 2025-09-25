# Project Brief: n8n-nodes-longcat

## Core Purpose

This project develops an n8n community node that integrates with the LongCat Chat API, providing AI-powered chat completion capabilities within n8n workflows. The node is specifically designed with AI agent compatibility in mind, offering enhanced features for AI agent integration and structured responses.

## Key Requirements

- Implement chat completion functionality using LongCat AI models (LongCat-Flash-Chat and LongCat-Flash-Thinking)
- Support AI tool mode for enhanced AI agent integration
- Provide structured JSON responses for AI processing
- Include thinking capabilities for advanced reasoning
- Handle authentication via API keys
- Support configurable parameters (temperature, max tokens, thinking budget)
- Ensure comprehensive error handling and usage statistics
- Maintain compatibility with n8n-workflow peer dependency

## Success Criteria

- Node successfully installs and appears in n8n node palette
- API integration works correctly with valid credentials
- AI agent features function as documented
- Code passes linting and builds without errors
- Comprehensive testing validates functionality
- Documentation provides clear usage instructions

## Scope Boundaries

- Focus on chat completion operations only
- Support only the specified LongCat models
- Maintain compatibility with current n8n-workflow versions
- Do not implement custom model training or fine-tuning features
