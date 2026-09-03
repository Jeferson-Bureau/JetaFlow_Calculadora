# Prompt: Módulo de Cálculo de Preços — Produto Personalizável (Calendário de Mesa)

## Objetivo

Implementar um módulo de precificação dinâmica para produtos gráficos personalizáveis, seguindo o modelo de referência da Printi (calendário de mesa), com suporte a:
- Descontos progressivos por quantidade (tabela de faixas)
- Variação de preço por combinação de atributos (papel, layout, encadernação)
- Cálculo de preço unitário e total em tempo real conforme o usuário configura o produto

---

## Prompt para o desenvolvedor / IA de implementação

```
Implemente um módulo de cálculo de preços para um configurador de produto
gráfico personalizável (ex: calendário de mesa), com as seguintes regras
de negócio:

## 1. Estrutura de dados do produto

Cada produto deve ter:
- `base_price_table`: tabela de preços por faixa de quantidade, no formato:
  [
    { "min_qty": 10,   "unit_price": 16.84 },
    { "min_qty": 50,   "unit_price": 12.10 },
    { "min_qty": 100,  "unit_price": 10.40 },
    { "min_qty": 250,  "unit_price": 8.77 },
    { "min_qty": 500,  "unit_price": 7.89 },
    { "min_qty": 1000, "unit_price": 5.21 },
    { "min_qty": 2000, "unit_price": 3.99 },
    { "min_qty": 3000, "unit_price": 3.99 }
  ]
- `attribute_groups`: grupos de opções configuráveis, cada uma com um
  modificador de preço (fixo ou percentual) sobre o preço unitário base.
  Exemplo de grupos: Base (formato), Papel da base, Papel do miolo,
  Layout de personalização (Padrão / Parcial / Total), Encadernação
  (cor do wire-o).
- `min_order_qty` e `max_order_qty` (ex: 10 e 3500).
- `custom_qty_allowed`: booleano — permite quantidade personalizada
  acima da última faixa da tabela.

## 2. Regras de cálculo

a) **Preço unitário base pela quantidade**: dado um `quantity`, encontrar
   a maior faixa em `base_price_table` cujo `min_qty` seja <= quantity.
   Se `quantity` estiver entre duas faixas cadastradas mas sem correspondência
   exata (ex: 75 unidades, entre a faixa de 50 e 100), aplicar a faixa
   INFERIOR mais próxima (ou interpolar linearmente — deixar configurável
   via flag `interpolate_between_tiers`, default = false, aplicar faixa
   inferior).

b) **Modificadores de atributos**: cada opção escolhida em cada
   `attribute_group` pode:
   - Não alterar o preço (ex: cor do wire-o pode ser neutra)
   - Adicionar um valor fixo por unidade (ex: papel premium +R$0,50/un)
   - Aplicar um percentual sobre o preço unitário base (ex: layout
     "Personalizável Total" = +15% sobre o preço unitário da faixa)

   Fórmula:
   preco_unitario_final = preco_unitario_base_por_faixa
                           + soma(modificadores_fixos)
                           * (1 + soma(modificadores_percentuais))

c) **Cálculo do total**:
   preco_total = preco_unitario_final * quantity

d) **Percentual de desconto exibido ao usuário** (comparado à menor
   quantidade/faixa):
   desconto_pct = 1 - (preco_unitario_final / preco_unitario_faixa_minima)

e) **Recalcular em tempo real** sempre que o usuário alterar:
   - Quantidade (inclusive quantidade personalizada digitada)
   - Qualquer atributo de personalização (papel, layout, encadernação, etc.)

## 3. Validações

- Bloquear envio/checkout se `quantity < min_order_qty`.
- Se `quantity > max_order_qty` e `custom_qty_allowed = false`, bloquear
  e sugerir contato com vendas.
- Exibir mensagem de erro amigável para valores não numéricos ou negativos
  no campo de quantidade personalizada.

## 4. Interface esperada (resumo/carrinho)

Exibir, atualizado dinamicamente:
- Quantidade selecionada
- Preço por unidade (com 2 casas decimais, formato R$ 0,00)
- Preço total
- Percentual de desconto obtido em relação à menor faixa
- Resumo da configuração escolhida (todos os atributos selecionados,
  em formato de lista, tipo "ficha técnica")

## 5. Casos de teste obrigatórios

1. Quantidade mínima (10 un), configuração padrão → validar preço unitário
   e total batem com a tabela.
2. Quantidade em faixa intermediária (ex: 300 un) → validar que usa a
   faixa de 250 (ou interpola, conforme flag).
3. Quantidade personalizada acima da maior faixa (ex: 5000 un) → validar
   que usa o preço da última faixa (3.99) ou bloqueia, conforme regra
   de negócio definida.
4. Alterar layout de "Padrão" para "Personalizável Total" → validar que
   o preço unitário sobe corretamente e o total é recalculado.
5. Quantidade abaixo do mínimo → validar bloqueio com mensagem de erro.
6. Trocar múltiplos atributos ao mesmo tempo → validar que os
   modificadores se somam/multiplicam corretamente sem duplicar cálculo.

## 6. Stack / formato de entrega

- Linguagem: [PREENCHER — ex: JavaScript/TypeScript, PHP, Python]
- Deve expor uma função pura `calcularPreco(config: ProdutoConfig): PrecoResultado`
  sem efeitos colaterais, testável isoladamente.
- Separar claramente: (1) camada de dados/tabela de preços, (2) lógica de
  cálculo, (3) camada de apresentação/UI.
```

---

## Observações para adaptar ao seu sistema

- Preencha a tabela `base_price_table` com os valores reais do produto que
  você quer implementar (o exemplo acima usa os valores do calendário de
  mesa Printi como referência).
- Ajuste `attribute_groups` conforme os atributos reais do seu catálogo
  (ex: se seu sistema tem mais de um produto, esse módulo deveria ser
  genérico o suficiente para reaproveitar em outros itens).
- Defina explicitamente a regra de arredondamento (para cima, para baixo,
  ou padrão bancário) — isso evita divergência de centavos entre unitário
  e total.
