require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors()); // allows frontend to make request to back end
app.use(express.json());

app.get()
