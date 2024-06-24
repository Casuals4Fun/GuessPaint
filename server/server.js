import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { generateUniqueRoomCode } from './utils.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Set-Cookie: cross-site-cookie=whatever; SameSite=None; Secure");
    next();
});

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: corsOptions,
});

let rooms = {};
let roomPlayers = {};
let drawingWords = {};
let leaderboards = {};

io.on('connection', socket => {
    socket.on('join-room', ({ roomID, playerName }) => {
        const uniquePlayerName = `${playerName.split('#')[0]}#${socket.id}`;

        if (rooms[socket.id]) {
            const oldRoomID = rooms[socket.id];
            const oldRoomPlayers = roomPlayers[oldRoomID];

            if (oldRoomPlayers) {
                const playerIndex = oldRoomPlayers.indexOf(uniquePlayerName);
                if (playerIndex !== -1) {
                    oldRoomPlayers.splice(playerIndex, 1);
                    if (oldRoomPlayers.length === 0) {
                        delete roomPlayers[oldRoomID];
                    }
                }
            }
        }

        socket.join(roomID);
        rooms[socket.id] = roomID;

        if (!roomPlayers[roomID]) roomPlayers[roomID] = [];
        if (!roomPlayers[roomID].includes(uniquePlayerName)) {
            roomPlayers[roomID].push(uniquePlayerName);
        }

        if (!leaderboards[roomID]) leaderboards[roomID] = {};
        if (!leaderboards[roomID][uniquePlayerName]) {
            leaderboards[roomID][uniquePlayerName] = 0;
        }

        socket.emit('assign-player-name', uniquePlayerName);
        socket.broadcast.to(roomID).emit('new-player', playerName);
        socket.emit('players-in-room', roomPlayers[roomID]);

        if (roomPlayers[roomID].length >= 2) {
            io.to(roomID).emit('prompt-word-entry', roomPlayers[roomID][0]);
        }

        io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);
    });

    socket.on('submit-word', ({ roomID, playerName, word }) => {
        drawingWords[roomID] = word;
        io.to(roomID).emit('word-submitted', { playerName: playerName, word });
    });

    socket.on('guess-word', ({ roomID, playerName, guess }) => {
        if (drawingWords[roomID] && drawingWords[roomID].toLowerCase() === guess.toLowerCase()) {
            if (leaderboards[roomID] && leaderboards[roomID][playerName] !== undefined) {
                leaderboards[roomID][playerName] += 1;
                io.to(roomID).emit('correct-guess', { playerName });
                io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);
            }
        } else {
            socket.emit('wrong-guess');
        }
    });

    socket.on('client-ready', () => {
        const roomID = rooms[socket.id];
        if (roomID) {
            socket.broadcast.to(roomID).emit('get-canvas-state');
        }
    });

    socket.on('canvas-state', (state) => {
        const roomID = rooms[socket.id];
        if (roomID) {
            socket.broadcast.to(roomID).emit('canvas-state-from-server', state);
        }
    });

    socket.on('draw-line', ({ prevPoint, currPoint, color, brushThickness }) => {
        const roomID = rooms[socket.id];
        if (roomID) {
            io.to(roomID).emit('draw-line', {
                prevPoint, currPoint, color, brushThickness
            });
        }
    });

    socket.on('clear', () => {
        const roomID = rooms[socket.id];
        if (roomID) {
            io.to(roomID).emit('clear');
        }
    });

    socket.on('leave-room', () => leaveRoom());
    socket.on('disconnect', () => leaveRoom());

    const leaveRoom = () => {
        const roomID = rooms[socket.id];
        let playerName = null;
        if (roomID && roomPlayers[roomID]) {
            playerName = roomPlayers[roomID].find(name => name.includes(socket.id));

            if (playerName) {
                const index = roomPlayers[roomID].indexOf(playerName);
                if (index !== -1) roomPlayers[roomID].splice(index, 1);
                if (roomPlayers[roomID].length < 2) delete drawingWords[roomID];
                if (roomPlayers[roomID].length === 0) delete roomPlayers[roomID];

                delete leaderboards[roomID][playerName];
                io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);
            }
        }

        delete rooms[socket.id];

        if (roomID && playerName) io.to(roomID).emit('player-left', { playerName, players: roomPlayers[roomID] });
    }
});

app.get('/', async (req, res, next) => {
    try {
        res.send({
            status: 201, message: "GuessPaint API running!",
            rooms, roomPlayers, drawingWords, leaderboards
        });
    } catch (error) {
        res.send({ message: error });
    }
});

app.get('/create-room', (req, res) => {
    const roomID = generateUniqueRoomCode(rooms);
    res.json({ roomID });
});

app.get('/join-room', (req, res) => {
    const { roomID } = req.query;

    if (roomPlayers[roomID]) {
        res.json({ success: true, roomID });
    } else {
        res.json({ success: false });
    }
});

app.get('/list-rooms', (req, res) => {
    const rooms = Object.keys(roomPlayers).map(roomID => ({
        roomID,
        playerCount: roomPlayers[roomID].length
    }));
    res.json(rooms);
});

app.get('/random-room', (req, res) => {
    const availableRoomIDs = Object.keys(roomPlayers).filter(roomID => roomPlayers[roomID].length > 0);

    if (availableRoomIDs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableRoomIDs.length);
        const randomRoomID = availableRoomIDs[randomIndex];
        res.json({ success: true, roomID: randomRoomID });
    } else {
        const newRoomID = generateUniqueRoomCode(rooms);
        res.json({ success: false, roomID: newRoomID });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});