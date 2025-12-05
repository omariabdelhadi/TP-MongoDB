/**
 * MongoDB CRUD - Niveau 1 : DÉBUTANT
 * 10 exercices simples pour débuter avec MongoDB
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'shop_maroc';

async function niveau1Exercises() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db(DB_NAME);
    const productsCol = db.collection('products');
    const customersCol = db.collection('customers');

    // ========== EXERCICE 1.1 - Première insertion ==========
    console.log('\n📌 Exercice 1.1 - Première insertion');
    const product1_1 = await productsCol.insertOne({
      sku: 'LMP-001',
      name: 'Lampe artisanale en cuivre',
      category: 'Décoration',
      price: 450,
      quantity: 20,
      warehouse: 'Marrakech'
    });
    console.log(`✓ Produit inséré avec ID: ${product1_1.insertedId}`);

    // ========== EXERCICE 1.2 - Recherche simple ==========
    console.log('\n📌 Exercice 1.2 - Recherche simple (Alimentation)');
    const alimentation = await productsCol.find({ category: 'Alimentation' }).toArray();
    console.log(`✓ Produits trouvés: ${alimentation.length}`);
    alimentation.slice(0, 3).forEach(p => console.log(`  - ${p.name} (${p.price} MAD)`));

    // ========== EXERCICE 1.3 - Recherche avec limite ==========
    console.log('\n📌 Exercice 1.3 - Recherche avec limite (3 premiers clients)');
    const topClients = await customersCol.find().limit(3).toArray();
    console.log(`✓ Clients trouvés: ${topClients.length}`);
    topClients.forEach(c => console.log(`  - ${c.name || c.customerId} (${c.city || 'N/A'})`));

    // ========== EXERCICE 1.4 - Mise à jour simple ==========
    console.log('\n📌 Exercice 1.4 - Mise à jour simple (prix +10 MAD)');
    const updated1_4 = await productsCol.updateOne(
      { sku: 'THE-005' },
      { $inc: { price: 10 } }
    );
    console.log(`✓ Résultat: ${updated1_4.modifiedCount} document modifié`);

    // ========== EXERCICE 1.5 - Suppression simple ==========
    console.log('\n📌 Exercice 1.5 - Suppression simple (LMP-001)');
    const deleted1_5 = await productsCol.deleteOne({ sku: 'LMP-001' });
    console.log(`✓ Résultat: ${deleted1_5.deletedCount} document supprimé`);

    // ========== EXERCICE 1.6 - Recherche par ID ==========
    console.log('\n📌 Exercice 1.6 - Recherche par ID (CLT-10003)');
    const customer1_6 = await customersCol.findOne({ customerId: 'CLT-10003' });
    if (customer1_6) {
      console.log(`✓ Client trouvé: ${customer1_6.name} de ${customer1_6.city}`);
    } else {
      console.log('ℹ Pas de client avec cet ID');
    }

    // ========== EXERCICE 1.7 - Insertion multiple ==========
    console.log('\n📌 Exercice 1.7 - Insertion multiple (2 nouveaux clients)');
    const inserted1_7 = await customersCol.insertMany([
      { customerId: 'CLT-SAMIR', name: 'Samir Hakimi', city: 'Tanger' },
      { customerId: 'CLT-LEILA', name: 'Leila Mansouri', city: 'Agadir' }
    ]);
    console.log(`✓ ${inserted1_7.insertedCount} clients insérés`);

    // ========== EXERCICE 1.8 - Comptage ==========
    console.log('\n📌 Exercice 1.8 - Comptage (Vêtements)');
    const count1_8 = await productsCol.countDocuments({ category: 'Vêtements' });
    console.log(`✓ Nombre de produits Vêtements: ${count1_8}`);

    // ========== EXERCICE 1.9 - Mise à jour de champ imbriqué ==========
    console.log('\n📌 Exercice 1.9 - Mise à jour champ imbriqué (CLT-10002 -> Rabat)');
    const updated1_9 = await customersCol.updateOne(
      { customerId: 'CLT-10002' },
      { $set: { city: 'Rabat' } }
    );
    console.log(`✓ Résultat: ${updated1_9.modifiedCount} document modifié`);

    // ========== EXERCICE 1.10 - Projection simple ==========
    console.log('\n📌 Exercice 1.10 - Projection (nom + prix)');
    const projected = await productsCol
      .find({}, { projection: { _id: 0, name: 1, price: 1 } })
      .limit(5)
      .toArray();
    console.log(`✓ Affichage des produits (nom, prix):`);
    projected.forEach(p => console.log(`  - ${p.name}: ${p.price} MAD`));

    console.log('\n✅ Tous les exercices du Niveau 1 sont terminés!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

// Exécuter les exercices
niveau1Exercises();
