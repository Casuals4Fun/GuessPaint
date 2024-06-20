export function generateUniqueRoomCode(socketRoom) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    const generateCode = () => {
        code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    };

    generateCode();

    while (Object.values(socketRoom).includes(code)) {
        generateCode();
    }

    return code;
}