export const CALENDAR_CONFIG = {
  id: "calendario_mesa",
  name: "Calendário de Mesa Personalizado",
  min_order_qty: 10,
  max_order_qty: 3500,
  custom_qty_allowed: true,
  interpolate_between_tiers: false,
  base_price_table: [
    { min_qty: 10, unit_price: 16.84 },
    { min_qty: 50, unit_price: 12.10 },
    { min_qty: 100, unit_price: 10.40 },
    { min_qty: 250, unit_price: 8.77 },
    { min_qty: 500, unit_price: 7.89 },
    { min_qty: 1000, unit_price: 5.21 },
    { min_qty: 2000, unit_price: 3.99 },
    { min_qty: 3000, unit_price: 3.99 }
  ],
  attribute_groups: [
    {
      id: "base_format",
      name: "Formato (Base)",
      options: [
        { id: "14x14", name: "14 x 14 cm", modifier_fixed: 0, modifier_pct: 0 },
        { id: "21x15", name: "21 x 15 cm", modifier_fixed: 0.50, modifier_pct: 0.05 }
      ],
      defaultOption: "14x14"
    },
    {
      id: "base_paper",
      name: "Papel da Base",
      options: [
        { id: "supremo_300g", name: "Supremo 300g", modifier_fixed: 0, modifier_pct: 0 },
        { id: "duplex_250g", name: "Duplex 250g", modifier_fixed: -0.20, modifier_pct: 0 },
        { id: "triplex_350g", name: "Triplex 350g", modifier_fixed: 0.80, modifier_pct: 0 }
      ],
      defaultOption: "supremo_300g"
    },
    {
      id: "miolo_paper",
      name: "Papel do Miolo",
      options: [
        { id: "couche_150g", name: "Couché 150g", modifier_fixed: 0, modifier_pct: 0 },
        { id: "couche_170g", name: "Couché 170g", modifier_fixed: 0.30, modifier_pct: 0 },
        { id: "reciclato_120g", name: "Reciclato 120g", modifier_fixed: 0.45, modifier_pct: 0 }
      ],
      defaultOption: "couche_150g"
    },
    {
      id: "layout",
      name: "Layout de Personalização",
      options: [
        { id: "padrao", name: "Padrão (Sem alteração na arte base)", modifier_fixed: 0, modifier_pct: 0 },
        { id: "parcial", name: "Personalização Parcial (Logo + Rodapé)", modifier_fixed: 0, modifier_pct: 0.05 },
        { id: "total", name: "Personalização Total (Arte 100% customizada)", modifier_fixed: 0, modifier_pct: 0.15 }
      ],
      defaultOption: "padrao"
    },
    {
      id: "binding",
      name: "Encadernação (Cor do Wire-o)",
      options: [
        { id: "wireo_branco", name: "Wire-o Branco", modifier_fixed: 0, modifier_pct: 0 },
        { id: "wireo_preto", name: "Wire-o Preto", modifier_fixed: 0, modifier_pct: 0 },
        { id: "wireo_prata", name: "Wire-o Prata", modifier_fixed: 0.20, modifier_pct: 0 },
        { id: "wireo_bronze", name: "Wire-o Bronze", modifier_fixed: 0.40, modifier_pct: 0 }
      ],
      defaultOption: "wireo_branco"
    }
  ]
};
