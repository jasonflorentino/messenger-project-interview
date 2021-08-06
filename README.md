# Messenger

A one-to-one realtime chat app.

## Initial Setup

### Database

Create the PostgreSQL database (these instructions may need to be adapted for your operating system):

```
psql
CREATE DATABASE messenger;
\q
```

### Server
Create a `.env` file in the server directory and add your session secret (this can be any string):

```
SESSION_SECRET = "your session secret"
```

Update `db.js` to connect with your local PostgreSQL set up. The [Sequelize documentation](https://sequelize.org/master/manual/getting-started.html) can help with this.  
Alternatively you can set a `DATABASE_URL` in `.env`:  
```bash
DATABASE_URL=Your Connection URI
```

In the server folder, install dependencies and then seed the database:

```bash
cd server
npm install
npm run seed
```

### Client
In the client folder, install dependencies:

```bash
cd client
npm install
```
Set environment variables:
- Create `.env` in the /client directory
- Set the server url
```bash
REACT_APP_SERVER_URL=<Your server URL>
```

### Running the Application Locally

In one terminal, start the front end:

```bash
cd client
npm start
```

In a separate terminal, start the back end:

```bash
cd server
npm run dev
```
