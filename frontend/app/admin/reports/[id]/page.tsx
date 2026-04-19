'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Navbar } from '@/components/navbar';
import { StatusBadge } from '@/components/status-badge';
import { CategoryIcon } from '@/components/category-icon';
import { type ReportCategory } from '@/lib/mock-data';

interface BackendReport {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  image_url: string;
  status: string;
  vote_count: number;
  heat_score: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  latitude: number;
  longitude: number;
  author: { id: string; display_name: string };
}

interface AdminEditReportPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditReportPage({ params }: AdminEditReportPageProps) {
  const router = useRouter();
  const { id } = require('react').use(params) || {};
  const { token } = useAuth();

  const [report, setReport] = useState<BackendReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [status, setStatus] = useState('submitted');
  const [resolution, setResolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setFetchError(null);
    apiGet<{ report: BackendReport }>(`/api/reports/${id}`, token ?? undefined)
      .then(({ report: fetched }) => {
        setReport(fetched);
        setStatus(fetched.status);
      })
      .catch((err: Error) => {
        setFetchError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-neutral-400">Loading report...</p>
          </div>
        </main>
      </div>
    );
  }

  if (fetchError || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-white mb-2">Report Not Found</h1>
            <p className="text-neutral-400 mb-8">
              {fetchError ?? "The report you're looking for doesn't exist."}
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiPatch(
        `/api/reports/${report.id}/status`,
        { new_status: status, comment: resolution.trim() || undefined },
        token ?? undefined,
      );
      router.back();
    } catch (err) {
      console.error('[handleSave]', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Report</h1>
          <p className="text-neutral-400">Manage and resolve urban issues</p>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-8">
          {/* Report Info */}
          <div className="mb-8 pb-8 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white mb-6">Report Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Title</label>
                <input
                  type="text"
                  defaultValue={report.title}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700/50 border border-neutral-600 text-neutral-300 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Category</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-700/50 border border-neutral-600">
                  <CategoryIcon category={report.category as ReportCategory} size="sm" />
                  <span className="text-neutral-300 capitalize">{report.category}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={`${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700/50 border border-neutral-600 text-neutral-300 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Severity Level</label>
                <input
                  type="text"
                  defaultValue={`Heat score: ${report.heat_score.toFixed(1)} (${report.vote_count} votes)`}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700/50 border border-neutral-600 text-neutral-300 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="mb-8 pb-8 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white mb-6">Status Management</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Current Status</label>
                <StatusBadge status={status as any} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700/50 border border-neutral-600 text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Resolution Notes</h2>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Add notes about the resolution or actions taken..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-neutral-700/50 border border-neutral-600 text-white placeholder-neutral-500 focus:border-cyan-500/50 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Alerts */}
          {status !== 'resolved' && (
            <div className="mb-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">Pending Resolution</p>
                <p className="text-amber-200/70 text-sm">This report is not yet marked as resolved. Consider adding resolution notes.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg bg-neutral-700/50 text-neutral-300 font-medium hover:bg-neutral-700 transition-colors border border-neutral-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
