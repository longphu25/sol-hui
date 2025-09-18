# Migrated Logic from Mobile App

This document describes the logic that was copied from the mobile app to the sontine-client web application.

## Overview

The following functionality has been migrated from `apps/mobile/sontine/app/(tabs)/` to `apps/sontine-client/src/app/(dashboard)/dashboard/`:

### Tontines Section
- **Source**: `apps/mobile/sontine/app/(tabs)/tontines/`
- **Destination**: `apps/sontine-client/src/app/(dashboard)/dashboard/tontines/`

#### Files Migrated:
1. **Browse Tontines** (`browse.tsx` → `browse/page.tsx`)
   - Complete tontine group browsing functionality
   - Filtering by status (all, forming, active, completed, paused, cancelled)
   - Search functionality
   - Mock data integration (ready for blockchain integration)
   - Responsive grid layout

2. **Tontine Details** (`[id].tsx` → `[id]/page.tsx`)
   - Detailed tontine group view
   - Membership status display
   - Round information and progress tracking
   - Tabbed interface (Overview, Members, Activity)
   - Mock data for demonstration

#### Key Adaptations:
- **React Native → Next.js**: Converted React Native components to standard React with Tailwind CSS
- **Navigation**: Replaced `expo-router` with Next.js `Link` and `useParams`
- **Styling**: Converted from React Native styles to Tailwind CSS classes
- **Icons**: Replaced custom icon components with Lucide React icons
- **Mock Data**: Added mock data structures to simulate blockchain responses

### Account Section
- **Source**: `apps/mobile/sontine/app/(tabs)/account/`
- **Destination**: `apps/sontine-client/src/app/(dashboard)/dashboard/account/`

#### Files Migrated:
1. **Account Overview** (`index.tsx` → `page.tsx`)
   - Wallet balance display
   - Transaction history
   - Quick action buttons
   - Tabbed interface

2. **Send USDC** (`send.tsx` → `send/page.tsx`)
   - Form for sending USDC tokens
   - Address validation
   - Amount input with max balance
   - Transaction fee estimation
   - Success/error handling

3. **Receive USDC** (`receive.tsx` → `receive/page.tsx`)
   - Wallet address display
   - QR code functionality (placeholder)
   - Copy address functionality
   - Share functionality
   - Security notices

4. **SOL Airdrop** (`airdrop.tsx` → `airdrop/page.tsx`)
   - Testnet SOL airdrop functionality
   - Balance display
   - Transaction hash display
   - Network information
   - Usage guidelines

#### Key Adaptations:
- **Wallet Integration**: Replaced mobile wallet hooks with mock data (ready for web wallet integration)
- **Navigation**: Updated routing for Next.js
- **UI Components**: Converted to web-optimized components
- **State Management**: Simplified for web environment

## Navigation Updates

- **Dashboard Navigation**: Added Account section to the main navigation bar
- **Breadcrumbs**: Added back navigation links for better UX
- **Mobile Responsive**: Maintained mobile-first responsive design

## Dependencies Removed/Replaced

### Mobile-Specific Dependencies:
- `expo-router` → Next.js routing
- `expo-haptics` → Removed (web doesn't support haptics)
- React Native styling → Tailwind CSS
- Mobile-specific wallet hooks → Mock data (ready for web wallet integration)

### Web-Specific Additions:
- `lucide-react` for icons
- `next/navigation` for routing
- `next/link` for navigation
- Web clipboard API for copy functionality
- Web share API for sharing functionality

## Integration Notes

### Ready for Blockchain Integration:
1. **Mock Data Structures**: All mock data follows the expected blockchain data structure
2. **Hook Placeholders**: Functions are structured to easily replace mock data with real blockchain calls
3. **Type Safety**: TypeScript interfaces match expected blockchain responses

### Required for Full Integration:
1. **Wallet Connection**: Implement web wallet connection (Phantom, Solflare, etc.)
2. **Blockchain Hooks**: Replace mock data with actual Solana program calls
3. **Real-time Updates**: Add subscription to blockchain events
4. **Error Handling**: Implement proper blockchain error handling
5. **Loading States**: Add proper loading states for blockchain operations

## File Structure

```
apps/sontine-client/src/app/(dashboard)/dashboard/
├── tontines/
│   ├── page.tsx (existing - updated with browse link)
│   ├── browse/
│   │   └── page.tsx (new)
│   └── [id]/
│       └── page.tsx (new)
└── account/
    ├── page.tsx (new)
    ├── send/
    │   └── page.tsx (new)
    ├── receive/
    │   └── page.tsx (new)
    └── airdrop/
        └── page.tsx (new)
```

## Next Steps

1. **Component Library**: Consider creating shared components for common UI patterns
2. **State Management**: Implement proper state management for wallet and tontine data
3. **Real Integration**: Connect to actual Solana programs and wallet providers
4. **Testing**: Add comprehensive tests for the migrated functionality
5. **Optimization**: Optimize for web performance and SEO

## Notes

- All migrated code maintains the same business logic as the mobile app
- UI has been adapted for web while maintaining the same user experience
- Code is ready for easy integration with real blockchain functionality
- Mock data can be easily replaced with real API calls