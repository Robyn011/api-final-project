const http = require('http'); //This line imports the built-in http module from Node.js, 
                              //which allows you to create an HTTP server.


const fs = require('fs');//This line imports the built-in fs (file system) module, which 
                         //provides functions to work with the file system,
                         //such as reading or writing files.


const { parse } = require('url');//This line imports the parse method from the built-in url 
                                 //module. The parse method is used to parse URLs and 
                                 //extract useful information such as the path or query 
                                 //parameters.

const PORT = 3000; //This defines the port number the server will 
                   //listen on, which in this case is set to 3000.


let items = []; //This initializes an empty array called items. It's 
                //meant to store data, such as user inputs or items related 
                //to the server's functionality.


const server = http.createServer((req, res) => {
    const url = parse(req.url, true);
    const method = req.method;
    const headers = { 'Content-Type': 'application/json' };

    if (url.pathname === '/items' && method === 'GET') { // "GET" retrieves the items in the list
                                                         // Checks if the method is "GET" if so, it'll do the task needed
        res.writeHead(200, headers);
        res.end(JSON.stringify(items));
    } else if (url.pathname === '/items' && method === 'POST') { // "POST" adds a new item in the file
       
        let body = '';
        req.on('data', chunk => body+= chunk.toString());
        req.on('end', () => {
            const newItem = JSON.parse(body);
            items.push(newItem);
            saveItems(res, 201, newItem, headers);
        });
    } else if (url.pathname.startsWith('/items/') && method === 'PUT') { // "PUT" updates the file
        // Update an item by ID
        const id = url.pathname.split('/')[2];
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        /* req.on('data', ...): This sets up an event listener on the req (request) object for the 'data' event.
         This event is emitted whenever a piece (chunk) of data is received.
         chunk: Each time the 'data' event is triggered, a piece of the incoming data (a chunk) is passed to the callback function.
         body += chunk.toString(): The chunk is converted to a string (if it's not already), and then appended to the body variable, 
         building up the entire request body as the chunks arrive. */
        req.on('end', () => { 
            const updatedItem = JSON.parse(body);
            const index = items.findIndex(item => item.id == id);
            if (index !== -1) {
                items[index] = updatedItem;
                saveItems(res, 200, updatedItem, headers);
            } else {
                res.writeHead(404, headers);
                res.end(JSON.stringify({ message: 'Item not found' }));
            }
        });
    } else if (url.pathname.startsWith('/items/') && method === 'DELETE') { // "DELETE" removes an item from the file/list
        // Delete an item by ID
        const id = url.pathname.split('/')[2];
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) { // if the item does exist (if item index !< 0)
            const deletedItem = items.splice(index, 1);
            saveItems(res, 200, deletedItem, headers);
        } else {
            res.writeHead(404, headers);
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else { // if you aren't able to do any of those things, then show message "route not found"
        res.writeHead(404, headers);
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

const saveItems = (res, statusCode, data, headers) => {
    fs.writeFile('items.json', JSON.stringify(items), err => {
        if (err) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ message: 'Server Error' }));
        } else {
            res.writeHead(statusCode, headers);
            res.end(JSON.stringify(data));
        }
    });
};

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
