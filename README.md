# MongoDB CRUD - Exercices Progressifs 📚

Bienvenue! Ce dépôt contient **30 exercices progressifs** (Niveaux 1, 2, 3) pour maîtriser les opérations CRUD dans MongoDB.

## 📋 Contenu

- **EXERCICES_MongoDB_ANSWERS.md** : Réponses détaillées et commandes MongoDB Shell pour tous les exercices
- **exercises/niveau1.js** : Scripts Node.js exécutables pour les 10 exercices du Niveau 1 (Débutant)
- **exercises/niveau2.js** : Scripts Node.js exécutables pour les 10 exercices du Niveau 2 (Intermédiaire)
- **exercises/niveau3.js** : Scripts Node.js exécutables pour les 10 exercices du Niveau 3 (Avancé)
- **demo.js** : Script de test de connexion à MongoDB

## 🎯 Structure des exercices

### 🟢 Niveau 1 - DÉBUTANT (10 exercices)
Opérations simples : insertion, recherche, limite, mise à jour, suppression, projection.

Exemples :
- 1.1 Première insertion
- 1.2 Recherche simple
- 1.3 Recherche avec limite
- ... (voir EXERCICES_MongoDB_ANSWERS.md)

### 🟡 Niveau 2 - INTERMÉDIAIRE (10 exercices)
Requêtes avancées : opérateurs de comparaison, $or, $push, tri, regex, updateMany.

Exemples :
- 2.1 Requête avec comparaison (prix entre 100-500 MAD)
- 2.2 Requête OR (Casablanca OU Rabat)
- 2.5 Tri et limite (Top 5 produits les plus chers)
- ... (voir EXERCICES_MongoDB_ANSWERS.md)

### 🔴 Niveau 3 - AVANCÉ (10 exercices)
Cas pratiques complets : transactions, agrégations, recommandations, rapports, détection d'anomalies.

Exemples :
- 3.1 Gestion de stock complexe (transaction)
- 3.2 Analyse des meilleures ventes
- 3.5 Calcul de fidélité avancé
- 3.10 Dashboard temps réel
- ... (voir EXERCICES_MongoDB_ANSWERS.md)

## 🗄️ Base de données utilisée

- **Nom** : `shop_maroc`
- **Collections** :
  - `products` : Catalogue de produits (SKU, nom, catégorie, prix, stock, etc.)
  - `customers` : Clients (ID, nom, ville, points de fidélité, etc.)
  - `orders` : Commandes (commandes + articles liés)
  - `alerts` : Alertes (stock bas, anomalies, etc.)
  - `orders_archive` : Archive des anciennes commandes

## 🚀 Installation et Configuration

### Prérequis

- **Node.js** v14+ et **npm**
- **MongoDB** en cours d'exécution (local ou cloud)
  - MongoDB local : `mongodb://localhost:27017`
  - MongoDB Atlas (cloud) : `mongodb+srv://user:pass@cluster.mongodb.net/shop_maroc`

### Étapes d'installation

1. **Clonez le dépôt**
   ```bash
   git clone https://github.com/omariabdelhadi/TP-MongoDB.git
   cd TP-MongoDB
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configurez la connexion MongoDB** (optionnel)
   ```bash
   # Option 1 : Utiliser une variable d'environnement
   export MONGODB_URI=mongodb://localhost:27017
   # Ou sur Windows PowerShell:
   $env:MONGODB_URI="mongodb://localhost:27017"
   
   # Option 2 : Modifier directement le code (voir sections MONGO_URI dans les fichiers)
   ```

4. **Testez la connexion**
   ```bash
   npm run demo
   ```

## 📖 Comment utiliser

### Exécuter les scripts Node.js

```bash
# Démonstration (test de connexion)
npm run demo

# Niveau 1 - Exercices débutant
npm run level1

# Niveau 2 - Exercices intermédiaire
npm run level2

# Niveau 3 - Exercices avancé
npm run level3

# Lancer tous les niveaux
npm start
```

### Consulter les réponses MongoDB Shell

Ouvrez le fichier **EXERCICES_MongoDB_ANSWERS.md** pour voir :
- Les commandes MongoDB Shell (`mongosh`)
- Les explications détaillées
- Les résultats attendus

Exemple (dans MongoDB Shell ou Compass) :

```javascript
use shop_maroc;

// Exercice 1.2 - Recherche simple
db.products.find({ category: "Alimentation" }).pretty();

// Exercice 2.5 - Top 5 produits les plus chers
db.products.find().sort({ price: -1 }).limit(5).pretty();

// Exercice 3.2 - Analyse des meilleures ventes
db.orders.aggregate([...]).toArray();
```

## 📝 Notes importantes

### Pour les scripts Node.js

- Les scripts utilisent le **MongoDB Node.js Driver** (v6+)
- Chaque script se connecte automatiquement à MongoDB et se déconnecte à la fin
- Les opérations sont affichées en console avec des emojis pour la lisibilité
- Les erreurs sont capturées et affichées

### Pour les requêtes MongoDB Shell

- Utilisez **mongosh** (nouveau shell MongoDB recommandé)
- Ou **mongo** (ancien shell, déprecié mais encore fonctionnel)
- MongoDB Compass (interface graphique) est une alternative visuelle

### Adaptation pour Python / Other Languages

Si vous préférez Python ou un autre langage :

```python
# Python (pymongo)
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client['shop_maroc']
products = db['products']
products.insert_one({ "sku": "LMP-001", "name": "Lampe", "price": 450 })
```

## 🛠️ Dépannage

### Problème : "Impossible de se connecter à MongoDB"

```bash
# Vérifier que MongoDB s'exécute
# Sur Windows
net start MongoDB

# Sur macOS
brew services start mongodb-community

# Sur Linux
sudo systemctl start mongod

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Problème : "Erreur d'authentification"

- Vérifiez les identifiants MongoDB
- Mettez à jour la variable d'environnement `MONGODB_URI`
- Pour MongoDB Atlas, assurez-vous que l'IP est whitelistée

### Problème : "Collection/Base de données non trouvée"

- Les collections MongoDB sont créées automatiquement lors de la première insertion
- Assurez-vous que les données d'exemple sont insérées avant de lancer les exercices

## 📚 Ressources supplémentaires

- [Documentation MongoDB](https://docs.mongodb.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [MongoDB Shell (mongosh)](https://www.mongodb.com/docs/mongosh/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

## 👨‍💻 Auteur

Exercices créés pour le cours **MongoDB CRUD - Niveaux Progressifs**

---

**Bon apprentissage! 🎓** Si vous avez des questions, consultez les fichiers de réponses ou la documentation officielle MongoDB.
