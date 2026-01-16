// --- Helper to Update Output and Highlight ---
function setOutput(code, language) {
    const outputElement = document.getElementById('output-code');
    const errorMsg = document.getElementById('msg-error');
    const successMsg = document.getElementById('msg-success');

    // Set content and class
    outputElement.textContent = code;
    outputElement.className = `language-${language}`;
    outputElement.removeAttribute('data-highlighted'); // Force re-highlight

    // Trigger syntax highlighting
    if (window.hljs) {
        hljs.highlightElement(outputElement);
    }

    // Show success message
    successMsg.textContent = `Generated ${language.toUpperCase()}!`;
    successMsg.style.display = 'inline-block';
    errorMsg.style.display = 'none';

    // Reset scroll (on the <pre> tag, which is the parent)
    outputElement.parentElement.scrollTop = 0;
}

function setError(message) {
    const outputElement = document.getElementById('output-code');
    const errorMsg = document.getElementById('msg-error');
    const successMsg = document.getElementById('msg-success'); // Also hide success message

    errorMsg.innerText = "Error: " + message;
    errorMsg.style.display = 'inline-block';
    successMsg.style.display = 'none'; // Ensure success message is hidden
    outputElement.textContent = "// Error occurred";
    outputElement.className = ''; // Clear language class on error
    outputElement.removeAttribute('data-highlighted');
}

function copyToClipboard() {
    const code = document.getElementById('output-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('#output-container button');
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = originalText, 2000);
    });
}

// Check this script! No 'fetch', no 'XMLHttpRequest'. 
// Everything happens in local variable 'input' and 'output'.

function formatJSON() {
    const input = document.getElementById('input');

    try {
        // 1. Parsing: Browser memory -> JS Object
        const obj = JSON.parse(input.value);

        // 2. Formatting: JS Object -> String (with 4 spaces indentation)
        const formatted = JSON.stringify(obj, null, 4);

        // 3. Update UI
        input.value = formatted;
        setOutput(formatted, 'json');

        // The success message is now handled by setOutput
        // setTimeout(() => successMsg.style.display = 'none', 3000);
    } catch (e) {
        setError(e.message);
    }
}

function minifyJSON() {
    const input = document.getElementById('input');
    try {
        const obj = JSON.parse(input.value);
        const minified = JSON.stringify(obj);
        input.value = minified;
        setOutput(minified, 'json');
    } catch (e) {
        setError("Invalid JSON");
    }
}

// --- Conversion Dispatcher ---
function convertJSON() {
    const lang = document.getElementById('language-select').value;
    if (lang === 'go') {
        jsonToGo();
    } else if (lang === 'java') {
        jsonToJava();
    } else if (lang === 'python') {
        jsonToPython();
    } else if (lang === 'csharp') {
        jsonToCSharp();
    } else if (lang === 'typescript') {
        jsonToTypeScript();
    }
}

// --- TypeScript Conversion Logic ---
function jsonToTypeScript() {
    const input = document.getElementById('input');

    try {
        const obj = JSON.parse(input.value);

        const interfaces = [];
        const rootInterface = generateTypeScriptInterface(obj, "Root", interfaces);

        let tsCode = rootInterface;
        if (interfaces.length > 0) {
            tsCode += "\n\n" + interfaces.join("\n\n");
        }

        setOutput(tsCode, 'typescript');
    } catch (e) {
        setError(e.message);
    }
}

function generateTypeScriptInterface(obj, interfaceName, interfaceCollector) {
    let sb = `export interface ${interfaceName} {\n`;

    for (const key in obj) {
        const value = obj[key];
        const fieldName = key; // Keep original key name for TS
        let type = "any";

        if (value === null) {
            type = "any"; // null can be anything
        } else if (typeof value === "string") {
            type = "string";
        } else if (typeof value === "number") {
            type = "number";
        } else if (typeof value === "boolean") {
            type = "boolean";
        } else if (Array.isArray(value)) {
            let itemType = "any";
            if (value.length > 0) {
                const first = value[0];
                if (typeof first === "string") itemType = "string";
                else if (typeof first === "number") itemType = "number";
                else if (typeof first === "boolean") itemType = "boolean";
                else if (typeof first === "object") {
                    const nestedInterfaceName = toPascalCase(key) + "Item";
                    const nestedInterfaceCode = generateTypeScriptInterface(first, nestedInterfaceName, interfaceCollector);
                    interfaceCollector.push(nestedInterfaceCode);
                    itemType = nestedInterfaceName;
                }
            }
            type = `${itemType}[]`;
        } else if (typeof value === "object") {
            const nestedInterfaceName = toPascalCase(key);
            const nestedInterfaceCode = generateTypeScriptInterface(value, nestedInterfaceName, interfaceCollector);
            interfaceCollector.push(nestedInterfaceCode);
            type = nestedInterfaceName;
        }

        const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        if (isValidIdentifier.test(fieldName)) {
            sb += `    ${fieldName}: ${type};\n`;
        } else {
            sb += `    "${fieldName}": ${type};\n`;
        }
    }
    sb += "}";
    return sb;
}

