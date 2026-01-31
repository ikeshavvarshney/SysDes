import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ==========================================
// CONNECT TO DATABASE
// ==========================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// ==========================================
// DEFINE SCHEMAS (Inline)
// ==========================================

const componentSchema = new mongoose.Schema({
  type: String,
  model: String,
  position: { x: Number, y: Number },
  metrics: { cpu: Number, memory: Number, requests: Number },
  capacity: { cpu: Number, memory: Number, requests: Number },
  health: Number,
  costPerHour: Number
}, { timestamps: true });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  category: String,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  connections: [{ source: mongoose.Schema.Types.ObjectId, target: mongoose.Schema.Types.ObjectId }],
  estimatedCost: Number
}, { timestamps: true });

const Component = mongoose.model('Component', componentSchema);
const Template = mongoose.model('Template', templateSchema);

// ==========================================
// TEMPLATE DATA
// ==========================================

const TEMPLATES = [
  {
    name: 'Basic Web App',
    description: 'Simple 3-tier architecture for small web applications',
    category: 'BEGINNER',
    estimatedCost: 200,
    components: [
      { type: 'CLIENT', model: 'WEB', x: 100, y: 300, costPerHour: 0, capacity: { cpu: 100, memory: 4000, requests: 1000000 } },
      { type: 'LOAD_BALANCER', model: 'BASIC', x: 350, y: 300, costPerHour: 50, capacity: { cpu: 80, memory: 8000, requests: 5000 } },
      { type: 'SERVER', model: 'MEDIUM', x: 600, y: 300, costPerHour: 100, capacity: { cpu: 70, memory: 16000, requests: 1000 } },
      { type: 'DB', model: 'POSTGRES', x: 850, y: 300, costPerHour: 150, capacity: { cpu: 50, memory: 32000, requests: 2000 } }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  {
    name: 'E-Commerce Platform',
    description: 'High-availability design for online shopping',
    category: 'INTERMEDIATE',
    estimatedCost: 800,
    components: [
      { type: 'CLIENT', model: 'WEB', x: 100, y: 400, costPerHour: 0, capacity: { cpu: 100, memory: 4000, requests: 1000000 } },
      { type: 'CDN', model: 'CLOUDFLARE', x: 300, y: 250, costPerHour: 40, capacity: { cpu: 100, memory: 32000, requests: 50000 } },
      { type: 'LOAD_BALANCER', model: 'ADVANCED', x: 300, y: 550, costPerHour: 100, capacity: { cpu: 90, memory: 16000, requests: 10000 } },
      { type: 'SERVER', model: 'LARGE', x: 550, y: 400, costPerHour: 150, capacity: { cpu: 80, memory: 32000, requests: 2000 } },
      { type: 'SERVER', model: 'LARGE', x: 550, y: 600, costPerHour: 150, capacity: { cpu: 80, memory: 32000, requests: 2000 } },
      { type: 'CACHE', model: 'REDIS', x: 800, y: 350, costPerHour: 60, capacity: { cpu: 50, memory: 8000, requests: 10000 } },
      { type: 'DB', model: 'POSTGRES', x: 800, y: 550, costPerHour: 200, capacity: { cpu: 60, memory: 64000, requests: 3000 } }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
      { from: 5, to: 6 }
    ]
  },
  {
    name: 'Serverless API',
    description: 'Lightweight serverless architecture',
    category: 'BEGINNER',
    estimatedCost: 150,
    components: [
      { type: 'CLIENT', model: 'WEB', x: 100, y: 300, costPerHour: 0, capacity: { cpu: 100, memory: 4000, requests: 1000000 } },
      { type: 'API_GATEWAY', model: 'BASIC', x: 350, y: 300, costPerHour: 70, capacity: { cpu: 80, memory: 8000, requests: 4000 } },
      { type: 'SERVERLESS', model: 'LAMBDA', x: 600, y: 300, costPerHour: 20, capacity: { cpu: 100, memory: 3000, requests: 5000 } },
      { type: 'NOSQL', model: 'DYNAMODB', x: 850, y: 300, costPerHour: 120, capacity: { cpu: 60, memory: 16000, requests: 5000 } }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  }
];

// ==========================================
// SEED FUNCTION
// ==========================================

async function seedTemplates() {
  try {
    await connectDB();

    console.log('🗑️  Clearing old templates...');
    await Template.deleteMany({});
    await Component.deleteMany({});

    for (let templateData of TEMPLATES) {
      console.log(`\n📦 Creating template: ${templateData.name}`);

      // Create components
      const componentIds = [];
      for (let compData of templateData.components) {
        const component = await Component.create({
          type: compData.type,
          model: compData.model,
          position: { x: compData.x, y: compData.y },
          metrics: { cpu: 0, memory: 0, requests: 0 },
          capacity: compData.capacity,
          health: 100,
          costPerHour: compData.costPerHour
        });
        componentIds.push(component._id);
        console.log(`  ✓ Created ${compData.type}`);
      }

      // Map connections
      const mappedConnections = templateData.connections.map(conn => ({
        source: componentIds[conn.from],
        target: componentIds[conn.to]
      }));

      // Create template
      await Template.create({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        estimatedCost: templateData.estimatedCost,
        components: componentIds,
        connections: mappedConnections
      });

      console.log(`✅ Template "${templateData.name}" created!`);
    }

    console.log('\n🎉 All templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedTemplates();
