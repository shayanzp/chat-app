const generateMessage = (username, message) => {
    return {
        text: message,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}