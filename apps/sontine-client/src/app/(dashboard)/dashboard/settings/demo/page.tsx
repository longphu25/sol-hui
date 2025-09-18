'use client';

import React from 'react';
import { AppText } from '@/components/ui/app-text';
import { SontineCard, SontineCardContent, SontineCardHeader } from '@/components/ui/sontine-card';
import { SontineButton, SontineActionButton, SontineGradientButton } from '@/components/ui/sontine-button';
import { SontineInput } from '@/components/ui/sontine-input';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Palette, Zap, Type, Square, FileInput } from 'lucide-react';

export default function DemoPage() {
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen">
      <GradientBackground variant="full-spectrum" className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <AppText variant="displaySmall" className="text-white mb-2">
              Component Demo
            </AppText>
            <AppText variant="bodyLarge" className="text-white/90">
              Test and preview all Sontine UI components
            </AppText>
          </div>

          <div className="grid gap-8">
            {/* Gradient Backgrounds */}
            <SontineCard variant="elevated" padding="lg">
              <SontineCardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-[#00B49F]" />
                  <AppText variant="titleMedium">Gradient Backgrounds</AppText>
                </div>
              </SontineCardHeader>
              <SontineCardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['primary-accent', 'navy-primary', 'dark-primary', 'accent-light', 'full-spectrum', 'subtle-mint'].map((variant) => (
                    <div key={variant} className="aspect-square rounded-lg overflow-hidden">
                      <GradientBackground variant={variant as 'primary-accent' | 'navy-primary' | 'dark-primary' | 'accent-light' | 'full-spectrum' | 'subtle-mint'} className="w-full h-full flex items-center justify-center">
                        <AppText variant="labelSmall" className="text-white font-medium">
                          {variant}
                        </AppText>
                      </GradientBackground>
                    </div>
                  ))}
                </div>
              </SontineCardContent>
            </SontineCard>

            {/* Buttons */}
            <SontineCard variant="elevated" padding="lg">
              <SontineCardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-[#00B49F]" />
                  <AppText variant="titleMedium">Buttons</AppText>
                </div>
              </SontineCardHeader>
              <SontineCardContent>
                <div className="space-y-6">
                  <div>
                    <AppText variant="titleSmall" className="mb-3">SontineButton Variants</AppText>
                    <div className="flex flex-wrap gap-3">
                      <SontineButton variant="primary" size="md">Primary</SontineButton>
                      <SontineButton variant="accent" size="md">Accent</SontineButton>
                      <SontineButton variant="outline" size="md">Outline</SontineButton>
                      <SontineButton variant="ghost" size="md">Ghost</SontineButton>
                      <SontineButton variant="navy" size="md">Navy</SontineButton>
                    </div>
                  </div>

                  <div>
                    <AppText variant="titleSmall" className="mb-3">Button Sizes</AppText>
                    <div className="flex flex-wrap items-center gap-3">
                      <SontineButton variant="primary" size="sm">Small</SontineButton>
                      <SontineButton variant="primary" size="md">Medium</SontineButton>
                      <SontineButton variant="primary" size="lg">Large</SontineButton>
                    </div>
                  </div>

                  <div>
                    <AppText variant="titleSmall" className="mb-3">Action Button with Loading</AppText>
                    <div className="flex gap-3">
                      <SontineActionButton
                        variant="primary"
                        size="md"
                        onClick={handleLoadingDemo}
                        isLoading={isLoading}
                        loadingText="Loading..."
                      >
                        Click to Test Loading
                      </SontineActionButton>
                    </div>
                  </div>

                  <div>
                    <AppText variant="titleSmall" className="mb-3">Gradient Buttons</AppText>
                    <div className="flex gap-3">
                      <SontineGradientButton size="md">Gradient Primary</SontineGradientButton>
                      <SontineGradientButton variant="accent" size="md">Gradient Accent</SontineGradientButton>
                    </div>
                  </div>
                </div>
              </SontineCardContent>
            </SontineCard>

            {/* Typography */}
            <SontineCard variant="elevated" padding="lg">
              <SontineCardHeader>
                <div className="flex items-center space-x-2">
                  <Type className="h-5 w-5 text-[#00B49F]" />
                  <AppText variant="titleMedium">Typography</AppText>
                </div>
              </SontineCardHeader>
              <SontineCardContent>
                <div className="space-y-4">
                  <AppText variant="displayLarge">Display Large</AppText>
                  <AppText variant="displayMedium">Display Medium</AppText>
                  <AppText variant="displaySmall">Display Small</AppText>
                  <AppText variant="headlineLarge">Headline Large</AppText>
                  <AppText variant="headlineMedium">Headline Medium</AppText>
                  <AppText variant="headlineSmall">Headline Small</AppText>
                  <AppText variant="titleLarge">Title Large</AppText>
                  <AppText variant="titleMedium">Title Medium</AppText>
                  <AppText variant="titleSmall">Title Small</AppText>
                  <AppText variant="bodyLarge">Body Large</AppText>
                  <AppText variant="bodyMedium">Body Medium</AppText>
                  <AppText variant="bodySmall">Body Small</AppText>
                  <AppText variant="labelLarge">Label Large</AppText>
                  <AppText variant="labelMedium">Label Medium</AppText>
                  <AppText variant="labelSmall">Label Small</AppText>
                </div>
              </SontineCardContent>
            </SontineCard>

            {/* Cards */}
            <SontineCard variant="elevated" padding="lg">
              <SontineCardHeader>
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-[#00B49F]" />
                  <AppText variant="titleMedium">Card Variants</AppText>
                </div>
              </SontineCardHeader>
              <SontineCardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <SontineCard variant="elevated" padding="md">
                    <AppText variant="titleSmall" className="mb-2">Elevated Card</AppText>
                    <AppText variant="bodySmall" className="text-gray-600">
                      This card has a shadow elevation effect.
                    </AppText>
                  </SontineCard>

                  <SontineCard variant="outlined" padding="md">
                    <AppText variant="titleSmall" className="mb-2">Outlined Card</AppText>
                    <AppText variant="bodySmall" className="text-gray-600">
                      This card has a border outline.
                    </AppText>
                  </SontineCard>

                  <SontineCard variant="default" padding="md">
                    <AppText variant="titleSmall" className="mb-2">Default Card</AppText>
                    <AppText variant="bodySmall" className="text-gray-600">
                      This card has a default appearance.
                    </AppText>
                  </SontineCard>
                </div>
              </SontineCardContent>
            </SontineCard>

            {/* Inputs */}
            <SontineCard variant="elevated" padding="lg">
              <SontineCardHeader>
                <div className="flex items-center space-x-2">
                  <FileInput className="h-5 w-5 text-[#00B49F]" />
                  <AppText variant="titleMedium">Input Components</AppText>
                </div>
              </SontineCardHeader>
              <SontineCardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <SontineInput
                      label="Default Input"
                      placeholder="Enter some text..."
                      value={inputValue}
                      onChangeText={setInputValue}
                    />

                    <SontineInput
                      label="Input with Helper Text"
                      placeholder="Helper text example"
                      helperText="This is helpful information about the input"
                    />

                    <SontineInput
                      label="Error State"
                      placeholder="This has an error"
                      error={true}
                      helperText="This field has an error"
                    />
                  </div>

                  <div className="space-y-4">
                    <SontineInput
                      label="Email Input"
                      type="email"
                      placeholder="user@example.com"
                    />

                    <SontineInput
                      label="Password Input"
                      type="password"
                      placeholder="Enter password"
                    />

                    <SontineInput
                      label="Number Input"
                      type="number"
                      placeholder="123"
                    />
                  </div>
                </div>
              </SontineCardContent>
            </SontineCard>
          </div>
        </div>
      </GradientBackground>
    </div>
  );
}