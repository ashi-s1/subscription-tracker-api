import { Router } from 'express';
import dayjs from 'dayjs';
import { generateEmailTemplate } from '../utils/email-template.js';
import { sendReminderEmail } from '../utils/send-email.js';

const previewRouter = Router();

// Pure raw HTML email preview
previewRouter.get('/raw', (req, res) => {
  const defaultRenewal = dayjs().add(7, 'day').format('MMM D, YYYY');
  const {
    userName = 'Ashis Routray',
    subscriptionName = 'Amazon Prime',
    renewalDate = defaultRenewal,
    planName = 'Amazon Prime',
    price = 'USD 139 (monthly)',
    paymentMethod = 'Credit Card',
    daysLeft = '7',
  } = req.query;

  const html = generateEmailTemplate({
    userName,
    subscriptionName,
    renewalDate,
    planName,
    price,
    paymentMethod,
    accountSettingsLink: '#',
    supportLink: '#',
    daysLeft,
  });

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Interactive browser page matching the video
previewRouter.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SubDub - Email Template & Form Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
    header { background-color: #1e293b; padding: 16px 32px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; }
    header h1 { font-size: 20px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { background-color: #0284c7; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 9999px; font-weight: 600; }
    .container { display: flex; flex: 1; gap: 24px; padding: 24px 32px; max-width: 1500px; margin: 0 auto; width: 100%; }
    .form-panel { flex: 0 0 380px; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; height: fit-content; }
    .form-panel h2 { font-size: 16px; color: #cbd5e1; border-bottom: 1px solid #334155; padding-bottom: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select { background-color: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 12px; color: #f8fafc; font-size: 14px; outline: none; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: #38bdf8; }
    .btn { background-color: #2563eb; color: #ffffff; border: none; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn:hover { background-color: #1d4ed8; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .preview-panel { flex: 1; display: flex; flex-direction: column; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden; }
    .preview-header { background-color: #334155; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #cbd5e1; }
    .preview-subject { font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
    .email-viewport { flex: 1; padding: 32px 16px; background-color: #f4f7fa; overflow-y: auto; display: flex; justify-content: center; }
    #email-container { width: 100%; max-width: 600px; }
    .status-msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; display: none; }
    .status-msg.success { background-color: #064e3b; color: #a7f3d0; border: 1px solid #059669; display: block; }
    .status-msg.error { background-color: #7f1d1d; color: #fecaca; border: 1px solid #dc2626; display: block; }
  </style>
</head>
<body>
  <header>
    <h1><span>📬 SubDub</span> <span class="badge">Live Email Preview</span></h1>
    <span style="font-size: 13px; color: #94a3b8;">Subscription Tracker &bull; Nodemailer Connected</span>
  </header>

  <div class="container">
    <!-- Form Panel -->
    <div class="form-panel">
      <h2>Subscription Form Details</h2>

      <div class="form-group">
        <label>User Name</label>
        <input type="text" id="userName" value="Ashis Routray" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Subscription Name</label>
        <input type="text" id="subscriptionName" value="Amazon Prime" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Price</label>
        <input type="text" id="price" value="USD 139 (monthly)" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Payment Method</label>
        <input type="text" id="paymentMethod" value="Credit Card" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Renewal Date</label>
        <input type="text" id="renewalDate" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Days Left Until Renewal</label>
        <input type="number" id="daysLeft" value="7" min="1" max="365" oninput="onDaysLeftChange()">
      </div>

      <hr style="border: 0; border-top: 1px solid #334155; margin: 4px 0;">

      <div class="form-group">
        <label>Send Real Email To (Your Inbox)</label>
        <input type="email" id="targetEmail" placeholder="youremail@gmail.com" value="sweetpoison23r@gmail.com">
      </div>

      <button class="btn" id="sendBtn" onclick="sendTestEmail()">
        <span>🚀 Send Test Email to My PC Inbox</span>
      </button>

      <div id="statusBox" class="status-msg"></div>
    </div>

    <!-- Preview Panel -->
    <div class="preview-panel">
      <div class="preview-header">
        <div class="preview-subject" id="subjectPreview">📅 Reminder: Your Amazon Prime Subscription Renews in 7 Days!</div>
        <div>From: <strong>sweetpoison23r@gmail.com</strong></div>
      </div>
      <div class="email-viewport">
        <div id="email-container"></div>
      </div>
    </div>
  </div>

  <script>
    function renderTemplate(data) {
      return \`
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f7fa;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background-color: #4a90e2; text-align: center;">
                <p style="font-size: 54px; line-height: 54px; font-weight: 800; color: #ffffff; margin: 20px 0;">SubDub</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">                
                <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong style="color: #4a90e2;">\${data.userName}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Your <strong>\${data.subscriptionName}</strong> subscription is set to renew on <strong style="color: #4a90e2;">\${data.renewalDate}</strong> (\${data.daysLeft} days from today).</p>
                
                <table cellpadding="15" cellspacing="0" border="0" width="100%" style="background-color: #f0f7ff; border-radius: 10px; margin-bottom: 25px;">
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d0e3ff;">
                            <strong>Plan:</strong> \${data.subscriptionName}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d0e3ff;">
                            <strong>Price:</strong> \${data.price}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px;">
                            <strong>Payment Method:</strong> \${data.paymentMethod}
                        </td>
                    </tr>
                </table>
                
                <p style="font-size: 16px; margin-bottom: 25px;">If you'd like to make changes or cancel your subscription, please visit your <a href="#" style="color: #4a90e2; text-decoration: none;">account settings</a> before the renewal date.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">Need help? <a href="#" style="color: #4a90e2; text-decoration: none;">Contact our support team</a> anytime.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">
                    Best regards,<br>
                    <strong>The SubDub Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0 0 10px;">
                    SubDub Inc. | 123 Main St, Anytown, AN 12345
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>\`;
    }

    function formatRenewalDate(days) {
      const d = new Date();
      d.setDate(d.getDate() + (parseInt(days, 10) || 7));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function onDaysLeftChange() {
      const days = document.getElementById('daysLeft').value;
      document.getElementById('renewalDate').value = formatRenewalDate(days);
      updatePreview();
    }

    function updatePreview() {
      const days = document.getElementById('daysLeft').value || '7';
      const data = {
        userName: document.getElementById('userName').value || 'Ashis Routray',
        subscriptionName: document.getElementById('subscriptionName').value || 'Amazon Prime',
        price: document.getElementById('price').value || 'USD 139 (monthly)',
        paymentMethod: document.getElementById('paymentMethod').value || 'Credit Card',
        renewalDate: document.getElementById('renewalDate').value || formatRenewalDate(days),
        daysLeft: days,
      };

      document.getElementById('email-container').innerHTML = renderTemplate(data);
      document.getElementById('subjectPreview').innerText = \`📅 Reminder: Your \${data.subscriptionName} Subscription Renews in \${data.daysLeft} Days!\`;
    }

    async function sendTestEmail() {
      const btn = document.getElementById('sendBtn');
      const statusBox = document.getElementById('statusBox');
      const to = document.getElementById('targetEmail').value;

      if (!to) {
        statusBox.className = 'status-msg error';
        statusBox.innerText = 'Please enter a target recipient email.';
        return;
      }

      btn.disabled = true;
      btn.innerText = '⏳ Sending email via Nodemailer...';
      statusBox.className = 'status-msg';

      try {
        const res = await fetch('/preview/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            userName: document.getElementById('userName').value,
            subscriptionName: document.getElementById('subscriptionName').value,
            price: document.getElementById('price').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            renewalDate: document.getElementById('renewalDate').value,
            daysLeft: document.getElementById('daysLeft').value,
          })
        });

        const data = await res.json();
        if (data.success) {
          statusBox.className = 'status-msg success';
          statusBox.innerText = '✅ Email sent! Check your inbox (' + to + ').';
        } else {
          statusBox.className = 'status-msg error';
          statusBox.innerText = '❌ Failed: ' + (data.error || 'Unknown error');
        }
      } catch (err) {
        statusBox.className = 'status-msg error';
        statusBox.innerText = '❌ Request failed: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Send Test Email to My PC Inbox';
      }
    }

    // Set initial date dynamically based on today + 7 days
    document.getElementById('renewalDate').value = formatRenewalDate(7);
    updatePreview();
  </script>
</body>
</html>`);
});

// Endpoint to send the actual test email
previewRouter.post('/send-test', async (req, res) => {
  try {
    const {
      to,
      userName = 'Adrian Hajdin',
      subscriptionName = 'Amazon Prime',
      price = 'USD 139 (monthly)',
      paymentMethod = 'Credit Card',
      renewalDate = 'Feb 14, 2025',
      daysLeft = '7',
    } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email is required' });
    }

    const type = `${daysLeft} days before reminder`;

    // Construct a mock subscription matching sendReminderEmail structure
    const mockSubscription = {
      name: subscriptionName,
      price: price.replace(/[^0-9.]/g, '') || 139,
      currency: 'USD',
      frequency: 'monthly',
      paymentMethod,
      renewalDate: renewalDate ? new Date(renewalDate) : new Date(),
      user: {
        name: userName,
        email: to,
      },
    };

    const info = await sendReminderEmail({
      to,
      type,
      subscription: mockSubscription,
    });

    res.status(200).json({
      success: true,
      message: 'Reminder email sent successfully!',
      info,
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default previewRouter;
