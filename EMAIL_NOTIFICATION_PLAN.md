# 📧 Email Notification System - Implementation Plan

## Overview
Send invitation emails to students when they're added to a project, with a link to create an account and fill out the preference form.

---

## 🎯 Goals

1. **Automatic Invitations**: When a teacher creates a project and uploads students, send emails automatically
2. **Account Creation Prompt**: If student doesn't have an account, email includes signup link
3. **Form Link**: Direct link to the preference form for the specific project
4. **Reminder System**: Optional reminders for students who haven't filled out the form

---

## 📋 Required Information

### For Each Student:
- ✅ **Email** (mandatory) - The only required field
- ✅ **Name** (optional) - Auto-generated from email if not provided
- ✅ **Project ID** - To generate the form link
- ✅ **Project Name** - For the email subject/body
- ✅ **Teacher Name** - Who created the project
- ✅ **Deadline** (optional) - When to fill out the form

---

## 🔧 Technical Implementation

### 1. Backend Email Service

**File:** `backend/app/services/email.py`

```python
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.config import settings

class EmailService:
    def __init__(self):
        self.config = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=587,
            MAIL_SERVER="smtp.gmail.com",
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False
        )
        self.mail = FastMail(self.config)
    
    async def send_project_invitation(
        self,
        student_email: str,
        student_name: str,
        project_name: str,
        project_id: int,
        teacher_name: str,
        deadline: str = None
    ):
        """Send invitation email to student"""
        
        form_url = f"{settings.FRONTEND_URL}/form/{project_id}"
        signup_url = f"{settings.FRONTEND_URL}/login"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0066CC; color: white; padding: 20px; text-align: center;">
                <h1>ESIEE Paris - Nouveau Projet</h1>
            </div>
            
            <div style="padding: 20px;">
                <p>Bonjour {student_name},</p>
                
                <p>Vous avez été ajouté(e) au projet <strong>{project_name}</strong> par {teacher_name}.</p>
                
                <p><strong>Action requise :</strong> Veuillez remplir le formulaire de préférences.</p>
                
                <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #0066CC; margin: 20px 0;">
                    <p style="margin: 0;"><strong>🔗 Lien du formulaire :</strong></p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="{form_url}" style="color: #0066CC; font-weight: bold;">
                            {form_url}
                        </a>
                    </p>
                </div>
                
                {f'<p>⏰ <strong>Date limite :</strong> {deadline}</p>' if deadline else ''}
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p><strong>Première connexion ?</strong></p>
                <p>Si vous n'avez pas encore de compte, créez-en un ici :</p>
                <p>
                    <a href="{signup_url}" 
                       style="display: inline-block; background-color: #0066CC; color: white; 
                              padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Créer un compte
                    </a>
                </p>
                
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    Vous recevez cet email car vous avez été ajouté à un projet sur la plateforme 
                    de gestion de projets étudiants d'ESIEE Paris.
                </p>
            </div>
        </body>
        </html>
        """
        
        message = MessageSchema(
            subject=f"[ESIEE] Nouveau projet: {project_name}",
            recipients=[student_email],
            body=html,
            subtype="html"
        )
        
        await self.mail.send_message(message)
```

### 2. Environment Configuration

**Add to `backend/.env`:**
```env
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@esiee.fr
FRONTEND_URL=http://localhost:5173
```

### 3. Update Config

**File:** `backend/app/config.py`

```python
class Settings(BaseSettings):
    # ... existing settings ...
    
    # Email settings
    MAIL_USERNAME: str = "noreply@esiee.fr"
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "ESIEE Paris <noreply@esiee.fr>"
    FRONTEND_URL: str = "http://localhost:5173"
```

### 4. Update Project Creation Endpoint

**File:** `backend/app/api/routes/projects.py`

```python
from app.services.email import EmailService

@router.post("/", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    # ... existing project creation code ...
    
    # Send invitation emails to all students
    email_service = EmailService()
    for student_data in project_data.students:
        try:
            await email_service.send_project_invitation(
                student_email=student_data.email,
                student_name=student_data.name or generate_name_from_email(student_data.email),
                project_name=project_data.title,
                project_id=new_project.id,
                teacher_name="Prof. X",  # TODO: Get from auth
                deadline=project_data.deadline.strftime("%d/%m/%Y") if project_data.deadline else None
            )
        except Exception as e:
            print(f"Failed to send email to {student_data.email}: {e}")
            # Continue even if email fails
    
    return new_project
```

---

## 📦 Required Packages

Add to `backend/requirements.txt`:
```
fastapi-mail==1.4.1
jinja2==3.1.2
aiosmtplib==2.0.2
```

Install:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install fastapi-mail jinja2 aiosmtplib
```

---

## 🧪 Testing

### 1. Use Gmail with App Password

1. Enable 2-factor authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-16-char-app-password
   ```

### 2. Test Email Sending

```powershell
# In Python console
python -c "
from app.services.email import EmailService
import asyncio

async def test():
    service = EmailService()
    await service.send_project_invitation(
        student_email='your-test-email@gmail.com',
        student_name='Test Student',
        project_name='Test Project',
        project_id=1,
        teacher_name='Prof. Test'
    )

asyncio.run(test())
"
```

---

## 📧 Email Templates

### Template Features:
- ✅ ESIEE branding (blue header)
- ✅ Clear call-to-action button
- ✅ Direct link to form
- ✅ Signup instructions for new users
- ✅ Deadline display (if provided)
- ✅ Responsive HTML design
- ✅ Professional footer

---

## 🔄 Future Enhancements

### Phase 2:
- **Reminder Emails**: Send reminders to students who haven't filled the form
- **Deadline Alerts**: Send alert 24h before deadline
- **Confirmation Emails**: Send confirmation when student submits preferences
- **Teacher Notifications**: Notify teacher when all students have responded

### Phase 3:
- **Email Templates**: Use Jinja2 templates for easier customization
- **Unsubscribe Links**: Allow students to opt-out of reminders
- **Email Tracking**: Track open rates and click-throughs
- **Batch Sending**: Queue emails for large groups (100+ students)

---

## ⚠️ Important Notes

1. **Email Only Required**: Since we auto-generate names from emails, only email is mandatory
2. **Error Handling**: Email failures should NOT prevent project creation
3. **Async Sending**: Use background tasks for large batches
4. **Rate Limiting**: Be careful with Gmail's 500 emails/day limit
5. **Testing**: Always test with your own email first

---

## 🎯 Implementation Priority

### Immediate (This Sprint):
1. ✅ Make email the only required field
2. ✅ Auto-generate names from emails
3. ✅ Manual student addition
4. ✅ Multiple CSV uploads

### Next Sprint:
1. 🔄 Setup email service
2. 🔄 Create email templates
3. 🔄 Send invitations on project creation
4. 🔄 Test with Gmail

### Future Sprints:
1. ⏳ Reminder system
2. ⏳ Email tracking
3. ⏳ Template customization
4. ⏳ Batch processing

---

## 📝 Success Criteria

Email system is working when:
- ✅ Student receives email immediately after being added
- ✅ Email contains correct form link
- ✅ Email displays properly on desktop & mobile
- ✅ Signup link works for new users
- ✅ Project creation succeeds even if email fails
- ✅ No spam complaints (proper unsubscribe link)
