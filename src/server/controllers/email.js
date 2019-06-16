
const config = require('../config.js');

module.exports = class EMail {    

    static async sendEmail(data){
        var mailgun = require('mailgun-js')({apiKey: config.MAILGUN_KEY, domain: config.MAILGUN_DOMAIN});
           
        if(!data){
            var data = {
                from: 'Default <no-reply@andrewvc.net>',
                to: 'andrew@andrewvc.net',
                subject: 'Hello',
                text: 'Testing some Mailgun awesomeness!'
            };
        }
        mailgun.messages().send(data, function (error, body) {
            if(error){
                console.log(`📭   Mailgun Error: `, error);
            }else{
                console.log(`📬   Mail sent: `, body);
            }
        });
    }
}