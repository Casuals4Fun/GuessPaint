export function generateUniqueRoomCode(rooms) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    const generateCode = () => {
        code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    };

    generateCode();

    while (Object.values(rooms).includes(code)) {
        generateCode();
    }

    return code;
}