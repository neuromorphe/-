// CommonJS
const getGPT4js = require("gpt4js");
const GPT4js = await getGPT4js();
// ESM
// import GPT4js from "gpt4js";

const messages = [];
const options = {
  provider: "Nextway",
  model: "gpt-4o-free",
};

const provider = GPT4js.createProvider(options.provider);

document.getElementById('sendButton').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;
    if (!userInput) return;

    // Добавляем сообщение пользователя
    messages.push({ role: "user", content: userInput });
    updateChatContainer(`Вы: ${userInput}`, 'user-message');
    
    // Очищаем поле ввода
    document.getElementById('userInput').value = '';

    try {
        const text = await provider.chatCompletion(messages, options, (data) => {
            console.log(data);
        });
        
        // Добавляем ответ от GPT-4
        updateChatContainer(`GPT-4: ${text}`, 'gpt-message');
    } catch (error) {
        console.error("Error:", error);
        updateChatContainer(`Ошибка: ${error.message}`, 'gpt-message');
    }
});

function updateChatContainer(message, className) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;  // Прокрутка вниз
}
