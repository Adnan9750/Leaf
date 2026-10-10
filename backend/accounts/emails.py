import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_vendor_approval_email(vendor):
    """
    Sends a beautifully formatted approval email to the approved vendor.
    """
    user = vendor.user
    recipient_email = user.email
    first_name = (user.first_name or "Partner").strip()
    last_name = (user.last_name or "").strip()
    full_name = f"{first_name} {last_name}".strip()
    company_name = vendor.company_name or "Your Store"
    city = vendor.city or "Not specified"
    phone_number = vendor.phone_number or "Not specified"
    currency = vendor.currency or "PKR"

    subject = f"🎉 Congratulations! Your Leaf Vendor Account is Approved ({company_name})"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)

    text_content = f"""Dear {full_name},

Congratulations! We are delighted to inform you that your vendor application for "{company_name}" has been APPROVED.

Your account is now active, and you have full access to the Leaf Vendor Portal.

Account Summary:
- Store / Company Name: {company_name}
- Registered Email: {recipient_email}
- Contact Phone: {phone_number}
- City: {city}
- Preferred Currency: {currency}
- Status: Approved & Active

What's Next?
1. Sign in to your dashboard at http://localhost:3000/login
2. Complete your store settings and catalog
3. Start listing products and receiving customer orders!

If you have any questions, feel free to reply to this email or contact vendor support.

Best regards,
The Leaf Team
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Application Approved</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f7f6;
      margin: 0;
      padding: 30px 15px;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }}
    .container {{
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #052e16 0%, #15803d 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }}
    .brand-badge {{
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: #86efac;
    }}
    .header h1 {{
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 0;
      font-size: 14px;
      color: #bbf7d0;
    }}
    .content {{
      padding: 32px 30px;
    }}
    .greeting {{
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }}
    .message {{
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }}
    .status-badge-box {{
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }}
    .status-badge-box .icon {{
      font-size: 20px;
      margin-right: 12px;
    }}
    .status-badge-box .text {{
      font-size: 13px;
      font-weight: 600;
      color: #166534;
    }}
    .details-card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 28px;
    }}
    .details-title {{
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 14px;
    }}
    .detail-row {{
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eef2f6;
      font-size: 13px;
    }}
    .detail-row:last-child {{
      border-bottom: none;
      padding-bottom: 0;
    }}
    .detail-label {{
      color: #64748b;
      font-weight: 500;
    }}
    .detail-value {{
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }}
    .btn-container {{
      text-align: center;
      margin: 32px 0 28px 0;
    }}
    .btn {{
      display: inline-block;
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    }}
    .steps-section {{
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
      margin-top: 24px;
    }}
    .steps-title {{
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
    }}
    .step-item {{
      display: flex;
      margin-bottom: 10px;
      font-size: 13px;
      color: #475569;
    }}
    .step-number {{
      background-color: #dcfce7;
      color: #166534;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
      margin-right: 10px;
      flex-shrink: 0;
    }}
    .footer {{
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }}
    .footer a {{
      color: #16a34a;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-badge">Leaf Vendor Portal</div>
      <h1>Welcome to Leaf! 🎉</h1>
      <p>Your vendor account application has been approved</p>
    </div>

    <div class="content">
      <div class="greeting">Hello {full_name},</div>
      <p class="message">
        We are thrilled to let you know that your application to become a verified vendor for <strong>{company_name}</strong> on Leaf has been reviewed and <strong>approved</strong>.
      </p>

      <div class="status-badge-box">
        <span class="icon">✅</span>
        <span class="text">Account Status: Active & Ready for Business</span>
      </div>

      <div class="details-card">
        <div class="details-title">Registered Account Summary</div>
        <div class="detail-row">
          <span class="detail-label">Store / Company</span>
          <span class="detail-value">{company_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email Address</span>
          <span class="detail-value">{recipient_email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">{phone_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">City</span>
          <span class="detail-value">{city}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Currency</span>
          <span class="detail-value">{currency}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="http://localhost:3000/login" class="btn">Sign In to Vendor Dashboard &rarr;</a>
      </div>

      <div class="steps-section">
        <div class="steps-title">Quick Next Steps to Get Started:</div>
        <div class="step-item">
          <span class="step-number">1</span>
          <span>Log in to your dashboard and finalize your vendor profile.</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span>Add your first product inventory, pricing, and high-quality images.</span>
        </div>
        <div class="step-item">
          <span class="step-number">3</span>
          <span>Start managing orders and growing your business with Leaf.</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">This is an automated notification from <strong>Leaf Platform</strong>.</p>
      <p style="margin: 0;">Need assistance? Reach out to <a href="mailto:adnansarfaraz975@gmail.com">support</a> &bull; &copy; 2026 Leaf</p>
    </div>
  </div>
</body>
</html>
"""

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info("Vendor approval email sent successfully to %s", recipient_email)
        return True, "Email sent successfully"
    except Exception as exc:
        logger.error("Failed to send approval email to %s: %s", recipient_email, str(exc))
        return False, str(exc)


