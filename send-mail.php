<?php
/**
 * STELLAR - Lead Contact Form Handler
 * Delivers all website inquiries directly to admin@stellarweb.in
 */

// Set response header
header('Content-Type: application/json; charset=UTF-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

// Target recipient email
$to = 'admin@stellarweb.in';

// Check for JSON input or standard POST data
$inputJSON = file_get_contents('php://input');
$jsonData = json_decode($inputJSON, true);

$data = is_array($jsonData) && !empty($jsonData) ? $jsonData : $_POST;

// Honeypot anti-spam check (if filled, silently succeed to fool spam bots)
if (!empty($data['website_url'])) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you! Your enquiry has been received.'
    ]);
    exit;
}

// Extract and sanitize inputs
$name      = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$email     = isset($data['email']) ? trim(strip_tags($data['email'])) : '';
$phone     = isset($data['phone']) ? trim(preg_replace('/[^0-9]/', '', $data['phone'])) : '';
$message   = isset($data['message']) ? trim(strip_tags($data['message'])) : '';
$formType  = isset($data['form_type']) ? trim(strip_tags($data['form_type'])) : 'Website Quote Form';

// Basic Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Full Name is required.';
} elseif (strlen($name) > 100) {
    $errors[] = 'Name is too long.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid work email address is required.';
}

if (empty($phone) || strlen($phone) < 10) {
    $errors[] = 'A valid 10-digit mobile number is required.';
}

if (empty($message)) {
    $errors[] = 'Project requirement description is required.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => implode(' ', $errors)
    ]);
    exit;
}

// Set Indian Standard Time for timestamp
date_default_timezone_set('Asia/Kolkata');
$timestamp = date('d M Y, h:i A') . ' IST';
$clientIp  = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

// Format WhatsApp link for quick one-click response from the email
$waNumber = '91' . substr($phone, -10);
$waLink   = "https://wa.me/{$waNumber}?text=" . rawurlencode("Hello {$name}, thank you for reaching out to STELLAR regarding your project enquiry.");

// Email Subject
$subject = "New Project Enquiry: {$name} (" . htmlspecialchars($formType) . ")";

// HTML Email Body
$htmlBody = '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project Lead</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%); padding: 32px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">STELLAR</h1>
                <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">New Project Lead Received</p>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 32px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">
                    You have received a new consultation request from the <strong style="color: #111827;">' . htmlspecialchars($formType) . '</strong> on <a href="https://stellarweb.in" style="color: #06B6D4; text-decoration: none; font-weight: 600;">stellarweb.in</a>.
                </p>

                <!-- Lead Details Card -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 12px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; width: 140px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</td>
                        <td style="padding: 12px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a; font-size: 15px;">' . htmlspecialchars($name) . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Phone / WhatsApp</td>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 15px;">
                            <a href="tel:+91' . htmlspecialchars($phone) . '" style="color: #0284c7; text-decoration: none; font-weight: 700;">+91 ' . htmlspecialchars($phone) . '</a>
                            &nbsp;&middot;&nbsp;
                            <a href="' . $waLink . '" target="_blank" style="display: inline-block; background: #10B981; color: #ffffff; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-decoration: none; vertical-align: middle;">Chat on WhatsApp &rarr;</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Work Email</td>
                        <td style="padding: 12px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 15px;">
                            <a href="mailto:' . htmlspecialchars($email) . '" style="color: #0284c7; text-decoration: none;">' . htmlspecialchars($email) . '</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Form Source</td>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; font-size: 14px;">' . htmlspecialchars($formType) . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Submitted On</td>
                        <td style="padding: 12px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #475569; font-size: 13px;">' . $timestamp . '</td>
                    </tr>
                </table>

                <!-- Requirements Block -->
                <div style="margin-top: 10px; margin-bottom: 28px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Project / Website Requirements</h3>
                    <div style="padding: 16px 18px; background: #f1f5f9; border-left: 4px solid #06B6D4; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">' . nl2br(htmlspecialchars($message)) . '</div>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="mailto:' . htmlspecialchars($email) . '?subject=' . rawurlencode('Re: STELLAR Consultation - ' . $name) . '" style="display: inline-block; background: #06B6D4; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 8px rgba(6,182,212,0.35);">Reply to Client via Email</a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                This notification was generated automatically from the contact form at <a href="https://stellarweb.in" style="color: #64748b; text-decoration: underline;">stellarweb.in</a>.<br>
                IP Address: ' . htmlspecialchars($clientIp) . '
            </td>
        </tr>
    </table>
</body>
</html>';

// Email Headers
$headers   = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/html; charset=UTF-8';
$headers[] = 'From: STELLAR Notifications <noreply@stellarweb.in>';
$headers[] = 'Reply-To: ' . htmlspecialchars($name) . ' <' . $email . '>';
$headers[] = 'Return-Path: <admin@stellarweb.in>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// Send email using PHP mail()
$mailSent = @mail($to, $subject, $htmlBody, implode("\r\n", $headers), "-f noreply@stellarweb.in");

// If -f parameter failed or restricted, fallback to standard mail call
if (!$mailSent) {
    $mailSent = @mail($to, $subject, $htmlBody, implode("\r\n", $headers));
}

// Return JSON response or redirect if standard form POST
$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
          || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

if ($isAjax) {
    if ($mailSent) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Thank you! Your project enquiry has been submitted. Our team will contact you within 24 hours.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Email delivery failed on server. Please reach out to admin@stellarweb.in directly or via WhatsApp.'
        ]);
    }
} else {
    // Non-AJAX fallback redirect
    $redirectUrl = 'index.html?sent=' . ($mailSent ? '1' : '0') . '#contact';
    header("Location: $redirectUrl");
    exit;
}
