package helpers

import (
	"crypto/rand"
	"encoding/base64"
	"time"
)

func GetEmailBodyContent(resetLink string) string {
	return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Password Reset Request</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						line-height: 1.6;
						color: #333;
						background-color: #f4f4f4;
						margin: 0;
						padding: 0;
					}
					.container {
						max-width: 600px;
						margin: 20px auto;
						padding: 20px;
						background-color: #ffffff;
						border-radius: 8px;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
					}
					h2 {
						color: #4a4a4a;
						border-bottom: 2px solid #007bff;
						padding-bottom: 10px;
					}
					.btn {
						display: inline-block;
						padding: 12px 24px;
						background-color: #9266f7;
						color: #ffffff;
						text-decoration: none;
						border-radius: 5px;
						font-weight: bold;
						transition: background-color 0.3s ease;
					}
					.btn:hover {
						background-color: #0056b3;
					}
					.link {
						word-break: break-all;
						color: #007bff;
					}
					.footer {
						margin-top: 20px;
						padding-top: 20px;
						border-top: 1px solid #eee;
						font-size: 0.9em;
						color: #666;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h2>Password Reset Request</h2>
					<p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
					<p>To reset your password, please click the button below:</p>
					<p style="text-align: center;">
						<a href="` + resetLink + `" class="btn">Reset Password</a>
					</p>
					<p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
					<p class="link">` + resetLink + `</p>
					<p><strong>Note:</strong> This link will expire in 20 minutess for security reasons.</p>
					<p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
					<div class="footer">
						<p>Best regards,<br>Hermes Team</p>
						<p>© ` + time.Now().Format("2006") + ` Hermes. All rights reserved.</p>
					</div>
				</div>
			</body>
		</html>
	`
}

func GenerateRandomToken(length int) string {
	b := make([]byte, length)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
