# Secure Local JSON to Code Converter 🛡️

A privacy-focused, pure client-side tool to format JSON and convert it to **Go Structs**, **Java Classes**, **Python Pydantic**, **C# Classes**, **TypeScript Interfaces**, and **Markdown Specs**.

## Features
- **100% Privacy**: Runs entirely in your browser. No data is sent to any server. Perfect for sensitive logs.
- **Offline Capable**: Works without an internet connection.
- **Multi-Server Support**: Instantly generate code for your backend & docs:
  - **Go**: Structs with `json` tags.
  - **Java**: Classes with Jackson `@JsonProperty` annotations.
  - **Python**: Pydantic `BaseModel` with type hints and alias handling.
  - **C#**: Classes with `System.Text.Json` attributes.
  - **TypeScript**: Interfaces with robust key handling.
  - **Markdown**: Generate data schema tables for documentation.
- **Developer Friendly**: Syntax highlighting (One Dark theme) and one-click copy.

## How to use
1. Paste your JSON.
2. Select your target language (Go/Java/Python/C#).
3. Click **Convert**.
4. Copy the generated code!

## Live Demo
[https://armshau.github.io/json-go-tool/](https://armshau.github.io/json-go-tool/)
