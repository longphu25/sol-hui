import React from 'react';
import { useRouter } from 'next/navigation';
import { Send, Download, Gift } from 'lucide-react';
import { SontineButton } from '@/components/ui/sontine-button';

export function AccountUiButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-3 justify-center">
      <SontineButton
        variant="outline"
        size="md"
        onClick={() => router.push('/dashboard/account/airdrop')}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <Gift size={18} className="mr-2" />
        Airdrop
      </SontineButton>
      <SontineButton
        variant="outline"
        size="md"
        onClick={() => router.push('/dashboard/account/send')}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <Send size={18} className="mr-2" />
        Send
      </SontineButton>
      <SontineButton
        variant="outline"
        size="md"
        onClick={() => router.push('/dashboard/account/receive')}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <Download size={18} className="mr-2" />
        Receive
      </SontineButton>
    </div>
  );
}