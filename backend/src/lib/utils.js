import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

export const generateToken = (userId, res) => {

    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn:"7d"
    })

    res.cookie("jwt",token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, //prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
}

export const generateEmailToken = (userInfo) => {
  const payload = {
    fullName: userInfo.fullName,
    email: userInfo.email,
    password: userInfo.password,  // hashed password
  };
  
  const token = jwt.sign({ userInfo }, process.env.JWT_SECRET_EMAIL, {
    expiresIn: '15m',//change to 15 minutes
  });

  return token;
};

export const sendConfirmationEmail = async (email, token) => {
  // Base confirmation URL (adjust host/port for production)
  const confirmationBaseUrl = "http://localhost:5001/api/auth/check/email/";

  // Build full confirmation URL with token
  const confirmationUrl = `${confirmationBaseUrl}${token}`;

  // Create transporter object
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your SMTP server
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Confirme su correo electrónico',
    html: `
      <h1>Confirme su correo electrónico</h1>
      <p>Seleccione el siguiente botón para confirmar su correo:</p>
      <a href="${confirmationUrl}">Confirmar Correo</a>
      <p>Este link se destruirá dentro de 15 minutos.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente:', info.response);
  } catch (error) {
    console.error('Error enviando el correo:', error);
    throw error; // Rethrow or handle accordingly
  }
};
