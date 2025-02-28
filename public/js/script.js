document.addEventListener('DOMContentLoaded', function() {
    // Gestion du formulaire
    document.getElementById('demo-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const formObject = {};
      
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      console.log('Données envoyées:', formObject);
      
      fetch('/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Réponse du serveur:', data);
        if (data.success) {
          alert('Merci pour votre demande ! Notre équipe vous contactera sous 24h.');
          document.getElementById('demo-form').reset();
        } else {
          alert('Une erreur est survenue : ' + data.message);
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'envoi du formulaire.');
      });
    });
    
    // Navigation fluide
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    for (const link of scrollLinks) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    }
  });