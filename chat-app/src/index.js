const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPathDirectory = path.join(__dirname, '../public')
app.use(express.static(publicPathDirectory))


io.on('connection', (socket) => {
    console.log('new web socket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined! `))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('send', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed! ')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left! `))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

    socket.on('share-location', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('see-location', generateLocationMessage(user.username, position))
        callback()
    })


    // socket.emit('countUpdated', count)
    //
    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)
    // })

})


server.listen(port, () => {
    console.log('listen on port '+port)
})