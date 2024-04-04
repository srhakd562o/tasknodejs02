const http = require("http");
const fs = require("fs");

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;
    const body = [];

    if (url === "/") {
        fs.readFile("messages.txt", { encoding: "utf-8" }, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end("Internal Server Error");
                return;
            }
            console.log(`data from file` + data);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write("<html>");
            res.write("<head><title>Enter Message</title></head>");
            res.write(`<body>${data}</body>`);
            res.write(
                `<body><form action="/messages" method = "POST"><input type="text" name="message"/><button  
                type = "submit">Send</button></form></body>`
            );
            res.write("</html>");
            return res.end();
        });
    } else if (url === "/messages" && method === "POST") {
        req.on("data", (chunk) => {
            body.push(chunk);
        });

        return req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            console.log('parsedBody>>>>>>>>', parsedBody);
            const message = parsedBody.split("=")[1];
            fs.writeFile("messages.txt", message + "\n", (err) => {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end("Internal Server Error");
                    return;
                }
                console.log(`inside fs.writeFile`);
                // Redirect to homepage after adding message
                res.writeHead(302, { 'Location': '/' });
                return res.end();
            });
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write("<html>");
        res.write("<head><title>Page Not Found</title></head>");
        res.write("<body><h1>404 - Page Not Found</h1></body>");
        res.write("</html>");
        res.end();
    }
};

const server = http.createServer(requestHandler);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
