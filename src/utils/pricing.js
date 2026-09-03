export function calcularPreco(config, productData) {
  const { quantity, selectedOptions } = config;

  // Validation
  if (!quantity || quantity < productData.min_order_qty) {
    return {
      error: `Quantidade mínima permitida é ${productData.min_order_qty}.`,
      unitPrice: 0,
      totalPrice: 0,
      discountPct: 0
    };
  }

  if (quantity > productData.max_order_qty && !productData.custom_qty_allowed) {
    return {
      error: `Quantidade máxima permitida é ${productData.max_order_qty}. Por favor, entre em contato para pedidos maiores.`,
      unitPrice: 0,
      totalPrice: 0,
      discountPct: 0
    };
  }

  // Find the appropriate tier for base price
  let basePrice = 0;
  let minTierPrice = productData.base_price_table[0].unit_price; // Assuming sorted asc by min_qty

  // Sort tiers by min_qty descending to find the first matching tier
  const sortedTiers = [...productData.base_price_table].sort((a, b) => b.min_qty - a.min_qty);
  
  for (const tier of sortedTiers) {
    if (quantity >= tier.min_qty) {
      basePrice = tier.unit_price;
      break;
    }
  }

  // If quantity is beyond the highest tier and custom_qty_allowed is true, it uses the highest tier price found above

  // Calculate modifiers based on selected options
  let fixedModifiers = 0;
  let pctModifiers = 0;

  productData.attribute_groups.forEach(group => {
    const selectedOptionId = selectedOptions[group.id] || group.defaultOption;
    const option = group.options.find(opt => opt.id === selectedOptionId);
    
    if (option) {
      fixedModifiers += (option.modifier_fixed || 0);
      pctModifiers += (option.modifier_pct || 0);
    }
  });

  // Calculate final unit price
  const finalUnitPrice = (basePrice + fixedModifiers) * (1 + pctModifiers);
  const totalPrice = finalUnitPrice * quantity;

  // Calculate minimal price for discount comparison (base price at min qty + modifiers)
  const minUnitPrice = (minTierPrice + fixedModifiers) * (1 + pctModifiers);
  let discountPct = 0;
  
  if (finalUnitPrice < minUnitPrice) {
    discountPct = 1 - (finalUnitPrice / minUnitPrice);
  }

  return {
    error: null,
    unitPrice: Number(finalUnitPrice.toFixed(4)),
    totalPrice: Number(totalPrice.toFixed(2)),
    discountPct: Number(discountPct.toFixed(4))
  };
}
