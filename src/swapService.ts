import { Token, Provider, SwapQuote, SwapState } from './types.js';

export class SwapService {
    private tokens: Map<string, Token> = new Map();
    private providers: Map<string, Provider> = new Map();

    constructor(tokens: Token[], providers: Provider[]) {
        tokens.forEach(token => this.tokens.set(token.symbol, token));
        providers.forEach(provider => this.providers.set(provider.id, provider));
    }

    getToken(symbol: string): Token | undefined {
        return this.tokens.get(symbol);
    }

    getProvider(id: string): Provider | undefined {
        return this.providers.get(id);
    }

    getAllTokens(): Token[] {
        return Array.from(this.tokens.values());
    }

    getAllProviders(): Provider[] {
        return Array.from(this.providers.values());
    }

    getSupportedProviders(fromToken: string, toToken: string): Provider[] {
        return this.getAllProviders().filter(provider => 
            provider.supportedTokens.includes(fromToken) && 
            provider.supportedTokens.includes(toToken)
        );
    }

    // Simulate getting a swap quote
    getSwapQuote(fromToken: Token, toToken: Token, fromAmount: number, provider: Provider): SwapQuote {
        // Simple price calculation with some simulated market dynamics
        const baseRate = fromToken.price / toToken.price;
        
        // Add some randomness to simulate market fluctuations
        const marketVariation = 0.95 + Math.random() * 0.1; // ±5% variation
        const rate = baseRate * marketVariation;
        
        // Calculate amounts
        const toAmount = fromAmount * rate;
        const fee = (toAmount * provider.fee) / 100;
        const minimumReceived = toAmount - fee;
        
        // Simulate price impact (higher for larger amounts)
        const priceImpact = Math.min(fromAmount * 0.001, 0.05); // Max 5% impact
        
        return {
            fromToken,
            toToken,
            fromAmount,
            toAmount: toAmount - fee,
            provider,
            fee,
            priceImpact,
            minimumReceived
        };
    }

    // Calculate fiat value
    calculateFiatValue(amount: number, token: Token): number {
        return amount * token.price;
    }

    // Format currency
    formatCurrency(amount: number, decimals: number = 2): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount);
    }

    // Format token amount
    formatTokenAmount(amount: number, decimals: number = 4): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        }).format(amount);
    }
}
