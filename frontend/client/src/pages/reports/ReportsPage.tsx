import React, { useState } from 'react';
import { FileText, Download, Mail, RefreshCw } from 'lucide-react';
import {
  useReportTemplates,
  useComplianceReport,
  useOperationsReport,
  useFinancialReport,
  useMemberReport,
  useRiskReport,
  useExportReportPDF,
  useExportReportExcel,
  useSendReportEmail,
} from '../../hooks/use-reporting';

type ReportType = 'compliance' | 'operations' | 'financial' | 'member' | 'risk';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('compliance');
  const [branchId, setBranchId] = useState<number | undefined>();
  const [daysBack, setDaysBack] = useState(1);
  const [recipients, setRecipients] = useState<string>('');
  const [subject, setSubject] = useState('Report Generated');

  const templatesQuery = useReportTemplates();
  const complianceQuery = useComplianceReport(branchId);
  const operationsQuery = useOperationsReport(daysBack, branchId);
  const financialQuery = useFinancialReport(undefined, branchId);
  const memberQuery = useMemberReport(branchId);
  const riskQuery = useRiskReport(branchId);

  const exportPDFMutation = useExportReportPDF();
  const exportExcelMutation = useExportReportExcel();
  const emailMutation = useSendReportEmail();

  const queryMap = {
    compliance: complianceQuery,
    operations: operationsQuery,
    financial: financialQuery,
    member: memberQuery,
    risk: riskQuery,
  };

  const currentQuery = queryMap[selectedReport];
  const reportData = currentQuery.data;

  const handleGenerateReport = () => {
    currentQuery.refetch();
  };

  const handleExportPDF = () => {
    if (reportData) {
      exportPDFMutation.mutate({
        reportType: selectedReport,
        reportData,
      });
    }
  };

  const handleExportExcel = () => {
    if (reportData) {
      exportExcelMutation.mutate({
        reportType: selectedReport,
        reportData,
      });
    }
  };

  const handleSendEmail = () => {
    if (reportData && recipients) {
      emailMutation.mutate({
        recipients: recipients.split(',').map(r => r.trim()),
        subject,
        reportData,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Reports
          </h1>
          <p className="text-gray-600 mt-1">Generate, export, and distribute reports</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h2>
            <div className="space-y-2">
              {[
                { id: 'compliance', label: 'Compliance Report' },
                { id: 'operations', label: 'Operations Report' },
                { id: 'financial', label: 'Financial Report' },
                { id: 'member', label: 'Member Report' },
                { id: 'risk', label: 'Risk Report' },
              ].map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id as ReportType)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    selectedReport === report.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {report.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {templatesQuery.data?.templates?.[selectedReport]?.name || 'Report'}
              </h2>

              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch (Optional)
                  </label>
                  <input
                    type="number"
                    value={branchId || ''}
                    onChange={(e) => setBranchId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Select branch"
                  />
                </div>

                {selectedReport === 'operations' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days Back
                    </label>
                    <input
                      type="number"
                      value={daysBack}
                      onChange={(e) => setDaysBack(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="365"
                    />
                  </div>
                )}

                <button
                  onClick={handleGenerateReport}
                  disabled={currentQuery.isLoading}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${currentQuery.isLoading ? 'animate-spin' : ''}`} />
                  Generate Report
                </button>
              </div>

              {reportData && (
                <>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(reportData.summary || {}).map(([key, value]) => (
                        <div key={key} className="bg-white rounded p-4">
                          <p className="text-sm text-gray-600 mb-1">
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Export & Share</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={handleExportPDF}
                        disabled={exportPDFMutation.isPending}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export PDF
                      </button>

                      <button
                        onClick={handleExportExcel}
                        disabled={exportExcelMutation.isPending}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export Excel
                      </button>
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Recipients (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500"
                      />

                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        onClick={handleSendEmail}
                        disabled={emailMutation.isPending || !recipients}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Send Email
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
