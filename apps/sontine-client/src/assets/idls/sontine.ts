import type { Idl } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import rawIdl from './sontine.json'

export type Sontine = typeof rawIdl

export const sontineIdl = rawIdl as unknown as Idl & Sontine

export const SONTINE_PROGRAM_ID = new PublicKey(rawIdl.address)
