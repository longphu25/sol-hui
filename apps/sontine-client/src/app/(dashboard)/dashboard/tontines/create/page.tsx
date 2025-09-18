'use client';

import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateTontineModal } from '@/components/tontines/create-tontine-modal';
import { useLocalTontines, CreateTontineInput } from '@/hooks/use-local-tontines';
import { useAuth } from '@/components/auth/auth-provider';

export default function CreateGroupPage() {
  const router = useRouter();
  const { addTontine } = useLocalTontines();
  const { account } = useAuth();
  const walletAddress = account?.address ?? null;
  const [open, setOpen] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);

  const navigateBack = React.useCallback(() => {
    router.push('/dashboard/tontines/browse');
  }, [router]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    navigateBack();
  }, [navigateBack]);

  const handleCreate = React.useCallback(
    (input: CreateTontineInput) => {
      const created = addTontine({ ...input, creatorAddress: walletAddress });
      setMessage(`Created ${created.name}. You can now invite members from the browse view.`);
      setOpen(false);
      navigateBack();
    },
    [addTontine, navigateBack]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#00B49F]/10 text-[#00B49F]">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">Create a tontine group</h1>
        <p className="text-gray-600">
          Creation now happens through a streamlined popup so you can set up a group without leaving the browse
          experience. The creator will open automatically, or you can launch it again below.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={navigateBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to browse
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Launch creator
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}
      </div>

      <CreateTontineModal open={open} onClose={handleClose} onCreate={handleCreate} />
    </div>
  );
}
