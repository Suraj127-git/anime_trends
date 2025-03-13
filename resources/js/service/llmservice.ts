export class LLMService {
    async generateResponse(userInput: string): Promise<string> {
        try {
            console.log('Starting generateResponse with input:', userInput);

            const ollama_url = import.meta.env.VITE_OLLAMA_URL;
            const ollama_model = import.meta.env.VITE_OLLAMA_MODEL_NAME;
            console.log('Using Ollama URL:', ollama_url);
            console.log('Using Ollama Model:', ollama_model);

            console.log('Sending request to Ollama API...');
            const response = await fetch(`${ollama_url}/api/generate`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: ollama_model,
                    prompt: userInput,
                    stream: false
                })
            });

            console.log('Received response with status:', response.status);
            if (!response.ok) {
                console.error('Response not OK, throwing error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Parsing response JSON...');
            const data = await response.json();
            console.log('Successfully generated response');
            route('login');
            return data.response;

        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
}
