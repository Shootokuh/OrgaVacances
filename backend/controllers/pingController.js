// Contrôleur Ping pour endpoint de monitoring
exports.health = (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).type('text').send('ok');
};
