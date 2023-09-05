/*
Requirements to run this script:
1. Install Node.js: Download and install from https://nodejs.org/
2. Install nodemailer package: Run `npm install nodemailer` in the terminal
3. Run the script: Use `node <script_name>.js` in the terminal

This script allows you to create a list of items and send it to one or more email addresses.
It uses Gmail's SMTP server for sending emails, so you'll need a Gmail or Google Workspace account.
If you have two-step verification enabled for your account, you'll need to generate an app-specific password.
*/

// Import required modules
const readline = require('readline');
const nodemailer = require('nodemailer');

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to send the email
function sendEmail(senderEmail, senderPassword, recipientEmails, theList) {
  // Configure the email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPassword
    }
  });

  // Define email options
  const mailOptions = {
    from: senderEmail,
    to: recipientEmails.join(", "),
    subject: 'Your List',
    text: 'Here is your list:\n' + theList.join("\n")
  };

  // Send the email
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent:', info.response);
      askForRestart(senderEmail, senderPassword);
    }
  });
}

// Function to ask if the user wants to restart the program
function askForRestart(senderEmail, senderPassword) {
  rl.question('The list has been sent. Do you want to create a new list? (yes/no): ', function(restart) {
    if (restart.toLowerCase() === 'yes') {
      rl.question('Do you want to send from the same email account? (yes/no): ', function(sameAccount) {
        if (sameAccount.toLowerCase() === 'yes') {
          main(senderEmail, senderPassword);
        } else {
          main();
        }
      });
    } else {
      console.log('Exiting the program.');
      rl.close();
    }
  });
}

// Main function
function main(senderEmail = null, senderPassword = null) {
  // If sender's email and password are not provided, ask for them
  if (!senderEmail || !senderPassword) {
    rl.question('Enter your email address (either gmail.com or a custom Google Workspace account): ', function(email) {
      console.log('Note: If you have two-step verification enabled, you\'ll need to generate an application-specific password.');
      console.log('Refer to this link to generate an app-specific password: https://support.google.com/mail/answer/185833?hl=en');
      rl.question('Enter your email password or app-specific password: ', function(password) {
        senderEmail = email;
        senderPassword = password;
        main(senderEmail, senderPassword);
      });
    });
    return;
  }

  // Ask for recipient email addresses
  rl.question('Enter the email addresses to send the list to (comma-separated): ', function(recipientEmailsStr) {
    const recipientEmails = recipientEmailsStr.split(',').map(email => email.trim());

    let theList = [];
    // Function to ask for list entries
    function askForListEntry() {
      rl.question('Enter a value for the list (comma-separated, or \'x\' to finish): ', function(entriesStr) {
        if (entriesStr === 'x') {
          rl.question(`Do you want to send the list to ${recipientEmailsStr}? (yes/no): `, function(sendIt) {
            if (sendIt.toLowerCase() === 'yes') {
              sendEmail(senderEmail, senderPassword, recipientEmails, theList);
            } else {
              askForRestart(senderEmail, senderPassword);
            }
          });
        } else if (entriesStr.includes(',')) {
          // If input contains commas, extend the list with all values
          theList.push(...entriesStr.split(',').map(entry => entry.trim()));
          askForListEntry();
        } else {
          // If input is a single value, append it to the list
          theList.push(entriesStr.trim());
          askForListEntry();
        }
      });
    }

    askForListEntry();
  });
}

// Entry point of the script
main();
