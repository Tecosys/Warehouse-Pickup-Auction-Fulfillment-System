export class ShippingService {
  /**
   * Calculates the final charge presented to the customer based on a base carrier rate.
   * Formula:
   * 1. base_carrier_total = carrier_rate + 13% HST
   * 2. markup = base_carrier_total / 2
   * 3. subtotal = base_carrier_total + markup + $2 handling fee
   * 4. final_charge = subtotal + 13% HST
   */
  public static calculateCustomerCharge(carrierRate: number): number {
    const hstRate = 0.13;
    
    // 1. Base carrier total
    const baseCarrierTotal = carrierRate * (1 + hstRate);
    
    // 2. Markup
    const markup = baseCarrierTotal / 2;
    
    // 3. Subtotal
    const subtotal = baseCarrierTotal + markup + 2.00;
    
    // 4. Final customer charge
    const finalCharge = subtotal * (1 + hstRate);
    
    // Round to 2 decimal places
    return Math.round(finalCharge * 100) / 100;
  }

  // Placeholder for fetching actual rates from Stallion API
  public static async fetchStallionRates(dimensions: any) {
    // Mock data for now
    const baseRates = [
      { id: 'stallion-1', carrier: 'Canada Post', serviceName: 'Expedited Parcel', baseRate: 14.50 },
      { id: 'stallion-2', carrier: 'UPS', serviceName: 'Standard', baseRate: 16.20 }
    ];

    return baseRates.map(rate => ({
      id: rate.id,
      provider: 'Stallion' as const,
      carrier: rate.carrier,
      serviceName: rate.serviceName,
      baseRate: rate.baseRate,
      customerCharge: this.calculateCustomerCharge(rate.baseRate)
    }));
  }

  // Placeholder for fetching actual rates from Freightcom API
  public static async fetchFreightcomRates(dimensions: any) {
    // Mock data for now
    const baseRates = [
      { id: 'freightcom-1', carrier: 'Canpar', serviceName: 'Ground', baseRate: 12.80 },
      { id: 'freightcom-2', carrier: 'FedEx', serviceName: 'Ground', baseRate: 15.10 }
    ];

    return baseRates.map(rate => ({
      id: rate.id,
      provider: 'Freightcom' as const,
      carrier: rate.carrier,
      serviceName: rate.serviceName,
      baseRate: rate.baseRate,
      customerCharge: this.calculateCustomerCharge(rate.baseRate)
    }));
  }

  public static async getAllRates(dimensions: any) {
    const [stallionRates, freightcomRates] = await Promise.all([
      this.fetchStallionRates(dimensions),
      this.fetchFreightcomRates(dimensions)
    ]);
    
    return [...stallionRates, ...freightcomRates];
  }
}
