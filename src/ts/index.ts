// Modules
import express from 'express';
import session from 'express-session';

// Named imports
import { Logger } from 'tslog';

// URI route imports
import teapot from './routes/teapot';
import resources from './routes/resources';
import auth from './routes/auth';

// Initializing tslog logger (general log)
const log: Logger = new Logger({ name: "genLog" });

// Setting port
const PORT = process.env.PORT;

// Adding modules to app
const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());

// Other routes
app.use(teapot);
app.use(resources);
app.use(auth);

// Log the port to the console.
app.listen(
    PORT,
    () => log.info(`API is live on port: ${PORT}`)
);