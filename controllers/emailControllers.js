const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { isEmail } = require("validator");
const path = require("path");
const fs = require("fs");

dotenv.config();

const sendEmail = expressAsyncHandler(async (req, res) => {
  const { email, name, items, totalAmount } = req.body;

  // console.log("Received email request:", req.body); // Debug log

  try {
    // Validate inputs
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Load and customize email template
    const templatePath = path.resolve("public", "index.html");
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");

    // Generate HTML for cartData
    let orderDetails = "";
    if (items && Array.isArray(items)) {
      orderDetails = items
        .map(
          (item) => `
            <tr>
          <td>
          <img src="${item.image}" alt="${
            item.name
          }" style="width: 100px; height: auto; border-radius: 8px;">
        </td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₹${(item.price * item.quantity).toFixed(2)}</td>

            </tr>
          `
        )
        .join("");
    }

    emailTemplate = emailTemplate.replace(/{{name}}/g, name || "Customer");
    emailTemplate = emailTemplate.replace(/{{orderDetails}}/g, orderDetails);
    emailTemplate = emailTemplate.replace(
      /{{totalAmount}}/g,
      totalAmount ? `₹${totalAmount.toFixed(2)}` : "N/A"
    );

    // Prepare email content
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Order Confirmation",
      html: emailTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Detailed email sending error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.toString(),
      stack: error.stack,
    });
  }
});

module.exports = { sendEmail };
