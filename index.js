var dotenv = require("dotenv")
dotenv.config()

var express = require('express');
var cors = require('cors');
const connect = require('./db.config');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connect();

const userRouter = require('./routes/user.routes');

app.get('/', (req, res) => {
    res.send('Server running successfully');
});

app.use('/user', userRouter);

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server started listening to ${port}`);
});