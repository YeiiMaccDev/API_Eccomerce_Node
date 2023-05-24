
const express = require('express')
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;

        this.paths = {
            auth: '/api/auth',
            categories: '/api/categories',
            products: '/api/products',
            search: '/api/search',
            users: '/api/users',
            uploads: '/api/uploads'
        }

        // Connect to database
        this.connectDB();

        // Middleware
        this.middlewares();


        this.routes();
    }

    async connectDB() {
        await dbConnection();
    }

    middlewares() {

        // CORS
        this.app.use(cors());

        // Reading and parsing of received data.
        this.app.use(express.json());

        // Public directory
        this.app.use(express.static('public'))

        // FileUpload 
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
    }


    routes() {
        this.app.use(this.paths.auth, require('../routes/auth'))
        this.app.use(this.paths.categories, require('../routes/category'))
        this.app.use(this.paths.products, require('../routes/product'))
        this.app.use(this.paths.search, require('../routes/search'))
        this.app.use(this.paths.users, require('../routes/user'))
        this.app.use(this.paths.uploads, require('../routes/upload'))
    }


    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto: ', this.port)
        });
    }
}

module.exports = Server;