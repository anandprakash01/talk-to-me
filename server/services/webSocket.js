const ws = require("ws");
const jwt = require("jsonwebtoken");

// =====================WebSocket Server
const createWebSocketServer = server => {
  const wss = new ws.WebSocketServer({server});
  //   const wss = new ws.WebSocketServer({noServer: true});

  server.on("upgrade", (request, socket, head) => {
    // Check for cookies in the request headers
    const cookies = request.headers.cookie;

    if (cookies) {
      // Parse and validate cookies
      // If valid, proceed with the WebSocket connection
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit("connection", ws, request);
      });
    } else {
      // No cookies present, terminate the connection
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      console.log("WebSocket connection terminated: No cookies passed");
    }

    // wsServer.handleUpgrade(request, socket, head, socket => {
    //   wsServer.emit("connection", socket, request);
    // });
  });

  wss.on("connection", (connection, req) => {
    // console.log("WSS connected");
    // connection.send("Hey:)");
    // console.log(req.headers);

    //read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookieString = cookies.split(";").find(str => str.startsWith("token="));

      if (tokenCookieString) {
        const token = tokenCookieString.split("=")[1];
        if (token) {
          // console.log(token);
          // verify JWT
          jwt.verify(token, jwtSecretKey, {}, (err, userData) => {
            if (err) {
              // console.error("Token verification failed while connecting:", err);

              // for invalid token
              connection.send(JSON.stringify({error: "Invalid token"}));
              connection.terminate();
              return;
            }
            // console.log(userData);
            const {userId, username} = userData;
            connection.userId = userId;
            connection.username = username;
          });
        }
      }
      // console.log(tokenCookieString);
    }
    connection.isAlive = true;

    const notifyAboutOnlinePeople = () => {
      // notify everyone about online people
      // console.log([...wss.clients].map(c => c.userId));
      [...wss.clients].forEach(client => {
        // this client is the same as connection but this will give store the all the online clients
        client.send(
          JSON.stringify({
            online: [...wss.clients].map(c => ({
              userId: c.userId,
              username: c.username,
            })),
          })
        );
      });
    };

    // Sending a ping to the client every 5 seconds
    connection.timer = setInterval(() => {
      connection.ping(); //every 5 sec it will ping to client
      connection.deathTimer = setTimeout(() => {
        // console.log("dead");
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlinePeople();
      }, 3000);
    }, 10000);

    connection.on("pong", () => {
      // after receiving the pong message this will clear deathTimer
      clearTimeout(connection.deathTimer);
    });

    // to receive the message
    connection.on("message", async (messageData, isBinary) => {
      // console.log(msg, isBinary);
      // console.log(messageData.toString());

      messageData = JSON.parse(messageData.toString());

      const {recipient, text, file} = messageData;
      let filename = null;
      if (file) {
        // console.log("size: ", file.data.length);

        //changing file name and saving it
        const parts = file.name.split(".");
        const ext = parts[parts.length - 1]; //extension
        filename = Date.now() + "." + ext;
        const path = __dirname + "/uploads/" + filename;
        // const bufferData = new Buffer(file.data, "base64");

        // console.log(file.data);
        // we need to remove the front [data:{type};base64,{filedata}]
        const bufferData = Buffer.from(file.data.split(",")[1], "base64");

        fs.writeFile(path, bufferData, () => {
          console.log("file saved: " + path);
        });
      }

      if (recipient && (text || file)) {
        //create message in database
        const messageDoc = await Messages.create({
          sender: connection.userId,
          recipient,
          text,
          file: file ? filename : null,
        });

        // sent message to other person
        // user can be logged in to many devices
        [...wss.clients]
          .filter(c => c.userId === recipient && c.isAlive)
          .forEach(c => {
            c.send(
              JSON.stringify({
                text,
                file: file ? filename : null,
                sender: connection.userId,
                recipient,
                _id: messageDoc._id,
              })
            );
          });
      }
    });

    //notify everyone about online people
    notifyAboutOnlinePeople();
  });

  return wss;
};
module.exports = createWebSocketServer;
