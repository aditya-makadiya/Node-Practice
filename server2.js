const http = require('http');
const fs = require('fs').promises; 
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'file.json');

// Reading data from file
const readData = async () => {
    const data = await fs.readFile(DATA_FILE);
    return JSON.parse(data);
};

// Writing data to file
const writeData = async (data) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

// Updating data in file
const updateData = async (id, newData) => {
    const data = await readData();
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = newData;
        await writeData(data);
        return data[index];
    }
    return null;
};

// Deleting data from file
const deleteData = async (id) => {
    const currentData = await readData();
    const newData = currentData.filter(item => item.id !== id);
    await writeData(newData);
    return newData;
};

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === "/get") {
        const data = await readData();
        res.statusCode = 200;
        res.end(JSON.stringify(data));

    } else if (req.method === 'POST' && req.url === "/post") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const newData = JSON.parse(body);
            const currentData = await readData();
            currentData.push(newData);
            await writeData(currentData);
            res.statusCode = 201;
            res.end(JSON.stringify(newData));
        });
    } else if (req.method === 'PUT' && req.url.startsWith("/put/")) {
        const id = parseInt(req.url.split('/').pop());
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const updatedData = JSON.parse(body);
            const result = await updateData(id, updatedData);
            if (result) {
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ message: 'Data not found' }));
            }
        });
    } else if (req.method === 'DELETE' && req.url.startsWith("/delete/")) {
        const id = parseInt(req.url.split('/').pop());
        const result = await deleteData(id);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    } else {
        res.statusCode = 405;
        res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});