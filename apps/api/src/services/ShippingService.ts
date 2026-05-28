import Settings from '../models/Settings.js';

export class ShippingService {
  /**
   * Calculates the final charge presented to the customer based on a base carrier rate and unit type.
   * Formulas:
   * - Parcel: base_cost + max(50% of cost, $8 min) + handling
   * - Mailer: base_cost + max(40% of cost, $5 min) + handling
   * - Pallet / Freight: base_cost + max(18% of cost, $75 min) + handling
   */
  public static async calculateCustomerCharge(carrierRate: number, unitType: 'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece' = 'Parcel'): Promise<number> {


    let spreadPct = 0.50; // default for Parcel
    let spreadMin = 8.00;
    let handlingFee = 5.00;

    if (unitType === 'Mailer') {
      spreadPct = 0.40;
      spreadMin = 5.00;
      handlingFee = 2.00;
    } else if (unitType === 'Pallet' || unitType === 'Freight Piece') {
      spreadPct = 0.18;
      spreadMin = 75.00;
      handlingFee = 50.00;
    }

    try {
      const typeLower = unitType === 'Freight Piece' ? 'pallet' : unitType.toLowerCase();
      const pctSet = await Settings.findOne({ key: `shipping_spread_${typeLower}_pct` });
      const minSet = await Settings.findOne({ key: `shipping_spread_${typeLower}_min` });
      const feeSet = await Settings.findOne({ key: `shipping_fee_${typeLower}` });

      if (pctSet) spreadPct = parseFloat(pctSet.value) / 100;
      if (minSet) spreadMin = parseFloat(minSet.value);
      if (feeSet) handlingFee = parseFloat(feeSet.value);
    } catch (e) {
      console.error('[Shipping Service] Settings load error, using defaults:', e);
    }

    const spread = Math.max(carrierRate * spreadPct, spreadMin);
    const totalCharge = carrierRate + spread + handlingFee;

    return Math.round(totalCharge * 100) / 100;
  }

  // Placeholder for fetching actual rates from Stallion API
  public static async fetchStallionRates(dimensions: any, unitType: 'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece' = 'Parcel') {
    const baseRates = [
      { id: 'stallion-1', carrier: 'Canada Post', serviceName: 'Expedited Parcel', baseRate: 14.50 },
      { id: 'stallion-2', carrier: 'UPS', serviceName: 'Standard', baseRate: 16.20 }
    ];

    return Promise.all(baseRates.map(async rate => ({
      id: rate.id,
      provider: 'Stallion' as const,
      carrier: rate.carrier,
      serviceName: rate.serviceName,
      baseRate: rate.baseRate,
      customerCharge: await this.calculateCustomerCharge(rate.baseRate, unitType)
    })));
  }

  // Placeholder for fetching actual rates from Freightcom API
  public static async fetchFreightcomRates(dimensions: any, unitType: 'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece' = 'Parcel') {
    const baseRates = [
      { id: 'freightcom-1', carrier: 'Canpar', serviceName: 'Ground', baseRate: 12.80 },
      { id: 'freightcom-2', carrier: 'FedEx', serviceName: 'Ground', baseRate: 15.10 }
    ];

    return Promise.all(baseRates.map(async rate => ({
      id: rate.id,
      provider: 'Freightcom' as const,
      carrier: rate.carrier,
      serviceName: rate.serviceName,
      baseRate: rate.baseRate,
      customerCharge: await this.calculateCustomerCharge(rate.baseRate, unitType)
    })));
  }

  public static async getAllRates(dimensions: any, unitType: 'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece' = 'Parcel') {
    const [stallionRates, freightcomRates] = await Promise.all([
      this.fetchStallionRates(dimensions, unitType),
      this.fetchFreightcomRates(dimensions, unitType)
    ]);
    
    return [...stallionRates, ...freightcomRates];
  }
}
