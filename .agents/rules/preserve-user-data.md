# Regra de Preservação de Dados do Usuário

## Diretriz Crítica Obrigatória
- **NUNCA apagar, redefinir, sobrescrever ou alterar dados cadastrados** pelo usuário durante qualquer ajuste, refatoração ou implementação no JetaFlow.
- Isso se aplica a todas as entidades do sistema:
  - **Licitações cadastradas e importadas** (`jetaflow_biddings_*`)
  - **Clientes cadastrados** (`jetaflow_clients_*`)
  - **Fornecedores cadastrados** (`jetaflow_suppliers_*`)
  - **Histórico de Orçamentos** (`jetaflow_quotes_*`)
  - **Configurações financeiras, papéis e taxas de clique** (`jetaflow_papers`, `jetaflow_financial`, `jetaflow_clicks`, `jetaflow_offset`, etc.)
- **Migrações e Novos Recursos**:
  - Devem ser sempre **aditivos e não destrutivos**.
  - Manter sempre os dados existentes do `localStorage`, nunca fazer `localStorage.clear()` ou remover chaves com dados do usuário.
