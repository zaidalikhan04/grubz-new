import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, Mail, CheckCircle } from 'lucide-react';

interface EmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: {
    to: string;
    subject: string;
    content: string;
    type: 'approval' | 'rejection';
  };
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ isOpen, onClose, emailData }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Email content copied to clipboard!');
    });
  };

  const copyFullEmail = () => {
    const fullEmail = `To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.content}`;
    copyToClipboard(fullEmail);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {emailData.type === 'approval' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Mail className="w-5 h-5 text-red-600" />
              )}
              <CardTitle className="text-lg">
                {emailData.type === 'approval' ? 'Approval Email Preview' : 'Rejection Email Preview'}
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Email Headers */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">To:</span>
                  <span className="ml-2">{emailData.to}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Subject:</span>
                  <span className="ml-2">{emailData.subject}</span>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold mb-3 text-gray-700">Email Content:</h4>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 bg-gray-50 p-4 rounded border">
                {emailData.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={copyFullEmail}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Copy className="w-4 h-4" />
                Copy Email Content
              </Button>
              
              <Button 
                onClick={() => copyToClipboard(emailData.to)}
                variant="outline"
                size="sm"
              >
                Copy Email Address
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <h5 className="font-semibold text-blue-800 mb-2">📧 Manual Email Instructions:</h5>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Click "Copy Email Content" to copy the full email</li>
                <li>Open your email client (Gmail, Outlook, etc.)</li>
                <li>Create a new email to: {emailData.to}</li>
                <li>Paste the copied content</li>
                <li>Send the email</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
