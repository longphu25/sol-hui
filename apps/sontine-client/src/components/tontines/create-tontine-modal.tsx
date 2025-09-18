'use client';

import React from 'react';
import { X, Users, DollarSign, Calendar } from 'lucide-react';
import { CreateTontineInput } from '@/hooks/use-local-tontines';

interface CreateTontineModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateTontineInput) => void;
}

interface FormState {
  name: string;
  description: string;
  contributionAmount: string;
  maxMembers: string;
  minMembersToStart: string;
  totalRounds: string;
  selectionMethod: 'fixedOrder' | 'random' | 'auction';
  cycleDuration: 'weekly' | 'monthly' | 'custom';
  customDurationDays: string;
  auctionDurationHours: string;
  minBidIncrementPercent: string;
  maxInterestPercent: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const defaultFormState: FormState = {
  name: '',
  description: '',
  contributionAmount: '100',
  maxMembers: '10',
  minMembersToStart: '5',
  totalRounds: '10',
  selectionMethod: 'fixedOrder',
  cycleDuration: 'monthly',
  customDurationDays: '',
  auctionDurationHours: '24',
  minBidIncrementPercent: '1',
  maxInterestPercent: '20',
};

export function CreateTontineModal({ open, onClose, onCreate }: CreateTontineModalProps) {
  const [form, setForm] = React.useState<FormState>(defaultFormState);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setForm(defaultFormState);
    setErrors({});
    setIsSubmitting(false);
  }, [open]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Group name is required';
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Provide a short description';
    }

    const contributionAmount = Number(form.contributionAmount);
    if (Number.isNaN(contributionAmount) || contributionAmount <= 0) {
      nextErrors.contributionAmount = 'Contribution must be greater than 0';
    }

    const maxMembers = Number(form.maxMembers);
    if (!Number.isInteger(maxMembers) || maxMembers < 2) {
      nextErrors.maxMembers = 'At least two members are required';
    }

    const minMembersToStart = Number(form.minMembersToStart);
    if (!Number.isInteger(minMembersToStart) || minMembersToStart < 2 || minMembersToStart > maxMembers) {
      nextErrors.minMembersToStart = `Min members must be between 2 and ${Math.max(maxMembers, 2)}`;
    }

    const totalRounds = Number(form.totalRounds);
    if (!Number.isInteger(totalRounds) || totalRounds < 1) {
      nextErrors.totalRounds = 'Total rounds must be at least 1';
    }

    if (form.cycleDuration === 'custom') {
      const customDays = Number(form.customDurationDays);
      if (!Number.isInteger(customDays) || customDays < 1) {
        nextErrors.customDurationDays = 'Custom duration must be at least 1 day';
      }
    }

    if (form.selectionMethod === 'auction') {
      const durationHours = Number(form.auctionDurationHours);
      if (!Number.isFinite(durationHours) || durationHours < 1) {
        nextErrors.auctionDurationHours = 'Auction duration must be at least 1 hour';
      }

      const minBidPercent = Number(form.minBidIncrementPercent);
      if (!Number.isFinite(minBidPercent) || minBidPercent < 0.01 || minBidPercent > 100) {
        nextErrors.minBidIncrementPercent = 'Min bid increment must be between 0.01% and 100%';
      }

      const maxInterestPercent = Number(form.maxInterestPercent);
      if (!Number.isFinite(maxInterestPercent) || maxInterestPercent < 1 || maxInterestPercent > 100) {
        nextErrors.maxInterestPercent = 'Max interest rate must be between 1% and 100%';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const selectionMethod = form.selectionMethod;
      const cycleDuration = form.cycleDuration;
      const customDurationDays =
        cycleDuration === 'custom' ? Number(form.customDurationDays || '0') || null : null;

      let auctionConfig = null;
      if (selectionMethod === 'auction') {
        const durationHours = Number(form.auctionDurationHours);
        const minBidPercent = Number(form.minBidIncrementPercent);
        const maxInterestPercent = Number(form.maxInterestPercent);

        auctionConfig = {
          auctionDuration: Math.round(durationHours * 3600),
          minBidIncrement: Math.round(minBidPercent * 100),
          maxInterestRate: Math.round(maxInterestPercent * 100),
        };
      }

      onCreate({
        name: form.name.trim(),
        description: form.description.trim(),
        contributionAmount: Number(form.contributionAmount),
        maxMembers: Number(form.maxMembers),
        minMembersToStart: Number(form.minMembersToStart),
        totalRounds: Number(form.totalRounds),
        selectionMethod,
        cycleDuration,
        customDurationDays,
        auctionConfig,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const chooseSelectionMethod = (value: FormState['selectionMethod']) => {
    setForm((prev) => ({ ...prev, selectionMethod: value }));
  };

  const chooseCycleDuration = (value: FormState['cycleDuration']) => {
    setForm((prev) => ({ ...prev, cycleDuration: value }));
  };

  const selectionMethodLabel = React.useMemo(() => {
    switch (form.selectionMethod) {
      case 'random':
        return 'Random';
      case 'fixedOrder':
        return 'Fixed order';
      case 'auction':
        return 'Auction';
      default:
        return 'Unknown';
    }
  }, [form.selectionMethod]);

  const cycleLabel = React.useMemo(() => {
    if (form.cycleDuration === 'custom') {
      const days = form.customDurationDays || '0';
      return `${days} day${days === '1' ? '' : 's'}`;
    }
    return form.cycleDuration.charAt(0).toUpperCase() + form.cycleDuration.slice(1);
  }, [form.cycleDuration, form.customDurationDays]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Create Group</p>
            <h2 className="text-2xl font-semibold text-gray-900">Launch a new tontine</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="tontine-name">
              Group name
            </label>
            <input
              id="tontine-name"
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="e.g. Family Savings Circle"
              className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="tontine-description">
              Description
            </label>
            <textarea
              id="tontine-description"
              value={form.description}
              onChange={updateField('description')}
              placeholder="Share the purpose of this tontine"
              className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent min-h-[90px] ${
                errors.description ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="tontine-contribution">
                Contribution (USDC)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="tontine-contribution"
                  type="number"
                  min="1"
                  value={form.contributionAmount}
                  onChange={updateField('contributionAmount')}
                  className={`w-full rounded-xl border pl-9 pr-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.contributionAmount ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.contributionAmount && <p className="text-sm text-red-500">{errors.contributionAmount}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="tontine-max-members">
                Max members
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="tontine-max-members"
                  type="number"
                  min="2"
                  value={form.maxMembers}
                  onChange={updateField('maxMembers')}
                  className={`w-full rounded-xl border pl-9 pr-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.maxMembers ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.maxMembers && <p className="text-sm text-red-500">{errors.maxMembers}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="tontine-min-members">
                Min members to start
              </label>
              <input
                id="tontine-min-members"
                type="number"
                min="2"
                value={form.minMembersToStart}
                onChange={updateField('minMembersToStart')}
                className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                  errors.minMembersToStart ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.minMembersToStart && <p className="text-sm text-red-500">{errors.minMembersToStart}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="tontine-rounds">
                Total rounds
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="tontine-rounds"
                  type="number"
                  min="1"
                  value={form.totalRounds}
                  onChange={updateField('totalRounds')}
                  className={`w-full rounded-xl border pl-9 pr-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.totalRounds ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.totalRounds && <p className="text-sm text-red-500">{errors.totalRounds}</p>}
          </div>
        </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Selection method</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(
                [
                  { label: 'Random', value: 'random' },
                  { label: 'Fixed order', value: 'fixedOrder' },
                  { label: 'Auction', value: 'auction' },
                ] as const
              ).map((option) => {
                const isActive = form.selectionMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => chooseSelectionMethod(option.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-[#00B49F] bg-[#00B49F]/10 text-[#00B49F]'
                        : 'border-gray-200 text-gray-700 hover:border-[#00B49F]' }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {form.selectionMethod === 'auction' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="auction-duration">
                  Auction duration (hours)
                </label>
                <input
                  id="auction-duration"
                  type="number"
                  min="1"
                  value={form.auctionDurationHours}
                  onChange={updateField('auctionDurationHours')}
                  className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.auctionDurationHours ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.auctionDurationHours && (
                  <p className="text-sm text-red-500">{errors.auctionDurationHours}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="min-bid-increment">
                  Min bid increment (%)
                </label>
                <input
                  id="min-bid-increment"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.minBidIncrementPercent}
                  onChange={updateField('minBidIncrementPercent')}
                  className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.minBidIncrementPercent ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.minBidIncrementPercent && (
                  <p className="text-sm text-red-500">{errors.minBidIncrementPercent}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="max-interest-rate">
                  Max interest rate (%)
                </label>
                <input
                  id="max-interest-rate"
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.maxInterestPercent}
                  onChange={updateField('maxInterestPercent')}
                  className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.maxInterestPercent ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.maxInterestPercent && (
                  <p className="text-sm text-red-500">{errors.maxInterestPercent}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Cycle duration</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(
                [
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Custom', value: 'custom' },
                ] as const
              ).map((option) => {
                const isActive = form.cycleDuration === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => chooseCycleDuration(option.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-[#00B49F] bg-[#00B49F]/10 text-[#00B49F]'
                        : 'border-gray-200 text-gray-700 hover:border-[#00B49F]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {form.cycleDuration === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="custom-duration-days">
                  Custom cycle length (days)
                </label>
                <input
                  id="custom-duration-days"
                  type="number"
                  min="1"
                  value={form.customDurationDays}
                  onChange={updateField('customDurationDays')}
                  className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B49F] focus:border-transparent ${
                    errors.customDurationDays ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.customDurationDays && (
                  <p className="text-sm text-red-500">{errors.customDurationDays}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-[#00B49F]/40 bg-[#00B49F]/5 px-5 py-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Summary</p>
            <p className="text-sm text-gray-600">
              Each round collects <span className="font-semibold text-gray-900">{form.contributionAmount || '0'} USDC</span>
              {' '}from up to{' '}
              <span className="font-semibold text-gray-900">{form.maxMembers || '0'} members</span>. The pool will run for{' '}
              <span className="font-semibold text-gray-900">{form.totalRounds || '0'} rounds</span> using a{' '}
              <span className="font-semibold text-gray-900">{selectionMethodLabel}</span>{' '}
              selection on a{' '}
              <span className="font-semibold text-gray-900">{cycleLabel}</span>{' '}
              cycle. At least{' '}
              <span className="font-semibold text-gray-900">{form.minMembersToStart || '0'} participants</span> are required to activate.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating…' : 'Create tontine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
