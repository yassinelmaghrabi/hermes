package helpers

import "gopkg.in/gomail.v2"

type Sender interface {
	SendPasswordResetEmail(to, resetLink string) error
}
type smtpSender struct {
	dialer *gomail.Dialer
}

func InitSMTPSender(host string, port int, username, password string) Sender {
	return &smtpSender{
		dialer: gomail.NewDialer(host, port, username, password),
	}
}

func (s *smtpSender) SendPasswordResetEmail(to, resetLink string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "noreply@hermes.com")
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Password Reset Request")
	m.SetBody("text/html", GetEmailBodyContent(resetLink))

	return s.dialer.DialAndSend(m)
}
