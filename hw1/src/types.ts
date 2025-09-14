export interface Token {
    symbol: string;
    name: string;
    icon: string;
    address: string;
    decimals: number;
    price: number; // USD price
}

export interface Provider {
    id: string;
    name: string;
    description: string;
    fee: number; // percentage
    icon: string;
    supportedTokens: string[];
}

export interface SwapState {
    payToken: Token;
    receiveToken: Token;
    payAmount: number;
    receiveAmount: number;
    provider: Provider;
    isSwapped: boolean; // true if pay and receive are swapped
}
