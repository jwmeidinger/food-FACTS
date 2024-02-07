// functions/openAIProxy.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const requestBody = JSON.parse(event.body);
  // Construct the prompt with the structured messages
  const messages = [
    {"role": "system", "content": "You are a nutrition expert, skilled in analyzing FDA nutrition labels. I want to only answer what is being asked an nothing else."},
    {"role": "user", "content": `Based on this nutrition label: \n"${requestBody.text}", what are ALL of the related allergens for this product? I want the answer to be an allergen or respond with "No allergens detected."`}
  ];

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.5,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' }),
    };
  }
};
