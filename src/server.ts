import "dotenv/config"; // 👈 must be first
import app from "./app.js";
import prisma from "./prisma/client.js";

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await prisma.$connect();

        console.log("Connected to DB successfully");

        app.listen(port, () => {
            console.log("Server listening on port", port);
        });
    } catch (err) {
        console.error("Failed to connect to DB", err);
        process.exit(1);
    }
}

startServer();
