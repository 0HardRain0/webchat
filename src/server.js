import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');


const server = http.createServer(app);
// 2개의 프로토콜을 같은 포트에서 공유, http서버가 필요한 이유는 views,static files, home, redirection을 사용하기 때문
const wss = new WebSocket.Server({ server });

function onSocketClose(){
    console.log("Disconnected from the Browser ❌");
}

const sockets = [];

//메세지 전송
wss.on("connection",(socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser ✔");
    socket.on("close", onSocketClose);
    // socket.on("message",(message) => {
    //     // message를 그냥 보내버리면 blob이라고 뜨므로 toString("utf-8")을 추가하여 콘솔에 올바르게 보이게 한다.
    //     console.log(message.toString("utf-8"));
    //     sockets.forEach((aSocket) => aSocket.send(message.toString()));
    // });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type){
            case "new_message":
                sockets.forEach((aSocket) =>
                aSocket.send(`${socket.nickname}: ${message.payload}`)
                );
                //break를 추가하지 않으면 메세지 부분이 닉네임이 되어버림
                break;
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

server.listen(3000, handleListen);