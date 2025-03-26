let currentChatId = null;
let attachedImageBase64 = null; // Храним Base64 вместо URL

function toggleModelList() {
    const modelList = document.getElementById('model-list');
    if (modelList.style.display === 'none' || modelList.style.display === '') {
        modelList.style.display = 'block';
    } else {
        modelList.style.display = 'none';
    }
}

function selectModel(modelName) {
    document.getElementById('current-model-name').textContent = modelName;
    document.getElementById('model-list').style.display = 'none';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Предотвращаем перенос строки
        sendMessage();
    }
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', handleKeyPress);
document.getElementById('new-chat-btn').addEventListener('click', createNewChat);
document.getElementById('attach-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.addEventListener('DOMContentLoaded', () => {
    loadChatList();
    const chats = JSON.parse(localStorage.getItem('chats')) || {};
    if (!Object.keys(chats).length) {
        createNewChat();
    } else {
        currentChatId = Object.keys(chats)[0];
        switchChat(currentChatId);
    }
});

function handleFileUpload() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        attachedImageBase64 = event.target.result.split(',')[1]; // Убираем префикс "data:image/jpeg;base64,"
        addMessage('user', 'Ты', '📷 Фото прикреплено');
        console.log('Фото в Base64 готово');
    };
    reader.onerror = function() {
        addMessage('user', 'Ты', 'Ошибка чтения файла');
        console.error('Ошибка чтения файла');
    };
    reader.readAsDataURL(file); // Читаем файл как Data URL (Base64)

    fileInput.value = ''; // Очищаем input
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    const messageText = userInput.value.trim();

    if ((!messageText && !attachedImageBase64) || sendBtn.disabled || !currentChatId) {
        console.log('Ошибка: нет текста или фото:', { input: messageText, image: attachedImageBase64, chatId: currentChatId });
        return;
    }

    const selectedModel = document.getElementById('current-model-name').textContent;

    if (messageText && !attachedImageBase64) {
        addMessage('user', 'Ты', messageText);
    }

    sendBtn.disabled = true;
    userInput.disabled = true;
    sendBtn.style.opacity = '0.5';
    userInput.style.opacity = '0.5';
    userInput.value = '';

    const payload = { model: selectedModel, chatId: currentChatId };
    if (messageText) payload.message = messageText;
    if (attachedImageBase64) payload.imageBase64 = attachedImageBase64; // Отправляем Base64

    console.log('Отправляем:', payload);

    fetch('/get_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);
        return response.json();
    })
    .then(data => {
        addMessage('ai', selectedModel, data.response);
        attachedImageBase64 = null; // Сбрасываем Base64 после отправки
    })
    .catch(error => {
        console.error('Ошибка:', error);
        addMessage('ai', selectedModel, 'Чёт сломалось, сорри!');
        attachedImageBase64 = null; // Сбрасываем при ошибке
    })
    .finally(() => {
        sendBtn.disabled = false;
        userInput.disabled = false;
        sendBtn.style.opacity = '1';
        userInput.style.opacity = '1';
    });
}

function addMessage(sender, name, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';

    const nameElement = document.createElement('div');
    nameElement.classList.add('name');
    nameElement.textContent = name;

    const textElement = document.createElement('div');
    textElement.textContent = message;

    messageElement.appendChild(nameElement);
    messageElement.appendChild(textElement);
    chatBox.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);

    chatBox.scrollTop = chatBox.scrollHeight;
    saveMessageToChat(currentChatId, sender, name, message);
}

function saveMessageToChat(chatId, sender, name, message) {
    let chats = JSON.parse(localStorage.getItem('chats')) || {};
    if (!chats[chatId]) chats[chatId] = [];
    chats[chatId].push({ sender, name, message });
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadChatList() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    const chats = JSON.parse(localStorage.getItem('chats')) || {};
    const chatIds = Object.keys(chats).map(Number).sort((a, b) => a - b);

    chatIds.forEach(chatId => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.innerHTML = `Чат ${chatId} <button class="delete-chat-btn" onclick="deleteChat('${chatId}')">✖</button>`;
        chatItem.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') switchChat(chatId.toString());
        };
        if (chatId.toString() === currentChatId) chatItem.classList.add('active');
        chatList.appendChild(chatItem);
    });
}

function createNewChat() {
    let chats = JSON.parse(localStorage.getItem('chats')) || {};
    const chatIds = Object.keys(chats).map(Number).sort((a, b) => a - b);
    let newChatId = 1;
    while (chatIds.includes(newChatId)) {
        newChatId++;
    }
    chats[newChatId] = [];
    localStorage.setItem('chats', JSON.stringify(chats));
    currentChatId = newChatId.toString();
    switchChat(currentChatId);
    loadChatList();
}

function switchChat(chatId) {
    currentChatId = chatId;
    attachedImageBase64 = null; // Сбрасываем Base64 при смене чата
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    const chats = JSON.parse(localStorage.getItem('chats')) || {};
    (chats[chatId] || []).forEach(({ sender, name, message }) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.innerHTML = `<div class="name">${name}</div><div>${message}</div>`;
        chatBox.appendChild(messageElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
    loadChatList();
}

function deleteChat(chatId) {
    let chats = JSON.parse(localStorage.getItem('chats')) || {};
    delete chats[chatId];
    localStorage.setItem('chats', JSON.stringify(chats));
    const remainingChats = Object.keys(chats);
    if (chatId === currentChatId) {
        currentChatId = remainingChats.length ? remainingChats[0] : null;
        if (currentChatId) {
            switchChat(currentChatId);
        } else {
            createNewChat();
        }
    }
    loadChatList();
}