// ... existing jsonToGo ...

// --- C# Conversion Logic ---
function jsonToCSharp() {
    const input = document.getElementById('input');
    // const output = document.getElementById('output-go'); // No longer needed
    // const errorMsg = document.getElementById('msg-error'); // No longer needed
    // const successMsg = document.getElementById('msg-success'); // No longer needed

    try {
        const obj = JSON.parse(input.value);

        const classes = [];
        const rootClass = generateCSharpClass(obj, "Root", classes);

        // System.Text.Json style
        let csCode = "using System.Text.Json.Serialization;\nusing System.Collections.Generic;\n\n";
        csCode += "namespace JsonToCSharp\n{\n";
        csCode += rootClass;
        csCode += "\n" + classes.join("\n\n");
        csCode += "\n}";

        setOutput(csCode, 'csharp');
        // output.value = csCode; // Replaced by setOutput
        // successMsg.innerText = "Converted to C# Class!"; // Replaced by setOutput
        // successMsg.style.display = 'inline-block'; // Replaced by setOutput
        // errorMsg.style.display = 'none'; // Replaced by setOutput
        // output.scrollTop = 0; // Replaced by setOutput
    } catch (e) {
        setError(e.message);
        // errorMsg.innerText = "Error: " + e.message; // Replaced by setError
        // errorMsg.style.display = 'inline-block'; // Replaced by setError
        // output.value = ""; // Replaced by setError
    }
}

function generateCSharpClass(obj, className, classCollector) {
    let sb = `    public class ${className}\n    {\n`;

    for (const key in obj) {
        const value = obj[key];
        const fieldName = toPascalCase(key); // C# uses PascalCase for public properties
        let type = "object";

        if (value === null) {
            type = "object";
        } else if (typeof value === "string") {
            type = "string";
        } else if (typeof value === "number") {
            type = Number.isInteger(value) ? "int" : "double";
        } else if (typeof value === "boolean") {
            type = "bool";
        } else if (Array.isArray(value)) {
            let itemType = "object";
            if (value.length > 0) {
                const first = value[0];
                if (typeof first === "string") itemType = "string";
                else if (typeof first === "number") itemType = Number.isInteger(first) ? "int" : "double";
                else if (typeof first === "boolean") itemType = "bool";
                else if (typeof first === "object") {
                    const nestedClassName = toPascalCase(key) + "Item";
                    const nestedClassCode = generateCSharpClass(first, nestedClassName, classCollector);
                    classCollector.push(nestedClassCode);
                    itemType = nestedClassName;
                }
            }
            type = `List<${itemType}>`;
        } else if (typeof value === "object") {
            const nestedClassName = toPascalCase(key);
            const nestedClassCode = generateCSharpClass(value, nestedClassName, classCollector);
            classCollector.push(nestedClassCode);
            type = nestedClassName;
        }

        // C# System.Text.Json annotation
        sb += `        [JsonPropertyName("${key}")]\n`;
        sb += `        public ${type} ${fieldName} { get; set; }\n`;
    }
    sb += "    }";
    return sb;
}

// --- Python Conversion Logic ---
function jsonToPython() {
    const input = document.getElementById('input');
    // const output = document.getElementById('output-go'); // No longer needed
    // const errorMsg = document.getElementById('msg-error'); // No longer needed
    // const successMsg = document.getElementById('msg-success'); // No longer needed

    try {
        const obj = JSON.parse(input.value);

        const classes = [];
        const rootClass = generatePythonClass(obj, "Root", classes);

        let pyCode = "from pydantic import BaseModel, Field\nfrom typing import List, Optional, Any\n\n";
        pyCode += classes.join("\n\n");
        pyCode += "\n\n" + rootClass;

        setOutput(pyCode, 'python');
        // output.value = pyCode; // Replaced by setOutput
        // successMsg.innerText = "Converted to Python Pydantic!"; // Replaced by setOutput
        // successMsg.style.display = 'inline-block'; // Replaced by setOutput
        // errorMsg.style.display = 'none'; // Replaced by setOutput
        // output.scrollTop = 0; // Replaced by setOutput
    } catch (e) {
        setError(e.message);
        // errorMsg.innerText = "Error: " + e.message; // Replaced by setError
        // errorMsg.style.display = 'inline-block'; // Replaced by setError
        // output.value = ""; // Replaced by setError
    }
}

