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
let currentPlayerIndex = {};
let countdownIntervals = {};
let votes = {};

const startTurnTimer = (roomID) => {
    if (countdownIntervals[roomID]) clearInterval(countdownIntervals[roomID]);

    let timeLeft = 60;
    io.to(roomID).emit('timer-update', timeLeft);

    countdownIntervals[roomID] = setInterval(() => {
        timeLeft -= 1;
        io.to(roomID).emit('timer-update', timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdownIntervals[roomID]);
            const currentPlayer = roomPlayers[roomID][currentPlayerIndex[roomID]];
            const drawingWord = drawingWords[roomID];

            io.to(roomID).emit('timer-update', 0);
            io.to(roomID).emit('time-up', { currentPlayer, drawingWord });

            currentPlayerIndex[roomID] = (currentPlayerIndex[roomID] + 1) % roomPlayers[roomID].length;
            io.to(roomID).emit('prompt-word-entry', roomPlayers[roomID][currentPlayerIndex[roomID]]);

            delete drawingWords[roomID];
        }
    }, 1000);
};

const stopTurnTimer = (roomID) => {
    if (countdownIntervals[roomID]) {
        clearInterval(countdownIntervals[roomID]);
        io.to(roomID).emit('timer-update', 60);
    }
};

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

        if (!currentPlayerIndex[roomID]) currentPlayerIndex[roomID] = 0;

        socket.emit('assign-player-name', uniquePlayerName);
        socket.broadcast.to(roomID).emit('new-player', playerName);
        socket.emit('players-in-room', roomPlayers[roomID]);

        if (votes[roomID]) {
            for (const player in votes[roomID]) {
                votes[roomID][player].required = roomPlayers[roomID].length - 1;
                io.to(roomID).emit('vote-progress', { player, votes: votes[roomID][player].count });
            }
        }

        if (roomPlayers[roomID].length >= 2) {
            io.to(roomID).emit('prompt-word-entry', roomPlayers[roomID][currentPlayerIndex[roomID]]);
        }

        io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);
    });

    socket.on('submit-word', ({ roomID, playerName, word }) => {
        drawingWords[roomID] = word;
        io.to(roomID).emit('word-submitted', { playerName: playerName, wordLength: word.length });

        if (roomPlayers[roomID].length >= 0) {
            startTurnTimer(roomID);
        }
    });

    socket.on('guess-word', ({ roomID, playerName, guess }) => {
        if (drawingWords[roomID] && drawingWords[roomID].toLowerCase() === guess.toLowerCase()) {
            const numPlayers = roomPlayers[roomID].length;
            const correctGuesses = roomPlayers[roomID].filter(player => player !== roomPlayers[roomID][currentPlayerIndex[roomID]] && player !== playerName).length;

            if (numPlayers === 2 || correctGuesses === numPlayers - 2) {
                currentPlayerIndex[roomID] = (currentPlayerIndex[roomID] + 1) % numPlayers;
                io.to(roomID).emit('prompt-word-entry', roomPlayers[roomID][currentPlayerIndex[roomID]]);
            }

            if (leaderboards[roomID] && leaderboards[roomID][playerName] !== undefined) {
                leaderboards[roomID][playerName] += 1;
                io.to(roomID).emit('correct-guess', { playerName, nextPlayer: roomPlayers[roomID][currentPlayerIndex[roomID]] });
                io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);
                stopTurnTimer(roomID);
            }
        } else {
            socket.emit('wrong-guess');
        }
    });

    socket.on('change-name', ({ roomID, oldName, newName }, callback) => {
        if (!roomID || !oldName || !newName) {
            return callback({ success: false, message: 'Invalid data' });
        }

        const playersInRoom = roomPlayers[roomID];
        if (!playersInRoom) {
            return callback({ success: false, message: 'Room not found' });
        }

        const playerIndex = playersInRoom.indexOf(oldName);
        if (playerIndex === -1) {
            return callback({ success: false, message: 'Old name not found in room' });
        }

        const newNameWithID = `${newName}#${socket.id}`;
        if (playersInRoom.includes(newNameWithID)) {
            return callback({ success: false, message: 'Name already taken' });
        }

        playersInRoom[playerIndex] = newNameWithID;

        const score = leaderboards[roomID][oldName];
        delete leaderboards[roomID][oldName];
        leaderboards[roomID][newNameWithID] = score;

        io.to(roomID).emit('player-name-changed', { oldName, newName: newNameWithID });

        rooms[socket.id] = roomID;

        callback({ success: true });
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

    socket.on('send-chat-message', ({ playerName, message }) => {
        const roomID = rooms[socket.id];
        io.to(roomID).emit('chat-message', { playerName, message });
    });

    socket.on('initiate-vote-kick', ({ roomID, player, voter }) => {
        if (!roomPlayers[roomID] || !roomPlayers[roomID].includes(player)) return;

        const numPlayers = roomPlayers[roomID].length;
        if (numPlayers === 2) kickPlayer(roomID, player);
        else {
            if (!votes[roomID]) {
                votes[roomID] = {};
            }
            if (!votes[roomID][player]) {
                votes[roomID][player] = { count: 0, required: numPlayers - 1, voters: [] };
                io.to(roomID).emit('vote-initiated', { player, voter });
            }

            if (votes[roomID][player].voters.includes(voter)) return io.to(roomID).emit('vote-initiated', { player, voter });

            votes[roomID][player].count += 1;
            votes[roomID][player].voters.push(voter);

            io.to(roomID).emit('vote-progress', { player, votes: votes[roomID][player].count });

            if (votes[roomID][player].count >= votes[roomID][player].required) {
                kickPlayer(roomID, player);
            }
        }
    });

    const kickPlayer = (roomID, player) => {
        const playerIndex = roomPlayers[roomID].indexOf(player);
        if (playerIndex !== -1) roomPlayers[roomID].splice(playerIndex, 1);

        delete leaderboards[roomID][player];
        if (votes[roomID] && votes[roomID][player]) {
            delete votes[roomID][player];
        }

        io.to(roomID).emit('player-kicked', { player });
        io.to(roomID).emit('players-in-room', roomPlayers[roomID]);
        io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);

        for (const player in votes[roomID] || {}) {
            io.to(roomID).emit('vote-progress', { player, votes: 0 });
            delete votes[roomID][player];
        }

        if (Object.keys(votes[roomID] || {}).length === 0) {
            delete votes[roomID];
        }

        if (roomPlayers[roomID].length < 2) {
            delete drawingWords[roomID];
            stopTurnTimer(roomID);
        }
        if (roomPlayers[roomID].length === 0) {
            delete roomPlayers[roomID];
            delete leaderboards[roomID];
            delete currentPlayerIndex[roomID];
        } else if (roomPlayers[roomID].length >= 2) {
            if (currentPlayerIndex[roomID] >= roomPlayers[roomID].length) {
                currentPlayerIndex[roomID] = 0;
            }
            io.to(roomID).emit('prompt-word-entry', roomPlayers[roomID][currentPlayerIndex[roomID]]);
        }
    };

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
                
                if (roomPlayers[roomID].length < 2) {
                    delete drawingWords[roomID];
                    stopTurnTimer(roomID);
                }
                if (roomPlayers[roomID].length === 0) {
                    delete roomPlayers[roomID];
                    delete leaderboards[roomID];
                    delete currentPlayerIndex[roomID];
                    delete votes[roomID];
                } else {
                    delete leaderboards[roomID][playerName];

                    for (const player in votes[roomID] || {}) {
                        const vote = votes[roomID][player];
                        const voterIndex = vote.voters.indexOf(playerName);
                        if (voterIndex !== -1) {
                            vote.voters.splice(voterIndex, 1);
                            vote.count -= 1;
                        }
                        vote.required = roomPlayers[roomID].length - 1;

                        io.to(roomID).emit('vote-progress', { player, votes: vote.count });

                        if (vote.count >= vote.required) kickPlayer(roomID, player);
                    }

                    if (Object.keys(votes[roomID] || {}).length === 0) {
                        delete votes[roomID];
                    }

                    io.to(roomID).emit('update-leaderboard', leaderboards[roomID]);
                    if (currentPlayerIndex[roomID] >= roomPlayers[roomID].length) {
                        currentPlayerIndex[roomID] = 0;
                    }
                    io.to(roomID).emit('prompt-word-entry', roomPlayers[roomID][currentPlayerIndex[roomID]]);
                }
            }
        }

        delete rooms[socket.id];

        if (roomID && playerName) io.to(roomID).emit('player-left', { playerName, players: roomPlayers[roomID] });
    };
});

app.get('/', async (req, res, next) => {
    try {
        res.send({
            status: 201, message: "GuessPaint API running!",
            rooms, roomPlayers, drawingWords, leaderboards, currentPlayerIndex, votes
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