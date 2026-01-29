import app from "./app.js";

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`💡 Suggestion: You might have another terminal running "npm run dev". Please close it and try again.`);
        process.exit(1);
    } else {
        console.error("❌ Backend error:", e);
    }
});
