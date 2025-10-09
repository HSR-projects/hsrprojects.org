const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // npm install node-fetch

const app = express();
const PORT = 3000;

// Replace with your secret key
const RECAPTCHA_SECRET = '6Le0YeQrAAAAADydYsw8NoeIvfqMDfHyI8_5AFBE';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve captcha page as the landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname + 'captcha.html');
});

// Handle form submission from captcha.html
app.post('/verify', async (req, res) => {
  const token = req.body['g-recaptcha-response'];
  if(!token){
    return res.send('CAPTCHA not completed. <a href="/">Try again</a>');
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`;
  
  try {
    const response = await fetch(verificationUrl, { method: 'POST' });
    const data = await response.json();

    if(data.success){
      // CAPTCHA passed → redirect to index.html
      res.redirect('/index.html');
    } else {
      res.send('CAPTCHA verification failed. <a href="/">Try again</a>');
    }
  } catch (err) {
    res.send('Error verifying CAPTCHA. <a href="/">Try again</a>');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
