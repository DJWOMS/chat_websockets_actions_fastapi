const messages = document.getElementById('messages')
document.getElementById('send-message').addEventListener('click', sendMessage)
document.getElementById('create-name').addEventListener('click', createUsername)
document.getElementById('close-chat').addEventListener('click', closeChat)

let username

const ws = new WebSocket("ws://127.0.0.1:8000/ws?token=asdad87q9dasbdaibd")


ws.onmessage = function (event) {
    let data = JSON.parse(event.data)
    switch (data.action) {
        case 'join':
            joinUser(data.message)
            break
        case 'newMessage':
            newMessage(data.username, data.message)
            break
        case 'disconnect':
            disconnectUser(data.message)
            break
        default:
            break
    }
}

function joinUser(message) {
    let li = document.createElement('li')
    let content = document.createTextNode(`Connected user: ${message}`)
    li.appendChild(content)
    messages.appendChild(li)
}

function newMessage(username, message) {
    let li = document.createElement('li')
    let content = document.createTextNode(`${username}: ${message}`)
    li.appendChild(content)
    messages.appendChild(li)
}

function disconnectUser(message) {
    let li = document.createElement('li')
    let content = document.createTextNode(`Disconnected user: ${message}`)
    li.appendChild(content)
    messages.appendChild(li)
}

function sendMessage(event) {
    let input = document.getElementById("messageText")
    let data = JSON.stringify(
        {
            action: 'send_message',
            username: username,
            message: input.value
        }
    )
    ws.send(data)
    input.value = ''
}

function createUsername() {
    username = document.getElementById("username").value
    let formUsername = document.getElementById("form-username")
    formUsername.style.display = 'none'

    let formChat = document.getElementById("form-chat")
    formChat.style.display = 'block'

    let data = JSON.stringify(
        {
            action: 'join',
            username: username
        }
    )
    ws.send(data)
}

function closeChat() {
    let data = JSON.stringify(
        {
            action: 'close',
            username: username
        }
    )
    ws.send(data)

    document.getElementById("username").value = ''
    let formUsername = document.getElementById("form-username")
    formUsername.style.display = 'block'

    let formChat = document.getElementById("form-chat")
    formChat.style.display = 'none'
}
