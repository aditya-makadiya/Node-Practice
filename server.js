const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000;
const DATA_FILE = path.join(__dirname,'file.json');

//Reading data from file
const readData = () =>{
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

//Writing data to file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2));
}

// Updating data in file
const updateData = (id, newData) => {
    const data = readData();
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = newData;
        writeData(data);
        return data[index];
    }
    return null;
}

// Deleting data from file
const deleteData = (id) => {
    const currentData = readData();
    const newData = currentData.filter(item => item.id !== id);
    writeData(newData);
    return newData;
}

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === "/get") {
        const data = readData();
        res.statusCode = 200;
        res.end(JSON.stringify(data));

    }
    
    else if (req.method === 'POST' && req.url === "/post") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); 
        });
        req.on('end', () => {
            const newData = JSON.parse(body);
            const currentData = readData();
            currentData.push(newData); 
            writeData(currentData);
            res.statusCode = 201;
            res.end(JSON.stringify(newData));
        });
    }
    
    else if (req.method === 'PUT' && req.url.startsWith("/put/")) {
        const id = parseInt(req.url.split('/').pop());
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedData = JSON.parse(body);
            const result = updateData(id, updatedData);
            if (result) {
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ message: 'Data not found' }));
            }
        });
    } 
    
    else if (req.method === 'DELETE' && req.url.startsWith("/delete/")) {
        const id = parseInt(req.url.split('/').pop()); 
        const result = deleteData(id);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    } 
    
    else {
        res.statusCode = 405;
        res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
