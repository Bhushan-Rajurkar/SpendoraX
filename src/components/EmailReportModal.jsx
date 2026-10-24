import { useState } from "react";
import Model from "./Model";
import {
  Mail,
  Send,
  Copy,
  ExternalLink,
  Check,
  FileSpreadsheet,
  AlertCircle,
  LoaderCircle,
  Download,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import {
  generateReportEmailContent,
  openGmailCompose,
  openMailto,
  exportTransactionsToCsv,
} from "../util/helper";
import toast from "react-hot-toast";

const EmailReportModal = ({
  isOpen,
  onClose,
  type = "income",
  transactions = [],
  user = {},
  onServerEmail,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(user?.email || "");
  const [serverLoading, setServerLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [serverSuccess, setServerSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSmtpGuide, setShowSmtpGuide] = useState(false);
  const [autoDownloadAttachment, setAutoDownloadAttachment] = useState(true);

  const { subject, body, fullBody, totalAmount } = generateReportEmailContent(
    type,
    transactions,
    user
  );

  const isIncome = type === "income";

  // 1. One-click Gmail compose
  const handleGmailCompose = () => {
    const targetEmail = (recipientEmail || "").trim();
    if (!targetEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }

    // Call openGmailCompose immediately to prevent browser popup block
    openGmailCompose(targetEmail, subject, body);

    // If auto-download enabled, schedule it after the window opens
    if (autoDownloadAttachment) {
      setTimeout(() => {
        exportTransactionsToCsv(
          transactions,
          `spendorax_${type}_statement_${new Date().toISOString().split("T")[0]}.csv`
        );
      }, 500);
    }

    toast.success("Opening Gmail Compose with statement pre-filled!");
    setTimeout(() => onClose(), 800);
  };

  // 2. Open default mail client (mailto)
  const handleDefaultMail = () => {
    const targetEmail = (recipientEmail || "").trim();
    if (!targetEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }

    openMailto(targetEmail, subject, body);

    if (autoDownloadAttachment) {
      setTimeout(() => {
        exportTransactionsToCsv(
          transactions,
          `spendorax_${type}_statement_${new Date().toISOString().split("T")[0]}.csv`
        );
      }, 500);
    }

    toast.success("Opening mail app with statement pre-filled!");
    setTimeout(() => onClose(), 800);
  };

  // 3. Send through backend server SMTP
  const handleServerSend = async () => {
    if (!onServerEmail) return;
    const targetEmail = (recipientEmail || "").trim();
    if (!targetEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }

    setServerLoading(true);
    setServerError(null);
    setServerSuccess(false);

    try {
      const response = await onServerEmail(targetEmail);
      const msg = response?.data?.message || `Statement emailed successfully to ${targetEmail}`;
      setServerSuccess(true);
      toast.success(msg);
      setTimeout(() => {
        onClose();
        setServerSuccess(false);
      }, 1500);
    } catch (err) {
      console.warn("Backend SMTP send error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Backend mail server rejected authentication (SMTP unconfigured). Use the 'Send via Gmail / Mail App' option below!";
      setServerError(errMsg);
      toast.error("Server SMTP failed. See details below.");
    } finally {
      setServerLoading(false);
    }
  };

  // 4. Copy report text to clipboard
  const handleCopyReport = () => {
    navigator.clipboard.writeText(`${subject}\n\n${fullBody}`);
    setCopied(true);
    toast.success("Full financial statement copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // 5. Download statement file directly
  const handleDownloadStatement = () => {
    exportTransactionsToCsv(
      transactions,
      `spendorax_${type}_statement_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success("Statement CSV downloaded successfully!");
  };

  return (
    <Model
      isOpen={isOpen}
      onClose={onClose}
      title={`Email ${isIncome ? "Income" : "Expense"} Statement`}
    >
      <div className="space-y-4 text-gray-800">
        {/* Recipient Input */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Recipient Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Send statement to your personal email, accountant, or financial partner.
          </p>
        </div>

        {/* Statement Summary Badge */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-purple-950 block">
              {transactions.length} {isIncome ? "Income Records" : "Expense Records"}
            </span>
            <span className="text-purple-700 font-bold text-sm">
              Total Amount: ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadStatement}
            className="flex items-center gap-1.5 text-[11px] font-medium text-purple-700 bg-white hover:bg-purple-100/60 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors shadow-sm"
          >
            <Download size={13} />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Auto-download attachment option checkbox */}
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-gray-100">
          <input
            type="checkbox"
            id="autoDownload"
            checked={autoDownloadAttachment}
            onChange={(e) => setAutoDownloadAttachment(e.target.checked)}
            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 cursor-pointer"
          />
          <label htmlFor="autoDownload" className="cursor-pointer select-none">
            Auto-download statement file ready to attach to your email
          </label>
        </div>

        {/* Server Success Alert */}
        {serverSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Email Delivered Successfully!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                The Excel statement has been sent directly to {recipientEmail}.
              </p>
            </div>
          </div>
        )}

        {/* Server Error Warning Banner (if backend SMTP failed) */}
        {serverError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Server SMTP Notice:</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{serverError}</p>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                👉 Click <strong>"Send via Gmail (Instant)"</strong> below to send directly from your personal account without server configuration!
              </p>
              <button
                type="button"
                onClick={() => setShowSmtpGuide(!showSmtpGuide)}
                className="mt-2 text-[11px] text-indigo-600 underline font-medium flex items-center gap-1 hover:text-indigo-800"
              >
                <HelpCircle size={12} />
                <span>{showSmtpGuide ? "Hide SMTP setup instructions" : "How to configure Gmail SMTP for Backend?"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible SMTP Guide */}
        {showSmtpGuide && (
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 text-xs space-y-2 border border-slate-800">
            <p className="font-semibold text-purple-300">How to enable Backend SMTP with Gmail:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>Open your Google Account at <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-purple-400 underline">myaccount.google.com/security</a>.</li>
              <li>Ensure <strong>2-Step Verification</strong> is ON.</li>
              <li>Search for <strong>"App passwords"</strong> or go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-purple-400 underline">myaccount.google.com/apppasswords</a>.</li>
              <li>Create an app named <em>SpendoraX</em> and copy the 16-character password.</li>
              <li>Add to <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">moneymanager/src/main/resources/application.properties</code>:
                <pre className="bg-slate-950 p-2 rounded mt-1 font-mono text-[10px] text-emerald-400 overflow-x-auto">
{`spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-16-char-app-password
spring.mail.properties.mail.smtp.from=your-gmail@gmail.com`}
                </pre>
              </li>
            </ol>
          </div>
        )}

        {/* Email Sending Options */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Choose Email Delivery Method:
          </label>

          {/* Option 1: One-Click Instant Gmail Compose */}
          <button
            type="button"
            onClick={handleGmailCompose}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98 transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={16} />
              <span>Send via Gmail Web Compose (Recommended)</span>
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Instant • 100% Works
            </span>
          </button>

          {/* Option 2: Default System Mail Client (Outlook / Apple Mail) */}
          <button
            type="button"
            onClick={handleDefaultMail}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs sm:text-sm transition-all"
          >
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-gray-600" />
              <span>Send via Default Mail App (Outlook / Apple Mail)</span>
            </span>
          </button>

          {/* Option 3: Backend Server SMTP */}
          {onServerEmail && (
            <button
              type="button"
              onClick={handleServerSend}
              disabled={serverLoading}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 hover:bg-purple-50/60 text-purple-900 font-medium text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {serverLoading ? (
                  <LoaderCircle size={16} className="animate-spin text-purple-600" />
                ) : (
                  <Send size={16} className="text-purple-600" />
                )}
                <span>Send via Server SMTP (Direct to Inbox with Excel)</span>
              </span>
              <span className="text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
                Backend
              </span>
            </button>
          )}

          {/* Option 4: Quick Action Utilities (Copy text & Preview) */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-gray-500 hover:text-purple-700 transition-colors font-medium py-1"
            >
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showPreview ? "Hide Preview" : "Preview Statement"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1 text-gray-500 hover:text-purple-700 transition-colors font-medium py-1"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Statement Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statement Live Preview Area */}
        {showPreview && (
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-700 space-y-1 max-h-48 overflow-y-auto font-mono">
            <p className="font-bold text-gray-900 mb-1 border-b pb-1">
              Subject: {subject}
            </p>
            <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">
              {fullBody}
            </pre>
          </div>
        )}
      </div>
    </Model>
  );
};

export default EmailReportModal;
