E-commerce B2B de atacado de camisas da Seleção 
# MANTO Atacado

> Plataforma de atacado de camisas da Seleção Brasileira — desenvolvida para lojistas e revendedores, com foco na Copa do Mundo 2026.

🔗 **Site ao vivo:** [manto-serven.onrender.com](https://manto-atacado.onrender.com)

---

## Sobre o projeto

O MANTO Atacado é um e-commerce B2B completo, construído do zero para conectar lojistas a fornecedores de camisas oficiais e licenciadas da Seleção Brasileira. O projeto foi desenvolvido de forma independente, com foco em usabilidade, integração de pagamentos reais e gestão via painel administrativo.

---

## Funcionalidades

- Catálogo de produtos com filtros por modelo, tamanho e quantidade
- Carrinho de compras e fluxo completo de checkout
- Pagamento via **cartão de crédito** e **boleto** (Stripe)
- **PIX nativo** com geração de QR Code em modal
- Painel administrativo para gestão de pedidos e produtos
- Autenticação de usuários
- Deploy contínuo em produção

---

## Stack

**Front-end**
- HTML5, CSS3, JavaScript

**Back-end**
- Node.js, Express.js

**Banco de dados**
- MongoDB Atlas

**Pagamentos**
- Stripe (cartão e boleto)
- PIX com QR Code nativo

**Deploy**
- Render.com

**Versionamento**
- Git, GitHub

---

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/Claudemir7/manto-atacado.git

# Instale as dependências
cd manto-atacado
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha as variáveis no arquivo .env

# Inicie o servidor
npm run dev
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
MONGODB_URI=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PIX_KEY=
JWT_SECRET=
PORT=
```

---

## Aprendizados

Este projeto foi construído de forma independente e representou meu primeiro contato real com:
- Integração de gateway de pagamento em produção (Stripe)
- Implementação de PIX com geração dinâmica de QR Code
- Deploy e manutenção de aplicação Node.js em ambiente de produção
- Construção de painel administrativo do zero

---

## Autor

**Claudemir Moraes**
- GitHub: [@Claudemir7](https://github.com/Claudemir7)
- [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/claudemir-morais-940200242/)

---

> Projeto desenvolvido para o mercado de atacado de uniformes esportivos brasileiros, com lançamento estratégico voltado ao ciclo da Copa do Mundo 2026.
