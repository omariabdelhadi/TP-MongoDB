# Réponses - MongoDB CRUD - Exercices Progressifs

Base de données: `shop_maroc`
Collections: `products`, `customers`, `orders`

> Remarque: Les commandes ci-dessous sont pour le shell `mongosh` (MongoDB Shell). Ajustez selon votre environnement (driver Node.js, Python, etc.).

---

## NIVEAU 1 - DÉBUTANT

### Exercice 1.1 - Première insertion
Insérer un produit:

```js
use shop_maroc;
db.products.insertOne({
  sku: "LMP-001",
  name: "Lampe artisanale en cuivre",
  category: "Décoration",
  price: 450,
  stock: 20,
  warehouse: "Marrakech"
});
```

### Exercice 1.2 - Recherche simple
Trouver tous les produits de la catégorie "Alimentation":

```js
db.products.find({ category: "Alimentation" }).pretty();
```

### Exercice 1.3 - Recherche avec limite
Afficher les 3 premiers clients:

```js
db.customers.find().limit(3).pretty();
```

### Exercice 1.4 - Mise à jour simple
Augmenter le prix du produit avec SKU "THE-005" de 10 MAD:

```js
db.products.updateOne({ sku: "THE-005" }, { $inc: { price: 10 } });
```

### Exercice 1.5 - Suppression simple
Supprimer le produit avec SKU "LMP-001":

```js
db.products.deleteOne({ sku: "LMP-001" });
```

### Exercice 1.6 - Recherche par ID
Trouver le client avec `customerId` "CLT-10003":

```js
db.customers.findOne({ customerId: "CLT-10003" });
```

### Exercice 1.7 - Insertion multiple
Ajouter deux nouveaux clients:

```js
db.customers.insertMany([
  { customerId: "CLT-SAMIR", name: "Samir Hakimi", city: "Tanger" },
  { customerId: "CLT-LEILA", name: "Leila Mansouri", city: "Agadir" }
]);
```

### Exercice 1.8 - Comptage
Nombre de produits dans la catégorie "Vêtements":

```js
db.products.countDocuments({ category: "Vêtements" });
```

### Exercice 1.9 - Mise à jour de champ imbriqué
Changer la ville du client "CLT-10002" pour "Rabat":

```js
db.customers.updateOne({ customerId: "CLT-10002" }, { $set: { city: "Rabat" } });
```

(Si `address.city` existe comme sous-document: `{ $set: { "address.city": "Rabat" }}`)

### Exercice 1.10 - Projection simple
Afficher uniquement le nom et le prix de tous les produits:

```js
db.products.find({}, { _id: 0, name: 1, price: 1 }).pretty();
```

---

## NIVEAU 2 - INTERMÉDIAIRE

### Exercice 2.1 - Requête avec opérateur de comparaison
Produits dont le prix est entre 100 et 500 MAD:

```js
db.products.find({ price: { $gte: 100, $lte: 500 } }).pretty();
```

### Exercice 2.2 - Requête OR
Clients de Casablanca OU Rabat:

```js
db.customers.find({ $or: [ { city: "Casablanca" }, { city: "Rabat" } ] }).pretty();
```

### Exercice 2.3 - Mise à jour avec $push
Ajouter le tag "promotion" au produit "CAF-001":

```js
db.products.updateOne({ sku: "CAF-001" }, { $addToSet: { tags: "promotion" } });
```

(Usage de `$addToSet` pour éviter les duplications)

### Exercice 2.4 - Recherche dans les tableaux
Produits qui ont le tag "luxe":

```js
db.products.find({ tags: "luxe" }).pretty();
```

ou explicitement

```js
db.products.find({ tags: { $in: ["luxe"] } }).pretty();
```

### Exercice 2.5 - Tri et limite
Afficher les 5 produits les plus chers:

```js
db.products.find().sort({ price: -1 }).limit(5).pretty();
```

### Exercice 2.6 - Mise à jour multiple
Ajouter 50 points de fidélité à tous les clients de Fès:

```js
db.customers.updateMany({ city: "Fès" }, { $inc: { loyaltyPoints: 50 } });
```

