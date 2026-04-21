{
  "name": "manto-server",
  "version": "2.0.0",
  "description": "MANTO Atacado — Backend API + Stripe + MongoDB",
  "main": "MANTO_Server.js",
  "scripts": {
    "start": "node MANTO_Server.js",
    "dev": "nodemon MANTO_Server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "stripe": "^14.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
