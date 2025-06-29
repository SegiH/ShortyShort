'use strict';

// Imports
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require("path");
const process = require("process");
const QRCode = require('qrcode');
const { writeFile } = require('fs/promises');
require('dotenv').config();
const app = express();

const defaultPort = 8080;

const HOST = '0.0.0.0';
const PORT = typeof process.env.PORT !== "undefined" ? process.env.PORT : defaultPort;

const allowDuplicates = (typeof process.env.ALLOW_DUPLICATES !== "undefined" && process.env.ALLOW_DUPLICATES === "true") ? true : false;
const baseURL = process.env.BASE_URL;
const dbFile = process.env.DB_FILE;
const CORSDomains = process.env.CORS_DOMAINS;
const shortCodeLength = process.env.SHORTCODE_LENGTH;

const corsOptions = {
	origin: JSON.parse(CORSDomains),
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	credentials: true
};

// I want to determine the index path dynamically because it will be used to serve the web app
let indexPath = "";
let isDist = false;

if (fs.existsSync(path.join(__dirname, '..', 'Web')) && fs.existsSync(path.join(__dirname, '..', 'Web', 'index.html'))) {
	indexPath = path.join(__dirname, '..', 'Web');
} else if (fs.existsSync(path.join(__dirname, '..', 'Web', 'dist')) && fs.existsSync(path.join(__dirname, '..', 'Web', 'dist', 'index.html'))) {
	isDist = true;
	indexPath = path.join(__dirname, '..', 'Web', 'dist');
} else {
	console.log("Unable to locate index.html. This is normal when running the DEV server.");
}

app.use(cors(corsOptions));

if (indexPath !== "") {
	app.use(express.static(indexPath));
}

//Default route
app.get('/', async (req, res) => {
	if (fs.existsSync(indexPath)) {
		res.sendFile(indexPath);
	} else {
		res.sendStatus(401);
	}
});

app.get('/AdminPasswordIsValid', async (req, res) => {
	const password = (typeof req.query.Password !== 'undefined' ? req.query.Password : null);

	if (password == null || password === "") {
		return res.send(["ERROR", "Password was not provided"]);
	}

	if (process.env.ADMIN_PASSWORD === password) {
		return res.send(["OK"]);
	} else {
		return res.send(["ERROR"]);
	}
});

app.get('/CreateShortyShort', async (req, res) => {
	let url = (typeof req.query.URL !== 'undefined' ? req.query.URL : null);
	let expirationDays = (typeof req.query.Expiration !== 'undefined' ? req.query.Expiration : null);

	if (url == null) {
		return res.send(["ERROR", "URL was not provided"]);
	}

	if (expirationDays == null) {
		return res.send(["ERROR", "Expiration was not provided"]);
	}

	await inactiveExpiredShortCodes();

	if (url.slice(-1) !== "/") {
		url += "/";
	}

	const qRCode = await QRCode.toDataURL(url);

	const db = getDB();

	// Duplicate check
	if (!allowDuplicates) {
		const exists = db.ShortCodes.filter((shortCodeItem) => {
			return shortCodeItem.URL === url && !isPast(shortCodeItem.Expiration);
		});

		if (exists.length === 1) {
			const shortURL = generateNewShortyShortURL(exists[0].ShortCode);
			return res.send(["OK", shortURL, qRCode]);
		}
	}

	// Generate short code
	let isUnique = false;

	let newShortCode = "";

	while (!isUnique) {
		newShortCode = generateRandomShortCode(shortCodeLength);

		const exists = db.ShortCodes.filter((shortCode) => {
			return (shortCode.ShortCode === newShortCode);
		});

		if (exists.length === 0) {
			isUnique = true;
		}
	}

	const newExpirationDate = new Date();
	newExpirationDate.setDate(newExpirationDate.getDate() + parseInt(expirationDays, 10));

	const shortURL = generateNewShortyShortURL(newShortCode);

	// New ShortyShort object
	const newShortCodeObj = {
		"ShortCode": newShortCode,
		"URL": url,
		"ShortURL": shortURL,
		"Expiration": newExpirationDate.getTime().toString(),
		"QRCode": qRCode,
		"CreatedOn": new Date().getTime().toString(),
		"Active": true
	};

	db.ShortCodes.push(newShortCodeObj);

	// Save to DB
	writeDB(db);

	return res.send(["OK", shortURL, qRCode]);
});

app.get('/GetShortyShort', async (req, res) => {
	const shortCode = (typeof req.query.ShortCode !== 'undefined' ? req.query.ShortCode : null);

	if (shortCode == null || shortCode === "") {
		return res.send(["ERROR", "Short code was not provided"]);
	}

	await inactiveExpiredShortCodes();

	const db = getDB();

	// Check if short code exists and has not expired
	const exists = db.ShortCodes.filter((shortCodeItem) => {
		return shortCodeItem.ShortCode === shortCode && shortCodeItem.Active == true;
	});

	if (exists.length > 1) { // this shouldn't ever happen
		return res.send(["ERROR", `More than one result was found for ${shortCode}. This shouldn't ever happen!`]);
	} else if (exists.length === 1) {
		// Every time that a short code is accessed  save a record
		if (typeof exists[0].History === "undefined") {
			exists[0].History = [];
		}

		const newHistoryAudit = {
			AccessTime: Date.now()
		};

		if (process.env.ADVANCED_ANALYTICS === "true") {
			const userAgent = req.headers['user-agent'];

			newHistoryAudit["UserAgent"] = userAgent;
		}

		exists[0].History.push(newHistoryAudit);

		writeDB(db);

		return res.send(["OK", exists[0].URL]);
	} else if (exists.length === 0) {
		return res.send(["ERROR", `Short code ${shortCode} was not found!`]);
	}
});

