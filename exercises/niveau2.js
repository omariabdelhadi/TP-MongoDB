/**
 * MongoDB CRUD - Niveau 2 : INTERMÉDIAIRE
 * 10 exercices avancés avec opérateurs et agrégations
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'shop_maroc';

async function niveau2Exercises() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db(DB_NAME);
    const productsCol = db.collection('products');
    const customersCol = db.collection('customers');

    // ========== EXERCICE 2.1 - Opérateur de comparaison ==========
    console.log('\n📌 Exercice 2.1 - Prix entre 100 et 500 MAD');
    const range2_1 = await productsCol
      .find({ price: { $gte: 100, $lte: 500 } })
      .toArray();
    console.log(`✓ Produits trouvés: ${range2_1.length}`);
    range2_1.slice(0, 5).forEach(p => console.log(`  - ${p.name}: ${p.price} MAD`));

    // ========== EXERCICE 2.2 - Requête OR ==========
    console.log('\n📌 Exercice 2.2 - Clients de Casablanca OU Rabat');
    const or2_2 = await customersCol
      .find({ $or: [{ city: 'Casablanca' }, { city: 'Rabat' }] })
      .toArray();
    console.log(`✓ Clients trouvés: ${or2_2.length}`);
    or2_2.slice(0, 5).forEach(c => console.log(`  - ${c.name} (${c.city})`));

    // ========== EXERCICE 2.3 - Mise à jour avec $push ==========
    console.log('\n📌 Exercice 2.3 - Ajouter tag "promotion" (CAF-001)');
    const updated2_3 = await productsCol.updateOne(
      { sku: 'CAF-001' },
      { $addToSet: { tags: 'promotion' } }
    );
    console.log(`✓ Résultat: ${updated2_3.modifiedCount} document modifié`);

    // ========== EXERCICE 2.4 - Recherche dans les tableaux ==========
    console.log('\n📌 Exercice 2.4 - Produits avec tag "luxe"');
    const withTag2_4 = await productsCol.find({ tags: 'luxe' }).toArray();
    console.log(`✓ Produits trouvés: ${withTag2_4.length}`);
    withTag2_4.slice(0, 5).forEach(p => console.log(`  - ${p.name} (tags: ${p.tags?.join(', ')})`));

    // ========== EXERCICE 2.5 - Tri et limite ==========
    console.log('\n📌 Exercice 2.5 - Top 5 produits les plus chers');
    const expensive2_5 = await productsCol
      .find()
      .sort({ price: -1 })
      .limit(5)
      .toArray();
    console.log(`✓ Top 5 produits:`);
    expensive2_5.forEach(p => console.log(`  - ${p.name}: ${p.price} MAD`));

    // ========== EXERCICE 2.6 - Mise à jour multiple ==========
    console.log('\n📌 Exercice 2.6 - +50 points fidélité (clients Fès)');
    const updated2_6 = await customersCol.updateMany(
      { city: 'Fès' },
      { $inc: { loyaltyPoints: 50 } }
    );
    console.log(`✓ Résultat: ${updated2_6.modifiedCount} clients modifiés`);

    // ========== EXERCICE 2.7 - Requête complexe ==========
    console.log('\n📌 Exercice 2.7 - Produits (stock>0, prix<1000, Casablanca)');
    const complex2_7 = await productsCol
      .find({
        quantity: { $gt: 0 },
        price: { $lt: 1000 },
        warehouse: 'Casablanca'
      })
      .toArray();
    console.log(`✓ Produits trouvés: ${complex2_7.length}`);
    complex2_7.slice(0, 5).forEach(p => console.log(`  - ${p.name} (stock: ${p.quantity})`));

    // ========== EXERCICE 2.8 - Suppression conditionnelle ==========
    console.log('\n📌 Exercice 2.8 - Supprimer clients sans achats');
    const deleted2_8 = await customersCol.deleteMany({
      $or: [{ lastPurchase: null }, { lastPurchase: { $exists: false } }]
    });
    console.log(`✓ Résultat: ${deleted2_8.deletedCount} clients supprimés`);

    // ========== EXERCICE 2.9 - Mise à jour avec $pull ==========
    console.log('\n📌 Exercice 2.9 - Retirer tag "promotion"');
    const updated2_9 = await productsCol.updateMany(
      { tags: 'promotion' },
      { $pull: { tags: 'promotion' } }
    );
    console.log(`✓ Résultat: ${updated2_9.modifiedCount} produits modifiés`);

    // ========== EXERCICE 2.10 - Recherche avec regex ==========
    console.log('\n📌 Exercice 2.10 - Produits contenant "Marocain"');
    const regex2_10 = await productsCol
      .find({ name: { $regex: /Marocain/i } })
      .toArray();
    console.log(`✓ Produits trouvés: ${regex2_10.length}`);
    regex2_10.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

    console.log('\n✅ Tous les exercices du Niveau 2 sont terminés!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

// Exécuter les exercices
niveau2Exercises();
