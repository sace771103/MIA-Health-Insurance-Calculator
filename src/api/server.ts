# ARCHIVO 12: src/api/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import quotationRoutes from './routes/quotation.js';
import calculatorRoutes from './routes/calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../web')));

// Rutas de API
app.use('/api/quotation', quotationRoutes);
app.use('/api/calculator', calculatorRoutes);

// Ruta principal - Interfaz web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web/index.html'));
});

// Ruta de calculadora web
app.get('/calculator', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web/calculator.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MIA Health Calculator API'
  });
});

// Información de API
app.get('/api', (req, res) => {
  res.json({
    name: 'MIA Health Insurance Calculator API',
    version: '1.0.0',
    description: 'API para cálculo de primas de seguro de salud',
    endpoints: {
      quotation: '/api/quotation/*',
      calculator: '/api/calculator/*',
      health: '/health'
    },
    documentation: '/api/docs'
  });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 MIA HEALTH API SERVER INICIADO');
  console.log('='.repeat(50));
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`📊 Calculadora: http://localhost:${PORT}/calculator`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

export default app;
