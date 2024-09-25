const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const app = express();

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
    apiKey: 'YOUR_OPENAI_API_KEY',
});

const openai = new OpenAIApi(configuration);

app.post('/api/suggestions', async (req, res) => {
    const { code } = req.body;

    try {
        const response = await openai.createCompletion({
            model: "code-davinci-002",
            prompt: code,
            max_tokens: 100,
        });

        res.json({ suggestion: response.data.choices[0].text });
    } catch (error) {
        res.status(500).json({ error: 'Error generating suggestion.' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.post('/api/errors', (req, res) => {
    const { code } = req.body;

    // Call to custom or third-party API for error detection
    const errors = detectErrorsInCode(code);  // Placeholder for your error detection logic

    res.json({ errors });
});
app.post('/api/complexity', (req, res) => {
    const { code } = req.body;

    const complexity = analyzeComplexity(code);  // Placeholder for complexity analysis logic

    res.json({ complexity });
});
