import { TOKENS } from './tokens.js';
import { PROVIDERS } from './providers.js';
import { SwapState, Token, Provider } from './types.js';

class SwapApp {
    private state: SwapState;
    private currentModal: 'token' | 'provider' | null = null;
    private currentTokenType: 'pay' | 'receive' | null = null;

    constructor() {
        this.state = {
            payToken: TOKENS[0], // ETH
            receiveToken: TOKENS[1], // BTC
            payAmount: 1.0,
            receiveAmount: 0,
            provider: PROVIDERS[0], // Thorchain
            isSwapped: false
        };
        
        this.initializeApp();
    }

    private initializeApp(): void {
        this.setupEventListeners();
        this.updateUI();
        this.calculateSwap();
    }

    private setupEventListeners(): void {
        // Token selectors
        document.getElementById('payTokenSelector')?.addEventListener('click', () => {
            this.openTokenModal('pay');
        });

        document.getElementById('receiveTokenSelector')?.addEventListener('click', () => {
            this.openTokenModal('receive');
        });

        // Provider selector
        document.getElementById('providerSelector')?.addEventListener('click', () => {
            this.openProviderModal();
        });

        // Swap button
        document.getElementById('swapButton')?.addEventListener('click', () => {
            this.swapTokens();
        });

        // Amount input
        document.getElementById('payAmount')?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.state.payAmount = parseFloat(target.value) || 0;
            this.calculateSwap();
        });

        // Modal close buttons
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeProviderModal')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on backdrop click
        document.getElementById('tokenModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        document.getElementById('providerModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }

    private openTokenModal(type: 'pay' | 'receive'): void {
        this.currentModal = 'token';
        this.currentTokenType = type;
        
        const modal = document.getElementById('tokenModal');
        const modalTitle = document.getElementById('modalTitle');
        const tokenList = document.getElementById('tokenList');
        
        if (modal && modalTitle && tokenList) {
            modalTitle.textContent = `Select ${type === 'pay' ? 'Pay' : 'Receive'} Token`;
            this.renderTokenList(tokenList, type);
            modal.classList.add('show');
        }
    }

    private openProviderModal(): void {
        this.currentModal = 'provider';
        
        const modal = document.getElementById('providerModal');
        const providerList = document.getElementById('providerList');
        
        if (modal && providerList) {
            this.renderProviderList(providerList);
            modal.classList.add('show');
        }
    }

    private closeModal(): void {
        const tokenModal = document.getElementById('tokenModal');
        const providerModal = document.getElementById('providerModal');
        
        tokenModal?.classList.remove('show');
        providerModal?.classList.remove('show');
        
        this.currentModal = null;
        this.currentTokenType = null;
    }

    private renderTokenList(container: HTMLElement, type: 'pay' | 'receive'): void {
        const currentToken = type === 'pay' ? this.state.payToken : this.state.receiveToken;
        
        container.innerHTML = TOKENS.map(token => `
            <div class="token-item ${token.symbol === currentToken.symbol ? 'selected' : ''}" 
                 data-symbol="${token.symbol}">
                <img src="${token.icon}" alt="${token.symbol}" class="token-icon">
                <div>
                    <div class="token-symbol">${token.symbol}</div>
                    <div class="token-name">${token.name}</div>
                </div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.token-item').forEach(item => {
            item.addEventListener('click', () => {
                const symbol = item.getAttribute('data-symbol');
                if (symbol) {
                    this.selectToken(symbol, type);
                }
            });
        });
    }

    private renderProviderList(container: HTMLElement): void {
        const supportedProviders = this.getSupportedProviders(
            this.state.payToken.symbol, 
            this.state.receiveToken.symbol
        );
        
        container.innerHTML = supportedProviders.map(provider => `
            <div class="provider-item ${provider.id === this.state.provider.id ? 'selected' : ''}" 
                 data-id="${provider.id}">
                <div class="provider-info">
                    <span class="provider-icon">${provider.icon}</span>
                    <div>
                        <div class="provider-name">${provider.name}</div>
                        <div class="provider-description">${provider.description}</div>
                    </div>
                </div>
                <div class="provider-fee">${provider.fee}%</div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.provider-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                if (id) {
                    this.selectProvider(id);
                }
            });
        });
    }

    private getSupportedProviders(fromToken: string, toToken: string): Provider[] {
        return PROVIDERS.filter(provider => 
            provider.supportedTokens.includes(fromToken) && 
            provider.supportedTokens.includes(toToken)
        );
    }

    private selectToken(symbol: string, type: 'pay' | 'receive'): void {
        const token = TOKENS.find(t => t.symbol === symbol);
        if (!token) return;

        if (type === 'pay') {
            this.state.payToken = token;
        } else {
            this.state.receiveToken = token;
        }

        this.closeModal();
        this.updateUI();
        this.calculateSwap();
    }

    private selectProvider(id: string): void {
        const provider = PROVIDERS.find(p => p.id === id);
        if (!provider) return;

        this.state.provider = provider;
        this.closeModal();
        this.updateUI();
        this.calculateSwap();
    }

    private swapTokens(): void {
        const temp = this.state.payToken;
        this.state.payToken = this.state.receiveToken;
        this.state.receiveToken = temp;
        this.state.isSwapped = !this.state.isSwapped;
        
        this.updateUI();
        this.calculateSwap();
    }

    private calculateSwap(): void {
        if (this.state.payAmount <= 0) {
            this.state.receiveAmount = 0;
            this.updateUI();
            return;
        }

        // Calculate conversion rate based on token prices
        // rate = fromToken.price / toToken.price
        const rate = this.state.payToken.price / this.state.receiveToken.price;
        
        // Use higher precision for small amounts
        const payAmountPrecise = this.state.payAmount;
        const ratePrecise = rate;
        
        // Calculate the amount before fees with higher precision
        const toAmount = payAmountPrecise * ratePrecise;
        
        // Apply fee with higher precision
        const fee = (toAmount * this.state.provider.fee) / 100;
        const finalAmount = toAmount - fee;
        
        // Round to appropriate decimal places based on token decimals
        const receiveDecimals = this.state.receiveToken.decimals;
        const roundedAmount = Math.round(finalAmount * Math.pow(10, receiveDecimals)) / Math.pow(10, receiveDecimals);
        
        this.state.receiveAmount = Math.max(0, roundedAmount);
        
        // Debug logging
        console.log(`Converting ${this.state.payAmount} ${this.state.payToken.symbol} ($${this.state.payToken.price}) to ${this.state.receiveToken.symbol} ($${this.state.receiveToken.price})`);
        console.log(`Rate: ${ratePrecise}, To Amount: ${toAmount}, Fee: ${fee}, Final: ${finalAmount}, Rounded: ${roundedAmount}`);
        
        this.updateUI();
    }

    private updateUI(): void {
        this.updateTokenDisplay('payTokenSelector', this.state.payToken);
        this.updateTokenDisplay('receiveTokenSelector', this.state.receiveToken);
        this.updateProviderDisplay();
        this.updateAmounts();
    }

    private updateTokenDisplay(selectorId: string, token: Token): void {
        const selector = document.getElementById(selectorId);
        if (!selector) return;

        const icon = selector.querySelector('.token-icon') as HTMLImageElement;
        const symbol = selector.querySelector('.token-symbol') as HTMLElement;

        if (icon) icon.src = token.icon;
        if (symbol) symbol.textContent = token.symbol;
    }

    private updateProviderDisplay(): void {
        const selector = document.getElementById('providerSelector');
        if (!selector) return;

        const name = selector.querySelector('.provider-name') as HTMLElement;
        if (name) name.textContent = this.state.provider.name;
    }

    private updateAmounts(): void {
        const payAmountInput = document.getElementById('payAmount') as HTMLInputElement;
        const receiveAmountDisplay = document.getElementById('receiveAmount') as HTMLElement;
        const payFiatAmount = document.getElementById('payFiatAmount') as HTMLElement;
        const receiveFiatAmount = document.getElementById('receiveFiatAmount') as HTMLElement;

        if (payAmountInput) {
            payAmountInput.value = this.state.payAmount.toString();
        }

        if (receiveAmountDisplay) {
            receiveAmountDisplay.textContent = this.formatTokenAmount(this.state.receiveAmount);
        }

        if (payFiatAmount) {
            const fiatValue = this.calculateFiatValue(this.state.payAmount, this.state.payToken);
            payFiatAmount.textContent = this.formatCurrency(fiatValue);
        }

        if (receiveFiatAmount) {
            const fiatValue = this.calculateFiatValue(this.state.receiveAmount, this.state.receiveToken);
            receiveFiatAmount.textContent = this.formatCurrency(fiatValue);
        }
    }

    private calculateFiatValue(amount: number, token: Token): number {
        return amount * token.price;
    }

    private formatCurrency(amount: number, decimals: number = 2): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount);
    }

    private formatTokenAmount(amount: number, decimals: number = 4): string {
        // For very small amounts, show more decimal places
        const displayDecimals = amount < 0.0001 ? 8 : decimals;
        
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: displayDecimals
        }).format(amount);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SwapApp();
});
