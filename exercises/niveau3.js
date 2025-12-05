/**
 * MongoDB CRUD - Niveau 3 : AVANCÉ
 * 10 exercices complexes avec transactions, agrégations et logique métier
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'shop_maroc';

async function niveau3Exercises() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db(DB_NAME);
    const productsCol = db.collection('products');
    const customersCol = db.collection('customers');
    const ordersCol = db.collection('orders');
    const alertsCol = db.collection('alerts');

    // ========== EXERCICE 3.1 - Gestion de stock complexe ==========
    console.log('\n📌 Exercice 3.1 - Gestion de stock (transaction)');
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const product = await productsCol.findOne({ sku: 'TAJ-004' }, { session });
        if (!product) {
          console.log('ℹ Produit TAJ-004 non trouvé');
          return;
        }
        if (product.quantity < 2) {
          console.log(`❌ Stock insuffisant: ${product.quantity} < 2`);
          return;
        }
        await productsCol.updateOne(
          { sku: 'TAJ-004' },
          { $inc: { quantity: -2 } },
          { session }
        );
        const updated = await productsCol.findOne({ sku: 'TAJ-004' }, { session });
        if (updated.quantity < 5) {
          await alertsCol.insertOne(
            {
              sku: 'TAJ-004',
              type: 'low_stock',
              quantity: updated.quantity,
              date: new Date()
            },
            { session }
          );
          console.log(`✓ Alerte créée: stock bas (${updated.quantity})`);
        } else {
          console.log(`✓ Stock décrémenté: ${product.quantity} -> ${updated.quantity}`);
        }
      });
    } finally {
      await session.endSession();
    }

    // ========== EXERCICE 3.2 - Analyse des meilleures ventes ==========
    console.log('\n📌 Exercice 3.2 - Top 3 produits les plus vendus');
    const topProducts3_2 = await ordersCol
      .aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sku',
            totalUnits: { $sum: '$items.quantity' }
          }
        },
        { $sort: { totalUnits: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'sku',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            sku: '$_id',
            name: '$product.name',
            totalUnits: 1,
            _id: 0
          }
        }
      ])
      .toArray();
    console.log(`✓ Top 3 produits:`);
    topProducts3_2.forEach(p => console.log(`  - ${p.name || p.sku}: ${p.totalUnits} unités`));

    // ========== EXERCICE 3.3 - Migration de données ==========
    console.log('\n📌 Exercice 3.3 - Ajouter champ "disponibility"');
    const migrated3_3 = await productsCol.updateMany(
      {},
      [
        {
          $set: {
            disponibility: {
              $switch: {
                branches: [
                  { case: { $gt: ['$quantity', 10] }, then: 'in_stock' },
                  {
                    case: {
                      $and: [
                        { $gte: ['$quantity', 1] },
                        { $lte: ['$quantity', 10] }
                      ]
                    },
                    then: 'low_stock'
                  }
                ],
                default: 'out_of_stock'
              }
            }
          }
        }
      ]
    );
    console.log(`✓ Résultat: ${migrated3_3.modifiedCount} produits modifiés`);

    // ========== EXERCICE 3.4 - Système de recommandation ==========
    console.log('\n📌 Exercice 3.4 - Recommandations produits');
    const customerId = 'CLT-10001';
    const customerOrders = await ordersCol
      .find({ customerId })
      .toArray();
    const purchasedSkus = [];
    const categories = new Set();

    for (const order of customerOrders) {
      for (const item of order.items || []) {
        purchasedSkus.push(item.sku);
      }
    }

    const purchasedProducts = await productsCol
      .find({ sku: { $in: purchasedSkus } })
      .toArray();
    purchasedProducts.forEach(p => categories.add(p.category));

    const recommended = await productsCol
      .find({
        category: { $in: Array.from(categories) },
        rating: { $gt: 4.5 },
        sku: { $nin: purchasedSkus }
      })
      .sort({ rating: -1 })
      .limit(3)
      .toArray();
    console.log(`✓ Produits recommandés pour ${customerId}:`);
    recommended.forEach(p => console.log(`  - ${p.name} (rating: ${p.rating})`));

    // ========== EXERCICE 3.5 - Calcul de fidélité avancé ==========
    console.log('\n📌 Exercice 3.5 - Calcul points fidélité');
    const loyaltyCustomer = 'CLT-10001';
    const loyaltyData = await ordersCol
      .aggregate([
        { $match: { customerId: loyaltyCustomer } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.sku',
            foreignField: 'sku',
            as: 'prod'
          }
        },
        { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: { $multiply: ['$items.quantity', '$prod.price'] } },
            luxurySpent: {
              $sum: {
                $cond: [
                  { $eq: ['$prod.category', 'Luxe'] },
                  { $multiply: ['$items.quantity', '$prod.price'] },
                  0
                ]
              }
            },
            ordersCount: { $sum: 1 }
          }
        }
      ])
      .toArray();

    if (loyaltyData.length > 0) {
      const { totalSpent, luxurySpent, ordersCount } = loyaltyData[0];
      let points = Math.floor(totalSpent / 10);
      if (ordersCount >= 3) points += 50;
      const luxuryPoints = Math.floor(luxurySpent / 10);
      points += luxuryPoints; // double effet pour luxe
      console.log(`✓ Points de fidélité: ${points}`);
      console.log(`  - Base (1 pt/10 MAD): ${Math.floor(totalSpent / 10)}`);
      console.log(`  - Bonus commandes: ${ordersCount >= 3 ? 50 : 0}`);
      console.log(`  - Bonus Luxe: ${luxuryPoints}`);
    }

    // ========== EXERCICE 3.6 - Rapport de performance ==========
    console.log('\n📌 Exercice 3.6 - Rapport de performance');

    // Top 3 villes
    const topCities = await customersCol
      .aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ])
      .toArray();
    console.log(`✓ Top 3 villes:`);
    topCities.forEach(c => console.log(`  - ${c._id}: ${c.count} clients`));

    // Catégorie la plus rentable
    const topCategory = await ordersCol
      .aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.sku',
            foreignField: 'sku',
            as: 'p'
          }
        },
        { $unwind: '$p' },
        {
          $group: {
            _id: '$p.category',
            revenue: { $sum: { $multiply: ['$items.quantity', '$p.price'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 1 }
      ])
      .toArray();
    if (topCategory.length > 0) {
      console.log(`✓ Catégorie la plus rentable: ${topCategory[0]._id} (${topCategory[0].revenue} MAD)`);
    }

    // Taux de conversion
    const totalClients = await customersCol.countDocuments();
    const clientsWithOrders = (await ordersCol.distinct('customerId')).length;
    const conversionRate = totalClients > 0 ? ((clientsWithOrders / totalClients) * 100).toFixed(2) : 0;
    console.log(`✓ Taux de conversion: ${conversionRate}% (${clientsWithOrders}/${totalClients} clients)`);

    // ========== EXERCICE 3.7 - Détection d'anomalies ==========
    console.log('\n📌 Exercice 3.7 - Détection d\'anomalies');

    const negativePrices = await productsCol.countDocuments({ price: { $lte: 0 } });
    console.log(`✓ Produits avec prix ≤ 0: ${negativePrices}`);

    const emptyOrders = await ordersCol.countDocuments({
      $or: [{ items: { $exists: false } }, { items: { $size: 0 } }]
    });
    console.log(`✓ Commandes sans articles: ${emptyOrders}`);

    const invalidEmails = await customersCol.countDocuments({
      email: { $not: { $regex: /.+@.+\..+/ } }
    });
    console.log(`✓ Clients avec email invalide: ${invalidEmails}`);

    const negativeStock = await productsCol.countDocuments({ quantity: { $lt: 0 } });
    console.log(`✓ Produits avec stock négatif: ${negativeStock}`);

    // ========== EXERCICE 3.8 - Synchronisation inventaire ==========
    console.log('\n📌 Exercice 3.8 - Synchronisation inventaire');
    // Exemple: fichier externe simulé
    const externalInventory = [
      { sku: 'SKU-001', qty: 150 },
      { sku: 'SKU-002', qty: 20 }
    ];
    let alertsCreated = 0;
    for (const record of externalInventory) {
      const p = await productsCol.findOne({ sku: record.sku });
      if (!p) continue;
      const diffPercent = Math.abs(record.qty - p.quantity) / (p.quantity || 1);
      if (diffPercent > 0.5) {
        await alertsCol.insertOne({
          sku: record.sku,
          old: p.quantity,
          new: record.qty,
          diffPercent: (diffPercent * 100).toFixed(2),
          date: new Date()
        });
        alertsCreated++;
      }
      await productsCol.updateOne({ sku: record.sku }, { $set: { quantity: record.qty } });
    }
    console.log(`✓ Synchronisation terminée (${alertsCreated} alertes créées)`);

    // ========== EXERCICE 3.9 - Archivage des anciennes commandes ==========
    console.log('\n📌 Exercice 3.9 - Archivage commandes anciennes');
    const archivesCol = db.collection('orders_archive');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const oldOrders = await ordersCol.find({ orderDate: { $lt: sixMonthsAgo } }).toArray();
    if (oldOrders.length > 0) {
      await archivesCol.insertMany(oldOrders);
      await ordersCol.deleteMany({ orderDate: { $lt: sixMonthsAgo } });
      console.log(`✓ ${oldOrders.length} commandes archivées et supprimées`);
    } else {
      console.log('ℹ Aucune commande à archiver');
    }

    // ========== EXERCICE 3.10 - Dashboard temps réel ==========
    console.log('\n📌 Exercice 3.10 - Dashboard temps réel');
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Ventes du jour
    const salesData = await ordersCol
      .aggregate([
        { $match: { orderDate: { $gte: startOfDay } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.sku',
            foreignField: 'sku',
            as: 'p'
          }
        },
        { $unwind: '$p' },
        {
          $group: {
            _id: null,
            sales: { $sum: { $multiply: ['$items.quantity', '$p.price'] } },
            ordersCount: { $sum: 1 }
          }
        }
      ])
      .toArray();

    if (salesData.length > 0) {
      console.log(`✓ KPIs du jour:`);
      console.log(`  - Ventes: ${salesData[0].sales.toFixed(2)} MAD`);
      console.log(`  - Commandes: ${salesData[0].ordersCount}`);
    }

    // Stock critique
    const criticalStock = await productsCol.countDocuments({ quantity: { $lte: 5 } });
    console.log(`  - Stock critique (≤5): ${criticalStock} produits`);

    // Nouveaux clients
    const newCustomers = await customersCol.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    console.log(`  - Nouveaux clients: ${newCustomers}`);

    console.log('\n✅ Tous les exercices du Niveau 3 sont terminés!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

// Exécuter les exercices
niveau3Exercises();