def send_vendor_rejection_email(vendor, rejection_reason):
    """
    Sends a formatted rejection email to the vendor with the specific reason.
    """
    user = vendor.user
    recipient_email = user.email
    first_name = (user.first_name or "Applicant").strip()
    last_name = (user.last_name or "").strip()
    full_name = f"{first_name} {last_name}".strip()
    company_name = vendor.company_name or "Your Store"
    reason_clean = (rejection_reason or "Your application did not meet our verification criteria at this time.").strip()

    subject = f"Update on Your Leaf Vendor Application ({company_name})"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)

    text_content = f"""Dear {full_name},

Thank you for your interest in partnering with Leaf and applying as a vendor for "{company_name}".

After careful review of your application, we regret to inform you that we are unable to approve your vendor account at this time.

Reason for Rejection:
----------------------------------------
{reason_clean}
----------------------------------------

What you can do:
If you would like to update your application details or have questions regarding this decision, please contact our support team. You may reapply once the required changes or documents are in place.

Thank you for your time and understanding.

Best regards,
The Leaf Team
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Application Update</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 30px 15px;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }}
    .container {{
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }}
    .brand-badge {{
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: #cbd5e1;
    }}
    .header h1 {{
      margin: 0 0 8px 0;
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 0;
      font-size: 14px;
      color: #94a3b8;
    }}
    .content {{
      padding: 32px 30px;
    }}
    .greeting {{
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }}
    .message {{
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }}
    .reason-box {{
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #ef4444;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 26px;
    }}
    .reason-header {{
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #991b1b;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .reason-content {{
      font-size: 14px;
      line-height: 1.5;
      color: #7f1d1d;
      font-weight: 500;
      white-space: pre-wrap;
    }}
    .info-card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
    }}
    .info-card strong {{
      color: #1e293b;
    }}
    .footer {{
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }}
    .footer a {{
      color: #16a34a;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-badge">Leaf Vendor Portal</div>
      <h1>Vendor Application Update</h1>
      <p>Status regarding your application for <strong>{company_name}</strong></p>
    </div>

    <div class="content">
      <div class="greeting">Hello {full_name},</div>
      <p class="message">
        Thank you for your interest in joining the Leaf vendor network. After careful review of your application for <strong>{company_name}</strong>, we regret to inform you that we cannot approve your vendor account at this time.
      </p>

      <div class="reason-box">
        <div class="reason-header">⚠️ Reason for Rejection</div>
        <div class="reason-content">{reason_clean}</div>
      </div>

      <div class="info-card">
        <strong>What's Next?</strong><br>
        If you have questions about this review or have updated documentation to provide, please reply directly to this email or reach out to our team at <a href="mailto:adnansarfaraz975@gmail.com" style="color: #16a34a; font-weight: 600;">adnansarfaraz975@gmail.com</a>.
      </div>

      <p class="message" style="margin-bottom: 0;">
        We appreciate the time you took to apply and wish you the best in your business endeavors.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">This is an automated notification from <strong>Leaf Platform</strong>.</p>
      <p style="margin: 0;">Vendor Support: <a href="mailto:adnansarfaraz975@gmail.com">adnansarfaraz975@gmail.com</a> &bull; &copy; 2026 Leaf</p>
    </div>
  </div>
</body>
</html>
"""

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info("Vendor rejection email sent successfully to %s", recipient_email)
        return True, "Email sent successfully"
    except Exception as exc:
        logger.error("Failed to send rejection email to %s: %s", recipient_email, str(exc))
        return False, str(exc)