(si le champ n'existe pas, `$inc` le crée avec la valeur)

### Exercice 2.7 - Requête complexe
Trouver tous les produits en stock (quantity > 0), prix < 1000, dans l'entrepôt de Casablanca:

```js
db.products.find({ quantity: { $gt: 0 }, price: { $lt: 1000 }, warehouse: "Casablanca" }).pretty();
```

### Exercice 2.8 - Suppression conditionnelle
Supprimer tous les clients qui n'ont jamais fait d'achat (`lastPurchase: null`):

```js
db.customers.deleteMany({ lastPurchase: null });
```

(si le champ est absent, utiliser `{ $or: [ { lastPurchase: null }, { lastPurchase: { $exists: false } } ] }`)

### Exercice 2.9 - Mise à jour avec $pull
Retirer le tag "promotion" de tous les produits qui l'ont:

```js
db.products.updateMany({ tags: "promotion" }, { $pull: { tags: "promotion" } });
```

### Exercice 2.10 - Recherche avec regex
Produits dont le nom contient "Marocain" (insensible à la casse):

```js
db.products.find({ name: { $regex: /Marocain/i } }).pretty();
```

---

## NIVEAU 3 - AVANCÉ

### Exercice 3.1 - Gestion de stock complexe
Transaction multi-documents (exemple Node.js / pseudocode avec `mongodb` driver):

Pseudocode / outline:

```js
// Node.js (mongdb driver)
// async function reserveStock(client, sku, qty) {
//   const session = client.startSession();
//   try {
//     await session.withTransaction(async () => {
//       const products = client.db('shop_maroc').collection('products');
//       const p = await products.findOne({ sku }, { session });
//       if (!p || p.quantity < qty) throw new Error('Stock insuffisant');
//       await products.updateOne({ sku }, { $inc: { quantity: -qty } }, { session });
//       if (p.quantity - qty < 5) {
//         await client.db('shop_maroc').collection('alerts').insertOne({ sku, type: 'low_stock', qty: p.quantity - qty, date: new Date() }, { session });
//       }
//     });
//   } finally { await session.endSession(); }
// }
```

Explication:
- Vérifier `quantity >= 2` avant décrément.
- Décrémenter via `$inc: { quantity: -2 }` dans une transaction.
- Si stock < 5 après décrément, créer document d'alerte.

### Exercice 3.2 - Analyse des meilleures ventes
Trouver les 3 produits les plus présents dans les commandes, avec nombre total d'unités vendues (aggregation):

```js
db.orders.aggregate([
  { $unwind: "$items" },
  { $group: { _id: "$items.sku", totalUnits: { $sum: "$items.quantity" } } },
  { $sort: { totalUnits: -1 } },
  { $limit: 3 },
  { $lookup: { from: "products", localField: "_id", foreignField: "sku", as: "product" } },
  { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
  { $project: { sku: "$_id", totalUnits: 1, name: "$product.name" } }
]);
```

### Exercice 3.3 - Migration de données
Ajouter champ `disponibility` selon stock:

```js
db.products.updateMany({}, [
  { $set: {
      disponibility: {
        $switch: {
          branches: [
            { case: { $gt: ["$quantity", 10] }, then: "in_stock" },
            { case: { $and: [ { $gte: ["$quantity", 1] }, { $lte: ["$quantity", 10] } ] }, then: "low_stock" }
          ],
          default: "out_of_stock"
        }
      }
  } }
]);
```

(Approche pipeline update pour calculer sans script externe)

### Exercice 3.4 - Système de recommandation
Logique (pseudocode):

- Récupérer catégories des achats du client (depuis `orders` par `customerId`).
- Exclure SKUs déjà achetés.
- Trouver produits des mêmes catégories avec `rating > 4.5`.
- Retourner les 3 mieux notés / les plus vendus.

Aggregation possible (esquisse):

```js
// 1) categories achetées
const categories = db.orders.aggregate([
  { $match: { customerId: "CLT-..." } },
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.sku", foreignField: "sku", as: "prod" } },
  { $unwind: "$prod" },
  { $group: { _id: "$prod.category" } }
]).toArray();

// 2) products recommandés
db.products.find({ category: { $in: categories.map(c=>c._id) }, rating: { $gt: 4.5 }, sku: { $nin: alreadyBoughtSkus } }).sort({ rating: -1 }).limit(3);
```

### Exercice 3.5 - Calcul de fidélité avancé
Fonction pour recalculer points:

Pseudo-implémentation (Node.js / aggregation):

Steps:
- Récupérer commandes du client, somme dépenses totales.
- Calcul: floor(totalSpent / 10).
- Bonus +50 si ordersCount >=3.
- Bonus +100 si account older than 1 year (comparer `createdAt`).
- Double points pour achats dans catégorie "Luxe": calculer portion dépensée en "Luxe" => doubler ces points.

Exemple d'aggregation pour totals:

```js
db.orders.aggregate([
  { $match: { customerId: "CLT-10001" } },
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.sku", foreignField: "sku", as: "prod" } },
  { $unwind: "$prod" },
  { $group: {
      _id: null,
      totalSpent: { $sum: { $multiply: ["$items.quantity", "$prod.price"] } },
      ordersCount: { $addToSet: "$orderId" },
      luxurySpent: { $sum: { $cond: [ { $eq: ["$prod.category", "Luxe"] }, { $multiply: ["$items.quantity", "$prod.price"] }, 0 ] } }
  }},
  { $project: { totalSpent:1, ordersCount: { $size: "$ordersCount" }, luxurySpent:1 } }
]);
```

Puis calcul final en code: points = floor(totalSpent/10) + (ordersCount>=3?50:0) + (accountOlderThan1y?100:0) + floor(luxurySpent/10) (double effect already included by adding luxury portion doubled if design requires).

### Exercice 3.6 - Rapport de performance
Rapport multi-critères (aggregation sketches):

- Top 3 villes par nombre de clients:

```js
db.customers.aggregate([
  { $group: { _id: "$city", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 3 }
]);
```

- Catégorie de produits la plus rentable (revenu total):

```js
db.orders.aggregate([
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.sku", foreignField: "sku", as: "p" } },
  { $unwind: "$p" },
  { $group: { _id: "$p.category", revenue: { $sum: { $multiply: ["$items.quantity", "$p.price"] } } } },
  { $sort: { revenue: -1 } },
  { $limit: 1 }
]);
```

- Taux de conversion (clients avec commandes / total clients):

```js
const totalClients = db.customers.countDocuments();
const clientsWithOrders = db.orders.distinct("customerId").length; // in shell use toArray().length
// taux = clientsWithOrders / totalClients
```

### Exercice 3.7 - Détection d'anomalies
Fonction pour détecter anomalies (exemples de requêtes):

- Produits avec prix négatif ou zéro:

```js
db.products.find({ price: { $lte: 0 } }).pretty();
```

- Commandes sans articles:

```js
db.orders.find({ $or: [ { items: { $exists: false } }, { items: { $size: 0 } } ] }).pretty();
```

- Clients avec email invalide (simple regex):

```js
db.customers.find({ email: { $not: { $regex: /.+@.+\..+/ } } }).pretty();
```

- Stock négatif:

```js
db.products.find({ quantity: { $lt: 0 } }).pretty();
```

### Exercice 3.8 - Synchronisation inventaire
Approche:

- Charger fichier externe (CSV/JSON) dans script (Node/Python).
- Pour chaque ligne sku,newQty: calculer diff = |newQty - oldQty| / oldQty.
- Si diff > 0.5 -> insérer alerte (`alerts` collection).
- Mettre à jour `products` via `updateOne`.

Pseudocode Node.js:

```js
for each record in file:
  const p = await products.findOne({ sku: record.sku });
  if (!p) continue;
  const diffPercent = Math.abs(record.qty - p.quantity) / (p.quantity || 1);
  if (diffPercent > 0.5) await db.alerts.insertOne({ sku: record.sku, old: p.quantity, new: record.qty, diff: diffPercent, date: new Date() });
  await products.updateOne({ sku: record.sku }, { $set: { quantity: record.qty } });
```

### Exercice 3.9 - Archivage des anciennes commandes
Archiver puis supprimer commandes > 6 mois:

```js
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

// Copier dans orders_archive
const oldOrders = db.orders.find({ orderDate: { $lt: sixMonthsAgo } }).toArray();
if (oldOrders.length) db.orders_archive.insertMany(oldOrders);
// Supprimer de la collection principale
db.orders.deleteMany({ orderDate: { $lt: sixMonthsAgo } });
```

(Alternativement, utiliser aggregation `$out` si souhaité remplacer complètement)

### Exercice 3.10 - Dashboard temps réel
Fonction générique (sketch):

KPIs en temps réel (exemples de requêtes):

- Ventes du jour:

```js
const today = new Date();
const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
db.orders.aggregate([
  { $match: { orderDate: { $gte: start } } },
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.sku", foreignField: "sku", as: "p" } },
  { $unwind: "$p" },
  { $group: { _id: null, sales: { $sum: { $multiply: ["$items.quantity", "$p.price"] } }, ordersCount: { $sum: 1 } } }
]);
```

- Stock critique (products where quantity <= threshold):

```js
db.products.find({ quantity: { $lte: 5 } }).pretty();
```

- Nouveaux clients (aujourd'hui):

```js
db.customers.countDocuments({ createdAt: { $gte: start } });
```

- Top 5 produits du jour (par unités vendues):

```js
db.orders.aggregate([
  { $match: { orderDate: { $gte: start } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.sku", unitsSold: { $sum: "$items.quantity" } } },
  { $sort: { unitsSold: -1 } },
  { $limit: 5 },
  { $lookup: { from: "products", localField: "_id", foreignField: "sku", as: "product" } },
  { $unwind: "$product" },
  { $project: { sku: "$_id", name: "$product.name", unitsSold: 1 } }
]);
```

- Alertes actives: lecture de `alerts` collection:

```js
db.alerts.find({ active: true }).pretty();
```

- Prévisions de rupture: calculer vitesse de vente / stock actuel -> estimer jours restants (script externe réalisable).

---

## Fichiers & commandes fournis
- Ce fichier: `EXERCICES_MongoDB_ANSWERS.md` (déposé à la racine du dépôt)

---

Si vous voulez que je transforme certains exemples en scripts exécutables (Node.js ou Python), je peux les ajouter et les inclure dans le dépôt (avec `package.json` ou `requirements.txt`).

