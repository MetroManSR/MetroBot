const stationConnections = require('../../../../data/stationConnections.json');

module.exports = {
  getConnections: function(lineKey, stationName) {
    const normalizedLine = normalizeKey(lineKey);
    return stationConnections[normalizedLine]?.estaciones?.find(s => 
      s.nombre === stationName
    ) || { conexiones: [], bici: [] };
  },

  getConnectionEmojis: function(connections) {
    return [
      ...(connections.conexiones || []).map(c => metroConfig.connectionEmojis[c]),
      ...(connections.bici || []).map(b => metroConfig.connectionEmojis[b])
    ].filter(e => e).join(' ');
  }
};