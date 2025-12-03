"""Email notification service for critical alerts."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import Alert, Contact, Home


def send_email(
    to_email: str,
    subject: str,
    body: str,
    settings: Settings,
) -> bool:
    """Send an email notification."""
    try:
        # For development, we'll use a simple SMTP setup
        # In production, use AWS SES, SendGrid, or similar
        if not settings.smtp_host:
            # Log email instead of sending in development
            print(f"[EMAIL] To: {to_email}")
            print(f"[EMAIL] Subject: {subject}")
            print(f"[EMAIL] Body: {body}")
            return True

        msg = MIMEMultipart()
        msg["From"] = settings.smtp_from_email or "noreply@smarthome.com"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port or 587) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False


def notify_contacts_for_alert(
    db: Session,
    alert: Alert,
    settings: Settings,
) -> int:
    """Notify all emergency contacts for a critical alert. Returns number of notifications sent."""
    if alert.severity != "high":
        return 0  # Only notify for high-severity alerts
    
    # Get home and contacts
    home = db.query(Home).filter(Home.id == alert.home_id).first()
    if not home:
        return 0
    
    contacts = db.query(Contact).filter(Contact.home_id == alert.home_id).order_by(Contact.priority.desc()).all()
    if not contacts:
        return 0
    
    # Prepare email content
    from app.db.models import Device, Room
    device = db.query(Device).filter(Device.id == alert.device_id).first() if alert.device_id else None
    room = db.query(Room).filter(Room.id == alert.room_id).first() if alert.room_id else None
    
    device_info = f"Device: {device.name}" if device else "Unknown device"
    room_info = f"Room: {room.name}" if room else "Unknown room"
    
    subject = f"🚨 CRITICAL ALERT: {alert.type.upper()} Detected"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d32f2f;">Critical Alert Notification</h2>
        <p><strong>Alert Type:</strong> {alert.type}</p>
        <p><strong>Severity:</strong> <span style="color: #d32f2f; font-weight: bold;">HIGH</span></p>
        <p><strong>Home:</strong> {home.name}</p>
        <p><strong>{room_info}</strong></p>
        <p><strong>{device_info}</strong></p>
        <p><strong>Confidence Score:</strong> {alert.score * 100:.1f}%</p>
        <p><strong>Time:</strong> {alert.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
        <hr>
        <p style="color: #666; font-size: 0.9em;">
            This is an automated notification from your Smart Home Cloud Platform.
            Please take appropriate action immediately.
        </p>
    </body>
    </html>
    """
    
    notifications_sent = 0
    for contact in contacts:
        if contact.channel == "email":
            if send_email(contact.value, subject, body, settings):
                notifications_sent += 1
    
    return notifications_sent

