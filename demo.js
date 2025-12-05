/**
 * Fichier de démonstration - Aide à la configuration
 * Utilisez ce fichier pour tester la connexion à MongoDB
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'shop_maroc';

async function demo() {
  const client = new MongoClient(MONGO_URI);

  try {
    // Test de connexion
    await client.connect();
    console.log('✅ Connexion à MongoDB réussie');

    const db = client.db(DB_NAME);
    console.log(`✅ Base de données "${DB_NAME}" sélectionnée`);

    // Lister les collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📚 Collections disponibles:`);
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Compter les documents par collection
    console.log(`\n📊 Nombre de documents par collection:`);
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }

    console.log('\n✅ Démonstration terminée. Vous êtes prêt à exécuter les exercices!');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Assurez-vous que:');
    console.log('   1. MongoDB est en cours d\'exécution');
    console.log('   2. La base de données "shop_maroc" existe');
    console.log('   3. L\'URI de connexion est correcte (par défaut: mongodb://localhost:27017)');
  } finally {
    await client.close();
  }
}

demo();
