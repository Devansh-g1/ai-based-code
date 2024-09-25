import React, { useRef, useState } from 'react';
import * as monaco from 'monaco-editor';

const CodeEditor = () => {
    const editorRef = useRef(null);
    const [code, setCode] = useState('// Start writing your code here...\n');

    const initializeEditor = () => {
        editorRef.current = monaco.editor.create(document.getElementById('editor-container'), {
            value: code,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true
        });
    };

    const handleAICompletion = async () => {
        const response = await fetch('http://localhost:5000/api/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });
        const result = await response.json();
        editorRef.current.setValue(result.suggestion);
    };

    return (
        <div>
            <button onClick={handleAICompletion}>Get AI Code Suggestion</button>
            <div id="editor-container" style={{ height: '500px', width: '100%' }}></div>
        </div>
    );
};
const handleErrorDetection = async () => {
    const response = await fetch('http://localhost:5000/api/errors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
    });
    const result = await response.json();
    console.log(result.errors);  // Display errors in a suitable UI component
};
const handleComplexityAnalysis = async () => {
    const response = await fetch('http://localhost:5000/api/complexity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
    });
    const result = await response.json();
    console.log(result.complexity);  // Display complexity in a suitable UI component
};

export default CodeEditor;
