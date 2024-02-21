// Load environment variables from a .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const handlebars = require('handlebars');
const fs = require('fs');

// Create an Express application
const app = express();

// Parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
    // Send the index.html file as the response
    res.sendFile(__dirname + '/index.html');
});

// Route to handle email sending
app.post('/send-email', (req, res) => {
    // Extract email data from the request body
    const { to, subject, text } = req.body;

    // Check if all required fields are provided
    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Invalid argument exception' });
    }

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SMTP_EMAIL, 
            pass: process.env.SMTP_PASSWORD 
        }
    });

    // Read the email template file
    const emailTemplateSource = fs.readFileSync(__dirname + '/email-template.hbs', 'utf8');

    // Compile the template using Handlebars
    const template = handlebars.compile(emailTemplateSource);

    // Replace placeholders in the template with actual data
    const html = template({ subject, text });

    // Email options
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: to, 
        subject: subject,
        html: html 
    };

    // Send the email using nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Error occurred, email not sent.'); 
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent successfully.'); 
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
