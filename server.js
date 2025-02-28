// Importation des modules nécessaires
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
require('dotenv').config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Remplace bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Remplace bodyParser.urlencoded

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connexion MongoDB établie avec succès');
  console.log('Base de données active:', mongoose.connection.name);
})
.catch((err) => {
  console.error('❌ Erreur de connexion MongoDB:', err);
});

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route unique pour la soumission du formulaire
app.post('/submit-form', async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    const { name, email, company, position, 'team-size': teamSize, message } = req.body;
    
    // Validation
    if (!name || !email || !company || !position) {
      console.log('Validation échouée:', { name, email, company, position });
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez remplir tous les champs obligatoires' 
      });
    }
    
    // Création et sauvegarde du contact
    const newContact = new Contact({
      name,
      email,
      company,
      position,
      teamSize,
      message
    });

    console.log('Tentative de sauvegarde du contact:', newContact);
    const savedContact = await newContact.save();
    console.log('Contact sauvegardé:', savedContact);
    
    // Configuration et envoi de l'email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.DESTINATION_EMAIL,
      subject: 'Nouvelle demande de démo SalesSync',
      html: `
        <h2>Nouvelle demande de démo</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Entreprise:</strong> ${company}</p>
        <p><strong>Poste:</strong> ${position}</p>
        <p><strong>Taille de l'équipe commerciale:</strong> ${teamSize}</p>
        <p><strong>Message:</strong> ${message || 'Aucun message'}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Votre demande a été enregistrée et envoyée avec succès!',
      contact: savedContact
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors du traitement de votre demande',
      error: error.message
    });
  }
});

// Route pour récupérer les contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    console.log('Contacts trouvés:', contacts.length);
    res.json({
      success: true,
      count: contacts.length,
      contacts: contacts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des contacts',
      error: error.message
    });
  }
});

// Route de test pour la connexion MongoDB
app.get('/test-db', async (req, res) => {
  try {
    const testContact = new Contact({
      name: 'Test User',
      email: 'test@test.com',
      company: 'Test Company',
      position: 'Test Position',
      teamSize: '1-10',
      message: 'Test message'
    });

    const savedContact = await testContact.save();
    res.json({
      success: true,
      message: 'Test réussi',
      contact: savedContact,
      dbConnection: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test échoué',
      error: error.message
    });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});