import express from 'express';
import http from 'http';
import { v4 } from 'uuid'; // for unique id
import axios from "axios"
import moment from 'moment';
import "dotenv/config";

const app = express();
const uuid = v4();

app.use(async (req, res, next) => {
    const clientAddress = req.connection.remoteAddress;
    const clientPort = req.connection.remotePort;
    const clientId = uuid;

    const client_address = clientAddress.replace("::ffff:", "")

    const geoApiUrl = `http://ip-api.com/json/${client_address}`;
    const geoResponse = await axios.get(geoApiUrl);

    const { country, lat, lon } = geoResponse?.data || {};

    console.log("new client connected: ", {
        clientAddress: clientAddress.replace("::ffff:", ""),
        clientPort: clientPort,
        clientId: clientId,
    });

    res.send(`

    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP Detector</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>

<body>

    <style>
        * {
            margin: 0;
            padding: 0;
            font-family: "Space Mono", monospace;
            box-sizing: border-box;
        }

        body {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1em;
            background-color: #151515;
            color: #f5f5f5;
        }

        .container {
            background-color: #252525;
            width: 250px;
            height: fit-content;
            border: 2px solid #f5f5f5;
            padding: 1em;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 1em;
        }

        h3{
            padding: 0 1em;
            text-align: center;
        }
    </style>

    <h3 id="date"></h3>
    <div class="container">
        <p>ip address: ${clientAddress.replace("::ffff:", "")}</p>
        <p>port: ${clientPort}</p>
        <p>client_id: ${clientId}</p>
        <p>country: ${country || "unknown"}</p>
        <p>latitude: ${lat || "unknown"}</p>
        <p>longitude: ${lon || "unknown"}</p>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
    <script>
            setInterval(() => {
                let currentTime = moment().format("dddd MMMM Do YYYY, h:mm:ss a");
    
                document.getElementById("date").innerText = currentTime;
            }, 1);
    </script>

</body>

</html>
    `)

    res.locals.clientId = clientId;
    next();
});

const server = http.createServer(app);

server.on("error", (err) => {
    console.error("server error:", err.message);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});