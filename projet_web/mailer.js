import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    auth: {
        user: '3a13e25baec7f84990a98e62553238dc',
        pass: '2773eca276f6cfeaec09263f44ef8919'
    }
});


export async function envoyerMail(destinataire, objet, message) {
    const mailOptions = {
        from: '"Mangathèque"', // ← à changer si domaine pas encore validé
        to: destinataire,
        subject: objet,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email envoye a ${destinataire}`);
    } catch (err) {
        console.error(`Erreur lors de l'envoi a ${destinataire}:`, err);
    }
}

export default transporter;