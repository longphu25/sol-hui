import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { SontineCard, SontineCardContent } from '@/components/ui/sontine-card';
import { SontineButton } from '@/components/ui/sontine-button';

interface TokenAccount {
  pubkey: string;
  mint: string;
  balance: number;
  symbol: string;
  decimals: number;
  usdValue?: number;
}

interface AccountUiTokenAccountsProps {
  address: string;
}

export function AccountUiTokenAccounts({ address }: AccountUiTokenAccountsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Mock token accounts data - in a real app this would be fetched
  const mockTokenAccounts: TokenAccount[] = useMemo(() => [
    {
      pubkey: 'H1hy8QynU7Xm5QDtGGQyDqDPpTzv1',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      balance: 1250.50,
      decimals: 6,
      usdValue: 1250.50,
    },
    {
      pubkey: 'A2bC3dE4fG5hI6jK7lM8nO9pQ0rS1',
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      balance: 500.00,
      decimals: 6,
      usdValue: 500.00,
    },
    {
      pubkey: 'T3uV4wX5yZ6aB7cD8eF9gH0iJ1kL2',
      mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      symbol: 'RAY',
      balance: 125.75,
      decimals: 6,
      usdValue: 245.32,
    },
  ], []);

  const isLoading = false;
  const isError = false;
  const error = null;

  const ellipsify = (str: string, len: number = 4) => {
    if (str.length > 30) {
      return `${str.substring(0, len)}...${str.substring(str.length - len, str.length)}`;
    }
    return str;
  };

  const paginatedTokens = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return mockTokenAccounts.slice(start, end);
  }, [mockTokenAccounts, currentPage, itemsPerPage]);

  const numberOfPages = useMemo(() => {
    return Math.ceil(mockTokenAccounts.length / itemsPerPage);
  }, [mockTokenAccounts.length, itemsPerPage]);

  // In a real app, you'd use the address to fetch token accounts
  console.log('Fetching token accounts for address:', address);

  return (
    <div className="space-y-4">
      <AppText variant="titleMedium" className="text-gray-900 font-medium">
        Token Accounts
      </AppText>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B49F]"></div>
          <AppText variant="bodyMedium" className="text-gray-600 ml-3">
            Loading token accounts...
          </AppText>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <AppText variant="bodyMedium" className="text-red-700">
            Error loading token accounts
          </AppText>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {mockTokenAccounts.length === 0 ? (
            <div className="text-center py-8">
              <AppText variant="titleMedium" className="text-gray-500 mb-2">
                No token accounts found
              </AppText>
              <AppText variant="bodyMedium" className="text-gray-400">
                This wallet doesn&apos;t have any SPL tokens yet
              </AppText>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTokens.map((token) => (
                <SontineCard key={token.pubkey} variant="default" padding="md">
                  <SontineCardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <AppText variant="titleSmall" className="text-white font-bold">
                            {token.symbol.substring(0, 2)}
                          </AppText>
                        </div>
                        <div>
                          <AppText variant="titleMedium" className="text-gray-900 mb-1 font-medium">
                            {token.symbol}
                          </AppText>
                          <AppText variant="bodySmall" className="text-gray-500 font-mono">
                            {ellipsify(token.mint)}
                          </AppText>
                          <AppText variant="bodySmall" className="text-gray-400 font-mono">
                            {ellipsify(token.pubkey)}
                          </AppText>
                        </div>
                      </div>

                      <div className="text-right">
                        <AppText variant="titleMedium" className="text-gray-900 mb-1 font-medium">
                          {token.balance.toLocaleString()}
                        </AppText>
                        {token.usdValue && (
                          <AppText variant="bodySmall" className="text-gray-500">
                            ${token.usdValue.toFixed(2)}
                          </AppText>
                        )}
                      </div>
                    </div>
                  </SontineCardContent>
                </SontineCard>
              ))}

              {/* Pagination */}
              {numberOfPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <AppText variant="bodySmall" className="text-gray-600">
                    Page {currentPage + 1} of {numberOfPages}
                  </AppText>
                  <div className="flex space-x-2">
                    <SontineButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft size={16} />
                    </SontineButton>
                    <SontineButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(numberOfPages - 1, currentPage + 1))}
                      disabled={currentPage === numberOfPages - 1}
                    >
                      <ChevronRight size={16} />
                    </SontineButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}