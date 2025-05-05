export interface SearchResult {
	ticker: string;
	assetType: string;
	countryCode: string;
	isActive: boolean;
	name: string;
	openFIGI: string;
	permaTicker: string;
}

export interface StockPrices {
	ticker: string;
	timestamp: string;
	quoteTimestamp: string | null;
	lastSaleTimestamp: string | null;
	last: number | null;
	lastSize: number | null;
	tngoLast: number;
	prevClose: number;
	open: number;
	high: number;
	low: number;
	mid: number;
	volume: number;
	bidSize: number | null;
	bidPrice: number | null;
	askSize: number | null;
	askPrice: number | null;
}
