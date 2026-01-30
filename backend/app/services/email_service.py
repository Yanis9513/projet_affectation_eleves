import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
import asyncio
from app.config import settings

class EmailService:
    def __init__(self):
        # Get email config from settings
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.sender_email = settings.SENDER_EMAIL
        self.sender_password = settings.SENDER_PASSWORD
        self.use_tls = settings.SMTP_USE_TLS

    def send_email_sync(self, to_email: str, subject: str, html_content: str):
        """Send email synchronously (blocking)"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender_email
            msg['To'] = to_email

            # Attach HTML content
            msg.attach(MIMEText(html_content, 'html'))

            # Send email
            if self.use_tls:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    if self.sender_password:
                        server.login(self.sender_email, self.sender_password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    if self.sender_password:
                        server.login(self.sender_email, self.sender_password)
                    server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending email to {to_email}: {str(e)}")
            return False

    async def send_email_async(self, to_email: str, subject: str, html_content: str):
        """Send email asynchronously (non-blocking)"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.send_email_sync, to_email, subject, html_content)

    def send_student_enrollment_email(self, student_email: str, student_name: str, project_title: str, teacher_name: str):
        """Send email when student is enrolled in a project"""
        subject = f"Vous avez été inscrit au projet: {project_title}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h1 style="color: #1e40af; text-align: center;">Inscription au Projet</h1>
                    
                    <p>Bonjour <strong>{student_name}</strong>,</p>
                    
                    <p>Vous avez été inscrit au projet suivant :</p>
                    
                    <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #1e40af;">{project_title}</h2>
                        <p><strong>Professeur :</strong> {teacher_name}</p>
                    </div>
                    
                    <p>Connectez-vous à votre tableau de bord pour :</p>
                    <ul>
                        <li>Consulter les détails du projet</li>
                        <li>Soumettre vos préférences si nécessaire</li>
                    </ul>
                    
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                        <small>
                            Cet email a été envoyé automatiquement par le système de gestion des projets ESIEE.<br>
                            Si vous avez des questions, contactez votre professeur.
                        </small>
                    </p>
                </div>
            </body>
        </html>
        """
        
        return self.send_email_sync(student_email, subject, html_content)


# Create singleton instance
email_service = EmailService()
