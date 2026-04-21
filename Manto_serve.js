require('dotenv').config();
const express  = require('express');
const Stripe   = require('stripe');
const cors     = require('cors');
const mongoose = require('mongoose');

const app    = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_EXEMPLO1234');

app.use(cors({ origin:'*', methods:['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders:['Content-Type','Authorization'] }));
app.use(express.json({ limit:'20mb' }));
app.use(express.static('.'));

// ============================================================
// MONGODB
// ============================================================
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ MongoDB erro:', err.message));

const ProductSchema = new mongoose.Schema({
  id:        { type:String, required:true, unique:true },
  name:      { type:String, required:true },
  price:     { type:Number, required:true },
  revenda:   { type:Number, default:0 },
  categoria: { type:String, default:'titular' },
  cor:       { type:String, default:'amarela' },
  minimo:    { type:Number, default:10 },
  tamanhos:  { type:String, default:'P,M,G,GG,XGG' },
  desc:      { type:String, default:'' },
  badge:     { type:String, default:'' },
  estoque:   { type:Number, default:0 },
  foto:      { type:String, default:'' },
  ordem:     { type:Number, default:0 },
}, { timestamps:true });

const ConfigSchema = new mongoose.Schema({
  chave: { type:String, required:true, unique:true },
  valor: { type:mongoose.Schema.Types.Mixed },
}, { timestamps:true });

const Product = mongoose.model('Product', ProductSchema);
const Config  = mongoose.model('Config',  ConfigSchema);

const DEFAULT_PRODUCTS = [
  { id:'amarela-titular', name:'Camisa Titular Amarela',  price:29, revenda:89,  categoria:'titular',   cor:'amarela', minimo:10, tamanhos:'P,M,G,GG,XGG',   desc:'A camisa mais procurada da Copa 2026.', badge:'Mais vendido', estoque:200, foto:'', ordem:1  },
  { id:'azul-reserva',    name:'Camisa Reserva Azul',     price:29, revenda:89,  categoria:'reserva',   cor:'azul',    minimo:10, tamanhos:'P,M,G,GG,XGG',   desc:'Camisa reserva da Seleção 2026.',       badge:'',           estoque:150, foto:'', ordem:2  },
  { id:'verde-especial',  name:'Camisa Verde Especial',   price:29, revenda:89,  categoria:'especial',  cor:'verde',   minimo:10, tamanhos:'P,M,G,GG,XGG',   desc:'Edição especial Copa 2026.',            badge:'Especial',   estoque:100, foto:'', ordem:3  },
  { id:'branca-alt',      name:'Camisa Branca Alt.',      price:29, revenda:89,  categoria:'reserva',   cor:'branca',  minimo:10, tamanhos:'P,M,G,GG,XGG',   desc:'Edição alternativa branca.',            badge:'',           estoque:120, foto:'', ordem:4  },
  { id:'preta-limitada',  name:'Camisa Preta Limitada',   price:32, revenda:99,  categoria:'especial',  cor:'preta',   minimo:10, tamanhos:'P,M,G,GG,XGG',   desc:'Edição limitada preta.',                badge:'Limitada',   estoque:60,  foto:'', ordem:5  },
  { id:'degrade-premium', name:'Camisa Degradê Premium',  price:34, revenda:109, categoria:'especial',  cor:'degrade', minimo:10, tamanhos:'P,M,G,GG,XGG',   desc:'Edição premium degradê.',               badge:'Premium',    estoque:80,  foto:'', ordem:6  },
  { id:'kids-amarela',    name:'Camisa Kids Amarela',     price:22, revenda:59,  categoria:'kids',      cor:'amarela', minimo:10, tamanhos:'2,4,6,8,10,12',  desc:'Camisa infantil Copa 2026.',            badge:'Kids',       estoque:100, foto:'', ordem:7  },
  { id:'kids-azul',       name:'Camisa Kids Azul',        price:22, revenda:59,  categoria:'kids',      cor:'azul',    minimo:10, tamanhos:'2,4,6,8,10,12',  desc:'Camisa infantil reserva.',              badge:'Kids',       estoque:80,  foto:'', ordem:8  },
  { id:'bone-copa',       name:'Boné Copa 2026',          price:18, revenda:49,  categoria:'acessorio', cor:'amarela', minimo:10, tamanhos:'Único',            desc:'Boné bordado Copa 2026.',               badge:'',           estoque:150, foto:'', ordem:9  },
  { id:'cachecol-copa',   name:'Cachecol Copa 2026',      price:15, revenda:39,  categoria:'acessorio', cor:'amarela', minimo:10, tamanhos:'Único',            desc:'Cachecol torcedor Copa 2026.',          badge:'',           estoque:200, foto:'', ordem:10 },
  { id:'kit-torcedor',    name:'Kit Torcedor Copa',       price:42, revenda:99,  categoria:'kit',       cor:'amarela', minimo:5,  tamanhos:'P,M,G,GG,XGG',   desc:'Camisa + boné + cachecol.',             badge:'Kit',        estoque:100, foto:'', ordem:11 },
];

async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
      console.log('✅ Produtos padrão inseridos');
    }
    const cfg = await Config.findOne({ chave:'loja' });
    if (!cfg) {
      await Config.create({ chave:'loja', valor:{ minOrder:600, checkout:'', whatsapp:'', email:'suporte@manto.com.br' } });
      console.log('✅ Config padrão inserida');
    }
  } catch(e) {
    console.error('Seed erro:', e.message);
  }
}
mongoose.connection.once('open', seedProducts);

// ============================================================
// ROTAS PRODUTOS
// ============================================================
app.get('/api/products', async (req, res) => {
  try {
    const { categoria } = req.query;
    const filter = categoria && categoria !== 'todos' ? { categoria } : {};
    const products = await Product.find(filter).sort({ ordem:1 });
    res.json(products);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const p = await Product.findOne({ id:req.params.id });
    if (!p) return res.status(404).json({ error:'Não encontrado' });
    res.json(p);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = data.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')+'-'+Date.now();
    const p = await Product.create(data);
    res.json(p);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const p = await Product.findOneAndUpdate({ id:req.params.id }, { $set:req.body }, { new:true });
    if (!p) return res.status(404).json({ error:'Não encontrado' });
    res.json(p);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/products/:id/foto', async (req, res) => {
  try {
    const { foto } = req.body;
    const p = await Product.findOneAndUpdate({ id:req.params.id }, { $set:{ foto } }, { new:true });
    if (!p) return res.status(404).json({ error:'Não encontrado' });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id:req.params.id });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ============================================================
// ROTAS CONFIG
// ============================================================
app.get('/api/config', async (req, res) => {
  try {
    const cfg = await Config.findOne({ chave:'loja' });
    res.json(cfg?.valor || { minOrder:600, checkout:'', whatsapp:'', email:'' });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/config', async (req, res) => {
  try {
    const cfg = await Config.findOneAndUpdate(
      { chave:'loja' }, { $set:{ valor:req.body } }, { new:true, upsert:true }
    );
    res.json(cfg.valor);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ============================================================
// STRIPE
// ============================================================
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency='brl', method, customer } = req.body;
    const cfgDoc = await Config.findOne({ chave:'loja' });
    const minVal = (cfgDoc?.valor?.minOrder || 600) * 100;
    if (!amount || amount < minVal) return res.status(400).json({ error:`Valor abaixo do mínimo de R$${minVal/100}.` });
    const methodTypes = { boleto:['boleto'], card:['card'] };
    const paymentIntent = await stripe.paymentIntents.create({
      amount, currency,
      payment_method_types: methodTypes[method]||['card'],
      metadata: { customer_name:customer?.name||'', customer_email:customer?.email||'', customer_doc:customer?.doc||'', customer_store:customer?.store||'', order_id:generateOrderId() },
    });
    res.json({ clientSecret:paymentIntent.client_secret, orderId:paymentIntent.metadata.order_id });
  } catch(e) {
    console.error('Stripe error:', e.message);
    res.status(500).json({ error:e.message });
  }
});

// ============================================================
// INFINITPAY — PIX
// ============================================================
app.post('/api/create-pix', async (req, res) => {
  try {
    const { amount, customer, items } = req.body;
    const cfgDoc = await Config.findOne({ chave:'loja' });
    const minVal = (cfgDoc?.valor?.minOrder || 600) * 100;
    if (!amount || amount < minVal) return res.status(400).json({ error:`Valor abaixo do mínimo de R$${minVal/100}.` });

    // order_nsu só pode ter letras e números
    const orderNsu = 'MTN' + Date.now();
    const redirectUrl = 'https://manto-serven.onrender.com/MANTO_Checkout.html?status=success&order=' + orderNsu;
    const webhookUrl  = 'https://manto-serven.onrender.com/api/webhook-infinitpay';

    const payload = {
      handle: 'mantoatacado',
      order_nsu: orderNsu,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
      items: items && items.length > 0 ? items.map(item => ({
        ...item,
        description: item.description && item.description.trim() ? item.description : item.name,
      })) : [{ name:'Grade MANTO Copa 2026', quantity:1, price:amount, description:'Atacado camisas e acessórios Copa 2026' }],
    };

    // Adiciona customer só se tiver nome e email válidos
    if (customer?.name && customer?.email) {
      payload.customer = { name: customer.name, email: customer.email };
      // Telefone só adiciona se tiver 10+ dígitos
      const phone = (customer.phone||'').replace(/\D/g,'');
      if (phone.length >= 10) payload.customer.phone_number = '+55' + phone;
    }

    console.log('InfinitPay payload:', JSON.stringify(payload));

    const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('InfinitPay response:', JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({ error: data.message || data.error || JSON.stringify(data) });
    }

    const checkoutUrl = data.url || data.link || data.checkout_url || data.payment_url;
    if (!checkoutUrl) return res.status(500).json({ error: 'URL de pagamento não retornada: ' + JSON.stringify(data) });

    res.json({ checkoutUrl, orderId: orderNsu });

  } catch(e) {
    console.error('InfinitPay erro:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Webhook InfinitPay
app.post('/api/webhook-infinitpay', express.json(), (req, res) => {
  const data = req.body;
  console.log('✅ InfinitPay webhook:', data.order_nsu, data.capture_method, `R$${(data.amount/100).toFixed(2)}`);
  res.status(200).json({ received: true });
});

app.post('/api/webhook', express.raw({ type:'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET); }
  catch(e) { return res.status(400).send(`Webhook Error: ${e.message}`); }
  if (event.type === 'payment_intent.succeeded') {
    const i = event.data.object;
    console.log('✅ Pago:', i.metadata.order_id, `R$${(i.amount/100).toFixed(2)}`);
  }
  res.json({ received:true });
});

app.get('/api/orders', async (req, res) => {
  try {
    const intents = await stripe.paymentIntents.list({ limit:parseInt(req.query.limit)||20 });
    res.json(intents.data.map(i => ({
      id:i.metadata.order_id||i.id, status:i.status,
      valor:`R$${(i.amount/100).toFixed(2)}`,
      cliente:i.metadata.customer_name, email:i.metadata.customer_email,
      loja:i.metadata.customer_store,
      data:new Date(i.created*1000).toLocaleDateString('pt-BR'),
    })));
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status:'ok', message:'MANTO API rodando 🟢', mongodb:mongoose.connection.readyState===1?'conectado':'desconectado' });
});

function generateOrderId() {
  return 'MTN-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,5).toUpperCase();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 MANTO API rodando em http://localhost:${PORT}`));