function generatePythonClass(obj, className, classCollector) {
    let sb = `class ${className}(BaseModel):\n`;
    let hasField = false;

    // Python reserved words
    const reserved = ['class', 'def', 'return', 'import', 'from', 'if', 'else', 'for', 'while', 'pass', 'break', 'continue', 'try', 'except', 'raise', 'with', 'as', 'assert', 'yield', 'global', 'lambda'];
    const isValidIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    for (const key in obj) {
        hasField = true;
        const value = obj[key];
        let type = "Any";

        if (value === null) {
            type = "Optional[Any]";
        } else if (typeof value === "string") {
            type = "str";
        } else if (typeof value === "number") {
            type = Number.isInteger(value) ? "int" : "float";
        } else if (typeof value === "boolean") {
            type = "bool";
        } else if (Array.isArray(value)) {
            let itemType = "Any";
            if (value.length > 0) {
                const first = value[0];
                if (typeof first === "string") itemType = "str";
                else if (typeof first === "number") itemType = Number.isInteger(first) ? "int" : "float";
                else if (typeof first === "boolean") itemType = "bool";
                else if (typeof first === "object") {
                    const nestedClassName = toPascalCase(key) + "Item";
                    const nestedClassCode = generatePythonClass(first, nestedClassName, classCollector);
                    classCollector.push(nestedClassCode);
                    itemType = nestedClassName;
                }
            }
            type = `List[${itemType}]`;
        } else if (typeof value === "object") {
            const nestedClassName = toPascalCase(key);
            const nestedClassCode = generatePythonClass(value, nestedClassName, classCollector);
            classCollector.push(nestedClassCode);
            type = nestedClassName;
        }

        // Logic for valid python identifier checks
        let pyName = key;
        let needsAlias = false;

        // 1. Check valid identifier
        if (!isValidIdentifier.test(key)) {
            pyName = key.replace(/[^a-zA-Z0-9_]/g, '_');
            // If starts with number
            if (/^[0-9]/.test(pyName)) {
                pyName = "_" + pyName;
            }
            needsAlias = true;
        }

        // 2. Check reserved words
        if (reserved.includes(pyName)) {
            pyName = pyName + "_";
            needsAlias = true;
        }

        // 3. Special case: if sanitization resulted in empty string or conflicts 
        if (!pyName || pyName === "_") pyName = "field_" + Math.floor(Math.random() * 1000);

        if (needsAlias) {
            sb += `    ${pyName}: ${type} = Field(alias="${key}")\n`;
        } else {
            sb += `    ${key}: ${type}\n`;
        }
    }

    if (!hasField) {
        sb += "    pass\n";
    }
    return sb;
}

// ... existing generateJavaClass ...

// --- Go Conversion Logic ---
function jsonToGo() {
    const input = document.getElementById('input');
    // const outputGo = document.getElementById('output-go'); // No longer needed
    // const errorMsg = document.getElementById('msg-error'); // No longer needed
    // const successMsg = document.getElementById('msg-success'); // No longer needed

    try {
        const obj = JSON.parse(input.value);

        // Root struct name
        const goCode = "type AutoGenerated struct {\n" + generateGoStruct(obj, 1) + "}";

        setOutput(goCode, 'go');
        // outputGo.value = goCode; // Replaced by setOutput
        // successMsg.innerText = "Converted to Go Struct!"; // Replaced by setOutput
        // successMsg.style.display = 'inline-block'; // Replaced by setOutput
        // errorMsg.style.display = 'none'; // Replaced by setOutput

        // Auto-scroll to top
        // outputGo.scrollTop = 0; // Replaced by setOutput
    } catch (e) {
        setError(e.message);
        // errorMsg.innerText = "Error: " + e.message; // Replaced by setError
        // errorMsg.style.display = 'inline-block'; // Replaced by setError
        // outputGo.value = ""; // Replaced by setError
    }
}