app.get('/GetShortyShorts', async (req, res) => {
	const password = (typeof req.get("SS_AUTH") !== 'undefined' ? req.get("SS_AUTH") : null);

	if (password !== process.env.ADMIN_PASSWORD) {
		return res.send(["ERROR", "Unauthorized"]);
	}

	// Make sure that user is allowed to access this endpoint
	if (process.env.ADMIN_ENABLED !== "true") {
		return res.sendStatus(401);
	}

	const db = getDB();

	let newBaseURL = baseURL;

	if (newBaseURL.slice(-1) !== "/") {
		newBaseURL += "/";
	}

	// Make sure that base url reflects bse url set in .env
	db.ShortCodes.map((shortCodeItem) => {
		if (shortCodeItem.ShortURL.slice(0, baseURL.length) !== newBaseURL) {
			shortCodeItem.ShortURL = newBaseURL + shortCodeItem.ShortURL.slice(baseURL.length + 1);
		}
	});

	return res.send(["OK", db.ShortCodes]);
});

app.get('/Test', async (req, res) => {
	if (process.env.ADMIN_ENABLED === "true") {
		return res.send(["OK"]);
	} else {
		return res.send(["ERROR"]);
	}
});

app.get('/UpdateShortyShort', async (req, res) => {
	const activeStatus = (typeof req.query.ActiveStatus !== 'undefined' ? req.query.ActiveStatus : null);
	const expirationMS = (typeof req.query.ExpirationMS !== 'undefined' ? req.query.ExpirationMS : null);
	const shortCode = (typeof req.query.ShortCode !== 'undefined' ? req.query.ShortCode : null);
	const password = (typeof req.get("SS_AUTH") !== 'undefined' ? req.get("SS_AUTH") : null);

	if (password !== process.env.ADMIN_PASSWORD) {
		return res.send(["ERROR", "Unauthorized"]);
	}

	if (shortCode === null) {
		return res.send(["ERROR", "Short code was not provided"]);
	}

	if (activeStatus === null && expirationMS === null) {
		return res.send(["ERROR", "Either ActiveStatus or ExpirationMS have to be provided"]);
	}

	const db = getDB();

	const thisShortCodeResult = db.ShortCodes.filter((thisShortCode) => {
		return (thisShortCode.ShortCode === shortCode);
	});

	if (thisShortCodeResult.length > 1) { // Shouldn't ever happen
		return res.send(["ERROR", `More than 1 result was found for short code ${shortCode}`]);
	} else if (thisShortCodeResult.length === 0) {
		return res.send(["ERROR", `Short code ${shortCode} was not found`]);
	} else if (thisShortCodeResult.length === 1) {
		const thisShortCode = thisShortCodeResult[0];

		if (activeStatus !== null) {
			thisShortCode.Active = activeStatus === "true" ? true : false;
		}

		if (expirationMS !== null) {
			thisShortCode.Expiration = expirationMS;
		}

		await writeDB(db);
	}

	return res.send(["OK"]);
});

// CATCH-ALL: Redirect all unmatched routes to index.html
// This enables client-side routing to handle paths like /short/abc123
app.get('*', (req, res) => {
	if (isDist) {
		res.sendFile(path.join(__dirname, '../Web/dist/index.html'));
	} else {
		res.sendFile(path.join(__dirname, '../Web/index.html'));
	}
});

const generateRandomShortCode = (shortCodeLength) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	let result = '';

	for (let i = 0; i < shortCodeLength; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}

	return result;
}

const generateNewShortyShortURL = (shortCode) => {
	let newURL = baseURL;

	if (newURL.slice(-1) !== "/") {
		newURL += "/";
	}

	newURL = `${newURL}short/${shortCode.toString().trim()}`;

	return newURL;
}

const getDB = () => {
	try {
		const data = fs.readFileSync(dbFile, 'utf8');

		return JSON.parse(data);
	} catch (e) {
		throw new Error(e.message);
	}
}

const inactiveExpiredShortCodes = async () => {
	let dbModified = false;

	db.ShortCodes.map((shortCodeItem) => {
		if (isPast(shortCodeItem.Expiration)) {
			shortCodeItem.Active = false;
			dbModified = true;
		} else if (typeof shortCodeItem.Active === "undefined") { // This shouldn't ever happen
			shortCodeItem.Active = true;
			dbModified = true;
		}
	});

	if (dbModified) {
		await writeDB(db);
	}
}

const isPast = timestamp => Number(timestamp) < Date.now();

const writeDB = async (newDB) => {
	await writeFile(dbFile, JSON.stringify(newDB))
}

const db = getDB();

// When "validate" argument is passed, run validation tests
if (process.argv.length > 2 && process.argv[2] === "validate") {
	const dbExists = fs.existsSync(dbFile);

	if (!dbExists) {
		console.log("ERROR!!! Database file database.json was not found.");
		process.exit(1);
	}

	if (typeof db.ShortCodes === "undefined") {
		console.log("ERROR!!! ShortCodes attribute is missing");
		process.exit(1);
	}

	if (baseURL == "") {
		console.log("ERROR!!! Base URL is not set");
		process.exit(1);
	}

	if (process.env.ADMIN_ENABLED === "true" && process.env.ADMIN_PASSWORD === "12345") {
		console.log("ERROR!!! Admin is enabled but the password was not changed. Please set an admin password");
		process.exit(1);
	}
}

inactiveExpiredShortCodes();

try {
	app.listen(PORT, HOST);
	console.log(`Running on http://${HOST}:${PORT}`);
} catch (e) {
	console.log("ERROR WAS CAUGHT!")
}