function generateGoStruct(obj, indentLevel) {
    let result = "";
    const indent = "\t".repeat(indentLevel);

    for (const key in obj) {
        const value = obj[key];
        const fieldName = toPascalCase(key);
        const jsonTag = ` \`json:"${key}"\``;
        let type = "interface{}";

        if (value === null) {
            type = "interface{}";
        } else if (typeof value === "string") {
            type = "string";
        } else if (typeof value === "number") {
            type = Number.isInteger(value) ? "int" : "float64";
        } else if (typeof value === "boolean") {
            type = "bool";
        } else if (Array.isArray(value)) {
            if (value.length > 0) {
                const first = value[0];
                if (typeof first === "string") type = "[]string";
                else if (typeof first === "number") type = Number.isInteger(first) ? "[]int" : "[]float64";
                else if (typeof first === "boolean") type = "[]bool";
                else if (typeof first === "object") {
                    type = "[]struct {\n" + generateGoStruct(first, indentLevel + 1) + indent + "}";
                }
            } else {
                type = "[]interface{}";
            }
        } else if (typeof value === "object") {
            type = "struct {\n" + generateGoStruct(value, indentLevel + 1) + indent + "}";
        }

        result += `${indent}${fieldName} ${type}${jsonTag}\n`;
    }
    return result;
}

// --- Java Conversion Logic ---
function jsonToJava() {
    const input = document.getElementById('input');
    // const output = document.getElementById('output-go'); // Reusing the same area // No longer needed
    // const errorMsg = document.getElementById('msg-error'); // No longer needed
    // const successMsg = document.getElementById('msg-success'); // No longer needed

    try {
        const obj = JSON.parse(input.value);

        // Container for nested classes (to allow flat class definitions)
        const classes = [];
        const rootClass = generateJavaClass(obj, "Root", classes);

        // Combine Root class and all collected nested inner classes
        let javaCode = "import com.fasterxml.jackson.annotation.JsonProperty;\nimport java.util.List;\n\n";
        javaCode += rootClass;
        javaCode += "\n" + classes.join("\n\n");

        setOutput(javaCode, 'java');
        // output.value = javaCode; // Replaced by setOutput
        // successMsg.innerText = "Converted to Java Class!"; // Replaced by setOutput
        // successMsg.style.display = 'inline-block'; // Replaced by setOutput
        // errorMsg.style.display = 'none'; // Replaced by setOutput
        // output.scrollTop = 0; // Replaced by setOutput
    } catch (e) {
        setError(e.message);
        // errorMsg.innerText = "Error: " + e.message; // Replaced by setError
        // errorMsg.style.display = 'inline-block'; // Replaced by setError
        // output.value = ""; // Replaced by setError
    }
}

function generateJavaClass(obj, className, classCollector) {
    let sb = `public class ${className} {\n`;

    for (const key in obj) {
        const value = obj[key];
        const fieldName = toCamelCase(key); // Java uses camelCase for fields
        let type = "Object";

        if (value === null) {
            type = "Object";
        } else if (typeof value === "string") {
            type = "String";
        } else if (typeof value === "number") {
            type = Number.isInteger(value) ? "int" : "double";
        } else if (typeof value === "boolean") {
            type = "boolean";
        } else if (Array.isArray(value)) {
            let itemType = "Object";
            if (value.length > 0) {
                const first = value[0];
                if (typeof first === "string") itemType = "String";
                else if (typeof first === "number") itemType = Number.isInteger(first) ? "Integer" : "Double"; // wrapper classes in List
                else if (typeof first === "boolean") itemType = "Boolean";
                else if (typeof first === "object") {
                    const nestedClassName = toPascalCase(key) + "Item";
                    const nestedClassCode = generateJavaClass(first, nestedClassName, classCollector);
                    classCollector.push(nestedClassCode);
                    itemType = nestedClassName;
                }
            }
            type = `List<${itemType}>`;
        } else if (typeof value === "object") {
            const nestedClassName = toPascalCase(key);
            const nestedClassCode = generateJavaClass(value, nestedClassName, classCollector);
            classCollector.push(nestedClassCode);
            type = nestedClassName;
        }

        sb += `    @JsonProperty("${key}")\n`;
        sb += `    public ${type} ${fieldName};\n`;
    }
    sb += "}";
    return sb;
}

// Helper: convert "user_id" -> "UserId", "123key" -> "Num123Key"
function toPascalCase(str) {
    if (!str) return "";

    // Replace non-alphanumeric chars with space
    const clean = str.replace(/[^a-zA-Z0-9]/g, ' ');

    // Split into words, capitalize each
    const words = clean.split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) return "UnknownField";

    let pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');

    // If starts with digit, prepend "Num"
    if (/^[0-9]/.test(pascal)) {
        pascal = "Num" + pascal;
    }

    return pascal;
}

// Helper: convert "User_id" -> "userId"
function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
